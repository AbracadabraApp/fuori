// Every phone recording failed transcription: the browser uploaded it as "blob"
// with no extension, and Groq picks the format from the extension.
import { audioFileName, extensionFor } from '@/lib/speech/audio-file';

const cases: Array<[string, string, string | undefined, string]> = [
  ['iPhone upload named "blob"', 'audio/mp4', 'blob', 'speech.m4a'],
  ['iPhone type with codecs', 'audio/mp4;codecs=mp4a.40.2', 'blob', 'speech.m4a'],
  ['Chrome webm with codecs', 'audio/webm;codecs=opus', 'blob', 'speech.webm'],
  ['no name at all', 'audio/mp4', undefined, 'speech.m4a'],
  ['good name kept', 'audio/mp4', 'speech.m4a', 'speech.m4a'],
  ['unknown type falls back', 'application/octet-stream', 'blob', 'speech.webm'],
];

const failed = cases.filter(([, type, name, want]) => audioFileName(type, name) !== want);
if (extensionFor('AUDIO/MP4') !== 'm4a') failed.push(['case-insensitive', '', '', '']);
if (failed.length) {
  console.error('audioFileName wrong for: ' + failed.map((c) => c[0]).join(', '));
  process.exit(1);
}
console.log('OK: recordings get a file name Whisper accepts');
