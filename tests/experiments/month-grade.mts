// Grades a modelled month (tests/conversations/synthetic-month.ts) against the
// "good outcome of 30 conversations" table (Josh, 2026-10-19), first 5
// conversations against the last 5, and grades the characters' part in each:
// what they did that would cause the outcome. One judge call per conversation,
// one for recurring mistakes. A simulated learner improves partly because it
// is told to use its notebook, so the learner columns show the model working;
// the character columns are the real grade.
//   npx tsx --env-file=.env.local tests/experiments/month-grade.mts tests/conversations/synthetic-month/it.json
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { cities, language, pack } from '@/content';
import { findCharacter } from '@/lib/remember';
import { beginnerKnows } from '@/lib/level';
import { OUT, ask, mean, pct, pool } from './common.mjs';

type Row = { id: string; day: number; character_id: string; city_id: string; notebook: string[]; turns: { who: string; text: string; en?: string }[] };
const [input] = process.argv.slice(2);
const rows = JSON.parse(readFileSync(input, 'utf8')) as Row[];
const chips = (JSON.parse(readFileSync(join(process.cwd(), 'tests/experiments/missions-it.json'), 'utf8')) as { chips: { chip: string }[] }).chips.map((c) => c.chip);
void cities;

const schema = { type: 'object', additionalProperties: false, required: ['chips', 'helpAsks', 'lost', 'mistakes', 'greetedByName', 'recalledSomething', 'teaching', 'notebookFromCharacter', 'learnerRealism', 'learnerTooGood', 'learnerEnglish', 'notebookUsed', 'learnerNote'], properties: {
  chips: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['chip', 'english'], properties: { chip: { type: 'string', enum: chips }, english: { type: 'boolean' } } } },
  helpAsks: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['turn', 'helped'], properties: { turn: { type: 'integer' }, helped: { type: 'string', enum: ['English, briefly', 'in the language only', 'not helped'] } } } },
  lost: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['turn', 'pulledBack'], properties: { turn: { type: 'integer' }, pulledBack: { type: 'boolean' } } } },
  mistakes: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['turn', 'pattern', 'recast'], properties: { turn: { type: 'integer' }, pattern: { type: 'string' }, recast: { type: 'boolean' } } } },
  greetedByName: { type: 'boolean' }, recalledSomething: { type: 'boolean' },
  teaching: { type: 'integer' }, notebookFromCharacter: { type: 'integer' },
  learnerRealism: { type: 'integer' }, learnerTooGood: { type: 'integer' }, learnerEnglish: { type: 'integer' }, notebookUsed: { type: 'integer' }, learnerNote: { type: 'string' },
} };

const graded = await pool(rows.map((r, i) => async () => {
  const c = findCharacter(r.city_id, r.character_id)!;
  const visit = rows.slice(0, i + 1).filter((x) => x.character_id === r.character_id).length;
  const before = rows[i - 1]?.notebook ?? [];
  const added = r.notebook.filter((n) => !(rows[i - 1]?.notebook ?? []).includes(n));
  const j = JSON.parse(await ask(`A ${language.name} conversation game, by voice (speech-to-text: ignore spelling and recognition noise). A beginner talks with ${c.name} (${c.role}); this is visit ${visit} to ${c.name}.

${r.turns.map((t, k) => `${k + 1}. ${t.who === 'learner' ? 'Learner' : c.name}: ${t.text}`).join('\n')}

The learner's notebook before this conversation (what they had learned on earlier days):
${before.map((n) => `- ${n}`).join('\n') || '(empty: first day)'}

New in the learner's notebook after this conversation:
${added.map((n) => `- ${n}`).join('\n') || '(nothing)'}

- chips: which of these the learner did in this conversation: ${chips.join('; ')}. english: true if they needed English to do it (asked for it, or said part of it in English).
- helpAsks: each learner line asking for help (what something means, how to say something, to repeat or slow down), in English or ${language.name}; helped: how the next ${c.name} line helped.
- lost: each learner line showing they didn't understand ${c.name}'s last line; pulledBack: the next line made it simpler, shorter or explained.
- mistakes: each real learner error (wrong verb form, gender, wrong word; not noise). pattern: a short general label ("1st person of volere", "gender of caffè"); recast: ${c.name}'s next line used the right form.
- greetedByName: ${c.name}'s first line uses the learner's name (false on a first visit unless they already knew it). recalledSomething: ${c.name} mentions something from an earlier visit (their usual, what they talked about).
- teaching: how many ${c.name} lines teach something small in passing (a word, a form, a local way of saying it).
- notebookFromCharacter: how many of the new notebook entries ${c.name} taught or offered (not things the learner already said unprompted).
The learner is simulated; grade it too. It is meant to be an American who arrived in ${language.name === 'Italian' ? 'Rome' : 'town'} at A1, on day ${r.day} of a month.
- learnerRealism: 1-10, how much the learner's lines sound like a real learner at this point (hesitations, mistakes, gaps, not too fluent, not a caricature).
- learnerTooGood: how many learner lines are beyond what this learner could say given their notebook and the day.
- learnerEnglish: how many learner lines contain English.
- notebookUsed: how many notebook entries from before this conversation the learner uses.
- learnerNote: one short line on the learner's side.
Reply with JSON.`, { schema })) as { learnerRealism: number; learnerTooGood: number; learnerEnglish: number; notebookUsed: number; learnerNote: string; chips: { chip: string; english: boolean }[]; helpAsks: { helped: string }[]; lost: { pulledBack: boolean }[]; mistakes: { pattern: string; recast: boolean }[]; greetedByName: boolean; recalledSomething: boolean; teaching: number; notebookFromCharacter: number };
  const words = r.turns.filter((t) => t.who === 'learner').map((t) => t.text.split(/\s+/).filter(Boolean).length).sort((a, b) => a - b);
  const said = r.turns.filter((t) => t.who === 'learner').map((t) => t.text);
  const level = mean(await Promise.all(said.map((l) => beginnerKnows(l))));
  return { r, c, visit, added: added.length, words: words[Math.floor(words.length / 2)], level, replies: said.length, ...j };
}), 6);

