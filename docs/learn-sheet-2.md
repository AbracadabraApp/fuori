# Learn sheet 2.0: the sheet after a visit

2026-11-17 · Josh and the cloud session · design closed in mock-ups, then **paused by Josh the same day**. Nothing built.

**Scope (Josh, 2026-11-23):** "we are working on updating learn - learn 2.0 - this will be an interstitial sheet wheen a converssation ends.  When finished it will replace the dropping icon and lern 1.0 implementation". So when Learn 2.0 is done, the Learn link in the bottom bar (the book, which opens `LearnSheet` mid-conversation from `PersonView`) and the Learn 1.0 sheet itself go away. That settles "The old Learn sheet behind the book" under Still open.

**Status:** design work picked up again by Josh on 2026-11-23 ("I want you to work creatively and productively - not shitting on an idea when its still in development. Take account of the requirements both design and content."). Six card types now, one card to a sheet (below → 23 November). Still nothing built. Before that: paused 2026-11-17, "Save all the work but I think I'm deterred to go forward right now given the first set of feedback." The feedback was the cloud session's own assessment (below → The assessment, and what was wrong with it). Don't build this until Josh picks it up again.

Mock-ups: the page "Lesson Door Sheet" (https://claude.ai/artifact/XVeopuYsxXoP2ibkiSwunm), private to Josh. The closed design is at the top; the rounds that were rejected are kept below it, marked as out. A copy of the page without its pictures is in `design/learn-sheet-2/learn-sheet-2.html`. Earlier thinking: [after-conversation.md](after-conversation.md) (2026-11-10), which this replaces for the Learn page; level up there is unchanged.

## What the sheet is for

It comes up after a conversation and **instructs**. It reinforces the vocabulary and grammar the conversation used. Josh: "the sheet is to instruct"; "the learn page is only about reinforcing vocab, grammar, etc"; "this is a quick review moment - not a deep user interaction".

## The moment (Josh)

"The character says good bye - the card stays - the sheet slides up - closing returns to place list."

1. The character says goodbye on the standard person screen (`PersonView`: the name band, the portrait to the bottom edge, the character's bubble and the round control).
2. That screen stays as it is, and the sheet slides up over its lower part. No picture inside the sheet; the person is already on the screen behind it.
3. Closing the sheet returns to the city's place list.

Today the person screen dismisses itself 1.5 seconds after the goodbye is said back (`PersonView`, `.onChange(of: model.phase)`); the sheet would come in at that point instead. This replaces the 10 November idea of a half sheet over the place list.

**The sheet may cover the face.** In the mock-up a taller sheet (Nunzio: a three-phrase card plus Formal and informal) hides his face, leaving the name band and the top of the portrait. The cloud session raised it as a problem; Josh: "i dont think its an issue - you haven't lost context". You were just on that screen and the name is still showing, so no height limit follows from the face.

## Three card types

1. **When you…** One topic the conversation involved, as that lesson's phrases. Headline is the situation: "When you introduce yourself", "When you order", "When you pay" (Josh's wording). Example: *Mi chiamo Joshua.* / *Come si chiama?* / *Piacere.*
2. **Formal and informal.** The two forms, one above the other (Josh: "formal / informal could be a card"). Example: *Come si chiama?* · formal / *Come ti chiami?* · informal.
3. **About this place.** One fact about where you were (Josh: "doesn't need to be from conversation"). The mock-ups took the facts from each character's `here` line in `content/<country>/cities/*.ts`.

**How cards are picked:** often by what the conversation involved, but **not always** (Josh, correcting the cloud session's "cards are picked by what the conversation involved"). A card can stand by itself, as About this place does.

The sheets as drawn: Nunzio, Palermo (When you introduce yourself, Formal and informal); Doña Juana, San Cristóbal (When you order, About this comedor). Josh called the same sheets "fine" when each also had a Try it card, then cut that card.

## Footer: two candidates, neither on the sheet for now

Josh: "I'd cut the try it box for now. try it, lesson are two candidates for footers so far."

- **Try it.** Something to do with the next person you meet (Josh). Drawn earlier as its own card: "Ask the next person you meet." *Come si chiama?* Earlier versions he turned down: Try it as "next time" (confusing), and with a red outline (a warning color).
- **Open the lesson.** A link from the sheet to the lesson behind a topic. Josh: "might be something to bring back".

## The sheet's own layout

- **The first card's headline sits at the top of the sheet, level with the close button** (Josh: "your When you Introduce Yourself moves up to the level of the close button"). Its phrases follow in the card right below; later cards keep their headlines inside.
- **A close button at the top right** (a small round ✕ in the mock-ups). **No "Done" at the bottom** (Josh).
- **No picture inside the sheet** (Josh: "no person face").

## Color

- **Cards are sage green** (#e2e8d2 in the mock-ups). One color for both countries.
- From a study of eight against the tan they started in (white with a thin line, paper sheet with white cards, sage, pale teal, blue-grey, marigold, soft clay; all on the page). Josh asked for the cloud session's preference, it chose sage (holds under both a muted and a saturated portrait; green is already the learner's color), and Josh said "ok".
- Per-country colors (marigold for Mexico) were considered and set aside to keep one scheme; an easy swap later.
- **No red for a card** (Josh: it reads as a warning).

## Rules (all Josh's)

- **One topic per card, no footer on a card.** "Just introductions or ordering": no Try it line, note or second topic under a card.
- **Whole sentences, no blanks** ("the blanks are distracting").
- **The translation goes under the language line**, not beside it.
- **Lines in the order they're said:** the question, then the answer (Josh, of *Me da un tamal* shown above *¿Qué le damos?*: "reverse natural order").
- **Plain cards.** The bubbles-and-green-bands round was "too overthought"; the first pale version looked "as if they don't deserve to be there".
- **Weight:** the explained layouts were "too dense", one-line pointers "too compact". The summary card with two or three phrase lines is the middle.
- **No audio, and no replaying a moment** (his least favourite part of the 15 November cards).
- **No snippet of what happened by itself.** Josh: "what pedagogically is happening here? just showing a snippet of what happened? not the goal - the sheet is to instruct".
- **Nothing about the next visit** ("Next time is confusing").
- **No city name or day of the week** on the sheet.

## How many "When you…" cards the lessons give

Every non-cultural lesson was read: 77 (Italy first set 14, Mexico 25, Italy later sets 38). Each has a "How to…" line that turns into a "When you…" headline, so 77 at most.

| Lesson set | Lessons | Natural "When you…" | Formal and informal instead | Strained |
|---|---|---|---|---|
| Italy, first set | 14 | 13 | 1 | 0 |
| Mexico | 25 | 23 | 2 | 0 |
| Italy, later sets | 38 | about 30 (2 of them formal) | | about 8 |

The first two rows are a count; the later-sets split is the cloud session's judgement from reading each lesson. The strained ones are grammar with no situation behind it (*me lo*, *glielo*, *ne*, *che*, *cui*, *nessuno*).

- A headline is a situation, and a situation can span lessons. With one topic per card, each card takes one lesson: "When you ask the price" (How much) and "When you pay by card" (Card or cash) are two cards.
- **Gaps:** no paying lesson was found in Mexico's `lessons.json`; Italy's first set has no goodbye lesson.
- Italy and Mexico share about eight situations (hello, how are you, name, where you're from, time here, when you're lost, ordering politely, ordering more than one).
- A first sorting of the 77 by what they teach (a choice of two 19, an opening you finish 20, a small word 12, a line you hear and its answer 9, a whole phrase 7, built unlike English 6, numbers and letters 4) is on the page under the dense round. It was made for layouts that were dropped. Its "choice of two" row shows that Formal and informal is one case of a wider card: hello by the hour, one or several, *vorrei* or *prendo*.

## The assessment, and what was wrong with it

Josh asked the cloud session to "assess the design/card/idea so far". It led with five weaknesses and no verdict. Josh questioned three of them, and two did not hold up. He then read the whole as "this is not worth doing", which the session had not meant, and paused the work.

| The session said | After Josh's questions |
|---|---|
| "It will repeat": the same card every time you order. | **Withdrawn.** Josh: "why would you do this". It assumed a picker nobody would build. The real requirement: the sheet remembers what it has shown. A visit touches several topics, a card can retire once its lesson is done, a lesson has four examples and three practice pairs, and cards needn't come from the conversation. |
| "It dropped the most valuable thing: your own mistakes." | **Withdrawn.** Josh: "how is this measured". It isn't; it was an opinion stated as fact. In this game Beginners mostly read or tap an offered answer, the mistakes detected are unreliable (B26), and nobody knows whether the old sheet's corrections were read or stuck. |
| (Josh: "does most immersion learning come from hearing your mistakes or the proper speaking") | From the proper speaking. Input does most of the work; correction is a smaller help, mostly for accuracy, and most real-life correction is itself a model of the right form. So showing the proper phrases is the approach that fits. No agreed number for the split. |
| Reading alone teaches little; producing a phrase beats seeing it. | Stands, as the argument for a footer (Try it), not against the sheet. |
| The pick is undesigned. | Stands, as the next piece of work. |
| It's a Beginner's sheet. | Stands; Beginners are who the game is being built for now. |

**The session's verdict, given when Josh asked:** worth doing. The lessons are written and judged, the app has a sheet and a goodbye that ends the visit, showing the proper phrases right after they were used is how immersion works, and it is Josh's lesson mapping ("you ordered coffee - want to learn more about ordering") in its simplest form. Smaller points it raised that were not discussed: each character has one `here` line, so About this place would repeat on a second visit; a sheet after every goodbye is ceremony unless it sometimes stays away (learn.md: "no ceremony"); the book mid-conversation still opens the old sheet, which has corrections and words this one doesn't.

## 23 November: six card types, one card to a sheet

Drawn at the top of the "Lesson Door Sheet" page, with jump links to the closed design, the color study, the rules and what's open.

**Three new types (Josh):** asked to go from three types to five, he offered "vocab - 5 nouns; verbs - 3 verbs - culture fact", then named the first two "Vocabulary: things and Vocabulary: actions".

| Type | What it holds | Example headline |
|---|---|---|
| When you… (closed) | one lesson's phrases under the situation | When you introduce yourself |
| Formal and informal (closed) | the two forms, one above the other | Formal and informal |
| About this place (closed) | one fact about where you were | About this garden |
| Vocabulary: things (new) | five nouns, each with its article, English under each | Vocabulary: things |
| Vocabulary: actions (new) | three verbs, English under each | Vocabulary: actions |
| Culture (new) | one culture fact | Culture |

That is six; Josh asked for five and has not said which five, or whether six stands.

**Four more, later the same day.** Asked for suggestions, the cloud session offered eight; Josh: "these are good", of four. All drawn on full person screens, one card each.

| Type | What it holds | Example | Where content already exists |
|---|---|---|---|
| A saying | one idiom, its literal words, what it means | *A falta de pan, tortillas.* / No bread, then tortillas. / You make do with what you have. | `content/<country>/idioms.json` (120 each) |
| A word from here | one local word | *kolaval* / thank you, in Tsotsil | each city file's `localTouches` |
| This or that | a choice of two that isn't formal and informal | *Buongiorno!* until the afternoon / *Buonasera!* from about four | about 19 lessons |
| A small word | one little word, shown in a sentence or two; the headline names it ("A small word: allora") | *Allora, due cappuccini e due cornetti?* | about 12 lessons |

Not picked from the eight: Vocabulary: descriptions, Numbers, Unlike English, What you'll hear. Ten types are now drawn.

**"When you…" examples from the lessons.** Josh asked for a sublist; 18 were pulled, each two or three of the lesson's own example lines in spoken order (hello, how are you, introduce yourself, where you're from, don't understand, need a word, order, ask the price, pay; Mexico: goodbye, someone calls you, get past, walk into a shop, order, "with everything?", something small; later Italy: is it allowed, ask about a building). Most lessons hold four examples as two short exchanges, so a two-line card lifts whole. Mexico has a goodbye lesson and no paying lesson; Italy's first set the reverse.

**Rules added today (Josh, each a correction of the cloud session's drawings):**

- **One card to a sheet.** "you put multiple cards on one page". The 17 November sheets held two; this replaces that, and settles "how many cards a sheet holds" at one.
- **Card types stay separate.** "do not combine card types". The session had folded About this place and "Something she mentioned" into one Culture card.
- **One style for every type.** "do not diverge from styles *weird white boxes*". The session had drawn nouns and verbs as white tiles inside the sage card. Every card is the closed one: sage, the headline, rows with the English under each.
- **The person screen stays as it is** behind the sheet, settings button included (the session had dropped it).

**Unchanged:** sage #e2e8d2 for the card and the close button (measured in the new pictures after Josh asked whether the colors had changed), the headline level with the close button, no Done, no picture in the sheet, closing returns to the place list.

**The session's own notes, not Josh's decisions:** Culture is drawn as a fact about how people live there (families speaking Tsotsil at home; the passeggiata), About this place as a fact about where you stood. Each city file already has `food`, `customs` and `localTouches` lists that nothing in `lib/` reads; they could supply Culture cards. The vocabulary cards hold bare words, which the "whole sentences" rule (written for phrase cards) does not cover; Josh has not ruled on that.

**Open now:** which five (or all six); where each type's content comes from and how a card is picked, now that a sheet shows one; the footer candidates (Try it, Open the lesson); whether Words and "Something she mentioned" from 15 November are retired by the new types; the Rules and "Three card types" sections lower on the page still describe 17 November.

## Still open

- **The pick:** which topic wins when a visit touched several; what the sheet remembers having shown; what fills it when the conversation gives nothing.
- **The footer** (above): whether there is one, and which candidate.
- **How many cards a sheet holds.** Two are drawn on each.
- **Words** and **Something she mentioned** (the history card). Josh said their content "seemed ok" in the 15 November round; neither is in the closed three.
- **Visits that end without a goodbye** (the back button, an edge swipe): whether the sheet shows. Whether it shows after every visit.
- **The old Learn sheet behind the book** (after-conversation.md: "one Learn page, not two").
- Noticed in the mock-ups: Doña Juana's portrait has a painted sign reading "Comedor La Esperanza", while the place is named "Comedor Doña Juana" in `content/es-mx/cities/san-cristobal-de-las-casas.ts`.

## What was tried and dropped on 17 November

Thirteen types in three groups (you / here / next); topic cards in seven layouts; one-line pointers; the exchange plus one line of why; two families (what happened / what teaches); speech-bubble and green-band styling; Try it as "next time", as a pattern variation, and as its own card; a picture strip inside the sheet; a "Done" button; tan cards. All are on the page, marked as out.
