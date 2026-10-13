/**
 * Voices for Mexican characters, picked by gender. The same character always
 * gets the same voice (chosen by a hash of their id), so neighbours differ but
 * nobody changes voice between visits.
 *
 * ElevenLabs IDs are premade voices; with the multilingual Flash v2.5 model they
 * all speak Spanish, but accents vary and none is vetted for a Mexican accent
 * yet. Run `npm run voices` (COUNTRY=es-mx), listen, and swap any that sound off.
 */
import type { Gender } from '@/lib/types';

export const voices = {
  elevenlabs: {
    // No anchors in Mexico yet
    byCharacter: {} as Record<string, string>,
    f: [
      'KVJNlB9xei0FCE8ekWnI', // Ingrid - young (20s), Mexican soft & natural
      'fuVibWsnIUtzBVjB2PCa', // Ximena - young (20s), Mexican gentle & immersive
      'akOBlaKhFd59YlK6xz9u', // Lucia - mid (30s), Mexican warm conversational
      'XrExE9yKIg1WjnnlVkGX', // Matilda - mature (40s), premade (works well with Spanish)
    ],
    m: [
      'y49lIAGrsmQl8dzq2W93', // Rayito - young (20s), Mexican warm & natural
      '8MmlQmEVy2nXcsSSkf0b', // Axel G - young-mid (20s-30s), Mexican confident & friendly
      '4rOzDieCbHQQyo9tzqZv', // Diego - mid (30s), Mexican warm & conversational
      'rtQzMJmQhSg0YB7cp3ed', // Joaquín - middle-aged (40s-50s), Mexican rich & captivating
    ],
  },

  /** iPhone / browser fallback: preferred Mexican Spanish system voices by name */
  browser: {
    f: ['Paulina', 'Mónica', 'Marisol'],
    m: ['Juan', 'Jorge', 'Diego'],
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
 * Pick an installed Spanish browser voice matching the gender, preferring
 * Mexican voices. If none of the right gender is installed it still returns a
 * Spanish voice, with matchesGender: false so the app can tell the learner.
 */
export function browserVoiceFor(
  available: SpeechSynthesisVoice[],
  speechLang: string,
  characterId?: string,
  gender?: Gender
): { voice?: SpeechSynthesisVoice; matchesGender: boolean } {
  const lang = speechLang.slice(0, 2);
  const region = speechLang.toLowerCase();
  const spanish = available.filter((v) => v.lang.replace('_', '-').toLowerCase().startsWith(lang));
  if (!spanish.length) return { voice: undefined, matchesGender: false };
  // Mexican voices first, then other Spanish
  const ordered = [
    ...spanish.filter((v) => v.lang.replace('_', '-').toLowerCase() === region),
    ...spanish.filter((v) => v.lang.replace('_', '-').toLowerCase() !== region),
  ];
  if (!gender) return { voice: ordered[0], matchesGender: true };
  const names = voices.browser[gender];
  const matching = ordered.filter((v) => names.some((n) => v.name.includes(n)));
  if (!matching.length) return { voice: ordered[0], matchesGender: false };
  return { voice: matching[hash(characterId ?? '') % matching.length], matchesGender: true };
}
