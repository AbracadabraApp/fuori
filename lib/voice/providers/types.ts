/**
 * Common types for text-to-speech providers
 */

export interface VoiceProvider {
  name: string;
  synthesize(params: SynthesisParams): Promise<SynthesisResult>;
  listVoices?(language: string): Promise<Voice[]>;
}

export interface SynthesisParams {
  text: string;
  language: string;
  voice?: string; // voice ID or name
  speed?: number; // 0.5 to 2.0
  characterId?: string; // for voice mapping
}

export interface SynthesisResult {
  audio?: Buffer; // audio data (for server-side providers)
  audioUrl?: string; // URL to audio (if hosted)
  useBrowserSpeech?: boolean; // true if client should use browser TTS
  duration?: number; // in seconds
}

export interface Voice {
  id: string;
  name: string;
  language: string;
  gender?: 'male' | 'female' | 'neutral';
  provider?: string;
}

export type VoiceProviderName = 'elevenlabs' | 'browser-speech' | 'openai' | 'azure';
