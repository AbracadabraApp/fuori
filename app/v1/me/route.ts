/**
 * GET /v1/me → { learnerId, country, visits: { placeId: count }, level, onboarded }
 *
 * The signed-in learner, how many conversations they've had at each place
 * (the visit stamps), their level (null until the greeter has placed them)
 * and whether onboarding is done, so the app knows whether to show it.
 * Settings join this in M3 item 3.
 */
import { country } from '@/content';
import { apiJson, withLearner } from '@/lib/api';
import { visitCounts } from '@/lib/visits';
import { onboardingState } from '@/lib/onboarding';

export async function GET(request: Request) {
  return withLearner(request, 'v1 me', async (learnerId) =>
    apiJson({ learnerId, country, visits: await visitCounts(learnerId), ...(await onboardingState(learnerId)) })
  );
}
