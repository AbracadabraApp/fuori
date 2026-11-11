/**
 * Level up (docs/glossary.md; docs/dialogue-structure-reference.md § 12.2; the screen in sketches/level-up/):
 * after N conversations at the learner's step the game offers the next step, the learner chooses, no score
 * decides (Josh, 2026-11-11: "a simple offer after N conversations; doesn't have to be success based and is
 * user chosen"). The step is stored on the learner's record and is Beginner 2's cluster of the reply ladder
 * (lib/beginner-2.ts → CLUSTERS) when the app sends no cluster header. The offer shows the character's last
 * line as said and the same line at the next step (one small call, content/<country>/prompts/level-up.md).
 */
import { z } from 'zod';
import { query } from '@/lib/db';
import { anthropic, CLAUDE_MODEL, replyText } from '@/lib/claude';
import { fill, readPromptFile } from '@/lib/prompts/template';
import { turnOutputJsonSchema } from '@/lib/prompts/turn-output-schema';
import { language } from '@/content';
import { CLUSTERS, LEVEL_OF_CLUSTER, type Setup } from '@/lib/beginner-2';
import { SCAFFOLDING_FILE } from '@/lib/beginner';
import { characterForVisit } from '@/lib/characters/for-visit';
import { savesDone } from '@/lib/recording';

export const LEVEL_UP_FILE = 'level-up.md';
/** Conversations at the step (3 or more learner replies) before the offer, and again after a "not yet" */
export const LEVEL_UP_AFTER = 3;
/** Replies the learner must have made for a conversation to count (an opener-only visit doesn't) */
export const COUNTED_REPLIES = 3;
export const MAX_STEP = CLUSTERS.length;

let columnsReady: Promise<void> | undefined;
/** The step columns add themselves on first use (as lib/quality.ts does); also in scripts/db-migrate.mjs */
export function ensureStepColumns(): Promise<void> {
  columnsReady ??= (async () => {
    await query('ALTER TABLE learners ADD COLUMN IF NOT EXISTS step int NOT NULL DEFAULT 1');
    await query('ALTER TABLE learners ADD COLUMN IF NOT EXISTS step_since timestamptz');
    await query('ALTER TABLE learners ADD COLUMN IF NOT EXISTS level_up_asked_at timestamptz');
  })().catch((err) => {
    columnsReady = undefined;
    throw err;
  });
  return columnsReady;
}

export interface LearnerStep {
  step: number;
  /** When the step was set; null for a learner who has never levelled up */
  since: Date | null;
  /** When the offer was last declined ("Not yet"); null when never, or since the last level up */
  askedAt: Date | null;
}

export async function learnerStep(learnerId: string): Promise<LearnerStep> {
  await ensureStepColumns();
  const r = await query<{ step: number; step_since: Date | null; level_up_asked_at: Date | null }>('SELECT step, step_since, level_up_asked_at FROM learners WHERE id = $1', [learnerId]);
  const row = r.rows[0];
  return { step: Math.min(MAX_STEP, Math.max(1, row?.step ?? 1)), since: row?.step_since ?? null, askedAt: row?.level_up_asked_at ?? null };
}

/** The learner's cluster of the reply ladder from their stored step (Beginner 2 with no cluster header) */
export async function storedCluster(learnerId: string): Promise<Setup[]> {
  return CLUSTERS[(await learnerStep(learnerId)).step - 1];
}

/** Conversations since `since` (all, when null) with at least COUNTED_REPLIES learner replies */
export async function countedConversations(learnerId: string, since: Date | null): Promise<number> {
  const r = await query<{ n: string }>(
    `SELECT count(*) AS n FROM conversations c
     WHERE c.learner_id = $1 AND ($2::timestamptz IS NULL OR c.started_at > $2)
       AND (SELECT count(*) FROM jsonb_array_elements(c.turns) t WHERE t->>'who' = 'learner') >= $3`,
    [learnerId, since, COUNTED_REPLIES]
  );
  return Number(r.rows[0]?.n ?? 0);
}

/** The pure rule: due when enough conversations have been played since the step was set or the offer last declined */
export function isDue(p: { step: number; counted: number }): boolean {
  return p.step < MAX_STEP && p.counted >= LEVEL_UP_AFTER;
}

/** The later of the two dates, or null when neither */
export const countFrom = (s: LearnerStep): Date | null => (s.since && s.askedAt ? (s.since > s.askedAt ? s.since : s.askedAt) : s.since ?? s.askedAt);

