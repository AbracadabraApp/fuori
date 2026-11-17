# Europe and Asia: spin-offs of Fuori (draft spec)

2026-11-16 · Draft 5 · From Josh's brainstorm of 2026-11-15 and his decisions of 2026-11-16. Quoted words are Josh's. Recommendations are marked as Claude's. No screen wording is proposed. (Saved to the repo 2026-11-17 at Josh's request; also in the Claude project as `plans/europe-spinoff-spec.md`. This file is the one to edit from now on.)

**Decided (Josh, 2026-11-16):**
- **Size:** "5 cities in each continent; 5 places in each city". Each continent is 5 cities, 25 places and 25 people: about 55 pictures (25 places, 25 portraits, 5 city cards).
- **First build:** "we can still build Prague first".
- **Prague's five places:** "Astronomical Clock, Prague Castle, Charles Bridge, a pub, and Vyšehrad". (He traded Havel's Market for "the cemetery on the hill & church"; Josefov was the other candidate and is the first pick if Prague unlocks a sixth.)
- **The character is a tour guide, and English leads:** "the app should plan to have far more english/explanation than Fuori - whoever the character is will be more of a tourguide than Fuori characters were teachers".

Everything else is still open.

## Problem

Fuori teaches one country deeply: its language and its culture, city by city. Someone curious about many countries has no way in. They don't want months of Italian; they want to visit Paris, Prague and Lisbon from a chair, meet a person in each place, and come away with a little of the language and a sense of the place. Josh: "more of an armchair tour"; depth "more like a phrase book".

Who has this problem today is a guess: the only players are Josh and his family. The spec treats version 1 as a way to find out whether the idea is fun, not as a launch.

## Goals

1. **A player can tour five cities of a continent** in the game as it exists: pick a city, pick one of its five places, talk with the person there.
2. **The person shows them the place.** Whoever they are, they act as a guide: they explain what the player is looking at, its story and why it matters, in English.
3. **Each place teaches a little language, lightly**: a phrase or two the player hears, understands and says.
4. **It reuses Fuori's structure**: "it's what we already have". Version 1 adds content and the smallest code change that makes it possible, then "see what's unique about it".
5. **It stands alone**: someone who never played Fuori can start with Europe.
6. **We learn the cost of a city** (hours of writing, pictures, checking), since every later idea depends on that number.

## How it differs from Fuori

| | Fuori | Europe |
|---|---|---|
| The character is | a person in their role, who teaches by helping | a guide to the place, whatever their role |
| English | only as much as the learner needs; unasked-for English is the thing to avoid | most of what is said; explanation is the point |
| The language | the goal, climbing a ladder | a phrase or two per place, as flavour |
| The player's part | answers in the language, more each step | listens, asks, says the phrase |

So Europe needs its own prompt and its own turn shape. Fuori's character prompt and Beginner steps are written to take English away; here English stays.

## Non-goals (version 1)

- **Deep teaching.** No Beginner ladder, level-up offer, lessons, Magda or flashcards for these languages.
- **A travel companion used on the street.** "A travel version in person is an interesting angle", but he would "start armchair anyway". Not trying to beat Google. So the phrase books' logistics (hotels, banks, car hire, post offices, health) are out.
- **More than five cities or five places.** The size is set; unlocking more is parked below.
- **Cities built on demand, itineraries, paying.** Parked below. Each needs version 1's answers first.
- **A faster or different picture service.** He doesn't want to relearn one.

## Who it's for

- **The armchair traveller**: wants to see places and meet people; language is flavour, not the goal.
- **The Fuori player**: finished a visit in Italy or Mexico and wants somewhere new.
- **The trip dreamer**: has a trip in mind and wants a first taste of the cities and a few words.

## Stories

- As an armchair traveller, I want to choose a continent and see its five cities, so that I can go somewhere I'm curious about.
- As an armchair traveller, I want the person at a place to show me round it in English, so that I understand what I'm looking at.
- As an armchair traveller, I want to ask about what interests me, so that it is a conversation and not a recording.
- As an armchair traveller, I want to learn a phrase or two there and say them, so that I leave with a little of the language.
- As a Fuori player, I want it to work like the game I know, so that I don't have to learn it again.
- As a new player, I want to start in Europe without having played Italy or Mexico, so that the tour stands by itself.

## Prague

