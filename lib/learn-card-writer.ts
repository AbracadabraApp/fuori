/**
 * The card after a visit (docs/learn-sheet-2-design.md → The source, redesigned): one Claude call a visit, started at
 * the turn before the wind-down, writes one card for each kind the conversation can supply, and code picks the kind: not a kind
 * from the learner's last two cards, then the first left in KIND_ORDER (situations first; Josh, 2026-11-24: "The
 * situation cardds may be the best"). The variety is code's, since a prompt asked to vary gives the same thing every
 * time (docs/bugs.md B31). The card's language comes from the visit as said; place and culture are written from the
 * scene, as the Learn page's good-to-know is. No bank and no fill-in (Josh, 2026-11-24: "I think the \"card bank\"
 * idea took it in a wrong direction"). No card when level up will be offered for this visit (Josh: "Level up wins,
 * no card"), for the welcome, a lesson or Magda, or a visit that ends before the wind-down.
 *
 * The result is kept in memory by conversation id until the app asks for it (GET /v1/learn/card) at the goodbye; a
 * card not ready then isn't shown. What was shown is logged in learn_cards_shown, and every outcome in a learn-card
 * log line, so a visit with no card can be explained.
 *
 * Server-side only.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { anthropic, CLAUDE_MODEL, logUsage, noThinkingFor, replyText } from '@/lib/claude';
import { cities, language, pack } from '@/content';
import { query } from '@/lib/db';
import { readPromptFile, fill } from '@/lib/prompts/template';
import { ENDING_AT } from '@/lib/dialogue/ending';
import { countFrom, countedConversations, learnerStep, offerDue } from '@/lib/level-up';
import type { Level } from '@/lib/onboarding';
import type { CharacterSheet, Turn } from '@/lib/types';
import { cardProblems, type CardLevel, type LearnCard } from '@/lib/learn-card';

/** The kinds the writer may write, in the order code prefers them (docs/learn-sheet-2-design.md → The source, redesigned) */
export const KIND_ORDER = ['when-you', 'learn-it', 'a-saying', 'formal-informal', 'this-or-that', 'a-word-from-here', 'about-this-place', 'culture', 'vocabulary'] as const;
export type CardKind = (typeof KIND_ORDER)[number];
/** A kind shown in this many of the learner's last cards isn't picked again while another is there */
export const NOT_AGAIN_FOR = 2;
/** A card with the same word or headline as one of the learner's last this-many cards isn't shown (the replay of
 *  2026-11-24 gave "Learn it: ahorita" two visits out of four) */
export const SAME_CARD_FOR = 20;
/** The card's level label, by the learner's level (for the log; the app doesn't show it) */
const LEVEL_LABEL: Record<Level, CardLevel> = { beginner: 'A1', intermediate: 'B1', advanced: 'B2' };

/** What the app is sent: the card without its source or keys */
export type ShownCard = Pick<LearnCard, 'id' | 'kind' | 'headline' | 'term' | 'rows' | 'note'>;
type Outcome = { card: LearnCard; how: 'make' } | null;

let tableReady: Promise<void> | undefined;
/** The log of cards shown (also in scripts/db-migrate.mjs). A failure is retried on the next call, not kept (B59) */
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
  })().catch((err) => {
    tableReady = undefined;
    throw err;
  });
  return tableReady;
}

/** The learner's last cards shown, newest first: their kinds (the last NOT_AGAIN_FOR) and what they were about (the last SAME_CARD_FOR) */
async function recentCards(learnerId: string, conversationId: string): Promise<{ kinds: string[]; seen: string[] }> {
  await ensureShownTable();
  const r = await query<{ kind: string; card: LearnCard }>(
    'SELECT kind, card FROM learn_cards_shown WHERE learner_id = $1 AND conversation_id <> $2 ORDER BY shown_at DESC LIMIT $3',
    [learnerId, conversationId, SAME_CARD_FOR]
  );
  return { kinds: r.rows.slice(0, NOT_AGAIN_FOR).map((x) => x.kind), seen: r.rows.map((x) => aboutOf(x.card)) };
}

