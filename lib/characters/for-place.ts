/**
 * Character for a place: Magda at a school, otherwise the city file's
 * character turned into a CharacterSheet. No character is special (Josh,
 * 2026-10-13); Giulia and Rita were hand-written "anchors" until 2026-10-16.
 *
 * Client-safe (no fs), so the page and the conversation tests share it.
 */

import { tutorSheet } from '@/lib/tutor';
import { tutor } from '@/content';
import type { CharacterSheet, CityCharacter, CityPantry, Place } from '@/lib/types';


export function cityCharacterToSheet(
  person: CityCharacter,
  city: CityPantry,
  place?: Place
): CharacterSheet {
  // The kind of place goes with its name ("Pizzeria Da Gigi" is pizza by the
  // slice), and why they're there, so nobody is handed an invented job
  const where = place ? `${place.name} (${place.kind.replace(/-/g, ' ')}), ${place.neighbourhood}` : city.name;
  const setting = person.here ? `${where}. ${person.here}` : where;
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
      // Empty: it only repeated the role and place the prompt already says (Josh, 2026-11-07: "cut description seems like commonsense")
      description: '',
    },
    appearance: { description: '', setting },
    portrait: { kind: 'illustrated', prompt: person.portraitPrompt },
  };
}

export function characterForPlace(
  city: CityPantry,
  place: Place
): CharacterSheet | undefined {
  const id = place.characterId;
  if (!id) return undefined;
  // Magda is in no city (lib/tutor.ts → tutorSheet; Josh, 2026-11-07)
  if (id === tutor.id) return tutorSheet();
  const person = city.characters?.find((c) => c.id === id);
  return person ? cityCharacterToSheet(person, city, place) : undefined;
}
