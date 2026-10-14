/**
 * The Italian country pack: everything country-specific, in one object.
 * content/index.ts picks the active pack by COUNTRY.
 */
import { language } from './language';
import { cities as allCities } from './cities';
import { showcase, homeCities } from './showcase';
import { giulia } from './characters/giulia';
import { rita } from './characters/rita';
import { magda } from './characters/magda';
import { voices, elevenLabsVoiceFor, browserVoiceFor } from './voices';
import type { CharacterSheet, CityPantry } from '@/lib/types';

/** Every city and place: hidden: true on places the showcase leaves out (and on
 *  any city with no showcase list); more: true on cities after "Mostra altro" */
const cities: CityPantry[] = allCities
  .map((city) => {
    const shown = showcase[city.id];
    return {
      ...city,
      hidden: !shown,
      more: !homeCities.includes(city.id),
      places: city.places.map((p) => ({ ...p, hidden: !shown || !shown.includes(p.id) })),
    };
  })
  // First-screen cities in homeCities order, then the rest in file order
  .sort((a, b) => {
    const ia = homeCities.indexOf(a.id), ib = homeCities.indexOf(b.id);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });

export const pack = {
  /** Folder under content/ (prompts, characters) */
  id: 'it',
  /** Folder under public/ for city, place and portrait images */
  images: '/images',
  language,
  cities,
  /** Hand-written anchor characters, by id */
  anchors: { giulia, rita } as Record<string, CharacterSheet>,
  /** Magda: the one character who teaches. One id everywhere, so her memory and
   *  the learner's Reviews follow them; placed at whichever school they visit. */
  tutor: magda,
  voices,
  elevenLabsVoiceFor,
  browserVoiceFor,
};
