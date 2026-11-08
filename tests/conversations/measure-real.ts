/**
 * The conversation test's counts (measure.ts) on real play: the baseline the
 * simulated learner is checked against (Josh, 2026-11-08: "always capture
 * measurements"). A learner's conversations with one character, in order, are
 * that character's visits, so repeats across visits count the same way.
 *
 *   npm run measure:real                      # the last 200 recorded conversations
 *   npm run measure:real -- --since=2026-11-01 --limit=500
 *
 * Reads /api/admin/conversations (FUORI_URL, default production) with ADMIN_KEY
 * from .env.local. Only numbers are kept, in tests/conversations/runs/real.jsonl,
 * which git ignores: they come from the family's own conversations. No learner
 * ids, no words.
 */
import { measure, type Measures, type Visits } from './measure';
import { logLine } from './record';

const flag = (name: string) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=');

type Row = { id: string; learner_id: string; character_id: string; city_id: string; prompt_version: string; started_at: string; turns: { who: 'npc' | 'learner'; text: string }[] };

async function main() {
  const base = process.env.FUORI_URL ?? 'https://fuori-production.up.railway.app';
  const key = process.env.ADMIN_KEY;
  if (!key) throw new Error('ADMIN_KEY is not set (put it in .env.local)');
  const qs = new URLSearchParams({ limit: flag('limit') ?? '200', ...(flag('since') ? { since: flag('since')! } : {}) });
  const res = await fetch(`${base}/api/admin/conversations?${qs}`, { headers: { 'x-admin-key': key } });
  if (!res.ok) throw new Error(`admin endpoint: HTTP ${res.status}`);
  const rows = ((await res.json()) as Row[]).filter((r) => r.turns.some((t) => t.who === 'learner'));

  // One learner with one character, oldest first: the visits
  const groups = new Map<string, Row[]>();
  for (const r of rows) groups.set(`${r.learner_id}|${r.character_id}`, [...(groups.get(`${r.learner_id}|${r.character_id}`) ?? []), r]);
  const at = new Date().toISOString();
  const run = `${at.slice(0, 19).replace(/[:T]/g, '-')}-real`;
  const measured: { prompt: string; visits: number; m: Measures }[] = [];
  for (const [, g] of groups) {
    g.sort((a, b) => Date.parse(a.started_at) - Date.parse(b.started_at));
    const visits: Visits = g.map((r) => r.turns.map((t) => ({ who: t.who, text: t.text })));
    const m = measure(visits);
    // The prompt in force on the latest visit
    const prompt = g[g.length - 1].prompt_version;
    measured.push({ prompt, visits: visits.length, m });
    logLine({ run, at, label: 'real', versions: { character: prompt }, version: 'real', character: g[0].character_id, city: g[0].city_id, learner: { type: 'real' }, measures: { ...m, repeated: undefined } }, 'real.jsonl');
  }

  const avg = (xs: Measures[], k: keyof Measures) => (xs.reduce((a, m) => a + (m[k] as number), 0) / (xs.length || 1)).toFixed(2);
  const all = measured.map((x) => x.m);
  const returns = measured.filter((x) => x.visits > 1).map((x) => x.m);
  console.log(`${rows.length} conversations, ${groups.size} learner-and-character pairs (${returns.length} with return visits)`);
  console.log(`All: words per line ${avg(all, 'wordsPerLine')} · questions per line ${avg(all, 'questionsPerLine')} · learner share ${avg(all, 'learnerShare')}`);
  console.log(`Return visits: repeats per pair ${avg(returns, 'repeats')}`);
  for (const p of [...new Set(measured.map((x) => x.prompt))].sort()) {
    const ms = measured.filter((x) => x.prompt === p).map((x) => x.m);
    console.log(`  prompt ${p} (${ms.length}): words ${avg(ms, 'wordsPerLine')} · questions ${avg(ms, 'questionsPerLine')} · learner share ${avg(ms, 'learnerShare')}`);
  }
  console.log('→ numbers added to tests/conversations/runs/real.jsonl (not in git); no transcripts or learner ids kept');
}

main().catch((e) => { console.error(e); process.exit(1); });
