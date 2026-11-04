/**
 * GET /v1/learn/home → { lesson: { conversationId, cityId, placeId, characterId, said, better, why } | null,
 *   history: { cities, people, conversations }, lessonsDone: [stepId] }
 *
 * The Learn page (Josh, 2026-11-03; docs/learn.md → The Learn page): its
 * History counts and which lesson chips are done. History counts what the
 * visit stamps count (lib/visits.ts): conversations where the learner said
 * something, Magda and lessons left out (a lesson's practice dialogues are
 * examples, not visits). A lesson is done once its review was reached
 * (lib/lesson.ts → lessonsDone). `lesson`, Magda's offer of the latest
 * mistake, stays for app builds before 2026-11-03.
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
import { lessonsDone } from '@/lib/lesson';

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
    const h = await query<{ cities: string; people: string; conversations: string }>(
      `SELECT COUNT(DISTINCT city_id) AS cities, COUNT(DISTINCT character_id) AS people, COUNT(*) AS conversations
         FROM conversations
        WHERE learner_id = $1 AND character_id <> $2
          AND EXISTS (SELECT 1 FROM jsonb_array_elements(turns) t WHERE t->>'who' = 'learner')
          AND COALESCE(prompt_version, '') NOT LIKE 'lesson-%'`,
      [learnerId, tutor.id]
    );
    const history = { cities: Number(h.rows[0]?.cities ?? 0), people: Number(h.rows[0]?.people ?? 0), conversations: Number(h.rows[0]?.conversations ?? 0) };
    const c = r.rows[0];
    const m = c?.mistakes.find((x) => x.said?.trim() && x.better?.trim());
    return apiJson({
      lesson: c && m
        ? { conversationId: c.id, cityId: c.city_id, placeId: c.place_id, characterId: c.character_id, said: m.said, better: m.better, why: m.why ?? '' }
        : null,
      history,
      lessonsDone: await lessonsDone(learnerId),
    });
  });
}
