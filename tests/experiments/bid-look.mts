// A look, not a test (Josh, 2026-11-16: "just an experiment"): does a bid added to the learner's answer change the
// character's next turn? Takes moments from saved visits (A: the character's question, B: the learner's answer,
// C: what the character said next), replays each at the same point of the visit with B as it was and with B + a bid,
// under the turn note C had, and prints C beside the new replies. No memory of earlier visits is given.
// The moments file holds learners' own lines, so it lives outside git:
//   [{ conv, turn, bids: ["…", "…"] }], with the saved visits beside it.
// Usage: COUNTRY=es-mx npx tsx --env-file=<env> tests/experiments/bid-look.mts <visits.json> <moments.json>
import { readFileSync } from 'node:fs';
import { characterForVisit } from '@/lib/characters/for-visit';
import { runTurn } from '@/lib/turn';
import { CLUSTERS, GOODBYE, IDIOM, OPENER, frameBrief, setupLine } from '@/lib/beginner-2';
import type { Turn } from '@/lib/types';

interface Saved { who: 'npc' | 'learner'; text: string; en?: string; steps?: { setup?: string; cluster?: number } }
const visits: { id: string; city_id: string; place_id: string; turns: Saved[] }[] = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const moments: { conv: string; turn: number; bids: string[] }[] = JSON.parse(readFileSync(process.argv[3], 'utf8'));

const out = await Promise.all(moments.map(async (m, n) => {
  const v = visits.find((x) => x.id.startsWith(m.conv))!;
  const [a, b, c] = v.turns.slice(m.turn, m.turn + 3);
  if (a?.who !== 'npc' || b?.who !== 'learner' || c?.who !== 'npc') throw new Error(`moment ${n + 1}: not question, answer, reply`);
  const character = characterForVisit(v.city_id, v.place_id)!;
  const cluster = CLUSTERS[(c.steps?.cluster ?? 1) - 1];
  const setup = [OPENER, GOODBYE, IDIOM, ...cluster].find((s) => s.id === c.steps?.setup);
  if (!setup) throw new Error(`moment ${n + 1}: no note called ${c.steps?.setup}`);
  const transcript: Turn[] = v.turns.slice(0, m.turn + 1).map((t) => (t.who === 'npc' ? { who: 'npc', transcript: t.text, translation: t.en } : { who: 'learner', transcript: t.text }));
  const play = async (learnerSaid: string) => {
    const r = await runTurn({ character, transcript, learnerSaid, brief: frameBrief(cluster), note: setupLine(setup), answers: true, withDone: true });
    return `${r.line}\n        bubbles: ${(r.answers ?? []).map((x) => x.text).join(' | ')}`;
  };
  const [again, ...withBid] = await Promise.all([play(b.text), ...m.bids.map((bid) => play(`${b.text} ${bid}`))]);
  return [
    `== ${n + 1}. ${character.name} · step ${c.steps?.cluster} · note: ${setup.id}`,
    `A: ${a.text}`,
    `B: ${b.text}`,
    `C (in the visit): ${c.text}`,
    `C (B again, today): ${again}`,
    ...m.bids.map((bid, i) => `D${i + 1} (B + "${bid}"): ${withBid[i]}`),
  ].join('\n');
}));
console.log(out.join('\n\n'));
