/**
 * What is left of the leveling model, version 0 (docs/research/leveling/07-model.md; Josh, 2026-11-02). The path of
 * stages a Beginner used to play (S1 to S4 over four steps, moved by counts from each conversation's record) went
 * with the old Beginner (Josh, 2026-11-15: switch off "the old Beginner and its Old/New switch … then the stages,
 * paths and parts format"): every Beginner plays the steps of lib/beginner-2.ts, and moving up is the learner's
 * choice (lib/level-up.ts). Kept here:
 *
 *   - placement: where onboarding places a learner (app/v1/onboarding/send-off)
 *   - RULES, Felt: how a conversation felt (easy, hard, neither), still recorded for an Intermediate learner
 *     (lib/conversation-record.ts → feltOf)
 *   - PathState, startAt, INTERMEDIATE_STEP: the shape of the state kept with each record
 *
 * The stages themselves live on only for experiments that still play the old Beginner (tests/experiments/stages.ts).
 */

/** The old path had four steps; the step after them, kept with an Intermediate learner's records */
export const INTERMEDIATE_STEP = 5;

/**
 * Where onboarding places a learner (docs/onboarding-giulia.md → What the
 * answers set; Josh, 2026-11-02): "fairly well" → Intermediate, a first guess
 * the record corrects (RULES.backFromIntermediate); "not yet" → the path, at
 * step 3 when they answered in their own words rather than saying back an
 * offered answer (they're past saying back), else step 1.
 */
export function placement(p: { speaks: boolean; ownWords: boolean }): { level: 'beginner' | 'intermediate'; startStep: number } {
  if (p.speaks) return { level: 'intermediate', startStep: INTERMEDIATE_STEP };
  return { level: 'beginner', startStep: p.ownWords ? 3 : 1 };
}

/** The rules, as numbers to tune from play */
export const RULES = {
  /** An Intermediate learner goes back to the path's last step after this many hard conversations in a row (leaving without a word counts as hard) */
  backFromIntermediate: 2,
  /** A conversation counts toward moving up with this many turns in the learner's own words */
  countedOwnTurns: 3,
  /** Easy: counted, mostly own words, lost at most once; a couple of one-word help asks are learning */
  easy: { maxLost: 1, maxWordHelps: 2, minOwnShare: 0.5 },
  /** Hard: lost (English instead of an answer, asking for the whole line again) on this share of their turns */
  hard: { minLostShare: 0.4 },
};

export interface PathState {
  step: number;
  /** Conversations played at this step (picks the stage from its pattern) */
  atStep: number;
  /** Counted conversations at this step, easy or not, oldest first */
  window: boolean[];
  supportsBack: boolean;
  hardRun: number;
  notHardRun: number;
}

export function startAt(step: number): PathState {
  return { step, atStep: 0, window: [], supportsBack: false, hardRun: 0, notHardRun: 0 };
}

export type Felt = 'easy' | 'hard' | 'neither';
