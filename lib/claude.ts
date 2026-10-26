import Anthropic from '@anthropic-ai/sdk';

/**
 * Single entry point for Claude calls (see CLAUDE.md).
 * Model IDs get retired; keep the ID here, overridable with CLAUDE_MODEL.
 */
export const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-5-5';

/** The characters' replies only (lib/turn.ts); the judges keep CLAUDE_MODEL.
 *  Set TURN_MODEL in a test to try a faster model without changing the judge. */
export const TURN_MODEL = process.env.TURN_MODEL || CLAUDE_MODEL;

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/** A character's reply takes 2–5 s; past this it has stalled */
export const REPLY_DEADLINE_MS = 15_000;

/**
 * A streamed character reply with a deadline and one retry (Josh, Doña Rosa,
 * 2026-10-26: a turn stalled for about 40 s, then came back "Internal server
 * error", and he had to leave and come back; the client waits up to 10
 * minutes by default). `start` begins an attempt (listeners included); if it
 * hasn't finished within `ms`, or Claude answers busy or failed (429, 5xx, a
 * dropped connection), it's abandoned and tried once more. Anything else
 * (a bad request) isn't retried.
 */
export async function finalWithDeadline<M>(
  start: () => { finalMessage(): Promise<M>; abort(): void },
  ms = REPLY_DEADLINE_MS,
  tries = 2
): Promise<M> {
  for (let attempt = 1; ; attempt++) {
    const stream = start();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const deadline = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        stream.abort();
        reject(new ReplyStalled(ms));
      }, ms);
    });
    try {
      return await Promise.race([stream.finalMessage(), deadline]);
    } catch (err) {
      const retryable =
        err instanceof ReplyStalled ||
        err instanceof Anthropic.APIConnectionError ||
        (err instanceof Anthropic.APIError && (err.status === 429 || err.status === 529 || (err.status ?? 0) >= 500 || err.status === undefined));
      if (!retryable || attempt >= tries) throw err;
      console.error(JSON.stringify({ level: 'warn', where: 'claude reply', attempt, retrying: true, message: err instanceof Error ? err.message : String(err) }));
    } finally {
      clearTimeout(timer);
    }
  }
}

/** A reply that didn't finish in time */
export class ReplyStalled extends Error {
  constructor(ms: number) {
    super(`Claude's reply took longer than ${ms / 1000} s`);
  }
}

/**
 * The text of a Claude reply. Replies can start with a non-text block
 * (such as thinking), so never assume content[0] is the text.
 */
export function replyText(response: {
  content: Array<{ type: string; text?: string }>;
  stop_reason?: string | null;
}): string {
  const text = response.content
    .filter((b) => b.type === 'text' && typeof b.text === 'string')
    .map((b) => b.text)
    .join('');
  if (!text) {
    const types = response.content.map((b) => b.type).join(', ') || 'none';
    throw new Error(`Claude returned no text (blocks: ${types}; stop: ${response.stop_reason ?? 'unknown'})`);
  }
  return text;
}
