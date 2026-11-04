// The fact judge (content/<country>/prompts/facts.md) on lines a character
// will say as true, before they go into a city file: here lines, cultural
// items. Reads a JSON file of [{ id, text }], prints each verdict and its
// doubts. Well-known facts only; standing facts, never today's news.
//   COUNTRY=it npx tsx --env-file=.env.local scripts/fact-check.mts lines.json
import { readFileSync } from 'node:fs';
import { anthropic, CLAUDE_MODEL, replyText } from '@/lib/claude';
import { readPromptFile } from '@/lib/prompts/template';

const items = JSON.parse(readFileSync(process.argv[2], 'utf8')) as { id: string; text: string }[];
const schema = { type: 'object', additionalProperties: false, required: ['items'], properties: { items: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['id', 'pass', 'doubts'], properties: { id: { type: 'string' }, pass: { type: 'boolean' }, doubts: { type: 'array', items: { type: 'string' } } } } } } };
const r = await anthropic.messages.create({ model: CLAUDE_MODEL, max_tokens: 4000, system: readPromptFile('facts.md').block('Facts'), messages: [{ role: 'user', content: JSON.stringify(items) }], output_config: { format: { type: 'json_schema', schema } } } as Parameters<typeof anthropic.messages.create>[0]);
const verdicts = (JSON.parse(replyText(r as Parameters<typeof replyText>[0])) as { items: { id: string; pass: boolean; doubts: string[] }[] }).items;
for (const v of verdicts) console.log(`${v.pass ? 'pass' : 'FAIL'}  ${v.id}${v.doubts.length ? `\n      ${v.doubts.join('\n      ')}` : ''}`);
if (verdicts.some((v) => !v.pass)) process.exitCode = 1;
