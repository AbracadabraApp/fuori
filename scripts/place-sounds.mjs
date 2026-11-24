/**
 * Make trial place sounds with ElevenLabs' sound-effects generator (text in, audio out).
 * A trial for Josh's ear (2026-11-23: "try 11 labs"): bells at a character's opening and
 * a quiet loop behind her voice. Nothing in the app plays these yet.
 *
 *   npm run place-sounds              two takes of every sound
 *   npm run place-sounds -- bells     only the sounds whose name starts with "bells"
 *   npm run place-sounds -- --takes=3
 *
 * Writes design/place-sounds/<name>-<take>.mp3. Needs ELEVENLABS_API_KEY in .env.local.
 */
import { mkdirSync, writeFileSync } from 'node:fs';

const SOUNDS = [
  {
    name: 'bells-parish',
    text: 'Two bronze church bells of a small town parish rung by hand, heard from the square below, slow and uneven, natural echo, no music, no voices',
    seconds: 8,
    loop: false,
  },
  {
    name: 'kids-square',
    text: 'Children playing in a town square in the distance, laughter, running feet, a ball bouncing on stone, pigeons, light and calm, no music, no clear words',
    seconds: 20,
    loop: true,
  },
];

const key = process.env.ELEVENLABS_API_KEY;
if (!key) {
  console.error('ELEVENLABS_API_KEY is not set (put it in .env.local).');
  process.exit(1);
}

const args = process.argv.slice(2);
const takes = Number(args.find((a) => a.startsWith('--takes='))?.split('=')[1] ?? 2);
const only = args.filter((a) => !a.startsWith('--'));
const wanted = SOUNDS.filter((s) => !only.length || only.some((o) => s.name.startsWith(o)));
if (!wanted.length) {
  console.error(`No sound matches ${only.join(', ')}. Names: ${SOUNDS.map((s) => s.name).join(', ')}`);
  process.exit(1);
}

const dir = new URL('../design/place-sounds/', import.meta.url);
mkdirSync(dir, { recursive: true });

for (const s of wanted) {
  for (let take = 1; take <= takes; take++) {
    const res = await fetch('https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128', {
      method: 'POST',
      headers: { 'xi-api-key': key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: s.text, duration_seconds: s.seconds, loop: s.loop, prompt_influence: 0.5 }),
    });
    if (!res.ok) {
      console.error(`${s.name} take ${take}: ElevenLabs ${res.status}: ${await res.text()}`);
      process.exit(1);
    }
    const file = `${s.name}-${take}.mp3`;
    writeFileSync(new URL(file, dir), Buffer.from(await res.arrayBuffer()));
    console.log(`design/place-sounds/${file}`);
  }
}
