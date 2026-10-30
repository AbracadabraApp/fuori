import Anthropic from '@anthropic-ai/sdk';

/**
 * Single entry point for Claude calls (see CLAUDE.md).
 * Model IDs get retired; keep the ID here, overridable with CLAUDE_MODEL.
 */
export const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-5-5';

/** The characters' replies only (lib/turn.ts); the judges keep CLAUDE_MODEL.
 *  Set TURN_MODEL in a test to try a faster model without changing the judge. */
export const TURN_MODEL = process.env.TURN_MODEL || CLAUDE_MODEL;

// Every call has a limit (whole-app scan, 2026-10-29): the SDK's default is
// 10 minutes and two retries, so a stalled call could hang a screen for half
// an hour. Background calls (memory, study file, judge, level) get 2 minutes
// and one retry; calls a learner is waiting on pass a tighter limit below.
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  timeout: 120_000,
  maxRetries: 1,
});

/** For calls a learner waits on (say it, reply buttons, onboarding): a stall shows as an error they can retry */
export const WAITING = { timeout: 20_000, maxRetries: 1 } as const;
/** The Learn page writes more (up to 8000 tokens) */
export const WAITING_LONG = { timeout: 45_000, maxRetries: 1 } as const;

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
  start: () => { finalMessage(): Promise<M>; abort(): void; on?(event: 'text', listener: (...args: never[]) => void): unknown },
  ms = REPLY_DEADLINE_MS,
  tries = 2,
  opts: { canRetry?: () => boolean; totalMs?: number } = {}
): Promise<M> {
  // `ms` is how long the reply may go quiet (before its first words, or
  // between them), not its whole length: a long reply still arriving isn't
  // a stall (whole-app scan, 2026-10-29). `totalMs` caps the whole attempt.
  const totalMs = opts.totalMs ?? ms * 3;
  for (let attempt = 1; ; attempt++) {
    const stream = start();
    let quiet: ReturnType<typeof setTimeout> | undefined;
    let whole: ReturnType<typeof setTimeout> | undefined;
    let stalled: (e: Error) => void = () => {};
    const deadline = new Promise<never>((_, reject) => {
      stalled = reject;
    });
    const stall = (after: number) => {
      stream.abort();
      stalled(new ReplyStalled(after));
    };
    const arm = () => {
      clearTimeout(quiet);
      quiet = setTimeout(() => stall(ms), ms);
    };
    arm();
    whole = setTimeout(() => stall(totalMs), totalMs);
    stream.on?.('text', arm);
    try {
      return await Promise.race([stream.finalMessage(), deadline]);
    } catch (err) {
      const retryable =
        err instanceof ReplyStalled ||
        err instanceof Anthropic.APIConnectionError ||
        (err instanceof Anthropic.APIError && (err.status === 429 || err.status === 529 || (err.status ?? 0) >= 500 || err.status === undefined));
      // Once the caller has sent part of this reply on (its first sentence
      // went to the app and its voice started), a retry would write a
      // different reply that can't follow it: fail cleanly instead
      const allowed = opts.canRetry ? opts.canRetry() : true;
      if (!retryable || attempt >= tries || !allowed) throw err;
      console.error(JSON.stringify({ level: 'warn', where: 'claude reply', attempt, retrying: true, message: err instanceof Error ? err.message : String(err) }));
    } finally {
      clearTimeout(quiet);
      clearTimeout(whole);
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
