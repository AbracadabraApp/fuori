// Whisper must get no prompt. With one ("Trascrizione in italiano di una
// conversazione naturale."), Whisper echoed it into short or quiet recordings,
// and characters answered "Trascrizione in italiano…" as if the learner had
// said it (found in recorded transcripts, 2026-10-12).
import { WhisperGroqProvider } from '@/lib/speech/providers/whisper-groq';
import { NextRequest } from 'next/server';

async function main() {
  const problems: string[] = [];

  // Call the real route with a fake Whisper and look at what it was sent
  process.env.GROQ_API_KEY ||= 'test-key';
  const params: Record<string, unknown>[] = [];
  WhisperGroqProvider.prototype.transcribe = async function (p) {
    params.push(p as unknown as Record<string, unknown>);
    return { text: 'ciao', language: p.language };
  };
  const { POST } = await import('@/app/api/transcribe/route');
  const form = new FormData();
  form.append('audio', new File([new Uint8Array(10)], 'blob', { type: 'audio/mp4' }));
  const r = await POST(new NextRequest('http://localhost/api/transcribe', { method: 'POST', body: form }));
  if (r.status !== 200) problems.push(`route answered ${r.status}`);
  if (!params[0]) problems.push('route did not call Whisper');
  else if (params[0].prompt) problems.push(`route sent Whisper a prompt: ${JSON.stringify(params[0].prompt)}`);
  if (problems.length) {
    console.error(problems.join('\n'));
    process.exit(1);
  }
  console.log('OK: /api/transcribe sends Whisper no prompt (a prompt gets echoed into transcripts)');
}
main();
