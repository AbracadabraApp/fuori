/**
 * Voices for Mexican characters, picked by gender. The same character always
 * gets the same voice (chosen by a hash of their id), so neighbours differ but
 * nobody changes voice between visits.
 *
 * ElevenLabs IDs are NATIVE MEXICAN SPANISH SPEAKERS from the voice library
 * (2026-10-14). High-quality, high-usage voices (10K-98K uses) with natural
 * Mexican pronunciation. Chosen for neutral, conversational delivery - not
 * corporate/dramatic/character-specific. Run `npm run voices` (COUNTRY=es-mx)
 * to hear them.
 */
import type { Gender } from '@/lib/types';

export const voices = {
  elevenlabs: {
    // No anchors in Mexico yet (native Mexican Spanish speakers)
    byCharacter: {} as Record<string, string>,
    f: [
      'spPXlKT5a4JMfbhPRAzA', // Camila - warm, inviting, rich Mexican Spanish, 51.7K uses
      'm7yTemJqdIqrcNleANfX', // Ana María - calm, natural, clear, neutral Mexican, 63.3K uses
      'ewn5JTa3lNPY8QVuZJi6', // Ana Sofía - conversational, neutral Mexican accent, 14.6K uses
      'twZzvyYIl5ntDHC1Vatv', // Angelica - friendly, energetic, Mexican, 30.6K uses
    ],
    m: [
      'HIkzxzvsigFIynXHHKhU', // Hugo M - deep & mysterious, native Mexican, 10.1K uses
      'U9jmr7kY6mMqS39kfA01', // Javi - social media, energetic Mexican, 769 uses
      'W6Z2FAa578IKOGSVo2sA', // Alejandro Ballesteros - warm & joyful, Mexican, 98.8K uses
      'LegCbmbXKbT5PUp3QFWv', // Jhony - calm, measured, sincere, Mexican, 6.1K uses
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
