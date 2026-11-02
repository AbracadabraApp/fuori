/**
 * POST /v1/onboarding/send-off { answers: [{ text, language? }, { text, language? }] }
 *   → { line, en, level, promptVersion }
 *
 * The end of the speaker path: the greeter's send-off (ending with the fixed
 * help line) and the learner's level, judged from what they said, in one
 * Claude call. Stores the level, marks onboarding done, and keeps the answers
 * and the reason with the learner so placement can be checked.
 */
import { z } from 'zod';
import { apiError, apiJson, withLearner } from '@/lib/api';
import { allow } from '@/lib/rate-limit';
import { finishOnboarding, writeSendOff } from '@/lib/onboarding';
import { Answer, badRequest, claudeFailed } from '@/lib/onboarding-api';
import { placement } from '@/lib/path';

const Body = z.object({ answers: z.array(Answer).min(1).max(2) });

export async function POST(request: Request) {
  return withLearner(request, 'v1 onboarding send-off', async (learnerId) => {
    const body = Body.safeParse(await request.json().catch(() => null));
    if (!body.success) return badRequest(body.error);
    if (!allow(`onboarding:${learnerId}`, 30, 10 * 60 * 1000)) return apiError('rate_limited', 'Too many tries; wait a moment', 60_000);
    let reply;
    try {
      reply = await writeSendOff(body.data.answers);
    } catch (err) {
      return claudeFailed(request, 'v1 onboarding send-off', err);
    }
    await finishOnboarding(learnerId, reply.level, {
      path: 'speaker',
      // They chose to speak and answered in their own words: a Beginner starts at step 3 (lib/path.ts → placement)
      ...(reply.level === 'beginner' ? { startStep: placement({ speaks: false, ownWords: true }).startStep } : {}),
      answers: body.data.answers,
      level: reply.level,
      reason: reply.reason,
      promptVersion: reply.promptVersion,
    });
    return apiJson({ line: reply.line, en: reply.en, level: reply.level, promptVersion: reply.promptVersion });
  });
}
