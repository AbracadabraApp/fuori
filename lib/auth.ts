/**
 * The app's identity: a device registers once (POST /v1/auth/device) and gets
 * an opaque bearer token, kept in the iPhone's Keychain and sent as
 * `Authorization: Bearer …`. The database stores only its SHA-256 hash.
 * Framework-neutral (no next/headers): takes a standard Request.
 *
 * The web app keeps its cookie (lib/learner.ts). Both resolve to a row in
 * learners, so a web learner can later move to the app with the same id
 * (docs/12-native-app.md, decision 6). Sign in with Apple links here at M4.
 */

import { createHash, randomBytes, randomUUID } from 'crypto';
import { query } from './db';

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/** A new learner and their first device token. The token is returned once and never stored. */
export async function registerDevice(): Promise<{ learnerId: string; token: string }> {
  const learnerId = randomUUID();
  const token = randomBytes(32).toString('base64url');
  await query('INSERT INTO learners (id) VALUES ($1)', [learnerId]);
  await query('INSERT INTO learner_tokens (token_hash, learner_id) VALUES ($1, $2)', [hashToken(token), learnerId]);
  return { learnerId, token };
}

/** The token from an `Authorization: Bearer …` header, or null. */
export function bearerToken(request: Request): string | null {
  const header = request.headers.get('authorization') ?? '';
  const match = /^Bearer\s+([A-Za-z0-9_-]{20,200})$/.exec(header.trim());
  return match ? match[1] : null;
}

/** The learner a request's bearer token belongs to, or null (no token, unknown or revoked). */
export async function learnerFromRequest(request: Request): Promise<string | null> {
  const token = bearerToken(request);
  if (!token) return null;
  const result = await query<{ learner_id: string }>(
    'UPDATE learner_tokens SET last_used_at = now() WHERE token_hash = $1 RETURNING learner_id',
    [hashToken(token)]
  );
  return result.rows[0]?.learner_id ?? null;
}
