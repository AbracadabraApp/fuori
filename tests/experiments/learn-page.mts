// The Learn page, tried on real-shaped conversations (Josh, 2026-10-20: "we
// could hand transcripts to Claude with a learn prompt and see what we'd get").
// For each conversation: the memory call's learning notes (memory.md → review),
// then content/<country>/prompts/learn.md writes the page from the transcript
// and those notes. Pages to read, not a score.
//   npx tsx --env-file=.env.local tests/experiments/learn-page.mts tests/conversations/synthetic-month/it.json [indexes, e.g. 0,1,7]
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { cities, language, pack } from '@/content';
import { findCharacter, summarizeWithClaude } from '@/lib/remember';
import { readPromptFile, fill } from '@/lib/prompts/template';
import { OUT, ask, pool } from './common.mjs';

type Row = { id: string; character_id: string; city_id: string; turns: { who: string; text: string }[] };
const [input, pick] = process.argv.slice(2);
const all = JSON.parse(readFileSync(input, 'utf8')) as Row[];
const rows = pick ? pick.split(',').map((i) => all[Number(i)]) : all.slice(0, 3);
const f = readPromptFile('learn.md');

const pages = await pool(rows.map((r) => async () => {
  const c = findCharacter(r.city_id, r.character_id)!;
  const city = cities.find((x) => x.id === r.city_id)!.name;
  const turns = r.turns.map((t) => ({ who: t.who === 'learner' ? 'learner' as const : 'npc' as const, text: t.text }));
  const { review } = await summarizeWithClaude({ character: { name: c.name, age: c.age, role: c.role, city }, notes: [], turns: turns.map((t) => ({ who: t.who === 'learner' ? 'learner' : 'npc', text: t.text })) as never });
  const notes = [
    ...review.mistakes.map((m) => `Mistake: "${m.said}" → "${m.better}" (${m.why})`),
    ...review.items.map((x) => `Worth learning: ${x.phrase} = ${x.en} (${x.why})`),
    ...review.missed.map((x) => `Didn't understand: ${x.phrase} = ${x.en}`),
    ...review.english.map((x) => `Fell back on English: "${x}"`),
  ].join('\n') || '(none)';
  const values = { language: language.name, city, name: c.name, role: c.role };
  const page = await ask(fill(f.block('User message'), { ...values, notes, transcript: r.turns.map((t) => `${t.who === 'learner' ? 'Learner' : c.name}: ${t.text}`).join('\n') }), { system: fill(f.block('System prompt'), values), max: 8000 });
  return `# ${r.id}: ${c.name}, ${c.role}\n\n<details><summary>Transcript and notes</summary>\n\n${r.turns.map((t) => `- **${t.who === 'learner' ? 'Learner' : c.name}:** ${t.text}`).join('\n')}\n\n${notes.split('\n').map((n) => `- ${n}`).join('\n')}\n\n</details>\n\n${page}\n`;
}), 3);
const out = join(OUT, `learn-pages-${pack.id}.md`);
writeFileSync(out, pages.join('\n---\n\n'));
console.log(pages[0]);
console.log(`→ ${out} (${pages.length} pages, learn.md ${f.version})`);
