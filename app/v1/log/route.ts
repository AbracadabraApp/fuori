/**
 * POST /v1/log { id, step, message, code?, status?, appVersion?, os?, context? } → { ok: true }
 *
 * An error from the iPhone app, written to the server log. Works without a
 * token (signing in may be what failed); with one, the learner is noted.
 * Kept in the database too (lib/app-errors.ts), since Railway's log goes
 * with each deploy: /api/admin/conversations?format=errors. Find one in the
 * live log with: railway logs | grep E-7K2F
 */
import { apiError, apiJson } from '@/lib/api';
import { appLogLine, parseAppLog } from '@/lib/app-log';
import { saveAppError } from '@/lib/app-errors';
import { learnerFromRequest } from '@/lib/auth';
import { allow, clientIp } from '@/lib/rate-limit';

const PER_10_MIN = 60;

export async function POST(request: Request) {
  if (!allow(`log:${clientIp(request)}`, PER_10_MIN, 10 * 60 * 1000)) {
    return apiError('rate_limited', 'Too many reports; try again shortly', 60_000);
  }
  const parsed = parseAppLog(await request.text());
  if (!parsed.ok) return apiError('bad_request', parsed.error);
  const learnerId = await learnerFromRequest(request).catch(() => null);
  console.error(appLogLine(parsed.report, learnerId));
  // Kept in the database too: Railway's log goes with each deploy (lib/app-errors.ts)
  try {
    await saveAppError(parsed.report, learnerId);
  } catch (err) {
    console.error(JSON.stringify({ level: 'error', where: 'app error save', id: parsed.report.id, message: err instanceof Error ? err.message : String(err) }));
  }
  return apiJson({ ok: true });
}
