/**
 * POST /v1/onboarding/reset → 204
 *
 * Settings → touch and hold Version → Restart onboarding: clears the level and
 * the onboarding record so the greeter welcomes them again. Conversations,
 * visits and what characters remember stay.
 */
import { withLearner } from '@/lib/api';
import { resetOnboarding } from '@/lib/onboarding';

export async function POST(request: Request) {
  return withLearner(request, 'v1 onboarding reset', async (learnerId) => {
    await resetOnboarding(learnerId);
    return new Response(null, { status: 204, headers: { 'cache-control': 'no-store' } });
  });
}
