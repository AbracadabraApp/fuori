/**
 * Place-image style test (content/<country>/style-test.json). For each listed
 * place, generates the city's own style and an abstract version from the
 * place's existing scene description, into style-test/<country>/ (not
 * committed), and writes an index.html contact sheet: current image | city
 * style | abstract. Doesn't touch public/images or the manifest.
 *
 *   COUNTRY=es-mx npm run style-test            # generate what's missing
 *   COUNTRY=es-mx npm run style-test -- --dry   # print the prompts only
 *   COUNTRY=es-mx npm run style-test -- --only textures,roma-condesa
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { cleanScene } from './lib/place-prompt.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const COUNTRY = process.env.COUNTRY || 'es-mx';
const DRY = process.argv.includes('--dry');
const CITY_ONLY = !process.argv.includes('--abstract'); // abstract dropped after round 1 (Josh)
// --only a,b: generate just these styles (e.g. --only textures,roma-condesa)
const onlyArg = process.argv.find((x, i) => process.argv[i - 1] === '--only');
const ONLY = onlyArg ? new Set(onlyArg.split(',')) : null;
const test = JSON.parse(fs.readFileSync(path.join(ROOT, 'content', COUNTRY, 'style-test.json'), 'utf8'));
const gen = JSON.parse(fs.readFileSync(path.join(ROOT, 'content', COUNTRY, 'generation.json'), 'utf8'));
const size = gen.images?.place ?? {};
const OUT = path.join(ROOT, 'style-test', COUNTRY + (test.round ? `-round${test.round}` : ''));

// The scene for a place: its imagePrompt without the old style opening and the colour line
function sceneFor(cityId, placeId) {
  const src = fs.readFileSync(path.join(ROOT, 'content', COUNTRY, 'cities', `${cityId}.ts`), 'utf8');
  const m = src.match(new RegExp(`id: '${placeId}',[\\s\\S]*?imagePrompt: '((?:[^'\\\\]|\\\\.)*)'`));
  if (!m) throw new Error(`no imagePrompt for ${cityId}/${placeId}`);
  return cleanScene(m[1]);
}

async function generate(prompt, file) {
  if (fs.existsSync(file)) return 'kept';
  if (DRY) return 'dry';
  const res = await fetch('https://api.x.ai/v1/images/generations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.XAI_API_KEY}` },
    body: JSON.stringify({ model: 'grok-imagine-image-2.0', prompt, n: 1, ...(size.aspect_ratio ? { aspect_ratio: size.aspect_ratio } : {}), ...(size.resolution ? { resolution: size.resolution } : {}) }),
  });
  if (!res.ok) throw new Error(`xAI ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  const img = await fetch(data.data[0].url);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, Buffer.from(await img.arrayBuffer()));
  return 'made';
}

const rows = [];
for (const [cityId, c] of Object.entries(test.cities)) {
  if ((test.skip ?? []).includes(cityId)) continue;
  for (const placeId of c.places) {
    const scene = sceneFor(cityId, placeId);
    // A city can list several styles to try ("styles": {name: style line}); else its one style
    const styleSet = c.styles ?? { city: c.style };
    const variants = {
      ...Object.fromEntries(Object.entries(styleSet).map(([n, st]) => [n, `${st}. The scene: ${scene} ${test.rulesFor?.[n] ?? test.rules} Square format.`])),
      abstract: `${test.abstract}: ${c.colours}. The scene: ${scene} ${test.rules} Square format.`,
    };
    const row = { cityId, placeId, files: {} };
    for (const [v, prompt] of Object.entries(variants)) {
      if (CITY_ONLY && v === 'abstract') continue;
      if (ONLY && !ONLY.has(v)) continue;
      const file = path.join(OUT, v, `${placeId}.jpg`);
      if (DRY) console.log(`\n[${cityId} / ${placeId} / ${v}]\n${prompt}`);
      try {
        console.log(`${cityId}/${placeId} ${v}: ${await generate(prompt, file)}`);
      } catch (e) {
        console.error(`${cityId}/${placeId} ${v}: FAILED ${e.message}`);
      }
      if (!(CITY_ONLY && v === 'abstract') && (!ONLY || ONLY.has(v))) row.files[v] = `${v}/${placeId}.jpg`;
    }
    rows.push(row);
  }
}

// Contact sheet: current | city style | abstract
const current = (id) => path.relative(OUT, path.join(ROOT, 'public', gen.images?.dir ?? 'images', 'places', `${id}.jpg`));
const html = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>Place style test</title>
<style>body{font:16px system-ui;margin:16px;background:#f5f1ed}h2{margin:28px 0 8px;font-size:18px}
.r{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:8px}.r figure{margin:0}.r img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:6px;background:#ddd}
figcaption{font-size:13px;color:#555;margin-top:4px}</style>
<h1>Place style test: ${COUNTRY}</h1>
${rows.map((r) => `<h2>${r.cityId} · ${r.placeId}</h2><div class="r">
<figure><img src="${current(r.placeId)}"><figcaption>Now</figcaption></figure>
${Object.entries(r.files).map(([v, f]) => `<figure><img src="${f}"><figcaption>${v}</figcaption></figure>`).join('')}</div>`).join('\n')}`;
if (!DRY) {
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, 'index.html'), html);
  console.log(`\nContact sheet: ${path.join(OUT, 'index.html')}`);
}
