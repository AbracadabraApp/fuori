/**
 * Character for a place: Magda at a school, otherwise the city file's
 * character turned into a CharacterSheet. No character is special (Josh,
 * 2026-10-13); Giulia and Rita were hand-written "anchors" until 2026-10-16.
 *
 * Client-safe (no fs), so the page and the conversation tests share it.
 */

import { tutor } from '@/content';
import type { CharacterSheet, CityCharacter, CityPantry, Place } from '@/lib/types';


export function cityCharacterToSheet(
  person: CityCharacter,
  city: CityPantry,
  place?: Place
): CharacterSheet {
  const where = place ? `${place.name}, ${place.neighbourhood}` : city.name;
  return {
    id: person.id,
    name: person.name,
    gender: person.gender,
    age: person.age,
    role: person.role,
    city: city.name,
    origin: 'generated',
    placeId: person.placeId,
    personality: { traits: person.personality, caresAbout: [] },
    speech: {
      formality: 'formal', // a newcomer is a stranger at first
      pace: 'normal',
      regionalisms: [],
      description: `${person.role} at ${where}`,
    },
    appearance: { description: '', setting: where },
    portrait: { kind: 'illustrated', prompt: person.portraitPrompt },
  };
}

export function characterForPlace(
  city: CityPantry,
  place: Place
): CharacterSheet | undefined {
  const id = place.characterId;
  if (!id) return undefined;
  // Magda: the same person (same id, so the same memory) at every school,
  // placed in this school's city and room
  if (id === tutor.id) {
    return { ...tutor, city: city.name, placeId: place.id, appearance: { ...tutor.appearance, setting: `${place.name}, ${place.neighbourhood}` } };
  }
  const person = city.characters?.find((c) => c.id === id);
  return person ? cityCharacterToSheet(person, city, place) : undefined;
}
