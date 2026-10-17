// Every image the game uses must be in R2 and up to date (docs/12-native-app.md):
// content/<country>/images.json lists each uploaded image with a fingerprint
// of the JPEG it came from. Catches an image that was generated or replaced
// but never uploaded, so the app would show the old picture or none.
// Fix: npm run images:upload (COUNTRY=es-mx for Mexico), then commit images.json.
// Offline: compares files, doesn't call R2.
import { createHash } from 'crypto';
import { existsSync, readFileSync } from 'fs';
import { cities, pack, tutor, country } from '@/content';

const listPath = `content/${country}/images.json`;
if (!existsSync(listPath)) {
  console.error(`FAIL: ${listPath} is missing. Run npm run images:upload`);
  process.exit(1);
}
const list = JSON.parse(readFileSync(listPath, 'utf8')) as {
  base: string;
  images: Record<string, { key: string; src: string }>;
};

const used: string[] = [];
for (const city of cities) {
  used.push(`cities/${city.id}`);
  for (const place of city.places) used.push(`places/${place.id}`);
  for (const person of city.characters ?? []) used.push(`portraits/${person.id}`);
}
used.push(`portraits/${tutor.id}`);

const problems: string[] = [];
if (!/^https:\/\//.test(list.base)) problems.push(`base "${list.base}" is not an https address`);
for (const id of new Set(used)) {
  const jpg = `public${pack.images}/${id}.jpg`;
  if (!existsSync(jpg)) continue; // a missing JPEG is test:images' job
  const entry = list.images[id];
  const src = createHash('sha256').update(readFileSync(jpg)).digest('hex').slice(0, 16);
  if (!entry) problems.push(`${id}: not uploaded`);
  else if (entry.src !== src) problems.push(`${id}: the JPEG changed since it was uploaded`);
  else if (!entry.key.startsWith(`${country}/${id}.`)) problems.push(`${id}: key "${entry.key}" doesn't match`);
}

if (problems.length) {
  console.error(`FAIL: ${problems.length} image(s) not in R2 or out of date (npm run images:upload, then commit ${listPath})\n- ${problems.slice(0, 30).join('\n- ')}`);
  process.exit(1);
}
console.log(`OK: all ${new Set(used).size} images the game uses are in R2 and match their JPEGs (${listPath})`);
