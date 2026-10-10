import { CharacterSheet } from '@/lib/types';

export const rita: CharacterSheet = {
  id: 'rita',
  name: 'Rita',
  age: 58,
  role: 'host',
  city: 'Roma',
  origin: 'anchor',
  placeId: 'apartment-trastevere-rita', // Where you're staying

  personality: {
    traits: ['warm', 'practical', 'patient', 'protective', 'storyteller'],
    caresAbout: [
      'her guests feeling at home',
      'Trastevere\'s history and changes',
      'good food and cooking',
      'her grown children who visit',
    ],
    secret: 'Misses having a full house now that her kids have moved out; renting rooms fills that gap',
  },

  speech: {
    formality: 'tu', // Quickly switches to tu with guests
    pace: 'normal',
    regionalisms: ['daje', 'anvedi'],
    description: 'Warm and patient, naturally simplifies for learners, uses gestures, repeats important things, gives practical advice about the neighborhood',
  },

  englishAbility: 'basic',

  appearance: {
    description: 'Italian woman in her late 50s, salt-and-pepper hair in a practical bob, warm brown eyes, laugh lines, simple gold necklace, comfortable clothes (linen shirts, dark trousers), hands that gesture while talking',
    setting: 'In her Trastevere apartment, natural light from tall windows, family photos on the sideboard, well-used kitchen visible in the background, comfortable lived-in feeling',
  },

  portrait: {
    kind: 'placeholder', // Will be 'illustrated' when portraits are ready
    prompt: 'Watercolour and ink sketch on white paper, travel-sketchbook style. Loose transparent washes, fine ink lines, lots of blank white paper. Square, head and shoulders, looking at the viewer. Italian woman in her late 50s, salt-and-pepper hair in a practical bob, warm brown eyes, laugh lines, simple gold necklace, comfortable clothes, hands mid-gesture. Soft natural light from apartment windows.',
  },
};
