// Why a Beginner turn comes back with no answers (bugs.md B1, B3; 2026-11-13): replays saved turns that had none,
// through the call take-turn makes at step 1, with the setup they played, and prints the character's raw answers.
// A check, not a card.
//   COUNTRY=es-mx npx tsx --env-file=.env.local tests/experiments/empty-answers.mts <snapshot.json> <id-prefix:turn>... [--takes=3]
import { readFileSync } from 'node:fs';
import { characterForVisit } from '@/lib/characters/for-visit';
import { runTurn } from '@/lib/turn';
import { CLUSTER_1, frameBrief, GOODBYE, OPENER, RUNGS, setupLine } from '@/lib/beginner-2';
import { beatsBrief, noteOf, pickShapes } from '@/lib/shapes';
import type { Turn } from '@/lib/types';

const args = process.argv.slice(2);
const takes = Number(args.find((a) => a.startsWith('--takes='))?.slice(8) ?? '3');
const [file, ...targets] = args.filter((a) => !a.startsWith('--'));
const all = JSON.parse(readFileSync(file, 'utf8')) as { id: string; city_id: string; place_id: string; turns: { who: 'npc' | 'learner'; text: string; en?: string; parts?: { kind: string; text: string }[]; beats?: string[]; steps?: { setup?: string } }[] }[];
let empty = 0, total = 0;
for (const t of targets) {
  const [id, at] = t.split(':');
  const c = all.find((x) => x.id.startsWith(id))!;
  const character = characterForVisit(c.city_id, c.place_id)!;
  const i = Number(at);
  const transcript: Turn[] = c.turns.slice(0, i - 1).map((x) => ({ who: x.who, transcript: x.text, ...(x.en ? { translation: x.en } : {}), ...(x.beats?.length ? { beats: x.beats } : {}) }));
  const learnerSaid = c.turns[i - 1].text;
  const id2 = c.turns[i].steps?.setup;
  const setup = id2 === 'goodbye' ? GOODBYE : id2 === 'opener' ? OPENER : RUNGS.find((r) => r.id === id2)!;
  const beats = transcript.find((x) => x.who === 'npc' && x.beats?.length)?.beats;
  console.log(`\n=== ${id} turn ${i} · setup ${setup.id} · learner: "${learnerSaid}"`);
  for (let k = 0; k < takes; k++) {
    const r = await runTurn({ character, transcript, learnerSaid, brief: [frameBrief(CLUSTER_1), beatsBrief(beats)].filter(Boolean).join('\n\n'), note: noteOf(pickShapes({ learnerSaid }), setupLine(setup)), answers: setup.maxAnswers > 0, withDone: true });
    total++;
    if (!r.answers?.length) empty++;
    console.log(`  answers ${JSON.stringify(r.answers)} · done ${r.done}\n    ${r.line.slice(0, 160)}`);
  }
}
console.log(`\n${empty} of ${total} replies had no answers`);
