// Cultural lessons, made ahead (docs/culture.md → Cultural lessons; content/
// <country>/prompts/culture.md). For each first-screen city: one call picks
// cultural items told by its shown people (Claude's own knowledge: the city
// files' lists proved generic, docs/culture.md → Tests); the fact judge checks
// them; failures get one fix and one recheck; what still fails is dropped (the
// bounded pass the doc decided). Then one call chooses the country's first set.
// Writes content/<country>/culture.json.
//   COUNTRY=it npx tsx --env-file=.env.local scripts/make-culture.mts [items per city, default 4] [set size, default 6]
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { anthropic, CLAUDE_MODEL, replyText } from '@/lib/claude';
import { cities, language, pack } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';
import { readPromptFile, fill } from '@/lib/prompts/template';

const perCity = Number(process.argv[2] ?? 4);
const setSize = Number(process.argv[3] ?? 6);
const f = readPromptFile('culture.md');

async function ask<T>(system: string, content: string, schema: object, max = 6000): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      const r = await anthropic.messages.create({ model: CLAUDE_MODEL, max_tokens: max, system, messages: [{ role: 'user', content }], output_config: { format: { type: 'json_schema', schema } } } as Parameters<typeof anthropic.messages.create>[0]);
      return JSON.parse(replyText(r as Parameters<typeof replyText>[0])) as T;
    } catch (e) {
      const status = (e as { status?: number }).status ?? 0;
      if (attempt >= 3 || (status && status !== 429 && status < 500)) throw e;
      await new Promise((res) => setTimeout(res, 3000 * (attempt + 1)));
    }
  }
}

const str = { type: 'string' };
const wordSchema = { type: 'object', additionalProperties: false, required: ['said', 'en'], properties: { said: str, en: str } };
const itemSchema = { type: 'object', additionalProperties: false, required: ['chip', 'teller', 'topic', 'facts', 'words'], properties: { chip: { type: 'string', pattern: '^\\S+(\\s+\\S+){0,3}$' }, teller: str, topic: { type: 'string', enum: ['food', 'history', 'traditions', 'art', 'rivalry'] }, facts: str, words: { type: 'array', items: wordSchema } } };
const pickSchema = { type: 'object', additionalProperties: false, required: ['items'], properties: { items: { type: 'array', items: itemSchema } } };
const factSchema = { type: 'object', additionalProperties: false, required: ['items'], properties: { items: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['chip', 'pass', 'doubts'], properties: { chip: str, pass: { type: 'boolean' }, doubts: { type: 'array', items: str } } } } } };
const fixSchema = { type: 'object', additionalProperties: false, required: ['items'], properties: { items: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['chip', 'facts'], properties: { chip: str, facts: str } } } } };
const chooseSchema = { type: 'object', additionalProperties: false, required: ['ids'], properties: { ids: { type: 'array', items: str } } };

type Picked = { chip: string; teller: string; topic: string; facts: string; words: { said: string; en: string }[] };
export type CultureItem = Picked & { id: string; cityId: string; placeId: string };

const slug = (s: string) => s.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const judge = (items: { chip: string; facts: string }[]) => ask<{ items: { chip: string; pass: boolean; doubts: string[] }[] }>(f.block('Facts'), JSON.stringify(items), factSchema, 4000);

const firstScreen = cities.filter((c) => !c.hidden && !c.more);
const log: string[] = [];
const perCityItems = await Promise.all(firstScreen.map(async (city) => {
  const people = city.places.filter((p) => !p.hidden && p.characterId && p.characterId !== pack.tutor.id).map((place) => ({ place, person: characterForPlace(city, place)! })).filter((x) => x.person);
  const list = people.map(({ place, person }) => `- ${person.id}: ${person.name}, ${person.age}, ${person.role}, at ${person.appearance?.setting ?? place.name}`).join('\n');
  const picked = (await ask<{ items: Picked[] }>(fill(f.block('Pick'), { city: city.name, language: language.name, count: String(perCity) }), `People:\n${list}`, pickSchema)).items
    .filter((it) => people.some((p) => p.person.id === it.teller));
  // Judge once; fix the failures once; recheck them once; drop what still fails
  const first = await judge(picked);
  const failed = picked.filter((it) => !first.items.find((c) => c.chip === it.chip)?.pass);
  let fixedOk: Picked[] = [];
  if (failed.length) {
    const fixed = (await ask<{ items: { chip: string; facts: string }[] }>(f.block('Fix'), JSON.stringify(failed.map((it) => ({ chip: it.chip, facts: it.facts, doubts: first.items.find((c) => c.chip === it.chip)?.doubts ?? [] }))), fixSchema, 4000)).items;
    const again = await judge(fixed);
    fixedOk = failed.flatMap((it) => {
      const fx = fixed.find((x) => x.chip === it.chip);
      return fx && again.items.find((c) => c.chip === it.chip)?.pass ? [{ ...it, facts: fx.facts }] : [];
    });
  }
  const kept = [...picked.filter((it) => !failed.includes(it)), ...fixedOk];
  log.push(`${city.id}: picked ${picked.length}, passed ${picked.length - failed.length}, fixed ${fixedOk.length}, dropped ${failed.length - fixedOk.length}`);
  return kept.map((it): CultureItem => ({ ...it, id: `${city.id}-${slug(it.chip)}`, cityId: city.id, placeId: people.find((p) => p.person.id === it.teller)!.place.id }));
}));

const items = perCityItems.flat();
const chosen = (await ask<{ ids: string[] }>(fill(f.block('Choose'), { count: String(setSize) }), JSON.stringify(items.map(({ id, cityId, chip, topic, facts }) => ({ id, city: cityId, chip, topic, facts }))), chooseSchema, 2000)).ids
  .filter((id, i, all) => items.some((it) => it.id === id) && all.indexOf(id) === i).slice(0, setSize);

writeFileSync(join(process.cwd(), 'content', pack.id, 'culture.json'), JSON.stringify({ version: new Date().toISOString().slice(0, 10), prompt: f.version, set: chosen, items }, null, 2) + '\n');
console.log(`[${pack.id}] ${log.join(' · ')}\nset: ${chosen.join(', ')}`);
