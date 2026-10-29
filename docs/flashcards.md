# Flashcards

2026-10-21 · Josh · A production candidate, not built. Word lists: `content/it/flashcards.json`, `content/es-mx/flashcards.json` (20 each, Josh's words: the word, article, English, which sense the card teaches, a picture idea). Mockups: the "Flashcards" canvas in the Claude app (sizes A–D, the four modes).

## The card

- One picture per word, with no writing in it, showing the sense the card teaches.
- ~~Wide and scrollable, 2:1~~ (2026-10-21; replaced 2026-10-28).
- **The look (Josh, 2026-10-28, after a review of ten styles in the "Flashcard Art Review" artifact):** traditional printed cards, tall (2:3), one bold central figure with thick outlines and flat saturated colour on cream, a thin border and an **empty banner along the bottom**; no number, no lettering in the picture.
  - **Mexico: lotería cards** ("best vertical").
  - **Italy: carte napoletane and tarocchi, mixed fairly randomly** so the feed varies. The style is picked per word at build time (from the card's id, so every learner sees the same card).
  - Tried and dropped: Italy's first pastel sketch (too faint on the phone), pencil and watercolour on cream (good, but plainer), cinema poster ("not unique at all"), figurina Liebig and ex-voto (passed on), majolica (liked, not picked); Mexico's flat gouache (already the current look), painterly objects on brushed or light grounds (good, but the lotería won).
  - Prompts say the object is "as you'd find it in everyday life in <country>", with "no flags, souvenirs or postcard clichés" (Josh: say in Italy or in Mexico); the country comes from the content files.
- **The banner is drawn by the app, not the picture** (Claude, 2026-10-28): generated banners vary in size and place, so the app draws the banner in the same place on every card, cream with a thin black border, and grows it taller for long English or large text (only the middle stretches). Its outline varies from card to card, in both countries (Josh, 2026-10-28: "i like the variation", over four test cards): a scrolled cartouche with curled ends, a plaque with notched corners, a plain rounded strip, and a strip whose top edge arches up in the middle. One outline per card, picked from the card's id like the style, so every learner sees the same card. It writes in it: the word at stage 1, the English at stage 2, nothing at stage 3 until it's said. The mic sits in the banner. Built 2026-10-28 (`CardBanner.swift`): the banner covers the bottom quarter of the card.
- **No helper words** (Josh: "not sold on all the helper words"): a card shows only what its stage shows (picture, word, English, a mic icon). No "Tap to see the English", "What is this?", "Say it" or "You said it"; no counter like "3 of 20" in the list. Tapping reveals; the mic is an icon with a VoiceOver label. A card with no picture (a *none* word) keeps the card's size and centres the word in it, with the mic below (Josh).

## Words without a good picture (Josh, 2026-10-21)

Each card says what kind of image it gets: **object** (one simple thing on plain paper, centred with space around it, which reads fine in a wide card: *albicocca*, *zapato*), **scene** (a wide scene: *sera*, *puesto*) or **none** (no picture really works: *parola*, *cosa*, *ragione*, *verdad*). A card with no picture still goes through all four stages, with the English where the picture would be: a is the word, tap for the English; b the word and the mic; c the English, tap for the word; d the English and the mic. Italy: 10 object, 3 scene, 7 none; Mexico: 6, 5, 9.

## Article + noun (Josh, 2026-10-21)

Every noun is shown, spoken and asked for with its article: *il banco*, *l'albicocca*, *el agua*, *la tarde*. The article carries the gender, so it's learned with the word from the start, and two words give Whisper more to hear than one. Saying the noun without its article still counts at stage 1; at stage 3 the article is part of the answer. Lists keep `article` and `word` separate so the app can join them (*l'* with no space). Exceptions: *mijo* is a term of address, shown bare; *el/la joven* is shown as *la joven* to match its picture.

## Three stages, each passed only by saying the word (Josh, 2026-10-28; three stages since 2026-10-27, four before)

| Stage | The card shows | You | Moves on when |
|---|---|---|---|
| 1 · Meet it | Picture, the word and the English together, and the mic (Josh, 2026-10-29: no separate reveal) | The word is said, then the mic opens | You say the word (article not needed). A miss: the word again, the mic again |
| 2 · Recall it | Picture + the English, and the mic | Say the word. Tapping the card shows it and plays it, and counts as a miss | You say the word (article not needed) |
| 3 · Say it | Picture only, and the mic | Say the word with its article | You say it right: the word is yours. A miss shows and plays the answer |

Why (Josh, 2026-10-28): "if it's there it should be required". Until then stage 2 moved on with a tap and checked nothing, so after saying a word once a card reached the test, and stage 3 cards looked greyed out (iOS dims a disabled button); now no card is dimmed: taps where there's nothing to do are simply ignored.

**The banner and help (Josh, 2026-10-29, the "Flashcard Stages" mockup, https://claude.ai/artifact/FUNHhqHNmt5pAzSCfb3hkW → row B). Not built yet:**

| Stage | Left of the banner | Right |
|---|---|---|
| 1 · Meet it | the word, large (*il caffè*); the English small under it | the mic, *Ripeti* under it |
| 2 · Recall it | *Come si dice?* small; the English large (*coffee*), its bracket small on its own line (*(an espresso)*) | the mic |
| 3 · Say it | *Come si dice?* large | the mic |

- The instructions are shown, not spoken, and come from /v1/content (Mexico *Repite*, *¿Cómo se dice?*). The only voice is the word.
- English cues stay bare (*coffee*, not *a coffee*: the card's article marks gender, and *a* would invite *un caffè*); the bracket says what you're served. Not *espresso*: that's an Italian word too.
- **Two outcomes, as the learner sees it:** I said it, or I need help. A word not heard (wrong word or misheard) gets help, never "wrong". Said with no help: the card moves on. After help: it stays at its stage and comes back a few cards later.
- **Help, no button:** about 4 s of quiet, or a tap on the card, brings the hint (article and first letters, *il ca___*); again, and the word plays; then you say it. Stage 1's help is the word again. VoiceOver's hint on the card: "Double-tap for a hint". A small link can come later if waiting for help annoys (Josh: ok, 2026-10-29).
- Measure: how often help was needed, per word and stage; keep what Whisper heard on helped attempts to spot words it keeps mishearing.

**Hands-free (Josh, 2026-10-29; no auto-advance):** when a card stays still in the middle of the screen for half a second it starts by itself (stage 1 plays the word, then listens; stages 2 and 3 listen); scrolling closes the mic without checking. Once per arrival: a card that closed its mic isn't reopened until you scroll away and back. With VoiceOver on, or after a call, Siri or headphones coming out, it waits for a tap, as in conversations. A tap at stage 2 while it listens still shows the word (a miss).

**The mic:** opens by itself (hands-free) or with a tap; a short silence after the word (1.2 s) checks it, as in the game; a second tap checks at once; nothing said in 8 s closes it (longer than a conversation's 5 s: recalling a word takes thought), and whatever it hears it never stays open more than 8 s (a noisy room once kept it listening). It checks what Whisper heard against the one word on the card (the app knows the answer, so no phrase lists): accents ignored, close spellings accepted. Whisper is weakest on a lone word; if that's a problem, ask for a short phrase (*al banco*).

## The feed (Josh, 2026-10-28: "think of it like an instagram feed"; "endless with frequency"; Anki-style, Claude's recommendation)

- **Endless scroll.** More cards load below; scroll past any card, and it comes back later (after 5 cards). Answered cards stay as they were, with a tick or a "comes back" mark.
- **Spacing, not dice** (`FlashcardSchedule.swift`), as Anki's learning steps: after passing stage 1 a word comes back 3 cards later, after stage 2 6 cards later, after a miss 2 cards later; never closer than 4 cards apart.
- **Five words in progress at a time**; a new word comes in when there's room (as Anki's new-cards limit), so words in progress get finished first.
- **Words that are yours** leave the feed and come back as a stage-3 check after 1 day, then 3, 7, 16, 40, 90 (each pass a step further; a miss takes the word back to stage 3). They're listed under "Your words" in the toolbar.
- **When everything is done**, the feed shows words that are yours early, as extra practice, rather than ending.
- Gaps between cards live in memory for the session; stages and the days are saved on the phone, per country.
- Earlier (2026-10-27, replaced): a weighted shuffle of all 20 (not met 1, met 2, recalled 3, missed 4, yours ¼); each card appeared once, so the weights only changed the order and nothing repeated.

### Next (agreed 2026-10-28, not built)
- **One master deck per country, filtered per learner.** A build script collects the words on everyone's Learn pages (Things and Doing), most frequent first, writes cards (word, article, English, picture idea, base word), makes the pictures once and adds them for everyone. Each learner's new cards come first from their own Learn pages, then the starter words, then the rest. Matching by base word, which the build asks Claude for (nothing language-specific in code). No personal decks (Josh: "a bit fancy").

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
