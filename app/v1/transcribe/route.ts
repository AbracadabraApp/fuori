/**
 * POST /v1/transcribe (multipart: audio, mode?) → { text, language }
 *
 * Whisper on Groq. `audio` is the recording with a real file name and type
 * (the app sends speech.m4a); `mode` is "target" (the language being learned,
 * the default), "en" (asking how to say something) or "any" (onboarding
 * answers, which can be in either: Whisper detects the language and `language`
 * says which it heard). An empty `text` means
 * nothing was understood. The app skips uploading recordings with no voice in
 * them; this route still refuses oversized files.
 */
import { language as learning } from '@/content';
import { apiError, apiJson, withLearner } from '@/lib/api';
import { getSpeechProvider } from '@/lib/speech/providers';
import { logServerError } from '@/lib/server-log';

const MAX_BYTES = 10 * 1024 * 1024; // about ten minutes of m4a; a turn is seconds

export async function POST(request: Request) {
  return withLearner(request, 'v1 transcribe', async () => {
    const form = await request.formData().catch(() => null);
    const audio = form?.get('audio');
    if (!(audio instanceof File) || audio.size === 0) return apiError('bad_audio', 'Send the recording as multipart field "audio"');
    if (audio.size > MAX_BYTES) return apiError('bad_audio', `Recording too large (${audio.size} bytes)`);
    const mode = form?.get('mode');
    const lang = mode === 'any' ? undefined : mode === 'en' ? 'en' : learning.code;
    try {
      // No prompt: Whisper echoes it into short or quiet recordings (tests/check-transcribe.ts)
      const result = await getSpeechProvider().transcribe({ audio, language: lang });
      return apiJson({ text: result.text, language: result.language });
    } catch (err) {
      logServerError(request, 'v1 transcribe', err);
      return apiError('upstream_unavailable', 'Speech to text unavailable', 1000);
    }
  });
}
