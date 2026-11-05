/**
 * What the learner said, read against what they were offered (docs/dialogue-model.md
 * → Four fixes, 1; Josh, 2026-11-05). The character only ever saw the words
 * speech-to-text heard, so a garbled say-back ("¿Owen me ayuda?" for "Joven,
 * ¿me ayuda?") read as a mistake and got coached. Now the app works it out and
 * tells her as a fact. Any language, no phrase list: words and letters only.
 */
import { isSaidBack } from '@/lib/conversation-record';

export type Heard = 'said-back' | 'other';

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/[^\p{L}\p{N}\s…]/gu, ' ').replace(/\s+/g, ' ').trim();

function letterDistance(a: string, b: string): number {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = row;
  }
  return prev[b.length];
}

/** Close enough letter by letter: speech-to-text bends a word or two ("owen" for "joven"), the sentence stays */
export const CLOSE = 0.3;

function closeTo(said: string, answer: string): boolean {
  const parts = norm(answer).split('…').map((p) => p.trim()).filter(Boolean);
  const heard = norm(said);
  if (!parts.length || !heard) return false;
  // A frame ("Sono di …"): each fixed part close to the same stretch of what was heard, whatever filled the blank
  if (parts.length > 1 || answer.includes('…')) {
    return parts.every((p) => {
      const words = p.split(' ').length;
      const hw = heard.split(' ');
      for (let i = 0; i + words <= hw.length; i++) if (letterDistance(hw.slice(i, i + words).join(' '), p) / p.length <= CLOSE) return true;
      return false;
    });
  }
  return letterDistance(heard, parts[0]) / Math.max(heard.length, parts[0].length) <= CLOSE;
}

/** Said one of the offered answers back (close counts), or something else; null when nothing was offered */
export function readHeard(said: string, offered: string[]): Heard | null {
  if (!offered.length || !said.trim()) return null;
  return isSaidBack(said, offered) || offered.some((a) => closeTo(said, a)) ? 'said-back' : 'other';
}
