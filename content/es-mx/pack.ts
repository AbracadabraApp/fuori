/**
 * The Mexican country pack: everything country-specific, in one object.
 * content/index.ts picks the active pack by COUNTRY. See docs/mexico-version.md.
 */
import { language } from './language';
import { cities } from './cities';
import { voices, elevenLabsVoiceFor, browserVoiceFor } from './voices';
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
  voices,
  elevenLabsVoiceFor,
  browserVoiceFor,
};
