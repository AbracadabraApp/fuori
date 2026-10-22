/**
 * Reply buttons (docs/beginner-scaffolding.md; Josh, 2026-10-22: "a–c in a
 * conversation, repeat in next 2 conversations"). In each of a new learner's
 * first SCAFFOLD_CONVERSATIONS conversations, their first turns step through
 * the stages, one turn each, then they speak:
 *   tap     two good replies; tap one and it's sent
 *   read    two good replies; tap one, then read it aloud
 *   choose  only one reply fits; choose, then read it aloud
 * Counting decides, not a judge. Who: level Beginner, or no level yet
 * (onboarding skipped or reset; Josh, 2026-10-22). Never with Magda: lessons
 * are spoken, and they don't count.
 */
import { query } from '@/lib/db';
import type { Level } from '@/lib/onboarding';

export const STAGES = ['tap', 'read', 'choose'] as const;
export type Stage = (typeof STAGES)[number];

/** Conversations with the stages, counting from the first (or from a restart) */
export const SCAFFOLD_CONVERSATIONS = 3;

/** The stage of the learner's next turn, or null when they speak */
export function scaffoldStage(p: { level: Level | null; conversationsBefore: number; learnerTurns: number; isTutor: boolean }): Stage | null {
  if (p.isTutor || (p.level !== null && p.level !== 'beginner')) return null;
  if (p.conversationsBefore >= SCAFFOLD_CONVERSATIONS) return null;
  return STAGES[p.learnerTurns] ?? null;
}

/**
 * The learner's level and how many conversations they've had before this
 * one: those where they said something, Magda's lessons not counted, and
 * none started before learners.scaffold_from (a restart; null counts all)
 */
export async function scaffoldFacts(learnerId: string, conversationId: string | null, tutorId: string): Promise<{ level: Level | null; conversationsBefore: number }> {
  const r = await query<{ level: Level | null; before: string }>(
    `SELECT l.level,
            (SELECT count(*) FROM conversations c
              WHERE c.learner_id = l.id
                AND c.id IS DISTINCT FROM $2::uuid
                AND c.character_id <> $3
                AND (l.scaffold_from IS NULL OR c.started_at >= l.scaffold_from)
                AND c.turns @> '[{"who":"learner"}]'::jsonb) AS before
       FROM learners l WHERE l.id = $1`,
    [learnerId, conversationId, tutorId]
  );
  const row = r.rows[0];
  return { level: row?.level ?? null, conversationsBefore: Number(row?.before ?? 0) };
}
