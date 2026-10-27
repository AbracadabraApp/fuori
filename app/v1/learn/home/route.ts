/**
 * GET /v1/learn/home → { lesson: { conversationId, cityId, placeId, characterId, said, better, why } | null }
 *
 * The Learn home (docs/learn.md → The Learn area; canvas "Learn area", D3;
 * Josh, 2026-10-26): what the Lessons card offers. Magda (not at a school,
 * not in a city: Josh) picks up the learner's latest real mistake, as the
 * end of a conversation saved it (conversations.review.mistakes: what they
 * said, the better way, why). No Claude call. Null until there is one.
 */
import { apiJson, withLearner } from '@/lib/api';
import { query } from '@/lib/db';
import { tutor } from '@/content';

type Mistake = { said?: string; better?: string; why?: string };

export async function GET(request: Request) {
  return withLearner(request, 'v1 learn home', async (learnerId) => {
    const r = await query<{ id: string; city_id: string; place_id: string; character_id: string; mistakes: Mistake[] }>(
      `SELECT id, city_id, place_id, character_id, review->'mistakes' AS mistakes
         FROM conversations
        WHERE learner_id = $1 AND character_id <> $2 AND place_id IS NOT NULL AND city_id IS NOT NULL
          AND jsonb_typeof(review->'mistakes') = 'array' AND jsonb_array_length(review->'mistakes') > 0
        ORDER BY started_at DESC
        LIMIT 1`,
      [learnerId, tutor.id]
    );
    const c = r.rows[0];
    const m = c?.mistakes.find((x) => x.said?.trim() && x.better?.trim());
    return apiJson({
      lesson: c && m
        ? { conversationId: c.id, cityId: c.city_id, placeId: c.place_id, characterId: c.character_id, said: m.said, better: m.better, why: m.why ?? '' }
        : null,
    });
  });
}
