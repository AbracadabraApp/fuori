// What kind of question each character line ends on, and could a beginner answer it
// (rounds 5-6 and 15: the question ladder, the "X o Y?" order form).
//   npx tsx --env-file=.env.local tests/experiments/question-kinds.mts <label>=<report.md> ...   (COUNTRY as needed)
import { readFileSync } from 'node:fs';
import { language } from '@/content';
import { ask, labelled, pct, pool, reportConversations } from './common.mjs';

const schema = { type: 'object', additionalProperties: false, required: ['kind', 'beginner'], properties: { kind: { type: 'string', enum: ['none', 'yesno', 'choice', 'short', 'open'] }, beginner: { type: 'boolean' } } };
const prompt = (t: string) => `A character in a ${language.name} conversation game says this to a learner:\n\n${t}\n\nDoes it leave the learner something to answer?\n- none: no question or invitation to reply\n- yesno: answerable with yes or no\n- choice: offers options to pick from ("coffee or tea?")\n- short: asks for one fact (a name, a place, a number, a thing)\n- open: asks for an opinion, story or explanation\nbeginner: could someone who arrived a few weeks ago, knowing only greetings, ordering and simple questions, understand what's asked and answer it in a word or two?\nReply with JSON: kind, beginner.`;

for (const { label, path } of labelled(process.argv.slice(2))) {
  const lines = reportConversations(readFileSync(path, 'utf8')).flatMap((c) => c.turns.filter((t) => t.who === 'npc').map((t) => t.text));
  const res = (await pool(lines.map((l) => () => ask(prompt(l), { schema }).then((s) => JSON.parse(s) as { kind: string; beginner: boolean }).catch(() => null)))).filter((r): r is { kind: string; beginner: boolean } => !!r);
  const p = (f: (r: { kind: string; beginner: boolean }) => boolean) => pct(res.filter(f).length / res.length);
  console.log(`${label.padEnd(14)} ${res.length} lines · none ${p((r) => r.kind === 'none')} · yes/no ${p((r) => r.kind === 'yesno')} · choice ${p((r) => r.kind === 'choice')} · short ${p((r) => r.kind === 'short')} · open ${p((r) => r.kind === 'open')} · beginner can answer ${p((r) => r.kind !== 'none' && r.beginner)} · unjudged ${lines.length - res.length}`);
}
