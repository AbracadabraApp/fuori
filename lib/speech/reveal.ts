/**
 * Typewriter subtitles: the reply's text appears as it's spoken, so you listen
 * instead of reading ahead (Josh, 2026-10-11: with the whole reply on screen
 * he read ahead rather than listened).
 *
 * Pacing follows overall progress through the audio, not each word's real
 * timing, so the text can run a word or two ahead or behind in pauses. Exact
 * per-word timing (ElevenLabs with-timestamps) is the upgrade if that bothers.
 */

/** How many characters to show at this point in the audio (0–1). Never splits a word. */
export function revealCount(text: string, fraction: number): number {
  if (!(fraction > 0)) return 0;
  if (fraction >= 1) return text.length;
  let n = Math.floor(text.length * fraction);
  // Finish the word being typed rather than show half of it
  while (n < text.length && !/\s/.test(text[n])) n++;
  return n;
}

/**
 * Rough length of the phone's own voice reading this text, for pacing when
 * there's no audio file to measure. About 14 characters a second at rate 1.
 */
export function estimateSeconds(text: string, rate: number): number {
  return text.length / (14 * (rate > 0 ? rate : 1));
}
