/**
 * The conversation test's numbers are real play's scorecard numbers (Josh,
 * 2026-11-08: one set of measures, the scorecard as the only definition). Each
 * visit is scored the way a real conversation is when it ends (lib/quality.ts:
 * turnStats, learnerStats, repeatsFromEarlier with the visits before it), and
 * a set of visits adds up with the scorecard's own measures (lib/scorecard.ts),
 * so a test number and a real-play number mean the same thing.
 *
 * Only the counted measures are used here; the judged ones (alive, coherence,
 * corrections) stay in real play and the replay test. The culture count is the
 * test's own, one reader's list (cultureCount), not on the scorecard.
 */
import { turnStats, learnerStats, repeatsFromEarlier, REPEATS_LOOKBACK } from '@/lib/dialogue-stats';
import { MEASURES, formatValue } from '@/lib/scorecard';
import type { ConversationScore } from '@/lib/quality';
import { anthropic, CLAUDE_MODEL, replyText } from '@/lib/claude';
import { language } from '@/content';

export type Line = { who: 'npc' | 'learner'; text: string };
/** One conversation is one or more visits, each a list of lines in order */
export type Visits = Line[][];

/** The scorecard rows the test fills: counted, not judged */
export const KEYS = ['replyWords', 'openerWords', 'multiQuestion', 'learnerShare', 'learnerWords', 'repeats'] as const;
export type Key = (typeof KEYS)[number];
export type Extra = 'culture' | 'vocabOwn' | 'vocabLine';
const EXTRA_LABEL: Record<Extra, string> = { culture: 'Culture (one reader)', vocabOwn: 'Place words, her own', vocabLine: 'Place words, from the line' };
export const label = (k: Key | Extra) => (k in EXTRA_LABEL ? EXTRA_LABEL[k as Extra] : MEASURES.find((m) => m.key === k)!.label);
export const show = (k: Key | Extra, v: number | null | undefined) => (v === null || v === undefined ? '–' : k in EXTRA_LABEL ? String(Math.round(v * 10) / 10) : formatValue(k as Key, v));

/** The counted part of a real conversation's score, for one visit */
export type VisitScore = Pick<ConversationScore, 'stats' | 'learner' | 'repeats'>;

export function scoreVisits(visits: Visits): VisitScore[] {
  return visits.map((v, k) => {
    const npc = v.filter((l) => l.who === 'npc').map((l) => l.text);
    // As in real play: his lines from the visits before this one, the last few
    const earlier = visits.slice(Math.max(0, k - REPEATS_LOOKBACK), k).flat().filter((l) => l.who === 'npc').map((l) => l.text);
    return { stats: turnStats(npc), learner: learnerStats(v), ...(k ? { repeats: repeatsFromEarlier(earlier, npc) } : {}) };
  });
}

/** The scorecard's value for each counted row, over any set of visit scores */
export function values(scores: VisitScore[]): Record<Key, number | null> {
  const s = scores as ConversationScore[];
  return Object.fromEntries(KEYS.map((k) => [k, MEASURES.find((m) => m.key === k)!.value(s)])) as Record<Key, number | null>;
}

const LIST = { type: 'object', properties: { taught: { type: 'array', items: { type: 'string' } } }, required: ['taught'], additionalProperties: false };
/** One reader (Claude) lists each real thing about the country a newcomer learns from the character's lines */
export async function cultureCount(visits: Visits, who: string): Promise<string[]> {
  const text = visits.map((v, i) => `Visit ${i + 1}:\n${v.map((l) => `${l.who === 'npc' ? who : 'Learner'}: ${l.text}`).join('\n')}`).join('\n\n');
  const r = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 3000,
    messages: [{ role: 'user', content: `Conversations with ${who}.\n\n${text}\n\nList each real thing about ${language.card.country} (its people, customs, food, places, words) a newcomer learns from ${who}'s lines, each once, short, in English. Reply with JSON: taught.` }],
    output_config: { format: { type: 'json_schema', schema: LIST } },
  } as Parameters<typeof anthropic.messages.create>[0]);
  return (JSON.parse(replyText(r as Parameters<typeof replyText>[0])) as { taught: string[] }).taught;
}

// ---------- Place vocabulary (C12, docs/prompt-trials.md) ----------

export type VocabWord = { word: string; source: 'line' | 'own'; said: string };
const VOCAB = {
  type: 'object',
  properties: { words: { type: 'array', items: { type: 'object', properties: { word: { type: 'string' }, source: { type: 'string', enum: ['line', 'own'] }, said: { type: 'string' } }, required: ['word', 'source', 'said'], additionalProperties: false } } },
  required: ['words'], additionalProperties: false,
};

/**
 * One reader (Claude) lists the words a newcomer learns from the character that are specific to this place, trade or
 * country, and tags each `line` (it is, or is an inflection of, a word in the here line the character was given) or
 * `own` (the character brought it). Judgment, flagged on the card; the tags are sampled by hand.
 */
export async function vocabCount(visits: Visits, who: string, hereLine: string): Promise<VocabWord[]> {
  const text = visits.map((v, i) => `Visit ${i + 1}:\n${v.map((l) => `${l.who === 'npc' ? who : 'Learner'}: ${l.text}`).join('\n')}`).join('\n\n');
  const r = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 4000,
    messages: [{ role: 'user', content: `The game told ${who} this about themselves (the "here line"):\n${hereLine}\n\nConversations with ${who}.\n\n${text}\n\nList the ${language.name} words ${who} says that a newcomer learns and that are specific to this place, trade or ${language.card.country}: names of foods, things, crafts and customs, and uncommon words for them. Leave out proper names (people, places, brands) and words any beginner already has (greetings, numbers, colours, everyday verbs). Each word once, in the form said. For each word give source: "line" if the word is in the here line or is another form of a word in it, otherwise "own"; and said: the sentence ${who} said it in. Reply with JSON: words.` }],
    output_config: { format: { type: 'json_schema', schema: VOCAB } },
  } as Parameters<typeof anthropic.messages.create>[0]);
  return (JSON.parse(replyText(r as Parameters<typeof replyText>[0])) as { words: VocabWord[] }).words;
}

const plain = (w: string) => w.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
/** Distinct words per conversation, accents and case ignored; a word tagged both ways counts as from the line */
export function vocabCounts(words: VocabWord[]): { own: number; line: number } {
  const seen = new Map<string, 'line' | 'own'>();
  for (const w of words) {
    const k = plain(w.word);
    if (k) seen.set(k, seen.get(k) === 'line' || w.source === 'line' ? 'line' : 'own');
  }
  const all = [...seen.values()];
  return { own: all.filter((x) => x === 'own').length, line: all.filter((x) => x === 'line').length };
}
