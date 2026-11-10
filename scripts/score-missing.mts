// Scores the saved conversations that have no score: a conversation with two or
// more learner lines whose scoring failed or never ran (the Dona Tere fonda
// visit, 2026-11-10 01:08, had 15 learner lines and none). Real play scores a
// conversation when it ends (lib/remember.ts); this catches the ones that slipped
// through and writes each score the way real play does (saveConversationScore keeps
// any earlier score in quality_history). Needs the database, so run it where
// DATABASE_URL resolves (inside the service, like the migrations):
//   railway ssh --service Afuera -- npx tsx scripts/score-missing.mts
//   railway ssh --service Fuori  -- npx tsx scripts/score-missing.mts
// --dry lists what it would score without calling Claude or writing.
import { query } from '@/lib/db';
import { findCharacter, MIN_LEARNER_LINES } from '@/lib/remember';
import { scoreConversation, saveConversationScore, type ScoredTurn } from '@/lib/quality';
import { gradeConversation, gradeLine } from '@/lib/grade';

const dry = process.argv.includes('--dry');
const rows = (await query<{ id: string; character_id: string; city_id: string; prompt_version: string; turns: ScoredTurn[] }>(
  `SELECT id, character_id, city_id, prompt_version, turns FROM conversations WHERE quality IS NULL AND ended_at IS NOT NULL ORDER BY started_at`
)).rows;
let scored = 0;
for (const r of rows) {
  const learnerLines = r.turns.filter((t) => t.who === 'learner').length;
  const character = findCharacter(r.city_id, r.character_id);
  if (learnerLines < MIN_LEARNER_LINES || !character || r.prompt_version.startsWith('magda') || r.prompt_version.startsWith('lesson')) continue;
  if (dry) { console.log(`would score ${r.id} ${r.character_id} (${learnerLines} learner lines)`); continue; }
  try {
    const score = await scoreConversation(character, r.turns, undefined, { beginner: r.prompt_version.startsWith('beginner-') });
    await saveConversationScore(r.id, score);
    scored++;
    console.log(`${r.character_id}: ${gradeLine(gradeConversation(score))}`);
  } catch (e) {
    console.log(`${r.character_id} ${r.id}: FAILED ${(e as Error).message}`);
  }
}
console.log(`${dry ? 'dry run' : `${scored} scored`}`);
process.exit(0);
