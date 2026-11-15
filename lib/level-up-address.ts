/**
 * App builds up to 16 ask for the level up at /v1/level-up%3FconversationId=<id>: the "?" was written into the path
 * and percent-encoded, so no route matched, the app got 404 and no level up was ever offered (docs/bugs.md B33;
 * fixed in the app after build 16). proxy.ts sends such a request on to the route. The first version of that
 * (2026-11-15) rewrote the address only, and the route still answered 400 on the live server: a route's
 * request.url is the address as the app sent it, not the rewritten one, so it found no conversationId (found by
 * scripts/walk-live.mjs the same day). So the route reads the id from wherever it is: the query, the encoded
 * path, or the header the proxy adds.
 */
export const LEVEL_UP_ID_HEADER = 'x-fuori-level-up-conversation';

/** The conversation id out of an old build's level-up path; null for any other path */
export function levelUpIdInPath(pathname: string): string | null {
  return /^\/v1\/level-up(?:%3F|\?)conversationId=([0-9a-f-]{36})$/i.exec(pathname)?.[1] ?? null;
}

/** The conversation a level-up request is about, however the app wrote the address; '' when there is none */
export function levelUpConversationId(request: Request): string {
  const url = new URL(request.url);
  return url.searchParams.get('conversationId') ?? levelUpIdInPath(url.pathname) ?? request.headers.get(LEVEL_UP_ID_HEADER) ?? '';
}
