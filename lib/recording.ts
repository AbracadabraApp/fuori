/**
 * Recording conversations: every turn is saved to Postgres as it happens, so
 * conversations can be reviewed afterwards (by us for quality, later by the
 * review log and Magda). Started 2026-10-12: Josh wanted real transcripts to
 * analyse after the fact, e.g. whether prompt changes shorten long turns.
 *
 * Recording must never break a conversation: every function here catches its
 * own errors, logs them, and carries on. With no DATABASE_URL (local dev, the
 * conversation tests) it does nothing.
 *
 * Server-side only.
 */

import { query } from './db';
import { startConversation, addConversationTurn } from './memory';
import type { CharacterSheet } from './types';

export function recordingEnabled(): boolean {
  return !!process.env.DATABASE_URL;
}

interface RecordTurnParams {
  learnerId: string;
  /** From the browser; null on the opening line */
  conversationId: string | null;
  character: CharacterSheet;
  cityId: string;
  promptVersion: string;
  /** What Whisper heard; absent on the opening line */
  learnerSaid?: string;
  reply: { it: string; en: string };
}

/**
 * Save one exchange (the learner's line, if any, then the character's reply).
 * Starts a new conversation when there's no id, or the id isn't this learner's.
 * Returns the conversation id to send back to the browser, or null on failure.
 */
export async function recordTurn(p: RecordTurnParams): Promise<string | null> {
  if (!recordingEnabled()) return null;
  try {
    const at = new Date().toISOString();
    let id = p.conversationId;
    const turns = [
      ...(p.learnerSaid ? [{ who: 'learner' as const, text: p.learnerSaid, at }] : []),
      { who: 'npc' as const, text: p.reply.it, en: p.reply.en, at },
    ];

    if (id) {
      const ok = await addConversationTurn(id, p.learnerId, turns[0]);
      if (!ok) id = null; // not found, or someone else's: start fresh
      else {
        for (const t of turns.slice(1)) await addConversationTurn(id, p.learnerId, t);
        return id;
      }
    }

    id = await startConversation(p.learnerId, p.character.id, p.character.placeId ?? '', p.cityId, p.promptVersion);
    for (const t of turns) await addConversationTurn(id, p.learnerId, t);
    return id;
  } catch (err) {
    console.error(JSON.stringify({ level: 'error', where: 'recording', message: err instanceof Error ? err.message : String(err) }));
    return null;
  }
}

/** Mark a conversation as ended (the learner left the screen). Never throws. */
export async function markConversationEnded(conversationId: string, learnerId: string): Promise<void> {
  if (!recordingEnabled()) return;
  try {
    await query('UPDATE conversations SET ended_at = now() WHERE id = $1 AND learner_id = $2', [conversationId, learnerId]);
  } catch (err) {
    console.error(JSON.stringify({ level: 'error', where: 'recording end', message: err instanceof Error ? err.message : String(err) }));
  }
}

export interface RecordedConversation {
  id: string;
  character_id: string;
  place_id: string;
  city_id: string;
  prompt_version: string;
  started_at: Date;
  ended_at: Date | null;
  turns: { who: 'npc' | 'learner'; text: string; en?: string; at: string }[];
}

/**
 * Most recent conversations, newest first (for review). `since` limits it to
 * conversations started after that time, so a daily job only reads new ones.
 */
export async function recentConversations(limit = 20, since?: Date): Promise<RecordedConversation[]> {
  const result = await query<RecordedConversation>(
    `SELECT id, character_id, place_id, city_id, prompt_version, started_at, ended_at, turns
     FROM conversations
     WHERE ($2::timestamptz IS NULL OR started_at > $2)
     ORDER BY started_at DESC LIMIT $1`,
    [Math.min(Math.max(limit, 1), 200), since ?? null]
  );
  return result.rows;
}

/** Simple numbers per conversation, so length can be tracked without reading every line. */
export function conversationStats(c: RecordedConversation) {
  const words = (t: string) => t.split(/\s+/).filter(Boolean).length;
  const npc = c.turns.filter((t) => t.who === 'npc').map((t) => words(t.text));
  const learner = c.turns.filter((t) => t.who === 'learner').map((t) => words(t.text));
  const avg = (xs: number[]) => (xs.length ? Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 10) / 10 : 0);
  return {
    exchanges: learner.length,
    openerWords: npc[0] ?? 0,
    characterWordsAvg: avg(npc),
    characterWordsMax: npc.length ? Math.max(...npc) : 0,
    learnerWordsAvg: avg(learner),
  };
}

/** Plain-text transcript, easy to read on a phone or paste into a chat. */
export function conversationAsText(c: RecordedConversation): string {
  const head = `${c.character_id} · ${c.place_id || '?'}, ${c.city_id} · ${new Date(c.started_at).toISOString().slice(0, 16).replace('T', ' ')} UTC · prompt ${c.prompt_version}${c.ended_at ? '' : ' · not ended'}`;
  const lines = c.turns.map((t) => `${t.who === 'npc' ? 'THEM' : 'YOU '}: ${t.text}`);
  return [head, ...lines].join('\n');
}
