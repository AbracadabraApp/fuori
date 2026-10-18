/**
 * The level of what a character says (content/<country>/prompts/level.md):
 * for each character line, which of four listeners knows each word. Listener
 * 1–2 is a beginner, so a line a beginner can follow has at least 90% of its
 * words known by listener 1 or 2. The replay test scores it; real play doesn't
 * yet (one call per line).
 */

import { z } from 'zod';
import { anthropic, CLAUDE_MODEL, replyText } from '@/lib/claude';
import { readPromptFile, fill } from '@/lib/prompts/template';
import { language } from '@/content';
import type { ScoredTurn } from '@/lib/quality';

export interface LevelScore {
  /** Version of level.md that judged it */
  judgeVersion: string;
  /** Per character line, in order: the share of its words a beginner (listener 1–2) knows */
  beginnerKnows: number[];
}

const Words = z.object({ words: z.array(z.object({ w: z.string(), n: z.number().int().min(1).max(4) })).min(1) });
const wordsJsonSchema = {
  type: 'object', additionalProperties: false, required: ['words'],
  properties: { words: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['w', 'n'], properties: { w: { type: 'string' }, n: { type: 'integer', description: '1-4' } } } } },
};

export function levelPromptVersion(): string {
  return readPromptFile('level.md').version;
}

export function buildLevelPrompt(line: string): string {
  return fill(readPromptFile('level.md').block('User message'), { language: language.name, line });
}

/** The share of a line's words that listener 1 or 2 knows */
export async function beginnerKnows(line: string): Promise<number> {
  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 4000, // thinking counts toward it
    messages: [{ role: 'user', content: buildLevelPrompt(line) }],
    output_config: { format: { type: 'json_schema', schema: wordsJsonSchema } },
  });
  if (response.stop_reason === 'max_tokens') throw new Error(`Level judge hit max_tokens (${response.usage.output_tokens} tokens)`);
  const { words } = Words.parse(JSON.parse(replyText(response)));
  return words.filter((x) => x.n <= 2).length / words.length;
}

export type LineJudge = (line: string) => Promise<number>;

export async function levelOfConversation(turns: ScoredTurn[], judge: LineJudge = beginnerKnows): Promise<LevelScore> {
  const lines = turns.filter((t) => t.who === 'npc').map((t) => t.text);
  return { judgeVersion: levelPromptVersion(), beginnerKnows: await Promise.all(lines.map(judge)) };
}
