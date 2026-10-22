/**
 * Reply buttons for scaffolding (docs/beginner-scaffolding.md, lib/scaffold.ts):
 * two whole-line replies to the character's last line, written by a separate
 * call so the character's turn stays { line, en }. Prompt in
 * content/<country>/prompts/replies.md: two good replies for the tap and read
 * stages, one that fits and one that doesn't for the choose stage.
 *
 * Called by POST /v1/replies and `npm run test:conversations -- --learner=tap`.
 * Server-side only.
 */

import { z } from 'zod';
import { anthropic, CLAUDE_MODEL, replyText } from './claude';
import { readPromptFile, fill } from './prompts/template';
import { language } from '@/content';
import type { CharacterSheet, Turn } from './types';

const Reply = z.object({ line: z.string(), en: z.string() });
const RepliesSchema = z.object({ frame: z.string(), replies: z.array(Reply).length(2) });
export type Replies = z.infer<typeof RepliesSchema> & {
  /** Choose stage: which of the two replies fits (the other answers something else) */
  fits?: number;
};
const ChoiceSchema = z.object({ fits: Reply, misfit: Reply });

const outputSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    frame: { type: 'string' },
    replies: {
      type: 'array',
      items: { type: 'object', additionalProperties: false, properties: { line: { type: 'string' }, en: { type: 'string' } }, required: ['line', 'en'] },
    },
  },
  required: ['frame', 'replies'],
};

const replyJson = { type: 'object', additionalProperties: false, properties: { line: { type: 'string' }, en: { type: 'string' } }, required: ['line', 'en'] };
const choiceSchema = { type: 'object', additionalProperties: false, properties: { fits: replyJson, misfit: replyJson }, required: ['fits', 'misfit'] };

export function repliesPromptVersion(): string {
  return readPromptFile('replies.md').version;
}

export function buildRepliesPrompt(character: CharacterSheet, transcript: Turn[], block: 'System prompt' | 'Choose prompt' = 'System prompt'): { system: string; user: string } {
  const system = fill(readPromptFile('replies.md').block(block), { language: language.name, name: character.name, role: character.role });
  const user = transcript.map((t) => `${t.who === 'npc' ? character.name : 'Person'}: ${t.transcript}`).join('\n');
  return { system, user };
}

/**
 * Why replies can't be written for this conversation yet, or null when they
 * can: the character must have spoken last, since the replies answer them.
 */
export function cannotOfferReplies(transcript: Turn[]): string | null {
  if (transcript.length === 0) return 'The conversation has no lines yet';
  if (transcript[transcript.length - 1].who !== 'npc') return 'The character has not answered yet';
  return null;
}

export async function writeReplies(character: CharacterSheet, transcript: Turn[]): Promise<Replies> {
  const prompt = buildRepliesPrompt(character, transcript);
  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 3000, // leaves room for thinking, which counts toward it
    system: prompt.system,
    messages: [{ role: 'user', content: prompt.user }],
    output_config: { format: { type: 'json_schema', schema: outputSchema } },
  });
  if (response.stop_reason === 'max_tokens') throw new Error(`Reply buttons hit max_tokens (${response.usage.output_tokens} tokens)`);
  return RepliesSchema.parse(JSON.parse(replyText(response)));
}

/**
 * The choose stage: one reply that fits and one, correct but out of place,
 * that doesn't, in random order so the right one isn't always first
 */
export async function writeChoice(character: CharacterSheet, transcript: Turn[], random: () => number = Math.random): Promise<Replies> {
  const prompt = buildRepliesPrompt(character, transcript, 'Choose prompt');
  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 3000, // leaves room for thinking, which counts toward it
    system: prompt.system,
    messages: [{ role: 'user', content: prompt.user }],
    output_config: { format: { type: 'json_schema', schema: choiceSchema } },
  });
  if (response.stop_reason === 'max_tokens') throw new Error(`Reply buttons (choose) hit max_tokens (${response.usage.output_tokens} tokens)`);
  return shuffleChoice(ChoiceSchema.parse(JSON.parse(replyText(response))), random);
}

export function shuffleChoice(c: z.infer<typeof ChoiceSchema>, random: () => number = Math.random): Replies {
  const fitsFirst = random() < 0.5;
  return { frame: '', replies: fitsFirst ? [c.fits, c.misfit] : [c.misfit, c.fits], fits: fitsFirst ? 0 : 1 };
}
