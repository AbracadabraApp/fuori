// The one grade per conversation (lib/grade.ts, Josh 2026-11-10): 1–10, weighted
// variables, capped by serious failures, and a score saved before a variable
// existed leaves that variable out instead of counting it as 0.
import { gradeConversation, VARIABLES } from '@/lib/grade';
import { scorecard } from '@/lib/scorecard';
import type { ConversationScore } from '@/lib/quality';

const problems: string[] = [];
const check = (ok: boolean, msg: string) => { if (!ok) problems.push(msg); };

const good: ConversationScore = {
  judgeVersion: '2026-11-10q',
  learnerLines: 8,
  stats: { openerWords: 20, replies: 8, wordsMedian: 20, wordsAvg: 20, wordsMax: 30, longShare: 0, questionsAvg: 1, multiQuestionShare: 0 },
  lost: [],
  judge: { pronunciationCorrections: 0, correctionsAsked: 0, correctionsUnprompted: 0, garbled: 0, garbledMissed: 0, lost: [], englishUnasked: 0, incoherent: 0, alive: 9,
    unanswered: 0, cutOffByGoodbye: false, extraGoodbyes: 0, placeFacts: 4, newcomerAssumed: 0, note: 'None' },
};

const g = gradeConversation(good);
check(g.total >= 8.5 && g.total <= 10, `a clean conversation grades 8.5 or more (got ${g.total})`);
check(g.capped.length === 0, 'nothing capped on a clean conversation');
check(VARIABLES.reduce((n, v) => n + v.weight, 0) === 100, 'weights add to 100');

// Chuy, Plaza de los Mariachis, 2026-11-10: closed over a question, then eight more goodbyes
const chuy = gradeConversation({ ...good, judge: { ...good.judge, cutOffByGoodbye: true, extraGoodbyes: 8, placeFacts: 3, unanswered: 1, alive: 7 } });
check(chuy.total <= 5, `the goodbye loop caps the grade at 5 (got ${chuy.total})`);
check(chuy.capped.length === 2, `the loop and the cut-off both apply (got ${chuy.capped.length})`);
check(chuy.weighted > chuy.total, 'the cap lowers a grade the weights would have let through');
check((chuy.variables.ending ?? 10) <= 2, `ending variable is low (got ${chuy.variables.ending})`);

// Weights differ: losing Content (25) costs more than losing In role (10)
const noContent = gradeConversation({ ...good, judge: { ...good.judge, placeFacts: 0 } });
const noRole = gradeConversation({ ...good, judge: { ...good.judge, alive: 2 } });
check(noContent.total < noRole.total, 'no real content costs more than a flat character');

// Saved before the new counts: those variables are left out and the rest share the weight
const old = gradeConversation({ ...good, judge: { ...good.judge, unanswered: undefined, cutOffByGoodbye: undefined, extraGoodbyes: undefined, placeFacts: undefined, newcomerAssumed: undefined } });
check(old.variables.content === null && old.variables.ending === null, 'an old score has no content or ending variable');
check(old.total >= 7 && old.total <= 10, `an old clean score still grades (got ${old.total})`);

// Always 1–10
const worst = gradeConversation({ ...good, lost: [{ line: 1, shorter: false, pulledBack: false }], judge: { ...good.judge, pronunciationCorrections: 9, garbled: 3, garbledMissed: 3, incoherent: 9, unanswered: 9, extraGoodbyes: 20, cutOffByGoodbye: true, placeFacts: 0, alive: 1, englishUnasked: 9, newcomerAssumed: 9 } });
check(worst.total >= 1 && worst.total <= 10, `the grade stays within 1–10 (got ${worst.total})`);

// On the scorecard, averaged over conversations
const row = scorecard([good, { ...good, judge: { ...good.judge, extraGoodbyes: 8 } }]).rows.find((r) => r.key === 'grade')!;
check(row.value !== null && row.value < g.total, 'the scorecard shows the grade as a row, averaged over conversations');

if (problems.length) { console.error(problems.map((p) => '✗ ' + p).join('\n')); process.exit(1); }
console.log('grade checks passed');
