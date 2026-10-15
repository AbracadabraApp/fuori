/**
 * Helpers for the app's API (/v1/*, docs/12-native-app.md). Every error has
 * one shape, so the app can decide what to do from `code` alone:
 *   { error: { code, message, retryable, retryAfterMs? } }
 * Codes are stable once an app build ships: add new ones, never rename.
 * Framework-neutral: standard Request and Response.
 */

import { learnerFromRequest } from './auth';
import { logServerError } from './server-log';

export type ApiErrorCode =
  | 'bad_request'
  | 'unauthorized'
  | 'not_found'
  | 'rate_limited'
  | 'quota'
  | 'bad_audio'
  | 'upstream_unavailable'
  | 'server_error';

const STATUS: Record<ApiErrorCode, number> = {
  bad_request: 400,
  unauthorized: 401,
  not_found: 404,
  rate_limited: 429,
  quota: 402,
  bad_audio: 422,
  upstream_unavailable: 503,
  server_error: 500,
};

const RETRYABLE: ApiErrorCode[] = ['rate_limited', 'upstream_unavailable', 'server_error'];

export function apiError(code: ApiErrorCode, message: string, retryAfterMs?: number): Response {
  return Response.json(
    { error: { code, message, retryable: RETRYABLE.includes(code), ...(retryAfterMs ? { retryAfterMs } : {}) } },
    { status: STATUS[code], headers: { 'cache-control': 'no-store' } }
  );
}

export function apiJson(body: unknown, init?: ResponseInit): Response {
  return Response.json(body, { ...init, headers: { 'cache-control': 'no-store', ...(init?.headers ?? {}) } });
}

/**
 * Run a handler for a signed-in learner (bearer token). A missing or unknown
 * token is 401; anything the handler throws is logged with the request id and
 * returned as server_error, never swallowed.
 */
export async function withLearner(
  request: Request,
  where: string,
  handler: (learnerId: string) => Promise<Response>
): Promise<Response> {
  try {
    const learnerId = await learnerFromRequest(request);
    if (!learnerId) return apiError('unauthorized', 'Sign in with POST /v1/auth/device and send Authorization: Bearer <token>');
    return await handler(learnerId);
  } catch (err) {
    logServerError(request, where, err);
    return apiError('server_error', err instanceof Error ? err.message : String(err));
  }
}
