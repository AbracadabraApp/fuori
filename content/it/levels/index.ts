/**
 * Italian Language Levels - CEFR-based definitions
 *
 * Comprehensive level definitions for Italian language learning based on:
 * - Common European Framework of Reference (CEFR)
 * - Profilo della lingua italiana (University of Perugia)
 * - De Mauro's Vocabolario di Base
 *
 * These definitions guide:
 * 1. Character dialogue generation (appropriate to learner level)
 * 2. Learner assessment (determining readiness to progress)
 * 3. Content adaptation (vocabulary, grammar, complexity)
 */

export { a1 } from './a1';
export { a1plus } from './a1plus';
export { a2 } from './a2';
export { a2plus } from './a2plus';
export { b1 } from './b1';

export type { LevelDefinition } from './a1';

/**
 * Level progression summary:
 *
 * A1 (Absolute Beginner)
 * - Present tense only
 * - 400-600 words
 * - Basic survival phrases
 * - 3-5 word sentences
 *
 * A1+ (Upper Beginner)
 * - Add passato prossimo
 * - 700-900 words
 * - Simple past narratives
 * - 4-7 word sentences
 *
 * A2 (Elementary)
 * - Imperfetto vs passato prossimo contrast (KEY MILESTONE)
 * - 1000-1200 words
 * - Handle routine situations
 * - 6-10 word sentences
 *
 * A2+ (Upper Elementary)
 * - Conditional for politeness
 * - 1400-1800 words
 * - Express opinions and hypotheses
 * - 8-12 word sentences
 * - Beginning regional exposure
 *
 * B1 (Intermediate - Independent User)
 * - Congiuntivo (subjunctive) - THE THRESHOLD
 * - 2000-2500 words
 * - Handle work, travel independently
 * - 10-15+ word sentences
 * - Frequent regional features
 * - Storytelling with detail
 */

export const levels = ['A1', 'A1+', 'A2', 'A2+', 'B1'] as const;
export type Level = (typeof levels)[number];

/**
 * Get level definition by level code
 */
import { a1 } from './a1';
import { a1plus } from './a1plus';
import { a2 } from './a2';
import { a2plus } from './a2plus';
import { b1 } from './b1';

export function getLevelDefinition(level: Level) {
  switch (level) {
    case 'A1':
      return a1;
    case 'A1+':
      return a1plus;
    case 'A2':
      return a2;
    case 'A2+':
      return a2plus;
    case 'B1':
      return b1;
    default:
      throw new Error(`Unknown level: ${level}`);
  }
}

/**
 * Get level index (for progression tracking)
 */
export function getLevelIndex(level: Level): number {
  return levels.indexOf(level);
}

/**
 * Get next level (returns null if at highest level)
 */
export function getNextLevel(level: Level): Level | null {
  const index = getLevelIndex(level);
  return index < levels.length - 1 ? levels[index + 1] : null;
}

/**
 * Get previous level (returns null if at lowest level)
 */
export function getPreviousLevel(level: Level): Level | null {
  const index = getLevelIndex(level);
  return index > 0 ? levels[index - 1] : null;
}

/**
 * Check if learner is ready to progress based on assessment criteria
 */
export function assessReadinessToProgress(
  level: Level,
  learnerCapabilities: string[]
): { ready: boolean; missingCriteria: string[] } {
  const definition = getLevelDefinition(level);
  const criteria = definition.assessmentCriteria.readyToProgress;

  // Simple string matching - in practice, this would use more sophisticated
  // evaluation of learner's actual language production
  const missing = criteria.filter(criterion =>
    !learnerCapabilities.some(cap =>
      cap.toLowerCase().includes(criterion.toLowerCase().substring(0, 20))
    )
  );

  return {
    ready: missing.length === 0,
    missingCriteria: missing,
  };
}
