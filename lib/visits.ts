/**
 * How many conversations a learner has had at each place, for the visit
 * stamps. A conversation counts once the learner has said something in it.
 * Used by /api/visits (one city, web) and /v1/me (every city, app).
 */
import { query } from './db';

export async function visitCounts(learnerId: string, cityId?: string): Promise<Record<string, number>> {
  const result = await query<{ place_id: string; visits: string }>(
    `SELECT place_id, COUNT(*) AS visits
     FROM conversations
     WHERE learner_id = $1 AND ($2::text IS NULL OR city_id = $2)
       AND EXISTS (SELECT 1 FROM jsonb_array_elements(turns) t WHERE t->>'who' = 'learner')
     GROUP BY place_id`,
    [learnerId, cityId ?? null]
  );
  return Object.fromEntries(result.rows.map((r) => [r.place_id, Number(r.visits)]));
}
