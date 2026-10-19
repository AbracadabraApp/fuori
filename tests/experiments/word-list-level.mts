// Round 23, step 2 of 2: does the word-list measure (word-list-level.py) agree
// with the level.md judge on "lines a beginner can follow" (90%+ of words
// known), and is it steadier? The judge scores every line three times; "clear"
// lines are those where its three runs agree. The list is deterministic, so
// steadiness is a given; the question is agreement on clear lines.
//   npx tsx --env-file=.env.local tests/experiments/word-list-level.mts tests/experiments/out/word-list-it.json
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { beginnerKnows } from '@/lib/level';
import { BEGINNER_FOLLOWS } from '@/lib/scorecard';
import { OUT, mean, pct, pool } from './common.mjs';

type L = { conv: string; line: string; n: number; list: number; listOnly: number; unknown: string[] };
const [input] = process.argv.slice(2);
const lines = JSON.parse(readFileSync(input, 'utf8')) as L[];
const RUNS = 3;
const judged = await pool(lines.map((l) => async () => ({ ...l, judge: await Promise.all(Array.from({ length: RUNS }, () => beginnerKnows(l.line))) })), 8);
const ok = (x: number) => x >= BEGINNER_FOLLOWS;
const clear = judged.filter((l) => l.judge.every(ok) || l.judge.every((x) => !ok(x)));
const agree = (key: 'list' | 'listOnly', xs: typeof judged) => xs.filter((l) => ok(l[key]) === ok(l.judge[0])).length / Math.max(1, xs.length);
const spread = judged.map((l) => Math.max(...l.judge) - Math.min(...l.judge));
const rank = (xs: number[]) => { const s = xs.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0]); const r = Array(xs.length); s.forEach(([, i], k) => (r[i] = k)); return r as number[]; };
const rho = (a: number[], b: number[]) => { const ra = rank(a), rb = rank(b), ma = mean(ra), mb = mean(rb); let n = 0, da = 0, db = 0; ra.forEach((x, i) => { n += (x - ma) * (rb[i] - mb); da += (x - ma) ** 2; db += (rb[i] - mb) ** 2; }); return n / Math.sqrt(da * db); };
const jm = judged.map((l) => mean(l.judge));
const misses = new Map<string, number>(); judged.forEach((l) => l.unknown.forEach((w) => misses.set(w, (misses.get(w) ?? 0) + 1)));
const out = [
  `# Word list vs judge, ${judged.length} character lines (round 23)`, '',
  `Follows = ${pct(BEGINNER_FOLLOWS)}+ of words known by a beginner. Judge: level.md, ${RUNS} runs a line. Clear lines: the judge's runs agree (${clear.length} of ${judged.length}).`, '',
  '| Measure | Lines a beginner can follow | Agrees with the judge, clear lines | Agrees, all lines | Rank correlation with judge | Steady run to run |', '|---|---|---|---|---|---|',
  `| Judge (run 1 / 2 / 3) | ${[0, 1, 2].map((k) => pct(judged.filter((l) => ok(l.judge[k])).length / judged.length)).join(' / ')} | — | — | — | ${pct(clear.length / judged.length)} of lines same verdict; median spread ${(spread.sort((a, b) => a - b)[Math.floor(spread.length / 2)] * 100).toFixed(0)} points |`,
  `| Word list + closed-class words | ${pct(judged.filter((l) => ok(l.list)).length / judged.length)} | ${pct(agree('list', clear))} | ${pct(agree('list', judged))} | ${rho(judged.map((l) => l.list), jm).toFixed(2)} | 100% |`,
  `| Word list alone | ${pct(judged.filter((l) => ok(l.listOnly)).length / judged.length)} | ${pct(agree('listOnly', clear))} | ${pct(agree('listOnly', judged))} | ${rho(judged.map((l) => l.listOnly), jm).toFixed(2)} | 100% |`,
  '', `Mean share known: judge ${pct(mean(jm))}, list ${pct(mean(judged.map((l) => l.list)))}.`, '',
  '## Words most often not on the list', '', [...misses].sort((a, b) => b[1] - a[1]).slice(0, 40).map(([w, n]) => `${w} ${n}`).join(', '), '',
  '## Clear lines where they disagree', '',
  ...clear.filter((l) => ok(l.list) !== ok(l.judge[0])).map((l) => `- judge ${l.judge.map((x) => pct(x)).join('/')}, list ${pct(l.list)} (not on list: ${l.unknown.join(', ') || '—'}): ${l.line}`),
];
console.log(out.slice(0, 12).join('\n'));
writeFileSync(join(OUT, 'word-list-level.md'), out.join('\n'));
writeFileSync(join(OUT, 'word-list-level.json'), JSON.stringify(judged, null, 1));
console.log('→ tests/experiments/out/word-list-level.md');
