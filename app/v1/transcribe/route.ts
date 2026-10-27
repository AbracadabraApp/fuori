/**
 * POST /v1/transcribe (multipart: audio, mode?) → { text, language }
 *
 * Whisper on Groq. `audio` is the recording with a real file name and type
 * (the app sends speech.m4a); `mode` is "target" (the language being learned,
 * the default), "en" (asking how to say something) or "any" (onboarding
 * answers, which can be in either: Whisper detects the language and `language`
 * says which it heard) or "turn" (a conversation turn, which may be the
 * language being learned or English for "say it in English": `language` is
 * "en" for English, otherwise the learned language's code; anything Whisper
 * names as a third language is transcribed again as the learned language, since
 * beginners' accents get misnamed). An empty `text` means
 * nothing was understood. The app skips uploading recordings with no voice in
 * them; this route still refuses oversized files.
 */
import { after } from 'next/server';
import { country } from '@/content';
import { apiError, apiJson, withLearner } from '@/lib/api';
import { logServerError } from '@/lib/server-log';
import { Laps } from '@/lib/timing';
import { hearRecording } from '@/lib/speech/hear-recording';
import { keepRecording, shouldKeep } from '@/lib/speech/keep-recording';

const MAX_BYTES = 10 * 1024 * 1024; // about ten minutes of m4a; a turn is seconds

export async function POST(request: Request) {
  const laps = new Laps();
  return withLearner(request, 'v1 transcribe', async (learnerId) => {
    laps.lap('auth');
    const form = await request.formData().catch(() => null);
    const audio = form?.get('audio');
    if (!(audio instanceof File) || audio.size === 0) return apiError('bad_audio', 'Send the recording as multipart field "audio"');
    if (audio.size > MAX_BYTES) return apiError('bad_audio', `Recording too large (${audio.size} bytes)`);
    const mode = form?.get('mode');
    try {
      laps.lap('upload');
      const { text, language, learned, heard } = await hearRecording({ audio, mode: typeof mode === 'string' ? mode : undefined, laps });
      if (heard) laps.facts.heard = heard;
      laps.facts.bytes = audio.size;
      laps.log('transcribe-timing', request.headers.get('x-fuori-id'));
      // The conversation library: kept after the answer is sent, so it costs
      // the turn nothing; a failure is logged (lib/speech/keep-recording.ts)
      if (shouldKeep(learnerId)) {
        const kept = { mode: typeof mode === 'string' ? mode : 'target', text, language, learned, heard };
        after(() => keepRecording({ country, learnerId, audio, heard: kept }).catch((err) => logServerError(request, 'v1 transcribe: keep recording', err)));
      }
      return apiJson({ text, language, ...(learned !== undefined ? { learned } : {}) }, { headers: { 'server-timing': laps.header() } });
    } catch (err) {
      logServerError(request, 'v1 transcribe', err);
      return apiError('upstream_unavailable', 'Speech to text unavailable', 1000);
    }
  });
}

