/**
 * Learner identification and cookie management
 *
 * M1: anonymous learner tracked by HTTP-only cookie
 * M4: email sign-in with progress sync across devices
 */

import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';
import { query } from './db';

const LEARNER_COOKIE = 'fuori_learner_id';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

/**
 * Get the current learner's ID from cookie, or create a new learner.
 * Call this in API routes that need learner identity.
 */
export async function getOrCreateLearnerId(): Promise<string> {
  const cookieStore = await cookies();
  const existingId = cookieStore.get(LEARNER_COOKIE)?.value;

  if (existingId) {
    // Verify this learner exists in the database
    const result = await query<{ id: string }>(
      'SELECT id FROM learners WHERE id = $1',
      [existingId]
    );

    if (result.rows.length > 0) {
      return existingId;
    }
    // Cookie exists but learner deleted - create new one
  }

  // Create new learner
  const learnerId = randomUUID();

  await query(
    'INSERT INTO learners (id) VALUES ($1)',
    [learnerId]
  );

  // Set HTTP-only cookie
  cookieStore.set(LEARNER_COOKIE, learnerId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });

  return learnerId;
}

/**
 * Get learner ID without creating one.
 * Returns null if no learner cookie exists.
 */
export async function getLearnerId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(LEARNER_COOKIE)?.value || null;
}
