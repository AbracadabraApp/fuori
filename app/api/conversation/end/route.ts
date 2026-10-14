/**
 * POST /api/conversation/end { conversationId }
 *
 * Sent by the browser (navigator.sendBeacon) when the learner leaves a
 * conversation or the app goes to the background. Marks it ended, writes the
 * character's notes and the short review log (lib/remember.ts), then, when
 * that found new turns, the full Review Magda teaches from (lib/review.ts).
 * Safe to receive several times: both are only rewritten when there are new
 * turns. The beacon doesn't wait for the answer; the server finishes on its own.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getLearnerId } from '@/lib/learner';
import { markConversationEnded } from '@/lib/recording';
import { rememberConversation } from '@/lib/remember';
import { reviewConversation } from '@/lib/review';

export async function POST(request: NextRequest) {
  try {
    const { conversationId } = JSON.parse(await request.text());
    const learnerId = await getLearnerId();
    if (typeof conversationId === 'string' && learnerId) {
      await markConversationEnded(conversationId, learnerId);
      const memory = await rememberConversation(conversationId, learnerId);
      if (memory === 'saved') await reviewConversation(conversationId, learnerId);
    }
  } catch {
    // A beacon has no one to report to; problems are logged inside
  }
  return new NextResponse(null, { status: 204 });
}
