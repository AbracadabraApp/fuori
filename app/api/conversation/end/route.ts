/**
 * POST /api/conversation/end { conversationId }
 *
 * Sent by the browser (navigator.sendBeacon) when the learner leaves a
 * conversation or the app goes to the background. Marks it ended, then
 * writes the character's notes and the review log (lib/remember.ts). Safe to
 * receive several times: memory is only rewritten when there are new turns.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getLearnerId } from '@/lib/learner';
import { markConversationEnded } from '@/lib/recording';
import { rememberConversation } from '@/lib/remember';

export async function POST(request: NextRequest) {
  try {
    const { conversationId } = JSON.parse(await request.text());
    const learnerId = await getLearnerId();
    if (typeof conversationId === 'string' && learnerId) {
      await markConversationEnded(conversationId, learnerId);
      // The beacon doesn't wait for an answer; the server finishes this on its own
      await rememberConversation(conversationId, learnerId);
    }
  } catch {
    // A beacon has no one to report to; problems are logged inside
  }
  return new NextResponse(null, { status: 204 });
}
