/**
 * The Italian country pack: everything country-specific, in one object.
 * content/index.ts picks the active pack by COUNTRY.
 */
import { language } from './language';
import { cities as allCities } from './cities';
import { showcase } from './showcase';
import { giulia } from './characters/giulia';
import { rita } from './characters/rita';
import { magda } from './characters/magda';
import { voices, elevenLabsVoiceFor, browserVoiceFor } from './voices';
import type { CharacterSheet, CityPantry } from '@/lib/types';

/** Every city and place, with hidden: true on what the showcase leaves out */
const cities: CityPantry[] = allCities.map((city) => {
  const shown = showcase[city.id];
  return {
    ...city,
    hidden: !shown,
    places: city.places.map((p) => ({ ...p, hidden: !shown || !shown.includes(p.id) })),
  };
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
