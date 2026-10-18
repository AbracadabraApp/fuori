/**
 * POST /v1/replies
 *   { cityId, placeId, tripTo?, conversationId }
 *   → { frame, replies: [{ line, en }, { line, en }], promptVersion }
 *
 * The two reply buttons for beginner levels 1–3 (docs/beginner-scaffolding.md):
 * two whole-line replies to the character's last line, written by a separate
 * call (lib/replies.ts) so /v1/turn stays { line, en }. The app calls it while
 * the character speaks, and only when Settings → "Reply buttons (test)" is on
 * (off by default). The tapped line goes back through /v1/turn as learnerSaid.
 *
 * Like /v1/turn, the server works out the character from the ids and reads the
 * conversation from the database; the app never sends a transcript.
 */
import { z } from 'zod';
import { apiError, apiJson, withLearner } from '@/lib/api';
import { allow } from '@/lib/rate-limit';
import { parseTurnRequest } from '@/lib/turn-request';
import { loadConversationTurns } from '@/lib/recording';
import { cannotOfferReplies, repliesPromptVersion, writeReplies } from '@/lib/replies';
import { badRequest, claudeFailed } from '@/lib/onboarding-api';

const Body = z.object({
  cityId: z.string(),
  placeId: z.string(),
  tripTo: z.string().optional(),
  conversationId: z.string().uuid(),
});

export async function POST(request: Request) {
  return withLearner(request, 'v1 replies', async (learnerId) => {
    const body = Body.safeParse(await request.json().catch(() => null));
    if (!body.success) return badRequest(body.error);
    // One call per character line; a long conversation is well under this
    if (!allow(`replies:${learnerId}`, 120, 10 * 60 * 1000)) return apiError('rate_limited', 'Too many tries; wait a moment', 60_000);

    const { cityId, placeId, tripTo, conversationId } = body.data;
    const parsed = parseTurnRequest({ cityId, placeId, tripTo });
    if (!parsed.ok) return apiError(parsed.status === 404 ? 'not_found' : 'bad_request', parsed.error);

    const transcript = await loadConversationTurns(conversationId, learnerId);
    if (!transcript) return apiError('not_found', 'No such conversation for this learner');
    const notYet = cannotOfferReplies(transcript);
    if (notYet) return apiError('bad_request', notYet);

    try {
      const replies = await writeReplies(parsed.character, transcript);
      return apiJson({ ...replies, promptVersion: repliesPromptVersion() });
    } catch (err) {
      return claudeFailed(request, 'v1 replies', err);
    }
  });
}
