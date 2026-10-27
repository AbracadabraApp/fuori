# Flashcards

2026-10-21 · Josh · A production candidate, not built. Word lists: `content/it/flashcards.json`, `content/es-mx/flashcards.json` (20 each, Josh's words: the word, article, English, which sense the card teaches, a picture idea). Mockups: the "Flashcards" canvas in the Claude app (sizes A–D, the four modes).

## The card

- One picture per word, with no writing in it, showing the sense the card teaches.
- **Wide and scrollable** (Josh, 2026-10-21): 2:1 cards in a scrolling list, about two on screen with the next peeking in (342 × 171 pt picture on a standard iPhone, the word below). Images generated 2:1 and saved 1600 × 800. Style not chosen yet (the icon's woodcut, the Italian places' pastel, or the Mexican places' photographic look). Picture ideas should lean to wide scenes, since a single object sits small in a wide frame.
- **No helper words** (Josh: "not sold on all the helper words"): a card shows only what its stage shows (picture, word, English, a mic icon). No "Tap to see the English", "What is this?", "Say it" or "You said it"; no counter like "3 of 20" in the list. Tapping reveals; the mic is an icon with a VoiceOver label. A card with no picture (a *none* word) keeps the card's size and centres the word in it, with the mic below (Josh).

## Words without a good picture (Josh, 2026-10-21)

Each card says what kind of image it gets: **object** (one simple thing on plain paper, centred with space around it, which reads fine in a wide card: *albicocca*, *zapato*), **scene** (a wide scene: *sera*, *puesto*) or **none** (no picture really works: *parola*, *cosa*, *ragione*, *verdad*). A card with no picture still goes through all four stages, with the English where the picture would be: a is the word, tap for the English; b the word and the mic; c the English, tap for the word; d the English and the mic. Italy: 10 object, 3 scene, 7 none; Mexico: 6, 5, 9.

## Article + noun (Josh, 2026-10-21)

Every noun is shown, spoken and asked for with its article: *il banco*, *l'albicocca*, *el agua*, *la tarde*. The article carries the gender, so it's learned with the word from the start, and two words give Whisper more to hear than one. Saying the noun without its article still counts at stage 1; at stage 3 the article is part of the answer. Lists keep `article` and `word` separate so the app can join them (*l'* with no space). Exceptions: *mijo* is a term of address, shown bare; *el/la joven* is shown as *la joven* to match its picture.

## Three stages, easiest first (Josh, 2026-10-27: a and b combined; was four, agreed 2026-10-21)

| Stage | The card shows | You | Can it be wrong? |
|---|---|---|---|
| 1 · Meet it (was a + b) | Picture + the word in the language | Tap: the English appears and the word is said. Then say it once yourself on the mic | No: judged leniently, a miss is a retry |
| 2 · Recall it (was c) | Picture + the English | Recall the word; tap to see it, played in a native voice | No (you answer in your head) |
| 3 · Say it (was d) | Picture only, with the mic | Say the word | **Yes**: the only real test. A miss keeps the card at 3 for another round |

Why (Claude, agreed by Josh): reading a word you can see aloud (the old b) was the weakest step; folded into the first meeting, you hear it said first, then say it once, so speaking starts on the first card and the deck has one judged mic stage.

The mic stages check what Whisper heard against the one word on the card (the app knows the answer, so no phrase lists): ignore the article and accents, accept close spellings. Whisper is weakest on a lone word; if that's a problem, ask for a short phrase (*al banco*).

## The deck

- **5 cards in play** (Josh: start with 5), taken from the country's 20 as a pool.
- **One card on screen at a time** (Josh, 2026-10-27: "i don't like the 5 at a time"): the five rotate behind the scenes; finishing a step on a card brings the next of the five in, so a round passes at one stage before a word comes back.
- Rounds go card by card at the same stage: every card at stage 1, then every card at stage 2, and so on, so four other cards come between a card's stages (spacing).
- A card that passes stage 3 leaves the deck and the next word from the pool joins at stage 1.
- **Passed words go on a list of "own" words** (Josh). Nothing more for now. Maybe later: stage 3 words come back on some rotation to check they stuck (not decided).

## Motion (agreed 2026-10-21)

- Revealing an answer: no flip. The card grows a little and the new line fades in; the picture never moves.
- Mic stages: the picture or word fades in after you say it.
- A new word joining the deck slides in from the bottom of the list; a card moving to its next stage changes in place.
- A card that passes stage 3 lifts away toward the own-words list: the one moment of celebration.
- Reduce Motion: every one of these is a cross-fade.

## Sound (proposed 2026-10-21)

- Every reveal plays the word once, in the language being learned: stage 1 when the English appears, before you say it (a word you've never heard), stage 2 when the word appears, stage 3 after you've said it (so you compare yourself with a native speaker).
- Tapping the word replays it. Nothing plays on scroll or when a card first comes into view.
- The voice: any native voice from the country's pool will do (Josh: don't overthink it). Italy can use Giulia's or Rosa's (the old Roma barista and landlady, no longer in play); Mexico one of its pool voices. The phone's voice as fallback; recordings cached with the card.
