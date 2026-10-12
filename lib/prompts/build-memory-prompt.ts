/**
 * Builds the end-of-conversation memory prompt from content/it/prompts/memory.md.
 * Server-side only (reads the template from disk).
 */

import { readPromptFile, fill } from './template';
import { language } from '@/content/it/language';

export interface MemoryPromptInput {
  character: { name: string; age: number; role: string; city: string };
  notes: string[];
  turns: { who: 'npc' | 'learner'; text: string }[];
}

export function memoryPromptVersion(): string {
  return readPromptFile('memory.md').version;
}

export function buildMemoryPrompt(input: MemoryPromptInput): { system: string; user: string; version: string } {
  const f = readPromptFile('memory.md');
  const c = input.character;
  const values = {
    name: c.name,
    age: String(c.age),
    role: c.role,
    city: c.city,
    language: language.name,
  };
  const system = fill(f.block('System prompt'), values);
  const user = fill(f.block('User message'), {
    ...values,
    notes: input.notes.length ? input.notes.join('\n') : 'Nothing yet. They hadn\'t met before.',
    transcript: input.turns.map((t) => `${t.who === 'npc' ? c.name : 'Person'}: ${t.text}`).join('\n'),
  });
  return { system, user, version: f.version };
}
