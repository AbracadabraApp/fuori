/**
 * POST /v1/turn
 *   { cityId, placeId, tripTo?, conversationId?, learnerSaid?, speed? }
 *   → { line, en, conversationId, promptVersion, replies, stage }
 *
 * Without conversationId: the character's opening line, and a new
 * conversation. With it: the learner's line (learnerSaid) and the reply. The
 * server works out the character from the ids and reads the conversation so
 * far from the database; the app never sends a character sheet or a
 * transcript (docs/12-native-app.md). Same turn code as the web
 * (lib/conversation/take-turn.ts). The voice for the line is started as soon
 * as it's written, at `speed` (lib/voice/early-voice.ts), so /v1/speak is
 * quicker; the exchange is saved after the reply goes out.
 *
 * With `Accept: application/x-ndjson` the answer streams, one JSON object per
 * line: { first } (the line's first sentence, exactly as the line starts,
 * once more of it follows; its voice is already being made) and then
 * { reply: <the body above> } or { error, status }. The app says the first
 * sentence while the rest is written, then asks /v1/speak for the rest
 * (trimmed), whose voice carries on from the first.
 *
 * `replies`: the learner's next turn uses the two reply buttons
 * (/v1/replies) shown above the mic; `stage` says which: read (two good
 * answers to read one out loud) or choose (only one fits), or null. New learners, the first turns of their first conversations
 * (lib/scaffold.ts). `replies` stays for apps that don't read `stage`.
 */
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { apiError, apiJson, withLearner } from '@/lib/api';
import { parseTurnRequest, MAX_SAID_CHARS } from '@/lib/turn-request';
import { loadConversationTurns } from '@/lib/recording';
import { takeTurn } from '@/lib/conversation/take-turn';
import { logServerError } from '@/lib/server-log';
import { Laps } from '@/lib/timing';
import { scaffoldFacts, scaffoldStage } from '@/lib/scaffold';
import { cities, tutor } from '@/content';
import { writeLearnAhead } from '@/lib/learn-ahead';
import { startEarlyVoice, DEFAULT_APP_SPEED, LineWatcher } from '@/lib/voice/early-voice';
import { PartsWatcher, type Part } from '@/lib/beginner';

/** Asked for in Accept, the reply streams: { first }, then { reply } or { error } */
const NDJSON = 'application/x-ndjson';

