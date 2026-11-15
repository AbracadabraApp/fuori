// D20 (bugs.md B10): Ofelia's notes about Josh said "Her name is Joshua; she…" and "Ofelia calls her güerita and mi
// reina" from 2026-10-24 on, and every later note copied them, so she kept calling him güerita. Rewrites her notes from
// his last visit (71dc1d3b) with the memory prompt, N times, and counts notes that still say he/she or a gendered name.
//   COUNTRY=es-mx npx tsx --env-file=.env.local tests/experiments/memory-gender.mts <snapshot.json> <takes>
import { readFileSync } from 'node:fs';
import { summarizeWithClaude, findCharacter } from '@/lib/remember';
import { cities } from '@/content';

const [file, takes = '3'] = process.argv.slice(2);
const c = (JSON.parse(readFileSync(file, 'utf8')) as any[]).find((x) => x.id.startsWith('71dc1d3b'));
const prior = (JSON.parse(readFileSync(file, 'utf8')) as any[]).filter((x) => x.character_id === 'ofelia-tlayudas' && x.learner_id === c.learner_id && x.started_at < c.started_at).sort((a, b) => (a.started_at < b.started_at ? 1 : -1))[0];
const ch = findCharacter(c.city_id, c.character_id)!;
const city = cities.find((x) => x.id === c.city_id)!;
const runs = await Promise.all(Array.from({ length: Number(takes) }, () => summarizeWithClaude({ character: { name: ch.name, age: ch.age, role: ch.role, city: city.name }, notes: prior.notes ?? [], turns: c.turns.map((t: any) => ({ who: t.who, text: t.text })) })));
const gendered = (n: string) => /\b(she|her|hers|herself|he|him|his|himself)\b/i.test(n) || /güerit|mi reina|señora|joven/i.test(n);
for (const r of runs) {
  const bad = r.notes.filter(gendered);
  console.log(`notes ${r.notes.length} · gendered ${bad.length}${bad.length ? ': ' + bad.join(' | ') : ''}`);
}
console.log('sample:', runs[0].notes.join(' | '));
