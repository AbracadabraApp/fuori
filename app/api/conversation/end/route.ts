/**
 * POST /api/conversation/end { conversationId }
 *
 * Sent by the browser (navigator.sendBeacon) when the learner leaves a
 * conversation. Marks it ended. Later (M1 memory) this is where the
 * character's notes and the review log will be written.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getLearnerId } from '@/lib/learner';
import { markConversationEnded } from '@/lib/recording';

export async function POST(request: NextRequest) {
  try {
    const { conversationId } = JSON.parse(await request.text());
    const learnerId = await getLearnerId();
    if (typeof conversationId === 'string' && learnerId) {
      await markConversationEnded(conversationId, learnerId);
    }
  } catch {
    // A beacon has no one to report to; recording problems are logged inside
  }
  return new NextResponse(null, { status: 204 });
}
