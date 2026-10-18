// The level check (lib/learner-level.ts) on real learners, for Josh to compare
// with his own judgement: each learner's first conversations from the admin
// export, judged as the check would after each of them. The export has no
// onboarding answers, so this judges from conversations alone (the stronger
// signal in round 14).
//   curl -H "x-admin-key: $ADMIN_KEY" "https://fuori-production.up.railway.app/api/admin/conversations?limit=200" > tests/experiments/out/admin.json
//   npx tsx --env-file=.env.local tests/experiments/learner-levels.mts tests/experiments/out/admin.json   (COUNTRY as needed)
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { cities, pack, tutor } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';
import { conversationsToCheck, judgeLearnerLevel, LEVEL_CHECKS } from '@/lib/learner-level';
import { OUT, pool } from './common.mjs';

type Row = { id: string; learner_id?: string; character_id: string; city_id: string; started_at: string; turns: { who: 'npc' | 'learner'; text: string }[] };
const rows = (JSON.parse(readFileSync(process.argv[2], 'utf8')) as Row[]);
if (!rows.some((r) => r.learner_id)) throw new Error('The export has no learner_id (it was added to /api/admin/conversations on 2026-10-18; export again)');
const here = new Set(cities.map((c) => c.id));
const name = (r: Row) => { const city = cities.find((c) => c.id === r.city_id); const place = city?.places.find((p) => p.characterId === r.character_id); return (city && place && characterForPlace(city, place)?.name) || r.character_id; };
const byLearner = new Map<string, Row[]>();
for (const r of rows.filter((r) => here.has(r.city_id) && r.character_id !== tutor.id && r.learner_id).sort((a, b) => a.started_at.localeCompare(b.started_at))) byLearner.set(r.learner_id!, [...(byLearner.get(r.learner_id!) ?? []), r]);

const results = await pool([...byLearner].map(([learner, convs]) => async () => {
  const eligible = convs.filter((c) => c.turns.filter((t) => t.who === 'learner').length >= 2);
  const steps: string[] = [];
  for (const c of eligible.slice(0, LEVEL_CHECKS)) {
    const picked = conversationsToCheck(convs, c.id);
    const j = await judgeLearnerLevel([], picked.map((p) => ({ name: name(p), turns: p.turns })));
    steps.push(`${j.level} (${j.reason})`);
  }
  const sample = eligible[0]?.turns.filter((t) => t.who === 'learner').slice(0, 3).map((t) => t.text).join(' / ') ?? '';
  return { learner, conversations: convs.length, steps, sample };
}), 4);
const md = [`# Level check on real learners (${pack.id})`, '', ...results.filter((r) => r.steps.length).flatMap((r) => [`### ${r.learner.slice(0, 8)} · ${r.conversations} conversations`, '', `Their first lines: ${r.sample}`, '', ...r.steps.map((s, i) => `- After conversation ${i + 1}: ${s}`), ''])].join('\n');
const file = join(OUT, `learner-levels-${pack.id}.md`);
writeFileSync(file, md);
console.log(`${pack.id} · ${results.filter((r) => r.steps.length).length} learners with a conversation long enough · ${results.filter((r) => r.steps.length).map((r) => `${r.learner.slice(0, 8)}: ${r.steps.map((s) => s.split(' ')[0][0]).join('→')}`).join(' · ')} → ${file.replace(process.cwd() + '/', '')}`);
