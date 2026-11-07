/**
 * Gives every city character a stored voice (Josh, 2026-11-07: pooling by age
 * risks more overlap). A hash only spreads voices by luck; this assigns them
 * once, per city, so neighbours differ, and writes `voice: '<id>', // Name`
 * under the character's age in content/<country>/cities/*.ts. A character who
 * already has a voice keeps it, so adding people later never moves anyone.
 *
 * For each character without one, in id order: the voices of their gender and
 * age group (voices.byAge, or the gender's list), skipping any used fewest
 * times in the city; among those, the voice the hash gave them before if it's
 * there (fewer people change voice), otherwise the next by the hash.
 *
 *   COUNTRY=it npx tsx scripts/assign-voices.mts          # write
 *   COUNTRY=it npx tsx scripts/assign-voices.mts --check  # report only
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';
import { pack, voices } from '@/content';
import type { CityCharacter, Gender } from '@/lib/types';

const check = process.argv.includes('--check');
const dir = join('content', pack.id, 'cities');
const voicesSrc = readFileSync(join('content', pack.id, 'voices.ts'), 'utf8');
const names = new Map([...voicesSrc.matchAll(/'([A-Za-z0-9]{20})',\s*\/\/\s*([^-–(\n]+)/g)].map((m) => [m[1], m[2].trim()]));

type Group = 'young' | 'middle' | 'old';
const byAge = (voices as { byAge?: Record<Gender, Record<Group, string[]>> }).byAge;
const groupOf = (age?: number): Group => (age === undefined ? 'middle' : age < 35 ? 'young' : age >= 60 ? 'old' : 'middle');
const poolFor = (c: CityCharacter) => (byAge ? byAge[c.gender][groupOf(c.age)] : voices.elevenlabs[c.gender]);
const hash = (s: string) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; };

// The voice each character had before stored voices (a hash over the
// gender's list on main), preferred when it fits, so fewer people change
// voice. From git; without it, no preference.
const previous = (() => {
  try {
    const old = execSync(`git show origin/main:content/${pack.id}/voices.ts`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    if (old.includes('byAge')) return null;
    const block = (g: Gender) => [...(old.split(`${g}: [`)[1] ?? '').split(']')[0].matchAll(/'([A-Za-z0-9]{20})'/g)].map((m) => m[1]);
    const pools = { f: block('f'), m: block('m') };
    return (c: CityCharacter) => pools[c.gender][hash(c.id) % pools[c.gender].length];
  } catch {
    return null;
  }
})();

let assigned = 0, kept = 0, sameAsBefore = 0, worst = 0;
// One person can be in two city files (Rome's hidden original and Roma nuova): one voice for an id everywhere
const byId = new Map<string, string>();
for (const file of readdirSync(dir).filter((f) => f.endsWith('.ts') && f !== 'index.ts')) {
  let src = readFileSync(join(dir, file), 'utf8');
  const mod = await import(`../${dir}/${file}`);
  const city = Object.values(mod).find((v): v is { characters?: CityCharacter[] } => typeof v === 'object' && v !== null && 'characters' in v);
  const people = [...(city?.characters ?? [])].filter((c) => c.gender).sort((a, b) => a.id.localeCompare(b.id));
  const used = new Map<string, number>();
  for (const c of people) if (c.voice) { used.set(c.voice, (used.get(c.voice) ?? 0) + 1); byId.set(c.id, c.voice); kept++; }
  for (const c of people) {
    if (c.voice) continue;
    const pool = poolFor(c);
    const least = Math.min(...pool.map((v) => used.get(v) ?? 0));
    const free = pool.filter((v) => (used.get(v) ?? 0) === least);
    const before = previous?.(c);
    const voice = byId.get(c.id) ?? (before && free.includes(before) ? before : free[hash(c.id) % free.length]);
    byId.set(c.id, voice);
    if (voice === before) sameAsBefore++;
    used.set(voice, (used.get(voice) ?? 0) + 1);
    assigned++;
    // Under the character's age line, inside its own object
    const start = src.indexOf(`id: '${c.id}'`);
    const ageAt = src.indexOf('age:', start);
    const lineEnd = src.indexOf('\n', ageAt);
    const indent = src.slice(src.lastIndexOf('\n', ageAt) + 1, ageAt);
    if (start < 0 || ageAt < 0) throw new Error(`${file}: can't place ${c.id}`);
    src = `${src.slice(0, lineEnd + 1)}${indent}voice: '${voice}', // ${names.get(voice) ?? '?'}\n${src.slice(lineEnd + 1)}`;
  }
  worst = Math.max(worst, ...used.values());
  if (!check) writeFileSync(join(dir, file), src);
}
console.log(`${pack.id}: ${assigned} assigned (${sameAsBefore} keep the voice they had), ${kept} already had one; most people on one voice in a city: ${worst}${check ? ' (check only)' : ''}`);

