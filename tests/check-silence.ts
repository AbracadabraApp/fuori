// Leaving a conversation must silence everything: the character's voice (hosted
// audio and the phone's voice) and the microphone. Bug 2026-10-11: characters
// kept talking after going back to the places list or switching apps.
import { silenceAll } from '@/lib/speech/silence';

const problems: string[] = [];
const calls: string[] = [];

const parts = {
  audio: { pause: () => calls.push('audio paused') },
  synth: { cancel: () => calls.push('phone voice cancelled') },
  recorder: { state: 'recording', stop: () => calls.push('recorder stopped') },
  stream: { getTracks: () => [{ stop: () => calls.push('mic track stopped') }] },
  meter: { stop: () => calls.push('meter stopped') },
};

silenceAll(parts);
for (const want of ['audio paused', 'phone voice cancelled', 'recorder stopped', 'mic track stopped', 'meter stopped']) {
  if (!calls.includes(want)) problems.push(`not done: ${want}`);
}

// One part throwing must not leave the others running
calls.length = 0;
silenceAll({ ...parts, audio: { pause: () => { throw new Error('boom'); } } });
if (!calls.includes('phone voice cancelled') || !calls.includes('mic track stopped')) {
  problems.push('a failing audio.pause() stopped the rest');
}

// An idle recorder isn't stopped again (MediaRecorder throws on that)
calls.length = 0;
silenceAll({ recorder: { state: 'inactive', stop: () => calls.push('recorder stopped') } });
if (calls.includes('recorder stopped')) problems.push('stopped an inactive recorder');

// Nothing set up yet (left before starting) is fine
silenceAll({});

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log('OK: leaving a conversation stops the voice, the phone voice and the microphone');
