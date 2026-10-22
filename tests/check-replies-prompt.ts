// The reply-buttons prompt (content/<country>/prompts/replies.md, lib/replies.ts)
// fills every placeholder and its version has a changelog entry.
import { readFileSync } from 'fs';
import { join } from 'path';
import { cities, pack } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';
import { buildRepliesPrompt, shuffleChoice } from '@/lib/replies';

const failures: string[] = [];
const md = readFileSync(join(process.cwd(), 'content', pack.id, 'prompts', 'replies.md'), 'utf8');
const version = md.match(/^version:\s*(\S+)/m)?.[1];
const newest = (md.split('## Changelog')[1] ?? '').match(/^### ([^\s:]+)/m)?.[1];
if (!version || newest !== version) failures.push(`replies.md: version ${version} but newest changelog entry ${newest ?? 'missing'}`);

const city = cities[0];
const place = city.places.find((p) => characterForPlace(city, p))!;
const character = characterForPlace(city, place)!;
const p = buildRepliesPrompt(character, [{ who: 'npc', transcript: 'Ciao!' }]);
const unfilled = [...p.system.matchAll(/\{(\w+)\}/g)].map((m) => m[1]);
if (unfilled.length) failures.push(`replies.md: unfilled ${unfilled.join(', ')}`);
if (!p.system.includes(character.name)) failures.push('replies.md: the character\'s name should be in the prompt');
if (!p.user.startsWith(`${character.name}: `)) failures.push('the conversation should be labelled with the character\'s name');

// The choose stage: its own block, filled the same way; the reply that fits
// lands first or second at random, and `fits` points at it
const choose = buildRepliesPrompt(character, [{ who: 'npc', transcript: 'Ciao!' }], 'Choose prompt');
const unfilledChoose = [...choose.system.matchAll(/\{(\w+)\}/g)].map((m) => m[1]);
if (unfilledChoose.length) failures.push(`replies.md Choose prompt: unfilled ${unfilledChoose.join(', ')}`);
if (choose.system === p.system) failures.push('the Choose prompt should differ from the System prompt');
const pair = { fits: { line: 'A', en: 'a' }, misfit: { line: 'B', en: 'b' } };
for (const r of [0.1, 0.9]) {
  const s = shuffleChoice(pair, () => r);
  if (s.replies[s.fits ?? -1]?.line !== 'A') failures.push(`shuffleChoice(${r}): fits should point at the reply that fits`);
}
if (shuffleChoice(pair, () => 0.1).fits === shuffleChoice(pair, () => 0.9).fits) failures.push('shuffleChoice: the reply that fits should not always be in the same place');

if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
console.log(`OK: replies.md ${version} fills its placeholders (${pack.id})`);
