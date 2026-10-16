/**
 * The backstop for saving (docs/12-native-app.md → Saving on leave): a
 * conversation nobody ended (the app was killed, the phone died, the network
 * dropped the end call) is ended by the server once it has been idle for a
 * while, and the character writes what they remember, as if the learner had
 * left. Memory then never depends on the phone.
 *
 * Runs every few minutes from instrumentation.ts. Each country's server only
 * sweeps its own cities (they share one database). Claiming is atomic
 * (claimForMemory), so two servers or a late end call can't save twice.
 */
import { query } from '@/lib/db';
import { cities } from '@/content';
import { markConversationEnded, recordingEnabled } from '@/lib/recording';
import { rememberConversation, type RememberResult } from '@/lib/remember';

export const IDLE_MINUTES = 30;

export async function sweepIdleConversations(
  remember: (conversationId: string, learnerId: string) => Promise<RememberResult> = rememberConversation,
  idleMinutes = IDLE_MINUTES
): Promise<{ id: string; result: RememberResult }[]> {
  if (!recordingEnabled()) return [];
  const idle = await query<{ id: string; learner_id: string }>(
    `SELECT id, learner_id FROM conversations
     WHERE ended_at IS NULL
       AND city_id = ANY($1)
       AND jsonb_array_length(turns) > 0
       AND (turns->-1->>'at')::timestamptz < now() - make_interval(mins => $2)
     ORDER BY started_at
     LIMIT 20`,
    [cities.map((c) => c.id), idleMinutes]
  );
  const done: { id: string; result: RememberResult }[] = [];
  for (const row of idle.rows) {
    await markConversationEnded(row.id, row.learner_id);
    const result = await remember(row.id, row.learner_id);
    done.push({ id: row.id, result });
    console.log(JSON.stringify({ level: 'info', event: 'idle conversation ended', conversationId: row.id, remembered: result }));
  }
  return done;
}
