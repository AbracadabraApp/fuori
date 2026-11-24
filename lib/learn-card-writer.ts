/**
 * The card after a visit (docs/learn-sheet-2-plan.md → Picking): one Claude call a visit, started at the
 * wind-down turn, that picks a bank card the visit involved, makes one from what was said, or says none.
 * With none, a bank card that stands by itself fills in, but only when no sheet showed in the learner's
 * last three visits. No card when level up will be offered for this visit (Josh: "Level up wins, no card"),
 * for the welcome, a lesson or Magda, or a visit that ends before the wind-down.
 *
 * The result is kept in memory by conversation id until the app asks for it (GET /v1/learn/card) at the
 * goodbye; a card not ready then isn't shown. What was shown is logged in learn_cards_shown.
 *
 * Server-side only.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { anthropic, CLAUDE_MODEL, logUsage, noThinkingFor, replyText } from '@/lib/claude';
import { cities, language, pack } from '@/content';
import { query } from '@/lib/db';
import { readPromptFile, fill } from '@/lib/prompts/template';
import { ENDING_AT } from '@/lib/dialogue/ending';
import { countFrom, countedConversations, learnerStep, offerDue } from '@/lib/level-up';
import type { Level } from '@/lib/onboarding';
import type { CharacterSheet, Turn } from '@/lib/types';
import { cardProblems, CARD_LEVELS, type CardLevel, type LearnCard, type LearnCardBank } from '@/lib/learn-card';

/** The card levels a learner sees, by their level (the backend's map, plan item 4) */
export const CARD_LEVELS_FOR: Record<Level, readonly CardLevel[]> = {
  beginner: ['A1', 'A2'],
  intermediate: ['A1', 'A2', 'B1'],
  advanced: CARD_LEVELS,
};
/** Bank cards shown to the writer to pick from */
export const SHORTLIST = 30;
/** A filler card only when no sheet showed in this many of the learner's last visits (Josh, 2026-11-23) */
export const BACKFILL_AFTER = 3;
/** Kinds that stand by themselves, for filling in */
const STANDS_ALONE = new Set(['about-this-place', 'culture', 'a-word-from-here', 'a-saying', 'two-places']);

/** What the app is sent: the card without its source or keys */
export type ShownCard = Pick<LearnCard, 'id' | 'kind' | 'headline' | 'term' | 'rows' | 'note'>;
type Outcome = { card: LearnCard; how: 'pick' | 'make' | 'backfill' } | null;

let bankCache: LearnCard[] | null = null;
export function bank(): LearnCard[] {
  if (bankCache) return bankCache;
  const path = join(process.cwd(), 'content', pack.id, 'learn-cards.json');
  bankCache = existsSync(path) ? (JSON.parse(readFileSync(path, 'utf8')) as LearnCardBank).cards : [];
  return bankCache;
}

/** The visit's own keys: its city, place, place kind, and the idiom said */
export function visitKeys(cityId: string, placeId: string, transcript: Turn[]): string[] {
  const place = cities.find((c) => c.id === cityId)?.places.find((p) => p.id === placeId);
  return [`city:${cityId}`, `place:${cityId}/${placeId}`, ...(place ? [`kind:${place.kind}`] : []), ...transcript.flatMap((t) => (t.idiom ? [`idiom:${t.idiom}`] : []))];
}

/** Language cards (from lessons and the syllabus) as against facts and sayings: the shortlist is mostly language */
const LANGUAGE_FROM = new Set(['lesson', 'syllabus']);
/** At most this many cards about the visit's place and city on the shortlist; the rest is language
 *  (the first replay picked a place fact every time: only facts carry place keys) */
export const PLACE_CARDS = 8;

/** Bank cards at the learner's levels: a few about the visit's place and city, then language cards, most
 *  keys in common with the visit first (ties in bank order) */
export function shortlist(cards: LearnCard[], levels: readonly CardLevel[], keys: string[], n = SHORTLIST): LearnCard[] {
  const want = new Set(keys);
  const ranked = (list: LearnCard[]) => list
    .map((c, i) => ({ c, i, score: c.keys.filter((k) => want.has(k)).length }))
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .map((x) => x.c);
  const atLevel = cards.filter((c) => levels.includes(c.level));
  const local = ranked(atLevel.filter((c) => !LANGUAGE_FROM.has(c.source.from) && c.keys.some((k) => want.has(k)))).slice(0, PLACE_CARDS);
  const language = ranked(atLevel.filter((c) => LANGUAGE_FROM.has(c.source.from)));
  return [...local, ...language].slice(0, n);
}

