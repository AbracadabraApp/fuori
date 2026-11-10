// The here lines of some cities as [{ id, text }], the input scripts/fact-check.mts
// reads, so a new city's lines can be judged before it is shown. Written for
// Mexico's five new cities (2026-11-09); works for any city in the active pack.
//   COUNTRY=es-mx npx tsx scripts/here-lines.mts veracruz,merida > lines.json
//   COUNTRY=es-mx npx tsx --env-file=.env.local scripts/fact-check.mts lines.json
import { cities } from '@/content';

const wanted = new Set((process.argv[2] ?? '').split(',').filter(Boolean));
if (!wanted.size) {
  console.error('usage: npx tsx scripts/here-lines.mts <city id>,<city id>');
  process.exit(1);
}
const unknown = [...wanted].filter((id) => !cities.some((c) => c.id === id));
if (unknown.length) {
  console.error(`No such city in this country: ${unknown.join(', ')}`);
  process.exit(1);
}
const lines = cities
  .filter((c) => wanted.has(c.id))
  .flatMap((c) => (c.characters ?? []).filter((ch) => ch.here).map((ch) => ({ id: `${c.id}/${ch.id}`, text: `In ${c.name}: ${ch.here}` })));
console.log(JSON.stringify(lines, null, 1));
