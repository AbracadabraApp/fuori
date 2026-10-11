/**
 * Whisper via Groq provider implementation
 */

import Groq from 'groq-sdk';
import { SpeechProvider, TranscriptionParams, TranscriptionResult } from './types';
import { audioFileName } from '../audio-file';

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

    // Groq expects a File whose name has the right extension. Uploads from the
    // phone arrive named "blob", so always make sure the name matches the type.
    let audioFile: File;
    if (audio instanceof Blob) {
      const type = audio.type || 'audio/webm';
      const name = audioFileName(type, audio instanceof File ? audio.name : undefined);
      console.log('Groq transcribe:', { received: audio instanceof File ? audio.name : '(blob)', name, type, size: audio.size });
      audioFile = audio instanceof File && audio.name === name ? audio : new File([audio], name, { type });
    } else {
      // Buffer - cast to any to work around Node.js Buffer type incompatibilities
      // Buffer is compatible with BlobPart at runtime, but TypeScript doesn't recognize it
      console.log('Groq transcribe - Buffer input');
      audioFile = new File([audio as any], 'speech.webm', { type: 'audio/webm' });
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