/** A card that stands by itself for this visit: about its place first, then its city, then a saying */
export function backfill(cards: LearnCard[], levels: readonly CardLevel[], keys: string[], seed: number): LearnCard | null {
  const fit = cards.filter((c) => levels.includes(c.level) && STANDS_ALONE.has(c.kind));
  const place = keys.find((k) => k.startsWith('place:'));
  const city = keys.find((k) => k.startsWith('city:'));
  for (const pool of [fit.filter((c) => place && c.keys.includes(place)), fit.filter((c) => city && c.keys.includes(city)), fit.filter((c) => c.kind === 'a-saying')]) {
    if (pool.length) return pool[seed % pool.length];
  }
  return null;
}

let tableReady: Promise<void> | undefined;
/** The log of cards shown (also in scripts/db-migrate.mjs) */
export function ensureShownTable(): Promise<void> {
  tableReady ??= (async () => {
    await query(`CREATE TABLE IF NOT EXISTS learn_cards_shown (
      conversation_id uuid PRIMARY KEY,
      learner_id      uuid NOT NULL,
      card_id         text NOT NULL,
      kind            text NOT NULL,
      card            jsonb NOT NULL,
      how             text NOT NULL,
      shown_at        timestamptz NOT NULL DEFAULT now(),
      closed_at       timestamptz
    )`);
    await query('CREATE INDEX IF NOT EXISTS idx_learn_cards_shown_learner ON learn_cards_shown(learner_id, shown_at DESC)');
  })();
  return tableReady;
}

/** Whether any of the learner's last `n` ended visits before this one showed a sheet */
async function sheetInLast(learnerId: string, conversationId: string, n: number): Promise<boolean> {
  await ensureShownTable();
  const r = await query<{ shown: boolean }>(
    `SELECT EXISTS (
       SELECT 1 FROM (SELECT id FROM conversations WHERE learner_id = $1 AND id <> $2 AND ended_at IS NOT NULL ORDER BY started_at DESC LIMIT $3) last
       JOIN learn_cards_shown s ON s.conversation_id = last.id) AS shown`,
    [learnerId, conversationId, n]
  );
  return r.rows[0]?.shown ?? false;
}

/** Whether level up will be offered after this visit: the same count lib/level-up.ts uses */
async function levelUpComing(learnerId: string, level: Level | null): Promise<boolean> {
  const s = await learnerStep(learnerId);
  return offerDue({ level, step: s.step, counted: await countedConversations(learnerId, countFrom(s)) }) !== null;
}

const str = { type: 'string' };
const rowSchema = { type: 'object', additionalProperties: false, required: ['text', 'en'], properties: { text: str, en: str } };
const outSchema = {
  type: 'object', additionalProperties: false, required: ['choice', 'pick', 'kind', 'headline', 'term', 'rows', 'note'],
  properties: { choice: { type: 'string', enum: ['pick', 'make', 'none'] }, pick: str, kind: str, headline: str, term: str, rows: { type: 'array', items: rowSchema }, note: str },
};
type Out = { choice: 'pick' | 'make' | 'none'; pick: string; kind: string; headline: string; term: string; rows: { text: string; en: string }[]; note: string };

export function learnCardVersion(): string {
  return readPromptFile('learn-card.md').version;
}

/** The writer's call: pick, make or none */
export async function writeCard(p: { character: CharacterSheet; cityName: string; level: Level | null; transcript: Turn[]; options: LearnCard[] }): Promise<Out> {
  const f = readPromptFile('learn-card.md');
  const models = fill(readPromptFile('learn-card-models.md').block('Models'), { language: language.name });
  const lines = p.transcript.map((t) => `${t.who === 'learner' ? 'Learner' : p.character.name}: ${t.transcript}`).join('\n');
  const options = p.options.map((c) => `${c.id} | ${c.kind} | ${c.headline}${c.term ? `: ${c.term}` : ''} | ${c.rows.map((r) => r.text).join(' / ')}${c.note ? ` | ${c.note}` : ''}`).join('\n');
  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 2000,
    ...noThinkingFor(CLAUDE_MODEL),
    system: fill(f.block('System prompt'), { language: language.name, models }),
    messages: [{ role: 'user', content: fill(f.block('User message'), { name: p.character.name, role: p.character.role, city: p.cityName, level: p.level ?? 'beginner', transcript: lines, options: options || '(none)' }) }],
    output_config: { format: { type: 'json_schema', schema: outSchema } },
  } as Parameters<typeof anthropic.messages.create>[0]);
  logUsage('learn-card', response as Parameters<typeof logUsage>[1]);
  return JSON.parse(replyText(response as Parameters<typeof replyText>[0])) as Out;
}

