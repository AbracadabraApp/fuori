// D25 (docs/dialogue-plan.md): a Help bubble, offered by the character when its line has something the learner may
// not follow (Josh, 2026-11-14: "ok" to the character deciding). Replays saved Beginner visits through the step-1
// call take-turn makes (runTurn with the frame brief, the setup and shape note, the answers), one take at each of the
// learner's lines, and counts the answers that ask for help (what something means, to say it again, slower): turns
// with one, turns with two (the pair is then all help), and the lines for reading.
//   COUNTRY=es-mx npx tsx --env-file=.env.local tests/experiments/help-bubble.mts <snapshot.json> <id-prefix>...
import { readFileSync } from 'node:fs';
import { characterForVisit } from '@/lib/characters/for-visit';
import { runTurn } from '@/lib/turn';
import { CLUSTER_1, frameBrief, lineWithAnswers, pickSetup, setupLine } from '@/lib/beginner-2';
import { noteOf, pickShapes } from '@/lib/shapes';
import type { Turn } from '@/lib/types';
import { ask, pool } from './common.mjs';

const [file, ...ids] = process.argv.slice(2);
type Saved = { id: string; city_id: string; place_id: string; turns: { who: 'npc' | 'learner'; text: string; en?: string; parts?: { kind: string; text: string }[]; beats?: string[] }[] };
const all = JSON.parse(readFileSync(file, 'utf8')) as Saved[];
const schema = { type: 'object', additionalProperties: false, required: ['help'], properties: { help: { type: 'array', items: { type: 'boolean' } } } };

const jobs: (() => Promise<{ line: string; answers: string[]; help: boolean[] }>)[] = [];
for (const id of ids) {
  const c = all.find((x) => x.id.startsWith(id))!;
  const character = characterForVisit(c.city_id, c.place_id)!;
  for (let i = 1; i < c.turns.length; i++) {
    if (c.turns[i].who !== 'learner') continue;
    const transcript: Turn[] = c.turns.slice(0, i).map((t) => {
      const offered = (t.parts ?? []).filter((x) => x.kind === 'answer').map((x) => x.text);
      return { who: t.who, transcript: t.text, ...(t.en ? { translation: t.en } : {}), ...(offered.length ? { offered } : {}) };
    });
    const learnerSaid = c.turns[i].text;
    const setup = pickSetup({ conversationId: c.id, turn: transcript.filter((t) => t.who === 'npc').length, learnerId: null, characterId: character.id, learnerSaid }, CLUSTER_1);
    if (setup.maxAnswers === 0) continue;
    jobs.push(async () => {
      const raw = await runTurn({ character, transcript, learnerSaid, brief: frameBrief(CLUSTER_1), note: noteOf(pickShapes({ learnerSaid }), setupLine(setup)), answers: true, withDone: true });
      const r = lineWithAnswers(raw, setup, CLUSTER_1);
      const answers = r.parts.filter((p) => p.kind === 'answer').map((p) => p.text);
      const help = (JSON.parse(await ask(`Answers a learner can say back in a conversation:\n${answers.map((a, k) => `${k + 1}. ${a}`).join('\n')}\n\nFor each, true if it asks the other person for help: what something means, to say it again, or more slowly. Reply with JSON: help, one boolean per answer.`, { schema, max: 300 })) as { help: boolean[] }).help;
      return { line: r.line, answers, help };
    });
  }
}
const rows = await pool(jobs, 6);
const one = rows.filter((r) => r.help.filter(Boolean).length === 1).length;
const both = rows.filter((r) => r.help.length > 1 && r.help.every(Boolean)).length;
console.log(`turns ${rows.length} · with a help answer ${one + both} (one ${one}, all help ${both})`);
for (const r of rows.filter((x) => x.help.some(Boolean))) console.log(`- ${r.line}\n    → ${r.answers.map((a, k) => (r.help[k] ? `[HELP] ${a}` : a)).join(' / ')}`);
