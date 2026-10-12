/**
 * GET /api/admin/conversations?key=…&limit=20&format=text
 *
 * Recent recorded conversations, for reviewing real play (prompt quality,
 * reply length, what Whisper heard). Locked by the ADMIN_KEY variable in
 * Railway: without it set, this route doesn't exist (404). format=text gives
 * plain transcripts that are easy to read on a phone and paste into a chat;
 * the default is JSON.
 */
import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { recentConversations, conversationAsText, recordingEnabled } from '@/lib/recording';

function allowed(given: string | null): boolean {
  const key = process.env.ADMIN_KEY;
  if (!key || !given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(key);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const given = request.headers.get('x-admin-key') ?? url.searchParams.get('key');
  if (!allowed(given) || !recordingEnabled()) {
    return new NextResponse('Not found', { status: 404 });
  }
  const limit = Number(url.searchParams.get('limit') ?? 20) || 20;
  const conversations = await recentConversations(limit);
  if (url.searchParams.get('format') === 'text') {
    return new NextResponse(conversations.map(conversationAsText).join('\n\n----\n\n') || 'No conversations yet.', {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }
  return NextResponse.json(conversations, { headers: { 'Cache-Control': 'no-store' } });
}
