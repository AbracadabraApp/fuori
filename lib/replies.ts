/**
 * Reply buttons for beginner levels 1–3 (docs/beginner-scaffolding.md): two
 * whole-line replies to the character's last line, written by a separate call
 * so the character's turn stays { line, en }. Prompt in
 * content/<country>/prompts/replies.md.
 *
 * Experimental: called by `npm run test:conversations -- --learner=tap` and by
 * POST /v1/replies, which the app uses only when Settings → "Reply buttons
 * (test)" is on (off by default). Server-side only.
 */

import { z } from 'zod';
import { anthropic, CLAUDE_MODEL, replyText } from './claude';
import { readPromptFile, fill } from './prompts/template';
import { language } from '@/content';
import type { CharacterSheet, Turn } from './types';

const Reply = z.object({ line: z.string(), en: z.string() });
const RepliesSchema = z.object({ frame: z.string(), replies: z.array(Reply).length(2) });
export type Replies = z.infer<typeof RepliesSchema>;

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

export function repliesPromptVersion(): string {
  return readPromptFile('replies.md').version;
}

export function buildRepliesPrompt(character: CharacterSheet, transcript: Turn[]): { system: string; user: string } {
  const system = fill(readPromptFile('replies.md').block('System prompt'), { language: language.name, name: character.name, role: character.role });
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
