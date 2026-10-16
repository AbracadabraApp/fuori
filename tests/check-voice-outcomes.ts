// Dropped audio is counted from the live logs (lib/voice-outcomes.ts): the
// 'voice' lines /v1/speak writes are found whether Railway passes the JSON
// through as is, lifts its fields to the top, or wraps it in `message`;
// everything else in the log is skipped.
import { summarizeVoiceLog } from '@/lib/voice-outcomes';

const problems: string[] = [];
const check = (ok: boolean, msg: string) => { if (!ok) problems.push(msg); };

const log = [
  '{"level":"info","event":"voice","outcome":"ok","characterId":"giulia","chars":40,"ms":900}',
  '{"level":"warn","event":"voice","outcome":"quota","characterId":"giulia","chars":40,"ms":120,"timestamp":"2026-10-16T06:00:00Z","message":""}',
  JSON.stringify({ level: 'info', timestamp: 'x', message: '{"event":"voice","outcome":"busy","characterId":"rita","chars":10,"ms":5}' }),
  '2026-10-16T06:00:00Z {"level":"info","event":"voice","outcome":"ok","characterId":"rita","chars":12,"ms":800}',
  '{"level":"info","message":"Starting Container"}',
  '{"level":"info","event":"turn","character":"giulia"}',
  'not json at all',
].join('\n');

const s = summarizeVoiceLog(log);
check(s.lines === 4, `four voice lines (got ${s.lines})`);
check(s.dropped === 2 && s.reasons.quota === 1 && s.reasons.busy === 1, `two dropped, by reason (got ${JSON.stringify(s)})`);
check(summarizeVoiceLog('').lines === 0, 'an empty log has no lines');

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log('OK: voice outcomes are counted from the logs, dropped lines by reason');
