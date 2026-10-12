import { NextRequest, NextResponse } from 'next/server';
import { getSpeechProvider } from '@/lib/speech/providers';
import { logServerError } from '@/lib/server-log';
import { language as learning } from '@/content';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audio = formData.get('audio') as File;
    const language = formData.get('language') as string;

    if (!audio) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // The language being learned, or 'en' for "Come si dice?" button
    const lang = language === 'en' ? 'en' : learning.code;

    // Get configured speech provider and transcribe. No prompt: Whisper echoes
    // it into short or quiet recordings (tests/check-transcribe.ts)
    const provider = getSpeechProvider();
    const transcription = await provider.transcribe({
      audio,
      language: lang,
    });

    return NextResponse.json({
      text: transcription.text,
      language: transcription.language,
    });
  } catch (error) {
    logServerError(request, 'transcribe', error);
    return NextResponse.json(
      {
        error: 'Transcription failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
