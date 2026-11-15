// The website is switched off (proxy.ts; Josh, 2026-10-26): only the app's
// /v1, admin and healthz are served; the web pages and web /api routes 404
import { NextRequest } from 'next/server';
import { served, levelUpIdInPath, proxy } from '../proxy';
import { levelUpConversationId, LEVEL_UP_ID_HEADER } from '../lib/level-up-address';

const failures: string[] = [];
for (const p of ['/v1/turn', '/v1/content', '/v1/conversations/abc/end', '/v1', '/api/admin/conversations', '/healthz']) {
  if (!served(p)) failures.push(`${p} should be served`);
}
for (const p of ['/', '/api/speak', '/api/turn', '/api/transcribe', '/api/visits', '/api/conversation/end', '/api/log', '/v1x', '/v10/turn', '/api/adminx', '/healthz/x', '/favicon.ico', '/_next/static/x.js']) {
  if (served(p)) failures.push(`${p} should be not found`);
}

// Builds up to 16 wrote the level up's "?" into the path (docs/bugs.md B33): the id is read out of it
const id = '5279b94e-7389-4328-92f5-99a23224df4a';
if (levelUpIdInPath(`/v1/level-up%3FconversationId=${id}`) !== id) failures.push('the level-up id should be read from an encoded "?" in the path');
if (levelUpIdInPath(`/v1/level-up%3fconversationId=${id}`) !== id) failures.push('the encoding in either case');
for (const p of ['/v1/level-up', '/v1/level-up%3FconversationId=not-an-id', '/v1/turn%3FconversationId=' + id, `/v1/level-up%3FconversationId=${id}/x`]) {
  if (levelUpIdInPath(p) !== null) failures.push(`${p} is not an old build's level-up request`);
}
// The whole proxy on such a request: rewritten to the real route with the id as its query
const rewritten = proxy(new NextRequest(`https://example.test/v1/level-up%3FconversationId=${id}`)).headers.get('x-middleware-rewrite');
if (rewritten !== `https://example.test/v1/level-up?conversationId=${id}`) failures.push(`an old build's level-up request should be rewritten to the route, got ${rewritten}`);
if (proxy(new NextRequest(`https://example.test/v1/level-up?conversationId=${id}`)).headers.get('x-middleware-rewrite')) failures.push('a correct level-up request should pass untouched');
// The route finds the id however the address was written: its request.url is the address as the app sent it, so the
// rewrite alone left the route answering 400 on the live server (2026-11-15)
if (levelUpConversationId(new Request(`https://example.test/v1/level-up?conversationId=${id}`)) !== id) failures.push('the id from the query');
if (levelUpConversationId(new Request(`https://example.test/v1/level-up%3FconversationId=${id}`)) !== id) failures.push('the id from an encoded "?" in the path, as the route sees an old build\'s request');
if (levelUpConversationId(new Request('https://example.test/v1/level-up', { headers: { [LEVEL_UP_ID_HEADER]: id } })) !== id) failures.push('the id from the header the proxy adds');
if (levelUpConversationId(new Request('https://example.test/v1/level-up')) !== '') failures.push('no id: empty');
if (!proxy(new NextRequest(`https://example.test/v1/level-up%3FconversationId=${id}`)).headers.get('x-middleware-override-headers')?.includes(LEVEL_UP_ID_HEADER)) failures.push('the proxy passes the id on as a header');


if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
console.log('OK: only /v1, /api/admin and /healthz are served; the website is not found');
