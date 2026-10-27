/**
 * Flashcards (docs/flashcards.md): the country's starter words
 * (content/<country>/flashcards.json), each with an id, the word as it's
 * shown and said (with its article: "il banco", "l'albicocca"), the English,
 * and its picture when one has been uploaded (images.json → flashcards/<id>).
 * Words whose picture kind is none get no picture; object and scene words
 * show the word alone until theirs is made.
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { pack } from '@/content';

type Card = { word: string; article: string; en: string; image: 'object' | 'scene' | 'none' };

/** The word without accents or spaces, as the picture's file name: caffè → caffe */
export function flashcardId(word: string): string {
  return word.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/** The word with its article: "l'" joins with no space, "el/la" shows as "la" (its picture), "—" means none */
export function withArticle(article: string, word: string): string {
  const a = article.trim();
  if (!a || a === '—') return word;
  if (a.endsWith("'")) return a + word;
  return `${a.includes('/') ? a.split('/').pop() : a} ${word}`;
}

export function flashcards(image: (id: string) => string | null): { id: string; said: string; en: string; picture: string | null }[] {
  const list = JSON.parse(readFileSync(join(process.cwd(), 'content', pack.id, 'flashcards.json'), 'utf8')) as { cards: Card[] };
  const cards = list.cards.map((c) => {
    const id = flashcardId(c.word);
    return { id, said: withArticle(c.article, c.word), en: c.en, picture: c.image === 'none' ? null : image(`flashcards/${id}`) };
  });
  // Words with a picture first, so a first deck has pictures; then the list's order
  return [...cards.filter((c) => c.picture), ...cards.filter((c) => !c.picture)];
}
