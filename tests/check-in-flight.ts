// A turn resent while the first copy is being answered gets the same answer,
// not a second one (lib/in-flight.ts; whole-app scan, 2026-10-29)
import { sharedWhileRunning } from '@/lib/in-flight';

const problems: string[] = [];
const check = (ok: boolean, msg: string) => { if (!ok) problems.push(msg); };

async function main() {
  const running = new Map<string, Promise<string>>();
  let started = 0;
  const work = (v: string, ms: number) => () => { started++; return new Promise<string>((r) => setTimeout(() => r(v), ms)); };
  const [a, b] = await Promise.all([sharedWhileRunning(running, 'k', work('first', 30)), sharedWhileRunning(running, 'k', work('second', 5))]);
  check(started === 1 && a === 'first' && b === 'first', `same key at once: one answer for both (started ${started}, got ${a}/${b})`);
  check(running.size === 0, 'cleared once done');
  const c = await sharedWhileRunning(running, 'k', work('later', 5));
  check(c === 'later' && started === 2, 'the same key later starts again');
  await Promise.all([sharedWhileRunning(running, 'x', work('x', 5)), sharedWhileRunning(running, 'y', work('y', 5))]);
  check(started === 4, 'different keys both run');
  await Promise.all([sharedWhileRunning(running, null, work('n', 5)), sharedWhileRunning(running, null, work('n', 5))]);
  check(started === 6, 'no key: never shared');
  const failing = sharedWhileRunning(running, 'f', () => Promise.reject(new Error('boom')));
  await failing.catch(() => {});
  check(running.size === 0, 'cleared after a failure too');
  if (problems.length) { console.error('FAIL:\n  ' + problems.join('\n  ')); process.exit(1); }
  console.log('OK: a turn resent while the first is answered gets the same answer; cleared after');
}
main();
