// D13: the idiom turn replayed on saved Beginner visits at step 1, as take-turn plays it (the IDIOM setup with the
// picked idiom, put together as the game does), then the learner says one guess and the next turn follows it up.
// Prints what's said, what's printed, the guesses offered, and the follow-up, for reading.
//   COUNTRY=es-mx npx tsx --env-file=.env.local tests/experiments/idiom-turn.mts <snapshot.json> <id-prefix>...
import { readFileSync } from 'node:fs';
import { characterForVisit } from '@/lib/characters/for-visit';
import { runTurn } from '@/lib/turn';
import { CLUSTER_1, IDIOM, frameBrief, lineWithAnswers, pickSetup, setupLine } from '@/lib/beginner-2';
import { assemblePieces } from '@/lib/dialogue/pieces';
import { pickIdiom, usedIdiom, idiomSaidNote } from '@/lib/idioms';
import type { Turn } from '@/lib/types';

const [file, ...ids] = process.argv.slice(2);
const all = JSON.parse(readFileSync(file, 'utf8')) as any[];
const out: string[] = [];
await Promise.all(ids.map(async (id) => {
  const c = all.find((x) => x.id.startsWith(id)); const character = characterForVisit(c.city_id, c.place_id)!;
  const i = c.turns.map((t: any, n: number) => (t.who === 'learner' ? n : -1)).filter((n: number) => n > 0)[2];
  const transcript: Turn[] = c.turns.slice(0, i).map((t: any) => ({ who: t.who, transcript: t.text, ...(t.en ? { translation: t.en } : {}) }));
  const idiom = pickIdiom(c.id + Math.random(), new Set())!;
  const setup = { ...IDIOM, vars: { idiom: idiom.text, picture: idiom.picture, meaning: idiom.meaning } };
  const raw = await runTurn({ character, transcript, learnerSaid: c.turns[i].text, brief: frameBrief(CLUSTER_1), note: setupLine(setup), answers: true, withDone: true });
  const r = lineWithAnswers({ ...raw, line: assemblePieces(raw.line) }, setup, CLUSTER_1);
  const said = usedIdiom(r.line, idiom);
  let follow = '';
  if (said && r.parts[0]) {
    const t2: Turn[] = [...transcript, { who: 'learner', transcript: c.turns[i].text }, { who: 'npc', transcript: r.line, translation: r.en, idiom: idiom.text }];
    const next = pickSetup({ conversationId: c.id, turn: 4, learnerId: null, characterId: character.id }, CLUSTER_1);
    const f = await runTurn({ character, transcript: t2, learnerSaid: r.parts[1]?.text ?? r.parts[0].text, brief: frameBrief(CLUSTER_1), note: setupLine(next), help: idiomSaidNote(idiom.text), answers: next.maxAnswers > 0, withDone: true });
    follow = `\n   learner (picks the 2nd guess): ${r.parts[1]?.text}\n   next turn: ${assemblePieces(f.line)}`;
  }
  out.push(`[${id}] idiom: ${idiom.text} (${idiom.meaning})${said ? '' : '  — NOT USED'}\n   said: ${r.line}\n   printed: ${r.question?.text ?? '(nothing)'}${r.question?.en ? ' / ' + r.question.en : ''}\n   bubbles: ${r.parts.map((p) => p.text + (p.en ? ' (' + p.en + ')' : '')).join(' | ')}${follow}`);
}));
console.log(out.join('\n'));
