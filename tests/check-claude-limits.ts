// Every Claude call has a limit (whole-app scan, 2026-10-29): the client
// default, and the tighter one for each call a learner waits on. A call
// left without one could hang a screen for up to half an hour.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { anthropic, WAITING, WAITING_LONG } from '@/lib/claude';

const problems: string[] = [];
const check = (ok: boolean, msg: string) => { if (!ok) problems.push(msg); };

check(anthropic.timeout <= 120_000, `client timeout ${anthropic.timeout} ms; at most 120000`);
check(anthropic.maxRetries <= 1, `client retries ${anthropic.maxRetries}; at most 1`);
check(WAITING.timeout <= 30_000 && WAITING_LONG.timeout <= 60_000, 'waiting limits too long');

// The calls a learner waits on pass a waiting limit
for (const file of ['say-it.ts', 'replies.ts', 'onboarding.ts', 'learn.ts']) {
  const src = readFileSync(join('lib', file), 'utf8');
  const calls = src.split('anthropic.messages.create(').length - 1;
  const limited = (src.match(/\}, WAITING(_LONG)?\);/g) ?? []).length;
  check(calls === limited, `lib/${file}: ${calls} Claude calls, ${limited} with a waiting limit`);
}
// No Claude client but lib/claude.ts's
for (const dir of ['lib', 'app']) {
  const walk = (d: string): string[] => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(d, e.name)) : e.name.endsWith('.ts') ? [join(d, e.name)] : []));
  for (const f of walk(dir)) if (f !== join('lib', 'claude.ts')) check(!readFileSync(f, 'utf8').includes('new Anthropic('), `${f} makes its own Claude client`);
}

if (problems.length) { console.error('FAIL:\n  ' + problems.join('\n  ')); process.exit(1); }
console.log('OK: every Claude call has a limit (client 2 min, 1 retry; waiting calls tighter)');
