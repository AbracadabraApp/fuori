/**
 * The conversation library keeps only listed learners' recordings, under
 * <country>/<learner>/, audio and what was heard side by side
 * (lib/speech/keep-recording.ts). With R2 keys and RECORDINGS_BUCKET set
 * (.env.local), also stores one, reads it back and deletes it.
 *   npm run test:keep-recording
 */
import { shouldKeep, recordingKeys, keepRecording, recordingsBucket } from '@/lib/speech/keep-recording';

const problems: string[] = [];
const check = (what: string, ok: boolean, got?: unknown) => { if (!ok) problems.push(`${what}${got === undefined ? '' : `: ${JSON.stringify(got)}`}`); };

check('nobody is kept when the list is empty', !shouldKeep('a', '') && !shouldKeep('a', undefined));
check('a listed learner is kept', shouldKeep('b', 'a, b ,c'));
check('an unlisted learner is not', !shouldKeep('d', 'a,b,c'));
const keys = recordingKeys('it', 'L1', new Date('2026-10-26T18:00:00.123Z'), 'r4nd', 'speech.m4a');
check('audio key', keys.audio === 'it/L1/2026-10-26T18-00-00-123Z-r4nd.m4a', keys.audio);
check('what was heard sits beside it', keys.meta === 'it/L1/2026-10-26T18-00-00-123Z-r4nd.json', keys.meta);

// Every PUT states its length: R2 answers 411 without it, which lost 19 of
// 20 recordings on 2026-10-29. A stand-in fetch records what would be sent
{
  const env = { ...process.env };
  Object.assign(process.env, { R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID || 'acct', R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID || 'id', R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY || 'secret', RECORDINGS_BUCKET: process.env.RECORDINGS_BUCKET || 'bucket' });
  const sent: { length: string | null; bytes: number }[] = [];
  const send = (async (_url: unknown, init?: RequestInit) => {
    sent.push({ length: new Headers(init?.headers).get('content-length'), bytes: (init?.body as Uint8Array).byteLength });
    return new Response('', { status: 200 });
  }) as typeof fetch;
  const audio = new File([new Uint8Array(73124)], 'speech.m4a', { type: 'audio/mp4' });
  await keepRecording({ country: 'test', learnerId: 'L1', audio, heard: { mode: 'target', text: 'x', language: 'es' }, send });
  check('two PUTs, audio and what was heard', sent.length === 2, sent);
  check('every PUT states its length, and it is right', sent.every((s) => s.length === String(s.bytes)), sent);
  check('the audio goes whole', sent[0]?.bytes === 73124, sent[0]);
  process.env = env;
}

if (process.env.RECORDINGS_BUCKET && process.env.R2_ACCESS_KEY_ID) {
  const audio = new File([new Uint8Array([1, 2, 3, 4])], 'speech.m4a', { type: 'audio/mp4' });
  const key = await keepRecording({ country: 'test', learnerId: 'check-keep-recording', audio, heard: { mode: 'turn', text: 'ciao', language: 'it' } });
  const { client, url } = recordingsBucket();
  const meta = await (await client.fetch(`${url}/${key.replace(/\.m4a$/, '.json')}`)).json();
  check('stored: what was heard reads back', meta.text === 'ciao' && meta.audio === key && meta.bytes === 4, meta);
  const back = new Uint8Array(await (await client.fetch(`${url}/${key}`)).arrayBuffer());
  check('stored: the audio reads back', back.length === 4, back.length);
  for (const k of [key, key.replace(/\.m4a$/, '.json')]) await client.fetch(`${url}/${k}`, { method: 'DELETE' });
  console.log('  (stored, read back and deleted one in R2)');
}

if (problems.length) { console.error('FAIL:\n  ' + problems.join('\n  ')); process.exit(1); }
console.log('OK: only listed learners\' recordings are kept, audio and what was heard side by side');