/** The writer's answer as a card, or null when it's none or breaks a rule */
export function cardFrom(out: Out, options: LearnCard[], conversationId: string, levels: readonly CardLevel[]): { card: LearnCard; how: 'pick' | 'make' } | null {
  if (out.choice === 'pick') {
    const picked = options.find((c) => c.id === out.pick);
    return picked ? { card: picked, how: 'pick' } : null;
  }
  if (out.choice !== 'make') return null;
  const card: LearnCard = {
    id: `visit:${conversationId}`, kind: out.kind.trim() || 'card', headline: out.headline.trim(),
    ...(out.term.trim() ? { term: out.term.trim() } : {}), rows: out.rows.filter((r) => r.text.trim() || r.en.trim()),
    ...(out.note.trim() ? { note: out.note.trim() } : {}), level: levels[0] ?? 'A1', keys: [],
    source: { from: 'visit', ref: `conversation:${conversationId}`, redrafted: true, by: `learn-card@${learnCardVersion()}` },
  };
  return cardProblems(card).length ? null : { card, how: 'make' };
}

const pending = new Map<string, { at: number; outcome: Promise<Outcome> }>();
const KEEP_MS = 30 * 60 * 1000;

/**
 * Starts the card for this visit once, at the wind-down turn (the character's reply that offers the
 * goodbye: ENDING_AT for the level). Returns false when it isn't the moment or was already started.
 */
export function startLearnCard(p: {
  conversationId: string;
  learnerId: string;
  character: CharacterSheet;
  cityId: string;
  placeId: string;
  transcript: Turn[];
  onError: (err: unknown) => void;
}): boolean {
  if (pending.has(p.conversationId) || !existsSync(join(process.cwd(), 'content', pack.id, 'prompts', 'learn-card.md'))) return false;
  const npcTurns = p.transcript.filter((t) => t.who === 'npc').length;
  // The earliest wind-down of any level: the level check comes with the learner's record below
  if (npcTurns < ENDING_AT.beginner.windDown) return false;
  const now = Date.now();
  for (const [k, v] of pending) if (now - v.at > KEEP_MS) pending.delete(k);
  const outcome = (async (): Promise<Outcome> => {
    const r = await query<{ level: Level | null }>('SELECT level FROM learners WHERE id = $1', [p.learnerId]);
    const level = r.rows[0]?.level ?? null;
    const windDown = level === 'intermediate' || level === 'advanced' ? ENDING_AT.intermediate.windDown : ENDING_AT.beginner.windDown;
    if (npcTurns < windDown) return null;
    if (await levelUpComing(p.learnerId, level)) return null;
    const levels = CARD_LEVELS_FOR[level ?? 'beginner'];
    const keys = visitKeys(p.cityId, p.placeId, p.transcript);
    const options = shortlist(bank(), levels, keys);
    const cityName = cities.find((c) => c.id === p.cityId)?.name ?? p.cityId;
    const made = cardFrom(await writeCard({ character: p.character, cityName, level, transcript: p.transcript, options }), options, p.conversationId, levels);
    if (made) return made;
    if (await sheetInLast(p.learnerId, p.conversationId, BACKFILL_AFTER)) return null;
    const seed = [...p.conversationId].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) >>> 0, 7);
    const filler = backfill(bank(), levels, keys, seed);
    return filler ? { card: filler, how: 'backfill' } : null;
  })().catch((err) => {
    p.onError(err);
    return null;
  });
  pending.set(p.conversationId, { at: now, outcome });
  return true;
}

/** The card for this visit if it's ready now (never waits), logged as shown; null otherwise */
export async function readyCard(conversationId: string, learnerId: string): Promise<ShownCard | null> {
  const found = pending.get(conversationId);
  if (!found) return null;
  const outcome = await Promise.race([found.outcome, Promise.resolve(undefined)]);
  if (!outcome) return null;
  await ensureShownTable();
  await query(
    `INSERT INTO learn_cards_shown (conversation_id, learner_id, card_id, kind, card, how) VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (conversation_id) DO NOTHING`,
    [conversationId, learnerId, outcome.card.id, outcome.card.kind, JSON.stringify(outcome.card), outcome.how]
  );
  const { id, kind, headline, term, rows, note } = outcome.card;
  return { id, kind, headline, ...(term ? { term } : {}), rows, ...(note ? { note } : {}) };
}

/** The learner closed the sheet */
export async function cardClosed(conversationId: string, learnerId: string): Promise<void> {
  await ensureShownTable();
  await query('UPDATE learn_cards_shown SET closed_at = coalesce(closed_at, now()) WHERE conversation_id = $1 AND learner_id = $2', [conversationId, learnerId]);
}
