/**
 * Scoring one conversation for the dialogue scorecard (docs/10-testing.md →
 * "Dialogue quality"). Two parts:
 * - measured by code: reply length and questions (lib/dialogue-stats.ts), and
 *   whether the reply after each "I'm lost" line got shorter;
 * - counted by one Claude call (content/it/prompts/quality.md): pronunciation
 *   corrections, corrections asked for and unprompted, garbled lines missed,
 *   pulling back when lost, English nobody asked for, lines that don't
 *   follow from the conversation, and a 1–10 "alive" rating.
 *
 * Real conversations are scored when they end (lib/remember.ts, after memory);
 * the replay test scores its conversations with the same functions, so real
 * play and tests are measured the same way. lib/scorecard.ts adds them up.
 *
 * Server-side only.
 */

import { z } from 'zod';
import { anthropic, CLAUDE_MODEL, replyText } from './claude';
import { readPromptFile, fill } from './prompts/template';
import { qualityOutputJsonSchema } from './prompts/quality-output-schema';
import { turnStats, wordCount, type TurnStats } from './dialogue-stats';
import { query } from './db';
import { language } from '@/content';
import type { LevelScore } from './level';

export interface ScoredTurn {
  who: 'npc' | 'learner';
  text: string;
  /** Beginner replies saved with their parts (from 2026-10-27) */
  parts?: { kind: string; text: string }[];
}

/**
 * The character's phrases in the language, counted exactly from Beginner
 * replies' parts (words and questions; answers are the learner's to say):
 * how many, how long, and the English around them. Null when no reply has
 * parts (other levels, or saved before 2026-10-27): the judge's counts stand.
 */
export function phraseStats(turns: ScoredTurn[]): { replies: number; phrases: number; words: number; avgWords: number; englishWords: number } | null {
  const withParts = turns.filter((t) => t.who === 'npc' && t.parts?.length);
  if (!withParts.length) return null;
  const parts = withParts.flatMap((t) => t.parts!);
  const phrases = parts.filter((x) => x.kind === 'word' || x.kind === 'question');
  const words = phrases.reduce((n, x) => n + wordCount(x.text), 0);
  const englishWords = parts.filter((x) => x.kind === 'english').reduce((n, x) => n + wordCount(x.text), 0);
  return { replies: withParts.length, phrases: phrases.length, words, avgWords: phrases.length ? Math.round((10 * words) / phrases.length) / 10 : 0, englishWords };
}

export interface ScoredCharacter {
  name: string;
  age: number;
  role: string;
  city: string;
}

const JudgeSchema = z.object({
  pronunciationCorrections: z.number().int().min(0),
  correctionsAsked: z.number().int().min(0),
  correctionsUnprompted: z.number().int().min(0),
  garbled: z.number().int().min(0),
  garbledMissed: z.number().int().min(0),
  lost: z.array(z.object({ line: z.number().int(), pulledBack: z.boolean() })),
  englishUnasked: z.number().int().min(0),
  // Added 2026-10-16 (judge version 2026-10-16); optional so scores saved before still read
  incoherent: z.number().int().min(0).optional(),
  alive: z.number().int().min(1).max(10).optional(),
  // Added 2026-10-27 (judge version 2026-10-27): how much each side spoke the
  // language and English (Josh: "both are important, character and speaker";
  // for the character, total words, not a share, and "the length of phrase and
  // number of phrases per dialogue": average length = characterLanguage / characterPhrases)
  words: z
    .object({
      characterPhrases: z.number().int().min(0),
      characterLanguage: z.number().int().min(0),
      characterEnglish: z.number().int().min(0),
      personLanguage: z.number().int().min(0),
      personEnglish: z.number().int().min(0),
      personLinesLanguage: z.number().int().min(0),
      personLinesEnglish: z.number().int().min(0),
      personLinesMixed: z.number().int().min(0),
    })
    .optional(),
  note: z.string(),
});
export type QualityJudgement = z.infer<typeof JudgeSchema>;

export interface ConversationScore {
  /** Version of content/it/prompts/quality.md that judged it */
  judgeVersion: string;
  /** A Beginner conversation (English by design; englishUnasked counts only English beyond it) */
  beginner?: boolean;
  /** Learner lines in the conversation */
  learnerLines: number;
  stats: TurnStats;
  /** For each "I'm lost" line: was the next reply shorter than the one before (code), simpler and shorter (judge) */
  lost: { line: number; shorter: boolean; pulledBack: boolean }[];
  judge: QualityJudgement;
  /** Beginner replies' phrases in the language, counted exactly from their parts (phraseStats) */
  phrases?: ReturnType<typeof phraseStats>;
  /** How long each character reply took, in ms (the replay test times them; real play doesn't yet) */
  replyMs?: number[];
  /** Level of the character's lines (lib/level.ts; the replay test scores it, real play doesn't yet) */
  level?: LevelScore;
}

