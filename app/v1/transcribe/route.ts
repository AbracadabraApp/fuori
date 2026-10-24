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
import { language as learning } from '@/content';
import { apiError, apiJson, withLearner } from '@/lib/api';
import { getSpeechProvider } from '@/lib/speech/providers';
import { logServerError } from '@/lib/server-log';
import { Laps } from '@/lib/timing';
import { spokenLanguage } from '@/lib/speech/spoken-language';

const MAX_BYTES = 10 * 1024 * 1024; // about ten minutes of m4a; a turn is seconds

export async function POST(request: Request) {
  const laps = new Laps();
  return withLearner(request, 'v1 transcribe', async () => {
    laps.lap('auth');
    const form = await request.formData().catch(() => null);
    const audio = form?.get('audio');
    if (!(audio instanceof File) || audio.size === 0) return apiError('bad_audio', 'Send the recording as multipart field "audio"');
    if (audio.size > MAX_BYTES) return apiError('bad_audio', `Recording too large (${audio.size} bytes)`);
    const mode = form?.get('mode');
    const lang = mode === 'any' || mode === 'turn' ? undefined : mode === 'en' ? 'en' : learning.code;
    try {
      // No prompt: Whisper echoes it into short or quiet recordings (tests/check-transcribe.ts)
      laps.lap('upload');
      let result = await getSpeechProvider().transcribe({ audio, language: lang });
      let learned: string | undefined;
      laps.lap('whisper');
      if (mode === 'turn') {
        const heard = spokenLanguage(result.language, learning.code);
        if (heard === 'other') {
          result = { ...(await getSpeechProvider().transcribe({ audio, language: learning.code })), language: learning.code };
          laps.lap('again');
        } else {
          result = { ...result, language: heard === 'en' ? 'en' : learning.code };
        }
        laps.facts.heard = heard;
        // Called English: Whisper sometimes translates a learner's speech into
        // English rather than transcribing it ("vorrei mangiare un cono alla
        // Nutella" came back as "I would like to eat a Nutella cone", Josh,
        // 2026-10-23). The same recording heard as the learned language goes
        // with it, so say it can tell a translation from real English
        if (heard === 'en') {
          learned = (await getSpeechProvider().transcribe({ audio, language: learning.code })).text;
          laps.lap('as-learned');
        }
      }
      laps.facts.bytes = audio.size;
      laps.log('transcribe-timing', request.headers.get('x-fuori-id'));
      return apiJson({ text: result.text, language: result.language, ...(learned !== undefined ? { learned } : {}) }, { headers: { 'server-timing': laps.header() } });
    } catch (err) {
      logServerError(request, 'v1 transcribe', err);
      return apiError('upstream_unavailable', 'Speech to text unavailable', 1000);
    }
  });
}