type G = (typeof graded)[number];
const first = graded.slice(0, 5), last = graded.slice(-5), firstTen = graded.slice(0, 10), lastTen = graded.slice(-10);
const chipsClean = (gs: G[]) => new Set(gs.flatMap((g) => g.chips.filter((x) => !x.english).map((x) => x.chip))).size;
const per = (gs: G[], f: (g: G) => number) => mean(gs.map(f)).toFixed(1);

// Recurring mistakes: the patterns of the first 10, then whether they show in the last 5
const recSchema = { type: 'object', additionalProperties: false, required: ['patterns'], properties: { patterns: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['pattern', 'early', 'late'], properties: { pattern: { type: 'string' }, early: { type: 'integer' }, late: { type: 'integer' } } } } } };
const rec = (JSON.parse(await ask(`Learner mistakes in a ${language.name} game, by conversation. Group them into general patterns. List the 3 patterns that recur most in conversations 1-10; for each, count how often it appears in 1-10 (early) and in the last 5 (late).\n\n${graded.map((g, i) => `Conversation ${i + 1}: ${g.mistakes.map((m) => m.pattern).join('; ') || '—'}`).join('\n')}\nReply with JSON.`, { schema: recSchema })) as { patterns: { pattern: string; early: number; late: number }[] }).patterns;

