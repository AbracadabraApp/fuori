// Flashcards (lib/flashcards.ts, docs/flashcards.md): ids match the picture
// files, the article joins as shown, pictured words come first
import { flashcardId, withArticle, flashcards, deckCards } from '@/lib/flashcards';
import { pack } from '@/content';

const failures: string[] = [];
const expect = (what: string, got: unknown, want: unknown) => { if (got !== want) failures.push(`${what}: expected ${want}, got ${got}`); };

expect('accent dropped', flashcardId('caffè'), 'caffe');
expect('accent dropped (es)', flashcardId('canción'), 'cancion');
expect('plain', flashcardId('banco'), 'banco');
expect("l' joins", withArticle("l'", 'albicocca'), "l'albicocca");
expect('il', withArticle('il', 'banco'), 'il banco');
expect('el/la shows la', withArticle('el/la', 'joven'), 'la joven');
expect('— shows none', withArticle('—', 'mijo'), 'mijo');

const pictured = new Set(['albicocca', 'pomodoro']);
const cards = flashcards((id) => (pictured.has(id.replace('flashcards/', '')) ? `https://r2/${id}.webp` : null));
expect('20 starter words', cards.length, 20);
if (pack.id === 'it') {
  expect('pictured first', cards.slice(0, 2).every((c) => c.picture), true);
  expect('none words have no picture', cards.find((c) => c.id === 'parola')?.picture, null);
}
expect('ids unique', new Set(cards.map((c) => c.id)).size, cards.length);

// The master deck: only uploaded words, each with its picture and recording
const up = (id: string) => (id === 'cards/caffe' || id === 'cards/caffe.mp3' ? `https://r2/${id}` : null);
const deck = deckCards(up);
if (pack.id === 'it') {
  expect('deck: only uploaded words', deck.length, 1);
  expect('deck: said with article', deck[0]?.said, 'il caffè');
  expect('deck: recording', deck[0]?.audio, 'https://r2/cards/caffe.mp3');
}
const real = deckCards(() => 'x');
expect('deck: 60 words', real.length, 60);
expect('deck: ids unique', new Set(real.map((c) => c.id)).size, real.length);

if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
console.log(`OK: flashcards (${pack.id}): ids, articles, ${cards.length} cards, pictured first`);
