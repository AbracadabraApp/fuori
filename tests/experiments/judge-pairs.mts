// Grok reads pairs of conversations and picks the more culturally rich one (Josh, 2026-11-17). A reading aid for a trial's
// results (rewrite-trial.mts), never a verdict: Grok is uncalibrated (Josh, 2026-11-08, "I am skeptical of grok": it misread
// facts and its verdicts swung between runs), so every pair is judged in BOTH orders; a pair counts for an arm only when the two
// readings agree, and the position bias is printed. Test scripts only: the game never calls Grok.
//   npx tsx --env-file=.env.local tests/experiments/judge-pairs.mts --a=a-it.json,a-mx.json --b=b-it.json,b-mx.json [--out=judged.json] [--only=Sara] [--limit=1]
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
const SCHEMA = { type: 'object', additionalProperties: false, required: ['richer', 'why'], properties: { richer: { type: 'integer', enum: [1, 2] }, why: { type: 'string' } } };
const ask = (first: Visit, second: Visit) => askGrok<{ richer: 1 | 2; why: string }>(
  `Two conversations between a language learner and the same character, each from the character's side only (English translation of what the character said). ` +
  `The learner is learning a country, its language and its culture: food, traditions, history, geography, customs, how people really live and talk. ` +
  `Which conversation is more culturally rich, meaning it teaches more real, specific, correct things about the country and its culture? ` +
  `Judge what is said, not length or warmth. You must pick one. Answer richer = 1 or 2 and one sentence saying what made it richer, naming the things.\n\n` +
  `CONVERSATION 1\n${text(first)}\n\nCONVERSATION 2\n${text(second)}`, SCHEMA, GROK);

const results: { id: string; person?: string; aFirst: { richer: 'A' | 'B'; why: string }; bFirst: { richer: 'A' | 'B'; why: string }; agree: boolean; winner?: 'A' | 'B' }[] = [];
for (let i = 0; i < pairs.length; i += 4) {
  await Promise.all(pairs.slice(i, i + 4).map(async (p) => {
    const [x, y] = await Promise.all([ask(p.a, p.b), ask(p.b, p.a)]);
    const aFirst = { richer: (x.richer === 1 ? 'A' : 'B') as 'A' | 'B', why: x.why };
    const bFirst = { richer: (y.richer === 1 ? 'B' : 'A') as 'A' | 'B', why: y.why };
    const agree = aFirst.richer === bFirst.richer;
    results.push({ id: p.id, person: p.a.person, aFirst, bFirst, agree, winner: agree ? aFirst.richer : undefined });
  }));
}
results.sort((r, s) => r.id.localeCompare(s.id));
for (const r of results) console.log(`${(r.person ?? r.id).padEnd(28)} ${r.agree ? `richer: ${r.winner}` : 'the two readings disagree'}\n   A first: ${r.aFirst.richer} (${r.aFirst.why})\n   B first: ${r.bFirst.richer} (${r.bFirst.why})`);
const n = results.length, ag = results.filter((r) => r.agree);
const firstPicks = results.length * 2, slot1 = results.filter((r) => r.aFirst.richer === 'A').length + results.filter((r) => r.bFirst.richer === 'B').length;
console.log(`\n${n} pairs, each read in both orders. Readings agree on ${ag.length}: A richer ${ag.filter((r) => r.winner === 'A').length}, B richer ${ag.filter((r) => r.winner === 'B').length}; disagree on ${n - ag.length}.`);
console.log(`Position bias: Grok picked the conversation shown first in ${slot1} of ${firstPicks} readings (50% if it has none).`);
if (arg('out')) writeFileSync(arg('out')!, JSON.stringify({ model: GROK, results }, null, 1));
