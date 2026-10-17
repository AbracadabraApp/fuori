/**
 * POST /v1/onboarding/follow-up { answer: { text, language? } }
 *   → { line, en, promptVersion }
 *
 * The greeter reacts to the learner's first answer and asks one slightly
 * harder question built on it (docs/onboarding-design.md → Speaker path). The
 * app shows `line` without its English unless the next recording is silent.
 */
import { z } from 'zod';
import { apiError, apiJson, withLearner } from '@/lib/api';
import { allow } from '@/lib/rate-limit';
import { writeFollowUp } from '@/lib/onboarding';
import { Answer, badRequest, claudeFailed } from '@/lib/onboarding-api';

const Body = z.object({ answer: Answer });

export async function POST(request: Request) {
  return withLearner(request, 'v1 onboarding follow-up', async (learnerId) => {
    const body = Body.safeParse(await request.json().catch(() => null));
    if (!body.success) return badRequest(body.error);
    if (!allow(`onboarding:${learnerId}`, 30, 10 * 60 * 1000)) return apiError('rate_limited', 'Too many tries; wait a moment', 60_000);
    try {
      return apiJson(await writeFollowUp(body.data.answer));
    } catch (err) {
      return claudeFailed(request, 'v1 onboarding follow-up', err);
    }
  });
}
