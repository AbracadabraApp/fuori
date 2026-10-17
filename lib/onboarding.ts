/**
 * The greeter's onboarding on the server (docs/onboarding-design.md →
 * Engineering needs): her two Claude-written lines, the placement, and the
 * learner's stored level. Her fixed lines are content (content/<country>/
 * onboarding.ts). Used by the /v1/onboarding/* routes and tests.
 */
import { z } from 'zod';
import { anthropic, CLAUDE_MODEL, replyText } from '@/lib/claude';
import { onboarding } from '@/content';
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
    max_tokens: 600,
    temperature: 1.0,
    system: prompt.system,
    messages: [{ role: 'user', content: prompt.user }],
    output_config: { format: { type: 'json_schema', schema } },
  });
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

/** What /v1/me reports: the stored level, and whether onboarding is done */
export async function onboardingState(learnerId: string): Promise<{ level: Level | null; onboarded: boolean }> {
  const r = await query<{ level: Level | null; onboarded_at: Date | null }>('SELECT level, onboarded_at FROM learners WHERE id = $1', [learnerId]);
  const row = r.rows[0];
  return { level: row?.level ?? null, onboarded: !!row?.onboarded_at };
}

/** Onboarding finished: the level, and for the speaker path what was said and why it was placed there */
export async function finishOnboarding(learnerId: string, level: Level, record: Record<string, unknown>): Promise<void> {
  await query('UPDATE learners SET level = $2, onboarded_at = now(), onboarding = $3 WHERE id = $1', [learnerId, level, JSON.stringify(record)]);
}

/** Settings → Restart onboarding: she greets them again. Conversations, visits and memories stay. */
export async function resetOnboarding(learnerId: string): Promise<void> {
  await query('UPDATE learners SET level = NULL, onboarded_at = NULL, onboarding = NULL WHERE id = $1', [learnerId]);
}
