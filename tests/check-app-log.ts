// /v1/log: errors from the iPhone app reach the server log. A good report is
// accepted and logged as one JSON line with its code; junk, oversized
// reports and bad codes are refused; extra fields are dropped, not logged.
import { appLogLine, parseAppLog, MAX_LOG_BYTES } from '@/lib/app-log';

const problems: string[] = [];
const check = (ok: boolean, msg: string) => { if (!ok) problems.push(msg); };

const good = { id: 'E-7K2F', step: 'turn', code: 'server_error', status: 500, message: 'Something went wrong', appVersion: '1.0 (1)', os: 'iOS 26.6', context: { placeId: 'bar-x', attempt: 1 } };
const ok = parseAppLog(JSON.stringify(good));
check(ok.ok, 'a good report should be accepted');
if (ok.ok) {
  const line = JSON.parse(appLogLine(ok.report, 'learner-1'));
  check(line.level === 'error' && line.source === 'app', 'logged as an app error');
  check(line.id === 'E-7K2F' && line.step === 'turn' && line.learnerId === 'learner-1', 'the line carries the code, the step and the learner');
}
const extra = parseAppLog(JSON.stringify({ ...good, password: 'x' }));
check(extra.ok && !('password' in extra.report), 'unknown fields are dropped');
check(!parseAppLog('not json').ok, 'non-JSON refused');
check(!parseAppLog(JSON.stringify({ ...good, id: 'hello' })).ok, 'a code that is not E-XXXX is refused');
check(!parseAppLog(JSON.stringify({ step: 'turn', message: 'x' })).ok, 'a report without a code is refused');
check(!parseAppLog('x'.repeat(MAX_LOG_BYTES + 1)).ok, 'oversized reports refused');
check(!parseAppLog(JSON.stringify({ ...good, message: 'x'.repeat(2001) })).ok, 'over-long messages refused');

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log('OK: app error reports are checked and logged with their code');
