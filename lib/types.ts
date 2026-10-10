// Core type definitions for Fuori
// Based on docs/09-data-model.md
// Simplified for M1 - moods removed, will add in M2/M3 with illustrated portraits

export type Formality = 'Lei' | 'tu';
export type Pace = 'slow' | 'normal' | 'quick';
export type Familiarity = 'sconosciuto' | 'cliente' | 'habitue' | 'amico';
export type Level = 'A1' | 'A1+' | 'A2' | 'A2+' | 'B1';

// Character Sheet
export interface CharacterSheet {
  id: string;
  name: string;
  age: number;
  role: string;
  city: string;
  origin: 'anchor' | 'generated' | 'tutor';
  placeId?: string;

  personality: {
    traits: string[];
    caresAbout: string[];
    secret?: string;
  };

  speech: {
    formality: Formality;
    pace: Pace;
    regionalisms: string[];
    description: string;
  };

  appearance: {
    description: string;
    setting: string;
  };

  portrait: {
    kind: 'illustrated' | 'svg' | 'placeholder';
    prompt?: string;
    avatarSeed?: string;
  };
}

// City Pantry
export interface Place {
  id: string;
  name: string;
  kind: string;
  neighbourhood: string;
  real: boolean;
  characterId?: string;
  imagePrompt?: string;
}

export interface CityCharacter {
  id: string;
  name: string;
  age: number;
  role: string;
  placeId: string;
  personality: string[];
  portraitPrompt: string;
}

export interface CityPantry {
  id: string;
  name: string;
  neighbourhoods: string[];
  places: Place[];
  characters?: CityCharacter[];
  food: string[];
  customs: string[];
  localTouches: string[];
  anchorIds?: string[];
  seedCharacters?: string[];
  dayTrips?: string[];
}

// Suggestion
export interface Suggestion {
  id: string;
  kind: 'everyday' | 'evening' | 'cambia-aria' | 'lesson';
  placeId: string;
  characterId?: string;
  newCharacterBrief?: string;
  goal?: string[];
  why: string;
  caption: string;
}

// Scene
export interface Scene {
  id: string;
  suggestionId?: string;
  characterId: string;
  setting: {
    place: string;
    timeOfDay: string;
    description: string;
  };
  goal?: string[];
  opening: {
    guide: string;
    fallback: { it: string; en: string };
  };
  recycleWords?: string[];
  agenda?: {
    topic: string;
    wantsToKnow: string[];
    arcLength: number;
  };
}

// Learner Data
export interface LearnerProfile {
  id: string;
  name: string;
  homeTown: string;
  whyItaly: string;
  level: Level;
  levelEvidence: string[];
  createdAt: Date;

  settings: {
    showEnglish: boolean;
    slowSpeech: boolean;
    dailyBudget?: number;
  };
}

export interface JourneyState {
  learnerId: string;
  day: number;
  currentCity: string;
  neighbourhood: string;
  daysInCity: number;
  citiesVisited: string[];
  todaySuggestions: Suggestion[];
  completedSceneIds: string[];
}

export interface Relationship {
  learnerId: string;
  characterId: string;
  familiarity: Familiarity;
  lastSeen: Date;

  memory: {
    facts: string[];
    promises: string[];
    topics: string[];
  };
}

export interface Turn {
  who: 'npc' | 'learner';
  transcript: string;
  understood?: string;
  translation?: string;
}

export interface SceneRun {
  id: string;
  learnerId: string;
  sceneId: string;
  characterId: string;
  day: number;
  startedAt: Date;
  completedAt?: Date;

  transcript: Turn[];
  stepsDone: number[];

  corrections: Array<{
    said: string;
    better: string;
    why: string;
  }>;

  wordsIntroduced: Array<{
    it: string;
    en: string;
  }>;
}

export interface Word {
  learnerId: string;
  it: string;
  en: string;
  firstSeen: Date;
  lastUsed: Date;
  timesUsed: number;
  sceneIds: string[];
}

export interface MagdaMessage {
  id: string;
  learnerId: string;
  reason: 'mistakes' | 'next-level' | 'before-hard-situation' | 'weekly';
  text: { it: string; en: string };
  lessonFocus: string;
  createdAt: Date;
  opened: boolean;
}

export interface Mistake {
  learnerId: string;
  pattern: string;
  category: string;
  examples: Array<{
    said: string;
    better: string;
    sceneId: string;
    day: number;
  }>;
  count: number;
  lastSeen: Date;
  resolved: boolean;
}

export interface DiarioEntry {
  learnerId: string;
  day: number;
  date: Date;

  summary: {
    it: string;
    en: string;
  };

  topCorrections: Array<{
    said: string;
    better: string;
    why: string;
    practice: string;
  }>;

  newWords: Array<{
    it: string;
    en: string;
  }>;

  tryTomorrow: string[];

  characterNote?: {
    characterId: string;
    name: string;
    note: string;
  };
}

// API Response Schemas
export interface TurnOutput {
  understood: string;
  it: string;
  en: string;

  correction: {
    said: string;
    better: string;
    why: string;
  } | null;

  words: Array<{
    it: string;
    en: string;
  }>;

  steps_done: number[];

  hint: string | null;
  confused: boolean;
  mood: 'warm' | 'amused' | 'busy' | 'curious';

  scene_over: boolean;

  memory_notes: string[];
}
