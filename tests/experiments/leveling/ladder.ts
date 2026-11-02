// The ladder for the leveling prototype (docs/research/leveling/05-designs.md →
// Shared pieces): one stored value per learner, a step from the first Beginner
// stage to Intermediate. Data only; the prompt text lives in
// content/<country>/prompts/leveling.md (talk and support blocks) and
// levels.md (the Intermediate B1 blocks). Nothing here is language-specific.
//
// Josh's staged fading plan (docs/06-roadmap.md → Beginner level dialogue,
// 2026-10-25): "a stage per conversation: 1,1,1,1,1 · 1,2,1,1,2 · 2,2,2,3,3,
// then on to Intermediate". Each group of five is a step here, and the step
// plays its pattern in turn (the k-th conversation at a step uses
// pattern[k % 5]): stretch, then consolidate. Where a step moves is up to the
// design (A, B or C); the count alone would take 15 conversations, the
// "count as default" of the plan.

export type StageId = 1 | 2 | 3 | 'B1';

export interface Supports {
  /** The English said right after each phrase or question (lib/beginner.ts gloss): all, only for new words, or none */
  echo: 'all' | 'new' | 'off';
  /** Answers to say back: two, one, a frame (sentence start with …), none */
  answers: 2 | 1 | 'frame' | 0;
  /** Phrases in the language shown as bubbles (the learner can read them) */
  bubbles: boolean;
}

export interface Stage {
  id: StageId;
  /** Which prompt: beginner.md in parts, or character.md with a levels.md block */
  path: 'beginner' | 'character';
  /** beginner path: the talk block in leveling.md; character path: the levels.md block */
  talk: string;
  /** character path: the levels.md block used when a support comes back on */
  talkSupportBack?: string;
  supports: Supports;
  /**
   * The level.md listener (1–4) who must know 90%+ of a line's words for the
   * line to count as followable at this stage (lib/level.ts uses 2 for "a
   * beginner"; 1 is "arrived a few weeks ago", 3 "lived here about a year")
   */
  listener: 1 | 2 | 3;
  /** How hard the talk is on a 0–1 ability scale (0 = knows a few words, 1 = early B1): the simulated learner struggles more when this is above them */
  demand: number;
}

export const STAGES: Record<string, Stage> = {
  '1': { id: 1, path: 'beginner', talk: 'Talk: stage 1', supports: { echo: 'all', answers: 2, bubbles: true }, listener: 1, demand: 0.05 },
  // One support fades: two answers become one
  '2': { id: 2, path: 'beginner', talk: 'Talk: stage 2', supports: { echo: 'all', answers: 1, bubbles: true }, listener: 1, demand: 0.3 },
  // The echo fades to new words only; the answer becomes a frame to finish
  '3': { id: 3, path: 'beginner', talk: 'Talk: stage 3', supports: { echo: 'new', answers: 'frame', bubbles: true }, listener: 2, demand: 0.55 },
  // Intermediate: the plain character prompt with the B1 block, no Beginner supports (subtitles only)
  B1: { id: 'B1', path: 'character', talk: 'Intermediate: B1', talkSupportBack: 'Intermediate: B1, support back', supports: { echo: 'off', answers: 0, bubbles: false }, listener: 3, demand: 0.8 },
};

export interface Step {
  /** 1-based: the stored value */
  n: number;
  label: string;
  /** Stage per conversation at this step, in turn */
  pattern: StageId[];
}

export const LADDER: Step[] = [
  { n: 1, label: 'Beginner 1 (1,1,1,1,1)', pattern: [1, 1, 1, 1, 1] },
  { n: 2, label: 'Beginner 2 (1,2,1,1,2)', pattern: [1, 2, 1, 1, 2] },
  { n: 3, label: 'Beginner 3 (2,2,2,3,3)', pattern: [2, 2, 2, 3, 3] },
  { n: 4, label: 'Intermediate (B1)', pattern: ['B1'] },
];
export const TOP = LADDER.length;

/** The supports one stage below, for "a support comes back on" (the step and its talk stay) */
export function supportsBack(stage: Stage): Supports {
  if (stage.id === 1 || stage.id === 'B1') return stage.supports; // stage 1 has them all ("Talk: support back" still slows her down); B1 uses its own block
  return STAGES[String(Number(stage.id) - 1)].supports;
}

/** The rules every design shares (05-designs.md), as numbers to tune */
export const RULES = {
  /** A conversation counts toward moving up with this many turns in the learner's own words (04 §2) */
  countedOwnWords: 3,
  /** Step up when this many of the last `window` counted conversations at this step were easy */
  easyNeeded: 4,
  window: 5,
  /** Supports back on after this many hard conversations in a row; off again after this many not hard */
  hardInARow: 2,
  /** "Easy": counted, mostly own words, lost at most once; a couple of one-word help asks are fine */
  easy: { maxLost: 1, maxWordHelps: 2, minOwnShare: 0.5 },
  /** "Hard": lost on this share of turns (English instead of an answer, the whole line again, silence). Saying back an offered answer isn't struggling, and neither is asking what one word means (2026-11-02: the first run marked 26 of 48 hard, mostly for one-word help) */
  hard: { minLostShare: 0.4 },
  /** Design B and C: the speaking judge reads this many conversations together, the latest and the ones before it (one conversation rarely had enough of the learner's own words: 2026-11-02, "not enough to tell" every time) */
  speakingPool: 5,
  /** … and at the end of the pool needs this many lines in their own words to rate at all */
  speakingMinOwn: 5,
  /** Design B and C: the speaking judge must say at least this … */
  speakingReady: 'A2' as const,
  /** … on this many of the last `speakingWindow` conversations it could rate, for the step into Intermediate */
  speakingNeeded: 4,
  speakingWindow: 5,
};

export const CEFR = ['pre-A1', 'A1', 'A2', 'B1'] as const;
export type Cefr = (typeof CEFR)[number];
export type SpeakingVerdict = Cefr | 'not enough to tell';
