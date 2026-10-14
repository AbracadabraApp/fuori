/**
 * Review (M2): a detailed analysis of each conversation, written when it ends.
 * Level with evidence, error patterns, structures the learner avoids, where
 * they got stuck, every content word, tense usage, suggested focus and
 * strengths. Magda teaches from the latest one (lib/prompts/build-tutor-prompt.ts);
 * the study export will read the vocabulary.
 *
 * Prompt: content/<country>/prompts/review.md. Stored in conversations.analysis
 * (not `review`, which holds the short M1 review log written with memory).
 *
 * Like memory, this never throws to its caller: problems are logged and the
 * conversation simply has no Review.
 *
 * Server-side only.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { anthropic, CLAUDE_MODEL, replyText } from './claude';
import { query } from './db';
import { pack } from '@/content';
import type { Review } from './review-schema';
import type { ConversationTurn } from './memory';

/** How many earlier Reviews the analysis sees, for patterns across conversations */
const RECENT_REVIEWS = 9;

interface ConversationData {
  id: string;
  characterId: string;
  placeId: string;
  cityId: string;
  turns: ConversationTurn[];
  endedAt: Date;
}

/** Writes the Review from a transcript and earlier Reviews. Tests pass a fake. */
export type ReviewWriter = (conversation: ConversationData, recentReviews: Review[]) => Promise<Review>;

export const writeReviewWithClaude: ReviewWriter = async (conversation, recentReviews) => {
  const systemPrompt = readFileSync(join(process.cwd(), 'content', pack.id, 'prompts', 'review.md'), 'utf-8');
  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 16000, // the vocabulary list is long
    system: systemPrompt,
    messages: [{ role: 'user', content: buildReviewPrompt(conversation, recentReviews) }],
  });
  // The prompt asks for pure JSON; strip a code fence if one comes back anyway
  const text = replyText(response).replace(/^[\s\S]*?```(?:json)?\s*\n/, '').replace(/\n```[\s\S]*$/, '').trim();
  return unwrapSections(JSON.parse(text)) as unknown as Review;
};

/**
 * review.md shows each section as its own JSON example ({ "patterns": [...] }),
 * so replies often nest a section inside a key of the same name:
 * "patterns": { "patterns": [...] }. Lift those back up.
 */
export function unwrapSections(review: Record<string, unknown>): Record<string, unknown> {
  for (const [key, value] of Object.entries(review)) {
    if (value && typeof value === 'object' && !Array.isArray(value) && key in (value as object)) {
      review[key] = (value as Record<string, unknown>)[key];
    }
  }
  return review;
}

/**
 * Write and store the Review for a conversation. Called when a conversation
 * ends, after memory. Rewrites it if the conversation has gained turns since
 * (a reopened conversation). Returns whether a Review was saved.
 */
export async function reviewConversation(
  conversationId: string,
  learnerId: string,
  write: ReviewWriter = writeReviewWithClaude
): Promise<boolean> {
  try {
    const conversation = await loadConversation(conversationId, learnerId);
    // Magda's lessons aren't reviewed: they're practice, not conversations around town
    if (!conversation || conversation.characterId === pack.tutor.id) return false;
    const recent = await recentReviews(learnerId, conversationId);
    const review = await write(conversation, recent);
    review.metadata = {
      analyzedConversations: recent.length + 1,
      conversationId,
      dateRange: conversation.endedAt.toISOString().split('T')[0],
      totalTurns: conversation.turns.length,
      learnerTurns: conversation.turns.filter((t) => t.who === 'learner').length,
    };
    await query('UPDATE conversations SET analysis = $1, reviewed_at = now() WHERE id = $2 AND learner_id = $3', [
      JSON.stringify(review),
      conversationId,
      learnerId,
    ]);
    console.log(JSON.stringify({ level: 'info', event: 'review', conversationId, reviewLevel: review.level }));
    return true;
  } catch (err) {
    console.error(JSON.stringify({ level: 'error', where: 'review', conversationId, message: err instanceof Error ? err.message : String(err) }));
    return false;
  }
}

/** The learner's most recent Review (what Magda teaches from), or null. */
export async function latestReview(learnerId: string): Promise<Review | null> {
  const result = await query<{ analysis: Review }>(
    `SELECT analysis FROM conversations
     WHERE learner_id = $1 AND analysis IS NOT NULL
     ORDER BY reviewed_at DESC LIMIT 1`,
    [learnerId]
  );
  return result.rows[0]?.analysis ?? null;
}

async function loadConversation(conversationId: string, learnerId: string): Promise<ConversationData | null> {
  const result = await query<{ id: string; character_id: string; place_id: string; city_id: string; turns: ConversationTurn[]; ended_at: Date | null }>(
    'SELECT id, character_id, place_id, city_id, turns, ended_at FROM conversations WHERE id = $1 AND learner_id = $2',
    [conversationId, learnerId]
  );
  const row = result.rows[0];
  if (!row) return null;
  return {
    id: row.id,
    characterId: row.character_id,
    placeId: row.place_id,
    cityId: row.city_id,
    turns: row.turns,
    endedAt: row.ended_at ?? new Date(),
  };
}

/** Earlier Reviews, oldest first, excluding this conversation's own. */
async function recentReviews(learnerId: string, exceptConversationId: string): Promise<Review[]> {
  const result = await query<{ analysis: Review }>(
    `SELECT analysis FROM conversations
     WHERE learner_id = $1 AND analysis IS NOT NULL AND id <> $2
     ORDER BY reviewed_at DESC LIMIT $3`,
    [learnerId, exceptConversationId, RECENT_REVIEWS]
  );
  return result.rows.map((r) => r.analysis).reverse();
}

/** The user message: who, where, the transcript, and a summary of recent Reviews. */
export function buildReviewPrompt(conversation: ConversationData, recentReviews: Review[]): string {
  const lines: string[] = [];

  lines.push('# Conversation to Analyze\n');
  lines.push(`**Character**: ${conversation.characterId}`);
  lines.push(`**Place**: ${conversation.placeId} (${conversation.cityId})`);
  lines.push(`**Date**: ${conversation.endedAt.toISOString().split('T')[0]}`);
  lines.push(`**Turns**: ${conversation.turns.length}\n`);

  lines.push('## Transcript\n');
  for (const turn of conversation.turns) {
    lines.push(`**${turn.who === 'learner' ? 'Learner' : 'Character'}**: ${turn.text}`);
    if (turn.en && turn.en !== turn.text) lines.push(`  _(${turn.en})_`);
    lines.push('');
  }

  if (recentReviews.length > 0) {
    lines.push('\n## Recent Conversation History\n');
    lines.push(`You have access to ${recentReviews.length} previous Reviews from recent conversations:`);
    lines.push('');
    for (const review of recentReviews.slice(-3)) {
      lines.push(`### ${review.metadata?.dateRange ?? ''}`);
      lines.push(`Level: ${review.level}`);
      if (review.patterns?.length) lines.push(`Top patterns: ${review.patterns.slice(0, 3).map((p) => p.type).join(', ')}`);
      if (review.missingStructures?.length) lines.push(`Missing: ${review.missingStructures.map((s) => s.structure).join(', ')}`);
      lines.push('');
    }
    lines.push('Use this history to identify **persistent patterns** across multiple conversations.');
    lines.push('');
  }

  lines.push('\n---\n\nGenerate the Review as a JSON object following the schema in the system prompt.');
  return lines.join('\n');
}

/** Words in a line of text */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).length;
}

/** Errors per 100 words */
export function calculateErrorRate(errorCount: number, totalWords: number): number {
  return (errorCount / totalWords) * 100;
}
