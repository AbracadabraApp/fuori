// Typewriter subtitles: text appears as the reply is spoken, whole words only,
// all of it at the end. (Josh, 2026-10-11: with the whole reply on screen he
// read ahead instead of listening.)
import { revealCount, estimateSeconds } from '@/lib/speech/reveal';

const text = 'Perfetto, allora una sfogliatella e un caffè senza zucchero.';
const problems: string[] = [];

if (revealCount(text, 0) !== 0) problems.push('shows text before speech starts');
if (revealCount(text, -1) !== 0 || revealCount(text, NaN) !== 0) problems.push('bad progress should show nothing');
if (revealCount(text, 1) !== text.length) problems.push('not all text shown at the end');
let prev = 0;
for (let f = 0; f <= 1.0001; f += 0.01) {
  const n = revealCount(text, f);
  if (n < prev) problems.push(`went backwards at ${f.toFixed(2)}`);
  if (n > 0 && n < text.length && !/\s/.test(text[n])) problems.push(`split a word at ${f.toFixed(2)}: "${text.slice(0, n)}"`);
  prev = n;
}
const half = revealCount(text, 0.5);
if (half < text.length * 0.4 || half > text.length * 0.7) problems.push(`halfway shows ${half}/${text.length} characters`);
if (!(estimateSeconds(text, 0.9) > estimateSeconds(text, 1.2))) problems.push('slower speech should take longer');
if (!isFinite(estimateSeconds(text, 0))) problems.push('rate 0 gives no estimate');

if (problems.length) {
  console.error([...new Set(problems)].slice(0, 10).join('\n'));
  process.exit(1);
}
console.log('OK: subtitles type out in whole words and finish complete');
