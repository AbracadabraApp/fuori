/**
 * Shared types for the testing infrastructure
 *
 * These types are used across test runner, personas, and judge.
 * Keep in sync with the main types in lib/types.ts where applicable.
 */

// ============================================================================
// Test Execution Types
// ============================================================================

export interface ConversationTurn {
  who: 'learner' | 'npc';
  transcript: string;
  understood?: string; // What NPC understood (for NPC turns)
  translation?: string; // English translation
  raw?: any; // Full turn output from NPC (for debugging)
}

export interface TestRun {
  persona: string; // persona ID
  sceneId: string;
  characterId: string;
  transcript: ConversationTurn[];
  stepsDone: number[];
  sceneCompleted: boolean;
  judgment: JudgmentResult;
  timestamp: string;
  error?: string;
}

// ============================================================================
// Judge Types
// ============================================================================

export interface JudgmentCriterion {
  criterion: string;
  score: number; // 0-10
  reasoning: string;
  examples: string[]; // Quotes from conversation
}

export interface JudgmentResult {
  overallScore: number; // 0-10
  criteria: JudgmentCriterion[];
  summary: string; // 2-3 sentence overall assessment
}

// ============================================================================
// Scene Types (simplified for testing)
// ============================================================================

export interface TestScene {
  sceneId: string;
  characterId: string;
  placeId: string;
  description: string;
  goal: string[];
  setting: {
    place: string;
    timeOfDay: string;
    description: string;
  };
}

// ============================================================================
// Level Rules (simplified for testing)
// ============================================================================

export interface LevelRules {
  level?: string;
  maxWordsPerSentence: number;
  maxSentencesPerTurn: number;
  newWordsPerTurn: number;
  tensesAllowed: string[];
  tensesAvoid: string[];
}

// ============================================================================
// Character Types (simplified for testing)
// ============================================================================

export interface TestCharacter {
  id: string;
  name: string;
  role: string;
  speech: {
    formality: 'tu' | 'Lei';
    pace: 'slow' | 'normal' | 'quick';
    regionalisms: string[];
    description: string;
  };
}
