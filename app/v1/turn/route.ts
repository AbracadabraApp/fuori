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
import { sharedWhileRunning } from '@/lib/in-flight';
import { ReplyStalled } from '@/lib/claude';
import { allow } from '@/lib/rate-limit';
import { parseTurnRequest, fitStoredTranscript, MAX_SAID_CHARS } from '@/lib/turn-request';
import { loadConversationTurns } from '@/lib/recording';
import { takeTurn } from '@/lib/conversation/take-turn';
import { logServerError } from '@/lib/server-log';
import { Laps } from '@/lib/timing';
import { scaffoldFacts, scaffoldStage } from '@/lib/scaffold';
import { cities, tutor } from '@/content';
import { writeLearnAhead } from '@/lib/learn-ahead';
import { startEarlyVoice, DEFAULT_APP_SPEED, LineWatcher } from '@/lib/voice/early-voice';
import { PartsWatcher, type Part } from '@/lib/beginner';
import { DraftStore } from '@/lib/draft-turns';
import { isSaidBack } from '@/lib/conversation-record';

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
  /** The app can't use the mic (refused): the welcome says once where to turn it on (lib/welcome.ts) */
  micOff: z.boolean().optional(),
  /** This conversation is the welcome (lib/welcome.ts; apps from build 10) */
  welcome: z.boolean().optional(),
  /** A lesson's turn (lib/lesson.ts) */
  lesson: z.object({
    stepId: z.string().max(80),
    part: z.enum(['teach', 'practice', 'review', 'story']),
    scene: z.number().int().min(0).max(5).optional(),
    practiceIds: z.array(z.string().uuid()).max(5).optional(),
  }).optional(),
});

/**
 * Turns being answered, by learner, conversation and what they said: the app
 * resends a turn after a dropped connection, and both copies were answered
 * and saved (the learner's line twice, two replies; whole-app scan,
 * 2026-10-29). A copy that arrives while the first is still being answered
 * waits for it and gets the same reply. One server process per country
 * (Railway), so memory covers every request.
 */
type Settled = { body: object; headers: Record<string, string>; after?: (said?: string, replyMs?: number) => void } | { status: number; error: object };
const inFlight = new Map<string, Promise<Settled>>();

/**
 * Replies written ahead (Josh, 2026-11-08): a Beginner line offers 2-3
 * answers to say back, so her reply to each is written as soon as her line
 * is, while she speaks and they answer. Saying one back (isSaidBack) claims
 * its reply, saved then with what they actually said; the others are dropped
 * unsaved. Real play says an offered answer back on ~40% of S1 turns.
 * `offered` holds each conversation's answers (learner|conversation); a reply
 * nobody claims in 2 minutes is logged and never saved (lib/draft-turns.ts).
 */
const drafts = new DraftStore<Settled>(120_000, (key, entry) => {
  console.log(JSON.stringify({ level: 'info', event: 'draft-wasted', learner: key.split('|')[0].slice(0, 8), written: entry.settledAt !== undefined, writeMs: entry.settledAt !== undefined ? entry.settledAt - entry.startedAt : null }));
});
const offered = new Map<string, string[]>();
// An answer with a blank ("Sono di …") is finished in their own words, so its reply can't be written ahead
const answersIn = (body: object): string[] =>
  ((body as { parts?: Part[] }).parts ?? []).filter((p) => p.kind === 'answer').map((p) => p.text).filter((t) => t && !/…|\.\.\./.test(t));

