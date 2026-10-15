/**
 * Any character in the active pack by id: an anchor, Magda, or a city
 * character. /v1/speak uses it to pick the voice on the server, so the app
 * sends only the character id.
 */
import { anchors, cities, tutor } from '@/content';
import type { Gender } from '@/lib/types';

export function characterGender(id: string): Gender | undefined {
  if (id === tutor.id) return tutor.gender;
  if (anchors[id]) return anchors[id].gender;
  for (const city of cities) {
    const person = city.characters?.find((c) => c.id === id);
    if (person) return person.gender;
  }
  return undefined;
}
