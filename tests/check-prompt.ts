// The character prompt must say where the character is, so they can talk about
// their place (Davide at Ponte Pietra, Giulia behind her bar).
import { readFileSync } from 'fs';
import { buildTurnPrompt, promptVersion } from '@/lib/prompts/build-turn-prompt';
import { characterForPlace } from '@/lib/characters/for-place';
import { cities } from '@/content/it/cities';

const failures: string[] = [];

// The template has a version, and the newest changelog entry is for that version
const md = readFileSync('content/it/prompts/character.md', 'utf8');
const version = promptVersion();
const changelog = md.split('## Changelog')[1] ?? '';
const newest = changelog.match(/^### ([^\s:]+)/m)?.[1];
if (newest !== version) failures.push(`character.md: version is ${version} but the newest changelog entry is ${newest ?? 'missing'}. Add a changelog entry (what changed, why, what prompted it).`);

// Same rule for the end-of-conversation memory prompt
const memoryMd = readFileSync('content/it/prompts/memory.md', 'utf8');
const memoryVersion = memoryMd.match(/^version:\s*(\S+)/m)?.[1];
const memoryNewest = (memoryMd.split('## Changelog')[1] ?? '').match(/^### ([^\s:]+)/m)?.[1];
if (memoryNewest !== memoryVersion) failures.push(`memory.md: version is ${memoryVersion} but the newest changelog entry is ${memoryNewest ?? 'missing'}. Add a changelog entry.`);

// And for the conversation quality prompt (lib/quality.ts)
const qualityMd = readFileSync('content/it/prompts/quality.md', 'utf8');
const qualityVersion = qualityMd.match(/^version:\s*(\S+)/m)?.[1];
const qualityNewest = (qualityMd.split('## Changelog')[1] ?? '').match(/^### ([^\s:]+)/m)?.[1];
if (qualityNewest !== qualityVersion) failures.push(`quality.md: version is ${qualityVersion} but the newest changelog entry is ${qualityNewest ?? 'missing'}. Add a changelog entry.`);

for (const city of cities) {
  for (const place of city.places) {
    const c = characterForPlace(city, place);
    if (!c) continue;
    const { system, user } = buildTurnPrompt({ character: c, transcript: [] });
    const unfilled = [...(system + user).matchAll(/\{(\w+)\}/g)].map((m) => m[1]);
    if (unfilled.length) failures.push(`${c.name}: unfilled placeholder(s) ${unfilled.join(', ')}`);
    const expected = c.origin === 'anchor' ? c.appearance.setting : place.name;
    if (!system.includes(expected)) failures.push(`${c.name} (${city.name}): prompt doesn't mention "${expected}"`);
  }
}
if (failures.length) {
  console.error(failures.slice(0, 10).join('\n'));
  process.exit(1);
}
console.log(`OK: prompt ${version} has a changelog entry, fills every placeholder, and says where each character is`);
