/**
 * Every "say it in English" decision, kept so routing can be measured on real
 * play (Josh, 2026-10-23: his Italian was labelled English in 4 of 5 turns,
 * and nothing but screenshots showed it). A row per turn Whisper labelled
 * English: what it heard, whether it went to the character as said or came
 * back as a line to read, the line, and how long it took. Read them at
 * /api/admin/conversations?format=sayit. Shared by every country's server
 * (one database). Created the first time it's written.
 */
import { query } from '@/lib/db';
import { country } from '@/content';

let tableReady = false;
async function ensureTable() {
  if (tableReady) return;
  await query(`CREATE TABLE IF NOT EXISTS say_it_log (
    id              bigserial PRIMARY KEY,
    at              timestamptz NOT NULL DEFAULT now(),
    country         text NOT NULL,
    learner_id      uuid NOT NULL,
    conversation_id uuid,
    heard           text NOT NULL,
    send_as_said    boolean NOT NULL,
    line            text,
    ms              int,
    prompt_version  text
  )`);
  await query('CREATE INDEX IF NOT EXISTS idx_say_it_log_at ON say_it_log(at DESC)');
  tableReady = true;
}

export async function saveSayIt(row: { learnerId: string; conversationId: string | null; heard: string; sendAsSaid: boolean; line: string; ms: number; promptVersion: string }): Promise<void> {
  await ensureTable();
  await query(
    `INSERT INTO say_it_log (country, learner_id, conversation_id, heard, send_as_said, line, ms, prompt_version) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [country, row.learnerId, row.conversationId, row.heard, row.sendAsSaid, row.sendAsSaid ? null : row.line, row.ms, row.promptVersion]
  );
}

export interface SayItRow { at: Date; country: string; learner_id: string; conversation_id: string | null; heard: string; send_as_said: boolean; line: string | null; ms: number | null; prompt_version: string | null }

export async function recentSayIts(limit = 100, since?: Date): Promise<SayItRow[]> {
  await ensureTable();
  return (await query<SayItRow>(
    `SELECT at, country, learner_id, conversation_id, heard, send_as_said, line, ms, prompt_version FROM say_it_log
      WHERE ($1::timestamptz IS NULL OR at >= $1) ORDER BY at DESC LIMIT $2`,
    [since ?? null, limit]
  )).rows;
}

/** One line per decision: when, who, what was heard, and where it went */
export function sayItsAsText(rows: SayItRow[]): string {
  return rows
    .map((r) => `${r.at.toISOString().slice(0, 19).replace('T', ' ')} UTC · ${r.country} · learner ${r.learner_id.slice(0, 8)} · ${r.ms ?? '?'} ms\n  heard: ${r.heard}\n  ${r.send_as_said ? '→ to the character as said' : `→ say this: ${r.line}`}`)
    .join('\n\n');
}
