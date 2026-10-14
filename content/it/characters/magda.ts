import { CharacterSheet } from '@/lib/types';

export const magda: CharacterSheet = {
  id: 'magda',
  name: 'Magda',
  gender: 'f',
  age: 42,
  role: 'insegnante di italiano per stranieri',
  city: 'all', // Appears at schools in all cities
  origin: 'tutor',
  placeId: 'scuola-lingua', // Generic; specific schools reference this character

  personality: {
    traits: ['warm', 'patient', 'precise', 'encouraging'],
    caresAbout: [
      'understanding why mistakes happen',
      'making grammar clear without overwhelming',
      'building confidence in speaking',
      'celebrating progress',
    ],
    secret: 'Sometimes misses living in Italy full-time; teaching keeps her connected to the language and culture she loves',
  },

  speech: {
    formality: 'informal', // Uses tu with students
    pace: 'normal',
    regionalisms: [], // Standard Italian; no strong regional accent
    description: 'Clear and patient, adjusts naturally to student level, uses gestures, explains in English when needed, gives practical examples, encourages speaking without fear of mistakes',
  },

  englishAbility: 'fluent',

  appearance: {
    description: 'Woman in her early 40s, dark curly hair often pulled back, warm brown eyes, expressive hands, comfortable professional clothes (knit sweaters, simple jewelry), reading glasses sometimes perched on her head',
    setting: 'Small classroom at the language school',
  },

  portrait: {
    kind: 'illustrated',
    prompt: 'Pen and ink portrait on white paper of an Italian language teacher in her early 40s with dark curly hair pulled back, warm brown eyes, reading glasses, expressive hands mid-gesture, knit sweater and simple necklace, encouraging smile, minimal watercolor wash in warm ochre and sage tones, detailed crosshatching. The subject is a woman.',
  },
};
