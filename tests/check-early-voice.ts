// The voice started early (lib/voice/early-voice.ts, 2026-10-22): the line is
// found in the streamed JSON as soon as its string closes, and only then; a
// voice is taken once, for exactly the same line. No API calls.
import { lineWhenWritten, startEarlyVoice, takeEarlyVoice } from '@/lib/voice/early-voice';
import { getVoiceProvider } from '@/lib/voice/providers';

const problems: string[] = [];
const check = (what: string, got: unknown, want: unknown) => {
  if (got !== want) problems.push(`${what}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);
};

const full = '{"line": "Ciao! Dice \\"buongiorno\\" a tutti?", "en": "Hi! Says \\"good morning\\" to everyone?"}';
const line = 'Ciao! Dice "buongiorno" a tutti?';

// Every prefix before the line's closing quote: not yet; from there on: the whole line
const closes = full.indexOf('?",') + 2;
let early = -1;
for (let n = 0; n <= full.length; n++) {
  const got = lineWhenWritten(full.slice(0, n));
  if (got !== undefined && early < 0) early = n;
  if (got !== undefined && got !== line) problems.push(`prefix ${n}: wrong line ${JSON.stringify(got)}`);
}
check('found when the line closes, not before', early, closes);

// The English first (structured output keeps the schema's order, but don't depend on it)
check('en first', lineWhenWritten('{"en": "Hi", "line": "Ciao"'), 'Ciao');
// An escaped quote at the end of a prefix isn't the end of the line
check('escaped quote at the end', lineWhenWritten('{"line": "Dice \\"'), undefined);
// Unicode escapes and accents survive
check('accents', lineWhenWritten('{"line": "Perch\\u00e9 no? È così.",'), 'Perché no? È così.');
// An empty line isn't a line
check('empty', lineWhenWritten('{"line": "", "en": ""}'), undefined);

// Without a hosted voice configured, nothing is started and nothing can be taken
delete process.env.ELEVENLABS_API_KEY;
delete process.env.VOICE_PROVIDER;
let errored = false;
startEarlyVoice({ learnerId: 'l', characterId: 'c', text: 'Ciao', speed: 0.9, onError: () => (errored = true) });
check('no provider: nothing taken', takeEarlyVoice('l', 'c', 0.9, 'Ciao'), undefined);
check('no provider: no error', errored, false);

async function withProvider() {
  // A stand-in for ElevenLabs: counts calls, fails on request
  process.env.ELEVENLABS_API_KEY = 'test-not-a-key';
  const provider = getVoiceProvider();
  let calls = 0;
  provider.synthesize = async ({ text }) => {
    calls++;
    if (text === 'fails') throw new Error('voice down');
    return { audio: Buffer.from(text) };
  };
  startEarlyVoice({ learnerId: 'l', characterId: 'c', text: 'Ciao', speed: 0.9, onError: () => {} });
  check('other speed: not taken', takeEarlyVoice('l', 'c', 0.7, 'Ciao'), undefined);
  check('other learner: not taken', takeEarlyVoice('x', 'c', 0.9, 'Ciao'), undefined);
  check('other text: not taken', takeEarlyVoice('l', 'c', 0.9, 'Ciao!'), undefined);
  const got = await takeEarlyVoice('l', 'c', 0.9, 'Ciao');
  check('same line: taken', got?.audio?.toString(), 'Ciao');
  check('taken once', takeEarlyVoice('l', 'c', 0.9, 'Ciao'), undefined);
  check('one call to the voice service', calls, 1);

  let reported: unknown;
  startEarlyVoice({ learnerId: 'l', characterId: 'c', text: 'fails', speed: 0.9, onError: (e) => (reported = e) });
  const failed = await takeEarlyVoice('l', 'c', 0.9, 'fails');
  check('a failed early voice is null, so /v1/speak makes its own', failed, null);
  check('and the failure is reported', String(reported), 'Error: voice down');
}

withProvider()
  .catch((e) => problems.push(String(e)))
  .finally(() => {
    if (problems.length) {
      console.error(problems.join('\n'));
      process.exit(1);
    }
    console.log('OK: the line is caught as soon as it is written; early voices are taken only for the same line');
  });
