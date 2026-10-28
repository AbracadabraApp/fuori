// Italy's shown cast, city by city (Josh, 2026-10-27): a `here` line for
// everyone, and the cast rebalanced where a city is off on sex, age or
// background. Proposes changes as JSON for review; scripts/apply is separate.
// Targets (Josh's points, Claude's numbers): about half women; ages as in city
// life, not the national median (2–3 under 30, 1–2 over 60 in about 10);
// residents of foreign origin roughly in proportion to the city, in ordinary
// roles. People who already have a `here` line are kept as they are.
//   npx tsx --env-file=.env.local tests/experiments/cast-rebalance.mts <out dir> [city ids…]
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { anthropic, CLAUDE_MODEL, replyText } from '@/lib/claude';
import { packs } from '@/content';

const [out, ...only] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const it = packs.it as any;

const schema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    people: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          id: { type: 'string' },
          change: { type: 'boolean' },
          name: { type: 'string' },
          gender: { type: 'string', enum: ['f', 'm'] },
          age: { type: 'integer' },
          role: { type: 'string' },
          personality: { type: 'array', items: { type: 'string' } },
          background: { type: 'string' },
          portraitPrompt: { type: 'string' },
          here: { type: 'string' },
          why: { type: 'string' },
        },
        required: ['id', 'change', 'name', 'gender', 'age', 'role', 'personality', 'background', 'portraitPrompt', 'here', 'why'],
      },
    },
    note: { type: 'string' },
  },
  required: ['people', 'note'],
};

const SYSTEM = `You help cast a language-learning game set in today's Italy. A newcomer who has come to live in a city meets the people at its places: about ten places per city, one person each. For one city you get its shown places and their people. For each person, return:

- here: one or two sentences, said to them in the second person, on why they're at this place today and what they do there, with what's special about this place or this city in it (a dish, a product, a habit, a bit of the place's story) so a conversation can be about it. Only facts you're sure of; for a real business, only what it's well known for. No invented history.
- change: whether you changed the person. Change someone only to meet the targets below; otherwise keep name, sex, age, role, background and portraitPrompt exactly as given (you may still fill out personality to three traits).

Targets for the city's cast as a whole:
- Sex: about half women. Where you change someone's sex to get there, prefer roles that are often men in this cast (owners, chefs) so women run things too.
- Age: the people you'd meet out and about in a city, not the national average: about 2 or 3 under 30 (students, baristas, waiters, shop staff), most between 30 and 59, and 1 or 2 over 60 (an old shopkeeper, a pensioner on a bench). Not everyone between 40 and 59.
- Background: residents of foreign origin, roughly in proportion to this city (big northern and central cities about 1 in 7 to 1 in 5; Rome about 1 in 8; small southern towns fewer, maybe none), from the communities that really live there (Romanian, Albanian, Moroccan, Chinese, Ukrainian, Filipino, Bangladeshi, Egyptian, Indian, Senegalese, Peruvian, Sri Lankan, Tunisian…). Some born in Italy. In ordinary roles, not only the stereotyped ones. A realistic name for their background.
- Make as few changes as reach the targets. Never change a person whose "keep" is true.

When you change someone: the role stays a job that fits the place, in Italian (barista, farmacista, studentessa); personality three short traits; background one short phrase ("born in Turin to Moroccan parents", "Bolognese", "from Bucharest, here 12 years"); portraitPrompt rewritten for the new person in exactly the same style and wording pattern as the original (same medium, colours, phrasing, ending), describing the new person. Keep the id. why: one short line on why you changed them (empty if not changed). note: one line on the city's cast after your changes.`;

for (const c of it.cities as any[]) {
  if (c.hidden || (only.length && !only.includes(c.id))) continue;
  const people = c.places
    .filter((pl: any) => !pl.hidden && pl.characterId && pl.characterId !== it.tutor.id)
    .map((pl: any) => {
      const ch = c.characters.find((x: any) => x.id === pl.characterId);
      return ch && { id: ch.id, keep: !!ch.here, place: `${pl.name} (${pl.kind}), ${pl.neighbourhood}${pl.real ? ', a real business or place' : ''}`, scene: pl.imagePrompt, name: ch.name, gender: ch.gender, age: ch.age, role: ch.role, personality: ch.personality, portraitPrompt: ch.portraitPrompt, here: ch.here ?? '' };
    })
    .filter(Boolean);
  const user = `City: ${c.name} (${c.region ?? ''}). Food: ${(c.food ?? []).join(', ')}. Customs: ${(c.customs ?? []).join('; ')}.\n\nPeople:\n${JSON.stringify(people, null, 1)}`;
  const t0 = Date.now();
  const r = await anthropic.messages.create({ model: CLAUDE_MODEL, max_tokens: 16000, system: SYSTEM, messages: [{ role: 'user', content: user }], output_config: { format: { type: 'json_schema', schema } } } as any);
  const res = JSON.parse(replyText(r));
  writeFileSync(join(out, `${c.id}.json`), JSON.stringify({ city: c.id, before: people, ...res }, null, 2));
  const changed = res.people.filter((p: any) => p.change);
  console.log(`${c.id}: ${changed.length} changed (${((Date.now() - t0) / 1000).toFixed(0)} s). ${res.note}`);
  for (const p of changed) console.log(`   ${p.id}: ${p.name}, ${p.gender}, ${p.age}, ${p.role}, ${p.background} — ${p.why}`);
}
