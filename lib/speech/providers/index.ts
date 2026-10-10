/**
 * Speech provider factory
 *
 * Returns the configured speech-to-text provider based on environment variable.
 * Set SPEECH_PROVIDER to one of: whisper-groq (default), whisper-openai, gemini, azure
 */

import { SpeechProvider, ProviderName } from './types';
import { WhisperGroqProvider } from './whisper-groq';

const providerCache = new Map<ProviderName, SpeechProvider>();

export function getSpeechProvider(providerName?: ProviderName): SpeechProvider {
  const name = (providerName || process.env.SPEECH_PROVIDER || 'whisper-groq') as ProviderName;

  // Return cached provider if available
  if (providerCache.has(name)) {
    return providerCache.get(name)!;
  }

  // Create new provider instance
  let provider: SpeechProvider;

  switch (name) {
    case 'whisper-groq':
      provider = new WhisperGroqProvider();
      break;

    case 'whisper-openai':
      throw new Error('whisper-openai provider not yet implemented');

    case 'gemini':
      throw new Error('gemini provider not yet implemented');

    case 'azure':
      throw new Error('azure provider not yet implemented');

    default:
      throw new Error(
        `Unknown speech provider: ${name}. Available providers: whisper-groq, whisper-openai, gemini, azure`
      );
  }

  // Cache and return
  providerCache.set(name, provider);
  return provider;
}

// Export types for convenience
export type { SpeechProvider, TranscriptionParams, TranscriptionResult, ProviderName } from './types';
