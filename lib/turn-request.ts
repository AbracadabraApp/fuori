/**
 * What /api/turn accepts. The client sends ids and the server works out the
 * character (lib/characters/for-visit.ts); a character sheet in the body is
 * ignored. Sizes are capped so one request can't run up a large bill.
 *
 * The caps are generous: a long spoken turn is a few hundred characters, and
 * Magda's longest lines are well under the line cap. The transcript still comes
 * from the client; loading it from the database instead is part of N0 in
 * docs/12-native-app.md.
 */

import { z } from 'zod';
import { characterForVisit } from '@/lib/characters/for-visit';
import type { CharacterSheet, Turn } from '@/lib/types';

export const MAX_SAID_CHARS = 2000;
export const MAX_LINE_CHARS = 2000;
export const MAX_TURNS = 200;

const id = z.string().min(1).max(120);

const TurnRequestSchema = z.object({
  cityId: id,
  placeId: id,
  tripTo: id.optional(),
  learnerSaid: z.string().max(MAX_SAID_CHARS).optional(),
  transcript: z
    .array(
      z.object({
        who: z.enum(['npc', 'learner']),
        transcript: z.string().max(MAX_LINE_CHARS),
        translation: z.string().max(MAX_LINE_CHARS).optional(),
      })
    )
    .max(MAX_TURNS)
    .default([]),
  conversationId: z.string().max(120).nullish(),
});

/**
 * A conversation loaded from our own database, made to fit the caps above:
 * the newest MAX_TURNS turns, each line cut at MAX_LINE_CHARS. The caps are
 * for transcripts a browser sends; applied to a stored one they refused every
 * turn after the 200th, for good (whole-app scan, 2026-10-29). The prompt
 * uses the last 40 turns anyway (lib/prompts/build-turn-prompt.ts).
 */
export function fitStoredTranscript<T extends { transcript: string; translation?: string }>(turns: T[]): T[] {
  return turns.slice(-MAX_TURNS).map((t) => ({
    ...t,
    transcript: t.transcript.slice(0, MAX_LINE_CHARS),
    ...(t.translation !== undefined ? { translation: t.translation.slice(0, MAX_LINE_CHARS) } : {}),
  }));
}

export type TurnRequest =
  | {
      ok: true;
      character: CharacterSheet;
      cityId: string;
      transcript: Turn[];
      learnerSaid?: string;
      conversationId?: string;
    }
  | { ok: false; status: number; error: string };

export function parseTurnRequest(body: unknown): TurnRequest {
  const parsed = TurnRequestSchema.safeParse(body);
  if (!parsed.success) {
    return { ok: false, status: 400, error: `Invalid turn request: ${parsed.error.issues.map((i) => `${i.path.join('.')} ${i.message}`).join('; ')}` };
  }
  const { cityId, placeId, tripTo, learnerSaid, transcript, conversationId } = parsed.data;

  // For non-first turns, learnerSaid is required
  if (transcript.length > 0 && !learnerSaid) {
    return { ok: false, status: 400, error: 'learnerSaid is required for non-first turns' };
  }

  const character = characterForVisit(cityId, placeId, tripTo);
  if (!character) return { ok: false, status: 404, error: `Nobody to talk to at ${cityId}/${placeId}` };

  return { ok: true, character, cityId, transcript, learnerSaid, conversationId: conversationId ?? undefined };
}
