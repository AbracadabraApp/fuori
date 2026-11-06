// One moment, many runs: does a character with nothing to sell bring up
// buying on its own? (Josh, 2026-11-06: "this drift is a app wide problem";
// "smaller tests that show promise before going broader".) The Teatro
// Massimo's costume maker opens a return visit at Beginner (stage 2), the
// moment where "Hai già il biglietto per stasera?" showed up; nothing the
// learner says can cause it. A judge answers one question per opening.
// Runs whatever content/it/prompts/dialogue.md says; swap the file to compare.
//   COUNTRY=it npx tsx --env-file=.env.local tests/experiments/role-drift.mts [runs]
import { cities } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';
import { runBeginnerTurn } from '@/lib/beginner';
import { STAGES, stageText } from '@/lib/path';
import { readPromptFile } from '@/lib/prompts/template';
import { ask } from './common.mjs';

const RUNS = Number(process.argv[2] ?? 10);
const city = cities.find((c) => c.id === 'palermo')!;
const character = characterForPlace(city, city.places.find((p) => p.id === 'teatro-massimo')!)!;
const memory = { visits: 1, lastVisit: new Date(Date.now() - 2 * 86_400_000), notes: ['Their name is Jake; from America, living in Palermo for a few months', 'Came by the costume workshop and asked about the theatre'] };

const JUDGE = `A character in a language game opens a conversation. Their role: ${character.role} at ${character.appearance.setting}. drift is true if, without being asked, the character brings up buying, tickets, prices or paying, or offers the person something their role doesn't give (a drink, a ride, a tour, a seat).`;
const schema = { type: 'object', additionalProperties: false, required: ['drift'], properties: { drift: { type: 'boolean' } } };

const lines = await Promise.all(Array.from({ length: RUNS }, async () => {
  const r = await runBeginnerTurn({ character, transcript: [], memory, stageText: stageText(STAGES.S2, character.role), maxAnswers: STAGES.S2.answers, withDone: true });
  const drift = (JSON.parse(await ask(`The opening:\n${r.line}`, { system: JUDGE, schema, max: 300 })) as { drift: boolean }).drift;
  return { line: r.line, drift };
}));
console.log(`dialogue.md ${readPromptFile('dialogue.md').version}: drift ${lines.filter((l) => l.drift).length}/${RUNS}`);
for (const l of lines.filter((x) => x.drift)) console.log(`  ${l.line.slice(0, 200)}`);
