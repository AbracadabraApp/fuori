// Does a barista keep the errand in order, and tell something of their own
// place rather than the customs every bar repeats? (Josh, 2026-11-06,
// "Coffee dialogue in Florence": Tommaso at Ditta Artigianale said he was
// making the coffee, then "you pay at the till first, then bring the
// receipt", then asked for a receipt Josh never got and handed the macchiato
// over anyway; Josh: "perché ogni bar ha detto le stesse cose?" and "perché
// non cominciare alla cassa?".) Plays each case 10 times as a Beginner
// (stage 1, as Josh played) and as Intermediate, through the server's own
// turn code; a judge reads the conversation so far and the reply.
//   incoherent: the reply's steps contradict each other or what came before (want none)
//   generic: the reply tells a custom newcomers hear at every bar or café in the country (want none)
//   COUNTRY=it npx tsx --env-file=.env.local tests/experiments/bar-errand.mts
//   COUNTRY=es-mx npx tsx --env-file=.env.local tests/experiments/bar-errand.mts
import { anthropic, TURN_MODEL, replyText } from '@/lib/claude';
import { cities, pack } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';
import { runBeginnerTurn } from '@/lib/beginner';
import { runTurn } from '@/lib/turn';
import { STAGES, stageText } from '@/lib/path';
import type { Turn } from '@/lib/types';

const where = pack.id === 'it'
  ? { city: 'firenze', place: 'ditta-artigianale-nuova' }
  : { city: 'san-miguel-de-allende', place: 'cafe-de-la-calzada' };
const city = cities.find((c) => c.id === where.city)!;
const character = characterForPlace(city, city.places.find((p) => p.id === where.place)!)!;

// Josh's conversation, 2026-11-06, up to his macchiato order (Italy); the same moment in a café (Mexico)
const mid: Turn[] = pack.id === 'it'
  ? [
    { who: 'npc', transcript: 'This bar is all about speciality coffee, and we make each espresso slowly and carefully. Buongiorno! Benvenuto! Vuole un caffè o un cappuccino?', translation: '' },
    { who: 'learner', transcript: 'Oh, vuole un caffè, por favore?' },
    { who: 'npc', transcript: 'Un caffè, perfetto! Here you can sit down or drink it standing at the counter. Lo beve al banco o al tavolo?', translation: '' },
    { who: 'learner', transcript: 'Al banco, grazie.' },
    { who: 'npc', transcript: 'Al banco, perfetto! Macino i chicchi adesso. Lo vuole nero o macchiato?', translation: '' },
  ]
  : [
    { who: 'npc', transcript: '¡Buenos días! Bienvenido. ¿Qué le preparo?', translation: '' },
    { who: 'learner', transcript: 'Un café, por favor.' },
    { who: 'npc', transcript: 'Un café, muy bien. Muelo el café ahora. ¿Lo quiere americano o de olla?', translation: '' },
  ];
const cases = [
  { name: 'opening', transcript: [] as Turn[], said: undefined },
  { name: 'order', transcript: mid, said: pack.id === 'it' ? 'Macchiato, per favore.' : 'De olla, por favor.' },
];

async function judge(transcript: Turn[], said: string | undefined, line: string) {
  const so = transcript.map((t) => `${t.who === 'npc' ? 'Barista' : 'Customer'}: ${t.transcript}`).concat(said ? [`Customer: ${said}`] : []).join('\n');
  const r = await anthropic.messages.create({
    model: TURN_MODEL, max_tokens: 300, thinking: { type: 'between_tools' },
    system: 'You judge one reply in a conversation at a coffee bar. Reply with JSON: incoherent, generic, why (one sentence).',
    messages: [{ role: 'user', content: `The conversation so far:\n${so || '(none: this is the opening)'}\n\nThe barista's reply:\n${line}\n\nincoherent is true only if the reply contradicts itself or what came before about the order of things: for example the coffee is being made or handed over and then the customer is told they must pay first, or the barista asks for something the customer never had a chance to get (a receipt). Handing a coffee over quickly is not incoherent.\ngeneric is true if the reply tells the customer a custom that newcomers hear at nearly every bar or café in the country (how ordering or paying works at bars in general, what people drink at what time of day, standing versus sitting), rather than something about this particular place, its coffee or the barista.` }],
    output_config: { format: { type: 'json_schema', schema: { type: 'object', additionalProperties: false, required: ['incoherent', 'generic', 'why'], properties: { incoherent: { type: 'boolean' }, generic: { type: 'boolean' }, why: { type: 'string' } } } } },
  } as Parameters<typeof anthropic.messages.create>[0]);
  return JSON.parse(replyText(r as Parameters<typeof replyText>[0])) as { incoherent: boolean; generic: boolean; why: string };
}

const runs = await Promise.all(cases.flatMap((c) => [true, false].flatMap((beginner) => Array.from({ length: 10 }, async () => {
  const r = beginner
    ? await runBeginnerTurn({ character, transcript: c.transcript, learnerSaid: c.said, stageText: stageText(STAGES.S1, character.role), maxAnswers: STAGES.S1.answers, withDone: true })
    : await runTurn({ character, transcript: c.transcript, learnerSaid: c.said, withDone: true });
  return { case: c.name, beginner, line: r.line, ...(await judge(c.transcript, c.said, r.line)) };
}))));

for (const level of [true, false]) {
  const rs = runs.filter((r) => r.beginner === level);
  console.log(`[${pack.id}] ${level ? 'Beginner' : 'Intermediate'}: incoherent ${rs.filter((r) => r.incoherent).length}/${rs.length} · generic custom ${rs.filter((r) => r.generic).length}/${rs.length}`);
  for (const r of rs.filter((x) => x.incoherent || x.generic)) console.log(`   ${r.incoherent ? 'INCOHERENT ' : ''}${r.generic ? 'GENERIC ' : ''}(${r.case}) ${r.line}\n      ${r.why}`);
}
