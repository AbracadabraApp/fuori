import Groq from 'groq-sdk';
import { NextRequest, NextResponse } from 'next/server';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

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

    // Transcribe with Whisper on Groq
    const transcription = await groq.audio.transcriptions.create({
      file: audio,
      model: 'whisper-large-v3-turbo',
      language: lang,
      response_format: 'json',
      ...(lang === 'it' && {
        prompt: 'Trascrizione in italiano di una conversazione naturale.',
      }),
    });

    return NextResponse.json({
      text: transcription.text,
      language: lang,
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
