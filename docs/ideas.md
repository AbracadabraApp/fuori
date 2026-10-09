# Ideas

Ideas worth keeping that are **not part of the current plan**. Nothing here is scheduled or implemented. Move an idea into the numbered docs and the roadmap only once it's decided.

## Open-ended world (leading direction)

The numbered docs describe a scripted season (fixed route, cast, day plans). This direction replaces most of that: Claude creates places and people on the fly, and the learner goes where they like. If adopted, it supersedes much of [The journey](03-journey.md), the day builder and the fixed casts.

**Principles**
- **Go almost anywhere, meet whoever Claude creates.** "Voglio andare in una libreria" produces the bookshop, the bookseller and the situation.
- **Always suggestions.** A beginner can freeze at "go anywhere", so each day Claude offers 3–4 things to do, plus "vai dove vuoi".
- **Always a way to change scenery** (see below).
- **Claude directs; nothing is scripted.** Suggestions come from the learner's weak spots, the people they've met and the city ("Enzo said the artichokes arrive today", "you still haven't tried cacio e pepe").
- **Goals come from learning needs.** If the learner keeps saying *voglio*, today's situations call for *vorrei*. Repetition is built into the situations rather than written into scripts.
- **Cities hold ingredients, not scripts:** neighbourhoods, real places, food, customs, local expressions. Claude builds scenes from them.
- **A few fixed anchors per city:** where you're staying, maybe your local bar. Everyone else is generated and saved, so they can be met again and remember you. Your regulars are whoever you keep going back to.
- **Quality stays automatic:** level rules and the simulated learner (see [Testing](10-testing.md)).

**Changing scenery, at three sizes**
1. **Same city, new neighbourhood:** Monti instead of Trastevere. Claude offers it when you've stayed in the same few spots a while.
2. **Day trip:** out in the morning, back at night. The journey is part of it (ticket, train, a stranger on board).
3. **Moving on:** you ask ("voglio andare a Napoli"); Claude suggests it when the timing feels right (time spent, conversations getting easy); or it comes through people ("Davide va a Bologna per un concerto, vieni?").

**Leaving without losing**
- People stay where you met them; come back and they remember you ("Sei tornato!").
- People you've left send postcards and messages (Rita, Matteo): light reading practice that keeps the world alive.
- No locked cities. A suggested route can exist as inspiration only.

**Interface**
- **Oggi:** Claude's 3–4 suggestions as tiles, always including one "cambia aria" tile (new neighbourhood, day trip or new city), plus "vai dove vuoi".
- **Viaggio:** your travel map: cities you've lived in and the people you know there, and places you could go next, all open.

**Gaps to solve**
- Visuals: generated people get SVG avatars; places need real photos found per place; cultural texts stick to well-known landmarks.
- Progression: something must notice when the learner is ready for harder conversations.
- Cost and latency of generating scenes on the fly.

**Effect on the plan:** probably makes M1 simpler (one conversation engine plus a scene generator instead of authored content). The numbered docs get rewritten once this direction is confirmed.

## Magda, the tutor

Inspired by the creator's real Italian teacher, Magda, whom they meet weekly on Zoom. In the game she is the one character allowed to *teach*: every other character is a local who corrects by recasting and never lectures.

**Who she is in the game**
- An Italian teacher from the Veneto who coaches you remotely while you live in Italy. Warm, precise, interested in why mistakes happen. Her Venetian background also gives the game a northern voice alongside Roman and Neapolitan characters.
- Speaks Italian at your level, switches to English to explain when it helps, and gives short spoken exercises.
- Use her first name only. Don't use the real Magda's surname, her school's name or her contact details in the game, and check she's happy with a character named after her before Fuori is shown to anyone else.

**When she messages you** (as a text on your in-game phone)
- **Mistakes pile up:** "Ho notato che dici sempre *la vino*… facciamo cinque minuti?"
- **You're close to the next level:** "Sei quasi A2. Impariamo il passato prossimo, così puoi raccontare il weekend a Giulia."
- **Before something harder:** a move to Napoli, a doctor's visit, a phone call.

**Weekly lesson**, mirroring the real Zoom rhythm: review the week's mistakes from the diario, learn one new thing, and get a "try this" for the coming days. What she teaches feeds Claude's next suggestions, so it gets practised with real characters straight away.

