// The voice started early (lib/voice/early-voice.ts, 2026-10-22): the line is
// found in the streamed JSON as soon as its string closes, and only then; a
// voice is taken once, for exactly the same line. No API calls.
import { lineWhenWritten, partialLine, firstSentence, LineWatcher, startEarlyVoice, takeEarlyVoice } from '@/lib/voice/early-voice';
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

// The line as it's written: decoded so far, an escape cut at the end dropped
check('partial', partialLine('{"line": "Ciao, come st')?.text, 'Ciao, come st');
check('partial not closed', partialLine('{"line": "Ciao')?.closed, false);
check('cut escape', partialLine('{"line": "Perch\\u00')?.text, 'Perch');
check('cut backslash', partialLine('{"line": "Dice \\')?.text, 'Dice ');
check('closed', partialLine('{"line": "Ciao!", "en')?.closed, true);

// The first sentence: only once more follows it, never too short, a prefix of the line
check('no end yet', firstSentence('Buongiorno, signora'), undefined);
check('end but nothing after', firstSentence('Buongiorno, come sta? '), undefined);
check('first sentence', firstSentence('Buongiorno, come sta? Io b'), 'Buongiorno, come sta? ');
check('too short skipped', firstSentence('Ciao! Che bello vederti. Al'), 'Ciao! Che bello vederti. ');
check('closing quote kept', firstSentence('Lei dice «va bene.» Poi'), 'Lei dice «va bene.» ');
check('Spanish', firstSentence('¡Qué gusto verte otra vez! ¿Cómo'), '¡Qué gusto verte otra vez! ');
check('ellipsis', firstSentence('Eh, non lo so… Forse'), 'Eh, non lo so… ');

// The watcher on a reply arriving chunk by chunk
const reply = JSON.stringify({ line: 'Buongiorno, come sta oggi? Io benissimo, grazie.', en: 'Good morning, how are you today? Very well, thanks.' });
const seen: string[] = [];
const w = new LineWatcher({ split: true, onFirst: (f) => seen.push(`first:${f}`), onLine: (l, f) => seen.push(`line:${l}|${f ?? ''}`) });
for (let n = 1; n <= reply.length; n++) w.feed(reply.slice(0, n));
check('watcher: first then line, once each', seen.join(' / '), 'first:Buongiorno, come sta oggi?  / line:Buongiorno, come sta oggi? Io benissimo, grazie.|Buongiorno, come sta oggi? ');
const plain: string[] = [];
const w2 = new LineWatcher({ split: false, onFirst: () => plain.push('first'), onLine: (l, f) => plain.push(`line:${f === undefined}`) });
for (let n = 1; n <= reply.length; n++) w2.feed(reply.slice(0, n));
check('watcher without split: line only', plain.join(','), 'line:true');
const one: string[] = [];
const w3 = new LineWatcher({ split: true, onFirst: () => one.push('first'), onLine: (l, f) => one.push(`line:${f === undefined}`) });
const short = JSON.stringify({ line: 'Certo, subito.', en: 'Sure, right away.' });
for (let n = 1; n <= short.length; n++) w3.feed(short.slice(0, n));
check('one sentence: not split', one.join(','), 'line:true');

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
