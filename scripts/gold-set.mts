// The gold set: conversations Josh grades 1–10 blind, against which every change to
// the grade or the quality judge is checked (card Q1; Josh, 2026-11-10: "overall grade
// 1-10"). Real transcripts, so the files live in ~/fuori-archive/, never in git.
//
//   npx tsx scripts/gold-set.mts pack [archive.json]   # 10 transcripts, no scores, to grade: ~/fuori-archive/gold-to-grade.md
//   npx tsx scripts/gold-set.mts check [archive.json]  # ~/fuori-archive/gold-grades.json {"<id>": <Josh's 1–10>} against the grade rule
//
// pack picks from the archive's conversations with at least 8 learner lines, spread across
// the grade rule's range (it never shows Josh the number), in a fixed shuffled order.
// check recomputes every conversation's grade from its saved score (so it needs a score
// with the 2026-11-10r judge fields to be fully measured) and reports how far each is
// from Josh's and Q1's hypothesis: within 1.0 on at least 8 of 10, and Chuy at 5 or less.
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { gradeConversation } from '@/lib/grade';
import type { ConversationScore } from '@/lib/quality';

const dir = join(homedir(), 'fuori-archive');
const [cmd, fileArg] = [process.argv[2], process.argv[3]];
const file = fileArg ?? join(dir, readdirSync(dir).filter((f) => f.startsWith('conversations-')).sort().pop() ?? '');
type Row = { id: string; character_id: string; started_at: string; prompt_version: string; turns: { who: string; text: string }[]; quality: ConversationScore | null };
const rows = JSON.parse(readFileSync(file, 'utf8')) as Row[];
const learnerLines = (r: Row) => r.turns.filter((t) => t.who === 'learner').length;

if (cmd === 'pack') {
  const scored = rows.filter((r) => r.quality && learnerLines(r) >= 8).map((r) => ({ r, g: gradeConversation(r.quality as ConversationScore).total })).sort((a, b) => a.g - b.g);
  const pick = scored.length <= 10 ? scored : Array.from({ length: 10 }, (_, i) => scored[Math.round((i * (scored.length - 1)) / 9)]);
  // A fixed shuffle, so the order doesn't follow the grade
  const order = [...pick].sort((a, b) => ((a.r.id.charCodeAt(1) * 31 + a.r.id.charCodeAt(5)) % 97) - ((b.r.id.charCodeAt(1) * 31 + b.r.id.charCodeAt(5)) % 97));
  const text = order.map((p, i) => `## Conversation ${i + 1}  (${p.r.character_id}, ${p.r.started_at.slice(0, 10)})\n\n${p.r.turns.map((t) => `${t.who === 'npc' ? 'THEM' : 'YOU '}: ${t.text}`).join('\n')}\n\nYour grade 1–10: ___\n`).join('\n---\n\n');
  writeFileSync(join(dir, 'gold-to-grade.md'), `# Grade each conversation 1–10\n\nOne grade for how good the conversation was, character and conversation, not the learner. Then fill ${join(dir, 'gold-grades.json')} as {"1": 7, "2": 4, …}.\n\n${text}`, { mode: 0o600 });
  writeFileSync(join(dir, 'gold-key.json'), JSON.stringify(Object.fromEntries(order.map((p, i) => [String(i + 1), p.r.id]))), { mode: 0o600 });
  console.log(`${order.length} conversations → ${join(dir, 'gold-to-grade.md')} (the key is gold-key.json)`);
} else if (cmd === 'check') {
  const gradesFile = join(dir, 'gold-grades.json');
  if (!existsSync(gradesFile)) { console.error(`No ${gradesFile} yet: Josh's grades, {"1": 7, …}`); process.exit(1); }
  const josh = JSON.parse(readFileSync(gradesFile, 'utf8')) as Record<string, number>;
  const key = JSON.parse(readFileSync(join(dir, 'gold-key.json'), 'utf8')) as Record<string, string>;
  const byId = new Map(rows.map((r) => [r.id, r]));
  const diffs: number[] = [];
  for (const [n, id] of Object.entries(key)) {
    const r = byId.get(id);
    if (!r?.quality || josh[n] === undefined) continue;
    const g = gradeConversation(r.quality);
    diffs.push(Math.abs(g.total - josh[n]));
    console.log(`${n} ${r.character_id}: rule ${g.total} · Josh ${josh[n]} · off by ${Math.round(10 * Math.abs(g.total - josh[n])) / 10}${g.capped.length ? ` · capped: ${g.capped.join('; ')}` : ''}`);
  }
  const within = diffs.filter((d) => d <= 1).length;
  console.log(`\nwithin 1.0 of Josh: ${within} of ${diffs.length} (hypothesis: at least 8 of 10) · mean off by ${diffs.length ? Math.round((10 * diffs.reduce((a, b) => a + b, 0)) / diffs.length) / 10 : '–'}`);
} else {
  console.error('usage: gold-set.mts pack|check [archive.json]');
  process.exit(1);
}
