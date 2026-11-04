// A recording's second hearing (lib/speech/hear-recording.ts): when Whisper
// calls a turn English or another language, the server asks again in the
// learned language. If that second call fails (Groq's free tier: 20 a minute
// for the whole account, E-7WCH, 2026-11-03), the first hearing stands and
// the learner keeps their turn. A stand-in for Whisper, no network.
//   tsx tests/check-hear-recording.mts
import { language } from '@/content';
import { hearRecording } from '@/lib/speech/hear-recording';
import type { SpeechProvider } from '@/lib/speech/providers/types';

const problems: string[] = [];
const check = (ok: boolean, msg: string) => { if (!ok) problems.push(msg); };
const audio = new File([new Uint8Array(8)], 'speech.m4a', { type: 'audio/mp4' });

/** First call: what Whisper detects; any call after it: rate-limited */
const limited = (first: { text: string; language: string }): SpeechProvider => {
  let calls = 0;
  return { name: 'stand-in', transcribe: async () => { if (calls++ === 0) return first; throw new Error('429 Rate limit reached'); } };
};

const english = await hearRecording({ audio, mode: 'turn', speech: limited({ text: 'How do you say that?', language: 'english' }) });
check(english.text === 'How do you say that?' && english.language === 'en' && english.learned === undefined, `heard as English, second call failed: the English stands (${JSON.stringify(english)})`);

const other = await hearRecording({ audio, mode: 'turn', speech: limited({ text: 'Grazie mille', language: 'portuguese' }) });
check(other.text === 'Grazie mille' && other.language === language.code, `heard as another language, second call failed: the first hearing stands in the learned language (${JSON.stringify(other)})`);

// And when the second call works, it's used as before
let n = 0;
const fine: SpeechProvider = { name: 'stand-in', transcribe: async (p) => (n++ === 0 ? { text: 'I would like a coffee', language: 'english' } : { text: 'Vorrei un caffè', language: p.language ?? '' }) };
const translated = await hearRecording({ audio, mode: 'turn', speech: fine });
check(translated.learned === 'Vorrei un caffè', `second hearing kept when it works (${JSON.stringify(translated)})`);

if (problems.length) {
  console.error(`FAILED\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log('OK: a failed second hearing keeps the first; a working one is used');
