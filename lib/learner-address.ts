/**
 * Whether characters address the learner as a woman or a man
 * (learners.addressed_as, read into character.md {person}). Unlike memory,
 * which is per character, every character can see it (2026-10-21: characters
 * defaulted to the masculine with women). Set by the learner's own choice, in
 * onboarding (docs/onboarding-design.md → Name and address) or Settings.
 */
import { query } from './db';
import type { Gender } from './types';

/** Off until the addressed_as column is migrated in production: LEARNER_ADDRESS=on turns it on */
export const learnerAddressOn = () => process.env.LEARNER_ADDRESS === 'on';

/** Undefined while they haven't said (or while it's off) */
export async function loadAddressedAs(learnerId: string): Promise<Gender | undefined> {
  if (!learnerAddressOn()) return undefined;
  const r = await query<{ addressed_as: Gender | null }>('SELECT addressed_as FROM learners WHERE id = $1', [learnerId]);
  return r.rows[0]?.addressed_as ?? undefined;
}

/** Their choice, in onboarding or Settings. With a name (onboarding), it's kept in their onboarding record for the greeter only. */
export async function chooseAddressedAs(learnerId: string, addressedAs: Gender, name?: string): Promise<void> {
  await query(
    `UPDATE learners SET addressed_as = $2, addressed_from = 'chose'
       ${name ? `, onboarding = COALESCE(onboarding, '{}'::jsonb) || jsonb_build_object('name', $3::text)` : ''}
     WHERE id = $1`,
    name ? [learnerId, addressedAs, name] : [learnerId, addressedAs]
  );
}
