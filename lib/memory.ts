/**
 * Character memory and conversation storage
 *
 * M1 memory system: characters remember learners across visits.
 * Writing the notes and review log at the end of a conversation: lib/remember.ts
 */

import { randomUUID } from 'crypto';
import { query } from './db';

/**
 * What a character remembers about a learner
 */
export interface CharacterMemory {
  visits: number;
  lastVisit: Date | null;
  notes: string[];
}

/**
 * A single turn in a conversation
 */
export interface ConversationTurn {
  who: 'npc' | 'learner';
  text: string;
  en?: string;
  at: string; // ISO timestamp
}

/**
 * Review log entry generated when conversation ends
 */
export interface ReviewLog {
  items: Array<{
    it: string;
    en: string;
    why: string;
  }>;
  mistakes: Array<{
    said: string;
    better: string;
    why: string;
  }>;
  /** Version of content/it/prompts/memory.md that wrote it */
  promptVersion?: string;
}

/**
 * Load what this character remembers about this learner.
 * Returns empty memory if they've never met.
 */
export async function loadCharacterMemory(
  learnerId: string,
  characterId: string
): Promise<CharacterMemory> {
  const result = await query<{
    visits: number;
    last_visit: Date | null;
    notes: string[];
  }>(
    'SELECT visits, last_visit, notes FROM character_memories WHERE learner_id = $1 AND character_id = $2',
    [learnerId, characterId]
  );

  if (result.rows.length === 0) {
    return { visits: 0, lastVisit: null, notes: [] };
  }

  const row = result.rows[0];
  return {
    visits: row.visits,
    lastVisit: row.last_visit,
    notes: row.notes,
  };
}

/**
 * What the character remembered when this conversation started, so every turn
 * of one conversation gets the same {relationship} line. (Memory can be
 * written mid-conversation when the phone goes to the background; without
 * this the character would then "remember" meeting them earlier today.)
 * Null if the conversation isn't this learner's or predates the snapshot.
 */
export async function loadMemoryAtStart(conversationId: string, learnerId: string): Promise<CharacterMemory | null> {
  const result = await query<{ memory_at_start: { visits: number; lastVisit: string | null; notes: string[] } | null }>(
    'SELECT memory_at_start FROM conversations WHERE id = $1 AND learner_id = $2',
    [conversationId, learnerId]
  );
  const m = result.rows[0]?.memory_at_start;
  return m ? { visits: m.visits, lastVisit: m.lastVisit ? new Date(m.lastVisit) : null, notes: m.notes } : null;
}

/**
 * Start a new conversation and return its ID.
 * The conversation row is created immediately so turns can be saved incrementally.
 */
export async function startConversation(
  learnerId: string,
  characterId: string,
  placeId: string,
  cityId: string,
  promptVersion: string,
  /** What the character remembered when it started; used for the rest of the conversation */
  memoryAtStart?: CharacterMemory
): Promise<string> {
  const conversationId = randomUUID();

  await query(
    `INSERT INTO conversations
     (id, learner_id, character_id, place_id, city_id, prompt_version, started_at, turns, memory_at_start)
     VALUES ($1, $2, $3, $4, $5, $6, now(), '[]'::jsonb, $7)`,
    [conversationId, learnerId, characterId, placeId, cityId, promptVersion, memoryAtStart ? JSON.stringify(memoryAtStart) : null]
  );

  return conversationId;
}

/**
 * Add a turn to an ongoing conversation.
 * Appends to the turns array in the database.
 */
export async function addConversationTurn(
  conversationId: string,
  learnerId: string,
  turn: ConversationTurn
): Promise<boolean> {
  // Only the learner who owns the conversation can add to it (the id comes from
  // the browser). A new turn also reopens a conversation marked ended, e.g. after
  // the phone briefly left the page. Returns false if nothing was updated.
  const result = await query(
    `UPDATE conversations
     SET turns = turns || $1::jsonb, ended_at = NULL
     WHERE id = $2 AND learner_id = $3`,
    [JSON.stringify([turn]), conversationId, learnerId]
  );
  return (result.rowCount ?? 0) > 0;
}

/**
 * Claim a conversation for writing memory, so it's done once per new stretch
 * of talk even when several "left the screen" signals arrive at once.
 * Succeeds only if the conversation has turns not yet written into memory and
 * at least `minLearnerLines` lines from the learner. Returns null otherwise.
 * `firstTime` is true the first time this conversation is written (that's
 * when the visit counts); a conversation reopened and ended again is
 * re-written from its full transcript without counting another visit.
 */
export async function claimForMemory(
  conversationId: string,
  learnerId: string,
  minLearnerLines: number
): Promise<{ firstTime: boolean; before: number; claimed: number; characterId: string; cityId: string; turns: ConversationTurn[] } | null> {
  const result = await query<{ before: number; claimed: number; character_id: string; city_id: string; turns: ConversationTurn[] }>(
    `UPDATE conversations c
     SET memory_turns = jsonb_array_length(c.turns)
     FROM (SELECT id, memory_turns AS before FROM conversations WHERE id = $1) old
     WHERE c.id = old.id AND c.learner_id = $2
       AND jsonb_array_length(c.turns) > c.memory_turns
       AND (SELECT count(*) FROM jsonb_array_elements(c.turns) t WHERE t->>'who' = 'learner') >= $3
     RETURNING old.before, c.memory_turns AS claimed, c.character_id, c.city_id, c.turns`,
    [conversationId, learnerId, minLearnerLines]
  );
  const row = result.rows[0];
  if (!row) return null;
  return { firstTime: row.before === 0, before: row.before, claimed: row.claimed, characterId: row.character_id, cityId: row.city_id ?? '', turns: row.turns };
}

/** Undo a claim when writing memory failed, so the next end signal tries again. */
export async function releaseMemoryClaim(conversationId: string, before: number, claimed: number): Promise<void> {
  await query('UPDATE conversations SET memory_turns = $2 WHERE id = $1 AND memory_turns = $3', [conversationId, before, claimed]);
}

/**
 * Save what the end-of-conversation call wrote: the review log on the
 * conversation, and the character's notes (replacing the old ones, which the
 * call already merged in). The visit counts only when `firstTime`.
 */
export async function saveConversationMemory(p: {
  conversationId: string;
  learnerId: string;
  characterId: string;
  notes: string[];
  review: ReviewLog;
  firstTime: boolean;
}): Promise<void> {
  await query(
    `WITH r AS (UPDATE conversations SET review = $1 WHERE id = $2)
     INSERT INTO character_memories (learner_id, character_id, visits, last_visit, notes)
     VALUES ($3, $4, $5, now(), $6)
     ON CONFLICT (learner_id, character_id)
     DO UPDATE SET
       visits = character_memories.visits + $5,
       last_visit = now(),
       notes = $6`,
    [JSON.stringify(p.review), p.conversationId, p.learnerId, p.characterId, p.firstTime ? 1 : 0, p.notes]
  );
}

/**
 * Get the full transcript of a conversation for review/debugging
 */
export async function getConversation(conversationId: string) {
  const result = await query<{
    id: string;
    learner_id: string;
    character_id: string;
    place_id: string;
    city_id: string;
    prompt_version: string;
    started_at: Date;
    ended_at: Date | null;
    turns: ConversationTurn[];
    review: ReviewLog | null;
  }>(
    `SELECT id, learner_id, character_id, place_id, city_id, prompt_version,
            started_at, ended_at, turns, review
     FROM conversations
     WHERE id = $1`,
    [conversationId]
  );

  return result.rows[0] || null;
}