/** What a card is about, to tell the same card from another: its word, else its headline */
export function aboutOf(card: { headline: string; term?: string }): string {
  return (card.term?.trim() || card.headline.trim()).toLowerCase();
}

/** Whether level up will be offered after this visit: the same count lib/level-up.ts uses */
async function levelUpComing(learnerId: string, level: Level | null): Promise<boolean> {
  const s = await learnerStep(learnerId);
  return offerDue({ level, step: s.step, counted: await countedConversations(learnerId, countFrom(s)) }) !== null;
}

const str = { type: 'string' };
const rowSchema = { type: 'object', additionalProperties: false, required: ['text', 'en'], properties: { text: str, en: str } };
const cardSchema = {
  type: 'object', additionalProperties: false, required: ['kind', 'headline', 'term', 'rows', 'note'],
  properties: { kind: { type: 'string', enum: [...KIND_ORDER] }, headline: str, term: str, rows: { type: 'array', items: rowSchema }, note: str },
};
const outSchema = { type: 'object', additionalProperties: false, required: ['cards'], properties: { cards: { type: 'array', items: cardSchema } } };
export type WrittenCard = { kind: CardKind; headline: string; term: string; rows: { text: string; en: string }[]; note: string };
type Out = { cards: WrittenCard[] };

export function learnCardVersion(): string {
  return readPromptFile('learn-card.md').version;
}

/** The writer's call: one card for each kind the conversation can supply */
export async function writeCards(p: { character: CharacterSheet; cityName: string; level: Level | null; transcript: Turn[] }): Promise<WrittenCard[]> {
  const f = readPromptFile('learn-card.md');
  const models = fill(readPromptFile('learn-card-models.md').block('Models'), { language: language.name });
  const lines = p.transcript.map((t) => `${t.who === 'learner' ? 'Learner' : p.character.name}: ${t.transcript}`).join('\n');
  const values = { language: language.name, name: p.character.name, role: p.character.role, city: p.cityName, level: p.level ?? 'beginner' };
  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 4000,
    ...noThinkingFor(CLAUDE_MODEL),
    system: fill(f.block('System prompt'), { ...values, models }),
    messages: [{ role: 'user', content: fill(f.block('User message'), { ...values, transcript: lines }) }],
    output_config: { format: { type: 'json_schema', schema: outSchema } },
  } as Parameters<typeof anthropic.messages.create>[0]);
  logUsage('learn-card', response as Parameters<typeof logUsage>[1]);
  return (JSON.parse(replyText(response as Parameters<typeof replyText>[0])) as Out).cards;
}

/**
 * The plain English line in the place the design gives it (rules 14 and 15, the models): first on a Learn it or A word
 * from here card (why it matters, what it means), second on a saying (its meaning, after the saying). The writer
 * doesn't always keep it there (the 2026-11-24 replay put a Learn it card's why last), so code does
 */
export function placePlainLine(kind: string, rows: { text: string; en: string }[]): { text: string; en: string }[] {
  const at = kind === 'learn-it' || kind === 'a-word-from-here' ? 0 : kind === 'a-saying' ? 1 : -1;
  const plain = rows.findIndex((r) => !r.text);
  if (at < 0 || plain < 0 || plain === at || rows.length <= at) return rows;
  const rest = rows.filter((_, i) => i !== plain);
  return [...rest.slice(0, at), rows[plain], ...rest.slice(at)];
}

/** A written card as a LearnCard, or null when it breaks a rule code can see */
export function cardFrom(w: WrittenCard, conversationId: string, level: Level | null): LearnCard | null {
  const rows = w.rows.map((r) => ({ text: r.text.trim(), en: r.en.trim() })).filter((r) => r.text || r.en);
  const card: LearnCard = {
    id: `visit:${conversationId}:${w.kind}`, kind: w.kind, headline: w.headline.trim(),
    ...(w.term.trim() ? { term: w.term.trim() } : {}), rows: placePlainLine(w.kind, rows),
    ...(w.note.trim() ? { note: w.note.trim() } : {}), level: LEVEL_LABEL[level ?? 'beginner'], keys: [],
    source: { from: 'visit', ref: `conversation:${conversationId}`, redrafted: true, by: `learn-card@${learnCardVersion()}` },
  };
  return cardProblems(card).length ? null : card;
}

