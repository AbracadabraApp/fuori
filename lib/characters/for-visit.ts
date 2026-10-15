/**
 * The character the learner meets on a visit, from ids alone: the city, the
 * place, and at a station the city they're buying a ticket to. The page uses it
 * to show the person, and /api/turn uses it so the server never takes a
 * character sheet from the request (anyone could send any sheet and get a
 * general-purpose Claude on our key; docs/12-native-app.md).
 *
 * Client-safe (no fs).
 */

import { cities } from '@/content';
import { characterForPlace } from './for-place';
import { clerkSetting, departureFor } from '@/lib/travel/departure';
import type { CharacterSheet } from '@/lib/types';

export function characterForVisit(cityId: string, placeId: string, tripTo?: string): CharacterSheet | undefined {
  const city = cities.find((c) => c.id === cityId);
  const place = city?.places.find((p) => p.id === placeId);
  if (!city || !place) return undefined;
  const sheet = characterForPlace(city, place);
  if (!sheet) return undefined;

  // At the station with a trip chosen: the ticket seller knows where you're going
  const destination = tripTo ? cities.find((c) => c.id === tripTo) : undefined;
  if (!destination) return sheet;
  const { platform } = departureFor(city.id, destination.id);
  return {
    ...sheet,
    appearance: {
      ...sheet.appearance,
      setting: clerkSetting(sheet.appearance?.setting ?? '', destination.name, platform),
    },
  } as CharacterSheet;
}
