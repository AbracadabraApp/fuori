// Grok reads pairs of conversations and picks the more culturally rich one (Josh, 2026-11-17: "just a binary score -
// alternating sequence A/B if possible"). One reading a pair, a bare 1 or 2, no reasons; the order alternates (A first on
// the 1st, 3rd, 5th pair, B first on the others) so any liking for the conversation shown first cancels across the pairs.
// A reading aid, never a verdict: Grok is uncalibrated (Josh, 2026-11-08, "I am skeptical of grok"). Test scripts only.
//   npx tsx --env-file=.env.local tests/experiments/judge-pairs.mts --a=a-it.json,a-mx.json --b=b-it.json,b-mx.json [--out=judged.json] [--only=Sara] [--limit=2]
import { readFileSync, writeFileSync } from 'fs';
import { askGrok } from './common.mjs';
import type { Visit } from './trial-measures.mjs';

const arg = (k: string) => process.argv.find((a) => a.startsWith(`--${k}=`))?.split('=').slice(1).join('=');
const load = (list?: string) => (list ?? '').split(',').filter(Boolean).flatMap((f) => JSON.parse(readFileSync(f, 'utf8')) as Visit[]);
const A = load(arg('a')), B = load(arg('b'));
const GROK = process.env.GROK_MODEL ?? 'grok-4.20-0309-non-reasoning';

const key = (vs: Visit[]) => { const seen: Record<string, number> = {}; return vs.map((v) => { const k = `${v.city}/${v.place}`; seen[k] = (seen[k] ?? 0) + 1; return { v, id: `${k}#${seen[k]}` }; }); };
const KB = key(B);
let pairs = key(A).map((a) => ({ id: a.id, a: a.v, b: KB.find((x) => x.id === a.id)?.v })).filter((p): p is { id: string; a: Visit; b: Visit } => !!p.b);
if (arg('only')) pairs = pairs.filter((p) => new RegExp(arg('only')!, 'i').test(`${p.a.person} ${p.id}`));
if (arg('limit')) pairs = pairs.slice(0, Number(arg('limit')));

const text = (v: Visit) => v.turns.map((t, i) => `${i + 1}. ${t.en}`).join('\n');
const SCHEMA = { type: 'object', additionalProperties: false, required: ['richer'], properties: { richer: { type: 'integer', enum: [1, 2] } } };
const ask = (first: Visit, second: Visit) => askGrok<{ richer: 1 | 2 }>(
  `Two conversations between a language learner and the same character, each from the character's side only (English translation of what the character said). ` +
  `The learner is learning a country, its language and its culture: food, traditions, history, geography, customs, how people really live and talk. ` +
  `Which conversation is more culturally rich, meaning it teaches more real, specific, correct things about the country and its culture? ` +
  `Judge what is said, not length or warmth. You must pick one. Answer richer = 1 or 2.\n\n` +
  `CONVERSATION 1\n${text(first)}\n\nCONVERSATION 2\n${text(second)}`, SCHEMA, GROK);

const results: { id: string; person?: string; shownFirst: 'A' | 'B'; richer: 'A' | 'B' }[] = [];
for (let i = 0; i < pairs.length; i += 4) {
  await Promise.all(pairs.slice(i, i + 4).map(async (p, j) => {
    const aFirst = (i + j) % 2 === 0;
    const r = await (aFirst ? ask(p.a, p.b) : ask(p.b, p.a));
    const pickedFirst = r.richer === 1;
    results.push({ id: p.id, person: p.a.person, shownFirst: aFirst ? 'A' : 'B', richer: (pickedFirst === aFirst ? 'A' : 'B') });
  }));
}
results.sort((r, s) => r.id.localeCompare(s.id));
for (const r of results) console.log(`${(r.person ?? r.id).padEnd(28)} ${r.id.padEnd(48)} richer: ${r.richer}   (${r.shownFirst} shown first)`);
const n = results.length, a = results.filter((r) => r.richer === 'A').length;
const first = results.filter((r) => r.richer === r.shownFirst).length;
console.log(`\n${n} pairs, one reading each, alternating order. A richer ${a}, B richer ${n - a}.`);
console.log(`The conversation shown first was picked in ${first} of ${n} (about half if there is no liking for the first).`);
if (arg('out')) writeFileSync(arg('out')!, JSON.stringify({ model: GROK, results }, null, 1));
