// Every person in a city, at the Beginner level: their opening turn and a
// reply to "Ciao! Cosa fa qui?"-style small talk in the learned language, to
// check nobody is handed an invented job (Josh, 2026-10-27: a student sold him
// pizza, a woman in a square made him coffee). Read the output by eye.
//   npx tsx --env-file=.env.local tests/experiments/beginner-cast.mts <city id> "<learner's line>"
import { cities } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';
import { runBeginnerTurn } from '@/lib/beginner';

const [cityId, said] = process.argv.slice(2);
const city = cities.find((c) => c.id === cityId);
if (!city || !said) throw new Error('usage: <city id> "<learner line>"');
const people = city.places.filter((pl) => !pl.hidden && pl.characterId).map((pl) => ({ place: pl, character: characterForPlace(city, pl)! })).filter((x) => x.character);
const runs = await Promise.all(people.map(async ({ place, character }) => {
  const first = await runBeginnerTurn({ character, transcript: [] });
  const second = await runBeginnerTurn({ character, transcript: [{ who: 'npc', transcript: first.line }], learnerSaid: said });
  return `## ${character.name}, ${character.role} — ${place.name} (${place.kind})\n${character.appearance?.setting}\n\n- ${first.line}\n- **Learner:** ${said}\n- ${second.line}\n`;
}));
console.log(runs.join('\n'));
