// Say it in English (lib/say-it.ts, app/v1/transcribe mode "turn"): which
// language a turn was spoken in, and the prompt fills every placeholder
import { readFileSync } from 'node:fs';
import { spokenLanguage } from '@/lib/speech/spoken-language';
import { buildSayItPrompt, sayItPromptVersion } from '@/lib/say-it';
import { cities, pack } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';

const failures: string[] = [];
const expect = (what: string, got: unknown, want: unknown) => { if (got !== want) failures.push(`${what}: expected ${want}, got ${got}`); };

expect('english by name', spokenLanguage('english', 'it'), 'en');
expect('english by code', spokenLanguage('en', 'it'), 'en');
expect('italian by name', spokenLanguage('italian', 'it'), 'learned');
expect('Italian, capitalised', spokenLanguage('Italian', 'it'), 'learned');
expect('spanish by name, learning es', spokenLanguage('spanish', 'es'), 'learned');
expect('italian by code', spokenLanguage('it', 'it'), 'learned');
expect('a misnamed accent', spokenLanguage('romanian', 'it'), 'other');
expect('nothing named', spokenLanguage(undefined, 'it'), 'other');

const city = cities[0];
const place = city.places.find((p) => characterForPlace(city, p))!;
const character = characterForPlace(city, place)!;
const p = buildSayItPrompt(character, [{ who: 'npc', transcript: 'Ciao!' }], "I'd like a coffee", 'beginner');
const unfilled = [...p.system.matchAll(/\{(\w+)\}/g)].map((m) => m[1]);
if (unfilled.length) failures.push(`say-it.md: unfilled ${unfilled.join(', ')}`);
if (!p.system.includes(character.name)) failures.push('say-it.md: the character should be named');
if (!p.user.includes("I'd like a coffee")) failures.push('the English should be in the message');
const md = readFileSync(`content/${pack.id}/prompts/say-it.md`, 'utf8');
const newest = (md.split('## Changelog')[1] ?? '').match(/^### ([^\s:]+)/m)?.[1];
if (newest !== sayItPromptVersion()) failures.push(`say-it.md: version ${sayItPromptVersion()} but newest changelog entry ${newest}`);

if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
console.log(`OK: say it in English: languages told apart, say-it.md ${sayItPromptVersion()} fills its placeholders (${pack.id})`);
