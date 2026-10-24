/**
 * POST /v1/me/level { level } → 204
 *
 * Settings: the learner's level (Josh, 2026-10-23: the level picked in the
 * orientation tour shows in Settings and can be changed there). It sets how
 * characters talk and whether scaffolding shows. Onboarding isn't touched.
 */
import { z } from 'zod';
import { withLearner } from '@/lib/api';
import { LEVELS, setLevel } from '@/lib/onboarding';
import { badRequest } from '@/lib/onboarding-api';

const Body = z.object({ level: z.enum(LEVELS) });

export async function POST(request: Request) {
  return withLearner(request, 'v1 me level', async (learnerId) => {
    const body = Body.safeParse(await request.json().catch(() => null));
    if (!body.success) return badRequest(body.error);
    await setLevel(learnerId, body.data.level);
    return new Response(null, { status: 204 });
  });
}
