/**
 * One conversation turn: build the prompt, call Claude, validate { it, en }.
 * Used by /api/turn and by tests/conversations, so tests exercise the real path.
 */

import { z } from 'zod';
import { anthropic, TURN_MODEL, replyText } from '@/lib/claude';
import { turnOutputJsonSchema } from '@/lib/prompts/turn-output-schema';
import { buildTurnPrompt, type RememberedLearner } from '@/lib/prompts/build-turn-prompt';
import type { CharacterSheet, Gender, Turn } from '@/lib/types';
import type { Laps } from '@/lib/timing';
import { lineWhenWritten } from '@/lib/voice/early-voice';

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
  /** Whether the learner is a woman or a man, when known (learners.addressed_as) */
  addressedAs?: Gender;
  /** Magda's system prompt and first turn instead of the character prompt */
  system?: string;
  firstTurn?: string;
  /** Experimental level block (tests and the level trial; see buildTurnPrompt) */
  level?: string;
  levelAt?: 'system' | 'last';
  /** Records Claude's first token and token counts (the speed work) */
  laps?: Laps;
  /** Called with the reply written so far, on every streamed chunk (/v1/turn's LineWatcher) */
  onText?: (snapshot: string) => void;
}): Promise<TurnReply> {
  const prompt = buildTurnPrompt(params);

  // Streamed only to time the first token; the reply is still read whole
  const started = performance.now();
  const stream = anthropic.messages.stream({
    model: TURN_MODEL,
    // Caps the cost of a turn someone tries to stretch (docs/12-native-app.md). Was 2048, then 800; 800 failed
    // 2 of 810 replies, since thinking counts toward it (round 16, 2026-10-18: largest seen 847, none over 1200)
    max_tokens: 1200,
    temperature: 1.0,
    // No thinking before the reply: it was most of the wait (prompt 2026-10-18b changelog).
    // This model turns thinking off with between_tools, not disabled. TURN_THINKING=on brings it back.
    ...(process.env.TURN_THINKING === 'on' ? {} : { thinking: { type: 'between_tools' as const } }),
    system: prompt.system,
    messages: prompt.messages,
    output_config: {
      format: { type: 'json_schema', schema: turnOutputJsonSchema },
    },
  });
  const { laps } = params;
  if (laps) stream.once('text', () => laps.mark('claudeFirstToken', performance.now() - started));
  const { onText } = params;
  if (onText) {
    let lineAt = 0;
    stream.on('text', (_delta, snapshot) => {
      if (!lineAt && lineWhenWritten(snapshot) !== undefined) {
        lineAt = performance.now() - started;
        laps?.mark('claudeLine', lineAt);
      }
      onText(snapshot);
    });
  }
  const response = await stream.finalMessage();
  if (laps) {
    laps.facts.model = response.model;
    laps.facts.inputTokens = response.usage.input_tokens;
    laps.facts.outputTokens = response.usage.output_tokens;
    laps.facts.thought = response.content.some((b) => b.type === 'thinking' || b.type === 'redacted_thinking') ? 'yes' : 'no';
  }

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
