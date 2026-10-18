// Real conversations re-judged with today's quality judge (round 15): reads the
// admin export, keeps one country's conversations with 2+ learner lines on one
// prompt version, judges each twice, and writes them as a report so
// question-kinds.mts and line-level.mts can read them too.
//   curl -H "x-admin-key: $ADMIN_KEY" "https://fuori-production.up.railway.app/api/admin/conversations?limit=200" > tests/experiments/out/admin.json
//   npx tsx --env-file=.env.local tests/experiments/real-conversations.mts tests/experiments/out/admin.json <prompt version>   (COUNTRY as needed)
// Both services share one database, so the export holds both countries; the city decides.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { judgeWithClaude } from '@/lib/quality';
import { cities, pack } from '@/content';
import { OUT, mean, pool } from './common.mjs';

type Row = { id: string; character_id: string; city_id: string; prompt_version: string; started_at: string; turns: { who: string; text: string }[] };
const [input, version] = process.argv.slice(2);
const here = new Set(cities.map((c) => c.id));
const rows = (JSON.parse(readFileSync(input, 'utf8')) as Row[]).filter((x) => x.prompt_version === version && here.has(x.city_id) && x.turns.filter((t) => t.who === 'learner').length >= 2);
const res = await pool(rows.map((x) => async () => {
  const turns = x.turns.map((t) => ({ who: (t.who === 'learner' ? 'learner' : 'npc') as 'npc' | 'learner', text: t.text }));
  const js = (await Promise.all([0, 1].map(() => judgeWithClaude({ name: x.character_id, age: 40, role: '', city: x.city_id }, turns).catch(() => null)))).filter((j): j is NonNullable<typeof j> => !!j);
  return { ...x, turns, alive: mean(js.map((j) => j.alive ?? 0)), notes: js.map((j) => j.note) };
}));
const file = join(OUT, `real-${pack.id}-${version}`);
writeFileSync(`${file}.json`, JSON.stringify(res, null, 1));
writeFileSync(`${file}.md`, [`# Real conversations, ${pack.id}, prompt ${version}`, '', ...res.sort((a, b) => a.alive - b.alive).flatMap((r) => [
  `### ${r.character_id} (${r.city_id}) · alive ${r.alive.toFixed(1)}`, '', `_${r.notes[0] ?? ''}_`, '', '```', ...r.turns.map((t) => `${t.who === 'npc' ? r.character_id : 'Learner'}: ${t.text}`), '```', '',
])].join('\n'));
console.log(`${pack.id} · prompt ${version} · ${res.length} conversations · alive ${mean(res.map((r) => r.alive)).toFixed(2)} · alive 5 or below ${res.filter((r) => r.alive <= 5).length} → ${file.replace(process.cwd() + '/', '')}.md (lowest first)`);
