// The trip's sounds on the ticket-and-map page must be heard (B51: Josh, 2026-11-23, "the sound
// effects are way too subtle, quiet, and short on map pages"; the first files peaked at -8 dBFS,
// averaged -24 and -20 dBFS, and faded out before the page's 3.5 s were up). Checks each bundled
// WAV: long enough to outlast the page, peaking near full scale, and loud on average while the
// page is showing. scripts/travel-sounds.py makes them. Run: npm run test:travel-sounds
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const DIR = join(process.cwd(), 'ios', 'FuoriKit', 'Sources', 'FuoriAudio', 'Sounds');
const PAGE_SECONDS = 3.5; // TravelMap.boardsAfter
const MIN_SECONDS = 4.5;
const MIN_PEAK_DB = -2;
const MIN_RMS_DB = -14;

const db = (x) => 20 * Math.log10(Math.max(x, 1e-9));
let failed = false;
for (const name of ['rails', 'road']) {
  const file = readFileSync(join(DIR, `${name}.wav`));
  let at = 12, rate = 0, channels = 0, bits = 0, data = null;
  while (at + 8 <= file.length) {
    const id = file.toString('ascii', at, at + 4), size = file.readUInt32LE(at + 4);
    if (id === 'fmt ') { channels = file.readUInt16LE(at + 10); rate = file.readUInt32LE(at + 12); bits = file.readUInt16LE(at + 22); }
    if (id === 'data') data = file.subarray(at + 8, at + 8 + size);
    at += 8 + size + (size % 2);
  }
  if (!data || bits !== 16) { console.error(`${name}.wav: not a 16-bit WAV`); failed = true; continue; }
  const n = data.length / 2 / channels;
  const seconds = n / rate;
  let peak = 0, sum = 0, counted = 0;
  for (let i = 0; i < n * channels; i++) {
    const v = data.readInt16LE(i * 2) / 32768;
    peak = Math.max(peak, Math.abs(v));
    if (i / channels < PAGE_SECONDS * rate) { sum += v * v; counted++; }
  }
  const rms = Math.sqrt(sum / counted);
  const problems = [];
  if (seconds < MIN_SECONDS) problems.push(`${seconds.toFixed(1)} s long, under ${MIN_SECONDS} s`);
  if (db(peak) < MIN_PEAK_DB) problems.push(`peaks at ${db(peak).toFixed(1)} dBFS, under ${MIN_PEAK_DB}`);
  if (db(rms) < MIN_RMS_DB) problems.push(`averages ${db(rms).toFixed(1)} dBFS over the page's ${PAGE_SECONDS} s, under ${MIN_RMS_DB}`);
  if (problems.length) { console.error(`✗ ${name}.wav: ${problems.join('; ')}`); failed = true; }
  else console.log(`✓ ${name}.wav: ${seconds.toFixed(1)} s, peak ${db(peak).toFixed(1)} dBFS, average ${db(rms).toFixed(1)} dBFS`);
}
if (failed) process.exit(1);
