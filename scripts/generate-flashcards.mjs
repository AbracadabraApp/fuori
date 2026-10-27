#!/usr/bin/env node
/**
 * Flashcard pictures (docs/flashcards.md): one 2:1 picture per object or
 * scene word in content/<country>/flashcards.json that doesn't have one yet,
 * from the card's picture idea in the country's card style (Italy's pastel
 * sketch, Mexico's gouache, as the first ten). Saved to .flashcards-tmp/ for
 * Josh to look at first; --keep copies them to public/images/…/flashcards/
 * at 1600 × 800 for `npm run images:upload`.
 *
 *   node --env-file=.env.local scripts/generate-flashcards.mjs            Italy
 *   COUNTRY=es-mx node --env-file=.env.local scripts/generate-flashcards.mjs
 *   … --only euro,pepe        just these
 *   … --keep                  after review: copy to public/images for upload
 *
 * Needs XAI_API_KEY. A few cents a picture.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const country = process.env.COUNTRY || 'it';
const tag = country === 'it' ? 'it' : 'mx';
const args = process.argv.slice(2);
const only = args.includes('--only') ? new Set(args[args.indexOf('--only') + 1].split(',')) : null;
const keep = args.includes('--keep');

// The first ten cards' look (the Flashcards canvas, 2026-10-21)
const STYLE = {
  it: (p) => `Soft pastel sketch on white paper of ${p} Warm colours, textured, inviting.`,
  'es-mx': (p) => `Gouache painting of ${p} Bold, saturated colour, flat simple shapes, full of character.`,
};
const RULES = 'No words, letters or numbers anywhere. Wide 2:1 format; keep the subject in the centre with space around it.';

const id = (w) => w.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const gen = JSON.parse(fs.readFileSync(path.join(ROOT, 'content', country, 'generation.json'), 'utf8'));
const pub = path.join(ROOT, 'public', gen.images?.dir ?? 'images', 'flashcards');
const tmp = path.join(ROOT, '.flashcards-tmp');
fs.mkdirSync(tmp, { recursive: true });
fs.mkdirSync(pub, { recursive: true });

const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'content', country, 'flashcards.json'), 'utf8')).cards
  .filter((c) => c.image !== 'none')
  .map((c) => ({ ...c, id: id(c.word) }))
  .filter((c) => (only ? only.has(c.id) : !fs.existsSync(path.join(pub, `${c.id}.jpg`))));

for (const c of cards) {
  const draft = path.join(tmp, `${tag}-${c.id}.jpg`);
  if (keep) {
    if (!fs.existsSync(draft)) { console.log(`no draft for ${c.id}`); continue; }
    await sharp(draft).resize(1600, 800, { fit: 'cover' }).jpeg({ quality: 88 }).toFile(path.join(pub, `${c.id}.jpg`));
    console.log(`kept ${c.id}`);
    continue;
  }
  const prompt = `${STYLE[country](c.picture.replace(/\.?$/, '.'))} ${RULES}`;
  const res = await fetch('https://api.x.ai/v1/images/generations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.XAI_API_KEY}` },
    body: JSON.stringify({ model: 'grok-imagine-image-2.0', prompt, n: 1, response_format: 'b64_json', aspect_ratio: '2:1', resolution: '2k' }),
  });
  if (!res.ok) { console.log(`${c.id}: xAI ${res.status} ${(await res.text()).slice(0, 160)}`); continue; }
  const b64 = (await res.json()).data[0].b64_json;
  fs.writeFileSync(draft, Buffer.from(b64, 'base64'));
  console.log(`made ${c.id} → ${path.relative(ROOT, draft)}`);
}
