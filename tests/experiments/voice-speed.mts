// Speed of speech in and speech out, provider against provider (roadmap →
// Faster and reliable replies; Josh, 2026-10-18: "measure speed first").
// Accuracy is a later round on Josh's real recordings; this one only times.
//
// Speech out (ElevenLabs): each model, the whole file as the app asks for it
// today (`total`) and the streaming endpoint's first audio byte (`first`).
// Speech in: the same recordings, short, medium and long, made once with the
// app's voice and converted to AAC m4a like the iPhone's (afconvert, macOS).
//
//   npx tsx --env-file=.env.local tests/experiments/voice-speed.mts [--rounds 5]
//
// Runs from the laptop, so absolute times include its network; compare
// providers with each other, and production with `npm run measure:turn`.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { OUT } from './common.mts';

const ROUNDS = Number(process.argv[process.argv.indexOf('--rounds') + 1]) || 5;
const XI = process.env.ELEVENLABS_API_KEY!;
const GROQ = process.env.GROQ_API_KEY!;
const VOICE = 'pFZP5JQG7iQjIQuC4Bku'; // the app's default voice (lib/voice/providers/elevenlabs.ts)

// Lengths like real replies: median 16 words, long ones about 40
const LINES: Record<string, Record<string, string>> = {
  it: {
    short: 'Buongiorno! Cosa prende?',
    medium: 'Ah, sei tornato! Oggi abbiamo i carciofi freschi, vengono da Ladispoli. Ne vuoi un chilo?',
    long: 'Allora, per arrivare in piazza devi andare dritto fino alla fontana, poi giri a sinistra e passi davanti alla chiesa. È a cinque minuti, non di più. Se ti perdi, chiedi a chiunque: qui tutti conoscono la piazza.',
  },
  es: {
    short: '¡Buenos días! ¿Qué le sirvo?',
    medium: '¡Ah, regresaste! Hoy tenemos tacos de suadero recién hechos. ¿Te preparo unos con todo?',
    long: 'Mira, para llegar al mercado sigues derecho hasta la glorieta, luego das vuelta a la izquierda y pasas enfrente de la iglesia. Son cinco minutos nada más. Si te pierdes, pregúntale a cualquiera: aquí todos conocen el mercado.',
  },
};

const TTS_MODELS = ['eleven_flash_v2_5', 'eleven_turbo_v2_5', 'eleven_multilingual_v2', 'eleven_v3'];

type Stt = { name: string; run: (m4a: Buffer, lang: string) => Promise<string> };
const STT: Stt[] = [
  ...['whisper-large-v3-turbo', 'whisper-large-v3'].map((model) => ({
    name: `groq ${model}`,
    run: async (m4a: Buffer) => {
      const form = new FormData();
      form.append('file', new File([new Uint8Array(m4a)], 'speech.m4a', { type: 'audio/mp4' }));
      form.append('model', model);
      form.append('response_format', 'verbose_json'); // as the app: no language given
      const r = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', { method: 'POST', headers: { Authorization: `Bearer ${GROQ}` }, body: form });
      if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
      return ((await r.json()) as { text: string }).text;
    },
  })),
  ...['scribe_v1', 'scribe_v2'].map((model) => ({
    name: `elevenlabs ${model}`,
    run: async (m4a: Buffer) => {
      const form = new FormData();
      form.append('file', new File([new Uint8Array(m4a)], 'speech.m4a', { type: 'audio/mp4' }));
      form.append('model_id', model);
      form.append('tag_audio_events', 'false');
      form.append('diarize', 'false');
      const r = await fetch('https://api.elevenlabs.io/v1/speech-to-text', { method: 'POST', headers: { 'xi-api-key': XI }, body: form });
      if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
      return ((await r.json()) as { text: string }).text;
    },
  })),
];

