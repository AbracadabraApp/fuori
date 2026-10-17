/**
 * POST /v1/onboarding/done { path: "beginner" } → { level: "beginner" }
 *
 * The beginner path ("Not yet!" then the send-off's go button): no Claude call,
 * the learner starts as a beginner and onboarding is done.
 */
import { z } from 'zod';
import { apiJson, withLearner } from '@/lib/api';
import { finishOnboarding } from '@/lib/onboarding';
import { badRequest } from '@/lib/onboarding-api';

const Body = z.object({ path: z.literal('beginner') });

export async function POST(request: Request) {
  return withLearner(request, 'v1 onboarding done', async (learnerId) => {
    const body = Body.safeParse(await request.json().catch(() => null));
    if (!body.success) return badRequest(body.error);
    await finishOnboarding(learnerId, 'beginner', { path: 'beginner' });
    return apiJson({ level: 'beginner' });
  });
}
