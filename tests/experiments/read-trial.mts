// Reads the JSON files a trial run wrote (rewrite-trial.mts), arm A against arm B. No model calls, nothing written.
//   npx tsx tests/experiments/read-trial.mts --a=a-it.json,a-mx.json --b=b-it.json,b-mx.json            standard rows, then the paired table
//   ... --count="Zeferino|Alborada"        visits and mentions of a pattern, per arm (one-off custom measure)
//   ... --person=Sara                       one person's visits side by side, turn by turn (English)
//   ... --turn=4                            everyone's 4th turn, A against B
//   ... --full                             with --person, --turn or --blind: not just the English but the whole turn (the line as the character says it, with the language and its glosses, the English, the answers offered, the step's setup)
//   ... --repeats                           repeated words: the words said most within a visit, and the words that turn up in the most visits, per arm (English)
//   ... --blind[=seed]                      every visit shuffled, arm hidden, for reading; add --reveal for the key
// Custom measures live in trial-measures.mts (CUSTOM) and show in the paired table and the totals.
import { readFileSync } from 'fs';
import { CUSTOM, english, summary, type Visit } from './trial-measures.mjs';

const arg = (k: string) => process.argv.find((a) => a === `--${k}` || a.startsWith(`--${k}=`))?.split('=').slice(1).join('=') ?? (process.argv.includes(`--${k}`) ? '1' : undefined);
const load = (list?: string) => (list ?? '').split(',').filter(Boolean).flatMap((f) => JSON.parse(readFileSync(f, 'utf8')) as Visit[]);
const A = load(arg('a')), B = load(arg('b'));
if (!A.length || !B.length) { console.error('Give --a=file,file and --b=file,file'); process.exit(1); }

// The same visit in both arms: city, place and the order it was played in
const key = (vs: Visit[]) => { const seen: Record<string, number> = {}; return vs.map((v) => { const k = `${v.city}/${v.place}`; seen[k] = (seen[k] ?? 0) + 1; return { v, id: `${k}#${seen[k]}` }; }); };
const KA = key(A), KB = key(B);
const pairs = KA.map((a) => ({ id: a.id, a: a.v, b: KB.find((x) => x.id === a.id)?.v })).filter((p): p is { id: string; a: Visit; b: Visit } => !!p.b);
const name = (v: Visit) => v.person ?? v.place;
const num = (x: number) => (Number.isNaN(x) ? 'n/a' : Number.isInteger(x) ? String(x) : x.toFixed(1));
const mean = (xs: number[]) => { const k = xs.filter((x) => !Number.isNaN(x)); return k.length ? k.reduce((a, b) => a + b, 0) / k.length : NaN; };
const full = process.argv.includes('--full');
const turnText = (v: Visit | undefined, i: number) => {
  const t = v?.turns[i];
  if (!t) return '(none)';
  return full ? `[${t.setup ?? '-'}${t.done ? ', done' : ''}]\n    LINE: ${t.line}\n    EN:   ${t.en}${t.answerTexts?.length ? `\n    ANSWERS: ${t.answerTexts.join('  /  ')}` : ''}` : t.en;
};

const person = arg('person'), turn = arg('turn'), pattern = arg('count'), blind = arg('blind');

