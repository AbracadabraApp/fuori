// Every character gets a voice that matches their gender, anchors keep their
// fixed voice, and characters in the same city don't all share one voice.
import { cities, voices, elevenLabsVoiceFor, browserVoiceFor } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';
import { elevenLabsError } from '@/lib/voice/providers/elevenlabs';
import { voiceNote, FuoriError } from '@/lib/errors';

const problems: string[] = [];
let checked = 0;

if (elevenLabsVoiceFor('giulia', 'f') !== voices.elevenlabs.byCharacter.giulia) problems.push('Giulia lost her fixed voice');
if (elevenLabsVoiceFor('rita', 'f') !== voices.elevenlabs.byCharacter.rita) problems.push('Rita lost her fixed voice');

for (const city of cities) {
  const used = new Set<string>();
  for (const place of city.places) {
    const c = characterForPlace(city, place);
    if (!c) continue;
    checked++;
    if (!c.gender) { problems.push(`${c.name} (${city.name}) has no gender`); continue; }
    const v = elevenLabsVoiceFor(c.id, c.gender);
    if (!v) { problems.push(`${c.name} (${city.name}) has no voice`); continue; }
    used.add(v);
    const fixed = voices.elevenlabs.byCharacter[c.id];
    if (!fixed && !voices.elevenlabs[c.gender].includes(v)) problems.push(`${c.name} (${city.name}) got a ${c.gender === 'f' ? 'male' : 'female'} voice`);
  }
  if (checked > 5 && used.size < 2) problems.push(`${city.name}: every character has the same voice`);
}

// Phone fallback: a stock iPhone has only Alice. A man must still be heard,
// but the app must know the gender is wrong (Salvatore became a woman silently).
const fake = (name: string) => ({ name, lang: 'it-IT' }) as SpeechSynthesisVoice;
const stock = browserVoiceFor([fake('Alice')], 'it-IT', 'salvatore', 'm');
if (stock.voice?.name !== 'Alice' || stock.matchesGender) problems.push('Stock iPhone: male character should get Alice with matchesGender false');
const withLuca = browserVoiceFor([fake('Alice'), fake('Luca')], 'it-IT', 'salvatore', 'm');
if (withLuca.voice?.name !== 'Luca' || !withLuca.matchesGender) problems.push('With Luca installed, a male character should get Luca');
if (!voiceNote(null, false, 'm')?.includes('male')) problems.push('No note when a man gets a female phone voice');
if (voiceNote(null, true, 'm') !== null) problems.push('Note shown when nothing went wrong');

// ElevenLabs reports a used-up quota as 401, which must not read as a bad key
const quota = elevenLabsError(401, '{"detail":{"status":"quota_exceeded","message":"This request exceeds your quota."}}');
if (quota.reason !== 'quota') problems.push(`Quota 401 classified as ${quota.reason}`);
if (elevenLabsError(401, '{"detail":{"status":"invalid_api_key"}}').reason !== 'auth') problems.push('Bad key not classified as auth');
if (elevenLabsError(429, 'too many requests').reason !== 'rate-limit') problems.push('429 not classified as rate-limit');
const quotaNote = voiceNote(new FuoriError('402: ElevenLabs character quota used up (401)', 'E-TEST', 'server', 'voice', 402), true, 'f');
if (!quotaNote?.includes('quota') || !quotaNote.includes('E-TEST')) problems.push('Quota failure note should say quota and show the code');

if (problems.length) {
  console.error(problems.slice(0, 15).join('\n'));
  process.exit(1);
}
console.log(`OK: ${checked} characters each have a voice matching their gender`);
