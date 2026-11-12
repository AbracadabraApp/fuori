/**
 * Code picks the shape of a turn; the model writes the words (docs/dialogue-structure-reference.md § 11;
 * Josh, 2026-11-11). A shape is one line from content/<country>/prompts/shapes.md, sent in brackets at the
 * end of the learner's newest message (the `note` of lib/turn.ts and lib/beginner.ts) on the few turns a
 * signal fires. The quiet default is the design: on every other turn there is no note, and the character
 * writes the turn by habit (Nunzio's Take, one new thing, sometimes an Ask, and his Rest turns).
 *
 * Signals work in any language (CLAUDE.md): punctuation, counts, what was offered; no phrase lists.
 * Rows are added one at a time, each after Josh has played it. Beginner 1 never gets a shape.
 */
import { fill, readPromptFile } from '@/lib/prompts/template';
import { language } from '@/content';

export const SHAPES_FILE = 'shapes.md';

export interface Shape {
  id: string;
  /** The block in shapes.md */
  block: string;
}

/** They asked something: answer it first, before anything of the character's own */
export const ANSWER_FIRST: Shape = { id: 'answer-first', block: 'Shape: answer first' };
/** Every turn after the intro: stay with what the visit opened with (Josh: the intro sets the scene, the turns discuss it) */
export const THREAD: Shape = { id: 'thread', block: 'Shape: thread' };
/** The same, with the intro's next beat named (intro.md 11d) */
export const BEAT: Shape = { id: 'beat', block: 'Shape: beat' };
/** The turn after the last beat: wind down, leave room for the goodbye */
export const CLOSE: Shape = { id: 'close', block: 'Shape: close' };

/** Whether what they said is a question, by punctuation (any language) */
export const askedSomething = (said: string | undefined): boolean => /[?¿]/.test(said ?? '');

/** This turn's shapes from what code can see, in the order they're said; empty: no note, the character's habit */
export function pickShapes(p: { learnerSaid?: string; /** the visit opened with an intro and this is a later turn */ afterIntro?: boolean; /** the intro's beats, and which turn after it this is (1 = the first reply) */ beats?: string[]; turnAfterIntro?: number; /** Beginner 2: the close after the last beat, the thread after that; Intermediate keeps going by habit (Nunzio's 14 turns) */ beginner2?: boolean }): Shape[] {
  const shapes: Shape[] = [];
  const beat = beatFor(p.beats, p.turnAfterIntro);
  if (beat === 'close') { if (p.beginner2) shapes.push(CLOSE); }
  else if (beat) shapes.push(BEAT);
  else if (p.afterIntro && (p.beginner2 || !p.beats?.length)) shapes.push(THREAD);
  if (askedSomething(p.learnerSaid)) shapes.push(ANSWER_FIRST);
  return shapes;
}

/** This turn's beat from the intro's list, in order; 'close' on the turn after the last; undefined without beats or past the close */
export function beatFor(beats: string[] | undefined, turnAfterIntro: number | undefined): string | 'close' | undefined {
  if (!beats?.length || !turnAfterIntro || turnAfterIntro < 1) return undefined;
  if (turnAfterIntro <= beats.length) return beats[turnAfterIntro - 1];
  if (turnAfterIntro === beats.length + 1) return 'close';
  return undefined;
}

/** The first shape, for callers that record one; null when none */
export function pickShape(p: { learnerSaid?: string; afterIntro?: boolean }): Shape | null {
  return pickShapes(p)[0] ?? null;
}

/** The shape's line, filled; `beat` fills the beat shape's {beat} */
export function shapeNote(shape: Shape, beat?: string): string {
  return fill(readPromptFile(SHAPES_FILE).block(shape.block), { language: language.name, beat: beat ?? '' }).trim();
}

/** The bracketed note for a turn: the shapes' lines (if any) and the setup line (if any), one after the other */
export function noteOf(shape: Shape | Shape[] | null, setupLine?: string, beat?: string): string | undefined {
  const shapes = Array.isArray(shape) ? shape : shape ? [shape] : [];
  const lines = [...shapes.map((s) => shapeNote(s, beat)), setupLine ?? ''].map((s) => s.trim()).filter(Boolean);
  return lines.length ? lines.join(' ') : undefined;
}

/** The ids recorded with the turn: "thread+answer-first" */
export const shapeIds = (shapes: Shape[]): string | undefined => (shapes.length ? shapes.map((s) => s.id).join('+') : undefined);

/** The version recorded with a turn that had a shape */
export function shapesVersion(): string {
  return readPromptFile(SHAPES_FILE).version;
}