const STOP = new Set('a an the and or but of to in on at for with from by is are was were be been it its this that these those i you he she we they me my your our their his her them us do does did have has had not no yes so if as than then there here what which who how when where why can will would just very really also too more most some any all one two come back please thank thanks okay oh well good great nice glad'.split(' '));
const content = (v: Visit) => (english(v).toLowerCase().match(/[a-záéíóúñü']+/g) ?? []).map((w) => w.replace(/^'+|'+$/g, '')).filter((w) => w.length > 2 && !STOP.has(w));
if (process.argv.includes('--repeats')) {
  for (const [label, vs] of [['A', A], ['B', B]] as const) {
    const within = new Map<string, number>(), across = new Map<string, number>();
    let rep = 0, total = 0;
    for (const v of vs) {
      const c = new Map<string, number>(); for (const w of content(v)) c.set(w, (c.get(w) ?? 0) + 1);
      total += content(v).length; rep += [...c.values()].filter((n) => n >= 3).length;
      for (const [w, n] of c) { if (n >= 3) within.set(w, (within.get(w) ?? 0) + n); across.set(w, (across.get(w) ?? 0) + 1); }
    }
    const top = (m: Map<string, number>, k: number) => [...m].sort((x, y) => y[1] - x[1]).slice(0, k).map(([w, n]) => `${w} ${n}`).join(', ');
    console.log(`\n${label}: ${vs.length} visits, ${total} content words; words said 3+ times in a visit: ${rep} (${(rep / vs.length).toFixed(1)} a visit)`);
    console.log(`  said 3+ times within a visit (total mentions): ${top(within, 20)}`);
    console.log(`  in the most visits (visits): ${top(across, 20)}`);
  }
} else if (person) {
  for (const p of pairs.filter((p) => new RegExp(person, 'i').test(`${name(p.a)} ${p.id}`))) {
    console.log(`\n=== ${name(p.a)} (${p.id}) ===`);
    for (let i = 0; i < Math.max(p.a.turns.length, p.b.turns.length); i++) console.log(`\n[turn ${i + 1}]\n A: ${turnText(p.a, i)}\n B: ${turnText(p.b, i)}`);
  }
} else if (turn) {
  const i = Number(turn) - 1;
  for (const p of pairs) console.log(`\n--- ${name(p.a)} (${p.id}), turn ${turn}\n A: ${turnText(p.a, i)}\n B: ${turnText(p.b, i)}`);
} else if (blind) {
  let s = Number(blind === '1' ? 7 : blind) || 7;
  const rnd = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
  const all = [...KA.map((x) => ({ ...x, arm: 'A' })), ...KB.map((x) => ({ ...x, arm: 'B' }))].sort(() => rnd() - 0.5);
  all.forEach((x, n) => { console.log(`\n##### visit ${n + 1}: ${name(x.v)}\n${x.v.turns.map((_, i) => `${i + 1}. ${turnText(x.v, i)}`).join('\n')}`); });
  if (arg('reveal')) { console.log('\nKey:'); all.forEach((x, n) => console.log(`visit ${n + 1}: arm ${x.arm}, ${x.id}`)); }
} else {
  const rows = (vs: Visit[]) => summary(vs);
  const sa = rows(A), sb = rows(B);
  const w = Math.max(...Object.keys(sa).map((k) => k.length));
  console.log(`${A.length} visits in A, ${B.length} in B, ${pairs.length} people in both\n\nStandard rows\n${''.padEnd(w)}  A         |  B`);
  for (const k of Object.keys(sa)) console.log(`${k.padEnd(w)}  ${sa[k]}  |  ${sb[k]}`);
  console.log('\nCustom measures, mean a visit (and, over the pairs, how many people were higher in B / equal / higher in A)');
  for (const [m, f] of Object.entries(CUSTOM)) {
    const d = pairs.map((p) => f(p.b, B) - f(p.a, A)).filter((x) => !Number.isNaN(x));
    console.log(`${m.padEnd(w)}  ${num(mean(A.map((v) => f(v, A))))}  |  ${num(mean(B.map((v) => f(v, B))))}   B higher ${d.filter((x) => x > 0).length} · equal ${d.filter((x) => x === 0).length} · A higher ${d.filter((x) => x < 0).length}`);
  }
  if (pattern) {
    const re = new RegExp(pattern, 'gi');
    for (const [label, vs] of [['A', A], ['B', B]] as const) {
      const hits = vs.map((v) => (english(v).match(re) ?? []).length);
      console.log(`\ncount /${pattern}/ in ${label}: ${hits.filter(Boolean).length} of ${vs.length} visits, ${hits.reduce((a, b) => a + b, 0)} mentions`);
    }
  }
  console.log('\nPer person (A | B)');
  const ms = Object.entries(CUSTOM);
  console.log(['person'.padEnd(28), ...ms.map(([m]) => m.slice(0, 14).padEnd(14))].join(' '));
  for (const p of pairs) console.log([name(p.a).slice(0, 27).padEnd(28), ...ms.map(([, f]) => `${num(f(p.a, A))}|${num(f(p.b, B))}`.padEnd(14))].join(' '));
}
