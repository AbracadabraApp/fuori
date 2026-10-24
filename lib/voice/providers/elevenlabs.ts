/**
 * ElevenLabs TTS provider implementation
 */

import { VoiceProvider, SynthesisParams, SynthesisResult, Voice } from './types';

/** Why the hosted voice failed, so logs and the learner's note can say so plainly. */
export type VoiceFailure = 'quota' | 'rate-limit' | 'auth' | 'other';

export class VoiceError extends Error {
  constructor(message: string, public reason: VoiceFailure, public status: number) {
    super(message);
  }
}

/**
 * Turn an ElevenLabs error response into a VoiceError. ElevenLabs reports an
 * exhausted character quota as 401 with detail.status "quota_exceeded", which
 * would otherwise look like a bad API key.
 */
export function elevenLabsError(status: number, body: string): VoiceError {
  let detail = '';
  try {
    const parsed = JSON.parse(body);
    detail = parsed?.detail?.status ?? parsed?.detail?.code ?? '';
  } catch {
    // not JSON
  }
  const text = `${detail} ${body}`.toLowerCase();
  const reason: VoiceFailure = text.includes('quota')
    ? 'quota'
    : status === 429
      ? 'rate-limit'
      : status === 401 || status === 403
        ? 'auth'
        : 'other';
  const label = { quota: 'character quota used up', 'rate-limit': 'rate limited', auth: 'API key rejected', other: 'request failed' }[reason];
  return new VoiceError(`ElevenLabs ${label} (${status}): ${body.slice(0, 300)}`, reason, status);
}

interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  labels: {
    language?: string;
    gender?: string;
    [key: string]: string | undefined;
  };
}

export class ElevenLabsProvider implements VoiceProvider {
  name = 'elevenlabs';
  private apiKey: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';

  // Fallback only. /api/speak picks per-character voices from content/it/voices.ts
  private voiceMap: Record<string, string> = {
    default: 'pFZP5JQG7iQjIQuC4Bku', // Lily - Velvety Actress (female, verified Italian)
  };

  constructor(apiKey?: string) {
    const key = apiKey || process.env.ELEVENLABS_API_KEY;
    if (!key) {
      throw new Error('ELEVENLABS_API_KEY is required for ElevenLabs provider');
    }
    this.apiKey = key;
  }

  async synthesize(params: SynthesisParams): Promise<SynthesisResult> {
    const { text, voice, speed = 1.0, characterId, stability = 0.5, style = 0.0 } = params;

    // Determine which voice to use
    const voiceId = voice || (characterId && this.voiceMap[characterId]) || this.voiceMap.default;

    // Build request to ElevenLabs API
    const url = `${this.baseUrl}/text-to-speech/${voiceId}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': this.apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_flash_v2_5', // Flash v2.5: fast, Italian support, 32 languages
        // The second clip of a line split for speed carries on from the first
        ...(params.previousText ? { previous_text: params.previousText } : {}),
        voice_settings: {
          stability,
          similarity_boost: 0.75,
          style,
          use_speaker_boost: true,
        },
      }),
    });

    if (!response.ok) {
      throw elevenLabsError(response.status, await response.text());
    }

    // Get audio data as buffer
    const arrayBuffer = await response.arrayBuffer();
    const audio = Buffer.from(arrayBuffer);

    // Estimate duration (rough approximation: ~150 words per minute)
    const wordCount = text.split(/\s+/).length;
    const duration = (wordCount / 150) * 60 / speed;

    return {
      audio,
      duration,
    };
  }

  async listVoices(language: string): Promise<Voice[]> {
    const url = `${this.baseUrl}/voices`;

    const response = await fetch(url, {
      headers: {
        'xi-api-key': this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const data = await response.json();
    const voices: ElevenLabsVoice[] = data.voices || [];

    // Filter and map to our Voice interface
    return voices
      .filter((v) => {
        const voiceLang = v.labels?.language?.toLowerCase();
        return !language || voiceLang === language || voiceLang?.startsWith(language);
      })
      .map((v) => ({
        id: v.voice_id,
        name: v.name,
        language: v.labels?.language || 'unknown',
        gender: this.parseGender(v.labels?.gender),
        provider: 'elevenlabs',
      }));
  }

  private parseGender(gender?: string): 'male' | 'female' | 'neutral' | undefined {
    if (!gender) return undefined;
    const normalized = gender.toLowerCase();
    if (normalized === 'male' || normalized === 'masculine') return 'male';
    if (normalized === 'female' || normalized === 'feminine') return 'female';
    return 'neutral';
  }

  /**
   * Set voice mapping for a specific character
   */
  setVoiceForCharacter(characterId: string, voiceId: string): void {
    this.voiceMap[characterId] = voiceId;
  }

  /**
   * Get available voice mappings
   */
  getVoiceMappings(): Record<string, string> {
    return { ...this.voiceMap };
  }
}
