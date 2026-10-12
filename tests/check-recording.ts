// Recording conversations (2026-10-12). Runs against DATABASE_URL; skips without it.
// Locally: start Postgres, run `node scripts/db-migrate.mjs`, then
// DATABASE_URL=postgres://… npm run test:recording
import { randomUUID } from 'crypto';
import { query, closePool } from '@/lib/db';
import { recordTurn, markConversationEnded, recentConversations, conversationAsText } from '@/lib/recording';
import type { CharacterSheet } from '@/lib/types';

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
