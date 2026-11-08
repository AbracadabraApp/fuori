// Real play fills two scorecard rows that were blank (2026-11-08, Josh: reply
// time by the server's time, level from a sample of lines): a saved reply
// carries its server time, scoring turns that into the scorecard's reply time,
// and level is judged on a few evenly spread lines, not every one. No Claude
// calls: the judges are fakes.
import { exchangeTurns } from '@/lib/recording';
import { scoreConversation, type Judge, type ScoredTurn } from '@/lib/quality';
import { levelOfConversation, sampleLines, REAL_PLAY_LEVEL_SAMPLE } from '@/lib/level';
import { scorecard } from '@/lib/scorecard';

const problems: string[] = [];
const check = (ok: boolean, msg: string) => { if (!ok) problems.push(msg); };

async function main() {
  // A saved reply carries its time; an opening and the learner's line don't
  const at = '2026-11-08T10:00:00.000Z';
  const reply = { line: 'Buongiorno!', en: 'Good morning!' };
  const first = exchangeTurns({ reply, replyMs: 1800 }, at);
  check(first.length === 1 && !('ms' in first[0]), 'an opening (no learner line) saves no reply time');
  const next = exchangeTurns({ learnerSaid: 'Ciao', reply, replyMs: 1800 }, at);
  check(next.length === 2 && !('ms' in next[0]), "the learner's line saves no reply time");
  check((next[1] as { ms?: number }).ms === 1800, "the character's reply saves the server's time");
  check(!('ms' in exchangeTurns({ learnerSaid: 'Ciao', reply }, at)[1]), 'no time given: none saved');

  // Scoring turns the saved times into the scorecard's reply time
  const fakeJudge: Judge = async () => ({
    pronunciationCorrections: 0, correctionsAsked: 0, correctionsUnprompted: 0, garbled: 0, garbledMissed: 0,
    lost: [], englishUnasked: 0, incoherent: 0, alive: 7, words: 0,
  } as never);
  const turns: ScoredTurn[] = [
    { who: 'npc', text: 'Ciao!' },
    { who: 'learner', text: 'Ciao' },
    { who: 'npc', text: 'Come stai?', ms: 1000 },
    { who: 'learner', text: 'Bene' },
    { who: 'npc', text: 'Bene, grazie.', ms: 3000 },
  ];
  const score = await scoreConversation({ name: 'Rita', age: 58, role: 'host', city: 'Roma' } as never, turns, fakeJudge);
  check(JSON.stringify(score.replyMs) === '[1000,3000]', `the opening has no time; the replies do (got ${JSON.stringify(score.replyMs)})`);
  const row = scorecard([score]).rows.find((r) => r.key === 'replySeconds')!;
  check(row.value === 2, `the scorecard's reply time is the median of the replies (got ${row.value})`);
  const none = await scoreConversation({ name: 'Rita', age: 58, role: 'host', city: 'Roma' } as never, turns.map(({ ms, ...t }) => t), fakeJudge);
  check(none.replyMs === undefined, 'conversations saved before this have no reply time and stay blank');

  // Level: a sample of lines, evenly spread, first and last included
  check(JSON.stringify(sampleLines([1, 2], 3)) === '[1,2]', 'fewer lines than the sample: all of them');
  check(JSON.stringify(sampleLines([1, 2, 3, 4, 5], 3)) === '[1,3,5]', 'five lines, three sampled: first, middle, last');
  check(JSON.stringify(sampleLines(Array.from({ length: 10 }, (_, i) => i), 3)) === '[0,5,9]', 'ten lines, three sampled, spread evenly');
  let calls = 0;
  const lines: ScoredTurn[] = Array.from({ length: 12 }, (_, i) => ({ who: 'npc' as const, text: `riga ${i}` }));
  const level = await levelOfConversation(lines, async () => { calls++; return 0.9; }, REAL_PLAY_LEVEL_SAMPLE);
  check(calls === REAL_PLAY_LEVEL_SAMPLE && level.beginnerKnows.length === REAL_PLAY_LEVEL_SAMPLE, `real play judges ${REAL_PLAY_LEVEL_SAMPLE} lines, one call each (got ${calls})`);
  calls = 0;
  await levelOfConversation(lines, async () => { calls++; return 0.9; });
  check(calls === 12, 'the replay still judges every line');

  if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
  console.log('OK: real play saves the reply time and scores a sample of lines for level');
}

main().catch((e) => { console.error(e); process.exit(1); });
