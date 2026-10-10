/**
 * /api/speak endpoint
 *
 * Synthesizes text to speech using the configured TTS provider.
 *
 * POST body:
 * {
 *   text: string;
 *   language?: string; // defaults to 'it'
 *   characterId?: string; // for voice mapping
 *   voice?: string; // explicit voice ID override
 *   speed?: number; // 0.5 to 2.0
 * }
 *
 * Response:
 * - If server-side TTS (ElevenLabs, OpenAI): audio/mpeg stream
 * - If browser-speech fallback: JSON { useBrowserSpeech: true }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getVoiceProvider } from '@/lib/voice/providers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, language = 'it', characterId, voice, speed = 1.0 } = body;

    // Validate input
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'text is required and must be a string' }, { status: 400 });
    }

    if (speed && (speed < 0.5 || speed > 2.0)) {
      return NextResponse.json({ error: 'speed must be between 0.5 and 2.0' }, { status: 400 });
    }

    // Get the configured provider
    const provider = getVoiceProvider();

    // Synthesize
    const result = await provider.synthesize({
      text,
      language,
      characterId,
      voice,
      speed,
    });

    // If browser speech is requested, return JSON
    if (result.useBrowserSpeech) {
      return NextResponse.json({
        useBrowserSpeech: true,
        text,
        language,
        speed,
      });
    }

    // If we have audio data, stream it
    if (result.audio) {
      // Convert Buffer to Uint8Array for NextResponse
      const audioData = new Uint8Array(result.audio);

      return new NextResponse(audioData, {
        status: 200,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': result.audio.length.toString(),
          'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
          ...(result.duration && { 'X-Audio-Duration': result.duration.toString() }),
        },
      });
    }

    // If we have a URL, redirect
    if (result.audioUrl) {
      return NextResponse.redirect(result.audioUrl);
    }

    // Should not reach here
    return NextResponse.json({ error: 'Provider returned no audio' }, { status: 500 });
  } catch (error) {
    console.error('Error in /api/speak:', error);

    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to synthesize speech', details: message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/speak/voices?language=it
 *
 * Lists available voices for the configured provider
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language') || 'it';

    const provider = getVoiceProvider();

    // Check if provider supports listing voices
    if (!provider.listVoices) {
      return NextResponse.json(
        { error: 'Current provider does not support listing voices' },
        { status: 501 }
      );
    }

    const voices = await provider.listVoices(language);

    return NextResponse.json({
      provider: provider.name,
      language,
      voices,
    });
  } catch (error) {
    console.error('Error listing voices:', error);

    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to list voices', details: message },
      { status: 500 }
    );
  }
}
