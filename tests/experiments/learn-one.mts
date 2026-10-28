// The Learn page for one conversation, printed: corrections and words. For
// checking a Learn prompt change on a real conversation.
//   npx tsx --env-file=.env.local tests/experiments/learn-one.mts <city id> <place id> <turns.json> [runs]
import { readFileSync } from 'node:fs';
import { cities } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';
import { writeLearnPage } from '@/lib/learn';

const [cityId, placeId, file, runs = '1'] = process.argv.slice(2);
const city = cities.find((c) => c.id === cityId)!;
const character = characterForPlace(city, city.places.find((p) => p.id === placeId)!)!;
const turns = JSON.parse(readFileSync(file, 'utf8'));
for (let i = 0; i < Number(runs); i++) {
  const page: any = await writeLearnPage(character, city.name, turns);
  console.log(`--- run ${i + 1}`);
  for (const c of page.corrections ?? []) console.log(`  said "${c.said}" → "${c.right}"  (${c.why})`);
}
