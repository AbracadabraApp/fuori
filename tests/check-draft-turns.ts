// Replies prepared during the silence (lib/draft-turns.ts, /v1/turn `draft`):
// the store hands a draft over once, with the first sentence it already sent;
// a draft nobody claims is dropped and reported (and, in the route, never
// saved); the route only saves through the confirmed turn.
import { readFileSync } from 'fs';
import { DraftStore, type DraftEntry } from '@/lib/draft-turns';

const problems: string[] = [];
const check = (ok: boolean, msg: string) => { if (!ok) problems.push(msg); };
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const wasted: string[] = [];
  const store = new DraftStore<string>(60, (key) => wasted.push(key));

  // A claimed draft: its events (first sentence) replay, then the reply
  store.start('a', async (emit) => { emit({ first: 'Ciao, ' }); await wait(20); return 'reply A'; });
  check(store.has('a'), 'a started draft is held');
  check(!store.start('a', async () => 'again'), 'a second draft of the same turn is ignored');
  await wait(5);
  const seen: unknown[] = [];
  const claimed = store.claim('a', (e) => seen.push(e));
  check(!!claimed && (await claimed.done) === 'reply A', 'the claimed draft gives its reply');
  check(JSON.stringify(seen) === '[{"first":"Ciao, "}]', 'a claim mid-draft gets the first sentence already sent');
  check(!store.has('a') && store.claim('a') === undefined, 'a draft can be claimed only once');

  // Events after the claim go to the claimer live
  store.start('b', async (emit) => { await wait(10); emit({ first: 'Allora ' }); return 'reply B'; });
  const live: unknown[] = [];
  const b = store.claim('b', (e) => live.push(e)) as DraftEntry<string>;
  await b.done;
  check(live.length === 1, 'a first sentence written after the claim is passed on');

  // Spoken over: nobody claims it, it is dropped and reported once
  store.start('c', async () => 'reply C');
  await wait(120);
  check(wasted.length === 1 && wasted[0] === 'c', `an unclaimed draft is reported as wasted (got ${JSON.stringify(wasted)})`);
  check(!store.has('c'), 'an unclaimed draft is dropped');
  check(store.claim('c') === undefined, 'a dropped draft cannot be claimed');

  // A claimed draft is not reported
  store.start('d', async () => 'reply D');
  store.claim('d');
  await wait(120);
  check(!wasted.includes('d'), 'a claimed draft is not reported as wasted');

  store.clear();

  // The route: drafts are written without saving; only the confirmed turn saves
  const route = readFileSync('app/v1/turn/route.ts', 'utf8');
  const take = readFileSync('lib/conversation/take-turn.ts', 'utf8');
  check(/deferSave:\s*draft/.test(route), 'a draft runs takeTurn with deferSave');
  check(/if \(!draft\)[\s\S]{0,80}learnAhead\(\)/.test(route), 'the Learn page is not written for a draft');
  check(/after:\s*\(\)\s*=>\s*\{\s*result\.commit\?\.\(\);\s*learnAhead\(\)/.test(route), 'a confirmed draft saves and writes the Learn page');
  check(/draft-wasted/.test(route) && /draft-used/.test(route), 'wasted and used drafts are logged');
  check(!/\bdraft\b[^\n]*lesson/.test(route.replace(/body\.data\.draft/g, '')) || /lesson \|\| body\.data\.welcome/.test(route), 'a draft is refused for lessons and the welcome');
  check(/p\.deferSave/.test(take) && /committed/.test(take), 'takeTurn defers the save and commits it once');
}

main().then(() => {
  if (problems.length) {
    console.error(`check-draft-turns: ${problems.length} problem(s)\n- ${problems.join('\n- ')}`);
    process.exit(1);
  }
  console.log('check-draft-turns: ok');
});
