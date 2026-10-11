// Every character gets a voice that matches their gender, anchors keep their
// fixed voice, and characters in the same city don't all share one voice.
import { cities } from '@/content/it/cities';
import { characterForPlace } from '@/lib/characters/for-place';
import { voices, elevenLabsVoiceFor } from '@/content/it/voices';

const problems: string[] = [];
let checked = 0;

if (elevenLabsVoiceFor('giulia', 'f') !== voices.elevenlabs.byCharacter.giulia) problems.push('Giulia lost her fixed voice');
if (elevenLabsVoiceFor('rita', 'f') !== voices.elevenlabs.byCharacter.rita) problems.push('Rita lost her fixed voice');

for (const city of cities) {
  const used = new Set<string>();
  for (const place of city.places) {
    const c = characterForPlace(city, place);
    if (!c) continue;
    checked++;
    if (!c.gender) { problems.push(`${c.name} (${city.name}) has no gender`); continue; }
    const v = elevenLabsVoiceFor(c.id, c.gender);
    if (!v) { problems.push(`${c.name} (${city.name}) has no voice`); continue; }
    used.add(v);
    const fixed = voices.elevenlabs.byCharacter[c.id];
    if (!fixed && !voices.elevenlabs[c.gender].includes(v)) problems.push(`${c.name} (${city.name}) got a ${c.gender === 'f' ? 'male' : 'female'} voice`);
  }
  if (checked > 5 && used.size < 2) problems.push(`${city.name}: every character has the same voice`);
}

if (problems.length) {
  console.error(problems.slice(0, 15).join('\n'));
  process.exit(1);
}
console.log(`OK: ${checked} characters each have a voice matching their gender`);
