/**
 * POST /v1/lesson/start { stepId } → { stepId, title, magda: { city, place, characterId }, practice: [{ city, place, characterId }] }
 *
 * A lesson's plan (lib/lesson.ts): where Magda teaches and who the learner
 * practises with, each with the place as /v1/content shows places, so the app
 * opens the conversation screen for each part. Every turn of the lesson then
 * goes to /v1/turn with lesson: { stepId, part, scene?, practiceIds? }.
 */
import { z } from 'zod';
import { apiError, apiJson, withLearner } from '@/lib/api';
import { lessonPlan } from '@/lib/lesson';

const Body = z.object({ stepId: z.string().max(80) });

export async function POST(request: Request) {
  return withLearner(request, 'v1 lesson start', async (learnerId) => {
    const body = Body.safeParse(await request.json().catch(() => null));
    if (!body.success) return apiError('bad_request', body.error.issues.map((i) => `${i.path.join('.')} ${i.message}`).join('; '));
    const plan = lessonPlan(body.data.stepId, learnerId);
    if (!plan) return apiError('not_found', `No lesson ${body.data.stepId}`);
    return apiJson(plan);
  });
}
