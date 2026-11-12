// How long the Beginner's step-1 turns are, on real visits (docs/dialogue-plan.md, item A: "Beginner turns long and
// mostly English", Josh's play 2026-11-12). Replays saved visits: at each of the learner's lines, the conversation
// so far as it was saved goes through the exact call take-turn makes at step 1 (runTurn with the frame brief, the
// intro's beats, the setup and shape note, the answers), and the reply is measured: words heard (with the question's
// English said after it), sentences, words in the language, whether it ends on a question. A check, not a card: it
// prints numbers and the lines for reading; Josh decides by ear.
//   COUNTRY=es-mx npx tsx --env-file=.env.local tests/experiments/b2-turn-length.mts <snapshot.json> <id-prefix>... [--takes=2] [--level=<file with a Level 1 text to try>]
import { readFileSync } from 'node:fs';
import { language } from '@/content';
import { characterForVisit } from '@/lib/characters/for-visit';
import { runTurn } from '@/lib/turn';
import { CLUSTER_1, frameBrief, levelText, lineWithAnswers, pickSetup, setupLine } from '@/lib/beginner-2';
import { beatsBrief, noteOf, pickShapes } from '@/lib/shapes';
import type { Turn } from '@/lib/types';
import { ask } from './common.mjs';

const args = process.argv.slice(2);
const flag = (name: string) => args.find((a) => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=');
const [file, ...ids] = args.filter((a) => !a.startsWith('--'));
const takes = Number(flag('takes') ?? '2');
const levelFile = flag('level');
const level = levelFile ? readFileSync(levelFile, 'utf8').trim().replaceAll('{language}', language.name) : undefined;

type Saved = { id: string; city_id: string; place_id: string; character_id: string; turns: { who: 'npc' | 'learner'; text: string; en?: string; parts?: { kind: string; text: string }[]; beats?: string[] }[] };
const all = JSON.parse(readFileSync(file, 'utf8')) as Saved[];
const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
const sentences = (s: string) => s.split(/(?<=[.!?…])\s+/).filter((x) => x.trim()).length;
const spansSchema = { type: 'object', additionalProperties: false, required: ['spans'], properties: { spans: { type: 'array', items: { type: 'string' } } } };

const rows: { heard: number; lang: number; sentences: number; question: boolean }[] = [];
for (const id of ids) {
  const c = all.find((x) => x.id.startsWith(id));
  if (!c) throw new Error(`no conversation ${id}`);
  const character = characterForVisit(c.city_id, c.place_id);
  if (!character) throw new Error(`no character for ${c.city_id}/${c.place_id}`);
  console.log(`\n=== ${c.id.slice(0, 8)} ${character.name} (${c.city_id})${level ? ' · Level 1 from ' + levelFile : ' · today\'s Level 1'}`);
  for (let i = 1; i < c.turns.length; i++) {
    if (c.turns[i].who !== 'learner') continue;
    const transcript: Turn[] = c.turns.slice(0, i).map((t) => {
      const offered = (t.parts ?? []).filter((x) => x.kind === 'answer').map((x) => x.text);
      return { who: t.who, transcript: t.text, ...(t.en ? { translation: t.en } : {}), ...(offered.length ? { offered } : {}), ...(t.beats?.length ? { beats: t.beats } : {}) };
    });
    const learnerSaid = c.turns[i].text;
    const beats = transcript.find((t) => t.who === 'npc' && t.beats?.length)?.beats;
    const npcTurns = transcript.filter((t) => t.who === 'npc').length;
    const setup = pickSetup({ conversationId: c.id, turn: npcTurns, learnerId: null, characterId: character.id, learnerSaid }, CLUSTER_1);
    const brief = [level ? frameBrief(CLUSTER_1).replace(levelText(CLUSTER_1), level) : frameBrief(CLUSTER_1), beatsBrief(beats)].filter(Boolean).join('\n\n');
    for (let k = 0; k < takes; k++) {
      const r0 = await runTurn({ character, transcript, learnerSaid, brief, note: noteOf(pickShapes({ learnerSaid }), setupLine(setup)), answers: setup.maxAnswers > 0, withDone: true });
      const r = lineWithAnswers(r0, setup, CLUSTER_1);
      const spans = (JSON.parse(await ask(`Copy out every run of ${language.name} words in this line, one string per run, exactly as written (English runs left out):\n${r.line}`, { schema: spansSchema, max: 800 })) as { spans: string[] }).spans;
      const row = { heard: words(r.line), lang: spans.reduce((n, s) => n + words(s), 0), sentences: sentences(r0.line), question: /[?¿]\s*\S*$/.test(r0.line.trim()) || /[?¿]$/.test(r0.line.trim()) };
      rows.push(row);
      console.log(`[learner: "${learnerSaid}" · ${setup.id}] ${row.heard} words heard, ${row.lang} in ${language.name}, ${row.sentences} sentences${row.question ? ', ends on a question' : ''}\n  ${r.line}`);
    }
  }
}
const med = (xs: number[]) => xs.slice().sort((a, b) => a - b)[Math.floor(xs.length / 2)];
console.log(`\n${rows.length} turns · median ${med(rows.map((r) => r.heard))} words heard (range ${Math.min(...rows.map((r) => r.heard))}-${Math.max(...rows.map((r) => r.heard))}) · ${Math.round((100 * rows.reduce((n, r) => n + r.lang, 0)) / rows.reduce((n, r) => n + r.heard, 0))}% in ${language.name} · median ${med(rows.map((r) => r.sentences))} sentences · ${rows.filter((r) => r.question).length} of ${rows.length} end on a question`);
