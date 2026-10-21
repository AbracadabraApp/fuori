/**
 * Whether characters address the learner as a woman or a man
 * (learners.addressed_as, read into character.md {person}). Unlike memory,
 * which is per character, every character can see it (2026-10-21: characters
 * defaulted to the masculine with women).
 */
import { query } from './db';
import type { Gender } from './types';

/** Undefined while they haven't said. Off until the addressed_as column is
 *  migrated in production: LEARNER_ADDRESS=on turns it on. */
export async function loadAddressedAs(learnerId: string): Promise<Gender | undefined> {
  if (process.env.LEARNER_ADDRESS !== 'on') return undefined;
  const r = await query<{ addressed_as: Gender | null }>('SELECT addressed_as FROM learners WHERE id = $1', [learnerId]);
  return r.rows[0]?.addressed_as ?? undefined;
}