const Body = z.object({
  cityId: z.string(),
  placeId: z.string(),
  tripTo: z.string().optional(),
  conversationId: z.string().uuid().optional(),
  learnerSaid: z.string().max(MAX_SAID_CHARS).optional(),
  /** The speed the app will ask /v1/speak for; the voice is started early at it */
  speed: z.number().min(0.5).max(2).optional(),
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

    const speed = body.data.speed ?? DEFAULT_APP_SPEED;
    // Start the voice while the rest is still being written; /v1/speak takes it
    const voice = (text: string, previousText?: string) =>
      startEarlyVoice({
        learnerId,
        characterId: parsed.character.id,
        text: text.trim(),
        speed,
        previousText: previousText?.trim(),
        onError: (err) => logServerError(request, 'v1 turn early voice', err),
      });

    /** The turn; onFirst, when streaming, gets the first sentence as soon as more follows it */
    const run = async (onFirst?: (first: string, parts?: Part[]) => void): Promise<{ body: object; headers: Record<string, string> } | { error: Response }> => {
      const watcher = new LineWatcher({
        split: !!onFirst,
        onFirst: (first) => {
          voice(first);
          onFirst?.(first);
        },
        // Split: the rest carries on from the first sentence. Not split: the whole line
        onLine: (line, first) => (first ? voice(line.slice(first.length), first) : voice(line)),
      });
      // Beginner turns come in parts (lib/beginner.ts): the first parts start the voice
      let partsFirst: string | undefined;
      const partsWatcher = new PartsWatcher((first, leadParts) => {
        if (!onFirst) return; // the app doesn't stream: the whole line's voice is started below
        partsFirst = first;
        voice(first);
        onFirst(first, leadParts);
      });
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
          // The conversation was loaded above as this learner's
          saveAfterReply: true,
          onText: (snapshot) => {
            watcher.feed(snapshot);
            partsWatcher.feed(snapshot);
          },
        });
        // Beginner: the voice for the rest (after the first parts), or the whole line
        if (result.reply.parts) {
          if (partsFirst && result.reply.line.startsWith(partsFirst)) voice(result.reply.line.slice(partsFirst.length), partsFirst);
          else voice(result.reply.line);
        }
        const facts = await scaffoldFacts(learnerId, result.conversationId ?? null, tutor.id);
        const learnerTurns = parsed.transcript.filter((t) => t.who === 'learner').length + (learnerSaid ? 1 : 0);
        // Beginner level dialogue offers its own answers to say back: no answer panel with it
        const stage = result.reply.parts ? null : scaffoldStage({ ...facts, learnerTurns, isTutor: result.isTutor });
        const replies = stage !== null;
        laps.lap('scaffold');
        // The Learn page for the conversation as it now stands, written while
        // the learner reads and answers (lib/learn-ahead.ts)
        if (result.conversationId && !result.isTutor) {
          writeLearnAhead({
            conversationId: result.conversationId,
            character: parsed.character,
            city: cities.find((c) => c.id === parsed.cityId)?.name ?? parsed.cityId,
            transcript: [
              ...parsed.transcript,
              ...(parsed.learnerSaid ? [{ who: 'learner' as const, transcript: parsed.learnerSaid }] : []),
              { who: 'npc' as const, transcript: result.reply.line, translation: result.reply.en },
            ],
            onError: (err) => logServerError(request, 'v1 turn learn ahead', err),
          });
        }
        laps.facts.turn = conversationId ? 'reply' : 'opening';
        laps.facts.replies = stage ?? 'no';
        laps.facts.streamed = onFirst ? 'yes' : 'no';
        laps.log('turn-timing', request.headers.get('x-fuori-id'));
        const headers: Record<string, string> = { 'server-timing': laps.header() };
        // Read by scripts/smoke-live.ts
        if (result.memory) headers['x-memory'] = `${result.memory.visits} visits, ${result.memory.notes.length} notes`;
        if (result.isTutor) headers['x-study-file'] = `${result.memory?.notes.length ?? 0} lines, ${result.memory?.visits ?? 0} lessons`;
        return { body: { ...result.reply, conversationId: result.conversationId, promptVersion: result.promptVersion, replies, stage }, headers };
      } catch (err) {
        logServerError(request, 'v1 turn', err);
        // Claude busy or down: worth retrying; anything else isn't
        if (err instanceof Anthropic.APIError && (err.status === 429 || err.status === 529 || (err.status ?? 0) >= 500)) {
          return { error: apiError('upstream_unavailable', 'Claude is busy or unavailable', 2000) };
        }
        return { error: apiError('server_error', `Something went wrong on the server${request.headers.get('x-fuori-id') ? ` (${request.headers.get('x-fuori-id')})` : ''}`) };
      }
    };

    if (!request.headers.get('accept')?.includes(NDJSON)) {
      const r = await run();
      return 'error' in r ? r.error : apiJson(r.body, { headers: r.headers });
    }

    // Streamed: one JSON object per line. { first } as soon as the first
    // sentence is written, so the app can start saying it; then { reply } (the
    // same body as unstreamed), or { error, status } (the same error body)
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (o: object) => {
          try {
            controller.enqueue(encoder.encode(JSON.stringify(o) + '\n'));
          } catch {
            // The app went away (left or paused the scene); the turn is still saved
          }
        };
        const r = await run((first, parts) => send(parts ? { first, parts } : { first }));
        if ('error' in r) send({ ...(await r.error.json()), status: r.error.status });
        else send({ reply: r.body });
        try {
          controller.close();
        } catch {
          // already closed by the app going away
        }
      },
    });
    return new Response(stream, { headers: { 'content-type': NDJSON, 'cache-control': 'no-store', 'x-accel-buffering': 'no' } });
  });
}
