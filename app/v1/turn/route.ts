/**
 * POST /v1/turn
 *   { cityId, placeId, tripTo?, conversationId?, learnerSaid? }
 *   → { line, en, conversationId, promptVersion }
 *
 * Without conversationId: the character's opening line, and a new
 * conversation. With it: the learner's line (learnerSaid) and the reply. The
 * server works out the character from the ids and reads the conversation so
 * far from the database; the app never sends a character sheet or a
 * transcript (docs/12-native-app.md). Same turn code as the web
 * (lib/conversation/take-turn.ts).
 */
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { apiError, apiJson, withLearner } from '@/lib/api';
import { parseTurnRequest, MAX_SAID_CHARS } from '@/lib/turn-request';
import { loadConversationTurns } from '@/lib/recording';
import { takeTurn } from '@/lib/conversation/take-turn';
import { logServerError } from '@/lib/server-log';
import { Laps } from '@/lib/timing';

const Body = z.object({
  cityId: z.string(),
  placeId: z.string(),
  tripTo: z.string().optional(),
  conversationId: z.string().uuid().optional(),
  learnerSaid: z.string().max(MAX_SAID_CHARS).optional(),
});

export async function POST(request: Request) {
  const laps = new Laps();
  return withLearner(request, 'v1 turn', async (learnerId) => {
    laps.lap('auth');
    const body = Body.safeParse(await request.json().catch(() => null));
    if (!body.success) return apiError('bad_request', body.error.issues.map((i) => `${i.path.join('.')} ${i.message}`).join('; '));
    const { conversationId, learnerSaid } = body.data;

    let transcript: Awaited<ReturnType<typeof loadConversationTurns>> = [];
    if (conversationId) {
      if (!learnerSaid) return apiError('bad_request', 'learnerSaid is required after the opening line');
      transcript = await loadConversationTurns(conversationId, learnerId);
      if (!transcript) return apiError('not_found', 'No such conversation for this learner');
    }
    laps.lap('load');

    // Same checks as the web: the character from ids, sizes capped
    const parsed = parseTurnRequest({ ...body.data, transcript: transcript.map(({ who, transcript, translation }) => ({ who, transcript, translation })) });
    if (!parsed.ok) return apiError(parsed.status === 404 ? 'not_found' : 'bad_request', parsed.error);

    try {
      const result = await takeTurn({
        learnerId,
        character: parsed.character,
        cityId: parsed.cityId,
        transcript: parsed.transcript,
        learnerSaid: parsed.learnerSaid,
        conversationId,
        requestId: request.headers.get('x-fuori-id') ?? undefined,
        onSoftError: (where, err) => logServerError(request, where, err),
        laps,
      });
      laps.facts.turn = conversationId ? 'reply' : 'opening';
      laps.log('turn-timing', request.headers.get('x-fuori-id'));
      const headers: Record<string, string> = { 'server-timing': laps.header() };
      // Read by scripts/smoke-live.ts
      if (result.memory) headers['x-memory'] = `${result.memory.visits} visits, ${result.memory.notes.length} notes`;
      if (result.isTutor) headers['x-study-file'] = `${result.memory?.notes.length ?? 0} lines, ${result.memory?.visits ?? 0} lessons`;
      return apiJson(
        { ...result.reply, conversationId: result.conversationId, promptVersion: result.promptVersion },
        { headers }
      );
    } catch (err) {
      logServerError(request, 'v1 turn', err);
      // Claude busy or down: worth retrying; anything else isn't
      if (err instanceof Anthropic.APIError && (err.status === 429 || err.status === 529 || (err.status ?? 0) >= 500)) {
        return apiError('upstream_unavailable', 'Claude is busy or unavailable', 2000);
      }
      return apiError('server_error', `Something went wrong on the server${request.headers.get('x-fuori-id') ? ` (${request.headers.get('x-fuori-id')})` : ''}`);
    }
  });
}
