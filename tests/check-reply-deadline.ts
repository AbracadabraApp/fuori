// A character reply with a deadline and one retry (lib/claude.ts
// finalWithDeadline; Doña Rosa, 2026-10-26: a reply stalled ~40 s and the
// scene hung). Fake streams, no API calls.
import Anthropic from '@anthropic-ai/sdk';
import { finalWithDeadline, ReplyStalled } from '@/lib/claude';

const problems: string[] = [];
const check = (what: string, ok: boolean, got?: unknown) => { if (!ok) problems.push(`${what}${got === undefined ? '' : `: ${String(got)}`}`); };

/** A stream that answers after `ms` with `value`, or fails with `err`; counts aborts */
function fake(ms: number, value: string, err?: Error) {
  const state = { aborted: false };
  return {
    state,
    stream: {
      finalMessage: () => new Promise<string>((resolve, reject) => setTimeout(() => (err ? reject(err) : resolve(value)), ms)),
      abort: () => { state.aborted = true; },
    },
  };
}

async function main() {
  // Stalls once, then answers: retried, and the stalled attempt is aborted
  let attempts: ReturnType<typeof fake>[] = [];
  let got = await finalWithDeadline(() => { const f = fake(attempts.length === 0 ? 500 : 10, `reply ${attempts.length + 1}`); attempts.push(f); return f.stream; }, 100);
  check('stalled once: the retry answers', got === 'reply 2', got);
  check('stalled attempt aborted', attempts[0].state.aborted);

  // Stalls twice: gives up with ReplyStalled
  attempts = [];
  let err: unknown;
  try { await finalWithDeadline(() => { const f = fake(500, 'never'); attempts.push(f); return f.stream; }, 50); } catch (e) { err = e; }
  check('stalled twice: ReplyStalled', err instanceof ReplyStalled, err);
  check('two attempts', attempts.length === 2, attempts.length);

  // A server error is retried
  attempts = [];
  const serverError = new Anthropic.InternalServerError(500, { type: 'error', error: { type: 'api_error', message: 'Internal server error' } }, 'Internal server error', new Headers());
  got = await finalWithDeadline(() => { const f = fake(5, 'ok', attempts.length === 0 ? serverError : undefined); attempts.push(f); return f.stream; }, 100);
  check('500: retried and answered', got === 'ok' && attempts.length === 2, `${got} after ${attempts.length}`);

  // A bad request isn't retried
  attempts = [];
  err = undefined;
  const bad = new Anthropic.BadRequestError(400, { type: 'error', error: { type: 'invalid_request_error', message: 'bad' } }, 'bad', new Headers());
  try { await finalWithDeadline(() => { const f = fake(5, 'x', bad); attempts.push(f); return f.stream; }, 100); } catch (e) { err = e; }
  check('400: not retried', err === bad && attempts.length === 1, attempts.length);

  // A normal reply: one attempt
  attempts = [];
  got = await finalWithDeadline(() => { const f = fake(5, 'quick'); attempts.push(f); return f.stream; }, 100);
  check('a quick reply: one attempt', got === 'quick' && attempts.length === 1, attempts.length);
}

main()
  .catch((e) => problems.push(String(e)))
  .finally(() => {
    if (problems.length) {
      console.error(problems.join('\n'));
      process.exit(1);
    }
    console.log('OK: a stalled or failed character reply is retried once, then gives up; bad requests are not retried');
  });
