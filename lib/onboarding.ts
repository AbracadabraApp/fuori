/**
 * The greeter's onboarding on the server (docs/onboarding-design.md →
 * Engineering needs): her two Claude-written lines, the placement, and the
 * learner's stored level. Her fixed lines are content (content/<country>/
 * onboarding.ts). Used by the /v1/onboarding/* routes and tests.
 */
import { z } from 'zod';
import { anthropic, CLAUDE_MODEL, replyText, WAITING } from '@/lib/claude';
import { onboarding, language } from '@/content';
import { readPromptFile, fill } from '@/lib/prompts/template';
import { buildOnboardingPrompt, type HeardAnswer } from '@/lib/prompts/build-onboarding-prompt';
import { followUpJsonSchema, sendOffJsonSchema } from '@/lib/prompts/onboarding-output-schema';
import { query } from './db';

export type { HeardAnswer };
export const LEVELS = ['beginner', 'intermediate', 'advanced'] as const;
export type Level = (typeof LEVELS)[number];

const Line = z.object({ line: z.string().min(1), en: z.string().min(1) });
const SendOff = Line.extend({ level: z.enum(LEVELS), reason: z.string() });

async function ask<T>(step: 'follow-up' | 'send-off', answers: HeardAnswer[], schema: { [key: string]: unknown }, parse: (v: unknown) => T): Promise<T & { promptVersion: string }> {
  const prompt = buildOnboardingPrompt(step, answers);
  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    // The model thinks before answering and the thinking counts toward this limit: at 600 the send-off
    // ran out on mixed answers (one in English, one fluent) 3 times in 3 (round 14, 2026-10-18)
    max_tokens: 2000,
    temperature: 1.0,
    system: prompt.system,
    messages: [{ role: 'user', content: prompt.user }],
    output_config: { format: { type: 'json_schema', schema } },
  }, WAITING);
  if (response.stop_reason === 'max_tokens') throw new Error(`Onboarding ${step} hit max_tokens`);
  return { ...parse(JSON.parse(replyText(response))), promptVersion: prompt.version };
}

/** Her reaction to the first answer and one slightly harder question (shown without English) */
export function writeFollowUp(answer: HeardAnswer) {
  return ask('follow-up', [answer], followUpJsonSchema, (v) => Line.parse(v));
}

/** Her send-off to both answers, ending with the fixed help line, and the learner's level */
export async function writeSendOff(answers: HeardAnswer[]) {
  const r = await ask('send-off', answers, sendOffJsonSchema, (v) => SendOff.parse(v));
  const help = onboarding.lines.help;
  return { ...r, line: `${r.line.trim()} ${help.line}`, en: `${r.en.trim()} ${help.en}` };
}

/**
 * What /v1/me reports: the stored level, and whether onboarding is done.
 * Done means they finished it, or they were already playing before it
 * existed: a learner with conversations and no onboarding record (Josh,
 * 2026-10-17: he had talked to people in both countries and was sent to the
 * greeter). Restart onboarding leaves a record ({ path: "reset" }), so it
 * still brings her back for them.
 */
export async function onboardingState(learnerId: string): Promise<{ level: Level | null; onboarded: boolean }> {
  const r = await query<{ level: Level | null; onboarded_at: Date | null; has_record: boolean; has_played: boolean }>(
    `SELECT level, onboarded_at, onboarding IS NOT NULL AS has_record,
       EXISTS (SELECT 1 FROM conversations c WHERE c.learner_id = learners.id
               AND EXISTS (SELECT 1 FROM jsonb_array_elements(c.turns) t WHERE t->>'who' = 'learner')) AS has_played
     FROM learners WHERE id = $1`,
    [learnerId]
  );
  const row = r.rows[0];
  return { level: row?.level ?? null, onboarded: !!row?.onboarded_at || (!row?.has_record && !!row?.has_played) };
}

/** Onboarding finished: the level, and for the speaker path what was said and why it was placed there */
export async function finishOnboarding(learnerId: string, level: Level, record: Record<string, unknown>): Promise<void> {
  // Merged into what's there, so the name from the address step stays (a reset record's path is replaced)
  await query(`UPDATE learners SET level = $2, onboarded_at = now(), onboarding = COALESCE(onboarding, '{}'::jsonb) || $3::jsonb WHERE id = $1`, [learnerId, level, JSON.stringify(record)]);
}

/** Settings: the learner changes their level; onboarding is left as it is */
export async function setLevel(learnerId: string, level: Level): Promise<void> {
  await query('UPDATE learners SET level = $2 WHERE id = $1', [learnerId, level]);
}

/** Settings → Restart onboarding: she greets them again. Conversations, visits and memories stay. */
export async function resetOnboarding(learnerId: string): Promise<void> {
  // A record, not NULL: someone who has played counts as onboarded only while they have no record
  await query(`UPDATE learners SET level = NULL, onboarded_at = NULL, onboarding = '{"path":"reset"}'::jsonb WHERE id = $1`, [learnerId]);
}

/**
 * The name the learner gave, from what speech to text heard when she asked
 * ("My name is Josh" → "Josh"); null when there's none. A judge call, not a
 * phrase list, so it works in any language (content/<country>/prompts/name.md).
 */
export async function nameFromHeard(heard: string): Promise<{ name: string | null; promptVersion: string }> {
  const file = readPromptFile('name.md');
  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1000,
    system: fill(file.block('System prompt'), { language: language.name }),
    messages: [{ role: 'user', content: heard }],
    output_config: { format: { type: 'json_schema', schema: { type: 'object', additionalProperties: false, properties: { name: { type: 'string' } }, required: ['name'] } } },
  }, WAITING);
  if (response.stop_reason === 'max_tokens') throw new Error(`Name hit max_tokens (${response.usage.output_tokens} tokens)`);
  const name = z.object({ name: z.string() }).parse(JSON.parse(replyText(response))).name.trim();
  return { name: name || null, promptVersion: file.version };
}
