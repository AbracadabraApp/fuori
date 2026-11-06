#!/usr/bin/env node
/**
 * The cinemas' film posters (content/<country>/cinema.json): downloads each
 * film's TMDB poster into public/…/posters/<tmdbId>.jpg, so `npm run
 * images:upload` puts it on R2 like any other picture (posters/<tmdbId> in
 * images.json). Only posters not downloaded yet are fetched. No TMDB key
 * needed: the poster links are public.
 *
 *   node --env-file=.env.local scripts/cinema-posters.mjs && npm run images:upload
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const country = process.env.COUNTRY || 'it';
const file = path.join(ROOT, 'content', country, 'cinema.json');
if (!fs.existsSync(file)) {
  console.log(`${country}: no cinema.json`);
  process.exit(0);
}
const generation = JSON.parse(fs.readFileSync(path.join(ROOT, 'content', country, 'generation.json'), 'utf8'));
const dir = path.join(ROOT, 'public', generation.images?.dir ?? 'images', 'posters');
fs.mkdirSync(dir, { recursive: true });

const films = Object.values(JSON.parse(fs.readFileSync(file, 'utf8')).cinemas).flatMap((c) => c.films);
let fetched = 0;
for (const f of films) {
  const out = path.join(dir, `${f.tmdbId}.jpg`);
  if (fs.existsSync(out)) continue;
  const res = await fetch(f.poster);
  if (!res.ok) throw new Error(`${f.title}: poster ${res.status} (${f.poster})`);
  fs.writeFileSync(out, Buffer.from(await res.arrayBuffer()));
  fetched++;
}
console.log(`${country}: ${films.length} films, ${fetched} poster(s) downloaded`);
