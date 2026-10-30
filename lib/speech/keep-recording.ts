/**
 * The conversation library, smallest version (roadmap N6; Josh, 2026-10-26:
 * only his own recordings, kept 30 days): each recording sent to
 * /v1/transcribe by a learner listed in KEEP_RECORDINGS_FOR is kept in the
 * private R2 bucket RECORDINGS_BUCKET, with what speech to text made of it,
 * so changes to speech to text, routing or the end-of-turn silence can be
 * replayed on real speech (scripts/replay-recordings.mts). The bucket deletes
 * everything after 30 days (an R2 lifecycle rule, not code).
 *
 * Keys: <country>/<learner>/<time>-<random>.m4a and the same .json beside it.
 */
import { AwsClient } from 'aws4fetch';

export interface Heard {
  mode: string;
  text: string;
  language: string;
  learned?: string;
  heard?: unknown;
}

/** Learner ids whose recordings are kept (comma-separated KEEP_RECORDINGS_FOR) */
export function keptLearners(env: string | undefined = process.env.KEEP_RECORDINGS_FOR): Set<string> {
  return new Set((env ?? '').split(',').map((s) => s.trim()).filter(Boolean));
}

export function shouldKeep(learnerId: string, env?: string): boolean {
  return keptLearners(env).has(learnerId);
}

export function recordingKeys(country: string, learnerId: string, at: Date, random: string, fileName: string) {
  const ext = /\.(\w+)$/.exec(fileName)?.[1] ?? 'm4a';
  const base = `${country}/${learnerId}/${at.toISOString().replace(/[:.]/g, '-')}-${random}`;
  return { audio: `${base}.${ext}`, meta: `${base}.json` };
}

export function recordingsBucket() {
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, RECORDINGS_BUCKET } = process.env;
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !RECORDINGS_BUCKET) {
    throw new Error('Keeping recordings needs R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY and RECORDINGS_BUCKET');
  }
  return {
    client: new AwsClient({ accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY, service: 's3', region: 'auto' }),
    url: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${RECORDINGS_BUCKET}`,
  };
}

/**
 * One PUT with the length stated. R2 refuses an upload without
 * Content-Length (411), and on Railway nearly every audio PUT went out
 * without one (19 of 20 on 2026-10-29): `client.fetch` hands fetch a
 * Request, whose body can be sent as a stream of unknown length. So it signs
 * the request, then sends the bytes itself with the length set. `send` is
 * for the test.
 */
export async function putObject(key: string, bytes: Uint8Array<ArrayBuffer>, type: string, send: typeof fetch = fetch): Promise<void> {
  const { client, url } = recordingsBucket();
  const length = String(bytes.byteLength);
  const signed = await client.sign(`${url}/${key}`, { method: 'PUT', body: bytes, headers: { 'content-type': type, 'content-length': length } });
  const headers = new Headers(signed.headers);
  headers.set('content-length', length);
  const res = await send(signed.url, { method: 'PUT', body: bytes, headers });
  if (!res.ok) throw new Error(`R2 PUT ${key}: ${res.status} ${await res.text()}`);
}

/** Store the recording and what was heard; throws if either upload fails */
export async function keepRecording(p: { country: string; learnerId: string; audio: File; heard: Heard; at?: Date; send?: typeof fetch }): Promise<string> {
  const at = p.at ?? new Date();
  const keys = recordingKeys(p.country, p.learnerId, at, crypto.randomUUID().slice(0, 8), p.audio.name);
  await putObject(keys.audio, new Uint8Array(await p.audio.arrayBuffer()), p.audio.type || 'audio/mp4', p.send);
  const meta = { at: at.toISOString(), country: p.country, learnerId: p.learnerId, audio: keys.audio, bytes: p.audio.size, ...p.heard };
  await putObject(keys.meta, new TextEncoder().encode(JSON.stringify(meta, null, 2)), 'application/json', p.send);
  return keys.audio;
}
