// Does a character take an order its job can't fill? (Josh, 2026-11-06:
// Beto the taxi driver in San Miguel took his torta order, "¿Quiere la torta
// con queso o con jamón?"; Josh: "¿Por qué estás tomando mi orden?", then
// "And the torta".) Replays Josh's conversation up to "I'm very hungry" and
// up to "Torta, por favor", 10 times each as a Beginner (stage 2) and as
// Intermediate, through the server's own turn code; a judge says whether
// the reply serves, sells or takes an order for something a taxi driver
// doesn't give (want none).
//   COUNTRY=es-mx npx tsx --env-file=.env.local tests/experiments/job-drift.mts
import { anthropic, TURN_MODEL, replyText } from '@/lib/claude';
import { cities } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';
import { runBeginnerTurn } from '@/lib/beginner';
import { runTurn } from '@/lib/turn';
import { STAGES, stageText } from '@/lib/path';
import type { Turn } from '@/lib/types';

const city = cities.find((c) => c.id === 'san-miguel-de-allende')!;
const beto = characterForPlace(city, city.places.find((p) => p.id === 'jardin-allende')!)!;

// Josh's conversation, 2026-11-06, as it went
const opening: Turn[] = [
  { who: 'npc', transcript: 'Buenas tardes, bienvenido. Me llamo Beto. Soy taxista. ¿Cómo se llama usted?', translation: 'Good afternoon, welcome. My name is Beto. I’m a taxi driver. What is your name?' },
  { who: 'learner', transcript: 'Mi llamo Joshua.' },
  { who: 'npc', transcript: 'Mucho gusto, Joshua. Hoy hay mucha gente en el Jardín. ¿Quiere ir al Centro o a otra colonia?', translation: 'Nice to meet you, Joshua. Today there are lots of people in the Jardín. Do you want to go to the Centro or another neighborhood?' },
  { who: 'learner', transcript: 'No necesito un taxi, gracias.' },
  { who: 'npc', transcript: 'Está bien, Joshua. Sin problema. Hay familias, parejas y mariachis. ¿Le gusta el Jardín Allende?', translation: 'That’s fine, Joshua. No problem. There are families, couples and mariachis. Do you like the Jardín Allende?' },
];
const hungry = { transcript: opening, said: "Si me gusta. I'm very hungry" };
const torta = {
  transcript: [...opening,
    { who: 'learner' as const, transcript: "Si me gusta. I'm very hungry" },
    { who: 'npc' as const, transcript: '¡Qué bien! Yo también tengo hambre. Hay tacos cerca del Jardín. ¿Quiere comer tacos o una torta?', translation: 'Great! I’m hungry too. There are tacos near the Jardín. Do you want to eat tacos or a torta?' },
  ],
  said: 'Torta por favor.',
};

async function serves(line: string): Promise<boolean> {
  const r = await anthropic.messages.create({
    model: TURN_MODEL, max_tokens: 200, thinking: { type: 'between_tools' },
    system: 'You judge one line of dialogue. Reply with JSON: serves.',
    messages: [{ role: 'user', content: `The speaker is a taxi driver at a taxi stand. Their line:\n${line}\n\nserves is true if the line acts as if the taxi driver serves, sells or takes an order for food (asks how they want it, what's in it, offers to bring it). Telling them where to get food, or offering a ride there, is not serving.` }],
    output_config: { format: { type: 'json_schema', schema: { type: 'object', additionalProperties: false, required: ['serves'], properties: { serves: { type: 'boolean' } } } } },
  } as Parameters<typeof anthropic.messages.create>[0]);
  return (JSON.parse(replyText(r as Parameters<typeof replyText>[0])) as { serves: boolean }).serves;
}

const runs = await Promise.all([hungry, torta].flatMap((c) => [true, false].flatMap((beginner) => Array.from({ length: 10 }, async () => {
  const r = beginner
    ? await runBeginnerTurn({ character: beto, transcript: c.transcript, learnerSaid: c.said, stageText: stageText(STAGES.S2, beto.role), maxAnswers: STAGES.S2.answers, withDone: true })
    : await runTurn({ character: beto, transcript: c.transcript, learnerSaid: c.said, withDone: true });
  return { said: c.said, beginner, line: r.line, serves: await serves(r.line) };
}))));

for (const level of [true, false]) {
  const rs = runs.filter((r) => r.beginner === level);
  console.log(`${level ? 'Beginner' : 'Intermediate'}: serves food ${rs.filter((r) => r.serves).length}/${rs.length}`);
  for (const r of rs) console.log(`   ${r.serves ? 'SERVES' : 'ok    '} "${r.said}" → ${r.line}`);
}
