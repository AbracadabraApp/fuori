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
