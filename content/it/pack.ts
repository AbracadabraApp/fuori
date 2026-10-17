/**
 * The Italian country pack: everything country-specific, in one object.
 * content/index.ts picks the active pack by COUNTRY.
 */
import { language } from './language';
import { cities as allCities } from './cities';
import { showcase, homeCities } from './showcase';
import { magda } from './characters/magda';
import { voices, elevenLabsVoiceFor, browserVoiceFor } from './voices';
import { onboarding } from './onboarding';
import type { CityPantry } from '@/lib/types';

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
  /** Magda: the one character who teaches. One id everywhere, so her memory and
   *  the learner's Reviews follow them; placed at whichever school they visit. */
  tutor: magda,
  /** Colours of the station ticket: Italian rail green, red accent, pale green security stripes */
  ticketTheme: { band: '#1d5c3a', bandInk: '#ffffff', stripe: 'rgba(29, 92, 58, 0.09)', accent: '#b8252f' },
  /** The greeter's fixed lines, voice and framing (docs/onboarding-design.md) */
  onboarding,
  voices,
  elevenLabsVoiceFor,
  browserVoiceFor,
};
