// The scorecard measures added 2026-10-16 (Josh: faster, coherence, feels
// alive, broken replies): reply time from the replay's timings, the two new
// judge counts averaged over the scores that have them (older saved scores
// don't), and the gate failing a change if any conversation broke.
import { scorecard, gate, scorecardAsText } from '@/lib/scorecard';
import type { ConversationScore } from '@/lib/quality';

const problems: string[] = [];
const check = (ok: boolean, msg: string) => { if (!ok) problems.push(msg); };

const base: ConversationScore = {
  judgeVersion: '2026-10-16',
  learnerLines: 3,
  stats: { openerWords: 10, replies: 4, wordsMedian: 12, wordsAvg: 12, wordsMax: 20, longShare: 0, questionsAvg: 1, multiQuestionShare: 0 },
  lost: [],
  judge: { pronunciationCorrections: 0, correctionsAsked: 0, correctionsUnprompted: 0, garbled: 0, garbledMissed: 0, lost: [], englishUnasked: 0, incoherent: 1, alive: 8, note: 'None' },
  replyMs: [1000, 3000, 5000],
};
const row = (card: ReturnType<typeof scorecard>, key: string) => card.rows.find((r) => r.key === key)!;

// Reply time: median of every reply, in seconds; null without timings (real play)
const card = scorecard([base, { ...base, replyMs: [2000] }]);
check(row(card, 'replySeconds').value === 2.5, `reply time is the median over all replies (got ${row(card, 'replySeconds').value})`);
check(row(scorecard([{ ...base, replyMs: undefined }]), 'replySeconds').value === null, 'no timings: nothing to measure');

// Coherence and alive: averaged; scores saved before 2026-10-16 are left out, not counted as 0
const old = { ...base, judge: { ...base.judge, incoherent: undefined, alive: undefined } };
check(row(scorecard([base, old]), 'incoherent').value === 1, 'old scores without "incoherent" are left out');
check(row(scorecard([base, old]), 'alive').value === 8, 'old scores without "alive" are left out');
check(row(scorecard([old]), 'alive').value === null, 'only old scores: nothing to measure');

// Broken conversations fail the gate even when the target improved
const before = scorecard([base]);
const better = scorecard([{ ...base, stats: { ...base.stats, wordsMedian: 6 } }]);
check(gate(before, better, 'replyWords').pass, 'shorter replies, nothing broken: passes');
const brokenRun = scorecard([{ ...base, stats: { ...base.stats, wordsMedian: 6 } }], 2);
const g = gate(before, brokenRun, 'replyWords');
check(!g.pass && g.regressions.some((r) => r.includes('2 broken')), 'two broken conversations fail the gate');
check(scorecardAsText('Scorecard', brokenRun).includes('2 broken'), 'the scorecard text says how many broke');

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log('OK: reply time, coherence and alive are measured, and a broken conversation fails the gate');