export function qualityPromptVersion(): string {
  return readPromptFile('quality.md').version;
}

export function buildQualityPrompt(character: ScoredCharacter, turns: ScoredTurn[], opts: { beginner?: boolean } = {}): { system: string; user: string } {
  const f = readPromptFile('quality.md');
  const values = {
    name: character.name,
    age: String(character.age),
    role: character.role,
    city: character.city,
    language: language.name,
  };
  const withBeginner = { ...values, beginner: opts.beginner ? fill(f.block('Beginner'), values) : '' };
  let n = 0;
  const transcript = turns.map((t) => (t.who === 'npc' ? `${character.name}: ${t.text}` : `Person ${++n}: ${t.text}`)).join('\n');
  return { system: fill(f.block('System prompt'), withBeginner), user: fill(f.block('User message'), { ...values, transcript }) };
}

/** Counts the judged items. Tests pass a fake. */
export type Judge = (character: ScoredCharacter, turns: ScoredTurn[], opts?: { beginner?: boolean }) => Promise<QualityJudgement>;

export const judgeWithClaude: Judge = async (character, turns, opts = {}) => {
  const prompt = buildQualityPrompt(character, turns, opts);
  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    // The model thinks before answering and the thinking counts toward this
    // limit: at 1024, about one conversation in four came back cut off
    // (replay, 2026-10-16) once the judge also wrote coherence and "alive"
    max_tokens: 4000,
    system: prompt.system,
    messages: [{ role: 'user', content: prompt.user }],
    output_config: { format: { type: 'json_schema', schema: qualityOutputJsonSchema } },
  });
  if (response.stop_reason === 'max_tokens') throw new Error(`Quality judge hit max_tokens (${response.usage.output_tokens} tokens)`);
  return JudgeSchema.parse(JSON.parse(replyText(response)));
};

/**
 * For each learner line the judge marked as lost, did the character's next
 * reply get shorter than the reply before it? (Code's half of "pulls back".)
 */
export function shorterAfterLost(turns: ScoredTurn[], lostLines: number[]): Map<number, boolean> {
  const out = new Map<number, boolean>();
  let n = 0;
  turns.forEach((t, i) => {
    if (t.who !== 'learner') return;
    n++;
    if (!lostLines.includes(n)) return;
    const before = [...turns.slice(0, i)].reverse().find((x) => x.who === 'npc');
    const after = turns.slice(i + 1).find((x) => x.who === 'npc');
    out.set(n, !!before && !!after && wordCount(after.text) < wordCount(before.text));
  });
  return out;
}

export async function scoreConversation(
  character: ScoredCharacter,
  turns: ScoredTurn[],
  judge: Judge = judgeWithClaude,
  opts: { beginner?: boolean } = {}
): Promise<ConversationScore> {
  const j = await judge(character, turns, opts);
  const shorter = shorterAfterLost(turns, j.lost.map((l) => l.line));
  return {
    judgeVersion: qualityPromptVersion(),
    ...(opts.beginner ? { beginner: true } : {}),
    learnerLines: turns.filter((t) => t.who === 'learner').length,
    stats: turnStats(turns.filter((t) => t.who === 'npc').map((t) => t.text)),
    lost: j.lost.map((l) => ({ line: l.line, shorter: shorter.get(l.line) ?? false, pulledBack: l.pulledBack })),
    judge: j,
    ...(phraseStats(turns) ? { phrases: phraseStats(turns) } : {}),
  };
}

// The column is added here the first time it's needed, so this ships without a
// manual migration on Railway (scripts/db-migrate.mjs has it too, for new databases).
let columnReady = false;
async function ensureColumn() {
  if (columnReady) return;
  await query('ALTER TABLE conversations ADD COLUMN IF NOT EXISTS quality jsonb');
  columnReady = true;
}

/** Save a conversation's score. Callers catch errors: scoring must never break anything. */
export async function saveConversationScore(conversationId: string, score: ConversationScore): Promise<void> {
  await ensureColumn();
  await query('UPDATE conversations SET quality = $1 WHERE id = $2', [JSON.stringify(score), conversationId]);
}
