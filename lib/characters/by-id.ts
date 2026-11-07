/**
 * Any character in the active pack by id: Magda or a city
 * character. /v1/speak uses it to pick the voice on the server, so the app
 * sends only the character id.
 */
import { cities, tutor } from '@/content';
import type { Gender } from '@/lib/types';

export function characterGender(id: string): Gender | undefined {
  if (id === tutor.id) return tutor.gender;
  for (const city of cities) {
    const person = city.characters?.find((c) => c.id === id);
    if (person) return person.gender;
  }
  return undefined;
}

/** A city character's age, for picking a voice of the right age (content/<country>/voices.ts) */
export function characterAge(id: string): number | undefined {
  for (const city of cities) {
    const person = city.characters?.find((c) => c.id === id);
    if (person) return person.age;
  }
  return undefined;
}

/** A city character's stored voice (scripts/assign-voices.mts), if they have one */
export function characterVoice(id: string): string | undefined {
  for (const city of cities) {
    const person = city.characters?.find((c) => c.id === id);
    if (person) return person.voice;
  }
  return undefined;
}
