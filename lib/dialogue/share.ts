/**
 * The language's share of a character's line, counted roughly: the words of the line that aren't in its English.
 * Automatic and the same every time, in any language, with no word lists; not exact (a name, or a word the two
 * languages share, counts as English). For the app's debug panel and scripts/walk-live.mjs (Josh, 2026-11-15:
 * "I'm more thinkiing of it as an automated test than an accurate one").
 */
const words = (s: string): string[] => s.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').match(/[\p{L}']+/gu) ?? [];

/** { inLanguage, all } word counts for one line and its English */
export function languageWords(line: string, en: string): { inLanguage: number; all: number } {
  const english = new Set(words(en));
  const ws = words(line);
  return { inLanguage: ws.filter((w) => !english.has(w)).length, all: ws.length };
}

/** The share over one or more lines, 0 to 100; null when there are no words */
export function languageShare(lines: { line: string; en: string }[]): number | null {
  let inLanguage = 0;
  let all = 0;
  for (const l of lines) {
    const c = languageWords(l.line, l.en);
    inLanguage += c.inLanguage;
    all += c.all;
  }
  return all ? Math.round((100 * inLanguage) / all) : null;
}
