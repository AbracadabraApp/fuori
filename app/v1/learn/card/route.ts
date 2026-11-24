/**
 * GET /v1/learn/card?conversation=<id>
 *   → 200 { id, kind, headline, term?, rows: [{ text, en }], note? } | 204 (no card, or not ready)
 * POST /v1/learn/card { conversationId }  → 204: the learner closed the sheet
 *
 * The card for the sheet after a visit's goodbye (docs/learn-sheet-2-plan.md), started at the wind-down turn
 * by lib/learn-card-writer.ts. The GET never waits: a card not ready when the app asks isn't shown. The
 * card's source footnote is never sent.
 */
import { z } from 'zod';
import { apiJson, withLearner } from '@/lib/api';
import { badRequest } from '@/lib/onboarding-api';
import { cardClosed, readyCard } from '@/lib/learn-card-writer';

export async function GET(request: Request) {
  return withLearner(request, 'v1 learn card', async (learnerId) => {
    const id = z.string().uuid().safeParse(new URL(request.url).searchParams.get('conversation'));
    if (!id.success) return badRequest(id.error);
    const card = await readyCard(id.data, learnerId);
    return card ? apiJson(card) : new Response(null, { status: 204 });
  });
}

const Closed = z.object({ conversationId: z.string().uuid() });

export async function POST(request: Request) {
  return withLearner(request, 'v1 learn card closed', async (learnerId) => {
    const body = Closed.safeParse(await request.json().catch(() => null));
    if (!body.success) return badRequest(body.error);
    await cardClosed(body.data.conversationId, learnerId);
    return new Response(null, { status: 204 });
  });
}
