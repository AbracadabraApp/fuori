// The fact judge (content/<country>/prompts/facts.md, the same prompt as
// scripts/fact-check.mts) on the cinema's film pages (content/<country>/cinema-pages.json):
// each film's WhyWatch (reasons and context, the Italian) and each More Idea's
// reason, ten films per call. Writes the verdicts to
// content/<country>/cinema-pages.facts.json for the cloud session to fix the
// failures, and prints a summary. Josh, 2026-11-06: "use fact judge for later sweep".
//   COUNTRY=it npx tsx --env-file=.env.local scripts/cinema-fact-check.mts [--only 11010,307]
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { anthropic, CLAUDE_MODEL, replyText } from '@/lib/claude';
import { readPromptFile } from '@/lib/prompts/template';
import { pack } from '@/content';

type Page = {
  whyWatch: { reasons: string[]; context: string };
  moreIdeas: { title: string; year: number; connection: string }[];
};
const dir = join(process.cwd(), 'content', pack.id);
const pages = (JSON.parse(readFileSync(join(dir, 'cinema-pages.json'), 'utf8')) as { films: Record<string, Page> }).films;
const library = JSON.parse(readFileSync(join(dir, 'cinema-library.json'), 'utf8')) as { films: { tmdbId: number; title: string; year: number }[] };
const name = new Map(library.films.map((f) => [String(f.tmdbId), `${f.title} (${f.year})`]));
const only = process.argv.includes('--only') ? new Set(process.argv[process.argv.indexOf('--only') + 1].split(',')) : null;

// One item per claim-bearing text, each naming the film it is about, so the judge knows the subject
const items: { id: string; text: string }[] = [];
for (const [id, page] of Object.entries(pages)) {
  if (only && !only.has(id)) continue;
  const film = name.get(id) ?? id;
  items.push({ id: `${id}:why`, text: `About the film ${film}: ${page.whyWatch.reasons.join('. ')}. ${page.whyWatch.context}` });
  page.moreIdeas.forEach((idea, i) => items.push({ id: `${id}:idea:${i}`, text: `${idea.title} (${idea.year}), suggested to someone who liked ${film}: ${idea.connection}` }));
}

const schema = { type: 'object', additionalProperties: false, required: ['items'], properties: { items: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['id', 'pass', 'doubts'], properties: { id: { type: 'string' }, pass: { type: 'boolean' }, doubts: { type: 'array', items: { type: 'string' } } } } } } };
const system = readPromptFile('facts.md').block('Facts');
const verdicts: { id: string; pass: boolean; doubts: string[]; text: string }[] = [];
const BATCH = 44; // about four films' items per call
for (let i = 0; i < items.length; i += BATCH) {
  const batch = items.slice(i, i + BATCH);
  for (let attempt = 0; ; attempt++) {
    try {
      const r = await anthropic.messages.create({ model: CLAUDE_MODEL, max_tokens: 8000, system, messages: [{ role: 'user', content: JSON.stringify(batch) }], output_config: { format: { type: 'json_schema', schema } } } as Parameters<typeof anthropic.messages.create>[0]);
      const got = (JSON.parse(replyText(r as Parameters<typeof replyText>[0])) as { items: { id: string; pass: boolean; doubts: string[] }[] }).items;
      const text = new Map(batch.map((b) => [b.id, b.text]));
      for (const v of got) verdicts.push({ ...v, text: text.get(v.id) ?? '' });
      const missing = batch.filter((b) => !got.some((v) => v.id === b.id));
      if (missing.length) console.log(`  no verdict for ${missing.map((m) => m.id).join(', ')}`);
      break;
    } catch (err) {
      if (attempt >= 2) throw err;
      await new Promise((r) => setTimeout(r, 5000 * (attempt + 1)));
    }
  }
  process.stdout.write(`\r${Math.min(i + BATCH, items.length)} of ${items.length} checked`);
}
console.log();
const failed = verdicts.filter((v) => !v.pass);
writeFileSync(join(dir, 'cinema-pages.facts.json'), JSON.stringify({ checked: verdicts.length, failed }, null, 1) + '\n');
for (const v of failed) console.log(`FAIL  ${v.id}\n      ${v.doubts.join('\n      ')}`);
console.log(`\n${verdicts.length} checked, ${failed.length} failed (${failed.filter((v) => v.id.endsWith(':why')).length} WhyWatch, ${failed.filter((v) => v.id.includes(':idea:')).length} ideas). Written to content/${pack.id}/cinema-pages.facts.json`);
