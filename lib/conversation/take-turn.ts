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
import { runBeginnerTurn, beginnerPromptVersion, lineFromParts, type Part } from '@/lib/beginner';
import { assemblePieces } from '@/lib/dialogue/pieces';
import { BEGINNER_2_FILE, CLUSTER_1, pickSetup, levelText, setupLine, shapeParts, turnSteps, beginner2Version, type Setup, type TurnSteps, flowingLine, frameBrief, onFrame, lineWithAnswers } from '@/lib/beginner-2';
import { pickShapes, noteOf, shapeIds, beatsBrief } from '@/lib/shapes';
import { runIntro } from '@/lib/intro';
import { storedCluster } from '@/lib/level-up';
import { stageFor, stageTag, stageText, type Stage } from '@/lib/path';
import { pathState } from '@/lib/conversation-record';
import { welcomeContent, welcomed, welcomeVersion, welcomeStep, welcomeBrief, learnerLines, addressAnswers, welcomeTurnFlags } from '@/lib/welcome';
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
  /**
   * A reply written ahead (an offered answer's reply, /v1/turn): don't save
   * yet. The result carries `commit`, which saves the exchange when the
   * learner says that answer, with what they actually said; never called for
   * an answer they didn't say. Needs saveAfterReply.
   */
  deferSave?: boolean;
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
  /** Which Beginner plays (lib/beginner-2.ts → beginnerVersionFrom): the new one unless 1, the old one, is asked for */
  beginnerVersion?: 1 | 2;
  /** Beginner 2's cluster of the reply ladder from the app's header (lib/beginner-2.ts → clusterHeaderFrom); the learner's stored step otherwise (lib/level-up.ts) */
  beginnerCluster?: Setup[];
}

export interface TakeTurnResult {
  reply: TurnOutput;
  promptVersion: string;
  /** The recorded conversation's id; null when not recorded */
  conversationId: string | null;
  memory?: CharacterMemory;
  isTutor: boolean;
  /** Only for a deferred save: saves the exchange (once), with the learner's own words when given, and what they waited for the reply (replyMs) when given */
  commit?: (learnerSaid?: string, replyMs?: number) => void;
}

