/**
 * Voices for Italian characters, by gender and age. The same character always
 * gets the same voice (a hash of their id picks within their age group), so
 * neighbours differ but nobody changes voice between visits.
 *
 * All native Italian speakers from the ElevenLabs voice library, added to the
 * account. Age groups (Claude, 2026-11-07, with Josh's go-ahead to manage the
 * voices): 8 voices for 635 characters gave a 70-year-old a young radio voice
 * and ~80 people one voice; now 22, picked by the character's age. Chosen for
 * conversational delivery, and loudness from the library previews (ffmpeg EBU
 * R128): none quieter than about -21 LUFS, since the app turns loud clips down
 * to -20 but can't boost quiet ones (Voice.swift). Pool sizes follow the
 * characters: women 74 young, 174 middle-aged, 32 older; men 43, 213, 99.
 * Run `npm run voices` to hear them.
 */
import type { Gender } from '@/lib/types';

type AgeGroup = 'young' | 'middle' | 'old';

const byAge: Record<Gender, Record<AgeGroup, string[]>> = {
  f: {
    young: [
      'QITiGyM4owEZrBEf0QV8', // Ginevra - cheerful, grounded, conversational (-20.0)
      '3DPhHWXDY263XJ1d2EPN', // Linda Fiore - prickly, cheerful (-19.1)
      'zFA34HbdHBvF8WhlSusK', // Nora - bright (-17.0)
    ],
    middle: [
      'MuTiG4dbrEGYEy3XP4iP', // Rossana - warm, conversational (-18.8)
      'ZPImQHFNyEPRDeECS4MX', // Vale - calm, friendly (-19.1)
      'jFW3ckrPY2w2mRxLpLQj', // Carla Castro - Florentine
      '8KInRSd4DtD5L5gK7itu', // Giusy - Sicilian accent, conversational (-18.3)
      '201hPjDVu4Q5DUV7tMQJ', // Marcella - confident (-17.6)
    ],
    old: [
      'MLpDWJvrjFIdb63xbJp8', // Angelina - mature, warm (-17.6)
      'V4hbKpM9VBIJ9lKaWBjM', // Lea - mature, calm, conversational (-15.5)
    ],
  },
  m: {
    young: [
      'DTGwzA4YLrWB1FAT6Uas', // Lorenzo - youthful, conversational (-20.5)
      'o4b57JYAECRMJyCEXyIE', // Brando Vox - pleasant, conversational (-18.3)
      'MTgv1KRJpUnc34UMGTHK', // Matteo - Venetian accent, conversational (-20.2)
    ],
    middle: [
      'covxL85MSd0uUrktE45z', // Adriatico - warm (-17.3)
      'f8NAZK1ciwrVujah7clz', // Valerio - warm, Romanesco (-16.6)
      'mcMi8FJDhg35bMpWHv2R', // Paolo - dynamic (-19.0)
      'GcAgjAjkhWsmUd4GlPiv', // Marco - friendly, calm, conversational; replaced Max (2026-11-04: -36.8 LUFS)
      'PSp7S6ST9fDNXDwEzX0m', // Alessandro - calm (-19.5)
      'HuK8QKF35exsCh2e7fLT', // Carmelo La Rosa - deep, balanced (-19.8)
    ],
    old: [
      'w3aQQZqtgGo2o2fsmvQ2', // Nonno Ben - a grandfather (-17.6)
      'OcIrXHpOMgy1jqfJ2I8o', // Criss - mature, conversational (-15.7)
      'ipT4u0Omn6M1PjJcECNG', // Giuseppe Galassi - mature, wise (-17.9)
    ],
  },
};

/** Under 35 young, 60 and over old; no age known: middle-aged, the commonest */
function ageGroup(age?: number): AgeGroup {
  if (age === undefined) return 'middle';
  return age < 35 ? 'young' : age >= 60 ? 'old' : 'middle';
}

export const voices = {
  elevenlabs: {
    f: Object.values(byAge.f).flat(),
    m: Object.values(byAge.m).flat(),
  },
  byAge,

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

export function elevenLabsVoiceFor(characterId?: string, gender?: Gender, age?: number): string | undefined {
  if (!gender) return undefined;
  const pool = byAge[gender][ageGroup(age)];
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
