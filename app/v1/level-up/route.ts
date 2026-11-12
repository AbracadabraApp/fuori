/**
 * The level up (lib/level-up.ts; the screen in sketches/level-up/).
 *
 * GET /v1/level-up?conversationId=… → { due: false } or { due: true, offer, words }: asked by the app when a
 * conversation is saved on leaving. Due after LEVEL_UP_AFTER conversations at the learner's step (and again
 * after a "not yet"), only on Beginner 2 (the app's switch), only after an ordinary visit.
 * POST /v1/level-up { answer: "yes" | "not-yet" } → { step } (and { step } for Josh's testing with { step: n }).
 */
import { z } from 'zod';
import { withLearner, apiError } from '@/lib/api';
import { badRequest } from '@/lib/onboarding-api';
import { beginnerVersionFrom } from '@/lib/beginner-2';
import { language } from '@/content';
import { answerLevelUp, levelUpOffer, setStep, MAX_STEP } from '@/lib/level-up';

export async function GET(request: Request) {
  return withLearner(request, 'v1 level-up', async (learnerId) => {
    const conversationId = new URL(request.url).searchParams.get('conversationId') ?? '';
    if (!z.string().uuid().safeParse(conversationId).success) return apiError('bad_request', 'conversationId must be a uuid');
    if (beginnerVersionFrom(request.headers) !== 2) return Response.json({ due: false });
    const offer = await levelUpOffer(learnerId, conversationId);
    if (!offer) return Response.json({ due: false });
    return Response.json({ due: true, offer, words: language.ui.levelUp });
  });
}

const Body = z.union([z.object({ answer: z.enum(['yes', 'not-yet']) }), z.object({ step: z.number().int().min(1).max(MAX_STEP) })]);

export async function POST(request: Request) {
  return withLearner(request, 'v1 level-up', async (learnerId) => {
    const body = Body.safeParse(await request.json().catch(() => null));
    if (!body.success) return badRequest(body.error);
    const s = 'answer' in body.data ? await answerLevelUp(learnerId, body.data.answer) : await setStep(learnerId, body.data.step);
    return Response.json({ step: s.step });
  });
}
