/**
 * POST /api/conversation/:id/review
 *
 * Generate Review analysis for a conversation.
 * Called automatically when conversation ends.
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { generateReview } from '@/lib/review';
import type { Review } from '@/lib/review-schema';
import { query } from '@/lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Review | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Conversation ID required' });
  }

  try {
    // Get conversation data
    const conversationResult = await query(
      `SELECT
        id, character_id, place_id, city_id,
        started_at, ended_at, turns
       FROM conversations
       WHERE id = $1`,
      [id]
    );

    if (conversationResult.rows.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const conv = conversationResult.rows[0];

    // Get recent reviews for pattern detection (last 9 conversations)
    const learnerResult = await query(
      `SELECT learner_id FROM conversations WHERE id = $1`,
      [id]
    );
    const learnerId = learnerResult.rows[0]?.learner_id;

    let recentReviews: Review[] = [];
    if (learnerId) {
      const reviewsResult = await query(
        `SELECT review
         FROM conversations
         WHERE learner_id = $1
           AND id != $2
           AND review IS NOT NULL
           AND ended_at < (SELECT ended_at FROM conversations WHERE id = $2)
         ORDER BY ended_at DESC
         LIMIT 9`,
        [learnerId, id]
      );
      recentReviews = reviewsResult.rows
        .map((r) => r.review as Review)
        .reverse(); // Oldest first
    }

    // Generate review
    const review = await generateReview({
      conversation: {
        id: conv.id,
        characterId: conv.character_id,
        placeId: conv.place_id,
        cityId: conv.city_id,
        turns: conv.turns,
        startedAt: new Date(conv.started_at),
        endedAt: new Date(conv.ended_at),
      },
      recentReviews,
    });

    // Store review with conversation
    await query(
      `UPDATE conversations
       SET review = $1, reviewed_at = NOW()
       WHERE id = $2`,
      [JSON.stringify(review), id]
    );

    return res.status(200).json(review);
  } catch (error) {
    console.error('Review generation error:', error);
    return res.status(500).json({
      error: 'Failed to generate review',
    });
  }
}
