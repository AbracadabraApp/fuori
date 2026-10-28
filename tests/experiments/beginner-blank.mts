// Beginner answers about the learner: left blank (…) or made up? Josh,
// 2026-10-27: "Sono di Londra is always the example; it should be blank like
// mi chiamo". The character has just learned the name; what does it offer
// as the answer to its next question? N runs per person.
//   npx tsx --env-file=.env.local tests/experiments/beginner-blank.mts [runs]
import { cities } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';
import { runBeginnerTurn } from '@/lib/beginner';

const runs = Number(process.argv[2] ?? 4);
const picks = [['roma-nuova', 'bar-mattina-nuova'], ['roma-nuova', 'sapienza-scalinata'], ['napoli', 'mercato-pignasecca'], ['torino', 'piazza-castello']];
let blank = 0, invented = 0, other = 0;
for (const [cityId, placeId] of picks) {
  const city = cities.find((c) => c.id === cityId)!;
  const place = city.places.find((p) => p.id === placeId);
  if (!place) continue;
  const character = characterForPlace(city, place)!;
  const results = await Promise.all(Array.from({ length: runs }, () => runBeginnerTurn({ character, transcript: [{ who: 'npc', transcript: 'Buongiorno! Mi chiamo ' + character.name.split(' ')[0] + '. Come si chiama?' }], learnerSaid: 'Mi chiamo Joshua.' })));
  for (const r of results) {
    const answers = r.parts.filter((p) => p.kind === 'answer').map((p) => p.text);
    const about = answers.filter((a) => /^(Sono|Vengo|Abito|Vivo|Lavoro|Faccio|Mi piace|Ho)\b/i.test(a));
    if (!about.length) { other++; continue; }
    if (about.some((a) => a.includes('…') || a.includes('...'))) blank++; else invented++;
    console.log(`${character.name}: ${answers.join(' | ')}`);
  }
}
console.log(`\nanswers about the learner: blank ${blank}, made up ${invented} (turns asking something else: ${other})`);
