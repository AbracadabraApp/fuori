/**
 * GET /v1/me/conversations
 *   → { conversations: [{ id, cityId, placeId, characterId, startedAt, lines }] }
 *
 * The Learn area (docs/learn.md → The Learn area; Josh, 2026-10-26: the book
 * next to Settings opens "your conversations" first): this learner's
 * conversations where they said something, newest first (at most 100), with
 * how many lines they said. The app shows each with the character's portrait
 * from /v1/content and opens its page through POST /v1/learn.
 */
import { apiJson, withLearner } from '@/lib/api';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  return withLearner(request, 'v1 me conversations', async (learnerId) => {
    const r = await query<{ id: string; city_id: string; place_id: string; character_id: string; started_at: Date; lines: string }>(
      `SELECT c.id, c.city_id, c.place_id, c.character_id, c.started_at,
              (SELECT count(*) FROM jsonb_array_elements(c.turns) t WHERE t->>'who' = 'learner') AS lines
         FROM conversations c
        WHERE c.learner_id = $1 AND c.place_id IS NOT NULL AND c.city_id IS NOT NULL
          AND c.turns @> '[{"who":"learner"}]'::jsonb
        ORDER BY c.started_at DESC
        LIMIT 100`,
      [learnerId]
    );
    return apiJson({
      conversations: r.rows.map((c) => ({
        id: c.id,
        cityId: c.city_id,
        placeId: c.place_id,
        characterId: c.character_id,
        startedAt: c.started_at.toISOString(),
        lines: Number(c.lines),
      })),
    });
  });
}
