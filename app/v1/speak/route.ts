/**
 * POST /v1/speak { text, characterId, speed? } → audio/mpeg
 *
 * The character's line in their ElevenLabs voice, chosen on the server from
 * the character id. Any error answer means "use the phone's own voice"
 * (AVSpeechSynthesizer); `code` says why: quota (402, don't retry until the
 * quota resets), rate_limited, upstream_unavailable.
 */
import { language } from '@/content';
import { apiError, withLearner } from '@/lib/api';
import { takeEarlyVoice, voiceForCharacter, deliveryForCharacter } from '@/lib/voice/early-voice';
import { getVoiceProvider } from '@/lib/voice/providers';
import { VoiceError } from '@/lib/voice/providers/elevenlabs';
import { allow } from '@/lib/rate-limit';
import { logServerError } from '@/lib/server-log';
import { logVoiceOutcome } from '@/lib/voice-outcomes';
import { Laps } from '@/lib/timing';

const MAX_TEXT = 1000; // a reply is ~20 words; Magda's longest are a few hundred characters
const PER_10_MIN = 150;

export async function POST(request: Request) {
  const laps = new Laps();
  return withLearner(request, 'v1 speak', async (learnerId) => {
    laps.lap('auth');
    const body = await request.json().catch(() => null);
    const text = body?.text;
    const characterId = body?.characterId;
    const speed = body?.speed ?? 1;
    if (typeof text !== 'string' || !text.trim() || text.length > MAX_TEXT) return apiError('bad_request', `text is required, at most ${MAX_TEXT} characters`);
    if (typeof characterId !== 'string') return apiError('bad_request', 'characterId is required');
    if (typeof speed !== 'number' || speed < 0.5 || speed > 2) return apiError('bad_request', 'speed must be between 0.5 and 2');
    if (!allow(`speak:${learnerId}`, PER_10_MIN, 10 * 60 * 1000)) {
      logVoiceOutcome('rate-limit', characterId, text.length, 0, request.headers.get('x-fuori-id'));
      return apiError('rate_limited', 'Too many lines spoken; try again shortly', 60_000);
    }

    const started = Date.now();
    const id = request.headers.get('x-fuori-id');
    const outcome = (o: Parameters<typeof logVoiceOutcome>[0]) => logVoiceOutcome(o, characterId, text.length, Date.now() - started, id);
    const provider = getVoiceProvider();
    if (provider.name !== 'elevenlabs') {
      outcome('not-configured');
      return apiError('upstream_unavailable', 'No hosted voice configured');
    }
    try {
      // Started by /v1/turn as soon as the line was written (lib/voice/early-voice.ts)
      const early = await takeEarlyVoice(learnerId, characterId, speed, text.trim());
      laps.facts.early = early === undefined ? 'no' : early ? 'yes' : 'failed';
      const result =
        early ??
        (await provider.synthesize({
          text,
          language: language.code,
          characterId,
          // The greeter has her own voice (content/<country>/onboarding.ts); characters get one by gender
          voice: voiceForCharacter(characterId),
          ...deliveryForCharacter(characterId),
          speed,
        }));
      if (!result.audio) {
        outcome('no-audio');
        return apiError('upstream_unavailable', 'The voice service returned no audio');
      }
      outcome('ok');
      laps.lap('elevenlabs');
      laps.facts.chars = text.length;
      laps.facts.bytes = result.audio.length;
      laps.log('speak-timing', id);
      return new Response(new Uint8Array(result.audio), {
        headers: {
          'server-timing': laps.header(),
          'content-type': 'audio/mpeg',
          'content-length': String(result.audio.length),
          'cache-control': 'private, max-age=86400',
          ...(result.duration ? { 'x-audio-duration': String(result.duration) } : {}),
        },
      });
    } catch (err) {
      logServerError(request, 'v1 speak', err);
      const reason = err instanceof VoiceError ? err.reason : 'other';
      if (reason === 'quota' || reason === 'auth') {
        outcome('quota');
        return apiError('quota', 'Voice quota used up or key rejected');
      }
      if (reason === 'rate-limit') {
        outcome('busy');
        return apiError('rate_limited', 'Voice service busy', 2000);
      }
      outcome('unavailable');
      return apiError('upstream_unavailable', 'Voice service unavailable');
    }
  });
}
