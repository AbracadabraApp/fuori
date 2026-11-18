// A random sample of people for a trial: the same number from each country, one per city, never a hidden city or place,
// a ticket seller, or Magda. Seeded, so the pick can be repeated and the seed is on record (picks.json).
//   npx tsx tests/experiments/pick-people.mts --seed=17 --n=8 --out=tests/experiments/results/picks-2026-11-17.json
// It prints the four commands for the mini: each country, production (A) and header only (B, TRIAL_NO_HERE=1).
import { writeFileSync } from 'fs';
import { packs } from '@/content';

const arg = (k: string, d?: string) => process.argv.find((a) => a.startsWith(`--${k}=`))?.split('=')[1] ?? d;
const seed = Number(arg('seed', '1')), n = Number(arg('n', '8')), out = arg('out')!;
const date = arg('date', new Date().toISOString().slice(0, 10))!;

function rng(a: number) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const rand = rng(seed);
const shuffle = <T,>(xs: T[]) => { const a = [...xs]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

const picks: Record<string, { city: string; place: string; person: string; role: string; hereWords: number }[]> = {};
const eligible: Record<string, number> = {};
for (const [id, pack] of Object.entries(packs)) {
  const byCity = pack.cities.filter((c) => !c.hidden).map((c) => ({
    city: c,
    people: c.places.filter((p) => !p.hidden && !/station/.test(p.kind) && p.characterId && p.characterId !== pack.tutor.id)
      .map((p) => ({ p, who: c.characters?.find((x) => x.id === p.characterId) })).filter((x) => x.who),
  })).filter((x) => x.people.length);
  eligible[id] = byCity.length;
  if (byCity.length < n) throw new Error(`${id} has only ${byCity.length} usable cities, fewer than ${n}`);
  picks[id] = shuffle(byCity).slice(0, n).map(({ city, people }) => {
    const { p, who } = shuffle(people)[0];
    return { city: city.id, place: p.id, person: who!.name, role: who!.role, hereWords: who!.here ? who!.here.split(/\s+/).length : 0 };
  });
}
writeFileSync(out, JSON.stringify({ seed, n, eligibleCities: eligible, picks }, null, 1));
for (const [id, rows] of Object.entries(picks)) {
  console.log(`\n${id} (${eligible[id]} usable cities, ${n} drawn)`);
  for (const r of rows) console.log(`  ${r.city.padEnd(24)} ${r.person.padEnd(24)} ${String(r.hereWords).padStart(3)} words  ${r.role}`);
}
const spots = (id: string) => picks[id].map((r) => `${r.city}/${r.place}`).join(',');
const stem = `TRIAL_STEPS=4 TRIAL_KINDS=long TRIAL_REPEAT=1 npx tsx --env-file=.env.local tests/experiments/rewrite-trial.mts`;
console.log('\nFor the mini (local test database, from a checkout of main):');
for (const [id, tag] of [['it', 'it'], ['es-mx', 'mx']]) for (const [arm, flag] of [['a', ''], ['b', 'TRIAL_NO_HERE=1 ']]) {
  console.log(`${id === 'es-mx' ? 'COUNTRY=es-mx ' : ''}${flag}TRIAL_SPOTS=${spots(id)} ${stem} --out=tests/experiments/results/random-${tag}-${arm}-${date}.json`);
}
