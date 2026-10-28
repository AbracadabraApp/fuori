// Dialogue scorecard (2026-10-12): scoring one conversation (lib/quality.ts),
// adding scores up (lib/scorecard.ts) and the gate a prompt change must pass.
// No Claude calls: the judge is a fake. The database part (saving a score)
// runs with DATABASE_URL against a local test database and skips without it.
import { randomUUID } from 'crypto';
import { buildQualityPrompt, phraseStats, scoreConversation, shorterAfterLost, type ConversationScore, type Judge, type ScoredTurn } from '@/lib/quality';
import { scorecard, gate, scorecardAsText } from '@/lib/scorecard';

const problems: string[] = [];
const check = (ok: boolean, msg: string) => { if (!ok) problems.push(msg); };

const rita = { name: 'Rita', age: 58, role: 'host', city: 'Roma' };
const long = 'parola '.repeat(40).trim();
const turns: ScoredTurn[] = [
  { who: 'npc', text: `Ciao! ${long}?` },
  { who: 'learner', text: 'Mi chiamo Josh' },
  { who: 'npc', text: `Piacere! ${long}? E tu?` },
  { who: 'learner', text: 'Non capisco' },
  { who: 'npc', text: 'Piano: come stai?' },
];

// --- Prompt ---
const p = buildQualityPrompt(rita, turns);
const unfilled = [...(p.system + p.user).matchAll(/\{(\w+)\}/g)].map((m) => m[1]);
check(!unfilled.length, `quality prompt: unfilled ${unfilled.join(', ')}`);
check(p.user.includes('Person 1: Mi chiamo Josh') && p.user.includes('Person 2: Non capisco'), 'quality prompt: learner lines should be numbered');
check(p.system.includes('Italian') && p.system.includes("can't hear"), 'quality prompt: language or "can\'t hear" missing');
// A Beginner conversation gets the Beginner block (English by design); others don't
const pb = buildQualityPrompt(rita, turns, { beginner: true });
check(pb.system.includes('Beginner conversation') && !p.system.includes('Beginner conversation'), 'quality prompt: the Beginner block only for Beginner conversations');
check(![...pb.system.matchAll(/\{(\w+)\}/g)].length, 'quality prompt (Beginner): unfilled placeholders');
check(p.system.includes('characterLanguage'), 'quality prompt: asks for the word counts');

// Beginner phrases counted exactly from the saved parts (answers are the learner's, not counted)
const ps = phraseStats([
  { who: 'npc', text: '', parts: [{ kind: 'english', text: 'Welcome to the market.' }, { kind: 'word', text: 'Guardi che belle arance!' }, { kind: 'question', text: 'Come si chiama?' }, { kind: 'answer', text: 'Mi chiamo …' }] },
  { who: 'learner', text: 'Mi chiamo Josh' },
  { who: 'npc', text: '', parts: [{ kind: 'word', text: 'Piacere!' }, { kind: 'question', text: 'Di dove è?' }] },
]);
check(!!ps && ps.phrases === 4 && ps.words === 11 && ps.englishWords === 4 && ps.replies === 2, `phrase stats: ${JSON.stringify(ps)}`);
check(phraseStats(turns) === null, 'phrase stats: none without parts');

// --- Code's half of "pulls back": the reply after line 2 is shorter than the one before ---
const shorter = shorterAfterLost(turns, [2]);
check(shorter.get(2) === true, 'reply after "non capisco" was shorter, should count');
check(shorterAfterLost(turns, [1]).get(1) === false, 'reply after line 1 was longer, should not count');

async function main() {
  const fake: Judge = async () => ({
    pronunciationCorrections: 1, correctionsAsked: 0, correctionsUnprompted: 3, garbled: 2, garbledMissed: 0,
    lost: [{ line: 2, pulledBack: true }], englishUnasked: 0, note: 'Long replies',
  });
  const score = await scoreConversation(rita, turns, fake);
  check(score.learnerLines === 2 && score.stats.replies === 3, 'score: wrong counts');
  check(score.lost.length === 1 && score.lost[0].shorter && score.lost[0].pulledBack, 'score: lost line should be pulled back');
  check(/^\d{4}-\d{2}-\d{2}/.test(score.judgeVersion), 'score: judge version missing');

  // --- Scorecard ---
  const card = scorecard([score]);
  const row = (k: string) => card.rows.find((r) => r.key === k)!;
  check(row('replyWords').ok === false, 'median reply over 20 words should miss the target');
  check(row('pronunciation').ok === false && row('unprompted').ok === false, '1 pronunciation / 3 unprompted corrections should miss');
  check(row('pullsBack').value === 1 && row('pullsBack').ok === true, 'pulled back once out of once');
  check(row('garbledUnderstood').value === 1, 'nothing garbled was missed');
  check(scorecard([{ ...score, lost: [] }]).rows.find((r) => r.key === 'pullsBack')!.ok === null, 'no lost lines: nothing to measure');
  check(scorecardAsText('Prompt x', card).includes('✗ Reply length'), 'text scorecard should mark misses');

  // --- Gate ---
  const shortReplies: ConversationScore = { ...score, stats: { ...score.stats, wordsMedian: 12, openerWords: 15 } };
  const better = gate(card, scorecard([shortReplies]), 'replyWords');
  check(better.pass && better.improved && !better.regressions.length, `shorter replies, nothing else worse: should pass\n${better.lines.join('\n')}`);
  const worse = gate(card, scorecard([{ ...shortReplies, judge: { ...shortReplies.judge, englishUnasked: 2 } }]), 'replyWords');
  check(!worse.pass && worse.regressions.includes('English nobody asked for'), 'shorter but more English should fail');
  check(!gate(card, card, 'replyWords').pass, 'no change should not pass');

  // --- Database: saving adds the column if needed, and the admin query reads it ---
  if (!process.env.DATABASE_URL) {
    console.log('(database part SKIPPED: set DATABASE_URL to a local test database)');
  } else {
    if (/railway/.test(process.env.DATABASE_URL)) throw new Error('refusing to run against Railway');
    const { query, closePool } = await import('@/lib/db');
    const { saveConversationScore } = await import('@/lib/quality');
    const { recentConversations } = await import('@/lib/recording');
    const me = randomUUID();
    const id = randomUUID();
    await query('INSERT INTO learners (id) VALUES ($1)', [me]);
    try {
      await query(`INSERT INTO conversations (id, learner_id, character_id, started_at, turns) VALUES ($1, $2, 'rita', now(), '[]'::jsonb)`, [id, me]);
      await saveConversationScore(id, score);
      const found = (await recentConversations(50)).find((c) => c.id === id);
      check(found?.quality?.judge.correctionsUnprompted === 3, 'saved score should come back with the conversation');
    } finally {
      await query('DELETE FROM learners WHERE id = $1', [me]);
      await closePool();
    }
  }

  if (problems.length) {
    console.error(problems.join('\n'));
    process.exit(1);
  }
  console.log('OK: conversations are scored, scores add up to the scorecard, and the gate passes only a real improvement with nothing worse');
}

main().catch((e) => { console.error(e); process.exit(1); });
