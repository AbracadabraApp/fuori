# Flashcards

2026-10-21 · Josh · A production candidate, not built. Word lists: `content/it/flashcards.json`, `content/es-mx/flashcards.json` (20 each, Josh's words: the word, article, English, which sense the card teaches, a picture idea). Mockups: the "Flashcards" canvas in the Claude app (sizes A–D, the four modes).

## The card

- One picture per word, with no writing in it, showing the sense the card teaches.
- Size still open: a square centred on the screen (A: screen width minus 24 pt each side, 342 pt on a standard iPhone), or 2:1 cards in a scrolling list (D: 342 × 171 pt). Square images are generated 1:1 at 2k and saved 1200 × 1200 (like the Mexican place pictures); wide ones would be 2:1, 1600 × 800. Style not chosen yet (the icon's woodcut, the Italian places' pastel, or the Mexican places' photographic look).

## Four stages, easiest first (Josh; order agreed 2026-10-21)

| Stage | The card shows | You | Can it be wrong? |
|---|---|---|---|
| a | Picture + the word in the language | Tap to see the English | No: exposure |
| b | The word only, with the mic | Say it aloud; then the picture and English | Judged leniently; a miss is a retry, not wrong |
| c | Picture + the English | Recall the word; tap to see it, played in a native voice | No (you answer in your head) |
| d | Picture only, with the mic | Say the word | **Yes**: the only real test. A miss keeps the card at d for another round |

The mic stages check what Whisper heard against the one word on the card (the app knows the answer, so no phrase lists): ignore the article and accents, accept close spellings. Whisper is weakest on a lone word; if that's a problem, ask for a short phrase (*al banco*).

## The deck

- **5 cards in play** (Josh: start with 5), taken from the country's 20 as a pool.
- Rounds go card by card at the same stage: 1a 2a 3a 4a 5a, then 1b … 5b, and so on, so four other cards come between a card's stages (spacing).
- A card that passes stage d leaves the deck and the next word from the pool joins at stage a.
- **Passed words go on a list of "own" words** (Josh). Nothing more for now. Maybe later: stage d words come back on some rotation to check they stuck (not decided).
