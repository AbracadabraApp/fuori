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

type DeckCard = { word: string; article: string; en: string };

/**
 * The master deck (content/<country>/flashcard-deck.json, docs/flashcards.md
 * → The look): every word with its tall 2:3 picture and its recording, built
 * once by scripts/build-flashcard-deck.mjs and uploaded as cards/<id> and
 * cards/<id>.mp3. Only words whose picture is uploaded, in the deck's order.
 * Served as `cards` next to the old starter `flashcards`, which app builds
 * from before 2026-10-28 still read (their 2:1 frame would crop these).
 */
export function deckCards(image: (id: string) => string | null): { id: string; said: string; en: string; picture: string; audio: string | null }[] {
  const path = join(process.cwd(), 'content', pack.id, 'flashcard-deck.json');
  let list: { cards: DeckCard[] };
  try {
    list = JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return [];
  }
  return list.cards.flatMap((c) => {
    const id = flashcardId(c.word);
    const picture = image(`cards/${id}`);
    return picture ? [{ id, said: withArticle(c.article, c.word), en: c.en, picture, audio: image(`cards/${id}.mp3`) }] : [];
  });
}
