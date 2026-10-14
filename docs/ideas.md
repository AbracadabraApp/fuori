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

- **Mexico:** a costed estimate for a 5-city prototype is in [Mexico version](mexico-version.md) (2026-10-11).

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

## Streaming voice mode (like Claude app)

**Current M1 approach:** Request/response cycle with explicit corrections and word tracking
- Record → transcribe → Claude generates response with structured output → speak it
- Each turn is discrete and processed
- Returns corrections, new words, memory notes as structured data
- Higher latency but full control over learning mechanics

**Alternative: Streaming conversation flow**
- Real-time STT as you speak
- Claude streams response as it generates
- TTS starts before response is complete
- Much lower latency, feels like natural conversation
- More like the Claude app's voice mode

**The open question (added 2026-10-09):**
Does explicit language learning scaffolding (corrections displayed, words tracked, goals checked) actually help? Or does **natural flowing dialogue** where you just talk and Claude stays in character work better?

**Tradeoffs:**
- Flowing dialogue: More immersive, less "gamey", builds confidence through success not feedback
- Structured feedback: Makes progress visible, catches fossilized errors, systematic vocabulary building

**Test in M1/M2:** Ship both and see which one you prefer. The structured approach is easier to build first, but streaming might be the better experience.

**If streaming wins:**
- M3+: Add streaming STT (Groq supports it), streaming Claude responses, streaming TTS
- Keep corrections/words subtle or optional (don't interrupt flow)
- Let immersion do the teaching

## People, Places, Things: Multiple entry paths

**Not M1.** Future exploration of expanding from place-based navigation to three distinct pathways into Italian conversation practice.

**Current structure:** Places (cities → neighborhoods → places → people)
**Expanded structure:** Three parallel paths with different organizing principles

**Places path** (current implementation)
- Geographic organization: cities → neighborhoods → places
- Context: cafés, markets, bakeries, restaurants
- Natural for travelers exploring a city

**People path**
- Conversation partners organized by type or interest
- Historical figures: Dante, Michelangelo, Garibaldi, Renaissance artists
- Literary characters from Italian novels and poetry
- Contemporary types: chef, fashion designer, architect, winemaker
- Cultural icons: filmmakers (Fellini, Rossellini), composers (Verdi, Puccini), writers
- Allows practice around specific topics and cultural depth without geographic constraint

**Things path**
- Object-centered conversations exploring Italian culture through material culture
- Art pieces: talk with a guide about a specific painting or sculpture
- Food culture: conversation with a tomato farmer, cheesemaker, olive oil producer about their craft
- Cultural objects: a Vespa, an espresso machine, a Renaissance fountain, traditional tools
- Each "thing" becomes a doorway to conversation about process, history, significance

**Cross-references and integration**
- A filmmaker character might recommend visiting certain places in their films' locations
- A place might introduce you to a local artisan (thing) or historical figure who lived there
- A dish (thing) connects to the chef who makes it (person) and the restaurant where you eat it (place)

**Architecture implications**
- Current `city → place → person` flow generalizes to `category → subcategory → character`
- Entry screen could show three sections or tabs instead of just city cards
- Same conversation engine and learning mechanics work across all three paths
- Character data structure already supports this (role, description, conversation style)

**Content generation**
- Places: already building this with city pantries
- People: Can generate character sheets for historical/cultural figures with appropriate personality and knowledge
- Things: Similar to places but organized around objects rather than locations

**Open questions**
- Should all three paths be available from M1, or introduce people/things later?
- How do we prevent the catalog from becoming overwhelming with too many entry points?
- Does this dilute the "season in Italy" narrative, or enrich it with more ways to engage?

## Learner-controlled difficulty through natural language (M1)

**Adopted for M1:** Instead of UI help buttons, learners control conversation difficulty by speaking naturally in Italian (or English when desperate).

**The principle:** Give learners agency through language itself, not meta-UI. This stays immersive while reducing anxiety.

**How learners naturally express needs:**

**For repetition:**
- "Ripeti per favore" / "Ancora una volta" / "Come?" / "Cosa?"
- Even imperfect: "non capito", "uh... again?"
- Claude recognizes intent across all variations

**For simplification:**
- "Più lentamente" / "Piano piano"
- "Non capisco" (repeated)
- Claude responds by simplifying language and speaking more clearly

**For English help (last resort):**
- "Scusi, parla inglese?" / "English?"
- Character responds based on who they are and where you are
- Hotel receptionist in Milan: probably yes
- Old market vendor in small town: probably no, but very patient
- After brief English help, character guides back to Italian

**Why this works:**

1. **Learner agency** - You're in control, not waiting to be rescued
2. **Stays immersive** - Using Italian to control the conversation IS practicing Italian
3. **Teaches useful phrases** - These are exactly what travelers need
4. **Culturally authentic** - Real Italians respond to these naturally
5. **Reduces anxiety** - You always have an escape hatch

**Implementation:**

Claude doesn't need explicit rules for every phrase - it naturally understands intent. Prompt guidance focuses on:
- **Character behavior:** Respond helpfully while staying in character
- **Character knowledge:** Does Rita speak English? (in character sheet)
- **Conversation flow:** Return to Italian after brief English help
- **System coordination:** Flag when TTS speed should adjust

**Test with simulated learner:** Various ways of expressing "I don't understand" should all get appropriate help without breaking character.

**M1 help system:**
- No UI buttons that break immersion
- No "Come si dice?" button
- Just natural conversational repair, the way real people help each other

**M2 additions:**
- Diario shows corrections after conversations
- Magda provides explicit teaching
- Structured reflection complements immersive practice

## Visit marks on place cards

*Raised 2026-10-10. Not built.*

As you visit a place, its Polaroid card gets a mark, and the mark darkens as you keep coming back. The feed becomes a quiet record of your time in Italy, with no points or game mechanics.

**What the mark could be** (it should feel like part of a sketchbook Polaroid):
- **Ink stamp** in a corner, like a passport stamp, getting darker and more saturated with each visit. Fits the travel theme and reads at a glance. *Preferred.*
- **Coffee ring** that deepens with repeat visits. Charming for bars and cafés, odd on a church.
- **Pencil tally marks** in the white caption area. Clear, but starts to feel like a scorecard.

**Keep it small and capped.** Three or four levels (first visit, a few visits, regular), then it stays put. The point is a sense of belonging, not a count.

**Related: names appear once you've met someone.** Before your first visit, the card shows only the place. Afterwards, the person's name appears handwritten on it, like "*Giulia*" penciled under "Bar in Trastevere." Strangers become people you know, which is the core of Fuori. It pairs with character memory: the card shows you know her, and she shows she knows you.

**Decisions to make:**
- **What counts as a visit:** a real exchange (say three or more back-and-forths), not just opening the card, so tapping around doesn't mark everything.
- **City cards:** a quieter roll-up, like "3 places" in small type, so you can see where you've spent time.
- **Where it's stored:** on the phone (localStorage) is fine at first, but it should move into learner data once memory is built. It's the same information: who you've met and how often.

## Messages: how characters get back to you

*Raised 2026-10-10. Not built. Depends on character memory.*

Characters (and Magda, in M2) reach out between conversations, so the world keeps going when the app is closed and gives you a reason to come back. The challenge is realism: a barista would never write you a letter. The answer is to use the channels Italians actually use.

### Realistic channels

- **Rita as the hub.** Your host would plausibly text you, and Italians love passing news along: "*Giulia mi ha chiesto di te, non ti vede da giorni!*" Characters who would never message you directly can still reach you secondhand, through her.
- **Invitations made in conversation.** Giulia says "*Torna venerdì, c'è la partita*" during a chat. Afterwards it becomes an entry in your own *agenda*: "Friday, Giulia's bar, the match." Nobody messaged you; you made a plan, the way a real person would.
- **A note left for you.** Next time you visit the bar: "*Giulia ti ha lasciato un biglietto.*" Old-fashioned but plausible for a regular, and it rewards going back.
- **Earned WhatsApp contacts.** Only people whose number you got in conversation can message you directly. Asking "*Mi dai il tuo numero?*" becomes a real friendship milestone. Pairs with "Visit marks on place cards": the card gets their name, your phone gets their number.

### Voice notes (the standout)

Italians send voice messages constantly. In a voice-first app, a 20-second voice note from Rita is natural listening practice, and you reply with a voice note of your own. Messaging becomes part of learning, not just a way to bring you back.

### Magda (M2)

The teacher at the school for foreigners in each city, with the learner profile behind her lessons. See [Game design → Magda](02-game-design.md#magda-at-the-school). (Whether she also messages between visits is open.)

### Guardrails

- **Every message comes from something that happened in a conversation** ("Giulia asked about your trip to Naples"). Never generic ("We miss you!"), which is the nagging-app pattern people resent.
- **Sparing, opt-in notifications** with in-world reasons only.
- **Messages are in Italian**, at the learner's level, like the conversations.
- **Memory comes first.** Without memory, characters have nothing real to follow up on.

### Suggested order

1. Character memory
2. Invitations from conversations and the *agenda*
3. Rita's messages and earned contacts, with voice notes both ways
4. Magda's check-ins (M2)

## Other ideas from the conversation so far

- **Pronunciation scoring**: deliberately out of scope for now.
- **Characters who reappear in later cities** (Davide visits Bologna): partly in [The journey](03-journey.md); worth expanding into a thread that runs through the whole season.

---

## Coda: notes from the first real phone use (2026-10-11)

*Working notes, not decisions. Captured while using the app on an iPhone: a long conversation with Rita, then Rosa at the Florence market. Items 1–5 were acted on the same day (see `progress.md`); the rest are open.*

### Interface

1. **Portrait:** keep the full portrait at the start of a conversation. *(Done: unchanged.)*
2. **Nav header too large:** "← Firenze" takes too much space. *(Done: smaller.)*
3. **Text area:** the reply text should sit at a fixed point, about 50% down the screen, overlaying the portrait, instead of pushing the page so the portrait scrolls away. Rosa's face scrolled off and only her apron showed. *(Done.)*
4. **Roles in English:** some generated characters had English roles ("Fruit vendor"). Should be Italian (*fruttivendola*). *(Done.)*
5. **Mic states:** the real uncertainty was whether your words were being captured, not which state the app was in. *(Done: compact pill; olive bars that move with your actual voice while recording; terracotta dots while the character prepares a reply, since red reads as an error; a warning if no sound arrives.)* Also: brand green changed to olive.

- **Name as a Polaroid caption (done 2026-10-12, Josh):** move "Name · role" from above the portrait to a strip attached below it, freeing space at the top and matching the place cards. Trade-off: the reply card (starting mid-screen) would cover a caption under a full portrait; cropping the portrait to a square with the name strip attached avoids that but loses the full-length drawing. Decide by looking at real screenshots after a few days of use, not by description, and after the cold-start/where-next work, which will change this screen anyway.

### Conversation

6. **Length:** replies run 4–6 sentences. Good quality, but long to follow by ear, slower, and fewer turns for the learner. Candidate prompt line: "This is a spoken conversation. Say one or two things, then let them answer, the way people do when they talk." No sentence limits.
7. **Cold start:** you tap into a place without having thought about what to say. In real life you always walk up for a reason. Ideas:
   - a short scene card before Start ("*Mercato di Sant'Ambrogio, mattina.* Rosa is calling out about her peaches")
   - two or three things you could do there, by place type ("buy fruit for breakfast", "ask what's in season"): a reason to walk up, not a script; from data, no extra Claude call; gone once the conversation starts
   - an opening line that is easy to answer ("*Cosa le serve?*"), not buried under three other sentences
8. **Where next:** ending a conversation is easy (say goodbye); knowing where to go next isn't. Rita got tired and suggested wrapping up, and there was no obvious next step. Ideas:
   - places a character mentions in conversation appear as a small card on their screen ("Rita mentioned: Mercato di San Cosimato →")
   - a quiet line of *wants* at the top of the places feed: *Un caffè? · Il mercato · Qualcosa da vedere*, each leading to a fitting place nearby. Framed as wants, not quests or missions.

### Scope and the world

9. **Fewer cities, generated on the fly:** *(Fewer cities done 2026-10-13: 8 Italy, 5 Mexico shown. Generation mechanics TBD: intent-driven "I want a barber" vs location-driven "generate Agrigento" vs hybrid character-suggestions. Deferred post-M2.)* 20 cities is a lot. Prefer 3–5 deep cities (e.g. Roma, Napoli, Firenze, Bologna) and put energy into generating places and people as you explore:
   - generate once, then keep (needs the database); shared across players so the world is consistent and paid for once
   - start the conversation immediately with a placeholder or a stock sketch of the place type; the portrait arrives when ready
   - run today's checks (gender, voice, portrait, prompt) on each new character at creation time
   - keep hand-tuned anchors (Rita, Giulia) and a few places per neighbourhood; generate the rest on "*vai dove vuoi*" or when you wander somewhere new
   - makes new languages cheaper still: a playable Mexico could take ~48 hours with mostly anchors, not a pre-built map
10. **Reasons to return (emergent, not scripted):** fewer places only works if they're interesting to revisit; the same market or bakery gets dull. What changes between visits should come from life moving on, *not* an authored season (which was dropped on 2026-10-09):
    - when you come back, one Claude call generates what's new in the character's life from their personality, past conversations and the time elapsed, and saves it to memory; nothing written in advance
    - real dates, not game days: Sunday at the bar means the match; a week away means they noticed
    - no arc you must follow: skip someone for a month and their life simply went on
    - new people appear at familiar places (a regular, a cousin helping at the stall)
    - relationships deepen, so conversations get richer
    - builds on memory (M1), messages and where-next. The pattern is closer to neighbours you check in on (Animal Crossing) than a story you play through.

## Recommendations, where next, words at the end (brainstorm 2026-10-11)

Josh, thinking aloud. Feedback in the session; notes here so they aren't lost.

- **Characters recommend real places in the game.** "Try my cousin's trattoria, Da Enzo" with a card to go there. The in-world version of where next (Coda #8). The character's prompt would carry a few nearby places they know, as background, not a script; a card appears only when they actually mention one. Keep it occasional and personal (a favourite, a cousin, a grudge), never every conversation, or it reads as an ad.
- **Hints for where to go next.** The fallback when nobody recommended anything: the quiet line of wants (Coda #8).
- **Words at the end of a conversation.** When a conversation ends, a small page of the 3–5 words or phrases most worth keeping from it, tap to hear each one. Natural, not didactic: no quiz, no score. It's the review log shown to the learner, so check the log's choices in debug mode first. End of conversation is the right moment (a pause), unlike mid-conversation.

## Level, speaking and review (discussion 2026-10-11)

The stance (immersion; characters above your level are fine; teaching in character is fine) is now in [Vision → Level](01-vision.md#level). Saving conversations and the review log are in [Roadmap → M1](06-roadmap.md#m1-navigate-cities-and-hold-a-conversation-thats-remembered); decisions waiting on Josh are in [Open design questions → 11](open-design-questions.md#11-level-and-speaking-2026-10-11). Parked here:

- **A learner level that travels with you.** Not for making every character speak to it. Starts from what the learner says, updates from how they speak; used by the review log to judge what was likely new, maybe lightly by characters. (M2 in the roadmap.)
- **Character-judged success.** Did the exchange work? Concrete questions, not a 1–10 score, because characters are generous. Success says you're getting by; review items are what stretch you. (M2.)
- **Scene pace.** What's happening at the place right now ("a few people waiting at the counter") shortens turns without a length rule. Ties into length and the cold-start scene card (Coda #6–7).
- **Interact with the transcript.** Tap a word for its meaning, translate the whole reply, save words. Deferred as too much interface for now. (M3.)


## Beginner help: school, children, street helper (Josh, 2026-10-12)

Prompted by "help more beginner level people". Rule behind all three: **everyone teaches, nobody lectures** (see Vision, principle 7).
- **A school for foreigners** in each city, where Magda teaches (Josh, 2026-10-13): one-on-one, what you ask for or what she suggests from the learner profile. A short class, then "go try it at the bar next door"; maybe classmates who are other learners (an AI German student, a Brazilian au pair) speaking simple, imperfect Italian. Class → street → class. (See [Game design → Magda](02-game-design.md#magda-at-the-school).)
- **Children** speak in short, simple, repeated sentences and don't judge: good A1 practice. Always in family settings with a parent or grandparent in the scene (the baker's daughter doing homework behind the counter, a kid with his nonna at the park). Topics stay a child's: school, pets, football, gelato. Firm prompt guardrails and a judge check that every child conversation stays age-appropriate.
- **A street helper** (a neighbour on a bench): step aside, ask in English "how do I ask for the bill?", hear the line, go back and try it. The "help me say it" idea with a face. Likely first to build: fixes the freeze-and-quit moment, works in every city, needs no new place.
- Other beginner ideas from the same brainstorm: tap the subtitle to replay slower; tap a word for its meaning; English that fades with visits; characters who notice confusion (by silence and length, not phrases); 2–3 tappable reply hints at A1; beginner-friendly places first in the feed; a tiny goal per visit; short A1 visits; a 60-second recap; a warm-up of 3 likely phrases before entering.

## Study export, not study tools (Josh, 2026-10-13)

**Decided:** Fuori won't build Duolingo-style learning (drills, streaks, spaced repetition). It has the material no study app has (real conversations, people, places, voices) and exports it to a study platform.
- **Anki first:** open file format, works offline, does spaced repetition. A deck built from the review log: word or phrase, meaning, the line where it came up, who said it and where, and the character's voice as audio. Free on desktop and Android; AnkiMobile is a one-time purchase on iPhone.
- **Quizlet second, text only:** Quizlet has no public API, so the most Fuori can offer is a copyable list in the format Quizlet's import accepts (term, tab, meaning per line). No audio or context.
- **Gemini / NotebookLM** have flashcards but no API to push cards into.
- **First, the content:** the export is only as good as the review log's picks, which are still debug-only and unchecked. Make those trustworthy before building the export.
- **Demo planned for M2:** [study-export-demo.md](study-export-demo.md).
