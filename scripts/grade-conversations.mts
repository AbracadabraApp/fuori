// Grade saved conversations 1–10 (lib/grade.ts, Josh 2026-11-10: "score all
// conversations since 11/8"). Reads the admin route's JSON, judges each
// character conversation with the current quality judge (so the five new
// counts exist), adds the saved level and repeats counts, and prints the
// grade with its variables. Offline from the game: nothing is written back.
//   COUNTRY=es-mx npx tsx --env-file=.env.local scripts/grade-conversations.mts convs.json es-mx
//   npx tsx --env-file=.env.local scripts/grade-conversations.mts convs.json it
// The second argument keeps the conversations of one country (by the pack's city ids).
import { readFileSync, writeFileSync } from 'fs';
import { findCharacter } from '@/lib/remember';
import { scoreConversation, type ConversationScore, type ScoredTurn } from '@/lib/quality';
import { gradeConversation, gradeLine, VARIABLES } from '@/lib/grade';
import { instrumentsOf, instrumentLine } from '@/lib/instruments';

const [file, out] = [process.argv[2], process.argv[3]];
if (!file) { console.error('usage: grade-conversations.mts <conversations.json> [out.json]'); process.exit(1); }
const rows = JSON.parse(readFileSync(file, 'utf8')) as { id: string; character_id: string; city_id: string; place_id: string; prompt_version: string; started_at: string; turns: (ScoredTurn & { text: string })[]; quality?: ConversationScore }[];

const results: unknown[] = [];
for (const r of rows.slice().reverse()) {
  const learnerLines = r.turns.filter((t) => t.who === 'learner').length;
  const character = findCharacter(r.city_id, r.character_id);
  const label = `${r.started_at.slice(5, 16).replace('T', ' ')} ${r.character_id} (${r.prompt_version.slice(0, 22)})`;
  if (!character) continue; // another country's pack
  // Magda's lessons and the lesson pages aren't graded: correcting is her job (lib/remember.ts), and scoring needs two learner lines like real play
  if (/^(magda|lesson)/.test(r.prompt_version)) continue;
  if (learnerLines < 2) { console.log(`${label}: fewer than two learner lines; not graded`); results.push({ id: r.id, label, grade: null, why: 'fewer than two learner lines' }); continue; }
  try {
    const score = await scoreConversation(character, r.turns, undefined, { beginner: r.prompt_version.startsWith('beginner-') });
    if (r.quality?.level) score.level = r.quality.level;
    if (r.quality?.repeats) score.repeats = r.quality.repeats;
    const g = gradeConversation(score);
    console.log(`${label}\n  ${gradeLine(g)}\n  ${instrumentLine(instrumentsOf(score))}\n  ${score.character ? `Character: ${score.character.note}\n  ` : ''}${score.judge.note}`);
    results.push({ id: r.id, at: r.started_at, character: r.character_id, promptVersion: r.prompt_version, label, learnerLines, grade: g, instruments: instrumentsOf(score), note: score.judge.note, score, counts: { ...score.judge, lost: undefined, words: undefined, note: undefined, replies: score.stats.replies, lostLines: score.lost} });
  } catch (e) {
    console.log(`${label}: FAILED ${(e as Error).message}`);
    results.push({ id: r.id, label, grade: null, why: (e as Error).message });
  }
}
const graded = results.filter((x): x is { grade: { total: number; variables: Record<string, number | null> } } => !!(x as { grade: unknown }).grade);
if (graded.length) {
  const mean = (a: number[]) => Math.round((10 * a.reduce((x, y) => x + y, 0)) / a.length) / 10;
  console.log(`\n${graded.length} graded · mean ${mean(graded.map((x) => x.grade.total))}/10 · ` + VARIABLES.map((v) => { const xs = graded.map((x) => x.grade.variables[v.key]).filter((x): x is number => x !== null); return `${v.label.toLowerCase()} ${xs.length ? mean(xs) : '–'}`; }).join(' · '));
}
if (out) writeFileSync(out, JSON.stringify(results, null, 1));
