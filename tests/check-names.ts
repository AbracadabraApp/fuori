// Every shown person has a full name of their own (Josh, 2026-11-03: "we
// should have unique full names - parts can repeat"): a given name and a
// surname, Don, Doña or Padre aside, and no two shown people in a country
// with the same name. Magda is first name only (CLAUDE.md) and isn't in the
// city files. A learner who travels shouldn't meet the "same" person twice.
//   tsx tests/check-names.ts (COUNTRY=es-mx for Mexico)
import { cities, pack } from '@/content';

const shown = new Set(cities.filter((c) => !c.hidden).flatMap((c) => c.places.filter((p) => !p.hidden && p.characterId).map((p) => p.characterId!)));
const people = cities.flatMap((c) => (c.characters ?? []).filter((ch) => shown.has(ch.id)).map((ch) => ({ city: c.id, id: ch.id, name: ch.name })));
const problems: string[] = [];
const words = (n: string) => n.replace(/^(Don|Doña|Padre|Fra|Suor|Don|Zia|Zio|Nonna|Nonno)\s+/i, '').trim().split(/\s+/).filter(Boolean);
for (const p of people) if (words(p.name).length < 2) problems.push(`${p.city}/${p.id}: "${p.name}" needs a surname`);
const seen = new Map<string, string>();
for (const p of people) {
  const key = p.name.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
  if (seen.has(key)) problems.push(`"${p.name}" twice: ${seen.get(key)} and ${p.city}/${p.id}`);
  seen.set(key, `${p.city}/${p.id}`);
}
if (problems.length) {
  console.error(`[${pack.id}] FAILED (${problems.length})\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log(`[${pack.id}] OK: ${people.length} shown people, each with a full name of their own`);
