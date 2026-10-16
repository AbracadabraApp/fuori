/**
 * POST /v1/log { id, step, message, code?, status?, appVersion?, os?, context? } → { ok: true }
 *
 * An error from the iPhone app, written to the server log. Works without a
 * token (signing in may be what failed); with one, the learner is noted.
 * Find one with: railway logs | grep E-7K2F
 */
import { apiError, apiJson } from '@/lib/api';
import { appLogLine, parseAppLog } from '@/lib/app-log';
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
  return apiJson({ ok: true });
}
