/**
 * What /v1/transcribe makes of a recording (moved here from the route,
 * 2026-10-26, so scripts/replay-recordings.mts replays exactly what the app
 * gets). `mode` is "target" (the default), "en", "any" or "turn"; see
 * app/v1/transcribe/route.ts.
 */
import { language as learning } from '@/content';
import { getSpeechProvider } from '@/lib/speech/providers';
import type { ProviderName } from '@/lib/speech/providers/types';
import { spokenLanguage, sameWords } from '@/lib/speech/spoken-language';
import type { Laps } from '@/lib/timing';

export interface HeardRecording {
  text: string;
  language: string;
  /** A turn called English, transcribed again as the learned language */
  learned?: string;
  /** How a turn's language was decided */
  heard?: string;
}

export async function hearRecording(p: { audio: File; mode?: string; laps?: Laps; provider?: ProviderName }): Promise<HeardRecording> {
  const speech = getSpeechProvider(p.provider);
  const { mode } = p;
  const lang = mode === 'any' || mode === 'turn' ? undefined : mode === 'en' ? 'en' : learning.code;
  // No prompt: Whisper echoes it into short or quiet recordings (tests/check-transcribe.ts)
  let result = await speech.transcribe({ audio: p.audio, language: lang });
  let learned: string | undefined;
  let heard: string | undefined;
  p.laps?.lap('whisper');
  if (mode === 'turn') {
    const said = spokenLanguage(result.language, learning.code);
    heard = said;
    if (said === 'other') {
      result = { ...(await speech.transcribe({ audio: p.audio, language: learning.code })), language: learning.code };
      p.laps?.lap('again');
    } else {
      result = { ...result, language: said === 'en' ? 'en' : learning.code };
    }
    // Called English: Whisper sometimes translates a learner's speech into
    // English rather than transcribing it ("vorrei mangiare un cono alla
    // Nutella" came back as "I would like to eat a Nutella cone", Josh,
    // 2026-10-23). The same recording heard as the learned language goes
    // with it, so say it can tell a translation from real English
    if (said === 'en') {
      learned = (await speech.transcribe({ audio: p.audio, language: learning.code })).text;
      p.laps?.lap('as-learned');
      // Heard the same both ways: it was the learned language (no say it needed)
      if (sameWords(learned, result.text)) {
        result = { ...result, language: learning.code };
        learned = undefined;
        heard = 'learned (same both ways)';
      }
    }
  }
  return { text: result.text, language: result.language, ...(learned !== undefined ? { learned } : {}), ...(heard ? { heard } : {}) };
}
