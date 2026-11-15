/**
 * POST /v1/rate { conversationId, turn, rating: "good" | "bad" | "bug", note?, context? } → { ok: true }
 *
 * A turn rated from the app's debug panel (lib/turn-ratings.ts): `turn` is the character's turn in the visit,
 * counted from 1, as the panel shows it; `context` is what the panel showed.
 */
import { z } from 'zod';
import { withLearner, apiError } from '@/lib/api';
import { badRequest } from '@/lib/onboarding-api';
import { RATINGS, saveTurnRating } from '@/lib/turn-ratings';

const Body = z.object({
  conversationId: z.string().uuid(),
  turn: z.number().int().min(1).max(200),
  rating: z.enum(RATINGS),
  note: z.string().max(2000).optional(),
  context: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: Request) {
  return withLearner(request, 'v1 rate', async (learnerId) => {
    const body = Body.safeParse(await request.json().catch(() => null));
    if (!body.success) return badRequest(body.error);
    const saved = await saveTurnRating({ learnerId, ...body.data });
    if (!saved) return apiError('bad_request', 'Not your conversation');
    return Response.json({ ok: true });
  });
}
