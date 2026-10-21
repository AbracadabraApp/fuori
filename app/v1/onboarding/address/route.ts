/**
 * POST /v1/onboarding/address { addressedAs: "f" | "m", name? } → 204
 *
 * The greeter asked their name and whether she should say benvenuta or
 * benvenuto (docs/onboarding-design.md → Name and address). Every character
 * then addresses them that way; the name stays with her (onboarding record).
 */
import { z } from 'zod';
import { apiError, withLearner } from '@/lib/api';
import { badRequest } from '@/lib/onboarding-api';
import { chooseAddressedAs, learnerAddressOn } from '@/lib/learner-address';
import { MAX_SAID_CHARS } from '@/lib/turn-request';

const Body = z.object({ addressedAs: z.enum(['f', 'm']), name: z.string().trim().min(1).max(MAX_SAID_CHARS).optional() });

export async function POST(request: Request) {
  return withLearner(request, 'v1 onboarding address', async (learnerId) => {
    const body = Body.safeParse(await request.json().catch(() => null));
    if (!body.success) return badRequest(body.error);
    if (!learnerAddressOn()) return apiError('not_found', 'Address is not turned on on this server');
    await chooseAddressedAs(learnerId, body.data.addressedAs, body.data.name);
    return new Response(null, { status: 204 });
  });
}
