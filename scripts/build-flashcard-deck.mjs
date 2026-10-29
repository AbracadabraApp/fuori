#!/usr/bin/env node
/**
 * The master flashcard deck's pictures (docs/flashcards.md → The look):
 * one tall 2:3 traditional card per word in content/<country>/flashcard-deck.json,
 * built once and shared by every learner. Italy mixes carte napoletane and
 * tarocchi, picked from the card's id so a rebuild picks the same; Mexico is
 * lotería. The picture leaves the bottom banner empty: the app draws its own
 * banner and writes in it.
 *
 * Drafts go to .flashcards-tmp/deck-<country>/ with a contact sheet
 * (sheet.jpg) for Josh to look at first. Words that already have a draft are
 * skipped, so a rerun only makes what's missing (delete a draft to remake it).
 *
 *   node --env-file=.env.local scripts/build-flashcard-deck.mjs
 *   COUNTRY=es-mx node --env-file=.env.local scripts/build-flashcard-deck.mjs
 *   … --only caffe,cornetto     just these
 *   … --sheet                   only rebuild the contact sheet
 *
 * Needs XAI_API_KEY. About 2–3 cents a picture.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';
import sharp from 'sharp';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const country = process.env.COUNTRY || 'it';
const args = process.argv.slice(2);
const only = args.includes('--only') ? new Set(args[args.indexOf('--only') + 1].split(',')) : null;
const sheetOnly = args.includes('--sheet');

// Same ids as lib/flashcards.ts
const id = (w) => w.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
// A stable pick from the id: the same card always gets the same style
const pick = (key, n) => createHash('sha1').update(key).digest()[0] % n;

const pack = JSON.parse(fs.readFileSync(path.join(ROOT, 'content', country, 'generation.json'), 'utf8'));
const place = country === 'it' ? 'Italy' : 'Mexico';
const tail = `As you'd find it in everyday life in ${place}; no flags, souvenirs or postcard clichés. No number, no lettering anywhere. Tall card format, 2:3.`;

// The two styles Josh picked for Italy and the one for Mexico (the
// "Flashcard Art Review", 2026-10-28)
const STYLES = {
  it: {
    napoletane: (o) => `An original card in the style of a traditional Neapolitan playing card (carte napoletane): one bold central figure of ${o}, drawn with thick black outlines and flat, saturated colours (red, yellow, blue, green) on a plain cream background, inside a thin black border with simple ornate corners, with an empty plain banner along the bottom. Old woodcut-printed look, slightly naive drawing, worn paper texture and imperfect registration. ${tail}`,
    tarocchi: (o) => `An original card in the style of an old Italian tarot card (tarocchi): one bold central figure of ${o}, drawn with thick black outlines and flat colours (red, yellow, blue, flesh pink) on a plain cream background, inside a thin black border, with an empty plain name banner along the bottom. Old woodcut-printed look, hand-coloured, slight paper texture and imperfect registration. No mystical symbols. ${tail}`,
  },
  'es-mx': {
    loteria: (o) => `An original card in the style of a traditional Mexican lotería card: one bold central figure of ${o}, drawn with thick black outlines and flat, saturated colours (red, yellow, green, blue, pink) on a plain cream background, inside a thin black border, with an empty plain banner along the bottom. Vintage printed look with slight paper texture and imperfect registration. ${tail}`,
  },
};
const styles = STYLES[country];
const names = Object.keys(styles);

const deck = JSON.parse(fs.readFileSync(path.join(ROOT, 'content', country, 'flashcard-deck.json'), 'utf8')).cards
  .map((c) => ({ ...c, id: id(c.word) }));
const out = path.join(ROOT, '.flashcards-tmp', `deck-${country}`);
fs.mkdirSync(out, { recursive: true });
const file = (c) => path.join(out, `${c.id}.jpg`);

async function make(c) {
  const style = names[pick(c.id, names.length)];
  const prompt = styles[style](c.picture);
  const res = await fetch('https://api.x.ai/v1/images/generations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.XAI_API_KEY}` },
    body: JSON.stringify({ model: 'grok-imagine-image-2.0', prompt, n: 1, response_format: 'b64_json', aspect_ratio: '2:3', resolution: '2k' }),
  });
  if (!res.ok) throw new Error(`${c.id}: xAI ${res.status} ${(await res.text()).slice(0, 160)}`);
  const b64 = (await res.json()).data[0].b64_json;
  await sharp(Buffer.from(b64, 'base64')).resize(1000, 1500, { fit: 'cover' }).jpeg({ quality: 86 }).toFile(file(c));
  console.log(`made ${c.id} (${style})`);
}

if (!sheetOnly) {
  const todo = deck.filter((c) => (only ? only.has(c.id) : !fs.existsSync(file(c))));
  console.log(`${todo.length} to make, ${deck.length} in the deck (${pack.images?.dir ?? country})`);
  const failed = [];
  // A few at a time
  for (let i = 0; i < todo.length; i += 6) {
    const batch = await Promise.allSettled(todo.slice(i, i + 6).map(make));
    batch.forEach((r) => { if (r.status === 'rejected') { failed.push(r.reason.message); console.log(r.reason.message); } });
  }
  if (failed.length) console.log(`${failed.length} failed; rerun to retry them`);
}

// The contact sheet: every card with its word, 8 to a row
const done = deck.filter((c) => fs.existsSync(file(c)));
const W = 240, H = 360, L = 34, cols = 8;
const rows = Math.ceil(done.length / cols);
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const tiles = await Promise.all(done.map(async (c, i) => {
  const said = c.article.endsWith("'") ? `${c.article}${c.word}` : `${c.article} ${c.word}`;
  const label = Buffer.from(`<svg width="${W}" height="${L}"><rect width="100%" height="100%" fill="#fff"/><text x="6" y="22" font-family="Helvetica" font-size="17" font-weight="bold">${esc(said)}</text><text x="${W - 6}" y="22" text-anchor="end" font-family="Helvetica" font-size="12" fill="#777">${names[pick(c.id, names.length)]}</text></svg>`);
  return [
    { input: await sharp(file(c)).resize(W, H).toBuffer(), left: (i % cols) * W, top: Math.floor(i / cols) * (H + L) },
    { input: label, left: (i % cols) * W, top: Math.floor(i / cols) * (H + L) + H },
  ];
}));
if (done.length) {
  await sharp({ create: { width: cols * W, height: rows * (H + L), channels: 3, background: '#ffffff' } })
    .composite(tiles.flat()).jpeg({ quality: 82 }).toFile(path.join(out, 'sheet.jpg'));
  console.log(`sheet: ${path.relative(ROOT, path.join(out, 'sheet.jpg'))} (${done.length} cards)`);
}
