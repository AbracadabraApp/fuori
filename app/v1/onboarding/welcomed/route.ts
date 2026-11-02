/**
 * POST /v1/onboarding/welcomed { conversationId } → { level, startStep, name }
 *
 * The welcome's last button (lib/welcome.ts; docs/onboarding-giulia.md): read
 * what the learner answered from the whole conversation, place them (the path's
 * step 1 or 3, or Intermediate), keep how characters address them, and mark
 * the welcome done. Until this is called, the welcome starts again at the next
 * launch. The app then ends the conversation as usual (/v1/conversations/{id}/end),
 * which writes her memory of them.
 */
import { z } from 'zod';
import { apiError, apiJson, withLearner } from '@/lib/api';
import { allow } from '@/lib/rate-limit';
import { finishWelcome } from '@/lib/welcome';
import { badRequest, claudeFailed } from '@/lib/onboarding-api';

const Body = z.object({ conversationId: z.string().uuid() });

export async function POST(request: Request) {
  return withLearner(request, 'v1 onboarding welcomed', async (learnerId) => {
    const body = Body.safeParse(await request.json().catch(() => null));
    if (!body.success) return badRequest(body.error);
    if (!allow(`onboarding:${learnerId}`, 30, 10 * 60 * 1000)) return apiError('rate_limited', 'Too many tries; wait a moment', 60_000);
    try {
      return apiJson(await finishWelcome(learnerId, body.data.conversationId));
    } catch (err) {
      if (err instanceof Error && err.message.startsWith('No such conversation')) return apiError('not_found', err.message);
      return claudeFailed(request, 'v1 onboarding welcomed', err);
    }
  });
}
