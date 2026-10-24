/**
 * POST /v1/onboarding/level { level } → { level }
 *
 * The orientation tour (docs/orientation-script.md, step 3; Josh, 2026-10-23:
 * "stick to the three levels; buttons are fine"): the learner picks their
 * level and onboarding is done. No Claude call; the level check after
 * conversations can still move it, where it's on.
 */
import { z } from 'zod';
import { apiJson, withLearner } from '@/lib/api';
import { finishOnboarding, LEVELS } from '@/lib/onboarding';
import { badRequest } from '@/lib/onboarding-api';

const Body = z.object({ level: z.enum(LEVELS) });

export async function POST(request: Request) {
  return withLearner(request, 'v1 onboarding level', async (learnerId) => {
    const body = Body.safeParse(await request.json().catch(() => null));
    if (!body.success) return badRequest(body.error);
    await finishOnboarding(learnerId, body.data.level, { path: 'orientation', chose: body.data.level });
    return apiJson({ level: body.data.level });
  });
}