export interface LevelUpOffer {
  step: number;
  nextStep: number;
  character: { id: string; name: string; role: string };
  place: string;
  city: string;
  /** Her last line of the conversation, as said */
  now: { line: string; en: string };
  /** The same line, written at the next step */
  next: { line: string; en: string };
}

/** The level text of a step, as the character sees it (scaffolding.md "Level: …") */
export function stepLevelText(step: number): string {
  return fill(readPromptFile(SCAFFOLDING_FILE).block(LEVEL_OF_CLUSTER[Math.min(MAX_STEP, Math.max(1, step)) - 1]), { language: language.name }).trim();
}

/** The rewrite prompt (content/<country>/prompts/level-up.md → Rewrite), filled */
export function rewritePrompt(p: { character: { name: string; role: string; city: string }; line: string; nextStep: number }): string {
  return fill(readPromptFile(LEVEL_UP_FILE).block('Rewrite'), {
    name: p.character.name,
    role: p.character.role,
    city: p.character.city,
    language: language.name,
    line: p.line,
    level: stepLevelText(p.nextStep),
  }).trim();
}

const Rewritten = z.object({ line: z.string(), en: z.string() });

/** Her line again at the next step: one small call */
export async function rewriteAtStep(p: { character: { name: string; role: string; city: string }; line: string; nextStep: number }): Promise<{ line: string; en: string }> {
  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 600,
    messages: [{ role: 'user', content: rewritePrompt(p) }],
    output_config: { format: { type: 'json_schema', schema: turnOutputJsonSchema } },
  });
  return Rewritten.parse(JSON.parse(replyText(response)));
}

/**
 * The offer for a learner who has just left this conversation, or null: not due, not their conversation, not an
 * ordinary visit (the welcome, lessons and Magda don't count), or already at the top
 */
export async function levelUpOffer(learnerId: string, conversationId: string): Promise<LevelUpOffer | null> {
  const s = await learnerStep(learnerId);
  if (s.step >= MAX_STEP) return null;
  await savesDone(conversationId);
  const r = await query<{ character_id: string; place_id: string | null; city_id: string | null; prompt_version: string | null; turns: { who: 'npc' | 'learner'; text: string; en?: string }[] }>(
    'SELECT character_id, place_id, city_id, prompt_version, turns FROM conversations WHERE id = $1 AND learner_id = $2',
    [conversationId, learnerId]
  );
  const conv = r.rows[0];
  if (!conv || !conv.city_id || !conv.place_id) return null;
  if (!/^beginner-2-/.test(conv.prompt_version ?? '')) return null;
  const counted = await countedConversations(learnerId, countFrom(s));
  if (!isDue({ step: s.step, counted })) return null;
  const last = [...conv.turns].reverse().find((t) => t.who === 'npc' && t.text.trim());
  const character = characterForVisit(conv.city_id, conv.place_id);
  if (!last || !character || character.placeId !== conv.place_id) return null;
  const nextStep = s.step + 1;
  const next = await rewriteAtStep({ character: { name: character.name, role: character.role, city: character.city }, line: last.text, nextStep });
  const { cities } = await import('@/content');
  const city = cities.find((c) => c.id === conv.city_id);
  const place = city?.places.find((p) => p.id === conv.place_id);
  return {
    step: s.step,
    nextStep,
    character: { id: character.id, name: character.name, role: character.role },
    place: place?.name ?? conv.place_id,
    city: city?.name ?? conv.city_id,
    now: { line: last.text, en: last.en ?? '' },
    next,
  };
}

/** The learner's answer: up a step (the count starts over), or not yet (asked again after LEVEL_UP_AFTER more) */
export async function answerLevelUp(learnerId: string, answer: 'yes' | 'not-yet'): Promise<LearnerStep> {
  await ensureStepColumns();
  if (answer === 'yes') {
    await query('UPDATE learners SET step = LEAST($2, step + 1), step_since = now(), level_up_asked_at = NULL WHERE id = $1', [learnerId, MAX_STEP]);
  } else {
    await query('UPDATE learners SET level_up_asked_at = now() WHERE id = $1', [learnerId]);
  }
  return learnerStep(learnerId);
}

/** Josh's testing: set the step directly (the Cluster stepper's stored twin) */
export async function setStep(learnerId: string, step: number): Promise<LearnerStep> {
  await ensureStepColumns();
  await query('UPDATE learners SET step = $2, step_since = now(), level_up_asked_at = NULL WHERE id = $1', [learnerId, Math.min(MAX_STEP, Math.max(1, step))]);
  return learnerStep(learnerId);
}
