/**
 * GET /api/learner/:id/latest-review
 *
 * Get the most recent Review for a learner.
 * Used by Magda to understand what to teach.
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import type { Review } from '@/lib/review-schema';
import { query } from '@/lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Review | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Learner ID required' });
  }

  try {
    // Get most recent review
    const result = await query(
      `SELECT review, ended_at
       FROM conversations
       WHERE learner_id = $1
         AND review IS NOT NULL
       ORDER BY ended_at DESC
       LIMIT 1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No reviews found for this learner' });
    }

    const review = result.rows[0].review as Review;

    return res.status(200).json(review);
  } catch (error) {
    console.error('Error fetching latest review:', error);
    return res.status(500).json({
      error: 'Failed to fetch review',
    });
  }
}
