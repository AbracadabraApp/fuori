import { CharacterSheet } from '@/lib/types';

export const magda: CharacterSheet = {
  id: 'magda',
  name: 'Magda',
  gender: 'f',
  age: 42,
  role: 'maestra de español para extranjeros',
  city: 'all', // Appears at schools in all cities
  origin: 'tutor',
  placeId: 'escuela-lengua', // Generic; specific schools reference this character

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
    setting: 'Small classroom at the language school',
  },

  portrait: {
    kind: 'illustrated',
    prompt: 'Gouache portrait of a woman in her early 40s with dark curly hair pulled back, warm brown eyes, reading glasses, expressive hands mid-gesture, knit sweater and simple necklace, encouraging smile, who teaches Spanish to foreigners at a language school in Mexico. Bold, saturated colour: warm ochre, sage green, and cream. Flat, simple shapes, full of character. Tall portrait format, 1200 × 1800 pixels (2:3).',
  },
};
