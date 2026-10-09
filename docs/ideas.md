# Ideas

Ideas worth keeping that are **not part of the current plan**. Nothing here is scheduled or implemented. Move an idea into the numbered docs and the roadmap only once it's decided.

**Adopted on 2026-10-09** and moved into the numbered docs: the open-ended world, Magda the tutor, dialect that grows with level, generated characters, and the Instagram-style interface (see [Game design](02-game-design.md)). Real photos for places and food are in [Visuals](07-visuals.md).

## Animated clips for the core cast

Short talking or moving clips of main characters, matching their portraits (a test clip of Enzo at his stall worked well).

- **Not for every reply:** characters improvise, so live video per line is too slow and costly.
- **Pre-made moments instead:** a greeting, a laugh, an idle loop per core character, played at key moments; still mood portraits plus voice for everything else.
- Later than M2; stills and voice come first.

## Groundhog Day loops

Stay in the same day until you succeed, or choose to move on.

**Why it's appealing**
- Repetition with a purpose: replay Giulia's bar until ordering feels easy.
- Low stakes: failing costs nothing, so you can try bolder sentences.
- The film's fun: you know what's coming and use it.
- Visible progress: loop 1 vs loop 3 of the same conversation.

**The tension**
- If the day resets, characters forget you, which works against "people remember you" (see [Vision](01-vision.md)).
- Forced loops risk boredom and quitting.

**A possible shape**
- Characters reset; the learner and the diario don't. Corrections, words and "try tomorrow" goals carry from loop to loop.
- Each loop varies: same people and goals, unscripted conversations, small changes (Giulia is busy, Enzo is out of tomatoes), so lines can't be memorised.
- A clear success condition per day, e.g. all goals met and the main mistake from the previous loop not repeated. Success "breaks" the loop and characters remember you from then on.
- After each loop: "Rivivi la giornata" or "Vai avanti". Moving on is always allowed; unmet goals carry forward in the diario.
- After about three loops, suggest moving on.

**Open question:** should this be the core rule, or an opt-in "replay this day" mode on top of the normal journey?

## Automatic per-reply checks

Deterministic checks on every character reply in `/api/turn`: too long for the level, words outside the vocabulary list, English slipping in, *tu*/*Lei* mismatching the character sheet. Parked because the simulated-learner judge covers most of this for a one-person prototype.

## Learning from play

Log friction moments (silence or abandoned scenes, "Come si dice?" presses, `confused: true`, repeated corrections) and analyse them by character and phrase to find where conversations stall. Only useful once there's real play from more than one person.

## Other languages

Use the same engine for Spanish, French and so on.

- **The code is the easy part.** Scenes, characters, memory, the diario, corrections and the simulated learner are language-neutral. The language-specific bits (Whisper code, voices, level rules, prompt examples, UI words) are kept in a per-language config from the start; see "Keeping other languages possible" in [Architecture](05-architecture.md).
- **The content is the real cost.** Each language needs its own route, cast, customs, portraits and voices, roughly the work of building Roma again per city. Claude can draft much of it; someone who knows the culture should shape it.
- **Other AI models** are possible but not worth abstracting now, since the plan relies on Claude features like structured outputs and prompt caching. Keeping all model calls in `lib/claude.ts` keeps a swap to one file.

Revisit once the Italian version is fun to play.

## A scene generator for any language

The prototype was built by Claude in one pass, and very little of it is Italian: the four scene definitions (place, character, goal steps, opening line), the speech language code, a few prompt examples ("cornetta" → cornetto) and some UI words. Everything else (the conversation loop, forgiveness, in-character corrections, goals, the quaderno, voice controls) is language-neutral.

- **Quick win:** a Mexico or France version of the demo is mostly a data swap, minutes of work. Example settings: a taquería in Coyoacán, the Mercado Benito Juárez in Oaxaca, an ADO bus counter, Guanajuato's Jardín de la Unión; or a Paris café, a Lyon market, Marseille's Gare Saint-Charles, Bordeaux's Place de la Bourse.
- **Bigger step:** the learner picks language, country and level, and Claude generates the places, characters and goals, then plays them. Almost no extra cost on top of the demo.
- **What doesn't transfer automatically:** cultural accuracy (generated scenes drift toward cliché without hand-shaping), speech recognition (the English-dictation problem hits every language; Whisper fixes it), and quality per language (strongest in widely used languages; the simulated-learner test should check each one).
- **Product question:** this is a different product, "practise any language through scenes", versus Fuori's "a season in Italy with people who remember you". Keep Fuori focused on Italy; treat the generator as a cheap side experiment.

## Cultural places as reading practice

Museums, churches and landmarks you pass while travelling become reading moments, not just backdrops.

- **What you read:** short texts written to your level, like the things you'd really see: the plaque outside Santa Maria in Trastevere, a museum label, a church's information board, a menu, a page from a local paper, a train announcement board.
- **How it works:** Claude writes the text at A1–A2 from the level rules, with real facts about the place. A few questions follow, asked aloud by a character rather than as a quiz (a custode, a guide, a friend who came along).
- **Why:** it adds reading, which the game otherwise lacks, and the facts give conversations something to talk about ("Hai visto i mosaici?").
- **Risk:** facts must be right; keep to well-known places and check generated texts once before they ship.
- **Real photos:** cultural sites and dishes can use actual photographs instead of illustrations. People stay illustrated; real places and food are shown like photos you took or postcards you picked up, which also suits a travel journal.
  - (Adopted in [Visuals](07-visuals.md).) Sources: Wikimedia Commons (huge coverage of Italian churches, museums and landmarks; mostly CC BY / CC BY-SA, so attribution is required), Unsplash and Pexels (free to use, attribution appreciated).
  - Download and store the images with the app rather than linking to the source sites, and record source URL, author and licence next to each one in the content files. Show a small credit line under each photo.

## Food culture conversations

Food as a topic, not only a transaction: talk with someone about why a dish is the way it is.

- Roma: *cacio e pepe* and *carbonara* with a trattoria owner who has strong opinions. Bologna: *tortellini* and why it's never "spaghetti alla bolognese". Firenze: *ribollita* and cucina povera. Napoli: what makes real pizza.
- Natural partners: market vendors, a nonna, a cook, the evening conversation slot.
- Real photos of the dishes (same sources and credit rules as cultural places) make the conversation concrete: "Questa è la vera carbonara. Niente panna!"
- Fits the persona: someone who loves Italy wants to understand the food, not just order it.

## Other ideas from the conversation so far

- **Pronunciation scoring**: deliberately out of scope for now.
- **Characters who reappear in later cities** (Davide visits Bologna): partly in [The journey](03-journey.md); worth expanding into a thread that runs through the whole season.
