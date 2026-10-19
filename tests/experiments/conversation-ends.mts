// When is a conversation over, and what happens after? (round 19; Josh,
// 2026-10-19: "there are points where the conversation is clearly over from
// context but there is no polite way to exit"). Today the only exits are back,
// swipe and "Sali"; the character's reply is { line, en } with no end signal.
// A judge reads each real conversation, numbered turn by turn, and says where
// it was first naturally over (if anywhere) and what happened after.
//   npx tsx --env-file=.env.local tests/experiments/conversation-ends.mts tests/experiments/out/admin.json   (COUNTRY as needed)
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { cities, language, pack } from '@/content';
import { findCharacter } from '@/lib/remember';
import { OUT, ask, mean, pct, pool } from './common.mjs';

type Row = { id: string; character_id: string; city_id: string; started_at: string; ended_at?: string; turns: { who: string; text: string; at?: string }[] };
const [input] = process.argv.slice(2);
const here = new Set(cities.map((c) => c.id));
const rows = (JSON.parse(readFileSync(input, 'utf8')) as Row[])
  .filter((r) => here.has(r.city_id) && r.turns.filter((t) => t.who === 'learner').length >= 2 && findCharacter(r.city_id, r.character_id));

const AFTER = ['left soon', 'character kept it going', 'learner said goodbye, character kept it going', 'learner started something new', 'other'] as const;
const schema = {
  type: 'object', additionalProperties: false, required: ['overAt', 'why', 'after', 'goodbyeAt', 'note'],
  properties: {
    overAt: { type: ['integer', 'null'] },
    why: { type: 'string' },
    after: { type: 'string', enum: [...AFTER, 'never over'] },
    goodbyeAt: { type: ['integer', 'null'] },
    note: { type: 'string' },
  },
};
const prompt = (r: Row, name: string, role: string) => `In a ${language.name} conversation game, a learner talks by voice with ${name} (${role}). The learner leaves whenever they like by tapping back; the character can't end the conversation. Here is a real conversation, numbered:

${r.turns.map((t, i) => `${i + 1}. ${t.who === 'learner' ? 'Learner' : name}: ${t.text}`).join('\n')}
(The learner left after turn ${r.turns.length}.)

- overAt: the first turn after which the conversation is naturally over, the way a real one would be (the errand is done and someone has closed it, or it has clearly run its course and a person would now say goodbye). null if it never got there.
- why: one short line.
- after: what happened after overAt: "left soon" (within one more exchange), "character kept it going" (a new question or topic from the character), "learner said goodbye, character kept it going", "learner started something new", "other", or "never over".
- goodbyeAt: the first learner turn that says goodbye or thanks-and-leaving, or null.
- note: one short line.
Reply with JSON.`;

type Result = { id: string; name: string; turns: number; overAt: number | null; why: string; after: string; goodbyeAt: number | null; note: string; tailSeconds: number | null };
const results = await pool(rows.map((r) => async (): Promise<Result> => {
  const c = findCharacter(r.city_id, r.character_id)!;
  const j = JSON.parse(await ask(prompt(r, c.name, c.role), { schema })) as Omit<Result, 'id' | 'name' | 'turns' | 'tailSeconds'>;
  const at = j.overAt && r.turns[j.overAt - 1]?.at;
  const tailSeconds = at && r.ended_at ? Math.round((Date.parse(r.ended_at) - Date.parse(at)) / 1000) : null;
  return { id: r.id, name: c.name, turns: r.turns.length, ...j, tailSeconds };
}), 6);

const over = results.filter((r) => r.overAt);
const extra = over.map((r) => r.turns - r.overAt!);
const lines = [
  `# Conversation ends, ${pack.id} (round 19)`, '',
  `${results.length} real conversations (2+ learner lines).`, '',
  '| Measure | Value |', '|---|---|',
  `| Naturally over before the learner left | ${pct(over.length / results.length)} (${over.length}) |`,
  `| Turns after that point, mean | ${mean(extra).toFixed(1)} |`,
  `| Seconds from that point to leaving, median | ${(() => { const s = over.map((r) => r.tailSeconds).filter((x): x is number => x != null).sort((a, b) => a - b); return s.length ? s[Math.floor(s.length / 2)] : '—'; })()} |`,
  `| Learner said goodbye at some point | ${pct(results.filter((r) => r.goodbyeAt).length / results.length)} |`,
  '', '| After the natural end | Conversations |', '|---|---|',
  ...[...AFTER, 'never over'].map((a) => `| ${a} | ${results.filter((r) => r.after === a).length} |`), '',
];
console.log(lines.join('\n'));
writeFileSync(join(OUT, `conversation-ends-${pack.id}.json`), JSON.stringify(results, null, 2));
writeFileSync(join(OUT, `conversation-ends-${pack.id}.md`), [...lines, '## Each conversation', '',
  ...results.map((r) => `- **${r.name}** (${r.turns} turns): over at ${r.overAt ?? '—'}, ${r.after}${r.goodbyeAt ? `, goodbye at ${r.goodbyeAt}` : ''}, ${r.tailSeconds ?? '—'} s after. ${r.why} ${r.note}`),
].join('\n'));
console.log(`→ tests/experiments/out/conversation-ends-${pack.id}.md`);
