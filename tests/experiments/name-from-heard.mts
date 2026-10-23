// The learner's name from what speech to text heard in onboarding
// (lib/onboarding.ts nameFromHeard, name.md). Fixed answers with the name
// they should give; prints misses. Name round 1, 2026-10-22.
//   npx tsx --env-file=.env.local tests/experiments/name-from-heard.mts   (COUNTRY=es-mx for Mexico)
import { nameFromHeard } from '@/lib/onboarding';
import { pool } from './common.mjs';

const cases: [string, string | null][] = [
  ['My name is Josh.', 'Josh'], ['Josh.', 'Josh'], ["I'm Teresa, nice to meet you!", 'Teresa'],
  ['Mi chiamo Giosuè.', 'Giosuè'], ['Ciao! Sono Marco, piacere.', 'Marco'], ['Me llamo Ana María.', 'Ana María'],
  ['Hola, soy Sam.', 'Sam'], ['Um, my name is Robert but call me Bob.', 'Bob'], ['Je m\'appelle Claire.', 'Claire'],
  ['Josh Petersen.', 'Josh'], ['Uh... sorry, what?', null], ['Thank you.', null], ['Ich heiße Jürgen.', 'Jürgen'],
  ['My name is Siobhan.', 'Siobhan'], ['Sono Elena.', 'Elena'], ['Mucho gusto, me llamo Pedro.', 'Pedro'],
];
const res = await pool(cases.map(([heard, want]) => async () => {
  const t0 = performance.now();
  const r = await nameFromHeard(heard);
  return { heard, want, got: r.name, ms: performance.now() - t0, v: r.promptVersion };
}));
const right = res.filter((r) => r.got === r.want).length;
const ms = res.map((r) => r.ms).sort((a, b) => a - b);
console.log(`name.md ${res[0].v}: ${right}/${res.length} right · median ${(ms[ms.length >> 1] / 1000).toFixed(1)} s`);
for (const r of res.filter((r) => r.got !== r.want)) console.log(`- "${r.heard}" → ${JSON.stringify(r.got)} (want ${JSON.stringify(r.want)})`);
