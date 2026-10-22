/**
 * Where the wait goes on a turn, against the live app API (docs/06-roadmap.md
 * → 2, Faster). Plays a fresh learner the way the iPhone app does: after the
 * learner taps done, the app sends the recording to /v1/transcribe, the words
 * to /v1/turn, the reply to /v1/speak, and plays the audio once it has all of
 * it. Each step's time here is what the caller waited; the server's own
 * Server-Timing header splits it into steps, and what's left is network and
 * Railway's proxy.
 *
 *   npm run measure:turn                  # Italy, 5 turns
 *   COUNTRY=es-mx npm run measure:turn -- --turns=8
 *   npm run measure:turn -- --url=http://localhost:3000 --keep
 *   npm run measure:turn -- --no-early   # the voice made only when asked, as before 2026-10-22
 *
 * The learner's recordings are made once with the greeter's hosted voice
 * (through /v1/speak) and converted to m4a with afconvert, like the app's.
 * Deletes the test learner afterwards through `railway ssh` (skip with --keep).
 * Runs from the laptop, so the network part is the laptop's, not a phone's.
 */
import { execFileSync } from 'child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { cities, tutor, language, country, onboarding } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';

const LIVE: Record<string, string> = {
  it: 'https://fuori-production.up.railway.app',
  'es-mx': 'https://afuera-production.up.railway.app',
};
const arg = (name: string) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=');
const base = (arg('url') ?? LIVE[country]).replace(/\/$/, '');
const keep = process.argv.includes('--keep');
const turns = Number(arg('turns') ?? 5);
// The app's voice speed (English off). The turn sends it so the server starts
// the voice early (lib/voice/early-voice.ts); --no-early sends another speed
// to the turn, so /v1/speak makes the voice from scratch, as before 2026-10-22
const SPEED = 0.9;
const turnSpeed = process.argv.includes('--no-early') ? 0.7 : SPEED;

// What the learner says, a short line a turn, as in a real conversation
const LINES: Record<string, string[]> = {
  it: ['Buongiorno! Vorrei un caffè, per favore', 'Sono qui da due settimane, abito vicino al mercato', 'Che cosa mi consiglia di vedere oggi?', 'Grazie mille, è molto gentile'],
  es: ['¡Buenos días! Quisiera un café, por favor', 'Llevo dos semanas aquí, vivo cerca del mercado', '¿Qué me recomienda ver hoy?', 'Muchas gracias, es muy amable'],
};

type Step = { client: number; server: Record<string, number> };

function serverTiming(res: Response): Record<string, number> {
  const out: Record<string, number> = {};
  for (const part of (res.headers.get('server-timing') ?? '').split(',')) {
    const m = part.trim().match(/^([\w-]+);dur=([\d.]+)/);
    if (m) out[m[1]] = Number(m[2]);
  }
  return out;
}

async function timed(call: () => Promise<Response>): Promise<{ res: Response; step: Step; body: ArrayBuffer }> {
  const t = performance.now();
  const res = await call();
  const body = await res.arrayBuffer();
  const client = Math.round(performance.now() - t);
  if (!res.ok) throw new Error(`${res.url} → ${res.status} ${new TextDecoder().decode(body).slice(0, 200)}`);
  return { res, step: { client, server: serverTiming(res) }, body };
}

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : Math.round((s[s.length / 2 - 1] + s[s.length / 2]) / 2)) : NaN;
};

