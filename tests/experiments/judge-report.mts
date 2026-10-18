// The replay's quality judge (lib/quality.ts, quality.md) on any report, twice per
// conversation, so arms from different tests are scored alike (rounds 8-13).
// --notes prints the judge's note for each conversation with a line that doesn't follow.
//   npx tsx --env-file=.env.local tests/experiments/judge-report.mts [--notes] <label>=<report.md> ...   (COUNTRY as needed)
import { readFileSync } from 'node:fs';
import { judgeWithClaude } from '@/lib/quality';
import { cities } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';
import { labelled, mean, pool, reportConversations } from './common.mjs';

const NOTES = process.argv.includes('--notes');
// Each character's own city and role: the judge marks a line that names the wrong city as one that doesn't follow
const where = new Map(cities.flatMap((c) => c.places.map((p) => characterForPlace(c, p)).filter((x): x is NonNullable<typeof x> => !!x).map((ch) => [ch.name, { city: ch.city, role: ch.role, age: ch.age }])));
for (const { label, path } of labelled(process.argv.slice(2).filter((a) => !a.startsWith('--')))) {
  const convs = reportConversations(readFileSync(path, 'utf8'));
  let failed = 0;
  const js = (await pool(convs.flatMap((c) => [0, 1].map(() => () =>
    judgeWithClaude({ name: c.name, age: where.get(c.name)?.age ?? 40, role: where.get(c.name)?.role ?? c.role, city: where.get(c.name)?.city ?? cities[0].name }, c.turns).then((j) => ({ c, j })).catch(() => { failed++; return null; })
  )))).filter((x): x is NonNullable<typeof x> => !!x);
  if (NOTES) for (const { c, j } of js) if ((j.incoherent ?? 0) > 0) console.log(`  ${c.name} · doesn't follow ${j.incoherent} · ${j.note}`);
  console.log(`${label.padEnd(14)} ${convs.length} conversations · alive ${mean(js.map((x) => x.j.alive ?? 0)).toFixed(2)} · replies that don't follow ${mean(js.map((x) => x.j.incoherent ?? 0)).toFixed(2)} per conversation · unprompted corrections ${mean(js.map((x) => x.j.correctionsUnprompted)).toFixed(2)} · judge failures ${failed}`);
}
