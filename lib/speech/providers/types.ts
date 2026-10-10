/**
 * Common types for speech-to-text providers
 */

export interface TranscriptionResult {
  text: string;
  language: string;
  confidence?: number;
  duration?: number;
}

export interface TranscriptionParams {
  audio: Buffer | Blob | File;
  language: string;
  mimeType?: string;
  prompt?: string;
}

export interface SpeechProvider {
  name: string;
  transcribe(params: TranscriptionParams): Promise<TranscriptionResult>;
}

export type ProviderName = 'whisper-groq' | 'whisper-openai' | 'gemini' | 'azure';
