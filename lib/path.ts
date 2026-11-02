/**
 * The leveling model, version 0 (docs/research/leveling/07-model.md; Josh,
 * 2026-11-02: "go" to replacing the Beginner level with it). A Beginner (or a
 * learner with no level yet) is on a path of steps toward Intermediate; each
 * conversation plays a stage, a set of settings measured to move how much of
 * the language they hear and how hard (dials.mts, Italy and Mexico):
 *
 *   S1  beginner.md, talk 1, two answers, the English echo on everything
 *   S2  beginner.md, about half the turn in the language, one answer
 *   S3  beginner.md, mostly the language, a frame to finish, echo on new words
 *   S4  character.md with "Beginner: still you, ask" (all in the language,
 *       easy words, the English subtitle after each line)
 *
 * Josh's fading plan sets the stages within a step (docs/06-roadmap.md →
 * Beginner level dialogue: 1,1,1,1,1 · 1,2,1,1,2 · 2,2,2,3,3); step 4 plays
 * S4; past it the learner is Intermediate (learners.level). Moving up is by
 * counts from each conversation's record (lib/conversation-record.ts): 4 easy
 * of the last 5 counted conversations at a step; after 2 hard in a row a
 * support comes back (the stage below) until 2 aren't hard; the step never
 * moves down within the path. An Intermediate learner (placed there, or
 * arrived) goes back to step 4 after 2 hard conversations in a row, leaving
 * without a word included (Josh, 2026-11-02: "make all your changes"; Sophia
 * left four Intermediate conversations without a word). The state after each
 * conversation is kept with its record.
 * Every threshold is in RULES, to tune from play.
 */
import { language } from '@/content';
import { readPromptFile, fill } from '@/lib/prompts/template';

export type StageId = 'S1' | 'S2' | 'S3' | 'S4';

export interface Stage {
  id: StageId;
  /** beginner.md in parts, or the character prompt with a levels.md block */
  path: 'beginner' | 'character';
  /** beginner path: leveling.md blocks added to beginner.md's system prompt */
  blocks: string[];
  /** beginner path: answers to say back kept (the prompt asks; this enforces it) */
  answers: number;
  /** character path: the levels.md block */
  level?: string;
}

export const STAGES: Record<StageId, Stage> = {
  S1: { id: 'S1', path: 'beginner', blocks: ['Talk: stage 1', 'Answers: two'], answers: 2 },
  S2: { id: 'S2', path: 'beginner', blocks: ['Talk: stage 2', 'Language: 2', 'Answers: one'], answers: 1 },
  S3: { id: 'S3', path: 'beginner', blocks: ['Talk: stage 3', 'Language: 4', 'Answers: frame', 'Echo: new words'], answers: 1 },
  S4: { id: 'S4', path: 'character', blocks: [], answers: 0, level: 'Beginner: still you, ask' },
};

/** The stages each step plays, in turn (the k-th conversation at a step plays pattern[k % length]) */
export const STEPS: StageId[][] = [
  ['S1', 'S1', 'S1', 'S1', 'S1'],
  ['S1', 'S2', 'S1', 'S1', 'S2'],
  ['S2', 'S2', 'S2', 'S3', 'S3'],
  ['S4'],
];
/** Past the last step: Intermediate (learners.level), the character prompt as it is */
export const INTERMEDIATE_STEP = STEPS.length + 1;

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
  /** Up when this many of the last `window` counted conversations at the step were easy */
  easyNeeded: 4,
  window: 5,
  /** A support comes back after this many hard conversations in a row, and goes again after this many not hard */
  hardInARow: 2,
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

/** The stage the next conversation plays; with a support back, the stage below (S1 gets "Talk: support back") */
export function stageFor(s: PathState): { stage: Stage; supportBack: boolean } {
  const pattern = STEPS[Math.min(s.step, STEPS.length) - 1];
  const id = pattern[s.atStep % pattern.length];
  if (!s.supportsBack) return { stage: STAGES[id], supportBack: false };
  const below: Record<StageId, StageId> = { S1: 'S1', S2: 'S1', S3: 'S2', S4: 'S3' };
  const stage = STAGES[below[id]];
  return { stage: id === 'S1' ? { ...stage, blocks: [...stage.blocks, 'Talk: support back'] } : stage, supportBack: true };
}

/** The stage's blocks as text for beginner.md's system prompt */
export function stageText(stage: Stage, role: string): string {
  const f = readPromptFile('leveling.md');
  return stage.blocks.map((b) => fill(f.block(b), { language: language.name, role })).join('\n');
}

/** For the prompt version logged with each turn: "+S2", "+S1+back" (lib/conversation-record.ts reads it back) */
export function stageTag(stage: Stage, supportBack: boolean): string {
  return `+${stage.id}${supportBack ? '+back' : ''}`;
}

export type Felt = 'easy' | 'hard' | 'neither';

/** The state after a conversation that felt `felt` (`counted`: enough of their own words to count toward moving up) */
export function decide(s: PathState, felt: Felt, counted: boolean): { next: PathState; moved: boolean } {
  const window = counted ? [...s.window, felt === 'easy'] : s.window;
  const easy = window.slice(-RULES.window).filter(Boolean).length;
  if (easy >= RULES.easyNeeded && s.step < INTERMEDIATE_STEP) return { next: startAt(s.step + 1), moved: true };
  const hardRun = felt === 'hard' ? s.hardRun + 1 : 0;
  let supportsBack = s.supportsBack;
  let notHardRun = s.supportsBack && felt !== 'hard' ? s.notHardRun + 1 : 0;
  if (!supportsBack && hardRun >= RULES.hardInARow) { supportsBack = true; notHardRun = 0; }
  else if (supportsBack && notHardRun >= RULES.hardInARow) { supportsBack = false; notHardRun = 0; }
  return { next: { step: s.step, atStep: s.atStep + 1, window, supportsBack, hardRun, notHardRun }, moved: false };
}
