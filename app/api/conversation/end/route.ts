/**
 * POST /api/conversation/end { conversationId }
 *
 * Sent by the browser (navigator.sendBeacon) when the learner leaves a
 * conversation or the app goes to the background. Marks it ended, then writes
 * the character's notes and learning notes and updates Magda's study file
 * (lib/remember.ts). Safe to receive several times: only rewritten when there
 * are new turns. The beacon doesn't wait for the answer; the server finishes
 * on its own.
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
      await rememberConversation(conversationId, learnerId);
    }
  } catch {
    // A beacon has no one to report to; problems are logged inside
  }
  return new NextResponse(null, { status: 204 });
}
