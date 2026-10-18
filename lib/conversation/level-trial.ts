/**
 * A level block from content/<country>/prompts/levels.md tried on a few
 * learners before anyone else (docs/test-ideas.md). Off unless both are set:
 *   LEVEL_TRIAL           the block's name, e.g. "Beginner: still you, sometimes ask"
 *   LEVEL_TRIAL_LEARNERS  learner ids, separated by commas
 * The recorded prompt version then reads "<character.md version>+<block>",
 * so trial conversations can be told apart in review.
 */

import { readPromptFile } from '@/lib/prompts/template';

export function trialLevel(learnerId: string | null, env: Record<string, string | undefined> = process.env): string | undefined {
  const block = env.LEVEL_TRIAL?.trim();
  if (!block || !learnerId) return undefined;
  const ids = (env.LEVEL_TRIAL_LEARNERS ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  if (!ids.includes(learnerId)) return undefined;
  // A misspelt name must fail loudly at the first turn, not run today's prompt unnoticed
  readPromptFile('levels.md').block(block);
  return block;
}