export async function POST(request: Request) {
  const laps = new Laps();
  return withLearner(request, 'v1 turn', async (learnerId) => {
    laps.lap('auth');
    const body = Body.safeParse(await request.json().catch(() => null));
    if (!body.success) return apiError('bad_request', body.error.issues.map((i) => `${i.path.join('.')} ${i.message}`).join('; '));
    // A ceiling per device (whole-app scan, 2026-10-29: turns had none):
    // hands-free at full speed is about one every 8 s, so real play stays far below
    // A draft has its own ceiling, so spoken-over drafts don't use up the turns' share
    if (!allow(`turn:${learnerId}`, 90, 10 * 60 * 1000) || !allow(`turn-day:${learnerId}`, 1500, 24 * 60 * 60 * 1000)) {
      return apiError('rate_limited', 'Too many turns; wait a minute', 60_000);
    }
    const { conversationId, learnerSaid } = body.data;

    let transcript: Awaited<ReturnType<typeof loadConversationTurns>> = [];
    if (conversationId) {
      if (!learnerSaid) return apiError('bad_request', 'learnerSaid is required after the opening line');
      transcript = await loadConversationTurns(conversationId, learnerId);
      if (!transcript) return apiError('not_found', 'No such conversation for this learner');
    }
    laps.lap('load');

    // Same checks as the web: the character from ids, sizes capped
    const parsed = parseTurnRequest({ ...body.data, transcript: fitStoredTranscript(transcript.map(({ who, transcript, translation }) => ({ who, transcript, translation }))) });
    if (!parsed.ok) return apiError(parsed.status === 404 ? 'not_found' : 'bad_request', parsed.error);
    // Magda only teaches in lessons (Josh, 2026-11-07): outside a lesson she isn't there
    if (parsed.character.id === tutor.id && !body.data.lesson) return apiError('not_found', 'Magda only teaches in lessons');

    const speed = body.data.speed ?? DEFAULT_APP_SPEED;
    // Start the voice while the rest is still being written; /v1/speak takes it
    const startVoice = (text: string, previousText?: string) =>
      startEarlyVoice({
        learnerId,
        characterId: parsed.character.id,
        text: text.trim(),
        speed,
        previousText: previousText?.trim(),
        onError: (err) => logServerError(request, 'v1 turn early voice', err),
      });

    /** The turn; onFirst, when streaming, gets the first sentence as soon as more follows it */
    /** A reply written ahead: this answer said back, after this transcript, in this conversation; no voice until it's claimed */
    type Ahead = { said: string; transcript: typeof parsed.transcript; conversationId: string };
    const run = async (onFirst?: (first: string, parts?: Part[]) => void, ahead?: Ahead): Promise<{ body: object; headers: Record<string, string>; after?: (said?: string, replyMs?: number) => void } | { error: Response }> => {
      const draft = !!ahead;
      // A reply written ahead is timed on its own: it runs after this request's turn, sometimes two at once
      const l = draft ? new Laps() : laps;
      const said = ahead ? ahead.said : parsed.learnerSaid;
      const transcriptNow = ahead ? ahead.transcript : parsed.transcript;
      const conversationNow = ahead ? ahead.conversationId : conversationId;
      const voice = (text: string, previousText?: string) => { if (!draft) startVoice(text, previousText); };
      // Once the first sentence has gone to the app, a retried reply couldn't follow it
      let firstSent = false;
      const watcher = new LineWatcher({
        split: !!onFirst,
        onFirst: (first) => {
          if (onFirst) firstSent = true;
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
        firstSent = true;
        voice(first);
        onFirst(first, leadParts);
      });
      try {
        const result = await takeTurn({
          learnerId,
          character: parsed.character,
          cityId: parsed.cityId,
          transcript: transcriptNow,
          learnerSaid: said,
          conversationId: conversationNow,
          requestId: request.headers.get('x-fuori-id') ?? undefined,
          onSoftError: (where, err) => logServerError(request, where, err),
          laps: l,
          // The conversation was loaded above as this learner's
          saveAfterReply: true,
          deferSave: draft,
          onText: (snapshot) => {
            watcher.feed(snapshot);
            partsWatcher.feed(snapshot);
          },
          canRetry: () => !firstSent,
          micOff: body.data.micOff,
          welcome: body.data.welcome,
          lesson: body.data.lesson,
        });
        // Beginner: the voice for the rest (after the first parts), or the whole line
        if (result.reply.parts) {
          if (partsFirst && result.reply.line.startsWith(partsFirst)) voice(result.reply.line.slice(partsFirst.length), partsFirst);
          else voice(result.reply.line);
        }
        const facts = await scaffoldFacts(learnerId, result.conversationId ?? null, tutor.id);
        const learnerTurns = transcriptNow.filter((t) => t.who === 'learner').length + (said ? 1 : 0);
        // Beginner level dialogue offers its own answers to say back: no answer panel with it
        // A lesson's parts end on their own button; the speaking mode's practice is in their own words (no panel)
        const stage = result.reply.parts || body.data.lesson ? null : scaffoldStage({ ...facts, learnerTurns, isTutor: result.isTutor });
        const replies = stage !== null;
        l.lap('scaffold');
        // The Learn page for the conversation as it now stands, written while
        // the learner reads and answers (lib/learn-ahead.ts)
        const learnAhead = (saidNow = said) => {
          if (!result.conversationId || result.isTutor) return;
          writeLearnAhead({
            conversationId: result.conversationId,
            character: parsed.character,
            city: cities.find((c) => c.id === parsed.cityId)?.name ?? parsed.cityId,
            transcript: [
              ...transcriptNow,
              ...(saidNow ? [{ who: 'learner' as const, transcript: saidNow }] : []),
              { who: 'npc' as const, transcript: result.reply.line, translation: result.reply.en },
            ],
            onError: (err) => logServerError(request, 'v1 turn learn ahead', err),
          });
        };
        // A draft saves and writes the Learn page only when its turn is confirmed
        if (!draft) {
          result.commit?.();
          learnAhead();
        }
        l.facts.turn = draft ? 'reply' : conversationId ? 'reply' : 'opening';
        l.facts.replies = stage ?? 'no';
        l.facts.streamed = onFirst ? 'yes' : 'no';
        // turn-timing is what a learner waited; a reply written ahead is logged apart (its wait is logged when it's claimed)
        l.log(draft ? 'draft-timing' : 'turn-timing', request.headers.get('x-fuori-id'));
        const headers: Record<string, string> = { 'server-timing': l.header() };
        // Read by scripts/smoke-live.ts
        if (result.memory) headers['x-memory'] = `${result.memory.visits} visits, ${result.memory.notes.length} notes`;
        if (result.isTutor) headers['x-study-file'] = `${result.memory?.notes.length ?? 0} lines, ${result.memory?.visits ?? 0} lessons`;
        return {
          body: { ...result.reply, conversationId: result.conversationId, promptVersion: result.promptVersion, replies, stage },
          headers,
          ...(draft ? { after: (saidNow?: string, replyMs?: number) => { result.commit?.(saidNow, replyMs); learnAhead(saidNow); } } : {}),
        };
      } catch (err) {
        logServerError(request, 'v1 turn', err);
        // Claude busy or down: worth retrying; anything else isn't
        // A reply that stalled (lib/claude.ts) is the same to the learner: busy, try again
        if (err instanceof ReplyStalled || (err instanceof Anthropic.APIError && (err.status === 429 || err.status === 529 || (err.status ?? 0) >= 500))) {
          return { error: apiError('upstream_unavailable', 'Claude is busy or unavailable', 2000) };
        }
        return { error: apiError('server_error', `Something went wrong on the server${request.headers.get('x-fuori-id') ? ` (${request.headers.get('x-fuori-id')})` : ''}`) };
      }
    };

    // The same turn already being answered: wait for it and send the same reply
    const key = conversationId && learnerSaid ? `${learnerId}|${conversationId}|${learnerSaid}` : null;
    const settle = async (onFirst?: (first: string, parts?: Part[]) => void, ahead?: Ahead): Promise<Settled> => {
      const r = await run(onFirst, ahead);
      return 'error' in r ? { status: r.error.status, error: await r.error.json() } : r;
    };

    // Her reply to each answer she offered, written now (not for lessons, the welcome or Magda)
    const writeAhead = (r: Settled, saidNow: string | undefined) => {
      if ('error' in r || body.data.lesson || body.data.welcome || parsed.character.id === tutor.id) return;
      const conv = (r.body as { conversationId?: string | null }).conversationId;
      const answers = answersIn(r.body);
      if (!conv || !answers.length) return;
      const line = (r.body as { line: string; en?: string });
      const after = fitStoredTranscript([
        ...parsed.transcript,
        ...(saidNow ? [{ who: 'learner' as const, transcript: saidNow }] : []),
        { who: 'npc' as const, transcript: line.line, translation: line.en },
      ]);
      offered.set(`${learnerId}|${conv}`, answers);
      for (const a of answers) drafts.start(`${learnerId}|${conv}|${a}`, (emit) => settle((first, parts) => emit({ first, parts }), { said: a, transcript: after, conversationId: conv }));
    };

    // They said one of her answers back: her reply is already written (its
    // first sentence goes out as it was, or as it comes); saved now with their words
    const claimAhead = (onFirst?: (first: string, parts?: Part[]) => void): Promise<Settled> | undefined => {
      if (!conversationId || !learnerSaid) return undefined;
      const claimedAt = performance.now();
      const answers = offered.get(`${learnerId}|${conversationId}`);
      offered.delete(`${learnerId}|${conversationId}`);
      const hit = answers?.find((a) => isSaidBack(learnerSaid, [a]));
      const draft = hit ? drafts.claim(`${learnerId}|${conversationId}|${hit}`, onFirst ? (e) => { const { first, parts } = e as { first: string; parts?: Part[] }; startVoice(first); onFirst(first, parts); } : undefined) : undefined;
      if (!draft) return undefined;
      return draft.done.then((r) => {
        // Failed before anything was said: answer as if there were nothing written ahead
        if ('error' in r) return draft.events.length ? r : settle(onFirst);
        // What the learner waited, not how long it took to write ahead: saved with the turn (the scorecard's reply time) and logged as the turn
        const waitMs = Math.round(performance.now() - claimedAt);
        r.after?.(learnerSaid, waitMs);
        laps.lap('draft-wait');
        laps.facts.turn = 'reply';
        laps.facts.replies = 'no';
        laps.facts.streamed = onFirst ? 'yes' : 'no';
        laps.facts.draft = 'used';
        laps.log('turn-timing', request.headers.get('x-fuori-id'));
        r = { ...r, headers: { ...r.headers, 'server-timing': laps.header() } };
        // The voice: written ahead without one; started now, split as the app will ask for it
        const lineNow = (r.body as { line: string }).line;
        const first = (draft.events[0] as { first?: string } | undefined)?.first;
        if (onFirst && first && lineNow.startsWith(first)) startVoice(lineNow.slice(first.length), first);
        else startVoice(lineNow);
        console.log(JSON.stringify({ level: 'info', event: 'draft-used', written: draft.settledAt !== undefined, headStartMs: Date.now() - draft.startedAt, writeMs: (draft.settledAt ?? Date.now()) - draft.startedAt }));
        return r;
      });
    };
    const answer = async (onFirst?: (first: string, parts?: Part[]) => void): Promise<Settled> => {
      const r = await sharedWhileRunning(inFlight, key, () => claimAhead(onFirst) ?? settle(onFirst));
      writeAhead(r, learnerSaid);
      return r;
    };

    if (!request.headers.get('accept')?.includes(NDJSON)) {
      const r = await answer();
      return 'error' in r ? Response.json(r.error, { status: r.status, headers: { 'cache-control': 'no-store' } }) : apiJson(r.body, { headers: r.headers });
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
        const r = await answer((first, parts) => send(parts ? { first, parts } : { first }));
        if ('error' in r) send({ ...r.error, status: r.status });
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
