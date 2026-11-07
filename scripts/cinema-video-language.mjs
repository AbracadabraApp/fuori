#!/usr/bin/env node
/**
 * The spoken language of every video in the cinema library
 * (content/<country>/cinema-library.json), heard rather than labelled: TMDB's
 * language tag is what the uploader chose, and Josh found "more trailers
 * labeled English are in Italian than Italian in English" (2026-11-06).
 *
 * For each YouTube video it reads the language of YouTube's automatic captions
 * (made from the audio). When there are none and yt-dlp is installed, it takes
 * the first 45 seconds of audio and asks Whisper on Groq for the language
 * (GROQ_API_KEY from .env.local). Writes content/<country>/cinema-video-language.json,
 * { "<youtube id>": "it" | "en" | … | null, with how it was found }, for the
 * cloud session to relabel the library, put Italian first and re-apply the rule.
 * Run from the laptop: YouTube refuses the caption page to the cloud session.
 *
 *   COUNTRY=it node --env-file=.env.local scripts/cinema-video-language.mjs
 */
import fs from 'fs';
import os from 'os';
import path from 'path';
import { execFileSync } from 'child_process';

const country = process.env.COUNTRY || 'it';
const dir = path.join(process.cwd(), 'content', country);
const library = JSON.parse(fs.readFileSync(path.join(dir, 'cinema-library.json'), 'utf8'));
const out = path.join(dir, 'cinema-video-language.json');
const done = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, 'utf8')) : {};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const ids = [...new Set(library.films.flatMap((f) => [...f.videos.map((v) => v.youtube), ...(f.fullFilm ? [f.fullFilm.youtube] : [])]))];
let ytdlp = true;
try { execFileSync('yt-dlp', ['--version'], { stdio: 'ignore' }); } catch { ytdlp = false; }
console.log(`${ids.length} videos; ${Object.keys(done).length} already done; Whisper fallback ${ytdlp && process.env.GROQ_API_KEY ? 'on' : 'off (needs yt-dlp and GROQ_API_KEY)'}`);

async function captionLanguage(id) {
  const res = await fetch(`https://www.youtube.com/watch?v=${id}&hl=en`, { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'en' } });
  if (!res.ok) return { error: `watch page ${res.status}` };
  const html = await res.text();
  const asr = html.match(/"languageCode":"([a-z-]+)"[^}]*?"kind":"asr"/) || html.match(/"kind":"asr"[^}]*?"languageCode":"([a-z-]+)"/);
  return asr ? { language: asr[1].slice(0, 2) } : {};
}

async function whisperLanguage(id) {
  if (!ytdlp || !process.env.GROQ_API_KEY) return {};
  const file = path.join(os.tmpdir(), `fuori-${id}.m4a`);
  try {
    execFileSync('yt-dlp', ['-q', '-f', 'bestaudio[ext=m4a]/bestaudio', '--download-sections', '*0-45', '-o', file, `https://www.youtube.com/watch?v=${id}`], { stdio: 'ignore', timeout: 120000 });
    const form = new FormData();
    form.append('file', new Blob([fs.readFileSync(file)]), 'clip.m4a');
    form.append('model', 'whisper-large-v3-turbo');
    form.append('response_format', 'verbose_json');
    const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', { method: 'POST', headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` }, body: form });
    if (!res.ok) return { error: `whisper ${res.status}` };
    const j = await res.json();
    // Whisper names the language in English ("italian"); keep the two-letter code
    const names = { italian: 'it', english: 'en', french: 'fr', spanish: 'es', german: 'de', portuguese: 'pt' };
    return { language: names[(j.language || '').toLowerCase()] ?? (j.language || null), how: 'whisper' };
  } catch (err) {
    return { error: String(err.message || err).slice(0, 80) };
  } finally {
    fs.rmSync(file, { force: true });
  }
}

let n = 0;
for (const id of ids) {
  if (done[id]?.language) continue;
  let r = await captionLanguage(id).catch((e) => ({ error: String(e.message || e) }));
  r = r.language ? { ...r, how: 'captions' } : { ...(await whisperLanguage(id)), ...(r.error ? { captionError: r.error } : {}) };
  done[id] = { language: r.language ?? null, how: r.how ?? null, ...(r.error ? { error: r.error } : {}) };
  if (++n % 20 === 0) { fs.writeFileSync(out, JSON.stringify(done, null, 1)); process.stdout.write(`\r${n} checked`); }
  await sleep(800);
}
fs.writeFileSync(out, JSON.stringify(done, null, 1));
const values = Object.values(done);
const count = (k) => values.filter((v) => v.language === k).length;
console.log(`\n${values.length} videos: ${count('it')} Italian, ${count('en')} English, ${values.filter((v) => v.language && !['it', 'en'].includes(v.language)).length} other, ${values.filter((v) => !v.language).length} unknown. Written to ${path.relative(process.cwd(), out)}`);
