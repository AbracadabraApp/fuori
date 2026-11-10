// The one grade per conversation (lib/grade.ts, Josh 2026-11-10): 1–10, four
// quality variables each a rate over the character's replies, weighted, capped
// by serious failures; instruments reported beside it and never graded
// (lib/instruments.ts); a score saved before a variable existed leaves it out.
import { gradeConversation, VARIABLES } from '@/lib/grade';
import { instrumentsOf, instrumentLine } from '@/lib/instruments';
import { closingOf, answersShown, type ConversationScore, type ScoredTurn } from '@/lib/quality';
import { scorecard } from '@/lib/scorecard';
import { gradeTrendAsText, weekOf } from '@/lib/grade-trend';

const problems: string[] = [];
const check = (ok: boolean, msg: string) => { if (!ok) problems.push(msg); };

const good: ConversationScore = {
  judgeVersion: '2026-11-10r',
  learnerLines: 8,
  stats: { openerWords: 20, replies: 8, wordsMedian: 20, wordsAvg: 20, wordsMax: 30, longShare: 0, questionsAvg: 1, multiQuestionShare: 0 },
  lost: [],
  character: { character: 9, note: 'None' },
  judge: { pronunciationCorrections: 0, correctionsAsked: 0, correctionsUnprompted: 0, garbled: 0, garbledMissed: 0, lost: [], englishUnasked: 0, incoherent: 0, alive: 9,
    unanswered: 0, cutOffByGoodbye: false, keepsClosing: false, placeFacts: 5, newcomerAssumed: 0, note: 'None' },
};

const g = gradeConversation(good);
check(g.total >= 8.5 && g.total <= 10, `a clean conversation grades 8.5 or more (got ${g.total})`);
check(g.capped.length === 0, 'nothing capped on a clean conversation');
check(VARIABLES.reduce((n, v) => n + v.weight, 0) === 100, 'weights add to 100');
check(VARIABLES.length === 4, 'four quality variables');

// The learner can't move it: heard and followable are readings, not variables
const messy = gradeConversation({ ...good, learnerLines: 2, judge: { ...good.judge, garbled: 6, garbledMissed: 0, pronunciationCorrections: 0 } });
check(messy.total === g.total, 'a learner whose speech was garbled does not change the grade when the character handled it');
const mumbler = gradeConversation({ ...good, judge: { ...good.judge, garbled: 5, garbledMissed: 5 } });
check(mumbler.total === g.total, 'heard is a reading: it never moves the grade');

// Chuy, Plaza de los Mariachis, 2026-11-10: closed over a question, then a conversation that would not end
const chuy = gradeConversation({ ...good, character: { character: 4, note: '' }, judge: { ...good.judge, cutOffByGoodbye: true, keepsClosing: true, placeFacts: 3, unanswered: 1, alive: 4 }, stats: { ...good.stats, replies: 18 } });
check(chuy.total <= 5, `the conversation that won't end caps the grade at 5 (got ${chuy.total})`);
check(chuy.capped.length === 2, `both caps apply (got ${chuy.capped.length})`);
const strongButWontEnd = gradeConversation({ ...good, judge: { ...good.judge, keepsClosing: true } });
check(strongButWontEnd.weighted > 5 && strongButWontEnd.total === 5, `a strong conversation that won't end is held at 5 (got ${strongButWontEnd.weighted} → ${strongButWontEnd.total})`);
check((chuy.variables.ending ?? 10) <= 2, `ending variable is low (got ${chuy.variables.ending})`);

// A rate, not a count: one reply that doesn't follow costs more in a short visit than a long one
const shortVisit = gradeConversation({ ...good, stats: { ...good.stats, replies: 4 }, judge: { ...good.judge, incoherent: 1 } });
const longVisit = gradeConversation({ ...good, stats: { ...good.stats, replies: 20 }, judge: { ...good.judge, incoherent: 1 } });
check((shortVisit.variables.responsive ?? 0) < (longVisit.variables.responsive ?? 0), 'one reply that does not follow costs less in a longer visit');

// Weights differ: no real content costs more than a flat character
const noContent = gradeConversation({ ...good, judge: { ...good.judge, placeFacts: 0 } });
const flat = gradeConversation({ ...good, character: { character: 4, note: '' } });
check(noContent.total < flat.total, 'no real content costs more than a flat character');

