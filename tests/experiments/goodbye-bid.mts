// D1 (docs/dialogue-plan.md; docs/learner-loop.md → bids for returns; Josh, 2026-11-14: "characters should make
// strong bids for returns - that is a goal"): does the goodbye carry an invitation from the character's world for
// next time, while staying a goodbye (done, no question)? Replays the learner's last line (their goodbye) of saved
// visits: Italy's through the Intermediate call, Mexico's Beginner visits through the step-1 call, N takes each.
// A judge reads each reply: a bid for next time (something concrete of theirs to show, do or tell), a question,
// a new topic. Run once on today's prompts, once on the new.
//   COUNTRY=it|es-mx npx tsx --env-file=.env.local tests/experiments/goodbye-bid.mts <snapshot.json> <takes> <id-prefix>...
import { readFileSync } from 'node:fs';
import { characterForVisit } from '@/lib/characters/for-visit';
import { runTurn } from '@/lib/turn';
import { CLUSTER_1, frameBrief, lineWithAnswers, pickSetup, setupLine } from '@/lib/beginner-2';
import { beatsBrief, noteOf, pickShapes } from '@/lib/shapes';
import type { Turn } from '@/lib/types';
import { ask, pool } from './common.mjs';

const [file, takes, ...ids] = process.argv.slice(2);
type Saved = { id: string; city_id: string; place_id: string; prompt_version: string; turns: { who: 'npc' | 'learner'; text: string; en?: string; parts?: { kind: string; text: string }[]; beats?: string[] }[] };
const all = JSON.parse(readFileSync(file, 'utf8')) as Saved[];
const schema = { type: 'object', additionalProperties: false, required: ['bid', 'question', 'newTopic'], properties: { bid: { type: 'boolean' }, question: { type: 'boolean' }, newTopic: { type: 'boolean' } } };

const jobs: (() => Promise<{ id: string; line: string; done: boolean; bid: boolean; question: boolean; newTopic: boolean }>)[] = [];
for (const id of ids) {
  const c = all.find((x) => x.id.startsWith(id))!;
  const character = characterForVisit(c.city_id, c.place_id)!;
  const i = c.turns.map((t) => t.who).lastIndexOf('learner');
  const transcript: Turn[] = c.turns.slice(0, i).map((t) => {
    const offered = (t.parts ?? []).filter((x) => x.kind === 'answer').map((x) => x.text);
    return { who: t.who, transcript: t.text, ...(t.en ? { translation: t.en } : {}), ...(offered.length ? { offered } : {}), ...(t.beats?.length ? { beats: t.beats } : {}) };
  });
  const learnerSaid = c.turns[i].text;
  const beginner = c.prompt_version.startsWith('beginner');
  for (let k = 0; k < Number(takes); k++) jobs.push(async () => {
    let line: string; let done: boolean;
    if (beginner) {
      const beats = transcript.find((t) => t.who === 'npc' && t.beats?.length)?.beats;
      const setup = pickSetup({ conversationId: c.id, turn: transcript.filter((t) => t.who === 'npc').length, learnerId: null, characterId: character.id, learnerSaid }, CLUSTER_1);
      const raw = await runTurn({ character, transcript, learnerSaid, brief: [frameBrief(CLUSTER_1), beatsBrief(beats)].filter(Boolean).join('\n\n'), note: noteOf(pickShapes({ learnerSaid }), setupLine(setup)), answers: setup.maxAnswers > 0, withDone: true });
      const r = lineWithAnswers(raw, setup, CLUSTER_1); line = r.line; done = raw.done === true;
    } else {
      const r = await runTurn({ character, transcript, learnerSaid, withDone: true }); line = r.line; done = r.done === true;
    }
    const j = JSON.parse(await ask(`The learner has just said goodbye. The character's reply:\n${line}\n\nbid: it invites them back for something concrete of the character's own (something to show, do, taste or tell next time), not just "come back any time". question: it asks them anything. newTopic: it starts a new subject other than the goodbye and any such invitation. Reply with JSON.`, { schema, max: 300 }));
    return { id, line, done, ...j };
  });
}
const rows = await pool(jobs, 6);
const n = (f: (r: typeof rows[number]) => boolean) => `${rows.filter(f).length}/${rows.length}`;
console.log(`done ${n((r) => r.done)} · bid ${n((r) => r.bid)} · question ${n((r) => r.question)} · new topic ${n((r) => r.newTopic)}`);
for (const r of rows) console.log(`- ${r.id}${r.bid ? ' [BID]' : ''}${r.question ? ' [Q]' : ''}${r.newTopic ? ' [NEW]' : ''}${r.done ? '' : ' [not done]'} ${r.line}`);
