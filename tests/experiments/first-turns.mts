// Beginner step 1's first turn with the intro cut (2026-11-13): the opener as the game now makes it, for a few places,
// put together as the game does. A look, not a card.
//   COUNTRY=es-mx npx tsx --env-file=.env.local tests/experiments/first-turns.mts <city/place>...
import { characterForVisit } from '@/lib/characters/for-visit';
import { runTurn } from '@/lib/turn';
import { CLUSTER_1, frameBrief, lineWithAnswers, OPENER, setupLine } from '@/lib/beginner-2';
import { assemblePieces } from '@/lib/dialogue/pieces';

for (const at of process.argv.slice(2)) {
  const [city, place] = at.split('/');
  const character = characterForVisit(city, place);
  if (!character) throw new Error(`no character at ${at}`);
  const r = await runTurn({ character, transcript: [], learnerSaid: '', brief: frameBrief(CLUSTER_1), note: setupLine(OPENER), answers: true, withDone: true });
  const out = lineWithAnswers({ ...r, line: assemblePieces(r.line) }, OPENER, CLUSTER_1);
  console.log(`\n${character.name} (${at}) · ${out.line.split(/\s+/).length} words\n  as written: ${r.line}\n  said: ${out.line}\n  answers: ${out.parts.map((p) => `${p.text} (${p.en})`).join(' | ')}`);
}
