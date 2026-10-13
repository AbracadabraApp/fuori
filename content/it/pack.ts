/**
 * The Italian country pack: everything country-specific, in one object.
 * content/index.ts picks the active pack by COUNTRY.
 */
import { language } from './language';
import { cities } from './cities';
import { giulia } from './characters/giulia';
import { rita } from './characters/rita';
import { voices, elevenLabsVoiceFor, browserVoiceFor } from './voices';
import type { CharacterSheet } from '@/lib/types';

export const pack = {
  /** Folder under content/ (prompts, characters) */
  id: 'it',
  /** Folder under public/ for city, place and portrait images */
  images: '/images',
  language,
  cities,
  /** Hand-written anchor characters, by id */
  anchors: { giulia, rita } as Record<string, CharacterSheet>,
  voices,
  elevenLabsVoiceFor,
  browserVoiceFor,
};
