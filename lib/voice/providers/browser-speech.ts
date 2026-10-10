/**
 * Browser Web Speech API provider
 *
 * This is a fallback provider that doesn't synthesize on the server.
 * Instead, it returns instructions for the frontend to use the browser's
 * built-in speechSynthesis API.
 *
 * Good for:
 * - Development/testing without API keys
 * - M1-M2 fallback before hosted TTS
 * - Devices with high-quality local voices (iOS Italian voices are quite good)
 */

import { VoiceProvider, SynthesisParams, SynthesisResult, Voice } from './types';

export class BrowserSpeechProvider implements VoiceProvider {
  name = 'browser-speech';

  async synthesize(params: SynthesisParams): Promise<SynthesisResult> {
    // This provider doesn't synthesize server-side
    // It signals to the client to use browser TTS
    return {
      useBrowserSpeech: true,
    };
  }

  async listVoices(_language: string): Promise<Voice[]> {
    // Can't list browser voices from server-side
    // The client will need to call window.speechSynthesis.getVoices()
    return [];
  }
}
