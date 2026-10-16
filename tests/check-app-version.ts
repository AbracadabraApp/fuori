// Forced upgrades (lib/app-version.ts): with MIN_APP_VERSION set, older app
// builds get 426 upgrade_required; newer builds, requests without the header
// (old builds, the web) and an unset minimum (the default) are let through.
import { compareVersions, upgradeRequired } from '@/lib/app-version';

const problems: string[] = [];
const check = (ok: boolean, msg: string) => { if (!ok) problems.push(msg); };

check(compareVersions('1.10', '1.9') > 0, '1.10 is newer than 1.9');
check(compareVersions('1.2', '1.2.0') === 0, '1.2 equals 1.2.0');
check(compareVersions('0.9.5', '1.0') < 0, '0.9.5 is older than 1.0');

const req = (version?: string) => new Request('https://x/v1/me', { headers: version ? { 'x-app-version': version } : {} });

check(upgradeRequired(req('0.1.0'), undefined) === null, 'no minimum set: every build accepted');
check(upgradeRequired(req(), '1.0') === null, 'no header (old builds, the web): accepted');
check(upgradeRequired(req('1.0'), '1.0') === null, 'the minimum itself is accepted');
check(upgradeRequired(req('1.1'), '1.0') === null, 'newer builds accepted');

async function main() {
  const old = upgradeRequired(req('0.9'), '1.0');
  check(old?.status === 426, `older build gets 426 (got ${old?.status})`);
  if (old) {
    const body = await old.json();
    check(body.error?.code === 'upgrade_required' && body.error?.retryable === false, 'error is upgrade_required, not retryable');
  }

  if (problems.length) {
    console.error(problems.join('\n'));
    process.exit(1);
  }
  console.log('OK: builds older than MIN_APP_VERSION get 426 upgrade_required; everything else passes');
}

main();
