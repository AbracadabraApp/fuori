/**
 * GET /api/visits?city=<cityId>
 *
 * How many conversations the current learner (cookie) has had at each place
 * in a city, as { placeId: count }. The feed shows a stamp on visited places.
 * A conversation counts once the learner has said something in it.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getLearnerId } from '@/lib/learner';
import { query } from '@/lib/db';
import { recordingEnabled } from '@/lib/recording';

export async function GET(request: NextRequest) {
  const city = new URL(request.url).searchParams.get('city');
  const learnerId = await getLearnerId();
  if (!learnerId || !city || !recordingEnabled()) return NextResponse.json({});
  try {
    const result = await query<{ place_id: string; visits: string }>(
      `SELECT place_id, COUNT(*) AS visits
       FROM conversations
       WHERE learner_id = $1 AND city_id = $2
         AND EXISTS (SELECT 1 FROM jsonb_array_elements(turns) t WHERE t->>'who' = 'learner')
       GROUP BY place_id`,
      [learnerId, city]
    );
    return NextResponse.json(Object.fromEntries(result.rows.map((r) => [r.place_id, Number(r.visits)])), {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    console.error(JSON.stringify({ level: 'error', where: 'visits', message: err instanceof Error ? err.message : String(err) }));
    return NextResponse.json({});
  }
}
