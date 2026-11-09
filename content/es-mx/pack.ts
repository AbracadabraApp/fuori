/**
 * The Mexican country pack: everything country-specific, in one object.
 * content/index.ts picks the active pack by COUNTRY. See docs/mexico-version.md.
 */
import { language } from './language';
import { cities } from './cities';
import { voices, elevenLabsVoiceFor, browserVoiceFor } from './voices';
import { onboarding } from './onboarding';
import { magda, magdaStudio } from './characters/magda';

export const pack = {
  /** Folder under content/ (prompts, characters) */
  id: 'es-mx',
  /** Folder under public/ for city, place and portrait images */
  images: '/images/es-mx',
  language,
  cities,
  /** Magda: the one character who teaches. One id everywhere, so her memory and
   *  the learner's Reviews follow them; placed at whichever school they visit. */
  tutor: magda,
  /** Where her lessons happen: not in any city (lib/tutor.ts) */
  tutorStudio: magdaStudio,
  /** Colours of the terminal ticket: deep red band, cobalt accent, pale red security stripes */
  ticketTheme: { band: '#a3182b', bandInk: '#ffffff', stripe: 'rgba(163, 24, 43, 0.08)', accent: '#1f4fa3' },
  /** Kinds of place that are open spaces or landmarks, where nobody is
   *  selling and there's time to talk: the app puts one in the first few cards
   *  of a city's daily order (Josh, 2026-11-08) */
  openKinds: ['plaza', 'church', 'landmark', 'museum', 'botanical garden', 'art centre', 'street'],
  /** The greeter's fixed lines, voice and framing (docs/onboarding-design.md) */
  onboarding,
  voices,
  elevenLabsVoiceFor,
  browserVoiceFor,
};
