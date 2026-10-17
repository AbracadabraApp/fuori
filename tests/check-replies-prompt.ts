// The reply-buttons prompt (content/<country>/prompts/replies.md, lib/replies.ts)
// fills every placeholder and its version has a changelog entry.
import { readFileSync } from 'fs';
import { join } from 'path';
import { cities, pack } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';
import { buildRepliesPrompt } from '@/lib/replies';

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

if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
console.log(`OK: replies.md ${version} fills its placeholders (${pack.id})`);