The five places, and a first proposal (Claude's) for who is there and which phrase-book category each carries. Each acts as the place's guide, whatever their job. The categories come from a review of two Czech phrase books Josh supplied (2026-11-16): greetings, not understanding, introductions, sightseeing, food and drink, prices and numbers, directions.

| Place | Who might be there | What they'd show | What it could teach |
|---|---|---|---|
| The Astronomical Clock, Old Town Square | A guide waiting for the hour | How the clock works and what the figures do | Hello; numbers and time |
| Prague Castle, at St. Vitus Cathedral | Someone at the ticket desk | The castle and the cathedral | Tickets; "how much?" |
| Charles Bridge | A painter or musician who works the bridge | The bridge, its statues, the river | Please, thank you; "which way?" |
| A pub | The waiter | Czech beer and what to eat with it | Ordering; "na zdraví"; the bill |
| Vyšehrad: the cemetery and the basilica | A caretaker or guide | Who is buried there; the founding legend | "Where is…?" |

Greetings and courtesies run through all five. The places make a walk: the square, across the bridge, up to the castle, a beer, and the hill above the river.

## Requirements

### Must have (P0)

1. **A continent is a choice** beside Italy and Mexico, opening on a list of its five cities, like theirs.
   - Given a player choosing where to play, when they choose Europe, then they see its city cards.
2. **Each city has five places with a person at each**, as Fuori's cities do.
   - Given a city, when the player opens it, then it shows five places, and each opens a conversation with its person.
3. **A city has its own language.** Today a country has one language (its speech-to-text code, voices and words). A continent has one per city. This is the one real code change, and the main risk.
   - Given Prague and Paris, when the player talks in each, then the game hears and speaks Czech in one and French in the other.
4. **The character guides in English and teaches a phrase or two.** Far more English and explanation than Fuori.
   - Given any conversation there, then most of what the character says is English about the place, and the player is never expected to follow a sentence in the language with no English.
   - Given a finished visit, then the player has heard, understood and said at least one phrase in the language.
5. **The player can talk in English.** A tour is a conversation about the place, so the game must hear English questions as well as the phrase in the language.
6. **Facts are checked** as Mexico's were (the fact judge). With explanation as the point, this matters more than in Fuori. Phrases are checked against a reliable source (of the two phrase books, the Rough Guide; the mini book's Czech has errors).

### Should have (P1)

- **Different people teach different phrases** (one teaches "dobrý den", another "děkuji"), so a city's five places add up to a small phrase book.
- **Its own welcome**, short, with no masculine or feminine question unless the language needs it.

### Design so it stays possible (P2)

- Extending a stay: a second city per country, built but hidden, then up to about five; a sixth place in a city (Josefov).
- A city built when asked for (Kraków, "might take 15 minutes").
- An itinerary of cities the player wants to visit.
- Paying: "a dollar" a ticket between cities, "the first few" free; paying to have a city built ("not very practical, just interesting").

## How we'll know (no numbers invented)

- **Josh plays Prague end to end and says whether it's worth the next city.** This is the gate.
- **Cost of a city**: hours to write, picture, check and ship Prague. Recorded.
- **Did they learn the place?** After a visit, can the player say one thing about it they didn't know. Asked, not instrumented.
- **Do the phrases stick?** Can the player say a city's phrases unprompted a day later. Asked.
- **Do people come back to it?** Visits by Josh's family in the two weeks after it ships, from the conversations table.

## Open questions

Blocking Prague (Josh):

1. **The shape of a visit.** A guide talks longer than a Fuori character. How long is a turn before the player speaks, how many turns is a visit, and does each turn still end on something for the player to say or ask? Fuori's are voice-first and short; a tour read aloud could run long.
2. **What the player says.** The phrase in the language, their own questions in English, or both. Whether answers are still offered to tap or say.
3. **What is printed.** Fuori's Beginner prints only the question and its English; the rest is heard. A tour may want its English on screen.
4. **A link inside Fuori or a separate app?** He said both "one app for many countries" and "a third link". Version 1 assumes the link, which would open on a list of one city until the others exist.
5. **The pub: a named real one or an invented one?** Fuori has leaned toward invented businesses and real landmarks.
6. **The people, sights and phrases in the Prague table** are a proposal, not his.

Blocking Prague (engineering):

7. **Per-city language**: how far does "one language per country" run through the content pack, the prompts, speech in and speech out? Is there a good Czech voice that also reads English well, since most of what it says is English?
8. **Hearing two languages in one visit**: does speech in (Whisper) handle a player who asks in English and then says a Czech phrase?
9. **Do the fact judge, the names check and the feed-order test work** for a five-place city and for a country with no pantry of its own?

After Prague (Josh):

10. **The other four in Europe.** Talked about: Paris, Lisbon, Barcelona, Munich, Vienna (could stand in for Munich), Amsterdam, Copenhagen, Athens, Istanbul; also Budapest, Kraków, Seville, Naples, Porto, Dubrovnik or Split, Stockholm or Helsinki, Brussels or Bruges; Rome for Europe-only players. *Claude's suggestion, to react to: Paris, Barcelona, Vienna, Athens.* Rome is the question: Fuori already has it.
11. **Which five in Asia?** Working list of nine: Tokyo, Kyoto, Seoul, Taipei, Hong Kong, Bangkok, Hanoi, Manila, Kuala Lumpur, plus Singapore or Bali. His calls: Khmer isn't realistic; keep Hanoi ("Vietnam is too popular as a destination"); Shanghai dropped for Taipei. *Claude's suggestion: Tokyo, Seoul, Taipei, Bangkok, Hanoi.*
12. **Asia with Europe, or after?** *Claude's recommendation: after; Asia's scripts and tones are a harder test of speech in and out.*

Not blocking: the name (he used "Europe"; "Europa" came up); whether characters remember the player across cities; Hanoi or Ho Chi Minh City.

## Build order

1. **Prague (decided).** Its five places, five guides, in English with Czech phrases. It proves requirement 3, gives the cost of a city, and gives Josh something to play.
2. **Europe's other four**, if Prague passes his gate.
3. **What's unique**: a city's phrase book, extending a stay. Chosen after playing all five.
4. **Asia's five**, then on-demand cities and paying, only if Europe is fun.

No dates: there is no deadline, and the size of step 1 depends on questions 7 and 8.
