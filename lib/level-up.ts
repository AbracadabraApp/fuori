/**
 * Level up (docs/glossary.md; docs/dialogue-structure-reference.md § 12.2; the screen in sketches/level-up/):
 * after N conversations at the learner's step the game offers the next step, the learner chooses, no score
 * decides (Josh, 2026-11-11: "a simple offer after N conversations; doesn't have to be success based and is
 * user chosen"). The step is stored on the learner's record and is Beginner 2's cluster of the reply ladder
 * (lib/beginner-2.ts → CLUSTERS) when the app sends no cluster header. The offer shows the character's last
 * line as said and the same line at the next step (one small call, content/<country>/prompts/level-up.md).
 *
 * Past the steps, the same offer moves the level (docs/dialogue-plan.md D34, D35): at the top of Beginner (the last
 * step) to Intermediate, and from Intermediate to Advanced (Josh, 2026-11-14: "we can put a step in but not focus on
 * the advanced exxperience yet"). The level is learners.level, set as Settings sets it (lib/onboarding.ts → setLevel);
 * the step stays where it was. Advanced is the top: no offer there.
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
import { SETTINGS, saySentences, englishOf, seedOf, type Setting } from '@/lib/dialogue/pieces';
import { setLevel, type Level } from '@/lib/onboarding';

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

/** What a yes does: the next step, or at the top of Beginner the next level; null at Advanced (the top) */
export type Move = { to: 'step'; step: number } | { to: 'intermediate' } | { to: 'advanced' };

/** The pure rule for the yes (D34, D35): Beginner (or no level yet) climbs the steps, then moves to Intermediate; Intermediate to Advanced */
export function moveFrom(p: { level: Level | null; step: number }): Move | null {
  if (p.level === 'advanced') return null;
  if (p.level === 'intermediate') return { to: 'advanced' };
  return p.step < MAX_STEP ? { to: 'step', step: p.step + 1 } : { to: 'intermediate' };
}

/** The pure rule for the offer: the same count at every step and level (LEVEL_UP_AFTER counted conversations) */
export function offerDue(p: { level: Level | null; step: number; counted: number }): Move | null {
  return p.counted >= LEVEL_UP_AFTER ? moveFrom(p) : null;
}

/**
 * Whether the conversation the offer follows is an ordinary visit at the learner's level: Beginner 2's at Beginner;
 * at Intermediate and Advanced the character prompt's (not a Beginner one, a lesson, Magda, the welcome or onboarding)
 */
export function ordinaryVisit(level: Level | null, promptVersion: string | null): boolean {
  const v = promptVersion ?? '';
  if (level === 'intermediate' || level === 'advanced') return v !== '' && !/^(beginner-|lesson-|magda-|onboarding)/.test(v);
  return /^beginner-2-/.test(v);
}

/** The level text the rewrite is written for: the step's (scaffolding.md) or the level's (character.md → Learner: …) */
export function moveLevelText(move: Move): string {
  if (move.to === 'step') return stepLevelText(move.step);
  return fill(readPromptFile('character.md').block(move.to === 'intermediate' ? 'Learner: Intermediate' : 'Learner: Advanced'), { language: language.name }).trim();
}

/** The screen's words for this offer (the app's LevelUpWords): a level move puts its own label on the next card and its own line under the cards */
export function offerWords(to: Move['to']) {
  const { to: levels, ...words } = language.ui.levelUp;
  return to === 'step' ? words : { ...words, ...levels[to] };
}

/** The later of the two dates, or null when neither */
export const countFrom = (s: LearnerStep): Date | null => (s.since && s.askedAt ? (s.since > s.askedAt ? s.since : s.askedAt) : s.since ?? s.askedAt);

export interface LevelUpOffer {
  step: number;
  /** The step after a yes: the same step when the offer moves the level */
  nextStep: number;
  /** What the yes changes: the step, or the level (D34, D35) */
  to: Move['to'];
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

/** The rewrite prompt (content/<country>/prompts/level-up.md → Rewrite), filled; `level` replaces the step's level text (a level move) */
export function rewritePrompt(p: { character: { name: string; role: string; city: string }; line: string; nextStep: number; level?: string }): string {
  return fill(readPromptFile(LEVEL_UP_FILE).block('Rewrite'), {
    name: p.character.name,
    role: p.character.role,
    city: p.character.city,
    language: language.name,
    line: p.line,
    level: p.level ?? stepLevelText(p.nextStep),
  }).trim();
}

const Rewritten = z.object({ line: z.string(), en: z.string() });

/** Her line again at the next step: one small call */
export async function rewriteAtStep(p: { character: { name: string; role: string; city: string }; line: string; nextStep: number; level?: string; setting?: Setting }): Promise<{ line: string; en: string }> {
  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    // Thinking counts toward the limit: at 600 the first real offers (2026-11-15, build 16) came back as thinking only
    // ("Claude returned no text… stop: max_tokens") or cut off mid-JSON, so no offer showed. As the memory call (8000)
    max_tokens: 4000,
    messages: [{ role: 'user', content: rewritePrompt(p) }],
    output_config: { format: { type: 'json_schema', schema: turnOutputJsonSchema } },
  });
  if (response.stop_reason === 'max_tokens') throw new Error(`Level-up rewrite hit max_tokens (${response.usage.output_tokens} tokens)`);
  return previewAtSetting(Rewritten.parse(JSON.parse(replyText(response))), p.setting, seedOf(p.line));
}

