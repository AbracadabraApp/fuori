/**
 * The conversation library's replay (roadmap N6; lib/speech/keep-recording.ts):
 * runs the kept recordings through today's speech to text and routing
 * (lib/speech/hear-recording.ts) and lists each beside what the app got when
 * it was played, so a change can be judged on real speech before anyone plays
 * it. Recordings are deleted by the bucket after 30 days.
 *
 *   npm run replay:recordings                   # Italy, the last 7 days
 *   COUNTRY=es-mx npm run replay:recordings -- --days=30
 *   npm run replay:recordings -- --list         # what's kept, no replay
 *
 * Needs .env.local: R2_*, RECORDINGS_BUCKET=fuori-recordings, GROQ_API_KEY.
 */
import { country } from '@/content';
import { recordingsBucket } from '@/lib/speech/keep-recording';
import { hearRecording } from '@/lib/speech/hear-recording';

const arg = (name: string) => process.argv.find((a) => a.startsWith(`--${name}`))?.split('=')[1];
const days = Number(arg('days') ?? 7);
const listOnly = process.argv.includes('--list');
const since = Date.now() - days * 86400_000;

const { client, url } = recordingsBucket();

async function listKeys(prefix: string): Promise<string[]> {
  const keys: string[] = [];
  let token: string | undefined;
  do {
    const q = new URLSearchParams({ 'list-type': '2', prefix, ...(token ? { 'continuation-token': token } : {}) });
    const res = await client.fetch(`${url}?${q}`);
    if (!res.ok) throw new Error(`R2 list: ${res.status} ${await res.text()}`);
    const xml = await res.text();
    keys.push(...[...xml.matchAll(/<Key>([^<]+)<\/Key>/g)].map((m) => m[1]));
    token = /<NextContinuationToken>([^<]+)</.exec(xml)?.[1];
  } while (token);
  return keys;
}

async function get(key: string): Promise<Response> {
  const res = await client.fetch(`${url}/${key}`);
  if (!res.ok) throw new Error(`R2 GET ${key}: ${res.status}`);
  return res;
}

const metas = (await listKeys(`${country}/`)).filter((k) => k.endsWith('.json'));
let rows = 0;
let changed = 0;
for (const key of metas.sort()) {
  const meta = await (await get(key)).json();
  if (Date.parse(meta.at) < since) continue;
  rows++;
  const was = `${meta.language}: ${meta.text}${meta.learned ? `  (as learned: ${meta.learned})` : ''}`;
  if (listOnly) {
    console.log(`${meta.at}  ${meta.mode.padEnd(6)} ${was}`);
    continue;
  }
  const audio = new File([await (await get(meta.audio)).arrayBuffer()], meta.audio.split('/').pop(), { type: 'audio/mp4' });
  const now = await hearRecording({ audio, mode: meta.mode });
  const same = now.language === meta.language && now.text.trim() === String(meta.text).trim();
  if (!same) changed++;
  console.log(`${meta.at}  ${meta.mode}  ${same ? 'same' : 'CHANGED'}\n  then: ${was}${same ? '' : `\n  now:  ${now.language}: ${now.text}${now.learned ? `  (as learned: ${now.learned})` : ''}`}`);
}
console.log(`\n${rows} recording(s) in ${country}, last ${days} days${listOnly ? '' : `; ${changed} heard differently now (Whisper varies a little run to run)`}`);
