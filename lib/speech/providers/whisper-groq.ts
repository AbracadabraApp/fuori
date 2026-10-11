/**
 * Whisper via Groq provider implementation
 */

import Groq from 'groq-sdk';
import { SpeechProvider, TranscriptionParams, TranscriptionResult } from './types';

export class WhisperGroqProvider implements SpeechProvider {
  name = 'whisper-groq';
  private groq: Groq;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.GROQ_API_KEY;
    if (!key) {
      throw new Error('GROQ_API_KEY is required for Whisper Groq provider');
    }
    this.groq = new Groq({ apiKey: key });
  }

  async transcribe(params: TranscriptionParams): Promise<TranscriptionResult> {
    const { audio, language, prompt } = params;

    // Helper to get file extension from mime type
    const getExtensionFromMimeType = (mimeType: string): string => {
      const mimeMap: Record<string, string> = {
        'audio/webm': 'webm',
        'audio/mp4': 'mp4',
        'audio/mpeg': 'mp3',
        'audio/m4a': 'm4a',
        'audio/ogg': 'ogg',
        'audio/wav': 'wav',
        'audio/flac': 'flac',
      };
      return mimeMap[mimeType] || 'webm';
    };

    // Groq expects a File object
    let audioFile: File;
    if (audio instanceof File) {
      audioFile = audio;
    } else if (audio instanceof Blob) {
      const extension = getExtensionFromMimeType(audio.type);
      audioFile = new File([audio], `audio.${extension}`, { type: audio.type });
    } else {
      // Buffer - cast to any to work around Node.js Buffer type incompatibilities
      // Buffer is compatible with BlobPart at runtime, but TypeScript doesn't recognize it
      audioFile = new File([audio as any], 'audio.webm', { type: 'audio/webm' });
    }

    // Build transcription options
    const transcriptionOptions: any = {
      file: audioFile,
      model: 'whisper-large-v3-turbo',
      language: language,
      response_format: 'json',
    };

    // Add prompt if provided (helpful for context)
    if (prompt) {
      transcriptionOptions.prompt = prompt;
    }

    const transcription = await this.groq.audio.transcriptions.create(transcriptionOptions);

    return {
      text: transcription.text,
      language: language,
    };
  }
}
