// When a learner asked for help in real conversations, did the character's
// spoken line carry English, or only the translation shown under it? (round 21;
// Josh, 2026-10-19, before dropping the English translation line: "the majority
// of the time they do" help). A judge reads each conversation and lists every
// learner turn that asks for help, and how the next character line answered.
//   npx tsx --env-file=.env.local tests/experiments/help-asks.mts tests/experiments/out/admin.json   (COUNTRY as needed)
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { cities, language, pack } from '@/content';
import { findCharacter } from '@/lib/remember';
import { OUT, ask, pct, pool } from './common.mjs';

type Row = { id: string; character_id: string; city_id: string; turns: { who: string; text: string; en?: string }[] };
const [input] = process.argv.slice(2);
const here = new Set(cities.map((c) => c.id));
const rows = (JSON.parse(readFileSync(input, 'utf8')) as Row[]).filter((r) => here.has(r.city_id) && r.character_id !== 'magda' && r.turns.some((t) => t.who === 'learner') && findCharacter(r.city_id, r.character_id));

const HOW = ['English in the spoken line', 'helped in the language only', 'ignored the ask'] as const;
const schema = { type: 'object', additionalProperties: false, required: ['asks'], properties: { asks: { type: 'array', items: {
  type: 'object', additionalProperties: false, required: ['turn', 'wantsEnglish', 'how', 'note'],
  properties: { turn: { type: 'integer' }, wantsEnglish: { type: 'boolean' }, how: { type: 'string', enum: [...HOW] }, note: { type: 'string' } },
} } } };
const prompt = (r: Row, name: string) => `A ${language.name} conversation game, by voice. Under each of ${name}'s lines the game shows an English translation (in brackets here); the learner hears only the line itself.

${r.turns.map((t, i) => `${i + 1}. ${t.who === 'learner' ? 'Learner' : name}: ${t.text}${t.who !== 'learner' && t.en ? ` [${t.en}]` : ''}`).join('\n')}

List every learner turn that asks for help: not understanding, asking what something means, how to say something, to repeat or slow down, or for English. For each:
- turn: its number
- wantsEnglish: they asked for English, or asked what something means or how to say something
- how: the next ${name} line: "English in the spoken line" (English words in the line itself, not only the bracket), "helped in the language only" (repeated, simplified, rephrased in ${language.name}), or "ignored the ask"
- note: one short line
Reply with JSON: asks (empty if none).`;

type Ask = { conv: string; name: string; turn: number; wantsEnglish: boolean; how: string; note: string };
const asks = (await pool(rows.map((r) => async () => {
  const c = findCharacter(r.city_id, r.character_id)!;
  const j = JSON.parse(await ask(prompt(r, c.name), { schema })) as { asks: Omit<Ask, 'conv' | 'name'>[] };
  return j.asks.map((a) => ({ conv: r.id, name: c.name, ...a }));
}), 6)).flat();

const row = (label: string, xs: Ask[]) => `| ${label} | ${xs.length} | ${HOW.map((h) => xs.length ? pct(xs.filter((a) => a.how === h).length / xs.length) : '—').join(' | ')} |`;
const lines = [`# Help asks in real conversations, ${pack.id} (round 21)`, '', `${rows.length} conversations (Magda left out).`, '',
  `| Ask | Asks | ${HOW.join(' | ')} |`, '|---|---|---|---|---|',
  row('Wanted English (meaning, how to say, in English)', asks.filter((a) => a.wantsEnglish)),
  row('Other help (repeat, slower, didn\'t understand)', asks.filter((a) => !a.wantsEnglish)),
  row('All', asks), ''];
console.log(lines.join('\n'));
writeFileSync(join(OUT, `help-asks-${pack.id}.md`), [...lines, ...asks.map((a) => `- ${a.name} turn ${a.turn} (${a.wantsEnglish ? 'English' : 'other'}): ${a.how}. ${a.note}`)].join('\n'));
console.log(`→ tests/experiments/out/help-asks-${pack.id}.md`);
