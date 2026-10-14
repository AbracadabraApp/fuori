/**
 * POST /api/conversation/end { conversationId }
 *
 * Sent by the browser (navigator.sendBeacon) when the learner leaves a
 * conversation or the app goes to the background. Marks it ended, then
 * writes the character's notes and review log (lib/remember.ts), then
 * generates M2 Review analysis. Safe to receive several times: memory is
 * only rewritten when there are new turns, review only generated once.
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

      // M2: Generate Review analysis (fire-and-forget, idempotent)
      // Call internal API to generate review
      generateReviewAsync(conversationId).catch((error) => {
        console.error('Review generation failed:', conversationId, error);
        // Don't fail the conversation end - review can be generated later
      });
    }
  } catch {
    // A beacon has no one to report to; problems are logged inside
  }
  return new NextResponse(null, { status: 204 });
}

/**
 * Generate review asynchronously (fire-and-forget)
 * This allows the beacon response to return immediately
 */
async function generateReviewAsync(conversationId: string) {
  // Call the review API endpoint
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/api/conversation/${conversationId}/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Review generation failed: ${response.status}`);
  }
}
