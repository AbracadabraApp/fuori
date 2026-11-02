// Designs A, B and C (docs/research/leveling/05-designs.md) as one ladder
// controller. Pure: it reads each conversation's record (and, for B and C,
// the speaking judge's verdict) and says the next step. Design C differs from
// B only inside the conversation (the line check), so it moves like B.
//
//   A  counts only. Step up when 4 of the last 5 counted conversations at
//      this step were easy.
//   B  A, plus the speaking judge: it must agree before the step into
//      Intermediate (listening sets the talk, speaking decides moving up).
//   C  B, plus the per-line check (lib side: simulate.mts).
//
// All: a support comes back on after 2 hard conversations in a row (the step
// stays); the label never moves down; after a move the old window is dropped
// (04 §2).
import { CEFR, LADDER, RULES, STAGES, TOP, supportsBack, type Stage, type Supports, type SpeakingVerdict } from './ladder';
import { feltLike, type ConversationRecord } from './record';

export type Design = 'A' | 'B' | 'C';
export const DESIGNS: Design[] = ['A', 'B', 'C'];
/** What --design=all runs: C dropped after the first run (2026-11-02: its check regenerated 89% of lines, +4.3 s a line; even working it adds a call to every turn). Still runs with --design=C. */
export const ALL_DESIGNS: Design[] = ['A', 'B'];

export interface LadderState {
  step: number;
  /** Conversations held at this step (picks the stage from the step's pattern) */
  atStep: number;
  /** Counted conversations at this step, easy or not, oldest first */
  window: boolean[];
  /** Speaking verdicts at this step, oldest first (B, C) */
  speaking: SpeakingVerdict[];
  supportsBack: boolean;
  hardRun: number;
  notHardRun: number;
}

export function startAt(step: number): LadderState {
  return { step, atStep: 0, window: [], speaking: [], supportsBack: false, hardRun: 0, notHardRun: 0 };
}

/** What the next conversation plays: its stage and the supports that are on */
export function nextConversation(s: LadderState): { stage: Stage; supports: Supports; supportBack: boolean } {
  const pattern = LADDER[s.step - 1].pattern;
  const stage = STAGES[String(pattern[s.atStep % pattern.length])];
  return { stage, supports: s.supportsBack ? supportsBack(stage) : stage.supports, supportBack: s.supportsBack };
}

const atLeast = (v: SpeakingVerdict, min: (typeof CEFR)[number]) => v !== 'not enough to tell' && CEFR.indexOf(v) >= CEFR.indexOf(min);

export interface Decision {
  felt: ReturnType<typeof feltLike>['felt'];
  /** Which signal made it easy, hard or neither (to tune RULES from the traces) */
  feltWhy: string;
  /** Easy conversations in the last window of counted ones, e.g. "3/5" */
  easyInWindow: string;
  /** B, C, step into Intermediate: ready verdicts in the last judged ones, e.g. "2/4" */
  speakingInWindow?: string;
  moved: boolean;
  /** Why it didn't move when the counts said up (B, C) */
  heldBy?: string;
  supportBackChanged?: 'on' | 'off';
  next: LadderState;
}

export function decide(design: Design, s: LadderState, record: ConversationRecord, verdict?: SpeakingVerdict): Decision {
  const { felt, why: feltWhy } = feltLike(record);
  const window = record.counted ? [...s.window, felt === 'easy'] : s.window;
  const speaking = verdict ? [...s.speaking, verdict] : s.speaking;
  const lastCounted = window.slice(-RULES.window);
  const easy = lastCounted.filter(Boolean).length;
  const countsSayUp = easy >= RULES.easyNeeded && s.step < TOP;

  let up = countsSayUp;
  let heldBy: string | undefined;
  let speakingInWindow: string | undefined;
  if (design !== 'A' && s.step + 1 === TOP) {
    const judged = speaking.filter((v) => v !== 'not enough to tell').slice(-RULES.speakingWindow);
    const ready = judged.filter((v) => atLeast(v, RULES.speakingReady)).length;
    speakingInWindow = `${ready}/${judged.length}`;
    if (countsSayUp && ready < RULES.speakingNeeded) {
      up = false;
      heldBy = `speaking judge: ${ready} of the last ${judged.length} rated ${RULES.speakingReady}+ (needs ${RULES.speakingNeeded})`;
    }
  }

  const hardRun = felt === 'hard' ? s.hardRun + 1 : 0;
  let supportsBackOn = s.supportsBack;
  let notHardRun = s.supportsBack && felt !== 'hard' ? s.notHardRun + 1 : 0;
  let changed: Decision['supportBackChanged'];
  if (!supportsBackOn && hardRun >= RULES.hardInARow) { supportsBackOn = true; notHardRun = 0; changed = 'on'; }
  else if (supportsBackOn && notHardRun >= RULES.hardInARow) { supportsBackOn = false; notHardRun = 0; changed = 'off'; }

  const next: LadderState = up
    ? startAt(s.step + 1)
    : { step: s.step, atStep: s.atStep + 1, window, speaking, supportsBack: supportsBackOn, hardRun, notHardRun };
  if (next.step < s.step) throw new Error('the label never moves down'); // 05: never move the label down by itself
  return { felt, feltWhy, easyInWindow: `${easy}/${lastCounted.length}`, speakingInWindow, moved: up, heldBy, supportBackChanged: up ? undefined : changed, next };
}
