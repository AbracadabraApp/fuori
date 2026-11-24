/**
 * Learn 2.0's cards (docs/learn-sheet-2-design.md, docs/learn-sheet-2-plan.md): one card on the sheet
 * after a visit. Every kind has this one shape, so the app draws them all with one view and a new kind
 * is new data, not new screen work. `kind` is a free string: the ten drawn kinds are models
 * (content/<country>/prompts/learn-card-models.md), not a list the code knows.
 *
 * The bank, content/<country>/learn-cards.json, is cut from the game's content by
 * scripts/learn-cards.mts. Cards made from a visit come later (plan, build step 2).
 *
 * Server-side only.
 */

export const CARD_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'] as const;
export type CardLevel = (typeof CARD_LEVELS)[number];

export interface LearnCardRow {
  /** A line in the learned language */
  text: string;
  /** Its English, shown under it */
  en: string;
}

/** Where a card came from: for building and checking, never sent to the app (Josh, 2026-11-23) */
export interface LearnCardSource {
  /** lesson, idioms, culture, city, here, visit… */
  from: string;
  /** The exact place: "it/lessons.json#meeting-people-2/examples[0,1]", "conversation:<id>#turns[5,7]" */
  ref: string;
  /** True when the wording isn't the source's own */
  redrafted: boolean;
  /** What wrote it: "learn-cards.mts@<prompt version>" */
  by: string;
}

export interface LearnCard {
  /** Stable: the same source gives the same id on every run */
  id: string;
  kind: string;
  /** English: "When you order", "A small word" */
  headline: string;
  /** A word in the learned language that finishes the headline ("A small word: allora"), carried
   *  apart so the app can tag its language */
  term?: string;
  rows: LearnCardRow[];
  /** One plain English line or two: a fact, a saying's meaning */
  note?: string;
  level: CardLevel;
  /** What it's about: "lesson:a1-03-2", "unit:a1-03", "city:palermo", "place:palermo/ballaro", "idiom:<text>" */
  keys: string[];
  source: LearnCardSource;
}

export interface LearnCardBank {
  version: string;
  /** The cutting prompt's and the models' versions the cards were made with */
  prompt: string;
  models: string;
  cards: LearnCard[];
}

/** The longest a card gets: five rows (Vocabulary: things), a note of two short sentences */
export const MAX_ROWS = 5;
export const MAX_NOTE = 360;
/** Word limits (Josh, 2026-11-23: "you may need word limits"): the models' notes run up to about 30 words (three sentences, rule 8) */
export const MAX_NOTE_WORDS = 40;
export const MAX_LINE_WORDS = 12;
const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

/**
 * What's wrong with a card by the rules code can see (the design's Rules), or [] when nothing is.
 * Blanks are a gap of underscores or dots standing in for a word; the rest (one topic, plain, spoken
 * order) is for the models and Josh's eye.
 */
export function cardProblems(card: LearnCard): string[] {
  const problems: string[] = [];
  const blank = /_{2,}|\.{3,}|…/;
  if (!card.id.trim()) problems.push('no id');
  if (!card.kind.trim()) problems.push('no kind');
  if (!card.headline.trim()) problems.push('no headline');
  if (!CARD_LEVELS.includes(card.level)) problems.push(`level ${card.level}`);
  if (!card.rows.length && !card.note?.trim()) problems.push('nothing on it');
  if (card.rows.length > MAX_ROWS) problems.push(`${card.rows.length} rows`);
  card.rows.forEach((r, i) => {
    if (!r.text.trim()) problems.push(`row ${i}: no text`);
    if (!r.en.trim()) problems.push(`row ${i}: no English`);
    if (blank.test(r.text)) problems.push(`row ${i}: a blank`);
    if (words(r.text) > MAX_LINE_WORDS) problems.push(`row ${i}: ${words(r.text)} words`);
    if (words(r.en) > MAX_LINE_WORDS) problems.push(`row ${i}: English ${words(r.en)} words`);
  });
  if (card.note && card.note.length > MAX_NOTE) problems.push(`note is ${card.note.length} characters`);
  if (card.note && words(card.note) > MAX_NOTE_WORDS) problems.push(`note is ${words(card.note)} words`);
  if (!card.source.ref.trim()) problems.push('no source');
  return problems;
}
