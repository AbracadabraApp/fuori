// Does a reason to be there (`here`, lib/characters/for-place.ts) make
// Mexico's people better? Josh, 2026-10-30: "run tests on Mexico getting here
// lines". Italy's whole cast got one (cast-rebalance.mts) after invented jobs
// (a student selling pizza); 11 of Mexico's 65 have one. For every shown
// Mexico person without one: write a candidate line (same instruction as
// Italy's), then play the opening and a reply to the learner's question, with
// and without it, at Beginner (lib/beginner.ts) and Intermediate (lib/turn.ts).
// A blind judge compares each pair. Nothing is written to content.
//   COUNTRY=es-mx npx tsx --env-file=<keys> tests/experiments/mexico-here-trial.mts <out dir>
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { anthropic, CLAUDE_MODEL, replyText } from '@/lib/claude';
import { cities, tutor } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';
import { runBeginnerTurn } from '@/lib/beginner';
import { runTurn } from '@/lib/turn';

const [out] = process.argv.slice(2);
if (!out) throw new Error('usage: <out dir>');
mkdirSync(out, { recursive: true });
const LEARNER = 'Hola. ¿Qué haces aquí?';

const HERE = `You help cast a language-learning game set in today's Mexico. A newcomer who has come to live in a city meets the people at its places, one person each. For each person given, write "here": one or two sentences, said to them in the second person, on why they're at this place today and what they do there, with what's special about this place or this city in it (a dish, a product, a habit, a bit of the place's story) so a conversation can be about it. Only facts you're sure of; for a real business, only what it's well known for. No invented history. Keep their role as given.`;

const hereSchema = {
  type: 'object', additionalProperties: false, required: ['people'],
  properties: { people: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['id', 'here'], properties: { id: { type: 'string' }, here: { type: 'string' } } } } },
};

const JUDGE = `You compare two versions of the same character in a language-learning game set in Mexico, meeting a newcomer who lives there now. Each version is the character's opening line and their reply to the learner asking what they're doing there, at two levels (Beginner: English set-up, then Spanish to learn; Intermediate: Spanish). The versions are labelled A and B in random order. For each version say:
- invented: true if the character claims a job, errand or reason that doesn't fit their place or their role (a customer serving, a student selling), or contradicts itself.
- specific: true if the conversation has something particular to this place or city to talk about (a dish, a product, a habit, the place's story), beyond a greeting and generic small talk.
Then pick better: which version a newcomer would learn more from and enjoy more, "A", "B" or "same", with one short line why.`;

const judgeSchema = {
  type: 'object', additionalProperties: false, required: ['A', 'B', 'better', 'why'],
  properties: {
    A: { type: 'object', additionalProperties: false, required: ['invented', 'specific'], properties: { invented: { type: 'boolean' }, specific: { type: 'boolean' } } },
    B: { type: 'object', additionalProperties: false, required: ['invented', 'specific'], properties: { invented: { type: 'boolean' }, specific: { type: 'boolean' } } },
    better: { type: 'string', enum: ['A', 'B', 'same'] },
    why: { type: 'string' },
  },
};

async function json(system: string, user: string, schema: object, max = 8000) {
  const r = await anthropic.messages.create({ model: CLAUDE_MODEL, max_tokens: max, system, messages: [{ role: 'user', content: user }], output_config: { format: { type: 'json_schema', schema } } } as any);
  return JSON.parse(replyText(r));
}

async function play(character: any) {
  const b1 = await runBeginnerTurn({ character, transcript: [] });
  const b2 = await runBeginnerTurn({ character, transcript: [{ who: 'npc', transcript: b1.line }], learnerSaid: LEARNER } as any);
  const i1 = await runTurn({ character, transcript: [] } as any);
  const i2 = await runTurn({ character, transcript: [{ who: 'npc', transcript: i1.line }] as any, learnerSaid: LEARNER } as any);
  return `Beginner:\n- ${b1.line}\n- Learner: ${LEARNER}\n- ${b2.line}\n\nIntermediate:\n- ${i1.line}\n- Learner: ${LEARNER}\n- ${i2.line}`;
}

const rows: any[] = [];
await Promise.all(cities.filter((c: any) => !c.hidden).map(async (city: any) => {
  const people = city.places
    .filter((pl: any) => !pl.hidden && pl.characterId && pl.characterId !== tutor?.id)
    .map((pl: any) => ({ place: pl, ch: city.characters.find((x: any) => x.id === pl.characterId) }))
    .filter((x: any) => x.ch && !x.ch.here);
  if (!people.length) return;
  const asked = people.map(({ place, ch }: any) => ({ id: ch.id, place: `${place.name} (${place.kind}), ${place.neighbourhood}${place.real ? ', a real business or place' : ''}`, name: ch.name, role: ch.role, personality: ch.personality }));
  const lines = await json(HERE, `City: ${city.name}. Food: ${(city.food ?? []).join(', ')}. Customs: ${(city.customs ?? []).join('; ')}.\n\nPeople:\n${JSON.stringify(asked, null, 1)}`, hereSchema);
  await Promise.all(people.map(async ({ place, ch }: any) => {
    const here = lines.people.find((p: any) => p.id === ch.id)?.here;
    if (!here) return;
    const without = characterForPlace(city, place)!;
    const withCity = { ...city, characters: city.characters.map((x: any) => (x.id === ch.id ? { ...x, here } : x)) };
    const withHere = characterForPlace(withCity, place)!;
    const [plain, given] = await Promise.all([play(without), play(withHere)]);
    const flip = Math.random() < 0.5;
    const [A, B] = flip ? [given, plain] : [plain, given];
    const v = await json(JUDGE, `Character: ${ch.name}, ${ch.role}, at ${place.name} (${place.kind}), ${city.name}.\n\nVersion A:\n${A}\n\nVersion B:\n${B}`, judgeSchema, 2000);
    const pick = (k: 'A' | 'B') => ((k === 'A') === flip ? 'here' : 'plain');
    rows.push({ city: city.id, id: ch.id, name: ch.name, role: ch.role, place: place.name, here, plain, given,
      invented: { here: v[flip ? 'A' : 'B'].invented, plain: v[flip ? 'B' : 'A'].invented },
      specific: { here: v[flip ? 'A' : 'B'].specific, plain: v[flip ? 'B' : 'A'].specific },
      better: v.better === 'same' ? 'same' : pick(v.better), why: v.why });
    process.stdout.write('.');
  }));
}));

const n = rows.length;
const count = (f: (r: any) => boolean) => rows.filter(f).length;
const summary = `${n} Mexico people without a reason to be there, each played with and without one (Beginner and Intermediate, opening and a reply to "${LEARNER}")
invented a job or reason: without ${count((r) => r.invented.plain)}, with ${count((r) => r.invented.here)}
something specific to talk about: without ${count((r) => r.specific.plain)}, with ${count((r) => r.specific.here)}
judge's pick: with ${count((r) => r.better === 'here')}, without ${count((r) => r.better === 'plain')}, same ${count((r) => r.better === 'same')}`;
writeFileSync(join(out, 'rows.json'), JSON.stringify(rows, null, 2));
writeFileSync(join(out, 'summary.txt'), summary);
console.log(`\n${summary}`);
