// The experimental level block (content/<country>/prompts/levels.md) changes
// the prompt only when a level is passed: without one, production's prompt is
// exactly today's. Every block fills all its placeholders.
import { readFileSync } from 'fs';
import { join } from 'path';
import { cities, pack } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';
import { buildTurnPrompt } from '@/lib/prompts/build-turn-prompt';

const failures: string[] = [];
const md = readFileSync(join(process.cwd(), 'content', pack.id, 'prompts', 'levels.md'), 'utf8');
const blocks = [...md.matchAll(/^## (.+)\n+```/gm)].map((m) => m[1]);
if (!blocks.length) failures.push('levels.md has no blocks');
const version = md.match(/^version:\s*(\S+)/m)?.[1];
const newest = (md.split('## Changelog')[1] ?? '').match(/^### ([^\s:]+)/m)?.[1];
if (!version || newest !== version) failures.push(`levels.md: version ${version} but newest changelog entry ${newest ?? 'missing'}`);

const city = cities[0];
const place = city.places.find((p) => characterForPlace(city, p))!;
const character = characterForPlace(city, place)!;
const plain = buildTurnPrompt({ character, transcript: [] });
const none = buildTurnPrompt({ character, transcript: [], level: undefined });
if (none.system !== plain.system || none.version !== plain.version) failures.push('no level should leave the prompt unchanged');
for (const level of blocks) {
  const p = buildTurnPrompt({ character, transcript: [], level });
  if (!p.system.startsWith(plain.system)) failures.push(`${level}: should be added after today's prompt, not change it`);
  const unfilled = [...p.system.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).filter((k) => !plain.system.includes(`{${k}}`));
  if (unfilled.length) failures.push(`${level}: unfilled ${unfilled.join(', ')}`);
  if (!p.version.endsWith(`+${level}`)) failures.push(`${level}: version should name the level`);
}
// Placed in the newest message instead, the system prompt stays today's
const atLast = buildTurnPrompt({ character, transcript: [], level: blocks[0], levelAt: 'last' });
if (atLast.system !== plain.system) failures.push('levelAt last should leave the system prompt unchanged');
if (!atLast.messages[atLast.messages.length - 1].content.startsWith('(')) failures.push('levelAt last should open the newest message');

// Magda's own prompt never gets the block
const magda = buildTurnPrompt({ character, transcript: [], system: 'X', level: blocks[0] });
if (magda.system !== 'X') failures.push("a level block was added to Magda's prompt");

if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
console.log(`OK: ${blocks.length} level blocks (${blocks.join(', ')}); no level leaves the prompt unchanged`);
