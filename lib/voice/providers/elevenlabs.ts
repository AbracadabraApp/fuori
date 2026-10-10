/**
 * ElevenLabs TTS provider implementation
 */

import { VoiceProvider, SynthesisParams, SynthesisResult, Voice } from './types';

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

  // Default Italian voice mappings for characters
  // Can be overridden via environment or character sheet
  private voiceMap: Record<string, string> = {
    default: 'pNInz6obpgDQGcFmaJgB', // Example: Adam voice
  };

  constructor(apiKey?: string) {
    const key = apiKey || process.env.ELEVENLABS_API_KEY;
    if (!key) {
      throw new Error('ELEVENLABS_API_KEY is required for ElevenLabs provider');
    }
    this.apiKey = key;
  }

  async synthesize(params: SynthesisParams): Promise<SynthesisResult> {
    const { text, voice, speed = 1.0, characterId } = params;

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
        model_id: 'eleven_multilingual_v2', // Supports Italian
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} ${errorText}`);
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

  async listVoices(language: string = 'it'): Promise<Voice[]> {
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
