/**
 * POST /v1/auth/device → { learnerId, token }
 *
 * The app's first call: makes a new learner and a bearer token for this
 * device. The app keeps the token in the Keychain and sends it as
 * `Authorization: Bearer <token>` on every other /v1 call. The token is shown
 * once; the server keeps only its hash (lib/auth.ts). Limited per IP; App
 * Attest is added before testers beyond Josh (docs/12-native-app.md, N4).
 */
import { registerDevice } from '@/lib/auth';
import { apiError, apiJson, serverError } from '@/lib/api';
import { allow, clientIp } from '@/lib/rate-limit';
import { upgradeRequired } from '@/lib/app-version';

const PER_HOUR = 10;

export async function POST(request: Request) {
  const tooOld = upgradeRequired(request);
  if (tooOld) return tooOld;
  if (!allow(`device:${clientIp(request)}`, PER_HOUR, 60 * 60 * 1000)) {
    return apiError('rate_limited', `At most ${PER_HOUR} new devices an hour from one address`, 60 * 60 * 1000);
  }
  try {
    return apiJson(await registerDevice(), { status: 201 });
  } catch (err) {
    return serverError(request, 'v1 auth device', err);
  }
}
