// Conversations nobody ended are ended by the server once idle, and the
// character writes what they remember (lib/conversation/sweep.ts). Found
// 2026-10-15: three of Josh's conversations stayed open because the app was
// killed mid-conversation. Needs a test database (DATABASE_URL); skipped
// without one, like test:recording.
import { randomUUID } from 'crypto';
import { query, closePool } from '@/lib/db';
import { cities } from '@/content';
import { sweepIdleConversations } from '@/lib/conversation/sweep';

(async () => {
  if (!process.env.DATABASE_URL || /railway\.internal/.test(process.env.DATABASE_URL)) {
    console.log('SKIPPED: set DATABASE_URL to a test database to run the sweep check');
    return;
  }
  const problems: string[] = [];
  const learner = randomUUID();
  const city = cities[0].id;
  const turn = (who: string, minutesAgo: number) => ({ who, text: 'x', at: new Date(Date.now() - minutesAgo * 60_000).toISOString() });
  await query('INSERT INTO learners (id) VALUES ($1)', [learner]);
  const make = async (lastMinutesAgo: number, ended = false, cityId = city) => {
    const id = randomUUID();
    await query(
      `INSERT INTO conversations (id, learner_id, character_id, place_id, city_id, started_at, ended_at, turns)
       VALUES ($1, $2, 'someone', 'somewhere', $3, now(), $4, $5)`,
      [id, learner, cityId, ended ? new Date() : null, JSON.stringify([turn('npc', lastMinutesAgo + 2), turn('learner', lastMinutesAgo + 1), turn('npc', lastMinutesAgo)])]
    );
    return id;
  };
  const idle = await make(45);
  const active = await make(5);
  const alreadyEnded = await make(45, true);
  const otherCountry = await make(45, false, 'not-a-city-of-this-pack');

  const remembered: string[] = [];
  const done = await sweepIdleConversations(async (id) => { remembered.push(id); return 'saved'; });
  const ids = done.map((d) => d.id);
  if (!ids.includes(idle)) problems.push('an idle conversation was not ended');
  if (ids.includes(active)) problems.push('an active conversation was ended');
  if (ids.includes(alreadyEnded)) problems.push('an ended conversation was swept again');
  if (ids.includes(otherCountry)) problems.push("another country's conversation was swept");
  if (!remembered.includes(idle)) problems.push('memory was not written for the idle conversation');
  const ended = await query<{ ended_at: Date | null }>('SELECT ended_at FROM conversations WHERE id = $1', [idle]);
  if (!ended.rows[0]?.ended_at) problems.push('the idle conversation has no ended_at');
  const again = await sweepIdleConversations(async () => 'saved');
  if (again.some((d) => d.id === idle)) problems.push('the same conversation was swept twice');

  await query('DELETE FROM learners WHERE id = $1', [learner]);
  await closePool();
  if (problems.length) {
    console.error(`FAIL: ${problems.join('; ')}`);
    process.exit(1);
  }
  console.log('OK: idle conversations are ended and remembered once; active, ended and other countries\' conversations are left alone');
})();