**Bridge to the real Magda:** before a real lesson, Fuori prepares a one-page summary (recurring mistakes, new words, what was practised, transcripts worth looking at) to share on Zoom, so real lessons start from what the learner actually struggled with.

**Levels:** her lessons follow CEFR steps, with specific content from the *Profilo della lingua italiana* (see the level rules in [Testing](10-testing.md)).

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
  - Sources: Wikimedia Commons (huge coverage of Italian churches, museums and landmarks; mostly CC BY / CC BY-SA, so attribution is required), Unsplash and Pexels (free to use, attribution appreciated).
  - Download and store the images with the app rather than linking to the source sites, and record source URL, author and licence next to each one in the content files. Show a small credit line under each photo.

## Food culture conversations

Food as a topic, not only a transaction: talk with someone about why a dish is the way it is.

- Roma: *cacio e pepe* and *carbonara* with a trattoria owner who has strong opinions. Bologna: *tortellini* and why it's never "spaghetti alla bolognese". Firenze: *ribollita* and cucina povera. Napoli: what makes real pizza.
- Natural partners: market vendors, a nonna, a cook, the evening conversation slot.
- Real photos of the dishes (same sources and credit rules as cultural places) make the conversation concrete: "Questa è la vera carbonara. Niente panna!"
- Fits the persona: someone who loves Italy wants to understand the food, not just order it.

## Generated characters for longer stays

The more time you spend in a place, the more people you should meet. Hand-writing everyone doesn't scale.

- **Mix:** a hand-written core cast per city (the anchor and the key regulars) plus generated people for everyone else.
- **How:** Claude writes a character sheet on demand from the city, a role ("a florist near the Duomo") and constraints (the level rules, no repeats of existing personalities). It's one call that returns the same structure as a hand-written sheet.
- **Persistence:** save every generated character, so they can be met again and remember you, just like the core cast.
- **Code cost:** low; it's a single generation call and storing the result. The harder part is quality (avoiding clichéd, samey characters).
- **Portraits:** generated and minor characters get a single SVG avatar, with no mood variants. It's drawn in code from the character sheet (age, hair, skin tone, clothing colours), so the same person always looks the same and it costs nothing. Full illustrated portraits with moods stay for the hand-written core cast.

## Instagram as the interface model

Use the phone layout everyone already knows, mapped onto Fuori:

| Instagram | Fuori |
|---|---|
| Feed of cards | **Oggi**: one card per conversation (colazione, errands, the evening stranger), plus reading cards and the diario card to close the day |
| Stories bar | **People you know**: Giulia, Rita, Enzo… with a ring when someone has news ("Enzo has the first artichokes") |
| Profile grid | **Your journal**: places visited, dishes eaten, people met; real photos and portraits |
| DMs | Past conversations with each person, to reread |

Where it breaks from Instagram:
- **Cards are invitations, not content.** Each day is short (4–6 cards); tapping opens a full-screen conversation.
- **The conversation screen is closer to a video call than a chat**: large portrait, big mic button, transcript and corrections small underneath.
- **No engagement mechanics**: no likes, no infinite feed, no streak guilt. The day ends with the diario card.

Refinements from the mockup review:
- **Oggi is a grid of large square place tiles** (photos), not a feed of detailed cards. No people bar, goal chips or descriptions on this screen.
- **Places stay in order.** The current place has a highlight ring; later ones are greyed out with a lock until the one before is done. The diario unlocks at the end of the day.
- **One level up, Viaggio:** the same tile pattern for cities. The current city is a large tile with day progress; later stays and day trips (tagged "Gita") are locked tiles.
- The conversation screen (portrait, transcript, big mic) works as drawn.

Bottom tabs: Oggi · Viaggio · Diario · Tu. Mockups: [Fuori mockups](https://claude.ai/artifact/1zVpF11bWHivP3RxVruKyx) (Oggi, conversation, diario, journal).

## Other ideas from the conversation so far

- **Pronunciation scoring**: deliberately out of scope for now.
- **Characters who reappear in later cities** (Davide visits Bologna): partly in [The journey](03-journey.md); worth expanding into a thread that runs through the whole season.
