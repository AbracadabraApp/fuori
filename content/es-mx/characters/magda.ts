import { CharacterSheet } from '@/lib/types';

export const magda: CharacterSheet = {
  id: 'magda',
  name: 'Magda',
  gender: 'f',
  age: 42,
  role: 'maestra de español para extranjeros',
  city: '', // Not in any city: she teaches in Learn (tutorSheet fills the country)
  origin: 'tutor',
  placeId: 'magda-studio', // Her own studio (tutorStudio below), not a place in a city

  personality: {
    traits: ['warm', 'patient', 'precise', 'encouraging'],
    caresAbout: [
      'understanding why mistakes happen',
      'making grammar clear without overwhelming',
      'building confidence in speaking',
      'celebrating progress',
    ],
    secret: 'Sometimes misses living in Mexico full-time; teaching keeps her connected to the language and culture she loves',
  },

  speech: {
    formality: 'informal', // Uses tú with students
    pace: 'normal',
    regionalisms: [], // Standard Mexican Spanish; no strong regional accent
    description: 'Clear and patient, adjusts naturally to student level, uses gestures, explains in English when needed, gives practical examples, encourages speaking without fear of mistakes',
  },

  englishAbility: 'fluent',

  appearance: {
    description: 'Woman in her early 40s, dark curly hair often pulled back, warm brown eyes, expressive hands, comfortable professional clothes (knit sweaters, simple jewelry), reading glasses sometimes perched on her head',
    setting: 'Her own studio, where she gives one-to-one lessons',
  },

  portrait: {
    kind: 'illustrated',
    prompt: 'Gouache portrait of a woman in her early 40s with dark curly hair pulled back, warm brown eyes, reading glasses, expressive hands mid-gesture, knit sweater and simple necklace, encouraging smile, who teaches Spanish to foreigners at a language school in Mexico. Bold, saturated colour: warm ochre, sage green, and cream. Flat, simple shapes, full of character. Tall portrait format, 1200 × 1800 pixels (2:3).',
  },
};

/**
 * Where Learn's lessons happen (Josh, 2026-11-07: "No schools in game",
 * "Lessons shouldn't depend on places"): Magda's own studio, not a place in
 * any city file. The app opens a lesson on the conversation screen with this
 * as its place (lib/tutor.ts → tutorScene).
 */
export const magdaStudio = { id: 'magda-studio', name: 'El estudio de Magda', kind: 'teacher-studio', neighbourhood: 'Learn' };
