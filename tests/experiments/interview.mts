// H2 (docs/prompt-trials.md → H2): interview characters with the game's prompt
// as it is, first meeting, the same 5 questions each; one Claude call lists what
// we learned about the person and about the place, marked whether it's in the
// here line. Mexico: the first 2 characters with a here line in each city (10).
//   COUNTRY=es-mx npx tsx --env-file=.env.local tests/experiments/interview.mts        (10)
//   PILOT=1 COUNTRY=es-mx npx tsx --env-file=.env.local tests/experiments/interview.mts (2)
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { cities, language } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';
import { runTurn } from '@/lib/turn';
import type { Turn } from '@/lib/types';
import { ask, startTest } from './common.mjs';

startTest('H2 (2026-11-08)');

const T0 = Date.now();
// The learner's lines, fixed, in the country's language (a test script, so written here)
const QUESTIONS: Record<string, string[]> = {
  'es-mx': ['Hola, ¿cómo se llama usted?', '¿Qué hace usted aquí?', '¿De dónde es usted?', '¿Qué le gusta de la ciudad?', '¿Qué hace en su tiempo libre?'],
  it: ['Salve, come si chiama?', 'Che cosa fa qui?', 'Di dov\'è lei?', 'Che cosa le piace della città?', 'Che cosa fa nel tempo libero?'],
};
const country = process.env.COUNTRY ?? 'it';
const qs = QUESTIONS[country];
if (!qs) throw new Error(`no questions for ${country}`);

const people = cities.filter((c) => !c.hidden).flatMap((c) =>
  (c.characters ?? []).filter((p) => p.here && c.places.some((x) => x.id === p.placeId && !x.hidden && x.characterId === p.id)).slice(0, 2).map((p) => ({ city: c, place: c.places.find((x) => x.id === p.placeId)!, here: p.here! })));
const chosen = process.env.PILOT ? people.slice(0, 2) : people.slice(0, 10);

const LEARNED = { type: 'object', properties: { person: { type: 'array', items: { type: 'object', properties: { what: { type: 'string' }, inHere: { type: 'boolean' } }, required: ['what', 'inHere'], additionalProperties: false } }, place: { type: 'array', items: { type: 'object', properties: { what: { type: 'string' }, inHere: { type: 'boolean' } }, required: ['what', 'inHere'], additionalProperties: false } }, contradicts: { type: 'string' } }, required: ['person', 'place', 'contradicts'], additionalProperties: false };
type Item = { what: string; inHere: boolean };
type L = { person: Item[]; place: Item[]; contradicts: string };

async function interview(p: typeof chosen[number]) {
  const him = characterForPlace(p.city, p.place)!;
  const t: Turn[] = [];
  const lines: string[] = [];
  const npc = async (learnerSaid?: string) => {
    const r = await runTurn({ character: him, transcript: [...t], learnerSaid });
    if (learnerSaid) t.push({ who: 'learner', transcript: learnerSaid });
    t.push({ who: 'npc', transcript: r.line, translation: r.en });
    lines.push(`${him.name}: ${r.line}\n  (${r.en})`);
  };
  await npc();
  for (const q of qs) { lines.push(`Learner: ${q}`); await npc(q); }
  const transcript = lines.join('\n');
  const prompt = [
    `An interview with ${him.name}, ${him.role} at ${p.place.name}, ${p.city.name}. The prompt he was given described him with this line:`, `"${p.here}"`, '', transcript, '',
    'List what a newcomer learns from his answers. person: things about him as a person (his life, habits, family, opinions, what he likes), not his job title. place: things about the place, the town or the country. Each one short, in English, with inHere true if that line already says it. contradicts: anything he says that contradicts his role or that line (a different job, age or past), or empty.',
  ].join('\n');
  const learned = JSON.parse(await ask(prompt, { schema: LEARNED, max: 2000 })) as L;
  console.log(`done ${him.name}`);
  return { name: him.name, role: him.role, where: `${p.place.name}, ${p.city.name}`, here: p.here, transcript, learned };
}

const out = await Promise.all(chosen.map(interview));
const mark = (xs: Item[]) => xs.map((x) => `- ${x.what}${x.inHere ? ' (in the here line)' : ''}`).join('\n') || '- nothing';
const count = (xs: Item[]) => `${xs.length} (${xs.filter((x) => !x.inHere).length} not in the here line)`;
const md = ['# H2: what we learn about them', '', ...out.flatMap((o) => [
  `## ${o.name}, ${o.role}, ${o.where}`, '', `Here line: "${o.here}"`, '', `About him: ${count(o.learned.person)}`, mark(o.learned.person), '', `About the place: ${count(o.learned.place)}`, mark(o.learned.place), '', `Contradicts: ${o.learned.contradicts || 'nothing'}`, '', '```', o.transcript, '```', '']),
].join('\n');
const dir = join(process.cwd(), 'tests', 'experiments', 'results');
mkdirSync(dir, { recursive: true });
const file = join(dir, `h2-${country}${process.env.PILOT ? '-pilot' : ''}-${new Date().toISOString().slice(0, 16).replace(':', '')}.md`);
writeFileSync(file, md);
for (const o of out) console.log(`${o.name}: about him ${count(o.learned.person)} · about the place ${count(o.learned.place)}${o.learned.contradicts ? ` · CONTRADICTS: ${o.learned.contradicts}` : ''}`);
console.log(`Time: ${((Date.now() - T0) / 1000).toFixed(0)} s\n→ ${file.replace(process.cwd() + '/', '')}`);
