/**
 * The website is switched off (Josh, 2026-10-26): the server answers only
 * what the iPhone app and the tools need, and "not found" to everything else
 * (the web game's pages and its /api routes, which had no sign-in or rate
 * limits: /api/speak made voice from any text). The app calls /v1 only, and
 * its images come from R2. The web code stays in the repo, unused; deleting
 * this file brings the website back.
 *
 * Served: /v1/… (the app), /api/admin/… (admin key; the replay and the
 * experiments read it), /healthz (Railway's check).
 */
import { NextResponse, type NextRequest } from 'next/server';

export function served(pathname: string): boolean {
  return /^\/v1(\/|$)/.test(pathname) || /^\/api\/admin(\/|$)/.test(pathname) || pathname === '/healthz';
}

/**
 * App builds up to 16 ask for the level up at /v1/level-up%3FconversationId=<id>: the "?" was written into the path
 * and percent-encoded, so no route matched, the app got 404 and no level up was ever offered (docs/bugs.md B33;
 * fixed in the app after build 16). The conversation id out of such a path, so those builds get their offer too
 */
export function levelUpIdInPath(pathname: string): string | null {
  return /^\/v1\/level-up(?:%3F|\?)conversationId=([0-9a-f-]{36})$/i.exec(pathname)?.[1] ?? null;
}

export function proxy(request: NextRequest) {
  const levelUpId = levelUpIdInPath(request.nextUrl.pathname);
  if (levelUpId) {
    const url = request.nextUrl.clone();
    url.pathname = '/v1/level-up';
    url.search = `?conversationId=${levelUpId}`;
    return NextResponse.rewrite(url);
  }
  if (served(request.nextUrl.pathname)) return NextResponse.next();
  return new NextResponse('Not found', { status: 404, headers: { 'content-type': 'text/plain; charset=utf-8' } });
}
