/**
 * Voice provider factory
 *
 * Returns the configured text-to-speech provider based on environment variable.
 * Set VOICE_PROVIDER to one of: elevenlabs, browser-speech, openai, azure
 *
 * Default behavior:
 * - If ELEVENLABS_API_KEY is set: use elevenlabs
 * - Otherwise: fall back to browser-speech
 */

import { VoiceProvider, VoiceProviderName } from './types';
import { ElevenLabsProvider } from './elevenlabs';
import { BrowserSpeechProvider } from './browser-speech';

const providerCache = new Map<VoiceProviderName, VoiceProvider>();

export function getVoiceProvider(providerName?: VoiceProviderName): VoiceProvider {
  // Determine which provider to use
  let name = providerName || (process.env.VOICE_PROVIDER as VoiceProviderName);

  // Auto-detect based on available API keys if not explicitly set
  if (!name) {
    if (process.env.ELEVENLABS_API_KEY) {
      name = 'elevenlabs';
    } else {
      name = 'browser-speech';
    }
  }

  // Return cached provider if available
  if (providerCache.has(name)) {
    return providerCache.get(name)!;
  }

  // Create new provider instance
  let provider: VoiceProvider;

  switch (name) {
    case 'elevenlabs':
      try {
        provider = new ElevenLabsProvider();
      } catch (error) {
        console.warn('Failed to initialize ElevenLabs provider, falling back to browser-speech:', error);
        provider = new BrowserSpeechProvider();
      }
      break;

    case 'browser-speech':
      provider = new BrowserSpeechProvider();
      break;

    case 'openai':
      throw new Error('openai TTS provider not yet implemented');

    case 'azure':
      throw new Error('azure TTS provider not yet implemented');

    default:
      throw new Error(
        `Unknown voice provider: ${name}. Available providers: elevenlabs, browser-speech, openai, azure`
      );
  }

  // Cache and return
  providerCache.set(name, provider);
  return provider;
}

// Export types for convenience
export type {
  VoiceProvider,
  SynthesisParams,
  SynthesisResult,
  Voice,
  VoiceProviderName,
} from './types';
