/**
 * GET /api/visits?city=<cityId>
 *
 * How many conversations the current learner (cookie) has had at each place
 * in a city, as { placeId: count }. The feed shows a stamp on visited places.
 * A conversation counts once the learner has said something in it.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getLearnerId } from '@/lib/learner';
import { visitCounts } from '@/lib/visits';
import { recordingEnabled } from '@/lib/recording';

export async function GET(request: NextRequest) {
  const city = new URL(request.url).searchParams.get('city');
  const learnerId = await getLearnerId();
  if (!learnerId || !city || !recordingEnabled()) return NextResponse.json({});
  try {
    return NextResponse.json(await visitCounts(learnerId, city), {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    console.error(JSON.stringify({ level: 'error', where: 'visits', message: err instanceof Error ? err.message : String(err) }));
    return NextResponse.json({});
  }
}
