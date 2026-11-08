/**
 * Numbers about how long and how loaded the characters' turns are, so dialogue
 * changes can be compared by measurement rather than by single examples.
 * Used by the conversation test (breadth) and on recorded conversations (depth).
 * See docs/10-testing.md → "Dialogue quality".
 *
 * These are measurements, not rules: nothing here is sent to the characters.
 */

/**
 * Yardstick from conversation research: a turn between pauses averages about
 * 1.7 s (median about 1.2 s), roughly 5–10 words in Italian
 * (Heldner & Edlund 2015; Stivers et al. 2009). A reply over LONG_TURN_WORDS is
 * several typical turns in one go.
 */
export const TYPICAL_TURN_WORDS = 10;
export const LONG_TURN_WORDS = 30;

export function wordCount(text: string): number {
  return text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
}

/** Questions asked in a reply (each "?" ending a sentence). */
export function questionCount(text: string): number {
  return (text.match(/\?+/g) ?? []).length;
}

export interface TurnStats {
  /** Words in the character's first line */
  openerWords: number;
  /** Character replies counted (including the opener) */
  replies: number;
  wordsMedian: number;
  wordsAvg: number;
  wordsMax: number;
  /** Share of replies over LONG_TURN_WORDS (0–1) */
  longShare: number;
  questionsAvg: number;
  /** Share of replies asking more than one question (0–1): several threads at once */
  multiQuestionShare: number;
}

const round1 = (n: number) => Math.round(n * 10) / 10;
const round2 = (n: number) => Math.round(n * 100) / 100;

export function median(xs: number[]): number {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/** Stats for one conversation's character lines, in order (opener first). */
export function turnStats(characterLines: string[]): TurnStats {
  const words = characterLines.map(wordCount);
  const qs = characterLines.map(questionCount);
  const n = characterLines.length || 1;
  return {
    openerWords: words[0] ?? 0,
    replies: characterLines.length,
    wordsMedian: median(words),
    wordsAvg: round1(words.reduce((a, b) => a + b, 0) / n),
    wordsMax: words.length ? Math.max(...words) : 0,
    longShare: round2(words.filter((w) => w > LONG_TURN_WORDS).length / n),
    questionsAvg: round1(qs.reduce((a, b) => a + b, 0) / n),
    multiQuestionShare: round2(qs.filter((q) => q > 1).length / n),
  };
}

/** Combine several conversations' stats into one summary (medians of medians, pooled shares). */
export function summarize(all: TurnStats[]): TurnStats {
  if (!all.length) return turnStats([]);
  const total = all.reduce((a, s) => a + s.replies, 0) || 1;
  const pooled = (k: 'longShare' | 'multiQuestionShare' | 'wordsAvg' | 'questionsAvg') =>
    all.reduce((a, s) => a + s[k] * s.replies, 0) / total;
  return {
    openerWords: median(all.map((s) => s.openerWords)),
    replies: total,
    wordsMedian: median(all.map((s) => s.wordsMedian)),
    wordsAvg: round1(pooled('wordsAvg')),
    wordsMax: Math.max(...all.map((s) => s.wordsMax)),
    longShare: round2(pooled('longShare')),
    questionsAvg: round1(pooled('questionsAvg')),
    multiQuestionShare: round2(pooled('multiQuestionShare')),
  };
}

/**
 * How much room the learner gets (Josh, 2026-11-08: one set of measures for
 * real play and the conversation test): the learner's share of all words, and
 * how many words they say at a time.
 */
export function learnerStats(turns: { who: 'npc' | 'learner'; text: string }[]): { share: number; wordsPerLine: number } {
  const mine = turns.filter((t) => t.who === 'learner');
  const learnerWords = mine.reduce((n, t) => n + wordCount(t.text), 0);
  const npcWords = turns.filter((t) => t.who === 'npc').reduce((n, t) => n + wordCount(t.text), 0);
  return { share: round2(learnerWords / (learnerWords + npcWords || 1)), wordsPerLine: round1(learnerWords / (mine.length || 1)) };
}

/** Earlier conversations with the same character looked back over for repeats */
export const REPEATS_LOOKBACK = 3;
/** Share of the shorter sentence's words found in the other at which it reads as said again */
export const SAME_SENTENCE = 0.7;

/** Sentences of eight or more words: shorter ones are the routine a real shopkeeper repeats every day
 *  ("Que le vaya muy bien", "Suba a la silla"; counted as repeats in the 2026-11-08 pilot at five words) */
export const REPEAT_MIN_WORDS = 8;
function longSentences(text: string): string[] {
  return text.split(/(?<=[.!?…])\s+/).map((s) => s.trim()).filter((s) => wordCount(s) >= REPEAT_MIN_WORDS);
}
const wordSet = (s: string) => new Set(s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').match(/[\p{L}\p{N}]+/gu) ?? []);
/** Share of the shorter sentence's words that are in the other: a shorter retelling of a story still counts */
export function sentenceOverlap(a: string, b: string): number {
  const x = wordSet(a), y = wordSet(b);
  const shared = [...x].filter((w) => y.has(w)).length;
  return shared / (Math.min(x.size, y.size) || 1);
}

/**
 * The groundhog-day count (Josh, 2026-11-07: "groundhog day conversations feel
 * broken"): the character's sentences in this conversation that closely match
 * one he said in an earlier conversation with the same learner. Word overlap,
 * so it works in any language; coming back to a topic in new words isn't
 * counted, and neither is the same story fully reworded (Grok's read-through
 * in the conversation test is there for those).
 */
export function repeatsFromEarlier(earlierCharacterLines: string[], characterLines: string[]): { said: string; earlier: string }[] {
  const earlier = earlierCharacterLines.flatMap(longSentences);
  const out: { said: string; earlier: string }[] = [];
  for (const s of characterLines.flatMap(longSentences)) {
    const match = earlier.find((e) => sentenceOverlap(s, e) >= SAME_SENTENCE);
    if (match) out.push({ said: s, earlier: match });
  }
  return out;
}
