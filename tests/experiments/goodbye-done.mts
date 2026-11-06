// Does their goodbye end the conversation? (Josh, 2026-11-06, after Beto the
// taxi driver in San Miguel: "Many conversation issues"; he said goodbye five
// times and Beto kept starting something new.) Replays Josh's conversation
// with Beto up to three of his lines: his goodbye, and two ordinary lines.
// Each is answered 5 times as a Beginner (stage 2) and 5 as Intermediate,
// through the server's own turn code. Counts done on the goodbye (want all)
// and on the ordinary lines (want none), and goodbye replies that ask or
// start something new (a judge; want none).
//   COUNTRY=es-mx npx tsx --env-file=.env.local tests/experiments/goodbye-done.mts
import { anthropic, TURN_MODEL, replyText } from '@/lib/claude';
import { cities } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';
import { runBeginnerTurn } from '@/lib/beginner';
import { runTurn } from '@/lib/turn';
import { STAGES, stageText } from '@/lib/path';
import type { Turn } from '@/lib/types';

const city = cities.find((c) => c.id === 'san-miguel-de-allende')!;
const place = city.places.find((p) => p.id === 'jardin-allende')!;
const beto = characterForPlace(city, place)!;

// Josh's conversation, 2026-11-06, as it went
const before: Turn[] = [
  { who: 'npc', transcript: 'Buenas tardes, bienvenido. Me llamo Beto. Soy taxista. ¿Cómo se llama usted?', translation: 'Good afternoon, welcome. My name is Beto. I’m a taxi driver. What is your name?' },
  { who: 'learner', transcript: 'Mi llamo Joshua.' },
  { who: 'npc', transcript: 'Mucho gusto, Joshua. Hoy hay mucha gente en el Jardín. ¿Quiere ir al Centro o a otra colonia?', translation: 'Nice to meet you, Joshua. Today there are lots of people in the Jardín. Do you want to go to the Centro or another neighborhood?' },
  { who: 'learner', transcript: 'No necesito un taxi, gracias.' },
  { who: 'npc', transcript: 'Está bien, Joshua. Sin problema. Hay familias, parejas y mariachis. ¿Le gusta el Jardín Allende?', translation: 'That’s fine, Joshua. No problem. There are families, couples and mariachis. Do you like the Jardín Allende?' },
];
const cases = [
  { said: 'Voy caminando, gracias. Beto, mucho gusto. Adiós.', goodbye: true },
  { said: 'Sí, me gusta. Tengo mucha hambre.', goodbye: false },
  { said: 'No necesito un taxi ahora, gracias.', goodbye: false },
];

async function newThing(line: string): Promise<boolean> {
  const r = await anthropic.messages.create({
    model: TURN_MODEL, max_tokens: 200, thinking: { type: 'between_tools' },
    system: 'You judge one line of dialogue. Reply with JSON: newThing.',
    messages: [{ role: 'user', content: `The other person has just said goodbye. The reply:\n${line}\n\nnewThing is true if the reply asks a question or starts a new topic instead of only saying goodbye back.` }],
    output_config: { format: { type: 'json_schema', schema: { type: 'object', additionalProperties: false, required: ['newThing'], properties: { newThing: { type: 'boolean' } } } } },
  } as Parameters<typeof anthropic.messages.create>[0]);
  return (JSON.parse(replyText(r as Parameters<typeof replyText>[0])) as { newThing: boolean }).newThing;
}

const runs = await Promise.all(cases.flatMap((c) => [true, false].flatMap((beginner) => Array.from({ length: 5 }, async () => {
  const r = beginner
    ? await runBeginnerTurn({ character: beto, transcript: before, learnerSaid: c.said, stageText: stageText(STAGES.S2, beto.role), maxAnswers: STAGES.S2.answers, withDone: true })
    : await runTurn({ character: beto, transcript: before, learnerSaid: c.said, withDone: true });
  return { ...c, beginner, line: r.line, done: r.done === true, newThing: c.goodbye ? await newThing(r.line) : false };
}))));

for (const level of [true, false]) {
  const rs = runs.filter((r) => r.beginner === level);
  const bye = rs.filter((r) => r.goodbye);
  const other = rs.filter((r) => !r.goodbye);
  console.log(`${level ? 'Beginner' : 'Intermediate'}: done on goodbye ${bye.filter((r) => r.done).length}/${bye.length} · done on other lines ${other.filter((r) => r.done).length}/${other.length} · goodbye replies starting something new ${bye.filter((r) => r.newThing).length}/${bye.length}`);
  for (const r of bye) console.log(`   bye${r.done ? '' : ' (not done)'}${r.newThing ? ' (new thing)' : ''}: ${r.line}`);
  for (const r of other.filter((x) => x.done)) console.log(`   DONE on "${r.said}": ${r.line}`);
}
