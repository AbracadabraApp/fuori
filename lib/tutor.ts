/**
 * Magda without a place (Josh, 2026-11-07: "No schools in game", "Lessons
 * shouldn't depend on places"). She isn't in any city file: Learn's lessons
 * open the conversation screen with her studio from content
 * (content/<country>/characters/magda.ts → magdaStudio) as the place and
 * "Learn" as the city, and a turn sent there is hers, with no city lookup.
 * Past lessons recorded at a city's school still find her by her id.
 */
import { tutor, tutorStudio, language } from '@/content';
import type { CharacterSheet } from '@/lib/types';

/** The city id a lesson with Magda is recorded under: not a city in any file */
export const LEARN_CITY_ID = 'learn';

/** Magda's character sheet: the same person (one id, one memory) wherever a lesson is */
export function tutorSheet(): CharacterSheet {
  return { ...tutor, city: language.card.country, placeId: tutorStudio.id };
}

/** Whether a turn is addressed to Magda's studio */
export function isTutorScene(cityId: string, placeId: string): boolean {
  return cityId === LEARN_CITY_ID && placeId === tutorStudio.id;
}

/** Her scene as the app's lesson plan takes it: a city and place it can open the conversation screen with */
export function tutorScene() {
  const place = { id: tutorStudio.id, name: tutorStudio.name, kind: tutorStudio.kind, neighbourhood: tutorStudio.neighbourhood, station: false, characterId: tutor.id };
  return { city: { id: LEARN_CITY_ID, name: 'Learn', more: false, places: [place] }, place, characterId: tutor.id };
}
