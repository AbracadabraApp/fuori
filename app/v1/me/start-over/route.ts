/**
 * POST /v1/me/start-over → { learnerId, token }
 *
 * Settings → Restart Fuori (Josh, 2026-10-23: "clear history & restart the
 * game"; a new player, the old one kept; this country only). Signed in as the
 * current learner; makes a new learner and token for this device, which the
 * app saves in place of the old one. The old learner and everything they did
 * stay in the database, unseen; the new one records which learner it
 * replaced (onboarding.startedOverFrom), so a mistaken restart can be undone
 * by pointing a token back at the old learner.
 */
import { registerDevice } from '@/lib/auth';
import { apiError, apiJson, serverError, withLearner } from '@/lib/api';
import { allow } from '@/lib/rate-limit';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  return withLearner(request, 'v1 me start-over', async (learnerId) => {
    if (!allow(`start-over:${learnerId}`, 5, 60 * 60 * 1000)) return apiError('rate_limited', 'Too many restarts; wait a while', 60 * 60 * 1000);
    try {
      const fresh = await registerDevice();
      await query(`UPDATE learners SET onboarding = jsonb_build_object('startedOverFrom', $2::text) WHERE id = $1`, [fresh.learnerId, learnerId]);
      console.log(JSON.stringify({ level: 'info', event: 'start over', from: learnerId, to: fresh.learnerId }));
      return apiJson(fresh, { status: 201 });
    } catch (err) {
      return serverError(request, 'v1 me start-over', err);
    }
  });
}
