/**
 * Errors from the iPhone app, kept in the database (Josh, 2026-10-22). /v1/log
 * wrote them only to the server log, and Railway's log goes with each deploy,
 * so a session's reports could be gone before anyone read them (Josh's Mexico
 * play that evening). Read them with
 * /api/admin/conversations?format=errors&since=… (newest first).
 *
 * The table is shared by every country's server (one database), so each row
 * says which. Created the first time a report arrives (scripts/db-migrate.mjs
 * has it too).
 */
import { query } from '@/lib/db';
import { country } from '@/content';
import type { AppLog } from '@/lib/app-log';

let tableReady = false;
async function ensureTable() {
  if (tableReady) return;
  await query(`CREATE TABLE IF NOT EXISTS app_errors (
    id          bigserial PRIMARY KEY,
    at          timestamptz NOT NULL DEFAULT now(),
    country     text NOT NULL,
    learner_id  uuid,
    code        text NOT NULL,
    step        text NOT NULL,
    api_code    text,
    status      int,
    message     text NOT NULL,
    app_version text,
    os          text,
    context     jsonb
  )`);
  await query('CREATE INDEX IF NOT EXISTS idx_app_errors_at ON app_errors(at DESC)');
  tableReady = true;
}

/** Keep one report. Throws on failure; /v1/log logs that and still answers ok */
export async function saveAppError(report: AppLog, learnerId: string | null): Promise<void> {
  await ensureTable();
  await query(
    `INSERT INTO app_errors (country, learner_id, code, step, api_code, status, message, app_version, os, context)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [country, learnerId, report.id, report.step, report.code ?? null, report.status ?? null, report.message, report.appVersion ?? null, report.os ?? null, report.context ? JSON.stringify(report.context) : null]
  );
}

export interface AppErrorRow {
  at: Date;
  country: string;
  learner_id: string | null;
  code: string;
  step: string;
  api_code: string | null;
  status: number | null;
  message: string;
  app_version: string | null;
  os: string | null;
  context: Record<string, unknown> | null;
}

/** Newest first, every country */
export async function recentAppErrors(limit = 50, since?: Date): Promise<AppErrorRow[]> {
  await ensureTable();
  const r = await query<AppErrorRow>(
    `SELECT at, country, learner_id, code, step, api_code, status, message, app_version, os, context
       FROM app_errors WHERE ($1::timestamptz IS NULL OR at >= $1) ORDER BY at DESC LIMIT $2`,
    [since ?? null, limit]
  );
  return r.rows;
}

/** One line per report, easy to read on a phone */
export function appErrorsAsText(rows: AppErrorRow[]): string {
  return rows
    .map((e) => {
      const head = `${e.at.toISOString().slice(0, 19).replace('T', ' ')} UTC · ${e.country} · ${e.code} · ${e.step}${e.api_code ? ` · ${e.api_code}` : ''}${e.status ? ` ${e.status}` : ''}`;
      const who = [e.learner_id && `learner ${e.learner_id.slice(0, 8)}`, e.app_version && `app ${e.app_version}`, e.os].filter(Boolean).join(' · ');
      const ctx = e.context ? ` · ${JSON.stringify(e.context)}` : '';
      return `${head}\n  ${e.message}\n  ${who}${ctx}`;
    })
    .join('\n\n');
}