export async function takeTurn(p: TakeTurnParams): Promise<TakeTurnResult> {
  const { learnerId, character, transcript, learnerSaid, conversationId } = p;
  const started = performance.now(); // the reply's server time, kept for the scorecard

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
  // The new Beginner (the cut-over, Josh 2026-11-12) for every Beginner, whatever stage the old path had reached:
  // its steps replace the stages. The old Beginner only when the app asks for it (x-fuori-beginner: 1)
  const newBeginner = p.beginnerVersion !== 1;
  const beginner = !welcome && onPath !== null && (newBeginner || onPath.stage.path === 'beginner');
  // Beginner 2's cluster: the app's header (Josh's Cluster stepper), else the learner's stored step (level up)
  let cluster = p.beginnerCluster ?? CLUSTER_1;
  if (!p.beginnerCluster && beginner && newBeginner && learnerId) {
    try {
      cluster = await storedCluster(learnerId);
    } catch (err) {
      p.onSoftError('learner step', err);
    }
  }
  // The intro's beats (lib/intro.ts): given to the character once on every later turn (shapes.ts → beatsBrief)
  const beats = transcript.find((t) => t.who === 'npc' && t.beats?.length)?.beats;
  const npcTurns = transcript.filter((t) => t.who === 'npc').length;
  // Beginner 2's reply setup this turn (docs/beginner-2.md), when the app switched it on
  const setup = beginner && !p.lesson && newBeginner
    ? pickSetup({ conversationId, turn: npcTurns, learnerId, characterId: character.id, learnerSaid }, cluster)
    : null;
  // Beginner 2: what the code did to the turn's parts, logged and saved with it; any path: the shape asked for
  let steps: TurnSteps | undefined;
  const pathLevel = !welcome && !newBeginner && onPath?.stage.path === 'character' ? onPath.stage.level : undefined;
  // An ordinary visit at Intermediate (no path) or Beginner 2: the intro opens it, and a shape is picked per turn
  // (lib/shapes.ts; docs/dialogue-structure-reference.md § 11). Beginner 1, the welcome, lessons and Magda: untouched
  const shaped = !isTutor && !p.lesson && !welcome && (setup !== null || onPath === null);
  // The intro is cut (Josh, 2026-11-13: "I'd cut the intro as it is now and just start as before in the charracters
  // conversation"; docs/bugs.md B23): a visit opens on the character's first ordinary turn. lib/intro.ts stays for now
  const intro = false;
  // After the intro, no note unless they asked something: then it's answered first (lib/shapes.ts)
  const shapes = shaped && !intro ? pickShapes({ learnerSaid }) : [];
  const shape = shapes.length ? shapes : null;
  const shapeId = shapeIds(shapes);
  // The intro's beats, once, in the system prompt of every later turn: material the character has, not a list to work through
  const beatsText = shaped && !intro ? beatsBrief(beats) : '';
  const withBeats = (brief: string) => [brief, beatsText].filter(Boolean).join('\n\n');

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
        // The step is counted, not left to her (lib/welcome.ts): the opening ends on the two buttons
        const step = welcomeStep(learnerLines(transcript, learnerSaid).length);
        const r = await runBeginnerTurn({ character, transcript, learnerSaid, memory, addressedAs, laps: p.laps, onText: p.onText, canRetry: p.canRetry, stageText: welcomeBrief(step, !!p.micOff), withDone: step === 'answers', maxAnswers: 0 });
        const parts = step === 'opening' ? [...r.parts, ...addressAnswers()] : r.parts;
        return { ...r, parts, done: step === 'answers' && r.done === true, ...welcomeTurnFlags(step) };
      })()
    : intro
    ? // The intro (lib/intro.ts; Josh's design, 2026-11-11): the character opens with the place's custom in the language,
      // sentences with their English for the subtitles, ending on the first question; Beginner 2 gets two answers with it
      await runIntro({ character, memory, addressedAs, answers: setup !== null, laps: p.laps, onText: p.onText, canRetry: p.canRetry }).then((r) => {
        steps = { ...(setup ? turnSteps(r.parts ?? [], setup, cluster, []) : { fixes: [] }), shape: 'intro' };
        return r;
      })
    : beginner && onPath && setup && onFrame(cluster)
    ? // Beginner 2, cluster 1 (2026-11-10s): the English frame on the Intermediate reply, one flowing line with the
      // level block as the brief, the path that made the list Josh judged (docs/summary-and-mixed.md → Frame mix). Not the
      // parts format: there the character pulls the language out of the sentence into its own box (10q–10r). The two
      // answers to say back come with the line (2026-11-11a: the setup line on the newest message, the answers in the
      // reply) and go to the app as answer parts; her line stays the subtitle. The voice starts early, as at Intermediate
      await runTurn({ character, transcript, learnerSaid, memory, addressedAs, brief: withBeats(frameBrief(cluster)), note: noteOf(shape, setupLine(setup)), answers: setup.maxAnswers > 0, laps: p.laps, onText: p.onText, canRetry: p.canRetry, withDone: true }).then((r) => {
        // Step 1 writes the language as {piece | English} (docs/mix.md): the line as it's said, as the voice had it
        const out = lineWithAnswers({ ...r, line: assemblePieces(r.line) }, setup, cluster);
        steps = { ...turnSteps(out.parts, setup, cluster, []), ...(shapeId ? { shape: shapeId } : {}) };
        return out;
      })
    : beginner && onPath && setup
    ? // Beginner 2, steps 4-6: the parts are rewritten after the reply (glosses, English), so the
      // spoken line is rebuilt from them, and the voice waits for the whole reply (no early first sentence:
      // it would be spoken from the parts before they were rewritten, then again)
      await runBeginnerTurn({ character, transcript, learnerSaid, memory, addressedAs, laps: p.laps, canRetry: p.canRetry, promptFile: BEGINNER_2_FILE, stageText: withBeats(levelText(cluster)), turnNote: noteOf(shape, setupLine(setup)), maxAnswers: setup.maxAnswers, withDone: true }).then((r) => {
        const { parts, fixes } = shapeParts(r.parts, setup, cluster);
        steps = { ...turnSteps(r.parts, setup, cluster, fixes), ...(shapeId ? { shape: shapeId } : {}) };
        return { ...r, ...flowingLine(parts), parts };
      })
    : beginner && onPath
    ? // Beginner 1 as it has always run in the app: without the offered answers, so no heard note (production untouched, Josh)
      await runBeginnerTurn({ character, transcript: transcript.map(({ offered: _offered, ...t }) => t), learnerSaid, memory, addressedAs, laps: p.laps, onText: p.onText, canRetry: p.canRetry, stageText: stageText(onPath.stage, character.role), maxAnswers: onPath.stage.answers, withDone: true })
    : await runTurn({
    character,
    transcript,
    learnerSaid,
    memory,
    addressedAs,
    system: tutorPrompt?.system,
    firstTurn: tutorPrompt?.firstTurn,
    level: pathLevel ?? level,
    // Intermediate: this turn's shape, when a signal fired (lib/shapes.ts); nothing otherwise. The intro's beats once, as the brief
    note: noteOf(shape),
    ...(beatsText && !pathLevel && !tutorPrompt ? { brief: beatsText } : {}),
    laps: p.laps,
    onText: p.onText,
    canRetry: p.canRetry,
    // Their goodbye, said back, ends it (docs/beginner-scaffolding.md 11b)
    withDone: true,
  });
  if (shapeId && !steps) steps = { fixes: [], shape: shapeId };
  p.laps?.lap('claude');
  const replyMs = Math.round(performance.now() - started);

  // One line per turn so any reply can be traced to the prompt version that produced it
  const version = lessonBriefed && p.lesson
    ? lessonVersion(p.lesson.part, p.lesson.stepId)
    : tutorPrompt
    ? `magda-${tutorPrompt.version}`
    : welcome
    ? welcomeVersion()
    : setup
    ? beginner2Version(cluster)
    : `${beginner ? beginnerPromptVersion() : promptVersion(pathLevel ?? level)}${onPath ? stageTag(onPath.stage, onPath.supportBack) : ''}`;
  console.log(
    JSON.stringify({
      level: 'info',
      event: 'turn',
      id: p.requestId,
      character: character.id,
      turn: transcript.length === 0 ? 'opening' : 'reply',
      promptVersion: version,
      // Beginner 2: this turn's rung of the reply ladder, its cluster, and the code's fixes to Claude's parts (lib/beginner-2.ts)
      ...(setup ? { setup: setup.id } : {}),
      ...(steps ? { cluster: steps.cluster, fixes: steps.fixes } : {}),
      ...(steps?.shape ? { shape: steps.shape } : {}),
    })
  );

  // Save the exchange so conversations can be reviewed later. Never blocks the
  // reply: recording problems are reported and the conversation carries on.
  let savedId: string | null = null;
  let commit: ((said?: string) => void) | undefined;
  if (learnerId) {
    const save = (said = learnerSaid, ms = replyMs) =>
      recordTurn({
        learnerId,
        conversationId: conversationId ?? null,
        character,
        cityId: p.cityId,
        promptVersion: version,
        learnerSaid: transcript.length ? said : undefined,
        reply,
        replyMs: ms,
        memory,
        steps,
      }).catch((err) => {
        p.onSoftError('recording', err);
        return null;
      });
    if (conversationId && p.saveAfterReply && p.deferSave) {
      let committed = false;
      commit = (said?: string, ms?: number) => {
        if (committed) return;
        committed = true;
        void saveLater(conversationId, () => save(said ?? learnerSaid, ms ?? replyMs));
      };
      savedId = conversationId;
    } else if (conversationId && p.saveAfterReply) {
      // Readers of this conversation wait for it (lib/recording.ts → saveLater)
      void saveLater(conversationId, save);
      savedId = conversationId;
    } else {
      savedId = await save();
    }
  }
  p.laps?.lap('record');

  return { reply, promptVersion: version, conversationId: savedId, memory, isTutor, ...(commit ? { commit } : {}) };
}

