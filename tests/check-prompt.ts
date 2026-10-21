// The character prompt must say where the character is, so they can talk about
// their place (Davide at Ponte Pietra, Giulia behind her bar).
import { readFileSync } from 'fs';
import { buildTurnPrompt, promptVersion } from '@/lib/prompts/build-turn-prompt';
import { characterForPlace } from '@/lib/characters/for-place';
import { cities, pack } from '@/content';

const failures: string[] = [];

// The template has a version, and the newest changelog entry is for that version
const md = readFileSync(`content/${pack.id}/prompts/character.md`, 'utf8');
const version = promptVersion();
const changelog = md.split('## Changelog')[1] ?? '';
const newest = changelog.match(/^### ([^\s:]+)/m)?.[1];
if (newest !== version) failures.push(`character.md: version is ${version} but the newest changelog entry is ${newest ?? 'missing'}. Add a changelog entry (what changed, why, what prompted it).`);

// Same rule for the end-of-conversation memory prompt
const memoryMd = readFileSync(`content/${pack.id}/prompts/memory.md`, 'utf8');
const memoryVersion = memoryMd.match(/^version:\s*(\S+)/m)?.[1];
const memoryNewest = (memoryMd.split('## Changelog')[1] ?? '').match(/^### ([^\s:]+)/m)?.[1];
if (memoryNewest !== memoryVersion) failures.push(`memory.md: version is ${memoryVersion} but the newest changelog entry is ${memoryNewest ?? 'missing'}. Add a changelog entry.`);

// And for the conversation quality prompt (lib/quality.ts)
const qualityMd = readFileSync(`content/${pack.id}/prompts/quality.md`, 'utf8');
const qualityVersion = qualityMd.match(/^version:\s*(\S+)/m)?.[1];
const qualityNewest = (qualityMd.split('## Changelog')[1] ?? '').match(/^### ([^\s:]+)/m)?.[1];
if (qualityNewest !== qualityVersion) failures.push(`quality.md: version is ${qualityVersion} but the newest changelog entry is ${qualityNewest ?? 'missing'}. Add a changelog entry.`);

for (const city of cities) {
  for (const place of city.places) {
    const c = characterForPlace(city, place);
    if (!c) continue;
    const { system, messages } = buildTurnPrompt({ character: c, transcript: [] });
    const user = messages.map((m) => m.content).join('\n');
    const unfilled = [...(system + user).matchAll(/\{(\w+)\}/g)].map((m) => m[1]);
    if (unfilled.length) failures.push(`${c.name}: unfilled placeholder(s) ${unfilled.join(', ')}`);
    const expected = place.name;
    if (!system.includes(expected)) failures.push(`${c.name} (${city.name}): prompt doesn't mention "${expected}"`);
  }
}
// The learner's gender reaches the character when known, and leaves no trace when not (2026-10-21)
{
  const city = cities[0];
  const c = characterForPlace(city, city.places.find((pl) => characterForPlace(city, pl))!)!;
  const unset = buildTurnPrompt({ character: c, transcript: [] }).system;
  if (/in front of you/.test(unset)) failures.push('{person}: a line about the learner appears when their gender is unknown');
  if (/\n{3,}/.test(unset)) failures.push('{person}: unset leaves a blank gap in the system prompt');
  if (!buildTurnPrompt({ character: c, transcript: [], addressedAs: 'f' }).system.includes('The person in front of you is a woman.')) failures.push('{person}: addressedAs f is not in the prompt');
  if (!buildTurnPrompt({ character: c, transcript: [], addressedAs: 'm' }).system.includes('The person in front of you is a man.')) failures.push('{person}: addressedAs m is not in the prompt');
}
if (failures.length) {
  console.error(failures.slice(0, 10).join('\n'));
  process.exit(1);
}
console.log(`OK: prompt ${version} has a changelog entry, fills every placeholder, says where each character is, and says who's in front of them only when known`);
