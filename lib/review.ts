/**
 * Review Generation - M2 Conversation Analysis
 *
 * Generates rich conversation analysis after each conversation ends.
 * Replaces simple M1 review log with comprehensive teaching data.
 */

import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { Review } from './review-schema';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ConversationTurn {
  speaker: 'learner' | 'character';
  line: string; // What they said (in target language)
  english: string;
  timestamp: Date;
}

interface ConversationData {
  id: string;
  characterId: string;
  placeId: string;
  cityId: string;
  turns: ConversationTurn[];
  startedAt: Date;
  endedAt: Date;
}

interface ReviewGenerationOptions {
  conversation: ConversationData;
  recentReviews?: Review[]; // Previous 9 reviews for pattern detection
  model?: string;
}

/**
 * Generate Review analysis for a conversation
 */
export async function generateReview(
  options: ReviewGenerationOptions
): Promise<Review> {
  const { conversation, recentReviews = [], model = 'claude-sonnet-4-5' } = options;

  // Load the review prompt
  const promptPath = join(process.cwd(), 'content/it/prompts/review.md');
  const systemPrompt = readFileSync(promptPath, 'utf-8');

  // Build the user message with conversation data
  const userMessage = buildReviewPrompt(conversation, recentReviews);

  // Call Claude
  const response = await anthropic.messages.create({
    model,
    max_tokens: 16000, // Rich analysis needs space
    temperature: 0.3, // Lower temp for consistent analysis
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: userMessage,
      },
    ],
  });

  // Extract and parse the JSON response
  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Expected text response from Claude');
  }

  // Parse the JSON (Claude should return pure JSON based on prompt)
  const review = JSON.parse(content.text) as Review;

  // Add metadata
  review.metadata = {
    analyzedConversations: recentReviews.length + 1,
    conversationId: conversation.id,
    dateRange:
      recentReviews.length > 0
        ? `${recentReviews[0].metadata.dateRange.split(' to ')[0]} to ${conversation.endedAt.toISOString().split('T')[0]}`
        : conversation.endedAt.toISOString().split('T')[0],
    totalTurns: conversation.turns.length,
    learnerTurns: conversation.turns.filter((t) => t.speaker === 'learner')
      .length,
  };

  return review;
}

/**
 * Build the prompt that contains conversation data
 */
function buildReviewPrompt(
  conversation: ConversationData,
  recentReviews: Review[]
): string {
  const lines: string[] = [];

  lines.push('# Conversation to Analyze\n');
  lines.push(`**Character**: ${conversation.characterId}`);
  lines.push(`**Place**: ${conversation.placeId} (${conversation.cityId})`);
  lines.push(
    `**Date**: ${conversation.endedAt.toISOString().split('T')[0]}`
  );
  lines.push(`**Turns**: ${conversation.turns.length}\n`);

  lines.push('## Transcript\n');
  for (const turn of conversation.turns) {
    const speaker = turn.speaker === 'learner' ? 'Learner' : 'Character';
    lines.push(`**${speaker}**: ${turn.line}`);
    if (turn.english !== turn.line) {
      lines.push(`  _(${turn.english})_`);
    }
    lines.push('');
  }

  // Add recent reviews if available (for pattern detection across conversations)
  if (recentReviews.length > 0) {
    lines.push('\n## Recent Conversation History\n');
    lines.push(
      `You have access to ${recentReviews.length} previous Reviews from recent conversations:`
    );
    lines.push('');

    for (const review of recentReviews.slice(-3)) {
      // Show last 3 in detail
      lines.push(`### ${review.metadata.dateRange}`);
      lines.push(`Level: ${review.level}`);
      if (review.patterns.length > 0) {
        lines.push(
          `Top patterns: ${review.patterns.slice(0, 3).map((p) => p.type).join(', ')}`
        );
      }
      if (review.missingStructures.length > 0) {
        lines.push(
          `Missing: ${review.missingStructures.map((s) => s.structure).join(', ')}`
        );
      }
      lines.push('');
    }

    lines.push(
      'Use this history to identify **persistent patterns** across multiple conversations.'
    );
    lines.push('');
  }

  lines.push(
    '\n---\n\nGenerate the Review as a JSON object following the schema in the system prompt.'
  );

  return lines.join('\n');
}

/**
 * Helper to count words in Italian text
 */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).length;
}

/**
 * Helper to calculate error rate per 100 words
 */
export function calculateErrorRate(
  errorCount: number,
  totalWords: number
): number {
  return (errorCount / totalWords) * 100;
}
