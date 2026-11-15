/**
 * The level up (lib/level-up.ts; the screen in sketches/level-up/).
 *
 * GET /v1/level-up?conversationId=… → { due: false } or { due: true, offer, words }: asked by the app when a
 * conversation is saved on leaving. Due after LEVEL_UP_AFTER conversations at the learner's step or level (and
 * again after a "not yet"), only after an ordinary visit. At Beginner it climbs the steps (only on Beginner 2, the
 * app's switch), then at the top step offers Intermediate (D34); at Intermediate it offers Advanced (D35).
 * POST /v1/level-up { answer: "yes" | "not-yet" } → { step, level } (and { step } for Josh's testing with { step: n }).
 */
import { z } from 'zod';
import { withLearner, apiError } from '@/lib/api';
import { badRequest } from '@/lib/onboarding-api';
import { beginnerVersionFrom } from '@/lib/beginner-2';
import { levelUpConversationId } from '@/lib/level-up-address';
import { answerLevelUp, levelUpOffer, offerWords, setStep, MAX_STEP } from '@/lib/level-up';

export async function GET(request: Request) {
  return withLearner(request, 'v1 level-up', async (learnerId) => {
    // However the app wrote the address: builds up to 16 put the "?" in the path (lib/level-up-address.ts)
    const conversationId = levelUpConversationId(request);
    if (!z.string().uuid().safeParse(conversationId).success) return apiError('bad_request', 'conversationId must be a uuid');
    const offer = await levelUpOffer(learnerId, conversationId, beginnerVersionFrom(request.headers));
    if (!offer) return Response.json({ due: false });
    return Response.json({ due: true, offer, words: offerWords(offer.to, offer.nextStep) });
  });
}

const Body = z.union([z.object({ answer: z.enum(['yes', 'not-yet']) }), z.object({ step: z.number().int().min(1).max(MAX_STEP) })]);

export async function POST(request: Request) {
  return withLearner(request, 'v1 level-up', async (learnerId) => {
    const body = Body.safeParse(await request.json().catch(() => null));
    if (!body.success) return badRequest(body.error);
    if ('answer' in body.data) {
      const s = await answerLevelUp(learnerId, body.data.answer);
      return Response.json({ step: s.step, level: s.level });
    }
    const s = await setStep(learnerId, body.data.step);
    return Response.json({ step: s.step });
  });
}
