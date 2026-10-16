/**
 * How many character lines lost their hosted voice (ElevenLabs) and fell back
 * to the phone's own voice, from the live logs of both services:
 *
 *   npm run voice:failures            # recent deployments (Railway keeps about 20)
 *
 * Counts the 'voice' lines /v1/speak writes (lib/voice-outcomes.ts), one per
 * line asked for. Lines spoken before that logging existed (2026-10-16) aren't
 * counted. Needs the Railway CLI, linked (see the railway-cli notes).
 */
import { execFileSync } from 'child_process';
import { summarizeVoiceLog, type VoiceSummary } from '@/lib/voice-outcomes';

const SERVICES = ['Fuori', 'Afuera'];

function railway(args: string[]): string {
  return execFileSync('railway', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });
}

const total: VoiceSummary = { lines: 0, dropped: 0, reasons: {} };
for (const service of SERVICES) {
  const deployments = JSON.parse(railway(['deployment', 'list', '--service', service, '--json'])) as { id: string; status: string }[];
  const ran = deployments.filter((d) => ['SUCCESS', 'REMOVED', 'CRASHED', 'FAILED'].includes(d.status));
  const s: VoiceSummary = { lines: 0, dropped: 0, reasons: {} };
  for (const d of ran) {
    // 5000 is the most Railway returns per call; each deployment is usually far shorter
    const part = summarizeVoiceLog(railway(['logs', d.id, '--service', service, '--lines', '5000', '--json']));
    s.lines += part.lines;
    s.dropped += part.dropped;
    for (const [k, v] of Object.entries(part.reasons)) s.reasons[k] = (s.reasons[k] ?? 0) + v;
  }
  const why = Object.entries(s.reasons).map(([k, v]) => `${k} ${v}`).join(', ');
  console.log(`${service}: ${s.dropped} of ${s.lines} lines dropped their voice${s.lines ? ` (${Math.round((s.dropped / s.lines) * 100)}%)` : ''}${why ? `: ${why}` : ''} · ${ran.length} deployments read`);
  total.lines += s.lines;
  total.dropped += s.dropped;
}
if (!total.lines) console.log('No voice lines logged yet (logging started 2026-10-16).');
