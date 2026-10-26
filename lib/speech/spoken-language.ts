// Which language a turn was spoken in (app/v1/transcribe, mode "turn")
/**
 * Which language Whisper named: English, the learned language, or another.
 * Whisper names languages in English ("english", "italian") or by code.
 */
export function spokenLanguage(named: string | undefined, learnedCode: string): 'en' | 'learned' | 'other' {
  const n = (named ?? '').trim().toLowerCase();
  if (n === 'en' || n === 'english') return 'en';
  const learnedName = new Intl.DisplayNames(['en'], { type: 'language' }).of(learnedCode)?.toLowerCase();
  if (n === learnedCode.toLowerCase() || (learnedName && n === learnedName)) return 'learned';
  return 'other';
}

/**
 * The same words, ignoring case, accents and punctuation. When Whisper calls
 * a turn English but hears the same words as the learned language ("Quiero
 * cinco girasoles, por favor." both ways, Josh, 2026-10-26), it was the
 * learned language, and say it needn't be asked (it cost 1–1.8 s a turn).
 */
export function sameWords(a: string, b: string): boolean {
  const norm = (t: string) => t.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  return norm(a) !== '' && norm(a) === norm(b);
}
