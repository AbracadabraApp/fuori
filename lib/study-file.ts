/**
 * Magda's study file: her short, cumulative notes on one learner
 * (docs/02-game-design.md → The study file). It is her row in
 * character_memories, so her prompt gets it like any character's memory;
 * there, `visits` counts lessons.
 *
 * Written after every conversation in town (folding in its learning notes)
 * and after every lesson (lib/remember.ts). Prompt: content/<country>/prompts/study-file.md.
 *
 * Server-side only.
 */

import { z } from 'zod';
import { anthropic, CLAUDE_MODEL, replyText } from './claude';
import { query } from './db';
import { readPromptFile, fill } from './prompts/template';
import { language, tutor } from '@/content';
import type { CharacterSheet } from './types';
import type { ConversationTurn, ReviewLog } from './memory';

/**
 * Study files being rewritten after a conversation, by learner (lib/remember.ts
 * runs it after the end call has answered): Magda's next turn waits for it,
 * so a lesson started straight after a conversation knows about it (the live
 * test's lesson came before the update, 2026-10-29). One process per country.
 */
const studyFileWrites = new Map<string, Promise<void>>();

/** Record a study file rewrite in progress for this learner */
export function trackStudyFileWrite(learnerId: string, write: Promise<void>): void {
  studyFileWrites.set(learnerId, write);
  const clear = () => {
    if (studyFileWrites.get(learnerId) === write) studyFileWrites.delete(learnerId);
  };
  write.then(clear, clear);
}

/** Resolves when no rewrite is in progress for this learner (at most `ms`) */
export async function studyFileReady(learnerId: string, ms = 30_000): Promise<void> {
  const pending = studyFileWrites.get(learnerId);
  if (!pending) return;
  await Promise.race([pending.catch(() => {}), new Promise((r) => setTimeout(r, ms))]);
}

/** The study file stays short enough to sit in every lesson prompt */
export const STUDY_FILE_LINES = 20;

export type StudyFileInput =
  | { after: 'conversation'; studyFile: string[]; character: CharacterSheet; learningNotes: ReviewLog }
  | { after: 'lesson'; studyFile: string[]; character: CharacterSheet; turns: ConversationTurn[] };

/** Rewrites the study file. Tests pass a fake. */
export type StudyFileWriter = (input: StudyFileInput) => Promise<string[]>;

const outputSchema = {
  additionalProperties: false,
  type: 'object',
  properties: { notes: { type: 'array', items: { type: 'string' } } },
  required: ['notes'],
};
const Output = z.object({ notes: z.array(z.string()) });

export function studyFilePromptVersion(): string {
  return readPromptFile('study-file.md').version;
}

export function buildStudyFilePrompt(input: StudyFileInput): { system: string; user: string } {
  const f = readPromptFile('study-file.md');
  const c = input.character;
  const place = c.appearance?.setting ?? c.city;
  const studyFile = input.studyFile.length ? input.studyFile.join('\n') : 'Empty: this is the first entry.';
  const system = fill(f.block('System prompt'), { language: language.name });
  const user =
    input.after === 'conversation'
      ? fill(f.block('After a conversation'), {
          studyFile,
          name: c.name,
          role: c.role,
          place,
          city: c.city,
          learningNotes: learningNotesAsLines(input.learningNotes) || 'Nothing notable.',
        })
      : fill(f.block('After a lesson'), {
          studyFile,
          place,
          city: c.city,
          transcript: input.turns.map((t) => `${t.who === 'npc' ? 'Magda' : 'Student'}: ${t.text}`).join('\n'),
        });
  return { system, user };
}

export const writeStudyFileWithClaude: StudyFileWriter = async (input) => {
  const prompt = buildStudyFilePrompt(input);
  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    // The thinking counts toward this: at 2048 Magda's study file came back
    // cut off ("Unterminated string in JSON", Josh's Mexico lesson,
    // 2026-10-29, build 8; the roadmap's "study-file save failing in Mexico")
    max_tokens: 8000,
    system: prompt.system,
    messages: [{ role: 'user', content: prompt.user }],
    output_config: { format: { type: 'json_schema', schema: outputSchema } },
  });
  if (response.stop_reason === 'max_tokens') throw new Error(`Study file call hit max_tokens (${response.usage.output_tokens} tokens)`);
  const { notes } = Output.parse(JSON.parse(replyText(response)));
  return notes.map((n) => n.trim()).filter(Boolean).slice(0, STUDY_FILE_LINES);
};

/** A conversation's learning notes as the short lines the study file prompt reads. */
export function learningNotesAsLines(r: ReviewLog): string {
  return [
    ...(r.mistakes ?? []).map((m) => `Mistake: said "${m.said}", better "${m.better}" (${m.why})`),
    ...(r.missed ?? []).map((m) => `Didn't understand: "${m.phrase}" (${m.en})`),
    ...(r.english ?? []).map((e) => `Fell back on English: "${e}"`),
    ...(r.items ?? []).map((i) => `Worth learning: "${i.phrase}" (${i.en})`),
  ].join('\n');
}

/**
 * Save the study file after a conversation in town. Changes only Magda's
 * notes: her lesson count and last lesson stay as they are.
 */
export async function saveStudyFile(learnerId: string, notes: string[]): Promise<void> {
  await query(
    `INSERT INTO character_memories (learner_id, character_id, visits, last_visit, notes)
     VALUES ($1, $2, 0, NULL, $3)
     ON CONFLICT (learner_id, character_id) DO UPDATE SET notes = $3`,
    [learnerId, tutor.id, notes]
  );
}
