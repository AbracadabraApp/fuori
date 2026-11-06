#!/usr/bin/env node
/**
 * Checks candidate films for the cinema library (content/<country>/cinema-library.json):
 * for each "Title (Year)" it finds the TMDB film, whether it has a trailer in
 * the learned language and any trailer at all (TMDB videos), and whether
 * YouTube has a full-length upload that other apps may play (title matches,
 * length within 12% of the running time, embedding allowed) and its spoken
 * language, then applies the library's rule (passes). Prints a table
 * and writes JSON next to the input, so a list of suggestions can be judged
 * before anything is added.
 *
 *   TMDB_API_KEY=… node scripts/cinema-check-films.mjs films.txt   # one "Title (Year)" per line
 *
 * Josh, 2026-11-06: "how many meet trailer, full length criteria - if you
 * don't have that scripted you should".
 */
import fs from 'fs';

const KEY = process.env.TMDB_API_KEY;
const LANG = process.env.LANG_CODE || 'it';
const REGION = process.env.REGION || 'IT';
if (!KEY || !process.argv[2]) {
  console.error('usage: TMDB_API_KEY=… node scripts/cinema-check-films.mjs <file with one "Title (Year)" per line>');
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const norm = (s) => s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
const minutes = (len) => {
  const p = (len || '').split(':').map(Number);
  return p.length === 3 ? p[0] * 60 + p[1] : p.length === 2 ? p[0] : 0;
};
// Uploads that aren't the film: reviews, trailers, recaps, audiobooks, sequels named in the title
const NOT_THE_FILM = /review|recensione|recensit|podcast|audiolibro|curiosita|spiegat|behind the scenes|trailer|scene|streaming|puntata|asmr|full story|recap|explained|conferenza|dossier|reaction|analisi|making of|documentario|watch along/;

async function tmdb(path, params = {}) {
  const url = new URL(`https://api.themoviedb.org/3${path}`);
  url.search = new URLSearchParams({ api_key: KEY, ...params });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TMDB ${path} ${res.status}`);
  return res.json();
}

async function youtubeSearch(q) {
  const url = `https://www.youtube.com/results?${new URLSearchParams({ search_query: q, hl: LANG, gl: REGION })}`;
  const html = await (await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept-Language': LANG } })).text();
  const m = html.match(/var ytInitialData = (\{.*?\});<\/script>/s);
  if (!m) return [];
  const out = [];
  const walk = (x) => {
    if (Array.isArray(x)) return x.forEach(walk);
    if (x && typeof x === 'object') {
      if (x.videoRenderer) {
        const v = x.videoRenderer;
        out.push({
          id: v.videoId,
          title: (v.title?.runs || []).map((r) => r.text).join(''),
          channel: (v.ownerText?.runs || []).map((r) => r.text).join(''),
          length: v.lengthText?.simpleText || '',
        });
      }
      Object.values(x).forEach(walk);
    }
  };
  walk(JSON.parse(m[1]));
  return out;
}

/**
 * The language spoken in a video: YouTube's automatic captions are made in the
 * language it hears, so their code is the audio's. Null when YouTube won't say
 * (no automatic captions, or it refuses this network: from the cloud session it
 * answers 429; run from the laptop). Never guessed from the title.
 */
async function spokenLanguage(id) {
  try {
    const res = await fetch(`https://www.youtube.com/watch?v=${id}&hl=${LANG}`, { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept-Language': LANG } });
    if (!res.ok) return null;
    const html = await res.text();
    const asr = html.match(/"languageCode":"([a-z-]+)"[^}]*?"kind":"asr"/);
    return asr ? asr[1].slice(0, 2) : null;
  } catch {
    return null;
  }
}

async function embeddable(id) {
  const res = await fetch(`https://www.youtube.com/oembed?${new URLSearchParams({ url: `https://www.youtube.com/watch?v=${id}`, format: 'json' })}`);
  return res.ok;
}

async function check(line) {
  const m = line.match(/^(.*?)\s*\((\d{4})\)\s*$/);
  const [title, year] = m ? [m[1], m[2]] : [line, ''];
  const found = await tmdb('/search/movie', { query: title, ...(year && { year }), language: `${LANG}-${REGION}` });
  const film = found.results?.[0];
  if (!film) return { asked: line, found: false };
  const [details, local, all] = await Promise.all([
    tmdb(`/movie/${film.id}`, { language: `${LANG}-${REGION}` }),
    tmdb(`/movie/${film.id}/videos`, { include_video_language: LANG }),
    tmdb(`/movie/${film.id}/videos`),
  ]);
  const trailers = (list) => list.results.filter((v) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'));
  const runtime = details.runtime || 100;
  const names = [norm(details.title), norm(details.original_title)];
  const seen = new Map();
  for (const q of [`${details.original_title} ${year} film completo`, `${details.original_title} film intero`, `${details.title} ${year} full movie`]) {
    for (const v of await youtubeSearch(q)) seen.set(v.id, v);
    await sleep(1200);
  }
  const candidates = [...seen.values()].filter((v) => {
    const t = norm(v.title);
    return names.some((n) => n && t.includes(n)) && Math.abs(minutes(v.length) - runtime) <= Math.max(12, runtime * 0.12) && !NOT_THE_FILM.test(`${t} ${norm(v.channel)}`);
  });
  let full = null;
  for (const v of candidates.slice(0, 4)) if (await embeddable(v.id)) { full = v; break; }
  return {
    asked: line,
    tmdbId: film.id,
    title: details.title,
    year: (details.release_date || '').slice(0, 4),
    runtime,
    poster: Boolean(details.poster_path),
    localTrailer: trailers(local).length > 0,
    anyTrailer: trailers(local).length + trailers(all).length > 0,
    fullFilm: full && { youtube: full.id, channel: full.channel, length: full.length, title: full.title, language: await spokenLanguage(full.id) },
  };
}

/**
 * The library's rule (Josh, 2026-11-06): in only with at least one video in the
 * learned language, its trailer or the full film; a full film is a bonus.
 * Null when only a full film of unknown language could let it in
 */
function passes(r) {
  if (r.localTrailer) return true;
  if (r.fullFilm?.language === LANG) return true;
  if (r.fullFilm && r.fullFilm.language == null) return null;
  return false;
}

const lines = fs.readFileSync(process.argv[2], 'utf8').split('\n').map((l) => l.trim()).filter(Boolean);
const results = [];
for (const line of lines) {
  try {
    results.push(await check(line));
  } catch (err) {
    results.push({ asked: line, error: String(err.message || err) });
  }
  const r = results.at(-1);
  console.log([r.asked.padEnd(42), r.found === false ? 'not on TMDB' : r.error ?? `${r.localTrailer ? `${LANG} trailer` : r.anyTrailer ? 'trailer (other)' : 'no trailer'} | ${r.fullFilm ? `full: ${r.fullFilm.length} ${r.fullFilm.language ?? 'language unknown'} ${r.fullFilm.channel}` : 'no full film'} | ${passes(r) ? 'IN' : passes(r) === null ? 'check the full film\'s language' : 'out'}`].join(' '));
}
fs.writeFileSync(process.argv[2].replace(/\.\w+$/, '') + '.checked.json', JSON.stringify(results, null, 1));
const ok = (r) => r.tmdbId;
console.log(`\n${results.filter((r) => passes(r)).length} in by the rule; ${results.filter((r) => passes(r) === null).length} to check; ${results.filter(ok).length} found; ${results.filter((r) => r.localTrailer).length} with a ${LANG} trailer; ${results.filter((r) => r.anyTrailer).length} with any trailer; ${results.filter((r) => r.fullFilm).length} with a full film; ${results.filter((r) => r.localTrailer && r.fullFilm).length} with both`);
