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

/** Whether what they said is a question, by punctuation (any language) */
export const askedSomething = (said: string | undefined): boolean => /[?¿]/.test(said ?? '');

/** This turn's shape from what code can see, or null: no note, the character's habit */
export function pickShape(p: { learnerSaid?: string }): Shape | null {
  if (askedSomething(p.learnerSaid)) return ANSWER_FIRST;
  return null;
}

/** The shape's line, filled */
export function shapeNote(shape: Shape): string {
  return fill(readPromptFile(SHAPES_FILE).block(shape.block), { language: language.name }).trim();
}

/** The bracketed note for a turn: the shape's line (if any) and the setup line (if any), one after the other */
export function noteOf(shape: Shape | null, setupLine?: string): string | undefined {
  const lines = [shape ? shapeNote(shape) : '', setupLine ?? ''].map((s) => s.trim()).filter(Boolean);
  return lines.length ? lines.join(' ') : undefined;
}

/** The version recorded with a turn that had a shape */
export function shapesVersion(): string {
  return readPromptFile(SHAPES_FILE).version;
}
