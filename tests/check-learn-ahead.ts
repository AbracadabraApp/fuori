// The Learn page written ahead (lib/learn-ahead.ts, 2026-10-22): started only
// once the Learn link shows (4 learner lines), used only for exactly the
// conversation it was written from, waited for while it's being written, and
// a failure leaves /v1/learn to write its own. No API calls.
import { writeLearnAhead, learnPageAhead } from '@/lib/learn-ahead';
import type { LearnPageOut } from '@/lib/learn';
import type { CharacterSheet, Turn } from '@/lib/types';

const problems: string[] = [];
const check = (what: string, ok: boolean) => { if (!ok) problems.push(what); };

const character = { id: 'c', name: 'Memo', role: 'tejuino seller' } as CharacterSheet;
const page = (n: number): LearnPageOut => ({ corrections: [], words: { things: [], doing: [] }, goodToKnow: `page ${n}` });
const convo = (learnerLines: number): Turn[] =>
  Array.from({ length: learnerLines }, (_, i) => [
    { who: 'npc' as const, transcript: `line ${i}` },
    { who: 'learner' as const, transcript: `said ${i}` },
  ]).flat().concat({ who: 'npc', transcript: 'last' });

async function main() {
  let calls = 0;
  const write = async (_c: CharacterSheet, _city: string, t: Turn[]) => {
    calls++;
    await new Promise((r) => setTimeout(r, 50));
    return page(t.length);
  };

  // Before the Learn link: nothing written
  check('3 learner lines: not written ahead', !writeLearnAhead({ conversationId: 'a', character, city: 'X', transcript: convo(3), onError: () => {}, write }));
  check('3 learner lines: no call', calls === 0);

  // From the 4th line: written, and found for the same number of turns, waiting while it's written
  const t4 = convo(4);
  check('4 learner lines: written ahead', writeLearnAhead({ conversationId: 'a', character, city: 'X', transcript: t4, onError: () => {}, write }));
  const got = await learnPageAhead('a', t4.length);
  check('found and waited for', got?.goodToKnow === `page ${t4.length}`);
  check('opened again: still there, no new call', (await learnPageAhead('a', t4.length))?.goodToKnow === `page ${t4.length}` && calls === 1);

  // The conversation moved on: the old page isn't used
  check('more turns since: not used', (await learnPageAhead('a', t4.length + 2)) === null);
  check('another conversation: not used', (await learnPageAhead('b', t4.length)) === null);

  // A newer page replaces the older one
  const t5 = convo(5);
  writeLearnAhead({ conversationId: 'a', character, city: 'X', transcript: t5, onError: () => {}, write });
  check('newer page used', (await learnPageAhead('a', t5.length))?.goodToKnow === `page ${t5.length}`);

  // A failure is reported, and the route writes its own (null here)
  let reported: unknown;
  writeLearnAhead({ conversationId: 'f', character, city: 'X', transcript: t4, onError: (e) => (reported = e), write: async () => { throw new Error('claude down'); } });
  check('failed page: null', (await learnPageAhead('f', t4.length)) === null);
  check('failure reported', String(reported) === 'Error: claude down');
}

main()
  .catch((e) => problems.push(String(e)))
  .finally(() => {
    if (problems.length) {
      console.error(problems.join('\n'));
      process.exit(1);
    }
    console.log('OK: the Learn page is written ahead from the 4th line and used only for the same conversation');
  });
