/**
 * One conversation turn, shared by /api/turn (web, cookie) and /v1/turn (app,
 * bearer token): load what the character remembers, run Magda's or the
 * character prompt, log the prompt version, and record the exchange (after
 * the reply goes out, when the caller allows it: saveAfterReply).
 * Framework-neutral: takes a learner id, not a request.
 */

import { runTurn } from '@/lib/turn';
import { promptVersion } from '@/lib/prompts/build-turn-prompt';
import { buildTutorPrompt, repliesSoFar } from '@/lib/prompts/build-tutor-prompt';
import { recordTurn, saveLater } from '@/lib/recording';
import { trialLevel } from '@/lib/conversation/level-trial';
import { loadCharacterMemory, loadMemoryAtStart, type CharacterMemory } from '@/lib/memory';
import { studyFileReady } from '@/lib/study-file';
import { loadAddressedAs } from '@/lib/learner-address';
import { tutor } from '@/content';
import { onboardingState } from '@/lib/onboarding';
import { runBeginnerTurn, beginnerPromptVersion } from '@/lib/beginner';
import { stageFor, stageTag, stageText, type Stage } from '@/lib/path';
import { pathState } from '@/lib/conversation-record';
import { welcomeContent, welcomed, welcomeTurnBrief, welcomeVersion } from '@/lib/welcome';
import { lessonBrief, lessonVersion, type LessonTurn } from '@/lib/lesson';
import type { Gender } from '@/lib/types';
import type { CharacterSheet, Turn, TurnOutput } from '@/lib/types';
import type { Laps } from '@/lib/timing';

export interface TakeTurnParams {
  /** null when there's no database (local runs): no memory, nothing recorded */
  learnerId: string | null;
  character: CharacterSheet;
  cityId: string;
  transcript: Turn[];
  learnerSaid?: string;
  conversationId?: string;
  /** Request id for log lines (x-fuori-id) */
  requestId?: string;
  /** Problems that mustn't block the reply (memory, recording) are reported here */
  onSoftError: (where: string, err: unknown) => void;
  /** Times each step: memory, claude, record */
  laps?: Laps;
  /**
   * Save a reply's exchange after the reply goes out, not before (saving took
   * up to 0.8 s). Only when the caller has already loaded conversationId as
   * this learner's (/v1/turn), since a bad id would start a new conversation
   * whose id the reply couldn't carry. Openings always save first: the reply
   * needs the new id.
   */
  saveAfterReply?: boolean;
  /** The reply written so far, on every streamed chunk (runTurn's onText) */
  onText?: (snapshot: string) => void;
  /** False once part of the reply was sent on (its first sentence): a stall then fails instead of retrying */
  canRetry?: () => boolean;
  /** The app can't use the mic (refused): in the welcome, she says once where to turn it on */
  micOff?: boolean;
  /** The app opened this conversation as the welcome (lib/welcome.ts); older apps never do, so a visit to her stays a visit */
  welcome?: boolean;
  /** A lesson's turn (lib/lesson.ts): Magda teaching or reviewing, or a practice dialogue */
  lesson?: LessonTurn;
}

export interface TakeTurnResult {
  reply: TurnOutput;
  promptVersion: string;
  /** The recorded conversation's id; null when not recorded */
  conversationId: string | null;
  memory?: CharacterMemory;
  isTutor: boolean;
}

