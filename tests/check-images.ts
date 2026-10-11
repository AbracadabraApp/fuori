// Every city, place and city character needs an image file. Catches images saved
// under the wrong name (18 first-of-city places were saved as <city>.jpg) and
// places with no image description (Roma). Fix: npm run images -- --city <id>
import { existsSync } from 'fs';
import { cities } from '@/content/it/cities';
import { giulia } from '@/content/it/characters/giulia';
import { rita } from '@/content/it/characters/rita';

const missing: string[] = [];
for (const city of cities) {
  if (!existsSync(`public/images/cities/${city.id}.jpg`)) missing.push(`cities/${city.id}.jpg`);
  for (const place of city.places) {
    if (!existsSync(`public/images/places/${place.id}.jpg`)) {
      missing.push(`places/${place.id}.jpg (${city.id}${place.imagePrompt ? '' : ', no imagePrompt'})`);
    }
  }
  for (const person of city.characters ?? []) {
    if (!existsSync(`public/images/portraits/${person.id}.jpg`)) missing.push(`portraits/${person.id}.jpg (${city.id})`);
  }
}

for (const anchor of [giulia, rita]) {
  if (!existsSync(`public/images/portraits/${anchor.id}.jpg`)) missing.push(`portraits/${anchor.id}.jpg (anchor; prompt in content/it/characters/${anchor.id}.ts)`);
}

if (missing.length) {
  console.error(`${missing.length} missing image(s):\n` + missing.join('\n'));
  process.exit(1);
}
console.log('OK: every city, place and city character has an image');
