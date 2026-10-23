/**
 * POST /v1/onboarding/name { heard } → { name: string | null, promptVersion }
 *
 * The greeter asked their name; the app sends what speech to text heard and
 * gets back just the name ("My name is Josh" → "Josh"), which she says back
 * (docs/onboarding-design.md → Name and address). Nothing is stored here: the
 * name is saved with the address choice.
 */
import { z } from 'zod';
import { apiError, apiJson, withLearner } from '@/lib/api';
import { allow } from '@/lib/rate-limit';
import { badRequest, claudeFailed } from '@/lib/onboarding-api';
import { nameFromHeard } from '@/lib/onboarding';
import { MAX_SAID_CHARS } from '@/lib/turn-request';

const Body = z.object({ heard: z.string().trim().min(1).max(MAX_SAID_CHARS) });

export async function POST(request: Request) {
  return withLearner(request, 'v1 onboarding name', async (learnerId) => {
    const body = Body.safeParse(await request.json().catch(() => null));
    if (!body.success) return badRequest(body.error);
    if (!allow(`onboarding-name:${learnerId}`, 20, 10 * 60 * 1000)) return apiError('rate_limited', 'Too many tries; wait a moment', 60_000);
    try {
      return apiJson(await nameFromHeard(body.data.heard));
    } catch (err) {
      return claudeFailed(request, 'v1 onboarding name', err);
    }
  });
}
