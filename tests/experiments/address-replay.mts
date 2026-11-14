// D20 (docs/bugs.md B10): Ofelia called Josh "güerita", "mi reina", "verla" (71dc1d3b, 2026-11-13). Replays her
// turns at Beginner step 1 with the learner's address unknown and with "a man" (character.md {person}), N takes, and
// a judge says whether each reply addresses the listener as a woman.
//   COUNTRY=es-mx npx tsx --env-file=.env.local tests/experiments/address-replay.mts <snapshot.json> <id-prefix> <takes>
import { readFileSync } from 'node:fs';
import { characterForVisit } from '@/lib/characters/for-visit';
import { runTurn } from '@/lib/turn';
import { CLUSTER_1, frameBrief, pickSetup, setupLine } from '@/lib/beginner-2';
import { beatsBrief, noteOf, pickShapes } from '@/lib/shapes';
import type { Gender, Turn } from '@/lib/types';
import { ask, pool } from './common.mjs';

const [file, id, takes] = process.argv.slice(2);
type Saved = { id: string; city_id: string; place_id: string; turns: { who: 'npc' | 'learner'; text: string; en?: string; parts?: { kind: string; text: string }[]; beats?: string[] }[] };
const c = (JSON.parse(readFileSync(file, 'utf8')) as Saved[]).find((x) => x.id.startsWith(id))!;
const character = characterForVisit(c.city_id, c.place_id)!;
const schema = { type: 'object', additionalProperties: false, required: ['feminine', 'masculine'], properties: { feminine: { type: 'boolean' }, masculine: { type: 'boolean' } } };
const jobs: (() => Promise<{ as: string; feminine: boolean; masculine: boolean; line: string }>)[] = [];
for (const as of [undefined, 'm'] as (Gender | undefined)[]) for (let i = 1; i < c.turns.length; i++) {
  if (c.turns[i].who !== 'learner') continue;
  const transcript: Turn[] = c.turns.slice(0, i).map((t) => ({ who: t.who, transcript: t.text, ...(t.en ? { translation: t.en } : {}) }));
  const learnerSaid = c.turns[i].text;
  const beats = c.turns.find((t) => t.who === 'npc' && t.beats?.length)?.beats;
  const setup = pickSetup({ conversationId: c.id, turn: transcript.filter((t) => t.who === 'npc').length, learnerId: null, characterId: character.id, learnerSaid }, CLUSTER_1);
  for (let k = 0; k < Number(takes); k++) jobs.push(async () => {
    const r = await runTurn({ character, transcript, learnerSaid, addressedAs: as, brief: [frameBrief(CLUSTER_1), beatsBrief(beats)].filter(Boolean).join('\n\n'), note: noteOf(pickShapes({ learnerSaid }), setupLine(setup)), answers: setup.maxAnswers > 0, withDone: true });
    const j = JSON.parse(await ask(`A line of Spanish said to one person:\n${r.line}\n\nfeminine: it addresses or describes that person as a woman (a feminine ending, "reina", "güerita", "verla", "señora"…). masculine: as a man. Reply with JSON.`, { schema, max: 800 }));
    return { as: as ?? 'unknown', line: r.line, ...j };
  });
}
const rows = await pool(jobs, 6);
for (const as of ['unknown', 'm']) {
  const rs = rows.filter((r) => r.as === as);
  console.log(`address ${as}: feminine ${rs.filter((r) => r.feminine).length}/${rs.length} · masculine ${rs.filter((r) => r.masculine).length}/${rs.length}`);
  for (const r of rs.filter((x) => x.feminine)) console.log(`  - ${r.line.slice(0, 160)}`);
}
