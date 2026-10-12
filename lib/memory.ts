/**
 * Character memory and conversation storage
 *
 * M1 memory system: characters remember learners across visits
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
 * Start a new conversation and return its ID.
 * The conversation row is created immediately so turns can be saved incrementally.
 */
export async function startConversation(
  learnerId: string,
  characterId: string,
  placeId: string,
  cityId: string,
  promptVersion: string
): Promise<string> {
  const conversationId = randomUUID();

  await query(
    `INSERT INTO conversations
     (id, learner_id, character_id, place_id, city_id, prompt_version, started_at, turns)
     VALUES ($1, $2, $3, $4, $5, $6, now(), '[]'::jsonb)`,
    [conversationId, learnerId, characterId, placeId, cityId, promptVersion]
  );

  return conversationId;
}

/**
 * Add a turn to an ongoing conversation.
 * Appends to the turns array in the database.
 */
export async function addConversationTurn(
  conversationId: string,
  turn: ConversationTurn
): Promise<void> {
  await query(
    `UPDATE conversations
     SET turns = turns || $1::jsonb
     WHERE id = $2`,
    [JSON.stringify(turn), conversationId]
  );
}

/**
 * Mark conversation as ended and save character notes + review log.
 * This is called when the learner leaves the conversation screen.
 */
export async function endConversation(
  conversationId: string,
  characterId: string,
  learnerId: string,
  updatedNotes: string[],
  reviewLog: ReviewLog
): Promise<void> {
  // Update conversation with end time and review log
  await query(
    `UPDATE conversations
     SET ended_at = now(), review = $1
     WHERE id = $2`,
    [JSON.stringify(reviewLog), conversationId]
  );

  // Update character memory: increment visits, update notes
  await query(
    `INSERT INTO character_memories (learner_id, character_id, visits, last_visit, notes)
     VALUES ($1, $2, 1, now(), $3)
     ON CONFLICT (learner_id, character_id)
     DO UPDATE SET
       visits = character_memories.visits + 1,
       last_visit = now(),
       notes = $3`,
    [learnerId, characterId, updatedNotes]
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
