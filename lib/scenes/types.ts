export interface Scene {
  id: string;
  place: string;
  city: string;
  characterId: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  setting: string; // description of the place
  goals: string[]; // e.g. ["Order a drink", "Ask about the neighborhood"]
  openingGuide: string; // guide for first line
  fallbackOpening: string; // if API fails
  wordsToRecycle?: string[]; // words from quaderno to use
}

export interface Turn {
  who: 'learner' | 'npc';
  transcript: string;
  understood?: string; // what NPC understood (for NPC turns)
  translation?: string;
}

export interface Relationship {
  characterId: string;
  familiarity: 'first-meeting' | 'acquaintance' | 'regular' | 'friend';
  memoryNotes: string[];
  lastSeen?: string; // ISO date
}
