import { NextRequest, NextResponse } from 'next/server';
import { getSpeechProvider } from '@/lib/speech/providers';

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

    // Determine language - 'it' for Italian turns, 'en' for "Come si dice?" button
    const lang = language === 'en' ? 'en' : 'it';

    // Get configured speech provider and transcribe
    const provider = getSpeechProvider();
    const transcription = await provider.transcribe({
      audio,
      language: lang,
      prompt: lang === 'it' ? 'Trascrizione in italiano di una conversazione naturale.' : undefined,
    });

    return NextResponse.json({
      text: transcription.text,
      language: transcription.language,
    });
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      {
        error: 'Transcription failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