// Character is one-sided: it comes from his own call; an old score uses "alive"
const old = gradeConversation({ ...good, character: undefined, judge: { ...good.judge, alive: 9, unanswered: undefined, cutOffByGoodbye: undefined, keepsClosing: undefined, placeFacts: undefined, newcomerAssumed: undefined } });
check(old.variables.content === null && old.variables.ending === null, 'an old score has no content or ending variable');
check(old.variables.character === 9, 'an old score uses the main judge\'s alive for Character');
check(old.total >= 7 && old.total <= 10, `an old clean score still grades (got ${old.total})`);

// Always 1–10
const worst = gradeConversation({ ...good, lost: [{ line: 1, shorter: false, pulledBack: false }], character: { character: 1, note: '' }, judge: { ...good.judge, incoherent: 9, unanswered: 9, keepsClosing: true, cutOffByGoodbye: true, placeFacts: 0, alive: 1, newcomerAssumed: 9 } });
check(worst.total >= 1 && worst.total <= 10, `the grade stays within 1–10 (got ${worst.total})`);

// Instruments: counted, reported
const turns: ScoredTurn[] = [
  { who: 'npc', text: 'a', at: '2026-11-10T17:00:00Z', steps: { setup: 'opener' } },
  { who: 'learner', text: 'b', at: '2026-11-10T17:01:00Z' },
  { who: 'npc', text: 'c', at: '2026-11-10T17:02:00Z', steps: { setup: 'goodbye' } },
  { who: 'learner', text: 'd', at: '2026-11-10T17:03:00Z' },
  { who: 'npc', text: 'e', at: '2026-11-10T17:04:00Z', steps: { setup: 'goodbye' } },
];
const closing = closingOf(turns);
check(closing.goodbyeAtLearnerTurn === 1 && closing.goodbyeReplies === 2 && closing.minutes === 4, `closing is counted from the recorded setups (got ${JSON.stringify(closing)})`);
check(closingOf([{ who: 'npc', text: 'a' }]).goodbyeAtLearnerTurn === null, 'no goodbye setup played: null');
const ins = instrumentsOf({ ...good, closing });
check(ins.closing?.goodbyeReplies === 2 && /goodbye from learner turn 1, 2 goodbye replies/.test(instrumentLine(ins)), 'the readings line says how the visit closed');

// The judge reads the answers the reply offered
check(answersShown({ who: 'npc', text: 'x', parts: [{ kind: 'answer', text: 'Sí, por favor.' }, { kind: 'answer', text: 'Hoy no.' }, { kind: 'word', text: 'Hola' }] }) === ' [Answers shown on screen: Sí, por favor. | Hoy no.]', 'answers are shown to the judge');
check(answersShown({ who: 'npc', text: 'x' }) === '', 'no parts, nothing added');

// On the scorecard, averaged over conversations
const row = scorecard([good, { ...good, judge: { ...good.judge, keepsClosing: true } }]).rows.find((r) => r.key === 'grade')!;
check(row.value !== null && row.value < g.total, 'the scorecard shows the grade as a row, averaged over conversations');

// The trend: by week and by prompt version, unscored conversations counted but not graded
check(weekOf(new Date('2026-11-10T17:40:00Z')) === '2026-11-09' && weekOf(new Date('2026-11-08T23:00:00Z')) === '2026-11-02', 'weeks start on Monday (UTC)');
const trend = gradeTrendAsText([
  { at: new Date('2026-11-03T10:00:00Z'), promptVersion: 'v1', score: good },
  { at: new Date('2026-11-10T10:00:00Z'), promptVersion: 'v2', score: { ...good, judge: { ...good.judge, keepsClosing: true } } },
  { at: new Date('2026-11-10T11:00:00Z'), promptVersion: 'v2', score: null },
]);
check(/2026-11-02 · 1 graded of 1/.test(trend) && /2026-11-09 · 1 graded of 2/.test(trend) && /v2 · 1 graded of 2/.test(trend), `the trend groups by week and version (got ${trend})`);
check(gradeTrendAsText([]) === 'No scored conversations yet.', 'nothing scored: says so');

if (problems.length) { console.error(problems.map((p) => '✗ ' + p).join('\n')); process.exit(1); }
console.log('grade checks passed');
