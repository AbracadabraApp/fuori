/**
 * Voices for Mexican characters, by gender and age: each character's voice is
 * assigned once and stored in the city file (`voice:`, scripts/assign-voices.mts),
 * picked from their age group and spread across the city; these pools are what
 * it picks from, and the fallback for anyone without a stored voice.
 *
 * Native Mexican Spanish voices from the ElevenLabs library (Claude,
 * 2026-11-07, with Josh's go-ahead to manage the voices), chosen for
 * conversational delivery and loudness on the library previews (ffmpeg EBU
 * R128): the app turns loud clips down to -20 LUFS but can't boost quiet ones,
 * so Camila (-27) and Eduardo (-27) went. The library has only one older
 * Mexican woman (Azu); Gabiyoya, calm, joins her. Characters: women 11 young,
 * 16 middle-aged, 9 older; men 7, 19, 13.
 */
import type { Gender } from '@/lib/types';

type AgeGroup = 'young' | 'middle' | 'old';

const byAge: Record<Gender, Record<AgeGroup, string[]>> = {
  f: {
    young: [
      'm7yTemJqdIqrcNleANfX', // Ana María - calm, natural (-17.0)
      'ewn5JTa3lNPY8QVuZJi6', // Ana Sofía - conversational (-21.9)
      '9Godp7dNohUvXk6qp0gS', // Regina - casual, conversational (-20.5)
    ],
    middle: [
      'akOBlaKhFd59YlK6xz9u', // Lucia - warm, conversational (-19.9)
      'CQLNn2VcdhTOSAfK3xmF', // Valentina - relaxed, conversational (-17.0)
      '1VQaMRazTeAqnqdb5C33', // Monica Mendez - conversational (-20.4)
    ],
    old: [
      'D3ws14YxTqcjPaXEOehR', // Azu - mature, calm (-25.5)
      'iBGVhgcEZS6A5gTOjqSJ', // Gabiyoya - calm, conversational (-20.3)
    ],
  },
  m: {
    young: [
      'lLu7VwiNjffLb7HZ3LFW', // Silverio - gentle (-19.2)
      'SR7nDRaowD2i3v2ycaDS', // Alejandro - casual, conversational (-21.1)
      'T0etfMyJ0xd14aP2WsOi', // Beto Viral - casual, conversational (-22.2)
    ],
    middle: [
      'gbTn1bmCvNgk0QEAVyfM', // Enrique M. Nieto - warm, clear, gentle (-15.5)
      'ojGau167OE7nUATM1xDa', // Marto - warm, natural; replaced Hugo M (2026-11-04, too quiet) (-21.8)
      'JgmJ33RuT4tPQOENamHR', // Julián A - calm, conversational (-18.1)
      'lRf3yb6jZby4fn3q3Q7M', // Tony - confident (-17.4)
      'nmvA11Y688M5reLqDsVm', // Samuel Rosales - casual, conversational (-15.4)
    ],
    old: [
      'Rt1JHkPO27QCUX6Nd5bV', // Jorge - raspy, conversational (-24.7)
      'tI1Rufka5gOIKze9KhpE', // Francisco - confident (-19.9)
      'gUzzwyvvop8GQmnl2Akf', // Roberto - calm (-20.7)
      '68nvxRVrtyK9nd4hTKmR', // Pablo Macias - classy (-12.2)
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

export function elevenLabsVoiceFor(characterId?: string, gender?: Gender, age?: number): string | undefined {
  if (!gender) return undefined;
  const pool = byAge[gender][ageGroup(age)];
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
