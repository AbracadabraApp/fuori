/**
 * Voices for Italian characters, picked by gender. The same character always
 * gets the same voice (chosen by a hash of their id), so neighbours differ but
 * nobody changes voice between visits.
 *
 * ElevenLabs IDs are premade voices; with the multilingual Flash v2.5 model they
 * all speak Italian, but accents vary. Run `npm run voices` to list voices on the
 * account verified for Italian, listen, and swap any that sound off.
 */
import type { Gender } from '@/lib/types';

export const voices = {
  elevenlabs: {
    // Fixed voices for anchors
    byCharacter: {
      giulia: 'pFZP5JQG7iQjIQuC4Bku', // Lily: warm, expressive (verified Italian)
      rita: 'XrExE9yKIg1WjnnlVkGX', // Matilda: warm, mature
    } as Record<string, string>,
    f: [
      'pFZP5JQG7iQjIQuC4Bku', // Lily (verified Italian)
      'XrExE9yKIg1WjnnlVkGX', // Matilda (verified Italian)
      'Xb7hH8MSUJpSbSDYk0k2', // Alice (verified Italian)
      'SAz9YHcvj6GT2YYXdXww', // River (verified Italian, neutral)
    ],
    m: [
      'JBFqnCBsd6RMkjVDRZzb', // George (not verified Italian - Flash v2.5 multilingual)
      'onwK4e9ZLuTAKqWW03F9', // Daniel (not verified Italian - Flash v2.5 multilingual)
      'nPczCjzI2devNBz1zQrb', // Brian (not verified Italian - Flash v2.5 multilingual)
      'pNInz6obpgDQGcFmaJgB', // Adam (not verified Italian - Flash v2.5 multilingual)
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
  if (characterId && v.byCharacter[characterId]) return v.byCharacter[characterId];
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
