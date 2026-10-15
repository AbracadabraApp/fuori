/**
 * GET /v1/me → { learnerId, country, visits: { placeId: count } }
 *
 * The signed-in learner, and how many conversations they've had at each place
 * (the visit stamps). Settings join this in M3 item 3.
 */
import { country } from '@/content';
import { apiJson, withLearner } from '@/lib/api';
import { visitCounts } from '@/lib/visits';

export async function GET(request: Request) {
  return withLearner(request, 'v1 me', async (learnerId) =>
    apiJson({ learnerId, country, visits: await visitCounts(learnerId) })
  );
}
