// Learn 2.0's writer on real visits (docs/learn-sheet-2-design.md → The source, redesigned): conversations cut where the
// game starts the writer (the turn before the wind-down), each sent to it as the game would. Prints every card written
// for a visit and the one code picks, with the kinds picked for the visits before (in order, per learner) counted as
// recent, so the variety can be read across a run, not judged.
//   COUNTRY=es-mx npx tsx --env-file=.env.local scripts/learn-card-replay.mts --archive=<file.json> [--ids=4335c671,78e59d51] [visits, default 10]
//   (or with no --archive, the live server's admin route; ADMIN_KEY in .env.local)
import { readFileSync } from 'node:fs';
import { pack, cities } from '@/content';
import { characterForVisit } from '@/lib/characters/for-visit';
import { aboutOf, cardFrom, NOT_AGAIN_FOR, pickKind, startAt, writeCards } from '@/lib/learn-card-writer';
import type { LearnCard } from '@/lib/learn-card';
import type { Turn } from '@/lib/types';

const arg = (k: string) => process.argv.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3);
const n = Number(process.argv.slice(2).find((a) => /^\d+$/.test(a)) ?? 10);
type Conv = { id: string; learner_id: string; started_at: string; character_id: string; city_id: string | null; place_id: string | null; prompt_version: string | null; turns: { who: 'npc' | 'learner'; text: string; idiom?: string }[] };
let all: Conv[];
const archive = arg('archive');
if (archive) all = JSON.parse(readFileSync(archive, 'utf8')) as Conv[];
else {
  const base = pack.id === 'es-mx' ? 'https://afuera-production.up.railway.app' : 'https://fuori-production.up.railway.app';
  const key = process.env.ADMIN_KEY;
  if (!key) throw new Error('ADMIN_KEY is not set (put it in .env.local), or pass --archive=');
  const res = await fetch(`${base}/api/admin/conversations?limit=200`, { headers: { 'x-admin-key': key } });
  if (!res.ok) throw new Error(`admin endpoint: HTTP ${res.status}`);
  all = (await res.json()) as Conv[];
}
const ids = arg('ids')?.split(',');
const level = /beginner-2-/;
const start = startAt('beginner');
const visits = all
  .filter((c) => (ids ? ids.some((i) => c.id.startsWith(i)) : true))
  .filter((c) => c.city_id && c.place_id && level.test(c.prompt_version ?? '') && c.turns.filter((t) => t.who === 'npc').length > start + 1 && characterForVisit(c.city_id, c.place_id))
  .sort((a, b) => a.started_at.localeCompare(b.started_at))
  .slice(-n);

const out: string[] = [`# Learn card replay, ${pack.id}, ${visits.length} visits`];
const recentByLearner = new Map<string, string[]>();
const seenByLearner = new Map<string, string[]>();
const tally: Record<string, number> = {};
for (const c of visits) {
  // Cut where the game starts the writer: the transcript ends on the character's reply with `start` lines before it
  let npc = 0;
  const cut = c.turns.filter((t) => (npc > start ? false : (t.who === 'npc' && npc++, true)));
  const transcript: Turn[] = cut.map((t) => ({ who: t.who, transcript: t.text, ...(t.idiom ? { idiom: t.idiom } : {}) }));
  const character = characterForVisit(c.city_id!, c.place_id!)!;
  const cityName = cities.find((x) => x.id === c.city_id)?.name ?? c.city_id!;
  const written = await writeCards({ character, cityName, level: 'beginner', transcript });
  const cards = written.map((w) => cardFrom(w, c.id, 'beginner')).filter((x): x is LearnCard => x !== null);
  const recent = recentByLearner.get(c.learner_id) ?? [];
  const seen = seenByLearner.get(c.learner_id) ?? [];
  const picked = pickKind(cards, recent, seen);
  if (picked) {
    recentByLearner.set(c.learner_id, [picked.kind, ...recent].slice(0, NOT_AGAIN_FOR));
    seenByLearner.set(c.learner_id, [aboutOf(picked), ...seen]);
  }
  tally[picked?.kind ?? 'none'] = (tally[picked?.kind ?? 'none'] ?? 0) + 1;
  out.push(`\n## ${character.name}, ${character.role} (${c.city_id}/${c.place_id}) · ${c.id.slice(0, 8)}`);
  out.push(`written: ${written.map((w) => w.kind).join(', ') || 'none'}${written.length > cards.length ? ` (${written.length - cards.length} refused by the rules)` : ''} · recent: ${recent.join(', ') || 'none'} · **picked: ${picked?.kind ?? 'none'}**`);
  for (const k of cards) {
    out.push(`\n${k === picked ? '**▶ ' : ''}${k.headline}${k.term ? `: ${k.term}` : ''}${k === picked ? '**' : ''}`, ...k.rows.map((r) => (r.text ? `> ${r.text} | ${r.en}` : `> _${r.en}_`)), ...(k.note ? [`> _${k.note}_`] : []));
  }
}
out.splice(1, 0, Object.entries(tally).map(([k, v]) => `${k} ${v}`).join(' · '));
console.log(out.join('\n'));
