/**
 * GET /healthz → { ok, country, commit, promptVersion, contentVersion }
 *
 * For Railway's health check and for confirming what's deployed: 503 when
 * the database can't be reached.
 */
import { connection } from 'next/server';
import { country } from '@/content';
import { healthCheck } from '@/lib/db';
import { promptVersion } from '@/lib/prompts/build-turn-prompt';
import { buildContent } from '@/lib/content-api';

export async function GET() {
  await connection(); // checked at request time, never pre-rendered at build
  const db = await healthCheck();
  return Response.json(
    {
      ok: db,
      db,
      country,
      commit: process.env.RAILWAY_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
      promptVersion: promptVersion(),
      contentVersion: buildContent().version,
    },
    { status: db ? 200 : 503, headers: { 'cache-control': 'no-store' } }
  );
}