function cleanup(learnerId: string) {
  if (keep || !/^[0-9a-f-]{36}$/.test(learnerId)) return console.log(`Test learner kept: ${learnerId}`);
  try {
    const js = `const {Pool}=require('pg');const p=new Pool({connectionString:process.env.DATABASE_URL,ssl:/railway\\.internal/.test(process.env.DATABASE_URL)?false:{rejectUnauthorized:false}});p.query("DELETE FROM learners WHERE id='${learnerId}'").then(r=>{console.log(r.rowCount);return p.end()})`;
    const out = execFileSync('railway', ['ssh', '--service', country === 'it' ? 'Fuori' : 'Afuera', '--', 'node', '-e', js], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    if (out.trim().split('\n').pop() !== '1') throw new Error('not deleted');
    console.log(`Test learner deleted (${learnerId})`);
  } catch {
    console.log(`Could not delete the test learner automatically; delete ${learnerId} from learners (rows cascade).`);
  }
}

async function main() {
  const lines = LINES[language.code];
  if (!lines) throw new Error(`no test lines for language ${language.code}; add them to LINES`);
  // The same city and person as smoke:live
  const city = cities.find((c) => !c.hidden && c.places.some((p) => p.characterId === tutor.id)) ?? cities[0];
  const place = city.places.find((p) => p.characterId && p.characterId !== tutor.id && characterForPlace(city, p)?.origin === 'generated')!;
  const person = characterForPlace(city, place)!;

  const reg = (await (await fetch(`${base}/v1/auth/device`, { method: 'POST' })).json()) as { learnerId: string; token: string };
  const auth = { Authorization: `Bearer ${reg.token}` };
  const json = (path: string, body: unknown) => () =>
    fetch(base + path, { method: 'POST', headers: { ...auth, 'Content-Type': 'application/json', 'x-fuori-id': `measure-${Date.now()}` }, body: JSON.stringify(body) });

  try {
    console.log(`${base} · ${country} · ${person.name} (${place.name}), ${city.name} · ${turns} turns\n`);

    // The learner's recordings, made once (not timed)
    const dir = mkdtempSync(join(tmpdir(), 'measure-turn-'));
    const recordings: Buffer[] = [];
    for (const [i, line] of lines.entries()) {
      const { body } = await timed(json('/v1/speak', { text: line, characterId: onboarding.guide.id, speed: 1 }));
      writeFileSync(join(dir, `${i}.mp3`), Buffer.from(body));
      execFileSync('afconvert', ['-f', 'm4af', '-d', 'aac', join(dir, `${i}.mp3`), join(dir, `${i}.m4a`)]);
      recordings.push(readFileSync(join(dir, `${i}.m4a`)));
    }

    const opening = await timed(json('/v1/turn', { cityId: city.id, placeId: place.id, speed: turnSpeed }));
    const conversationId = (JSON.parse(new TextDecoder().decode(opening.body)) as { conversationId: string }).conversationId;
    console.log(`opening: ${opening.step.client} ms  (server ${JSON.stringify(opening.step.server)})\n`);

    const rows: { transcribe: Step; turn: Step; speak: Step; words: number }[] = [];
    for (let i = 0; i < turns; i++) {
      const form = new FormData();
      form.append('audio', new Blob([new Uint8Array(recordings[i % recordings.length])], { type: 'audio/m4a' }), 'speech.m4a');
      const tr = await timed(() => fetch(`${base}/v1/transcribe`, { method: 'POST', headers: auth, body: form }));
      const said = (JSON.parse(new TextDecoder().decode(tr.body)) as { text: string }).text;
      const tu = await timed(json('/v1/turn', { cityId: city.id, placeId: place.id, conversationId, learnerSaid: said, speed: turnSpeed }));
      const reply = JSON.parse(new TextDecoder().decode(tu.body)) as { line: string };
      const sp = await timed(json('/v1/speak', { text: reply.line, characterId: person.id, speed: SPEED }));
      rows.push({ transcribe: tr.step, turn: tu.step, speak: sp.step, words: reply.line.split(/\s+/).length });
      const total = tr.step.client + tu.step.client + sp.step.client;
      console.log(`turn ${i + 1}: ${total} ms = transcribe ${tr.step.client} + turn ${tu.step.client} + voice ${sp.step.client}   "${said}" → "${reply.line}"`);
      console.log(`        server: transcribe ${JSON.stringify(tr.step.server)} · turn ${JSON.stringify(tu.step.server)} · voice ${JSON.stringify(sp.step.server)}`);
    }

    // Medians: what the learner waits from tapping done to the first sound
    const m = (f: (r: (typeof rows)[number]) => number) => median(rows.map(f));
    const net = (s: Step) => s.client - (s.server.total ?? 0);
    console.log(`\nMedian over ${rows.length} turns (ms), from tapping done to the voice starting:`);
    console.log(`  total wait          ${m((r) => r.transcribe.client + r.turn.client + r.speak.client)}`);
    console.log(`  transcribe          ${m((r) => r.transcribe.client)}   (whisper ${m((r) => r.transcribe.server.whisper)}, auth ${m((r) => r.transcribe.server.auth)}, network ${m((r) => net(r.transcribe))})`);
    console.log(`  turn                ${m((r) => r.turn.client)}   (claude ${m((r) => r.turn.server.claude)}, first token ${m((r) => r.turn.server.claudeFirstToken)}, auth ${m((r) => r.turn.server.auth)}, load ${m((r) => r.turn.server.load)}, memory ${m((r) => r.turn.server.memory)}, record ${m((r) => r.turn.server.record)}, network ${m((r) => net(r.turn))})`);
    console.log(`  voice               ${m((r) => r.speak.client)}   (elevenlabs ${m((r) => r.speak.server.elevenlabs)}, auth ${m((r) => r.speak.server.auth)}, network ${m((r) => net(r.speak))})`);
    console.log(`  reply length        ${m((r) => r.words)} words`);
  } finally {
    cleanup(reg.learnerId);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
