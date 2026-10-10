/**
 * Character for a place: hand-written anchors (Giulia, Rita) when the place has one,
 * otherwise the city file's character turned into a CharacterSheet.
 *
 * Client-safe (no fs), so the page and the conversation tests share it.
 */

import { giulia } from '@/content/it/characters/giulia';
import { rita } from '@/content/it/characters/rita';
import type { CharacterSheet, CityCharacter, CityPantry, Place } from '@/lib/types';

const anchors: Record<string, CharacterSheet> = { giulia, rita };

export function cityCharacterToSheet(
  person: CityCharacter,
  city: CityPantry,
  place?: Place
): CharacterSheet {
  const where = place ? `${place.name}, ${place.neighbourhood}` : city.name;
  return {
    id: person.id,
    name: person.name,
    age: person.age,
    role: person.role,
    city: city.name,
    origin: 'generated',
    placeId: person.placeId,
    personality: { traits: person.personality, caresAbout: [] },
    speech: {
      formality: 'Lei', // a newcomer is a stranger at first
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
  if (anchors[id]) return anchors[id];
  const person = city.characters?.find((c) => c.id === id);
  return person ? cityCharacterToSheet(person, city, place) : undefined;
}
