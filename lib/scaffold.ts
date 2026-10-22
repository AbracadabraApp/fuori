/**
 * Reply buttons for beginners (docs/beginner-scaffolding.md → Revised: three
 * levels; Josh, 2026-10-21: always on at Beginner, no switch). A learner whose
 * stored level is beginner taps one of two replies for the first N turns of
 * each conversation, then speaks. N shrinks with the count of conversations
 * they've already had, so the taps run out: 4 for the first 3 conversations,
 * then 3, 2, 1 for 3 each (Claude's proposal; the numbers are Josh's to set).
 * Counting decides, not a judge. Never with Magda: lessons are spoken.
 */
import { query } from '@/lib/db';
import type { Level } from '@/lib/onboarding';

/** Tapped turns per conversation, by how many conversations came before */
export const TAP_SCHEDULE = [4, 4, 4, 3, 3, 3, 2, 2, 2, 1, 1, 1];

export function tapTurns(conversationsBefore: number): number {
  return TAP_SCHEDULE[conversationsBefore] ?? 0;
}

/** Whether the learner's next turn is a tap on the reply buttons */
export function offerReplies(p: { level: Level | null; conversationsBefore: number; learnerTurns: number; isTutor: boolean }): boolean {
  if (p.isTutor || p.level !== 'beginner') return false;
  return p.learnerTurns < tapTurns(p.conversationsBefore);
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