/**
 * The card to show: never one about the same word or headline as a recent card (`seen`); of the rest, the first in
 * KIND_ORDER whose kind isn't among the recent kinds, else the first left
 */
export function pickKind<T extends { kind: string; headline: string; term?: string }>(cards: T[], recent: string[], seen: string[] = []): T | null {
  const rank = (k: string) => (KIND_ORDER as readonly string[]).indexOf(k);
  const fresh = cards.filter((c) => !seen.includes(aboutOf(c))).sort((a, b) => rank(a.kind) - rank(b.kind));
  return fresh.find((c) => !recent.includes(c.kind)) ?? fresh[0] ?? null;
}

/**
 * When the writer starts, in the character's lines before this reply: the turn before the level's wind-down (Beginner 6,
 * Intermediate and Advanced 8). One turn ahead on purpose: writing a card for every kind takes longer than picking one
 * did, and the app asks for the card at the goodbye, two of the learner's replies later, without waiting (B57). What it
 * misses is the wind-down's invitation and the goodbye, which a card isn't about
 */
export function startAt(level: Level | null): number {
  return (level === 'intermediate' || level === 'advanced' ? ENDING_AT.intermediate.windDown : ENDING_AT.beginner.windDown) - 1;
}

const pending = new Map<string, { at: number; learnerId: string; outcome: Promise<Outcome> }>();
const KEEP_MS = 30 * 60 * 1000;

function logOutcome(conversationId: string, outcome: string, extra: Record<string, unknown> = {}) {
  console.log(JSON.stringify({ level: 'info', event: 'learn-card', conversationId, outcome, ...extra }));
}

/**
 * Starts the card for this visit once, the turn before the wind-down (startAt, counted in the character's lines before
 * this reply, as lib/dialogue/ending.ts counts). `transcript` ends on this reply. Returns false when it isn't the
 * moment or was already started.
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
  // The character's lines before this reply: the transcript ends on it
  const before = p.transcript.filter((t) => t.who === 'npc').length - 1;
  // The earliest start of any level; the learner's level is checked below
  if (before < startAt('beginner')) return false;
  const now = Date.now();
  for (const [k, v] of pending) if (now - v.at > KEEP_MS) pending.delete(k);
  const outcome = (async (): Promise<Outcome> => {
    const r = await query<{ level: Level | null }>('SELECT level FROM learners WHERE id = $1', [p.learnerId]);
    const level = r.rows[0]?.level ?? null;
    // Not this level's moment yet (Intermediate and Advanced wind down later): let a later turn start it (B56: it used to
    // start at Beginner's count, find it too early for an Intermediate learner and never start again)
    if (before < startAt(level)) {
      pending.delete(p.conversationId);
      return null;
    }
    if (await levelUpComing(p.learnerId, level)) {
      logOutcome(p.conversationId, 'level-up');
      return null;
    }
    const cityName = cities.find((c) => c.id === p.cityId)?.name ?? p.cityId;
    const written = await writeCards({ character: p.character, cityName, level, transcript: p.transcript });
    const cards = written.map((w) => cardFrom(w, p.conversationId, level)).filter((c): c is LearnCard => c !== null);
    const recent = await recentCards(p.learnerId, p.conversationId);
    const card = pickKind(cards, recent.kinds, recent.seen);
    logOutcome(p.conversationId, card ? 'card' : 'none', { written: written.map((w) => w.kind), refused: written.length - cards.length, recent: recent.kinds, picked: card?.kind ?? null, about: card ? aboutOf(card) : null });
    return card ? { card, how: 'make' } : null;
  })().catch((err) => {
    p.onError(err);
    return null;
  });
  pending.set(p.conversationId, { at: now, learnerId: p.learnerId, outcome });
  return true;
}

/** The card for this visit if it's ready now (never waits), logged as shown; null otherwise, or when it isn't this learner's (B59) */
export async function readyCard(conversationId: string, learnerId: string): Promise<ShownCard | null> {
  const found = pending.get(conversationId);
  if (!found || found.learnerId !== learnerId) return null;
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
