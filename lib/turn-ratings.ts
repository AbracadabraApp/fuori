/**
 * A turn rated from the app's debug panel (Josh, 2026-11-15: "instrument the debug panel - useless now"; "rate
 * turns"; "report bugs"): good, bad or a bug, with an optional note, kept with what the panel showed for that turn
 * (step, turn type, the mix), so a rating can be read against the turn without asking what was playing.
 * Read at /api/admin/conversations?format=ratings.
 */
import { query } from '@/lib/db';

export const RATINGS = ['good', 'bad', 'bug'] as const;
export type Rating = (typeof RATINGS)[number];

let tableReady: Promise<void> | undefined;
/** The table adds itself on first use (as lib/level-up.ts's columns); also in scripts/db-migrate.mjs */
export function ensureRatingsTable(): Promise<void> {
  tableReady ??= query(
    `CREATE TABLE IF NOT EXISTS turn_ratings (
       id bigserial PRIMARY KEY,
       learner_id uuid NOT NULL,
       conversation_id uuid NOT NULL,
       turn int NOT NULL,
       rating text NOT NULL,
       note text,
       context jsonb,
       created_at timestamptz NOT NULL DEFAULT now()
     )`
  ).then(() => undefined, (err) => {
    tableReady = undefined;
    throw err;
  });
  return tableReady;
}

/** Saves a rating of the learner's own conversation; false when the conversation isn't theirs */
export async function saveTurnRating(p: { learnerId: string; conversationId: string; turn: number; rating: Rating; note?: string; context?: unknown }): Promise<boolean> {
  await ensureRatingsTable();
  const own = await query('SELECT 1 FROM conversations WHERE id = $1 AND learner_id = $2', [p.conversationId, p.learnerId]);
  if (!own.rows.length) return false;
  await query('INSERT INTO turn_ratings (learner_id, conversation_id, turn, rating, note, context) VALUES ($1, $2, $3, $4, $5, $6)', [
    p.learnerId,
    p.conversationId,
    p.turn,
    p.rating,
    p.note?.trim() || null,
    p.context === undefined ? null : JSON.stringify(p.context),
  ]);
  return true;
}

export interface TurnRatingRow {
  created_at: Date;
  learner_id: string;
  conversation_id: string;
  turn: number;
  rating: string;
  note: string | null;
  context: Record<string, string> | null;
  /** The character's line that was rated, when the conversation still has that turn */
  line: string | null;
}

/** The newest ratings, each with the character's line it rated */
export async function recentTurnRatings(limit = 100, since?: Date): Promise<TurnRatingRow[]> {
  await ensureRatingsTable();
  const r = await query<TurnRatingRow>(
    `SELECT r.created_at, r.learner_id, r.conversation_id, r.turn, r.rating, r.note, r.context,
            (SELECT t->>'text' FROM jsonb_array_elements(c.turns) WITH ORDINALITY AS x(t, n)
              WHERE t->>'who' = 'npc' ORDER BY n OFFSET r.turn - 1 LIMIT 1) AS line
       FROM turn_ratings r LEFT JOIN conversations c ON c.id = r.conversation_id
      WHERE ($1::timestamptz IS NULL OR r.created_at >= $1) ORDER BY r.created_at DESC LIMIT $2`,
    [since ?? null, limit]
  );
  return r.rows;
}