async function speak(text: string, model: string, stream: boolean): Promise<{ first: number; total: number; bytes: Buffer }> {
  const t0 = performance.now();
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}${stream ? '/stream' : ''}`, {
    method: 'POST',
    headers: { Accept: 'audio/mpeg', 'Content-Type': 'application/json', 'xi-api-key': XI },
    body: JSON.stringify({ text, model_id: model, voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0, use_speaker_boost: true } }),
  });
  if (!r.ok || !r.body) throw new Error(`${r.status} ${await r.text()}`);
  const reader = r.body.getReader();
  const chunks: Uint8Array[] = [];
  let first = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!first) first = performance.now() - t0;
    chunks.push(value);
  }
  return { first, total: performance.now() - t0, bytes: Buffer.concat(chunks) };
}

const med = (xs: number[]) => { const s = [...xs].sort((a, b) => a - b); return s.length ? s[Math.floor((s.length - 1) / 2)] : NaN; };
const worst = (xs: number[]) => Math.max(...xs);
const fmt = (ms: number) => (ms / 1000).toFixed(2);

const times: Record<string, number[]> = {};
const errors: Record<string, string[]> = {};
const add = (k: string, ms: number) => (times[k] ??= []).push(ms);
const fail = (k: string, e: unknown) => (errors[k] ??= []).push(String(e).slice(0, 160));

// The recordings for speech in, made once with the app's model
const recordings: Record<string, Buffer> = {};
for (const [lang, lines] of Object.entries(LINES)) {
  for (const [len, text] of Object.entries(lines)) {
    const mp3 = join(OUT, `voice-speed-${lang}-${len}.mp3`);
    const m4a = mp3.replace(/\.mp3$/, '.m4a');
    writeFileSync(mp3, (await speak(text, 'eleven_flash_v2_5', false)).bytes);
    execFileSync('afconvert', ['-f', 'm4af', '-d', 'aac', mp3, m4a]);
    recordings[`${lang} ${len}`] = readFileSync(m4a);
  }
}

const heard: Record<string, string> = {};
for (let round = 1; round <= ROUNDS; round++) {
  process.stdout.write(`round ${round}/${ROUNDS}\r`);
  // Interleaved, so a slow minute on the network hits every provider alike
  for (const [lang, lines] of Object.entries(LINES)) {
    for (const [len, text] of Object.entries(lines)) {
      for (const model of TTS_MODELS) {
        try { add(`out ${model} total ${len}`, (await speak(text, model, false)).total); } catch (e) { fail(`out ${model}`, e); }
        try { add(`out ${model} first ${len}`, (await speak(text, model, true)).first); } catch (e) { fail(`out ${model}`, e); }
      }
      for (const stt of STT) {
        const t0 = performance.now();
        try {
          const said = await stt.run(recordings[`${lang} ${len}`], lang);
          add(`in ${stt.name} ${len}`, performance.now() - t0);
          if (round === 1) heard[`${stt.name} · ${lang} ${len}`] = said.trim();
        } catch (e) { fail(`in ${stt.name}`, e); }
      }
    }
  }
}

const lens = ['short', 'medium', 'long'];
const lines: string[] = [`Voice speed · ${ROUNDS} rounds × 2 languages, laptop network, ${new Date().toISOString()}`, '', 'Seconds, median (worst). Lengths: short ~4 words, medium ~15, long ~40.', ''];
const table = (title: string, rows: string[][]) => {
  lines.push(title, `| | ${lens.join(' | ')} |`, `|---|${lens.map(() => '---').join('|')}|`, ...rows.map((r) => `| ${r.join(' | ')} |`), '');
};
const cell = (k: string) => (times[k]?.length ? `${fmt(med(times[k]))} (${fmt(worst(times[k]))})` : '—');
table('Speech out, whole file (what the app does today)', TTS_MODELS.map((m) => [m, ...lens.map((l) => cell(`out ${m} total ${l}`))]));
table('Speech out, first audio byte when streamed', TTS_MODELS.map((m) => [m, ...lens.map((l) => cell(`out ${m} first ${l}`))]));
table('Speech in, upload to text', STT.map((s) => [s.name, ...lens.map((l) => cell(`in ${s.name} ${l}`))]));
if (Object.keys(errors).length) lines.push('Errors:', ...Object.entries(errors).map(([k, v]) => `- ${k}: ${v.length}× ${v[0]}`), '');
lines.push('What each heard (round 1; the audio is a clean generated voice, so this is no accuracy test):', ...Object.entries(heard).map(([k, v]) => `- ${k}: ${v}`));

const report = lines.join('\n');
const path = join(OUT, `voice-speed-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')}.md`);
writeFileSync(path, report + '\n');
console.log(report + `\n\nReport: ${path}`);
