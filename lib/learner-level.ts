/**
 * The level check (Josh, 2026-10-18: onboarding's level is a first guess; the
 * first conversations confirm or move it). After each of a learner's first
 * LEVEL_CHECKS conversations, one call (content/<country>/prompts/learner-level.md)
 * reads the onboarding answers and the conversations so far and sets
 * learners.level. Each check is kept in learners.level_checks with its reason.
 *
 * Off unless LEVEL_CHECK is set: "all", or learner ids separated by commas.
 * Off, it doesn't touch the database. Called from lib/remember.ts when a
 * conversation ends; a problem is logged there and nothing else is affected.
 */

import { z } from 'zod';
import { anthropic, CLAUDE_MODEL, replyText } from '@/lib/claude';
import { readPromptFile, fill } from '@/lib/prompts/template';
import { characterForPlace } from '@/lib/characters/for-place';
import { cities, language, tutor } from '@/content';
import { LEVELS, type Level } from '@/lib/onboarding';
import { query } from '@/lib/db';

/** How many conversations get a check (round 14: one already corrected every misplacement) */
export const LEVEL_CHECKS = 3;
/** Conversations shorter than this say too little (the same bar as memory, lib/remember.ts) */
const MIN_LEARNER_LINES = 2;

export interface CheckedConversation {
  /** The character's name, as the lines are labelled */
  name: string;
  turns: { who: 'npc' | 'learner'; text: string }[];
}

export interface LevelCheck {
  at: string;
  conversationId: string;
  before: Level | null;
  level: Level;
  reason: string;
  promptVersion: string;
}

export function levelCheckEnabled(learnerId: string, env: Record<string, string | undefined> = process.env): boolean {
  const v = env.LEVEL_CHECK?.trim();
  if (!v) return false;
  if (v === 'all') return true;
  return v.split(',').map((s) => s.trim()).includes(learnerId);
}

export function learnerLevelPromptVersion(): string {
  return readPromptFile('learner-level.md').version;
}

export function buildLearnerLevelPrompt(onboardingAnswers: string[], conversations: CheckedConversation[]): { system: string; user: string } {
  const f = readPromptFile('learner-level.md');
  const onboarding = onboardingAnswers.length ? onboardingAnswers.map((a, i) => `${i + 1}. ${a}`).join('\n') : '(none)';
  const convs = conversations
    .map((c, i) => `Conversation ${i + 1}:\n${c.turns.map((t) => `${t.who === 'npc' ? c.name : 'Learner'}: ${t.text}`).join('\n')}`)
    .join('\n\n');
  return {
    system: fill(f.block('System prompt'), { language: language.name }),
    user: fill(f.block('User message'), { onboarding, conversations: convs }),
  };
}

const Judged = z.object({ level: z.enum(LEVELS), reason: z.string() });
const judgedJsonSchema = {
  type: 'object', additionalProperties: false, required: ['level', 'reason'],
  properties: { level: { type: 'string', enum: [...LEVELS] }, reason: { type: 'string' } },
};

export type LevelJudge = (onboardingAnswers: string[], conversations: CheckedConversation[]) => Promise<{ level: Level; reason: string }>;

export const judgeLearnerLevel: LevelJudge = async (onboardingAnswers, conversations) => {
  const prompt = buildLearnerLevelPrompt(onboardingAnswers, conversations);
  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 3000, // thinking counts toward it
    system: prompt.system,
    messages: [{ role: 'user', content: prompt.user }],
    output_config: { format: { type: 'json_schema', schema: judgedJsonSchema } },
  });
  if (response.stop_reason === 'max_tokens') throw new Error(`Level check hit max_tokens (${response.usage.output_tokens} tokens)`);
  return Judged.parse(JSON.parse(replyText(response)));
};

/** Which conversations the check reads: the learner's conversations long enough to say something, up to and including this one, the latest LEVEL_CHECKS */
export function conversationsToCheck<T extends { id: string; turns: { who: string }[] }>(all: T[], conversationId: string): T[] {
  const eligible = all.filter((c) => c.turns.filter((t) => t.who === 'learner').length >= MIN_LEARNER_LINES);
  const upTo = eligible.findIndex((c) => c.id === conversationId);
  return upTo < 0 ? [] : eligible.slice(Math.max(0, upTo + 1 - LEVEL_CHECKS), upTo + 1);
}

function characterName(cityId: string, characterId: string): string {
  const city = cities.find((c) => c.id === cityId);
  const place = city?.places.find((p) => p.characterId === characterId);
  return (city && place && characterForPlace(city, place)?.name) || characterId;
}

// Added the first time a check runs (scripts/db-migrate.mjs has it too), so
// nothing changes in the database while the setting is off
let columnReady = false;
async function ensureColumn() {
  if (columnReady) return;
  await query('ALTER TABLE learners ADD COLUMN IF NOT EXISTS level_checks jsonb');
  columnReady = true;
}

export type LevelCheckResult = 'off' | 'done' | 'too short' | 'kept' | 'changed';

export async function checkLearnerLevel(conversationId: string, learnerId: string, judge: LevelJudge = judgeLearnerLevel): Promise<LevelCheckResult> {
  if (!levelCheckEnabled(learnerId)) return 'off';
  await ensureColumn();

  const learner = (await query<{ level: Level | null; onboarding: { answers?: { text: string }[] } | null; level_checks: LevelCheck[] | null }>(
    'SELECT level, onboarding, level_checks FROM learners WHERE id = $1', [learnerId]
  )).rows[0];
  if (!learner) throw new Error(`learner ${learnerId} not found`);
  const checks = learner.level_checks ?? [];
  if (checks.length >= LEVEL_CHECKS || checks.some((c) => c.conversationId === conversationId)) return 'done';

  const rows = (await query<{ id: string; character_id: string; city_id: string; turns: { who: 'npc' | 'learner'; text: string }[] }>(
    'SELECT id, character_id, city_id, turns FROM conversations WHERE learner_id = $1 AND character_id <> $2 ORDER BY started_at',
    [learnerId, tutor.id]
  )).rows;
  const picked = conversationsToCheck(rows, conversationId);
  if (!picked.length) return 'too short';

  const answers = (learner.onboarding?.answers ?? []).map((a) => a.text).filter(Boolean);
  const judged = await judge(answers, picked.map((c) => ({ name: characterName(c.city_id, c.character_id), turns: c.turns.map((t) => ({ who: t.who, text: t.text })) })));
  const check: LevelCheck = { at: new Date().toISOString(), conversationId, before: learner.level, level: judged.level, reason: judged.reason, promptVersion: learnerLevelPromptVersion() };
  await query('UPDATE learners SET level = $2, level_checks = $3 WHERE id = $1', [learnerId, judged.level, JSON.stringify([...checks, check])]);
  console.log(JSON.stringify({ level: 'info', event: 'level check', conversationId, learnerId, check: checks.length + 1, before: learner.level, after: judged.level, conversations: picked.length }));
  return judged.level === learner.level ? 'kept' : 'changed';
}
