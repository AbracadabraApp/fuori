// Learn 2.0's writer on real visits (docs/learn-sheet-2-plan.md → Verification): recent conversations from
// the live server's admin route, cut at the wind-down turn as the game would, each sent to the writer with
// its shortlist. Prints each visit's lines beside the card chosen (pick, make or none), so how often a card
// fits the visit is counted by reading, not judged.
//   COUNTRY=it npx tsx --env-file=.env.local scripts/learn-card-replay.mts [visits, default 10]
import { pack } from '@/content';
import { characterForVisit } from '@/lib/characters/for-visit';
import { bank, CARD_LEVELS_FOR, cardFrom, shortlist, visitKeys, writeCard } from '@/lib/learn-card-writer';
import { ENDING_AT } from '@/lib/dialogue/ending';
import { cities } from '@/content';
import type { Turn } from '@/lib/types';

const n = Number(process.argv[2] ?? 10);
const base = pack.id === 'es-mx' ? 'https://afuera-production.up.railway.app' : 'https://fuori-production.up.railway.app';
const key = process.env.ADMIN_KEY;
if (!key) throw new Error('ADMIN_KEY is not set (put it in .env.local)');
const res = await fetch(`${base}/api/admin/conversations?limit=200`, { headers: { 'x-admin-key': key } });
if (!res.ok) throw new Error(`admin endpoint: HTTP ${res.status}`);
type Conv = { id: string; character_id: string; city_id: string | null; place_id: string | null; turns: { who: 'npc' | 'learner'; text: string; idiom?: string }[] };
const all = (await res.json()) as Conv[];
const windDown = ENDING_AT.beginner.windDown;
const visits = all.filter((c) => c.city_id && c.place_id && c.turns.filter((t) => t.who === 'npc').length >= windDown && characterForVisit(c.city_id, c.place_id)).slice(0, n);

const out: string[] = [`# Learn card replay, ${pack.id}, ${visits.length} visits`];
const tally = { pick: 0, make: 0, none: 0, refused: 0 };
for (const c of visits) {
  // Cut where the game starts the writer: the character's wind-down reply
  let npc = 0;
  const cut = c.turns.filter((t) => (npc >= windDown ? false : (t.who === 'npc' && npc++, true)));
  const transcript: Turn[] = cut.map((t) => ({ who: t.who, transcript: t.text, ...(t.idiom ? { idiom: t.idiom } : {}) }));
  const character = characterForVisit(c.city_id!, c.place_id!)!;
  const levels = CARD_LEVELS_FOR.beginner;
  const options = shortlist(bank(), levels, visitKeys(c.city_id!, c.place_id!, transcript));
  const cityName = cities.find((x) => x.id === c.city_id)?.name ?? c.city_id!;
  const raw = await writeCard({ character, cityName, level: 'beginner', transcript, options });
  const made = cardFrom(raw, options, c.id, levels);
  if (raw.choice !== 'none' && !made) tally.refused++; else tally[raw.choice]++;
  out.push(`\n## ${character.name}, ${character.role} (${c.city_id}/${c.place_id}) · ${c.id.slice(0, 8)}`);
  out.push(...cut.map((t) => `- ${t.who === 'npc' ? character.name.split(' ')[0] : 'Learner'}: ${t.text}`));
  out.push(`\n**${raw.choice}${raw.choice !== 'none' && !made ? ' (refused by the rules)' : ''}**`);
  if (made) {
    const k = made.card;
    out.push(`> ${k.headline}${k.term ? `: ${k.term}` : ''}`, ...k.rows.map((r) => `> ${r.text} | ${r.en}`), ...(k.note ? [`> ${k.note}`] : []), `> (${k.kind}; ${k.source.ref})`);
  }
}
out.splice(1, 0, `pick ${tally.pick} · make ${tally.make} · none ${tally.none} · refused ${tally.refused}`);
console.log(out.join('\n'));
