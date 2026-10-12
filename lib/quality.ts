/**
 * Scoring one conversation for the dialogue scorecard (docs/10-testing.md →
 * "Dialogue quality"). Two parts:
 * - measured by code: reply length and questions (lib/dialogue-stats.ts), and
 *   whether the reply after each "I'm lost" line got shorter;
 * - counted by one Claude call (content/it/prompts/quality.md): pronunciation
 *   corrections, corrections asked for and unprompted, garbled lines missed,
 *   pulling back when lost, English nobody asked for.
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

export interface ScoredTurn {
  who: 'npc' | 'learner';
  text: string;
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
  note: z.string(),
});
export type QualityJudgement = z.infer<typeof JudgeSchema>;

export interface ConversationScore {
  /** Version of content/it/prompts/quality.md that judged it */
  judgeVersion: string;
  /** Learner lines in the conversation */
  learnerLines: number;
  stats: TurnStats;
  /** For each "I'm lost" line: was the next reply shorter than the one before (code), simpler and shorter (judge) */
  lost: { line: number; shorter: boolean; pulledBack: boolean }[];
  judge: QualityJudgement;
}

export function qualityPromptVersion(): string {
  return readPromptFile('quality.md').version;
}

export function buildQualityPrompt(character: ScoredCharacter, turns: ScoredTurn[]): { system: string; user: string } {
  const f = readPromptFile('quality.md');
  const values = {
    name: character.name,
    age: String(character.age),
    role: character.role,
    city: character.city,
    language: language.name,
  };
  let n = 0;
  const transcript = turns.map((t) => (t.who === 'npc' ? `${character.name}: ${t.text}` : `Person ${++n}: ${t.text}`)).join('\n');
  return { system: fill(f.block('System prompt'), values), user: fill(f.block('User message'), { ...values, transcript }) };
}

/** Counts the judged items. Tests pass a fake. */
export type Judge = (character: ScoredCharacter, turns: ScoredTurn[]) => Promise<QualityJudgement>;

export const judgeWithClaude: Judge = async (character, turns) => {
  const prompt = buildQualityPrompt(character, turns);
  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1024,
    system: prompt.system,
    messages: [{ role: 'user', content: prompt.user }],
    output_config: { format: { type: 'json_schema', schema: qualityOutputJsonSchema } },
  });
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
  judge: Judge = judgeWithClaude
): Promise<ConversationScore> {
  const j = await judge(character, turns);
  const shorter = shorterAfterLost(turns, j.lost.map((l) => l.line));
  return {
    judgeVersion: qualityPromptVersion(),
    learnerLines: turns.filter((t) => t.who === 'learner').length,
    stats: turnStats(turns.filter((t) => t.who === 'npc').map((t) => t.text)),
    lost: j.lost.map((l) => ({ line: l.line, shorter: shorter.get(l.line) ?? false, pulledBack: l.pulledBack })),
    judge: j,
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
