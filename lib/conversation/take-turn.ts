/**
 * One conversation turn, shared by /api/turn (web, cookie) and /v1/turn (app,
 * bearer token): load what the character remembers, run Magda's or the
 * character prompt, log the prompt version, and record the exchange.
 * Framework-neutral: takes a learner id, not a request.
 */

import { runTurn } from '@/lib/turn';
import { promptVersion } from '@/lib/prompts/build-turn-prompt';
import { buildTutorPrompt, repliesSoFar } from '@/lib/prompts/build-tutor-prompt';
import { recordTurn } from '@/lib/recording';
import { trialLevel } from '@/lib/conversation/level-trial';
import { loadCharacterMemory, loadMemoryAtStart, type CharacterMemory } from '@/lib/memory';
import { tutor } from '@/content';
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
  if (learnerId) {
    try {
      memory =
        (conversationId ? await loadMemoryAtStart(conversationId, learnerId) : null) ??
        (await loadCharacterMemory(learnerId, character.id));
    } catch (err) {
      p.onSoftError('memory load', err);
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

  const reply = await runTurn({
    character,
    transcript,
    learnerSaid,
    memory,
    system: tutorPrompt?.system,
    firstTurn: tutorPrompt?.firstTurn,
    level,
    laps: p.laps,
  });
  p.laps?.lap('claude');

  // One line per turn so any reply can be traced to the prompt version that produced it
  const version = tutorPrompt ? `magda-${tutorPrompt.version}` : promptVersion(level);
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
    try {
      savedId = await recordTurn({
        learnerId,
        conversationId: conversationId ?? null,
        character,
        cityId: p.cityId,
        promptVersion: version,
        learnerSaid: transcript.length ? learnerSaid : undefined,
        reply,
        memory,
      });
    } catch (err) {
      p.onSoftError('recording', err);
    }
  }
  p.laps?.lap('record');

  return { reply, promptVersion: version, conversationId: savedId, memory, isTutor };
}
