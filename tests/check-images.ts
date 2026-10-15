// Every city, place and city character needs an image file. Catches images saved
// under the wrong name (18 first-of-city places were saved as <city>.jpg) and
// places with no image description (Roma). Fix: npm run images -- --city <id>
// Also fails on image files nothing uses (39 old variants, 24 MB, found 2026-10-14),
// so they don't pile up again. A file named anywhere in app/, lib/ or content/ counts as used.
import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';
import { cities, anchors, pack, tutor } from '@/content';

const used = new Set<string>();

const missing: string[] = [];
for (const city of cities) {
  used.add(`cities/${city.id}.jpg`);
  if (!existsSync(`public${pack.images}/cities/${city.id}.jpg`)) missing.push(`cities/${city.id}.jpg`);
  for (const place of city.places) {
    used.add(`places/${place.id}.jpg`);
    if (!existsSync(`public${pack.images}/places/${place.id}.jpg`)) {
      missing.push(`places/${place.id}.jpg (${city.id}${place.imagePrompt ? '' : ', no imagePrompt'})`);
    }
  }
  for (const person of city.characters ?? []) {
    used.add(`portraits/${person.id}.jpg`);
    if (!existsSync(`public${pack.images}/portraits/${person.id}.jpg`)) missing.push(`portraits/${person.id}.jpg (${city.id})`);
  }
}

for (const anchor of Object.values(anchors)) {
  used.add(`portraits/${anchor.id}.jpg`);
  if (!existsSync(`public${pack.images}/portraits/${anchor.id}.jpg`)) missing.push(`portraits/${anchor.id}.jpg (anchor; prompt in content/${pack.id}/characters/${anchor.id}.ts)`);
}

used.add(`portraits/${tutor.id}.jpg`);
if (!existsSync(`public${pack.images}/portraits/${tutor.id}.jpg`)) missing.push(`portraits/${tutor.id}.jpg (tutor)`);

// Source text, to catch images referred to by full path rather than by id
function sourceText(dir: string): string {
  return readdirSync(dir).map((f) => {
    const full = join(dir, f);
    if (statSync(full).isDirectory()) return sourceText(full);
    return /\.(ts|tsx|json|md|css)$/.test(f) ? readFileSync(full, 'utf8') : '';
  }).join('\n');
}
const source = ['app', 'lib', 'content'].map(sourceText).join('\n');

const unused: string[] = [];
for (const folder of ['cities', 'places', 'portraits']) {
  const dir = `public${pack.images}/${folder}`;
  if (!existsSync(dir)) continue;
  for (const file of readdirSync(dir)) {
    const rel = `${folder}/${file}`;
    if (used.has(rel)) continue;
    if (source.includes(`${pack.images}/${rel}`)) continue;
    unused.push(rel);
  }
}

if (unused.length) {
  console.error(`${unused.length} image file(s) nothing uses (delete them, git keeps them):\n` + unused.join('\n'));
}
if (missing.length) {
  console.error(`${missing.length} missing image(s):\n` + missing.join('\n'));
}
if (missing.length || unused.length) process.exit(1);
console.log('OK: every city, place and city character has an image, and every image is used');
