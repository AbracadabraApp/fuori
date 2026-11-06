// Two moments where a character invented an errand on its own (Josh,
// 2026-11-06: "this drift is a app wide problem"; "I would pick 3 very
// different approaches. None of them long."): Carla, a mum in the Orto de'
// Pecci, offered "un caffè o una passeggiata" after the learner said they like
// Siena; Beto, a taxi driver, took a torta order after "I'm very hungry".
// Beginner (stage 2), the same moment each run; a judge answers one question.
// The approach is set from outside: the shell swaps dialogue.md or beginner.md
// for the rule and the cut; FACT=1 adds what's sold to the setting.
//   COUNTRY=it|es-mx FACT=1 npx tsx --env-file=.env.local tests/experiments/invented-errand.mts [runs]
import { cities, pack } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';
import { runBeginnerTurn } from '@/lib/beginner';
import { STAGES, stageText } from '@/lib/path';
import type { CharacterSheet, Turn } from '@/lib/types';
import { ask } from './common.mjs';

const RUNS = Number(process.argv[2] ?? 10);
const fact = process.env.FACT === '1';
const moment = pack.id === 'it'
  ? { city: 'siena', place: 'orto-de-pecci', sold: 'Nothing is sold here.',
      transcript: [{ who: 'npc', transcript: "Fog today, but the children still want to run around the park. Buongiorno! Io sono Carla. Oggi c'è molta nebbia. Come si chiama Lei?", translation: '' }, { who: 'learner', transcript: 'Mi chiamo Sam. Piacere!' }, { who: 'npc', transcript: 'Piacere, Sam! Questi sono i miei bambini. Le piace Siena?', translation: '' }] as Turn[],
      said: 'Sì, mi piace Siena! È molto bello, ma io non parlo bene italiano.' }
  : { city: 'san-miguel-de-allende', place: 'jardin-allende', sold: 'The only thing you sell is taxi rides.',
      transcript: [{ who: 'npc', transcript: 'Buenas tardes, bienvenido. Me llamo Beto. Soy taxista. ¿Cómo se llama usted?', translation: '' }, { who: 'learner', transcript: 'Mi llamo Joshua.' }, { who: 'npc', transcript: 'Mucho gusto, Joshua. Hoy hay mucha gente en el Jardín. ¿Le gusta el Jardín Allende?', translation: '' }] as Turn[],
      said: "Si me gusta. I'm very hungry" };
const city = cities.find((c) => c.id === moment.city)!;
const base = characterForPlace(city, city.places.find((p) => p.id === moment.place)!)!;
const character: CharacterSheet = fact ? { ...base, appearance: { ...base.appearance, setting: `${base.appearance.setting} ${moment.sold}` } } : base;

const JUDGE = `A character in a language game replies. Their role: ${base.role}, at ${base.appearance.setting}. errand is true if the reply offers, sells, serves or takes an order for something their role doesn't give (food, a drink, a ticket, a tour), or asks how they'd like such a thing. Pointing them to where they can get it is not an errand.`;
const schema = { type: 'object', additionalProperties: false, required: ['errand'], properties: { errand: { type: 'boolean' } } };

const runs = await Promise.all(Array.from({ length: RUNS }, async () => {
  const r = await runBeginnerTurn({ character, transcript: moment.transcript, learnerSaid: moment.said, stageText: stageText(STAGES.S2, base.role), maxAnswers: STAGES.S2.answers, withDone: true });
  const errand = (JSON.parse(await ask(`The reply:\n${r.line}`, { system: JUDGE, schema, max: 2000 })) as { errand: boolean }).errand;
  return { line: r.line, errand };
}));
console.log(`${base.name}${fact ? ' (fact)' : ''}: errand ${runs.filter((x) => x.errand).length}/${RUNS}`);
for (const x of runs) console.log(`  ${x.errand ? "ERRAND" : "ok    "} ${x.line.slice(0, 220)}`);
