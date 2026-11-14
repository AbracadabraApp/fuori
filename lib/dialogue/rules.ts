/**
 * The rules every conversation follows (docs/dialogue-model.md → How the code
 * is organised): one prompt file, content/<country>/prompts/dialogue.md, added
 * to every turn's system prompt, whatever the kind or level. A fix to how
 * characters handle what the learner said goes there, once.
 */
import { readPromptFile } from '@/lib/prompts/template';
import type { Heard } from './heard';

export function dialogueVersion(): string {
  return readPromptFile('dialogue.md').version;
}

/** A system prompt with the shared rules after it */
export function withDialogueRules(system: string): string {
  return `${system}\n\n${readPromptFile('dialogue.md').block('Every conversation')}`;
}

/** The note for the turn where the character closes a long visit itself (the 8th turn at Beginner, the 15th at Intermediate and Advanced) */
export function closeNote(): string {
  return readPromptFile('dialogue.md').block('Close');
}

/** The note that follows the learner's line when it was compared with the answers offered */
export function heardNote(heard: Heard): string {
  return readPromptFile('dialogue.md').block(heard === 'said-back' ? 'Heard: said back' : 'Heard: other');
}
