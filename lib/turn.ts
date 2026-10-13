/**
 * One conversation turn: build the prompt, call Claude, validate { it, en }.
 * Used by /api/turn and by tests/conversations, so tests exercise the real path.
 */

import { z } from 'zod';
import { anthropic, CLAUDE_MODEL, replyText } from '@/lib/claude';
import { turnOutputJsonSchema } from '@/lib/prompts/turn-output-schema';
import { buildTurnPrompt, type HistoryMode, type RememberedLearner } from '@/lib/prompts/build-turn-prompt';
import type { CharacterSheet, Turn } from '@/lib/types';

export const TurnOutputSchema = z.object({
  line: z.string().describe('What the character says, in the language the person is learning'),
  en: z.string().describe('English translation of the reply'),
});

export type TurnReply = z.infer<typeof TurnOutputSchema>;

export async function runTurn(params: {
  character: CharacterSheet;
  transcript: Turn[];
  learnerSaid?: string;
  /** What this character remembers about the learner, if they've met */
  memory?: RememberedLearner;
  /** How the conversation so far is sent; defaults to TURN_HISTORY (see build-turn-prompt.ts) */
  history?: HistoryMode;
}): Promise<TurnReply> {
  const prompt = buildTurnPrompt(params);

  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 8192, // Increased for models with thinking enabled
    temperature: 1.0,
    system: prompt.system,
    messages: prompt.messages,
    output_config: {
      format: { type: 'json_schema', schema: turnOutputJsonSchema },
    },
  });

  const text = replyText(response);

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    console.error('Failed to parse Claude response as JSON:', text);
    throw new Error('Claude returned invalid JSON');
  }

  return TurnOutputSchema.parse(parsed);
}
