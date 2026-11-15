// The follow dial: does a crude automatic "can you follow this?" move when the share of the language moves?
// (Josh, 2026-11-15: "I'm more thinkiing of it as an automated test than an accurate one"; "the test is does it
// work/do the numbers corrrelate (an increase in the input is refflected in the measured result"; "Dial it up until
// the answer is no".) A check on a measure, not a card: no game prompt is changed or tried.
//
// Input: a file of character turns in English, one per line (real turns' `en`). Each turn is cut into short
// segments with the language beside each (one call). The dial puts 0%, 10% … 100% of the segments into the
// language, each level keeping the ones before it, in two arms: bare (the language alone) and glossed (the
// language, then its English: the control, which should stay followable). The share of the language is counted
// in words, exactly. Each level is asked on its own, with no memory of the others:
// "You speak only English… can you follow? yes or no", of Claude and, with XAI_API_KEY, of Grok.
// Output: yes-rate by level, the level where yes falls under half (the ceiling), and the rank correlation
// between the language's share and the yes-rate.
//   COUNTRY=es-mx npx tsx --env-file=.env.local tests/experiments/follow-dial.mts <turns.txt> [out.json]
import { readFileSync, writeFileSync } from 'node:fs';
import { language } from '@/content';
import { ask, askGrok } from './common.mjs';

const turns = readFileSync(process.argv[2], 'utf8').split('\n').map((l) => l.trim()).filter(Boolean);
const LEVELS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

const segSchema = { type: 'object', additionalProperties: false, required: ['segments'], properties: { segments: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['en', 'xx'], properties: { en: { type: 'string' }, xx: { type: 'string' } } } } } };
const followSchema = { type: 'object', additionalProperties: false, required: ['follow'], properties: { follow: { type: 'boolean' } } };

/** The turn as segments of 3 to 8 words, in order, each with the same words in the language */
async function segment(turn: string): Promise<{ en: string; xx: string }[]> {
  const r = JSON.parse(await ask(`Cut this spoken line into consecutive segments of about 3 to 8 words, at natural breaks (clauses, phrases), covering every word in order, with its punctuation. For each segment give "en", the segment exactly as written, and "xx", the same segment in natural ${language.name} as a local would say it.\n\n${turn}`, { schema: segSchema }));
  return r.segments;
}

/** A fixed shuffle per turn, so each level keeps the segments of the level before it */
function order(n: number, seed: number): number[] {
  const idx = [...Array(n).keys()];
  let s = seed + 1;
  for (let i = n - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) % 2147483648;
    const j = s % (i + 1);
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx;
}

function build(segs: { en: string; xx: string }[], level: number, seed: number, glossed: boolean) {
  const inLanguage = new Set(order(segs.length, seed).slice(0, Math.round((level / 100) * segs.length)));
  const text = segs.map((s, i) => (inLanguage.has(i) ? (glossed ? `${s.xx} ${s.en}` : s.xx) : s.en)).join(' ');
  const lang = segs.reduce((n, s, i) => n + (inLanguage.has(i) ? words(s.xx) : 0), 0);
  return { text, share: lang / words(text) };
}

const question = (text: string) => `You speak only English. You know no ${language.name} at all. Someone says this to you:\n\n${text}\n\nCan you follow what they are telling you and what they are asking you? Answer yes or no.`;
const judges: Record<string, (text: string) => Promise<boolean>> = {
  claude: async (text) => JSON.parse(await ask(question(text), { schema: followSchema, max: 2000 })).follow,
};
if (process.env.XAI_API_KEY) judges.grok = async (text) => (await askGrok<{ follow: boolean }>(question(text), followSchema)).follow;

/** Spearman's rank correlation */
function spearman(x: number[], y: number[]): number {
  const rank = (v: number[]) => v.map((a) => (v.filter((b) => b < a).length + (v.filter((b) => b === a).length + 1) / 2));
  const [rx, ry] = [rank(x), rank(y)];
  const mean = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length;
  const [mx, my] = [mean(rx), mean(ry)];
  const cov = rx.reduce((s, a, i) => s + (a - mx) * (ry[i] - my), 0);
  const sd = (v: number[], m: number) => Math.sqrt(v.reduce((s, a) => s + (a - m) ** 2, 0));
  const d = sd(rx, mx) * sd(ry, my);
  return d ? cov / d : 0;
}

const segmented = await Promise.all(turns.map(segment));
type Row = { turn: number; arm: 'bare' | 'glossed'; level: number; share: number; text: string; follow: Record<string, boolean> };
const rows: Row[] = [];
await Promise.all(segmented.flatMap((segs, t) => (['bare', 'glossed'] as const).flatMap((arm) => LEVELS.map(async (level) => {
  const b = build(segs, level, t, arm === 'glossed');
  const follow: Record<string, boolean> = {};
  await Promise.all(Object.entries(judges).map(async ([name, judge]) => { follow[name] = await judge(b.text); }));
  rows.push({ turn: t, arm, level, share: b.share, text: b.text, follow });
}))));

const pct = (x: number) => `${Math.round(100 * x)}%`.padStart(4);
console.log(`${turns.length} turns · ${language.name} · levels ${LEVELS.join(' ')} · judges: ${Object.keys(judges).join(', ')}`);
for (const arm of ['bare', 'glossed'] as const) for (const name of Object.keys(judges)) {
  const at = LEVELS.map((level) => rows.filter((r) => r.arm === arm && r.level === level));
  const share = at.map((rs) => rs.reduce((s, r) => s + r.share, 0) / rs.length);
  const yes = at.map((rs) => rs.filter((r) => r.follow[name]).length / rs.length);
  const ceiling = LEVELS.find((_, i) => yes[i] < 0.5);
  console.log(`\n${arm} · ${name}`);
  console.log(`  segments in ${language.name}  ${LEVELS.map((l) => pct(l / 100)).join(' ')}`);
  console.log(`  words in ${language.name}     ${share.map(pct).join(' ')}`);
  console.log(`  says it can follow     ${yes.map(pct).join(' ')}`);
  console.log(`  falls under half at: ${ceiling === undefined ? 'never' : `${ceiling}% of segments (${pct(share[LEVELS.indexOf(ceiling)]).trim()} of words)`} · rank correlation, share against yes: ${spearman(share, yes).toFixed(2)}`);
}
if (process.argv[3]) writeFileSync(process.argv[3], JSON.stringify({ language: language.name, turns: segmented, rows }, null, 1));
