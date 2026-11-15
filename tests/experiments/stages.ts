// The old Beginner's stages (S1 to S4), for experiments only. The game stopped playing them 2026-11-15 (Josh: switch
// off "the old Beginner and its Old/New switch … then the stages, paths and parts format"); they were lib/path.ts →
// STAGES and stageText. Experiments that compare against the old Beginner, or replay its moments
// (tests/experiments/moments.json), still build its prompt from here: beginner.md with these leveling.md blocks.
import { language } from '@/content';
import { readPromptFile, fill } from '@/lib/prompts/template';

export type StageId = 'S1' | 'S2' | 'S3' | 'S4';

export interface Stage {
  id: StageId;
  /** beginner.md in parts, or the character prompt with a levels.md block */
  path: 'beginner' | 'character';
  /** beginner path: leveling.md blocks added to beginner.md's system prompt */
  blocks: string[];
  /** beginner path: answers to say back kept (the prompt asks; this enforces it) */
  answers: number;
  /** character path: the levels.md block */
  level?: string;
}

export const STAGES: Record<StageId, Stage> = {
  S1: { id: 'S1', path: 'beginner', blocks: ['Talk: stage 1', 'Answers: two'], answers: 2 },
  S2: { id: 'S2', path: 'beginner', blocks: ['Talk: stage 2', 'Language: 2', 'Answers: one'], answers: 1 },
  S3: { id: 'S3', path: 'beginner', blocks: ['Talk: stage 3', 'Language: 4', 'Answers: frame', 'Echo: new words'], answers: 1 },
  S4: { id: 'S4', path: 'character', blocks: [], answers: 0, level: 'Beginner: still you, ask' },
};

/** The stage's blocks as text for beginner.md's system prompt */
export function stageText(stage: Stage, role: string): string {
  const f = readPromptFile('leveling.md');
  return stage.blocks.map((b) => fill(f.block(b), { language: language.name, role })).join('\n');
}
