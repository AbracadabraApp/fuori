// The quality judge on one saved conversation, printed (for checking a
// quality.md change). Input: { character_id, city_id, turns: [{ who, text }] }.
//   npx tsx --env-file=.env.local tests/experiments/judge-one.mts <conversation.json> [beginner]
import { readFileSync } from 'node:fs';
import { findCharacter } from '@/lib/remember';
import { judgeWithClaude } from '@/lib/quality';

const [file, mode] = process.argv.slice(2);
const c = JSON.parse(readFileSync(file, 'utf8'));
const character = findCharacter(c.city_id, c.character_id)!;
const turns = c.turns.map((t: any) => ({ who: t.who, text: t.text }));
const j = await judgeWithClaude(character as any, turns, { beginner: mode === 'beginner' });
console.log(JSON.stringify({ englishUnasked: j.englishUnasked, alive: j.alive, words: j.words, note: j.note }, null, 1));
