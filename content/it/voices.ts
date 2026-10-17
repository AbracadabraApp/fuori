/**
 * Voices for Italian characters, picked by gender. The same character always
 * gets the same voice (chosen by a hash of their id), so neighbours differ but
 * nobody changes voice between visits.
 *
 * ElevenLabs IDs are NATIVE ITALIAN SPEAKERS from the voice library (2026-10-14).
 * No multilingual English speakers - all voices are native Italians with natural
 * pronunciation and regional accents (Standard, Romanesco, Florentine).
 * Run `npm run voices` to hear them.
 */
import type { Gender } from '@/lib/types';

export const voices = {
  elevenlabs: {
    f: [
      'MuTiG4dbrEGYEy3XP4iP', // Rossana - warm conversational, native Italian, 7.1K uses
      'ZPImQHFNyEPRDeECS4MX', // Nora - bright narrator, native Italian (Romanesco), 14.8K uses
      'zFA34HbdHBvF8WhlSusK', // Vale - calm & friendly, native Italian
      'jFW3ckrPY2w2mRxLpLQj', // Carla Castro - pleasant, native Italian (Florentine)
    ],
    m: [
      'covxL85MSd0uUrktE45z', // Adriatico - warm narrator, explicitly native Italian, 4.7K uses
      'f8NAZK1ciwrVujah7clz', // Valerio - warm storyteller, native Italian (Romanesco), 13.6K uses
      'mcMi8FJDhg35bMpWHv2R', // Paolo - dynamic radio voice, native Italian, 6.8K uses
      'UCeW7wElM5dxewmr4a8l', // Max - natural storyteller, native Italian, modern
    ],
  },

  /** iPhone / browser fallback: preferred Italian system voices by name */
  browser: {
    f: ['Alice', 'Federica', 'Paola', 'Emma', 'Elsa'],
    m: ['Luca', 'Diego', 'Cosimo'],
  },
};

/** Small stable hash so a character keeps the same voice. */
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function elevenLabsVoiceFor(characterId?: string, gender?: Gender): string | undefined {
  const v = voices.elevenlabs;
  if (!gender) return undefined;
  const pool = v[gender];
  return pool[hash(characterId ?? '') % pool.length];
}

/**
 * Pick an installed Italian browser voice matching the gender. If none of the
 * right gender is installed (a stock iPhone has only Alice, a woman), it still
 * returns an Italian voice so the character is heard, and says so with
 * matchesGender: false so the app can tell the learner.
 */
export function browserVoiceFor(
  available: SpeechSynthesisVoice[],
  speechLang: string,
  characterId?: string,
  gender?: Gender
): { voice?: SpeechSynthesisVoice; matchesGender: boolean } {
  const lang = speechLang.slice(0, 2);
  const italian = available.filter((v) => v.lang.replace('_', '-').toLowerCase().startsWith(lang));
  if (!italian.length) return { voice: undefined, matchesGender: false };
  if (!gender) return { voice: italian[0], matchesGender: true };
  const names = voices.browser[gender];
  const matching = italian.filter((v) => names.some((n) => v.name.includes(n)));
  if (!matching.length) return { voice: italian[0], matchesGender: false };
  return { voice: matching[hash(characterId ?? '') % matching.length], matchesGender: true };
}
