/**
 * The conversation test's counts (measure.ts) on real play: the baseline the
 * simulated learner is checked against (Josh, 2026-11-08: "always capture
 * measurements"). A learner's conversations with one character, in order, are
 * that character's visits, so repeats across visits count the same way.
 * Place characters only (Intermediate and Beginner): Magda, lessons and
 * onboarding are left out unless Josh approves (2026-11-08).
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

/** What kind of conversation, from the prompt that ran it: only place characters compare with the simulated test (Josh, 2026-11-08: "avoid testing Magda or a lesson like a place character") */
function kindOf(prompt: string): string {
  if (/^\d{4}-\d{2}-\d{2}/.test(prompt)) return 'place character';
  if (prompt.startsWith('beginner-')) return 'place character, Beginner';
  return prompt.split('-')[0]; // magda, lesson, onboarding
}

type Row = { id: string; learner_id: string; character_id: string; city_id: string; prompt_version: string; started_at: string; turns: { who: 'npc' | 'learner'; text: string }[] };

async function main() {
  const base = process.env.FUORI_URL ?? 'https://fuori-production.up.railway.app';
  const key = process.env.ADMIN_KEY;
  if (!key) throw new Error('ADMIN_KEY is not set (put it in .env.local)');
  const qs = new URLSearchParams({ limit: flag('limit') ?? '200', ...(flag('since') ? { since: flag('since')! } : {}) });
  const res = await fetch(`${base}/api/admin/conversations?${qs}`, { headers: { 'x-admin-key': key } });
  if (!res.ok) throw new Error(`admin endpoint: HTTP ${res.status}`);
  // Place characters only: Magda, her lessons and onboarding aren't measured without Josh's approval (2026-11-08)
  const rows = ((await res.json()) as Row[]).filter((r) => r.turns.some((t) => t.who === 'learner') && kindOf(r.prompt_version).startsWith('place character'));

  // One learner with one character in one kind of conversation, oldest first: the visits
  const groups = new Map<string, Row[]>();
  for (const r of rows) { const k = `${r.learner_id}|${r.character_id}|${kindOf(r.prompt_version)}`; groups.set(k, [...(groups.get(k) ?? []), r]); }
  const at = new Date().toISOString();
  const run = `${at.slice(0, 19).replace(/[:T]/g, '-')}-real`;
  const measured: { prompt: string; kind: string; visits: number; m: Measures }[] = [];
  for (const [, g] of groups) {
    g.sort((a, b) => Date.parse(a.started_at) - Date.parse(b.started_at));
    const visits: Visits = g.map((r) => r.turns.map((t) => ({ who: t.who, text: t.text })));
    const m = measure(visits);
    // The prompt in force on the latest visit
    const prompt = g[g.length - 1].prompt_version;
    const kind = kindOf(prompt);
    measured.push({ prompt, kind, visits: visits.length, m });
    logLine({ run, at, label: 'real', kind, versions: { character: prompt }, version: 'real', character: g[0].character_id, city: g[0].city_id, learner: { type: 'real' }, measures: { ...m, repeated: undefined } }, 'real.jsonl');
  }

  const avg = (xs: Measures[], k: keyof Measures) => (xs.reduce((a, m) => a + (m[k] as number), 0) / (xs.length || 1)).toFixed(2);
  console.log(`${rows.length} conversations, ${groups.size} learner-and-character pairs`);
  for (const kind of [...new Set(measured.map((x) => x.kind))].sort()) {
    const ms = measured.filter((x) => x.kind === kind);
    const all = ms.map((x) => x.m), returns = ms.filter((x) => x.visits > 1).map((x) => x.m);
    console.log(`${kind} (${ms.length} pairs, ${returns.length} with return visits): words per line ${avg(all, 'wordsPerLine')} · questions per line ${avg(all, 'questionsPerLine')} · learner share ${avg(all, 'learnerShare')} · learner words per line ${avg(all, 'learnerWordsPerLine')}${returns.length ? ` · repeats per return pair ${avg(returns, 'repeats')}` : ''}`);
  }
  console.log('→ numbers added to tests/conversations/runs/real.jsonl (not in git); no transcripts or learner ids kept');
}

main().catch((e) => { console.error(e); process.exit(1); });
