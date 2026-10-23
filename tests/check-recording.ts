// Recording conversations (2026-10-12). Runs against DATABASE_URL; skips without it.
// Locally: start Postgres, run `node scripts/db-migrate.mjs`, then
// DATABASE_URL=postgres://… npm run test:recording
import { randomUUID } from 'crypto';
import { query, closePool } from '@/lib/db';
import { recordTurn, markConversationEnded, recentConversations, conversationAsText, saveLater, loadConversationTurns } from '@/lib/recording';
import type { CharacterSheet } from '@/lib/types';
import { saveAppError, recentAppErrors, appErrorsAsText } from '@/lib/app-errors';

if (!process.env.DATABASE_URL) {
  console.log('SKIPPED: set DATABASE_URL to a test database to run the recording check');
  process.exit(0);
}
if (/railway/.test(process.env.DATABASE_URL) && !process.env.ALLOW_PROD_TEST) {
  console.error('Refusing to write test data to Railway. Use a local database.');
  process.exit(1);
}

const problems: string[] = [];
const rosa = { id: 'rosa-marino', name: 'Rosa Marino', city: 'Napoli', placeId: 'caffe-toledo' } as CharacterSheet;
const base = { character: rosa, cityId: 'napoli', promptVersion: 'test' };

async function main() {
  const me = randomUUID(), other = randomUUID();
  await query('INSERT INTO learners (id) VALUES ($1), ($2)', [me, other]);

  // Opening line starts a conversation
  const id = await recordTurn({ ...base, learnerId: me, conversationId: null, reply: { line: 'Buongiorno!', en: 'Good morning!' } });
  if (!id) throw new Error('opening line not recorded');

  // A reply appends the learner's line, then the character's, in order
  const same = await recordTurn({ ...base, learnerId: me, conversationId: id, learnerSaid: 'Un caffè, per favore', reply: { line: 'Subito!', en: 'Right away!' } });
  if (same !== id) problems.push('reply started a new conversation instead of continuing');
  const [row] = (await query<{ turns: { who: string; text: string }[]; learner_id: string }>('SELECT turns, learner_id FROM conversations WHERE id = $1', [id])).rows;
  const order = row.turns.map((t) => `${t.who}:${t.text}`).join(' | ');
  if (order !== 'npc:Buongiorno! | learner:Un caffè, per favore | npc:Subito!') problems.push(`wrong turns: ${order}`);

  // Someone else's conversation id is never written to; they get their own
  const theirs = await recordTurn({ ...base, learnerId: other, conversationId: id, learnerSaid: 'ciao', reply: { line: 'Ciao', en: 'Hi' } });
  if (!theirs || theirs === id) problems.push("another learner wrote into someone else's conversation");
  const after = (await query<{ turns: unknown[] }>('SELECT turns FROM conversations WHERE id = $1', [id])).rows[0];
  if (after.turns.length !== 3) problems.push(`conversation changed by another learner (${after.turns.length} turns)`);

  // Leaving marks it ended; talking again reopens it
  await markConversationEnded(id, me);
  let ended = (await query<{ ended_at: Date | null }>('SELECT ended_at FROM conversations WHERE id = $1', [id])).rows[0].ended_at;
  if (!ended) problems.push('not marked ended');
  await markConversationEnded(id, other);
  await recordTurn({ ...base, learnerId: me, conversationId: id, learnerSaid: 'Grazie', reply: { line: 'Prego', en: "You're welcome" } });
  ended = (await query<{ ended_at: Date | null }>('SELECT ended_at FROM conversations WHERE id = $1', [id])).rows[0].ended_at;
  if (ended) problems.push('a new turn did not reopen the conversation');

  // Review output
  const recent = await recentConversations(5);
  const mine = recent.find((c) => c.id === id);
  if (!mine) problems.push('not in recent conversations');
  else if (!conversationAsText(mine).includes('YOU : Un caffè, per favore')) problems.push('text transcript missing the learner line');

  // Saved after the reply went out (/v1/turn, 2026-10-22): the next turn's
  // load still sees the exchange, even though the save hadn't finished
  const later = await recordTurn({ ...base, learnerId: me, conversationId: null, reply: { line: 'Prego?', en: 'Yes?' } });
  if (!later) throw new Error('opening not recorded');
  void saveLater(later, async () => {
    await new Promise((r) => setTimeout(r, 100));
    await recordTurn({ ...base, learnerId: me, conversationId: later, learnerSaid: 'Un cornetto', reply: { line: 'Ecco.', en: 'Here.' } });
  });
  const seen = (await loadConversationTurns(later, me))?.map((t) => t.transcript).join(' | ');
  if (seen !== 'Prego? | Un cornetto | Ecco.') problems.push(`the next turn read the conversation before the save: ${seen}`);

  // App error reports are kept, newest first, and read back as text (lib/app-errors.ts)
  const t0 = new Date(Date.now() - 1000);
  await saveAppError({ id: 'E-TST1', step: 'record', message: 'first', appVersion: '0.1.0 (2)' }, me);
  await saveAppError({ id: 'E-TST2', step: 'turn', code: 'server_error', status: 500, message: 'second', context: { placeId: 'bar' } }, null);
  const errs = await recentAppErrors(10, t0);
  if (errs.map((e) => e.code).join(',') !== 'E-TST2,E-TST1') problems.push(`app errors not kept newest first: ${errs.map((e) => e.code)}`);
  if (!appErrorsAsText(errs).includes('E-TST1 · record')) problems.push('app errors text missing a report');
  await query("DELETE FROM app_errors WHERE code LIKE 'E-TST%'");

  await query('DELETE FROM learners WHERE id = ANY($1)', [[me, other]]);
}

main()
  .catch((e) => problems.push(String(e)))
  .finally(async () => {
    await closePool();
    if (problems.length) {
      console.error(problems.join('\n'));
      process.exit(1);
    }
    console.log('OK: conversations are recorded in order, per learner, and ended/reopened correctly');
  });
