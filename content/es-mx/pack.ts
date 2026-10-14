/**
 * The Mexican country pack: everything country-specific, in one object.
 * content/index.ts picks the active pack by COUNTRY. See docs/mexico-version.md.
 */
import { language } from './language';
import { cities } from './cities';
import { voices, elevenLabsVoiceFor, browserVoiceFor } from './voices';
import { magda } from './characters/magda';
import type { CharacterSheet } from '@/lib/types';

export const pack = {
  /** Folder under content/ (prompts, characters) */
  id: 'es-mx',
  /** Folder under public/ for city, place and portrait images */
  images: '/images/es-mx',
  language,
  cities,
  /** Hand-written anchor characters, by id (none yet) */
  anchors: {} as Record<string, CharacterSheet>,
  /** Magda: the one character who teaches. One id everywhere, so her memory and
   *  the learner's Reviews follow them; placed at whichever school they visit. */
  tutor: magda,
  /** Colours of the terminal ticket: deep red band, cobalt accent, pale red security stripes */
  ticketTheme: { band: '#a3182b', bandInk: '#ffffff', stripe: 'rgba(163, 24, 43, 0.08)', accent: '#1f4fa3' },
  voices,
  elevenLabsVoiceFor,
  browserVoiceFor,
};
