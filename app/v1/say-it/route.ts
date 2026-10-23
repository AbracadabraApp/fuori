/**
 * POST /v1/say-it { cityId, placeId, tripTo?, conversationId?, heard }
 *   → { line, en, promptVersion }
 *
 * Say it in English (docs/beginner-scaffolding.md; Josh, 2026-10-23): the
 * learner said `heard` in English on their turn; this returns the one line in
 * the language they read out loud to the character, at their level. The app
 * shows what they said and the line, then opens the mic for the reading,
 * which goes to /v1/turn as usual. The server reads the conversation from the
 * database (none yet: the opening line only) and the learner's level.
 */
import { z } from 'zod';
import { apiError, apiJson, withLearner } from '@/lib/api';
import { allow } from '@/lib/rate-limit';
import { parseTurnRequest, MAX_SAID_CHARS } from '@/lib/turn-request';
import { loadConversationTurns } from '@/lib/recording';
import { badRequest, claudeFailed } from '@/lib/onboarding-api';
import { sayItPromptVersion, writeSayIt } from '@/lib/say-it';
import { query } from '@/lib/db';
import type { Level } from '@/lib/onboarding';

const Body = z.object({
  cityId: z.string(),
  placeId: z.string(),
  tripTo: z.string().optional(),
  conversationId: z.string().uuid().optional(),
  heard: z.string().trim().min(1).max(MAX_SAID_CHARS),
});

export async function POST(request: Request) {
  return withLearner(request, 'v1 say-it', async (learnerId) => {
    const body = Body.safeParse(await request.json().catch(() => null));
    if (!body.success) return badRequest(body.error);
    // One call per English turn; a long conversation is well under this
    if (!allow(`say-it:${learnerId}`, 120, 10 * 60 * 1000)) return apiError('rate_limited', 'Too many tries; wait a moment', 60_000);

    const { cityId, placeId, tripTo, conversationId, heard } = body.data;
    const parsed = parseTurnRequest({ cityId, placeId, tripTo });
    if (!parsed.ok) return apiError(parsed.status === 404 ? 'not_found' : 'bad_request', parsed.error);

    const transcript = conversationId ? await loadConversationTurns(conversationId, learnerId) : [];
    if (!transcript) return apiError('not_found', 'No such conversation for this learner');
    const level = (await query<{ level: Level | null }>('SELECT level FROM learners WHERE id = $1', [learnerId])).rows[0]?.level ?? null;

    try {
      const line = await writeSayIt(parsed.character, transcript, heard, level);
      return apiJson({ ...line, promptVersion: sayItPromptVersion() });
    } catch (err) {
      return claudeFailed(request, 'v1 say-it', err);
    }
  });
}
