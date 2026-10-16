/**
 * GET /v1/content → the country's cities, places, people, language words and
 * image addresses (lib/content-api.ts). No sign-in needed: it's what anyone
 * opening the app sees. The app keeps a copy and refreshes it when `version`
 * changes.
 */
import { buildContent, type Content } from '@/lib/content-api';
import { serverError } from '@/lib/api';
import { upgradeRequired } from '@/lib/app-version';

// Content only changes with a deploy, so build it once per server start
let cached: Content | null = null;

export async function GET(request: Request) {
  const tooOld = upgradeRequired(request);
  if (tooOld) return tooOld;
  try {
    cached ??= buildContent();
    return Response.json(cached, { headers: { 'cache-control': 'public, max-age=300', vary: 'x-app-version', etag: `"${cached.version}"` } });
  } catch (err) {
    return serverError(request, 'v1 content', err);
  }
}
