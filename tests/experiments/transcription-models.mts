/**
 * The kept recordings (lib/speech/keep-recording.ts) heard by Groq's two
 * Whisper models, side by side: whisper-large-v3-turbo (what the app uses)
 * and whisper-large-v3. Same service, same language setting as the app
 * (target mode: the learned language). Prints each pair; no judge, the
 * Flashcards deck says what most answers should be.
 *
 *   COUNTRY=es-mx npx tsx --env-file=<keys> tests/experiments/transcription-models.mts
 */
import Groq from 'groq-sdk';
import { country, language } from '@/content';
import { recordingsBucket } from '@/lib/speech/keep-recording';

const { client, url } = recordingsBucket();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const xml = await (await client.fetch(`${url}?list-type=2&prefix=${country}/`)).text();
const metas = [...xml.matchAll(/<Key>([^<]+)<\/Key>/g)].map((m) => m[1]).filter((k) => k.endsWith('.json')).sort();

async function hear(file: File, model: string, lang?: string) {
  const r = await groq.audio.transcriptions.create({ file, model, ...(lang ? { language: lang } : {}), response_format: 'json' });
  return r.text.trim();
}

let differ = 0;
for (const key of metas) {
  const meta = await (await client.fetch(`${url}/${key}`)).json();
  const bytes = await (await client.fetch(`${url}/${meta.audio}`)).arrayBuffer();
  const file = new File([bytes], meta.audio.split('/').pop(), { type: 'audio/mp4' });
  const lang = meta.mode === 'turn' || meta.mode === 'any' ? undefined : meta.mode === 'en' ? 'en' : language.code;
  const [turbo, large] = await Promise.all([hear(file, 'whisper-large-v3-turbo', lang), hear(file, 'whisper-large-v3', lang)]);
  const same = turbo.toLowerCase().replace(/[.,!?¿¡]/g, '') === large.toLowerCase().replace(/[.,!?¿¡]/g, '');
  if (!same) differ++;
  console.log(`${meta.at.slice(5, 19)}  ${meta.mode.padEnd(6)} turbo: ${turbo.padEnd(22)} large: ${large}${same ? '' : '   ≠'}`);
}
console.log(`\n${metas.length} recordings in ${country}; the two models differ on ${differ}`);
