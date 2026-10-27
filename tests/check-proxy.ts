// The website is switched off (proxy.ts; Josh, 2026-10-26): only the app's
// /v1, admin and healthz are served; the web pages and web /api routes 404
import { served } from '../proxy';

const failures: string[] = [];
for (const p of ['/v1/turn', '/v1/content', '/v1/conversations/abc/end', '/v1', '/api/admin/conversations', '/healthz']) {
  if (!served(p)) failures.push(`${p} should be served`);
}
for (const p of ['/', '/api/speak', '/api/turn', '/api/transcribe', '/api/visits', '/api/conversation/end', '/api/log', '/v1x', '/v10/turn', '/api/adminx', '/healthz/x', '/favicon.ico', '/_next/static/x.js']) {
  if (served(p)) failures.push(`${p} should be not found`);
}

if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
console.log('OK: only /v1, /api/admin and /healthz are served; the website is not found');
