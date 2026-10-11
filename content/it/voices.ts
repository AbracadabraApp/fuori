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
      'pFZP5JQG7iQjIQuC4Bku', // Lily
      'XrExE9yKIg1WjnnlVkGX', // Matilda
      'Xb7hH8MSUJpSbSDYk0k2', // Alice
      'cgSgspJ2msm6clMCkdW9', // Jessica
    ],
    m: [
      'JBFqnCBsd6RMkjVDRZzb', // George
      'onwK4e9ZLuTAKqWW03F9', // Daniel
      'nPczCjzI2devNBz1zQrb', // Brian
      'pNInz6obpgDQGcFmaJgB', // Adam
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

/** Pick an installed Italian browser voice matching the gender, if any. */
export function browserVoiceFor(
  available: SpeechSynthesisVoice[],
  speechLang: string,
  characterId?: string,
  gender?: Gender
): SpeechSynthesisVoice | undefined {
  const lang = speechLang.slice(0, 2);
  const italian = available.filter((v) => v.lang.replace('_', '-').toLowerCase().startsWith(lang));
  if (!italian.length) return undefined;
  if (!gender) return italian[0];
  const names = voices.browser[gender];
  const matching = italian.filter((v) => names.some((n) => v.name.includes(n)));
  if (!matching.length) return italian[0];
  return matching[hash(characterId ?? '') % matching.length];
}
