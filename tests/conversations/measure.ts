/**
 * The counts taken on every conversation, simulated or real (Josh, 2026-11-08:
 * "Prefer clear output measures over judgement"; "always capture measurements
 * (even when not directly tied to test)"). Plain arithmetic on the transcript,
 * the same in any language: no word lists, no judge. The one exception is the
 * culture count, a single reader's list (cultureCount), kept apart so it can be
 * left out or checked against A-against-A pairs.
 */
import { wordCount, questionCount } from '@/lib/dialogue-stats';
import { anthropic, CLAUDE_MODEL, replyText } from '@/lib/claude';
import { language } from '@/content';

export type Line = { who: 'npc' | 'learner'; text: string };
/** One conversation is one or more visits, each a list of lines in order */
export type Visits = Line[][];

export interface Measures {
  visits: number;
  /** Character lines counted, all visits */
  npcLines: number;
  /** Average words per character line */
  wordsPerLine: number;
  /** Average questions ("?") per character line */
  questionsPerLine: number;
  /** Share of all words said by the learner (0–1) */
  learnerShare: number;
  /** Average words per learner line: how much a real or simulated learner says at a time */
  learnerWordsPerLine: number;
  /** Character sentences on visit 2 or later that closely match one he said on an earlier visit */
  repeats: number;
  /** The repeated sentences, for reading */
  repeated: { visit: number; said: string; earlier: string }[];
  /** Real things about the country a newcomer learns, as listed by one reader (absent if not run) */
  culture?: number;
  cultureList?: string[];
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Sentences of five or more words: shorter ones ("¡Buenas tardes!") repeat in any real conversation */
function sentences(text: string): string[] {
  return text.split(/(?<=[.!?…])\s+/).map((s) => s.trim()).filter((s) => wordCount(s) >= 5);
}
const words = (s: string) => new Set(s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').match(/[\p{L}\p{N}]+/gu) ?? []);
/** Share of words two sentences have in common (Jaccard); 0.6 and up reads as the same sentence said again */
export function overlap(a: string, b: string): number {
  const x = words(a), y = words(b);
  const shared = [...x].filter((w) => y.has(w)).length;
  return shared / (x.size + y.size - shared || 1);
}
export const SAME_SENTENCE = 0.6;

export function measure(visits: Visits): Measures {
  const all = visits.flat();
  const npc = all.filter((l) => l.who === 'npc');
  const npcWords = npc.reduce((n, l) => n + wordCount(l.text), 0);
  const learnerLines = all.filter((l) => l.who === 'learner');
  const learnerWords = learnerLines.reduce((n, l) => n + wordCount(l.text), 0);
  const repeated: Measures['repeated'] = [];
  visits.forEach((v, k) => {
    if (!k) return;
    const earlier = visits.slice(0, k).flat().filter((l) => l.who === 'npc').flatMap((l) => sentences(l.text));
    for (const l of v.filter((x) => x.who === 'npc')) for (const s of sentences(l.text)) {
      const match = earlier.find((e) => overlap(s, e) >= SAME_SENTENCE);
      if (match) repeated.push({ visit: k + 1, said: s, earlier: match });
    }
  });
  return {
    visits: visits.length,
    npcLines: npc.length,
    wordsPerLine: round2(npcWords / (npc.length || 1)),
    questionsPerLine: round2(npc.reduce((n, l) => n + questionCount(l.text), 0) / (npc.length || 1)),
    learnerShare: round2(learnerWords / (npcWords + learnerWords || 1)),
    learnerWordsPerLine: round2(learnerWords / (learnerLines.length || 1)),
    repeats: repeated.length,
    repeated,
  };
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

/** The numbers shown in a report row, in order */
export const COLUMNS: [keyof Measures, string][] = [
  ['wordsPerLine', 'Words per line'], ['questionsPerLine', 'Questions per line'], ['learnerShare', 'Learner share'], ['learnerWordsPerLine', 'Learner words per line'], ['repeats', 'Repeats'], ['culture', 'Culture'],
];
