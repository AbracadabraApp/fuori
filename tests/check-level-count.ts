// What counts toward the level-up offer (lib/level-up.ts → countedConversations), and where the count starts.
// Josh, 2026-11-16: lessons, Magda, the welcome, the old Beginner and visits at another level don't count ("no");
// existing players' counts start fresh ("yes"; the levels check found 54 counted for his Mexico learner, every
// conversation ever played, since step_since was empty).
// The rule needs no database; the count runs against a local one:
//   DATABASE_URL=postgres://localhost/fuori_test npm run test:level-count
import { randomUUID } from 'crypto';
import { ordinaryVisit, BEGINNER_VISIT, NOT_UPPER_VISIT } from '@/lib/level-up';

const problems: string[] = [];
const check = (ok: boolean, what: string) => { if (!ok) problems.push(what); };

const b2 = (step: number) => `beginner-2-2026-11-15a/2026-11-13b+C${step}`;
check(ordinaryVisit('beginner', b2(1)) && !ordinaryVisit('beginner', 'beginner-2026-11-05+S1') && !ordinaryVisit('beginner', 'lesson-2026-11-02b-teach') && !ordinaryVisit('beginner', 'magda-2026-10-14b'), 'Beginner: only the Beginner visits count');
check(ordinaryVisit('intermediate', '2026-11-13b') && !ordinaryVisit('intermediate', b2(6)) && !ordinaryVisit('intermediate', 'lesson-2026-11-02b-practice') && !ordinaryVisit('intermediate', 'onboarding') && !ordinaryVisit('intermediate', null), 'Intermediate: only the character prompt\'s visits count');
check(NOT_UPPER_VISIT.flags === '' && BEGINNER_VISIT.flags === '', 'the patterns are plain, so SQL reads them the same');

async function withDatabase() {
  const { query } = await import('@/lib/db');
  const { countedConversations, learnerStep } = await import('@/lib/level-up');
  const me = randomUUID();
  const replies = (n: number) => JSON.stringify(Array.from({ length: n * 2 }, (_, i) => ({ who: i % 2 ? 'learner' : 'npc', text: 'x' })));
  const add = (version: string | null, n = 3, at = new Date()) =>
    query('INSERT INTO conversations (id, learner_id, character_id, city_id, started_at, turns, prompt_version) VALUES ($1, $2, $3, $4, $5, $6, $7)', [randomUUID(), me, 'someone', 'roma', at, replies(n), version]);
  try {
    await learnerStep(me); // the step columns
    await query('INSERT INTO learners (id, level, step) VALUES ($1, $2, $3)', [me, 'beginner', 2]);
    const before = new Date(Date.now() - 60_000);
    await add(b2(2), 3, before); // played before the step had a start: not counted once the count starts fresh

    // An existing player with no start: the first read sets it to now
    const s = await learnerStep(me);
    check(s.since !== null && s.since.getTime() > before.getTime(), 'a learner with no step start starts counting now');
    check((await learnerStep(me)).since?.getTime() === s.since?.getTime(), 'the start is set once, not on every read');
    check(await countedConversations(me, s.since) === 0, 'conversations from before the start don\'t count');

    const later = new Date(Date.now() + 1000);
    await add(b2(2), 3, later); // counts
    await add(b2(2), 2, later); // too short
    await add(b2(4), 3, later); // another step (the hidden stepper)
    await add('beginner-2026-11-05+S1', 3, later); // the old Beginner
    await add('lesson-2026-11-02b-teach', 3, later); // a lesson
    await add('magda-2026-10-14b', 3, later); // Magda
    await add('onboarding', 3, later); // the welcome
    await add('2026-11-13b', 3, later); // a visit at Intermediate
    check(await countedConversations(me, s.since) === 1, `Beginner at step 2: only the step-2 visit counts (got ${await countedConversations(me, s.since)})`);

    await query('UPDATE learners SET level = $2 WHERE id = $1', [me, 'intermediate']);
    check(await countedConversations(me, s.since) === 1, `Intermediate: only the character prompt's visit counts (got ${await countedConversations(me, s.since)})`);
  } finally {
    await query('DELETE FROM conversations WHERE learner_id = $1', [me]);
    await query('DELETE FROM learners WHERE id = $1', [me]);
  }
}

(async () => {
  if (!process.env.DATABASE_URL) console.log('(database part SKIPPED: set DATABASE_URL to a local test database)');
  else if (!/localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL)) problems.push('Refusing to write test data outside a local database.');
  else await withDatabase();
  if (problems.length) {
    console.error(`check-level-count: ${problems.length} problem(s)\n- ${problems.join('\n- ')}`);
    process.exit(1);
  }
  console.log('check-level-count: ok');
  process.exit(0);
})();