const repeats = graded.filter((g) => g.visit > 1);
const regulars = new Set(repeats.filter((g) => g.greetedByName && g.recalledSomething).map((g) => g.c.name));
const asks = graded.flatMap((g) => g.helpAsks), lost = graded.flatMap((g) => g.lost), mist = graded.flatMap((g) => g.mistakes);
const lines = [
  `# A month in ${pack.id === 'it' ? 'Rome' : pack.id}, graded`, '',
  `${graded.length} modelled conversations, 15 learner replies each. First 5 against last 5 (chips: first 10 against last 10, since 5 conversations can't cover 10 chips).`, '',
  '## The outcomes', '',
  '| Outcome | Bar | First | Last | Met |', '|---|---|---|---|---|',
  `| Errands without help | 8 of 10 chips done without English | ${chipsClean(firstTen)} of 10 | ${chipsClean(lastTen)} of 10 | ${chipsClean(lastTen) >= 8 ? 'yes' : 'no'} |`,
  `| Less English | help asks per conversation halve | ${per(first, (g) => g.helpAsks.length)} | ${per(last, (g) => g.helpAsks.length)} | ${mean(last.map((g) => g.helpAsks.length)) <= mean(first.map((g) => g.helpAsks.length)) / 2 ? 'yes' : 'no'} |`,
  `| Longer turns | median words per reply 6–8 by the end | ${per(first, (g) => g.words)} | ${per(last, (g) => g.words)} | ${mean(last.map((g) => g.words)) >= 6 ? 'yes' : 'no'} |`,
  `| Mistakes stop recurring | 2–3 recurring errors gone | ${rec.map((p) => `${p.pattern} ×${p.early}`).join('; ')} | ${rec.map((p) => `×${p.late}`).join('; ')} | ${rec.filter((p) => p.late === 0).length} of ${rec.length} gone |`,
  `| Following more | lost moments halve | ${per(first, (g) => g.lost.length)} | ${per(last, (g) => g.lost.length)} | ${mean(last.map((g) => g.lost.length)) <= mean(first.map((g) => g.lost.length)) / 2 ? 'yes' : 'no'} |`,
  `| Ending naturally | goodbyes in most | — | — | not measurable: the model is told to take its leave on its last reply |`,
  `| Belonging | 2–3 places where they know you | — | ${regulars.size} (${[...regulars].join(', ') || '—'}) | ${regulars.size >= 2 ? 'yes' : 'no'} |`,
  `| Wanting to come back | keeps playing | — | — | not measurable in a model |`,
  '', '## The characters\' part', '',
  '| What the character did | Result |', '|---|---|',
  `| Helped when asked (${asks.length} asks) | English ${pct(asks.filter((a) => a.helped === 'English, briefly').length / Math.max(1, asks.length))}, in the language ${pct(asks.filter((a) => a.helped === 'in the language only').length / Math.max(1, asks.length))}, not helped ${pct(asks.filter((a) => a.helped === 'not helped').length / Math.max(1, asks.length))} |`,
  `| Pulled back when the learner was lost (${lost.length}) | ${pct(lost.filter((x) => x.pulledBack).length / Math.max(1, lost.length))} |`,
  `| Recast a mistake (${mist.length}) | ${pct(mist.filter((m) => m.recast).length / Math.max(1, mist.length))} |`,
  `| Taught something in passing | ${per(graded, (g) => g.teaching)} lines per conversation |`,
  `| Notebook entries a character taught | ${graded.reduce((n, g) => n + g.notebookFromCharacter, 0)} of ${graded.reduce((n, g) => n + g.added, 0)} new entries |`,
  `| Greeted by name on a return visit (${repeats.length}) | ${pct(repeats.filter((g) => g.greetedByName).length / Math.max(1, repeats.length))} |`,
  `| Recalled an earlier visit (${repeats.length}) | ${pct(repeats.filter((g) => g.recalledSomething).length / Math.max(1, repeats.length))} |`,
  '', '## The learner (simulated)', '',
  '| Measure | First 5 | Last 5 |', '|---|---|---|',
  `| Sounds like a real learner (1–10) | ${per(first, (g) => g.learnerRealism)} | ${per(last, (g) => g.learnerRealism)} |`,
  `| Lines too good for the day | ${per(first, (g) => g.learnerTooGood)} | ${per(last, (g) => g.learnerTooGood)} |`,
  `| Lines with English | ${per(first, (g) => g.learnerEnglish)} | ${per(last, (g) => g.learnerEnglish)} |`,
  `| Mistakes per reply | ${per(first, (g) => g.mistakes.length / g.replies)} | ${per(last, (g) => g.mistakes.length / g.replies)} |`,
  `| Earlier notebook entries used | ${per(first, (g) => g.notebookUsed)} | ${per(last, (g) => g.notebookUsed)} |`,
  `| Words a beginner knows (level judge) | ${pct(mean(first.map((g) => g.level)))} | ${pct(mean(last.map((g) => g.level)))} |`,
  '', ...graded.map((g) => `- Day ${g.r.day}, realism ${g.learnerRealism}: ${g.learnerNote}`),
  '', '## By conversation', '', '| Day | Character | Visit | Words | Help asks | Lost | Mistakes (recast) | Teaching | Name | Recalled |', '|---|---|---|---|---|---|---|---|---|---|',
  ...graded.map((g) => `| ${g.r.day} | ${g.c.name} | ${g.visit} | ${g.words} | ${g.helpAsks.length} | ${g.lost.length} | ${g.mistakes.length} (${g.mistakes.filter((m) => m.recast).length}) | ${g.teaching} | ${g.visit > 1 ? (g.greetedByName ? 'yes' : 'no') : '—'} | ${g.visit > 1 ? (g.recalledSomething ? 'yes' : 'no') : '—'} |`),
];
console.log(lines.join('\n'));
writeFileSync(join(OUT, `month-grade-${pack.id}.md`), lines.join('\n'));
console.log(`→ tests/experiments/out/month-grade-${pack.id}.md`);
