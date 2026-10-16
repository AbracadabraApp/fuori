/**
 * Forced upgrades (docs/12-native-app.md → Versioning): app builds stay on
 * phones for months, so /v1 only ever changes additively. If a build has to
 * stop working anyway (a bug that costs money, a change that can't be made
 * additively), set MIN_APP_VERSION on the Railway service (e.g. "1.2") and
 * older builds get 426 upgrade_required, which the app shows as "update the
 * app". Unset (the default): every build is accepted. Requests without the
 * X-App-Version header (builds from before it, the web) are accepted too.
 */

import { apiError } from './api';

/** Compares dotted versions ("1.10" > "1.9"); missing parts count as 0 */
export function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map((n) => parseInt(n, 10) || 0);
  const pb = b.split('.').map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d !== 0) return Math.sign(d);
  }
  return 0;
}

/** A 426 response when this app build is older than MIN_APP_VERSION; otherwise null */
export function upgradeRequired(request: Request, minimum = process.env.MIN_APP_VERSION): Response | null {
  const version = request.headers.get('x-app-version');
  if (!minimum || !version) return null;
  if (compareVersions(version, minimum) >= 0) return null;
  return apiError('upgrade_required', 'This version of the app is too old. Update it to keep playing.');
}
