# Flashcards

2026-10-21 · Josh · A production candidate, not built. Word lists: `content/it/flashcards.json`, `content/es-mx/flashcards.json` (20 each, Josh's words: the word, article, English, which sense the card teaches, a picture idea). Mockups: the "Flashcards" canvas in the Claude app (sizes A–D, the four modes).

## The card

- One picture per word, with no writing in it, showing the sense the card teaches.
- **Wide and scrollable** (Josh, 2026-10-21): 2:1 cards in a scrolling list, about two on screen with the next peeking in (342 × 171 pt picture on a standard iPhone, the word below). Images generated 2:1 and saved 1600 × 800. Style not chosen yet (the icon's woodcut, the Italian places' pastel, or the Mexican places' photographic look). Picture ideas should lean to wide scenes, since a single object sits small in a wide frame.
- **No helper words** (Josh: "not sold on all the helper words"): a card shows only what its stage shows (picture, word, English, a mic icon). No "Tap to see the English", "What is this?", "Say it" or "You said it"; no counter like "3 of 20" in the list. Tapping reveals; the mic is an icon with a VoiceOver label. A card with no picture (stage b) keeps the card's size and centres the word in it, with the mic below (Josh).

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

## Motion (agreed 2026-10-21)

- Revealing an answer: no flip. The card grows a little and the new line fades in; the picture never moves.
- Mic stages: the picture or word fades in after you say it.
- A new word joining the deck slides in from the bottom of the list; a card moving to its next stage changes in place.
- A card that passes stage d lifts away toward the own-words list: the one moment of celebration.
- Reduce Motion: every one of these is a cross-fade.

## Sound (proposed 2026-10-21)

- Every reveal plays the word once, in the language being learned: stage a when the English appears, b and d after you've said it (so you compare yourself with a native speaker, not copy one first), c when the word appears.
- Tapping the word replays it. Nothing plays on scroll or when a card first comes into view.
- The voice: any native voice from the country's pool will do (Josh: don't overthink it). Italy can use Giulia's or Rosa's (the old Roma barista and landlady, no longer in play); Mexico one of its pool voices. The phone's voice as fallback; recordings cached with the card.
