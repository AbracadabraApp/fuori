/**
 * POST /v1/me/address { addressedAs: "f" | "m" } → 204
 *
 * Settings: how characters address them, for learners who never saw the
 * greeter's question (docs/onboarding-design.md → Name and address).
 */
import { z } from 'zod';
import { apiError, withLearner } from '@/lib/api';
import { badRequest } from '@/lib/onboarding-api';
import { chooseAddressedAs, learnerAddressOn } from '@/lib/learner-address';

const Body = z.object({ addressedAs: z.enum(['f', 'm']) });

export async function POST(request: Request) {
  return withLearner(request, 'v1 me address', async (learnerId) => {
    const body = Body.safeParse(await request.json().catch(() => null));
    if (!body.success) return badRequest(body.error);
    if (!learnerAddressOn()) return apiError('not_found', 'Address is not turned on on this server');
    await chooseAddressedAs(learnerId, body.data.addressedAs);
    return new Response(null, { status: 204 });
  });
}
