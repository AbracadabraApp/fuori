// The character prompt must say where the character is, so they can talk about
// their place (Davide at Ponte Pietra, Giulia behind her bar).
import { buildTurnPrompt } from '@/lib/prompts/build-turn-prompt';
import { characterForPlace } from '@/lib/characters/for-place';
import { cities } from '@/content/it/cities';

const failures: string[] = [];
for (const city of cities) {
  for (const place of city.places) {
    const c = characterForPlace(city, place);
    if (!c) continue;
    const { system } = buildTurnPrompt({ character: c, transcript: [] });
    const expected = c.origin === 'anchor' ? c.appearance.setting : place.name;
    if (!system.includes(expected)) failures.push(`${c.name} (${city.name}): prompt doesn't mention "${expected}"`);
  }
}
if (failures.length) {
  console.error(failures.slice(0, 10).join('\n'));
  process.exit(1);
}
console.log('OK: every character prompt says where the character is');
