/**
 * GET /api/admin/conversations?key=…&limit=20&since=2026-10-12T00:00Z&format=text
 * (or send the key in an x-admin-key header)
 *
 * Recent recorded conversations, for reviewing real play (prompt quality,
 * reply length, what Whisper heard). Locked by the ADMIN_KEY variable in
 * Railway: without it set, this route doesn't exist (404). format=text gives
 * plain transcripts that are easy to read on a phone and paste into a chat;
 * the default is JSON. format=scorecard gives the dialogue scorecard
 * (lib/scorecard.ts) for the scored conversations, one block per prompt version.
 * format=study&learner=<id>&since=…&until=… gives the study export for one
 * learner (lib/study-export.ts, docs/study-export-demo.md): a Markdown file
 * for Gemini Notebook, by default the last 14 days. format=learners lists
 * learner ids by number of conversations, to find whose export to make.
 * format=errors&since=…&limit=50 lists the iPhone app's error reports, every
 * country, newest first (lib/app-errors.ts).
 */
import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { recentConversations, conversationAsText, conversationStats, recordingEnabled } from '@/lib/recording';
import { scorecard, scorecardAsText } from '@/lib/scorecard';
import type { ConversationScore } from '@/lib/quality';
import { learnersWithConversations, loadStudyExport, studyExportMarkdown } from '@/lib/study-export';
import { recentAppErrors, appErrorsAsText } from '@/lib/app-errors';

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
  if (url.searchParams.get('format') === 'learners') {
    return new NextResponse((await learnersWithConversations()) || 'No conversations yet.', {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }
  if (url.searchParams.get('format') === 'errors') {
    const since = url.searchParams.get('since');
    const rows = await recentAppErrors(Number(url.searchParams.get('limit') ?? 50) || 50, since && !isNaN(Date.parse(since)) ? new Date(since) : undefined);
    return new NextResponse(appErrorsAsText(rows) || 'No app errors.', {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }
  if (url.searchParams.get('format') === 'study') {
    const learner = url.searchParams.get('learner') ?? '';
    if (!/^[0-9a-f-]{36}$/.test(learner)) return new NextResponse('learner=<learner id> is required', { status: 400 });
    const date = (name: string, fallback: Date) => {
      const v = url.searchParams.get(name);
      return v && !isNaN(Date.parse(v)) ? new Date(v) : fallback;
    };
    const to = date('until', new Date());
    const from = date('since', new Date(to.getTime() - 14 * 86400_000));
    const md = studyExportMarkdown(await loadStudyExport(learner, from, to));
    return new NextResponse(md, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `attachment; filename="study-export-${from.toISOString().slice(0, 10)}-to-${to.toISOString().slice(0, 10)}.md"`,
        'Cache-Control': 'no-store',
      },
    });
  }
  const limit = Number(url.searchParams.get('limit') ?? 20) || 20;
  const sinceParam = url.searchParams.get('since');
  const since = sinceParam && !isNaN(Date.parse(sinceParam)) ? new Date(sinceParam) : undefined;
  const conversations = await recentConversations(limit, since);
  if (url.searchParams.get('format') === 'scorecard') {
    const scored = conversations.filter((c) => c.quality);
    const versions = [...new Set(scored.map((c) => c.prompt_version))];
    const text = versions
      .map((v) => scorecardAsText(`Prompt ${v}`, scorecard(scored.filter((c) => c.prompt_version === v).map((c) => c.quality as ConversationScore))))
      .join('\n\n');
    return new NextResponse(text || 'No scored conversations yet.', {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }
  if (url.searchParams.get('format') === 'text') {
    return new NextResponse(conversations.map(conversationAsText).join('\n\n----\n\n') || 'No conversations yet.', {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }
  return NextResponse.json(
    conversations.map((c) => ({ ...c, stats: conversationStats(c) })),
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