/**
 * A step that is a setting (steps 1 to 3, lib/dialogue/pieces.ts): its level text has the character write every
 * sentence in both languages, in braces, so the preview is put together the way the step's turns are
 */
export function previewAtSetting(r: { line: string; en: string }, setting: Setting | undefined, seed: number): { line: string; en: string } {
  if (!setting || !/\{[^{}]*\|[^{}]*\}/.test(r.line)) return { line: r.line.replace(/[{}*]/g, ''), en: r.en };
  return { line: saySentences(r.line, setting, seed), en: englishOf(r.line) };
}

/** The learner's level (null before onboarding) and step, for the offer and the yes */
async function levelAndStep(learnerId: string): Promise<{ level: Level | null; s: LearnerStep }> {
  const s = await learnerStep(learnerId);
  const r = await query<{ level: Level | null }>('SELECT level FROM learners WHERE id = $1', [learnerId]);
  return { level: r.rows[0]?.level ?? null, s };
}

/**
 * The offer for a learner who has just left this conversation, or null: not due, not their conversation, not an
 * ordinary visit at their level (the welcome, lessons and Magda don't count), or already at the top (Advanced).
 * `beginnerVersion` is the app's switch: at Beginner the offer comes only on Beginner 2
 */
export async function levelUpOffer(learnerId: string, conversationId: string, beginnerVersion: 1 | 2 = 2): Promise<LevelUpOffer | null> {
  const { level, s } = await levelAndStep(learnerId);
  const beginner = level !== 'intermediate' && level !== 'advanced';
  if (!moveFrom({ level, step: s.step }) || (beginner && beginnerVersion !== 2)) return null;
  await savesDone(conversationId);
  const r = await query<{ character_id: string; place_id: string | null; city_id: string | null; prompt_version: string | null; turns: { who: 'npc' | 'learner'; text: string; en?: string }[] }>(
    'SELECT character_id, place_id, city_id, prompt_version, turns FROM conversations WHERE id = $1 AND learner_id = $2',
    [conversationId, learnerId]
  );
  const conv = r.rows[0];
  if (!conv || !conv.city_id || !conv.place_id) return null;
  if (!ordinaryVisit(level, conv.prompt_version)) return null;
  const counted = await countedConversations(learnerId, countFrom(s));
  const move = offerDue({ level, step: s.step, counted });
  if (!move) return null;
  const last = [...conv.turns].reverse().find((t) => t.who === 'npc' && t.text.trim());
  const character = characterForVisit(conv.city_id, conv.place_id);
  if (!last || !character || character.placeId !== conv.place_id) return null;
  const nextStep = move.to === 'step' ? move.step : s.step;
  // The preview: her last line rewritten for the next step, or for the next level (character.md → Learner: …)
  const next = await rewriteAtStep({ character: { name: character.name, role: character.role, city: character.city }, line: last.text, nextStep, level: moveLevelText(move), ...(move.to === 'step' ? { setting: SETTINGS[nextStep - 1] } : {}) });
  const { cities } = await import('@/content');
  const city = cities.find((c) => c.id === conv.city_id);
  const place = city?.places.find((p) => p.id === conv.place_id);
  return {
    step: s.step,
    nextStep,
    to: move.to,
    character: { id: character.id, name: character.name, role: character.role },
    place: place?.name ?? conv.place_id,
    city: city?.name ?? conv.city_id,
    now: { line: last.text, en: last.en ?? '' },
    next,
  };
}

/** A level change, from the level up or Settings: the level as Settings sets it, and the count starts over at the new level */
export async function changeLevel(learnerId: string, level: Level): Promise<void> {
  await ensureStepColumns();
  await setLevel(learnerId, level);
  await query('UPDATE learners SET step_since = now(), level_up_asked_at = NULL WHERE id = $1', [learnerId]);
}

/**
 * The learner's answer: yes moves them on (moveFrom: up a step, or at the top of Beginner to Intermediate, from
 * Intermediate to Advanced) and the count starts over; not yet asks again after LEVEL_UP_AFTER more
 */
export async function answerLevelUp(learnerId: string, answer: 'yes' | 'not-yet'): Promise<LearnerStep & { level: Level | null }> {
  await ensureStepColumns();
  if (answer === 'yes') {
    const { level, s } = await levelAndStep(learnerId);
    // Only when an offer is due (state-machine review, 2026-11-15; Josh: "yes"): a yes with nothing offered, or a
    // second yes (a double tap, a retried request), did a second move, two steps up, or Beginner straight to Advanced.
    // A yes starts the count over, so the second finds nothing due
    const move = offerDue({ level, step: s.step, counted: await countedConversations(learnerId, countFrom(s)) });
    if (move?.to === 'step') await query('UPDATE learners SET step = LEAST($2, step + 1), step_since = now(), level_up_asked_at = NULL WHERE id = $1', [learnerId, MAX_STEP]);
    else if (move) await changeLevel(learnerId, move.to);
  } else {
    await query('UPDATE learners SET level_up_asked_at = now() WHERE id = $1', [learnerId]);
  }
  const after = await levelAndStep(learnerId);
  return { ...after.s, level: after.level };
}

/** Josh's testing: set the step directly (the Cluster stepper's stored twin) */
export async function setStep(learnerId: string, step: number): Promise<LearnerStep> {
  await ensureStepColumns();
  await query('UPDATE learners SET step = $2, step_since = now(), level_up_asked_at = NULL WHERE id = $1', [learnerId, Math.min(MAX_STEP, Math.max(1, step))]);
  return learnerStep(learnerId);
}
