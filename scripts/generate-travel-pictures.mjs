/**
 * The trip map's pictures: candidate maps with no cities on them, and one
 * building per city for the departures board (docs/station-feature-decision.md
 * → Board, map, city). Italy's were made by hand, prompt by prompt, 2026-11-11;
 * this does the same from prompts kept in content/<country>/generation.json →
 * travel, so Mexico's can be redrawn and added to (docs/mexico-north-recipe.md).
 *
 * Sketches only: everything is saved to design/trip-map/<folder>/ for Josh to
 * pick from. Nothing here touches public/images or the app; turning the chosen
 * map and buildings into masters is a separate step (the recipe, step 5).
 *
 *   COUNTRY=es-mx node --env-file=.env.local scripts/generate-travel-pictures.mjs --maps 2
 *       two maps in each look, and the sample building in each look
 *   ... --buildings --look soft-flat            every city's building in the chosen look
 *   ... --buildings --look soft-flat --only napoli,veracruz --alt
 *       redo some; --alt draws the fallback landmark where one is given
 *   add --dry to print the prompts and draw nothing; --force to redraw what exists
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const COUNTRY = process.env.COUNTRY || 'it';
const generation = JSON.parse(fs.readFileSync(path.join(ROOT, 'content', COUNTRY, 'generation.json'), 'utf8'));
const travel = generation.travel;
if (!travel) {
  console.error(`content/${COUNTRY}/generation.json has no "travel" section`);
  process.exit(1);
}

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const value = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
const dry = flag('--dry');
const force = flag('--force');
const only = value('--only')?.split(',');
const OUT = path.join(ROOT, 'design', 'trip-map', travel.folder);

/** A look's map prompt: its own opening sentence, then the shared body (the outline, the seas, no cities) */
const mapPrompt = (look) => `${look.map} ${look.landscape === false ? travel.mapBodyPlain : travel.mapBody}`;
/** A building's prompt in a look */
const buildingPrompt = (look, landmark, cityName) =>
  travel.buildingPrompt.replace('[LANDMARK]', landmark).replace('[CITY]', cityName).replace('[LOOK]', look.building);

async function draw(prompt, aspect) {
  const response = await fetch('https://api.x.ai/v1/images/generations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.XAI_API_KEY}` },
    // The same call scripts/generate-images.mjs makes: the picture comes back in the response
    body: JSON.stringify({ model: 'grok-imagine-image-2.0', prompt, n: 1, response_format: 'b64_json', aspect_ratio: aspect, resolution: '2k' }),
  });
  if (!response.ok) throw new Error(`xAI error ${response.status}: ${(await response.text()).slice(0, 200)}`);
  return Buffer.from((await response.json()).data[0].b64_json, 'base64');
}

/** name has no extension: the file is saved as what the model sent back (.png or .jpg) */
async function make(name, prompt, aspect) {
  if (dry) return console.log(`\n[${name}] (${aspect})\n${prompt}`);
  const existing = ['.png', '.jpg'].map((ext) => path.join(OUT, name + ext)).find((f) => fs.existsSync(f));
  if (existing && !force) return console.log(`skip ${path.basename(existing)} (exists; --force redraws)`);
  const file = name;
  try {
    fs.mkdirSync(OUT, { recursive: true });
    const picture = await draw(prompt, aspect);
    const ext = picture.subarray(0, 4).toString('hex') === '89504e47' ? '.png' : '.jpg';
    if (existing) fs.rmSync(existing);
    fs.writeFileSync(path.join(OUT, name + ext), picture);
    console.log(`drew ${name}${ext}`);
  } catch (e) {
    failed.push(file);
    console.error(`FAILED ${file}: ${e.message}`);
  }
}

const failed = [];
if (!dry && !process.env.XAI_API_KEY) {
  console.error('XAI_API_KEY is not set (run with --env-file=.env.local, or --dry to print the prompts)');
  process.exit(1);
}
const looks = Object.entries(travel.looks).filter(([id]) => !value('--look') || id === value('--look'));
if (!looks.length) {
  console.error(`no look "${value('--look')}"; the looks are ${Object.keys(travel.looks).join(', ')}`);
  process.exit(1);
}

if (flag('--maps')) {
  const count = Number(value('--maps')) || 2;
  const sample = travel.buildings[travel.sampleBuilding];
  for (const [id, look] of looks) {
    // --aspect 5:4 tries another shape without replacing the maps already drawn: the shape goes in the name
    const aspect = value('--aspect') || travel.mapAspect;
    const tag = value('--aspect') ? `-${aspect.replace(':', 'x')}` : '';
    for (let n = 1; n <= count; n++) await make(`map-${id}${tag}-${n}`, mapPrompt(look), aspect);
    await make(`sample-${id}-building-${travel.sampleBuilding}`, buildingPrompt(look, sample.landmark, sample.name), '1:1');
  }
}

if (flag('--buildings')) {
  if (looks.length !== 1) {
    console.error('--buildings needs the chosen look: --look <id>');
    process.exit(1);
  }
  const [, look] = looks[0];
  for (const [cityId, b] of Object.entries(travel.buildings)) {
    if (only && !only.includes(cityId)) continue;
    const landmark = flag('--alt') && b.alt ? b.alt : b.landmark;
    await make(`building-${cityId}`, buildingPrompt(look, landmark, b.name), '1:1');
  }
}

if (!flag('--maps') && !flag('--buildings')) console.log('Nothing asked for: --maps <how many of each look> or --buildings --look <id>');
if (failed.length) {
  console.error(`\n${failed.length} failed: ${failed.join(', ')}`);
  process.exit(1);
}
