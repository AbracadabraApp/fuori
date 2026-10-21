/**
 * The Learn page for one conversation (docs/learn.md → The page): corrections
 * as tap-to-fix buttons, a plain word list, one thing good to know. Written
 * from the transcript by content/<country>/prompts/learn.md as JSON
 * (lib/prompts/learn-output-schema.ts); the app lays it out.
 *
 * Experimental: called by POST /v1/learn, which the app uses only when
 * Settings → "Learn page (test)" is on (off by default). Server-side only.
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';
import { anthropic, CLAUDE_MODEL, replyText } from './claude';
import { readPromptFile, fill } from './prompts/template';
import { learnOutputJsonSchema } from './prompts/learn-output-schema';
import { language, pack } from '@/content';
import type { CharacterSheet, Turn } from './types';

const LearnPageSchema = z.object({
  corrections: z.array(z.object({ said: z.string(), why: z.string(), right: z.string() })),
  words: z.object({
    things: z.array(z.object({ word: z.string(), en: z.string(), plural: z.string() })),
    doing: z.array(z.object({ infinitive: z.string(), en: z.string(), form: z.string() })),
  }),
  goodToKnow: z.string(),
});
export type LearnPageOut = z.infer<typeof LearnPageSchema>;

/** Learn is written for a country only once it has a learn.md prompt (Italy first) */
export function learnAvailable(): boolean {
  return existsSync(join(process.cwd(), 'content', pack.id, 'prompts', 'learn.md'));
}

export function learnPromptVersion(): string {
  return readPromptFile('learn.md').version;
}

/**
 * Why a page can't be written for this conversation yet, or null when it can:
 * the learner has to have said something, since the page is about their lines.
 */
export function cannotWriteLearnPage(transcript: Turn[]): string | null {
  if (!transcript.some((t) => t.who === 'learner')) return 'Say something to the character first';
  return null;
}

export function buildLearnPrompt(character: CharacterSheet, city: string, transcript: Turn[], notes = '(none)'): { system: string; user: string } {
  const f = readPromptFile('learn.md');
  const values = { language: language.name, city, name: character.name, role: character.role };
  const lines = transcript.map((t) => `${t.who === 'learner' ? 'Learner' : character.name}: ${t.transcript}`).join('\n');
  return {
    system: fill(f.block('System prompt'), values),
    user: fill(f.block('User message'), { ...values, notes, transcript: lines }),
  };
}

/** Drops empty entries the model sometimes leaves, so the app never shows a blank row */
export function tidyLearnPage(page: LearnPageOut): LearnPageOut {
  const has = (s: string) => s.trim().length > 0;
  return {
    corrections: page.corrections.filter((c) => has(c.said) && has(c.right)),
    words: {
      things: page.words.things.filter((w) => has(w.word)),
      doing: page.words.doing.filter((w) => has(w.infinitive)),
    },
    goodToKnow: page.goodToKnow.trim(),
  };
}

export async function writeLearnPage(character: CharacterSheet, city: string, transcript: Turn[]): Promise<LearnPageOut> {
  const prompt = buildLearnPrompt(character, city, transcript);
  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 8000, // leaves room for thinking, which counts toward it
    system: prompt.system,
    messages: [{ role: 'user', content: prompt.user }],
    output_config: { format: { type: 'json_schema', schema: learnOutputJsonSchema } },
  });
  if (response.stop_reason === 'max_tokens') throw new Error(`Learn page hit max_tokens (${response.usage.output_tokens} tokens)`);
  return tidyLearnPage(LearnPageSchema.parse(JSON.parse(replyText(response))));
}
