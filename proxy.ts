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

export function proxy(request: NextRequest) {
  if (served(request.nextUrl.pathname)) return NextResponse.next();
  return new NextResponse('Not found', { status: 404, headers: { 'content-type': 'text/plain; charset=utf-8' } });
}
