/**
 * GET /api/learner/:id/visited-places?city={cityId}
 *
 * Returns visit counts for places in a city.
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Record<string, number> | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id: learnerId, city: cityId } = req.query;

  if (!learnerId || typeof learnerId !== 'string') {
    return res.status(400).json({ error: 'Learner ID required' });
  }

  try {
    // Get visit counts per place in this city
    let sql = `
      SELECT place_id, COUNT(*) as visit_count
      FROM conversations
      WHERE learner_id = $1
    `;
    const params: string[] = [learnerId];

    // Optional city filter
    if (cityId && typeof cityId === 'string') {
      sql += ` AND city_id = $2`;
      params.push(cityId);
    }

    sql += ` GROUP BY place_id`;

    const result = await query(sql, params);

    // Convert to { placeId: count }
    const visitCounts = Object.fromEntries(
      result.rows.map((r) => [r.place_id, parseInt(r.visit_count)])
    );

    return res.status(200).json(visitCounts);
  } catch (error) {
    console.error('Error fetching visited places:', error);
    return res.status(500).json({ error: 'Failed to fetch visited places' });
  }
}
