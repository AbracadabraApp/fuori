/**
 * What /v1/log accepts: an error the iPhone app hit, so it shows up in the
 * server log (Railway) instead of only on the phone. The app shows the same
 * code (E-7K2F) on screen and sends it as x-fuori-id with the request that
 * failed, so `railway logs | grep E-7K2F` finds both sides, as on the web
 * (lib/errors.ts, /api/log).
 */

import { z } from 'zod';

export const MAX_LOG_BYTES = 10_000;

const AppLogSchema = z.object({
  id: z.string().regex(/^E-[A-Z0-9]{4}$/),
  /** Where it happened: start, turn, transcribe, speak, record, save, load */
  step: z.string().min(1).max(60),
  /** The /v1 error code, when the server answered with one */
  code: z.string().max(40).optional(),
  status: z.number().int().optional(),
  message: z.string().max(2000),
  appVersion: z.string().max(40).optional(),
  os: z.string().max(60).optional(),
  context: z.record(z.string().max(60), z.union([z.string().max(300), z.number(), z.boolean()])).optional(),
});

export type AppLog = z.infer<typeof AppLogSchema>;

export function parseAppLog(text: string): { ok: true; report: AppLog } | { ok: false; error: string } {
  if (text.length > MAX_LOG_BYTES) return { ok: false, error: 'Report too large' };
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return { ok: false, error: 'Not JSON' };
  }
  const parsed = AppLogSchema.safeParse(body);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Bad report' };
  return { ok: true, report: parsed.data };
}

/** The one log line for a report */
export function appLogLine(report: AppLog, learnerId: string | null, at = new Date()): string {
  return JSON.stringify({ level: 'error', source: 'app', learnerId: learnerId ?? undefined, ...report, at: at.toISOString() });
}