export async function takeTurn(p: TakeTurnParams): Promise<TakeTurnResult> {
  const { learnerId, character, transcript, learnerSaid, conversationId } = p;

  // What this character remembers about them (fills the prompt's
  // {relationship} line). Never blocks the reply: without it the character
  // just hasn't met them. Mid-conversation: what they remembered when it started.
  let memory: CharacterMemory | undefined;
  let addressedAs: Gender | undefined;
  if (learnerId) {
    try {
      // Magda: a study file still being rewritten after the last conversation is waited for
      if (character.id === tutor.id && !conversationId) await studyFileReady(learnerId);
      memory =
        (conversationId ? await loadMemoryAtStart(conversationId, learnerId) : null) ??
        (await loadCharacterMemory(learnerId, character.id));
    } catch (err) {
      p.onSoftError('memory load', err);
    }
    // Whether they're a woman or a man, which every character can see
    try {
      addressedAs = await loadAddressedAs(learnerId);
    } catch (err) {
      p.onSoftError('learner address', err);
    }
  }
  p.laps?.lap('memory');

  // Magda teaches with her own prompt: her memory is the study file, and she
  // gets one fact for pacing, how many replies the learner has made this lesson
  const isTutor = character.id === tutor.id;
  const tutorPrompt = isTutor
    ? buildTutorPrompt({ character, memory, replies: repliesSoFar(transcript, learnerSaid) })
    : undefined;

  // A level block for learners in the trial (off unless LEVEL_TRIAL is set); never Magda
  const level = tutorPrompt ? undefined : trialLevel(learnerId);

  // Beginner level dialogue (lib/beginner.ts; Josh, 2026-10-25): a Beginner,
  // or a learner with no level yet, is on the path (lib/path.ts; Josh,
  // 2026-11-02): the stage sets the parts reply's settings, or from step 4
  // the character prompt with a Beginner block; never Magda
  let onPath: { stage: Stage; supportBack: boolean } | null = null;
  if (learnerId && !isTutor) {
    try {
      const { level: learnerLevel } = await onboardingState(learnerId);
      if (learnerLevel === 'beginner' || learnerLevel === null) onPath = stageFor(await pathState(learnerId));
    } catch (err) {
      p.onSoftError('learner level', err);
    }
  }
  // The welcome (lib/welcome.ts): its character, for a learner who hasn't finished it, plays it in the Beginner format
  let welcome = false;
  if (p.welcome && learnerId && !isTutor && character.id === welcomeContent()?.characterId) {
    try {
      welcome = !(await welcomed(learnerId));
    } catch (err) {
      p.onSoftError('welcome', err);
    }
  }
  const beginner = !welcome && onPath?.stage.path === 'beginner';
  const pathLevel = !welcome && onPath?.stage.path === 'character' ? onPath.stage.level : undefined;

  // A lesson (lib/lesson.ts): every part in the Beginner format with its brief, Magda included;
  // the Intermediate lessons in the speaking mode, the character prompt with its brief
  // A cultural lesson (part story) follows the learner's level: the Beginner format below Intermediate
  const lessonBriefed = p.lesson && learnerId ? await lessonBrief(p.lesson, learnerId, transcript, learnerSaid, undefined, p.lesson.part !== 'story' || onPath !== null) : null;

  const reply: TurnOutput = lessonBriefed?.speaking
    ? // The Intermediate lessons (Josh, 2026-11-03): the character prompt with the lesson's brief, no answers to say back
      { ...(await runTurn({ character, transcript, learnerSaid, memory, addressedAs, brief: lessonBriefed.brief, laps: p.laps, onText: p.onText, canRetry: p.canRetry })), done: lessonBriefed.forcedDone }
    : lessonBriefed
    ? await (async () => {
        const r = await runBeginnerTurn({ character, transcript, learnerSaid, memory, addressedAs, laps: p.laps, onText: p.onText, canRetry: p.canRetry, stageText: lessonBriefed.brief, withDone: lessonBriefed.askDone });
        return { ...r, done: lessonBriefed.forcedDone || r.done === true };
      })()
    : welcome && learnerId
    ? await (async () => {
        const w = await welcomeTurnBrief({ conversationId: conversationId ?? null, learnerId, characterId: character.id, transcript, learnerSaid, micOff: !!p.micOff });
        p.laps?.lap('welcome-check');
        const r = await runBeginnerTurn({ character, transcript, learnerSaid, memory, addressedAs, laps: p.laps, onText: p.onText, canRetry: p.canRetry, stageText: w.brief, withDone: true });
        // Asking once more is never the last turn: they need the mic to answer
        return w.askedAgain ? { ...r, done: false, askedAgain: true } : r;
      })()
    : beginner && onPath
    ? await runBeginnerTurn({ character, transcript, learnerSaid, memory, addressedAs, laps: p.laps, onText: p.onText, canRetry: p.canRetry, stageText: stageText(onPath.stage, character.role), maxAnswers: onPath.stage.answers })
    : await runTurn({
    character,
    transcript,
    learnerSaid,
    memory,
    addressedAs,
    system: tutorPrompt?.system,
    firstTurn: tutorPrompt?.firstTurn,
    level: pathLevel ?? level,
    laps: p.laps,
    onText: p.onText,
    canRetry: p.canRetry,
  });
  p.laps?.lap('claude');

  // One line per turn so any reply can be traced to the prompt version that produced it
  const version = lessonBriefed && p.lesson
    ? lessonVersion(p.lesson.part, p.lesson.stepId)
    : tutorPrompt
    ? `magda-${tutorPrompt.version}`
    : welcome
    ? welcomeVersion()
    : `${beginner ? beginnerPromptVersion() : promptVersion(pathLevel ?? level)}${onPath ? stageTag(onPath.stage, onPath.supportBack) : ''}`;
  console.log(
    JSON.stringify({
      level: 'info',
      event: 'turn',
      id: p.requestId,
      character: character.id,
      turn: transcript.length === 0 ? 'opening' : 'reply',
      promptVersion: version,
    })
  );

  // Save the exchange so conversations can be reviewed later. Never blocks the
  // reply: recording problems are reported and the conversation carries on.
  let savedId: string | null = null;
  if (learnerId) {
    const save = () =>
      recordTurn({
        learnerId,
        conversationId: conversationId ?? null,
        character,
        cityId: p.cityId,
        promptVersion: version,
        learnerSaid: transcript.length ? learnerSaid : undefined,
        reply,
        memory,
      }).catch((err) => {
        p.onSoftError('recording', err);
        return null;
      });
    if (conversationId && p.saveAfterReply) {
      // Readers of this conversation wait for it (lib/recording.ts → saveLater)
      void saveLater(conversationId, save);
      savedId = conversationId;
    } else {
      savedId = await save();
    }
  }
  p.laps?.lap('record');

  return { reply, promptVersion: version, conversationId: savedId, memory, isTutor };
}
