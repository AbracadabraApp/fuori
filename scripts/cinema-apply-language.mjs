#!/usr/bin/env node
/**
 * Applies the heard languages (content/<country>/cinema-video-language.json,
 * from scripts/cinema-video-language.mjs on the laptop) to the cinema library
 * (content/<country>/cinema-library.json): each video's language becomes the
 * one heard, when one was heard; the learned language's videos come first; and
 * the library's rule (Josh, 2026-11-06: in only with at least one video in the
 * learned language, its trailer or the full film) is applied again. A film with
 * nothing in the learned language moves to `excluded`, and so does a film none
 * of whose videos could be heard, as Italy's eight were (2026-11-06), until
 * someone listens to it.
 *
 * Written for Mexico's first films (2026-11-09), most of which TMDB labels
 * wrong or not at all; it works the same for Italy.
 *
 *   COUNTRY=es-mx node scripts/cinema-apply-language.mjs
 */
import fs from 'fs';
import path from 'path';

const country = process.env.COUNTRY || 'it';
const lang = country.slice(0, 2);
const dir = path.join(process.cwd(), 'content', country);
const libFile = path.join(dir, 'cinema-library.json');
const heardFile = path.join(dir, 'cinema-video-language.json');
if (!fs.existsSync(heardFile)) {
  console.error(`No ${path.relative(process.cwd(), heardFile)}: run scripts/cinema-video-language.mjs first (laptop)`);
  process.exit(1);
}
const library = JSON.parse(fs.readFileSync(libFile, 'utf8'));
const heard = JSON.parse(fs.readFileSync(heardFile, 'utf8'));
const heardAs = (id, labelled) => heard[id]?.language ?? labelled;

const kept = [];
const unheard = [];
const dropped = [];
let relabelled = 0;
for (const film of library.films) {
  for (const v of film.videos) {
    const now = heardAs(v.youtube, v.language);
    if (now !== v.language) relabelled++;
    v.language = now;
  }
  film.videos.sort((a, b) => Number(b.language === lang) - Number(a.language === lang));
  if (film.fullFilm) film.fullFilm.language = heardAs(film.fullFilm.youtube, film.fullFilm.language);
  const ids = [...film.videos.map((v) => v.youtube), ...(film.fullFilm ? [film.fullFilm.youtube] : [])];
  const inLang = film.videos.some((v) => v.language === lang) || film.fullFilm?.language === lang;
  if (inLang) kept.push(film);
  else {
    if (ids.every((id) => !heard[id]?.language)) unheard.push(film.title);
    dropped.push(film);
  }
}
library.films = kept;
const gone = new Set(dropped.map((f) => f.tmdbId));
for (const shelf of library.shelves) shelf.films = shelf.films.filter((id) => !gone.has(id));
library.excluded = [...(library.excluded ?? []), ...dropped.map((f) => ({ tmdbId: f.tmdbId, title: f.title, why: unheard.includes(f.title) ? 'no video could be heard: in once someone confirms one is in the learned language' : `no video heard in the learned language (${lang})` }))];
fs.writeFileSync(libFile, JSON.stringify(library, null, 1) + '\n');
console.log(`${relabelled} video labels changed; ${kept.length} films kept, ${dropped.length} left out (${dropped.map((f) => f.title).join(', ') || 'none'})`);
if (unheard.length) console.log(`Of those, not heard at all (${unheard.length}): ${unheard.join(', ')}`);
