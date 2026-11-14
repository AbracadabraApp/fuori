// The bubble set (docs/dialogue-plan.md D25-D33; docs/questions-and-bubbles.md): what the two answers offered are.
// Replays saved Beginner visits through the step-1 call, one take at each of the learner's lines, and a judge sorts
// each pair: yes/no (one says yes, the other no), filler (a stock compliment or "I like it a lot" with nothing of the
// place), a reason given, an answer that asks back, a description of something there, a gap needing a word in the
// language, and whether both are real things a person might say that lead different places.
//   COUNTRY=es-mx npx tsx --env-file=.env.local tests/experiments/bubble-pairs.mts <snapshot.json> <id-prefix>...
import { readFileSync } from 'node:fs';
import { characterForVisit } from '@/lib/characters/for-visit';
import { runTurn } from '@/lib/turn';
import { CLUSTER_1, frameBrief, lineWithAnswers, pickSetup, setupLine } from '@/lib/beginner-2';
import { beatsBrief, noteOf, pickShapes } from '@/lib/shapes';
import type { Turn } from '@/lib/types';
import { ask, pool } from './common.mjs';

const [file, ...ids] = process.argv.slice(2);
type Saved = { id: string; city_id: string; place_id: string; turns: { who: 'npc' | 'learner'; text: string; en?: string; parts?: { kind: string; text: string }[]; beats?: string[] }[] };
const all = JSON.parse(readFileSync(file, 'utf8')) as Saved[];
const keys = ['yesNo', 'filler', 'reason', 'asksBack', 'describes', 'wordGap', 'twoPlaces'] as const;
const schema = { type: 'object', additionalProperties: false, required: [...keys], properties: Object.fromEntries(keys.map((k) => [k, { type: 'boolean' }])) };
const jobs: (() => Promise<Record<string, unknown>>)[] = [];
for (const id of ids) {
  const c = all.find((x) => x.id.startsWith(id))!;
  const character = characterForVisit(c.city_id, c.place_id)!;
  for (let i = 1; i < c.turns.length; i++) {
    if (c.turns[i].who !== 'learner') continue;
    const transcript: Turn[] = c.turns.slice(0, i).map((t) => ({ who: t.who, transcript: t.text, ...(t.en ? { translation: t.en } : {}) }));
    const learnerSaid = c.turns[i].text;
    const beats = c.turns.find((t) => t.who === 'npc' && t.beats?.length)?.beats;
    const setup = pickSetup({ conversationId: c.id, turn: transcript.filter((t) => t.who === 'npc').length, learnerId: null, characterId: character.id, learnerSaid }, CLUSTER_1);
    if (setup.maxAnswers === 0 || setup.id === 'ask-en') continue;
    jobs.push(async () => {
      const raw = await runTurn({ character, transcript, learnerSaid, brief: [frameBrief(CLUSTER_1), beatsBrief(beats)].filter(Boolean).join('\n\n'), note: noteOf(pickShapes({ learnerSaid }), setupLine(setup)), answers: true, withDone: true });
      const r = lineWithAnswers(raw, setup, CLUSTER_1);
      const answers = r.parts.filter((p) => p.kind === 'answer').map((p) => p.text);
      const j = JSON.parse(await ask(`A character said: ${r.line}\nThe learner is offered two answers to say back:\n1. ${answers[0] ?? ''}\n2. ${answers[1] ?? ''}\n\nyesNo: one is a yes and the other a no to the same thing. filler: either is a stock compliment or "I like it a lot" with nothing particular to the place. reason: either gives a reason for a choice. asksBack: either answers and then asks something back. describes: either describes something there in particular. wordGap: either has a blank (…) that needs a word in the language (not a name, a place or a number). twoPlaces: both are things a person might really say here, and they would take the talk in different directions. Reply with JSON.`, { schema, max: 2000 }));
      return { setup: setup.id, line: r.line, answers, ...j };
    });
  }
}
const rows = await pool(jobs, 6);
console.log(`pairs ${rows.length} · ` + keys.map((k) => `${k} ${rows.filter((r) => r[k]).length}`).join(' · '));
for (const r of rows) console.log(`- ${(r.answers as string[]).join(' / ')}  [${keys.filter((k) => r[k]).join(',')}]`);
