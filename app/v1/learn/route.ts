/**
 * POST /v1/learn
 *   { cityId, placeId, tripTo?, conversationId }
 *   → { corrections: [{ said, why, right }],
 *       words: { things: [{ word, en, plural }], doing: [{ infinitive, en, form }] },
 *       goodToKnow, promptVersion }
 *
 * The Learn page for this conversation so far (docs/learn.md → The page),
 * written by lib/learn.ts; usually already written while the learner talked
 * (lib/learn-ahead.ts), so it opens at once. The app calls it when the learner opens the Learn
 * sheet (the Learn link, after four learner lines).
 * The app says each correction's `right` in the character's voice through
 * /v1/speak.
 *
 * Like /v1/replies, the server works out the character from the ids and reads
 * the conversation from the database; the app never sends a transcript.
 */
import { z } from 'zod';
import { cities } from '@/content';
import { apiError, apiJson, withLearner } from '@/lib/api';
import { allow } from '@/lib/rate-limit';
import { parseTurnRequest } from '@/lib/turn-request';
import { loadConversationTurns } from '@/lib/recording';
import { cannotWriteLearnPage, learnAvailable, learnPromptVersion, writeLearnPage } from '@/lib/learn';
import { badRequest, claudeFailed } from '@/lib/onboarding-api';
import { learnPageAhead } from '@/lib/learn-ahead';

const Body = z.object({
  cityId: z.string(),
  placeId: z.string(),
  tripTo: z.string().optional(),
  conversationId: z.string().uuid(),
});

export async function POST(request: Request) {
  return withLearner(request, 'v1 learn', async (learnerId) => {
    const body = Body.safeParse(await request.json().catch(() => null));
    if (!body.success) return badRequest(body.error);
    if (!learnAvailable()) return apiError('not_found', "Learn isn't ready for this country yet");
    // A page is a long call; a learner opens it a few times a conversation
    if (!allow(`learn:${learnerId}`, 30, 10 * 60 * 1000)) return apiError('rate_limited', 'Too many tries; wait a moment', 60_000);

    const { cityId, placeId, tripTo, conversationId } = body.data;
    const parsed = parseTurnRequest({ cityId, placeId, tripTo });
    if (!parsed.ok) return apiError(parsed.status === 404 ? 'not_found' : 'bad_request', parsed.error);

    const transcript = await loadConversationTurns(conversationId, learnerId);
    if (!transcript) return apiError('not_found', 'No such conversation for this learner');
    const notYet = cannotWriteLearnPage(transcript);
    if (notYet) return apiError('bad_request', notYet);

    const city = cities.find((c) => c.id === cityId)?.name ?? cityId;
    try {
      // Written ahead while they talked (lib/learn-ahead.ts), else now
      const page = (await learnPageAhead(conversationId, transcript.length)) ?? (await writeLearnPage(parsed.character, city, transcript));
      return apiJson({ ...page, promptVersion: learnPromptVersion() });
    } catch (err) {
      return claudeFailed(request, 'v1 learn', err);
    }
  });
}
