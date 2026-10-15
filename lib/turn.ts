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
  /** Magda's system prompt and first turn instead of the character prompt */
  system?: string;
  firstTurn?: string;
}): Promise<TurnReply> {
  const prompt = buildTurnPrompt(params);

  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 800, // was 2048; a reply is ~20 words. Caps the cost of a turn someone tries to stretch (docs/12-native-app.md)
    temperature: 1.0,
    system: prompt.system,
    messages: prompt.messages,
    output_config: {
      format: { type: 'json_schema', schema: turnOutputJsonSchema },
    },
  });

  // Cut off mid-JSON: say so, rather than "invalid JSON"
  if (response.stop_reason === 'max_tokens') {
    throw new Error(`Reply hit max_tokens (${response.usage.output_tokens} tokens)`);
  }

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
