# Learn 2.0: where the cards come from, how one is picked, how the set grows

2026-11-23 · plan by the laptop session, approved by Josh. Nothing built yet. The design it serves: [learn-sheet-2-design.md](learn-sheet-2-design.md).

## Context

Learn 2.0 is the one-card sheet that slides up after a character's goodbye (design: `docs/learn-sheet-2-design.md`, Josh's, settled in mock-ups; history in `docs/learn-sheet-2.md`). When finished it replaces the Learn link (the book) and the Learn 1.0 sheet (Josh, 2026-11-23). The design leaves the content open: where cards come from, how one is chosen, what the sheet remembers. Josh's goal for this plan: content that is **relevant to the visit when possible, useful backfill when not**; **no sheet on some visits**; a system that lets topics **grow, through new card types or organically**; the ten drawn types are **ten examples of an open set**, not a menu.

## What exists (from the survey)

| Source | What it gives | Tags it carries |
|---|---|---|
| Lessons: `content/it/lessons.json` (14 steps), `lessons-b1.json` (38), `content/es-mx/lessons.json` (25); `lib/lessons.ts` | `how_to`, 4 `examples` {role, place, said, en}, `notice`, `context`, `practice` | step id, example `place`; Mexico's unit ids are syllabus ids |
| Syllabus: `content/<c>/syllabus.json` (69 units each) | `frames` (with tu/Lei notes), `model_exchanges`, `grammar`, `vocabulary`, `common_errors` {wrong, right, why}, `culture` paragraph, `situations` | unit id `a1-01`…, level |
| `syllabus-words.csv` (it 3,906, es-mx 3,300) | lemma, pos | level, unit, theme |
| `content/it/grammar-help.json` (Italy only) | 136 Q&A, 117 recasts, 53 recipes, 96 English rewrites | unit, level |
| `culture.json` (it 31, es-mx 21) | facts, words | city, place, topic (food/history/traditions/art/rivalry) |
| `idioms.json` (120 each) | text, picture (literal), meaning | level, `fits` (free text); `turns[].idiom` records one said in a visit |
| City files `content/<c>/cities/*.ts` | `food`, `customs`, `localTouches` (unused by anything), each person's `here` line (out of the prompt since today) | city, place, place kind |
| Learn 1.0 page `lib/learn.ts` (`prompts/learn.md`) | per visit: corrections, `words.things` {word, en, plural}, `words.doing` {infinitive, en, form}, goodToKnow | written ahead in memory by `lib/learn-ahead.ts` after learner turn 4+, never stored |
| Magda: `characters/magda.ts`, `lib/tutor.ts`, her prompt | no curriculum of her own; her curriculum is the syllabus (`grammar_inventory` authored as "Magda", 155 points) | |
| End of visit: `/v1/conversations/{id}/end` → `lib/remember.ts` | `conversations.review` {items, mistakes, missed, english}; `character_memories` | no record of lessons touched or cards seen |

Gaps: no shared topic key; no record of what the visit was about in lesson terms; no record of what a learner has been shown; `/end` fires after the person screen has gone.

## The design

### 1. A card is data, one shape, open kinds

```ts
type LearnCard = {
  id: string                 // stable: "<source>:<ref>:<n>", or "visit:<conversationId>"
  kind: string               // "when-you", "a-saying", ... free string, NOT an enum anywhere
  headline: string           // English UI text: "When you order", "A small word: allora"
  rows: { text: string; en: string; lang?: true }[]   // language line, English under it
  note?: string              // one plain line: a fact, a saying's meaning
  level: 'A1'|'A2'|'B1'|'B2'|'C1'
  keys: string[]             // what it's about: "unit:a1-07", "lesson:a1-03-2", "city:palermo",
                             // "place:palermo/orto-botanico", "kind:bar", "idiom:<text>", "theme:<csv theme>"
  source: {                  // the footnote: where the card came from. Never shown to the learner
    from: string             // "lesson", "syllabus", "grammar-help", "idioms", "culture", "city", "here", "visit"
    ref: string              // the exact place: "it/lessons.json#meeting-people-2/examples[0,1]",
                             // "es-mx/syllabus.json#a1-03/common_errors[2]", "it/cities/palermo.ts#orto-botanico/here",
                             // "conversation:<id>#turns[5,7]"
    redrafted: boolean       // true when the wording isn't the source's own
    by?: string              // what wrote it: "learn-cards.mts@<prompt version>" or "learn-card@<prompt version>"
  }
}
```

**The footnote is for building, not for learners** (Josh, 2026-11-23: "for building it would be good to have a footnote to trace the source of card if it was coming froma lesson, syllalbus, etc - not shown to user"). `GET /v1/learn/card` leaves `source` out of what it sends the app. It is kept in the bank file, in `learn_cards_shown.card`, and is printed on the sample page, the replay run and the growth script, so any card can be traced back to the lesson line, syllabus entry or turn it came from. A picked card redrafted for a visit keeps its bank `ref` and adds the turns it borrowed (`ref` gains `; conversation:<id>#turns[...]`).

The app draws every card with one view (headline + ✕, sage block, rows, optional note); `kind` is never switched on in Swift. A new kind is new data, not new screen work. The ten drawn types are the first ten values of `kind`, not a list the code knows.

**The ten drawn cards are models, not content** (Josh, 2026-11-23: "the 10 examples do not need to be complete example even for the 10 cards - the writer could redraft them - but the 10 are models"). They live in one file, `content/<country>/prompts/learn-card-models.md` (each: kind, headline, rows, note, and one line on what makes it a good card), and are shown to both the bank cutter and the visit writer as the standard to write to. They are not themselves cards in the bank, they don't fix what a kind must hold, and a card of the same kind can be redrafted freely: a When you… with two lines or three, a Culture fact phrased differently, a This or that on any choice. A new kind is judged against the models' qualities (one topic, plain, short, English under each line), not their exact layout.

`keys` is the shared topic key the survey found missing. It doesn't need one vocabulary: the syllabus unit id is the spine (it already joins syllabus, words, grammar-help, flashcard deck and Mexico's lessons); Italy's lesson steps get their unit by a one-off mapping in the bank build; places and cities are their ids; anything else is a free key that the picker reads as text, not matches.

### 2. Two places cards come from

**The bank** (`content/<country>/learn-cards.json`, hand-written content as data, checked in): cards cut once from the sources above by a build script, `scripts/learn-cards.mts`, which calls Claude through `lib/claude.ts` with `logUsage`, one source at a time, with the models as its standard; it redrafts from the source (not a copy of the lesson lines or the city list), and writes cards with their `keys`, `level`, `source`. Rules the cutter enforces by code: row counts (≤3 phrases, ≤5 things, ≤3 actions), English under every row, no blanks. Per source, roughly:

| Source | Kinds it yields (examples, not a limit) |
|---|---|
| lessons' `examples` + `how_to` | When you…, Formal and informal, This or that, A small word |
| syllabus `frames`/`model_exchanges`/`common_errors`/`culture` | When you…, This or that, Culture, (new) "Not X but Y" from common errors |
| grammar-help (Italy) | Formal and informal, short Q&A cards |
| idioms.json | A saying |
| culture.json, city `food`/`customs` | Culture |
| city `localTouches` (vulgar ones dropped) | A word from here |
| people's `here` lines | About this place (cut into card-sized facts, fact-checked as those lines were) |

Re-running the script per source adds cards; ids are stable, so a re-run doesn't duplicate or churn what learners have seen.

**The visit** (made at the end of a visit, stored with learner data, not in the bank): cards only this visit can make. Vocabulary: things and Vocabulary: actions (from the visit's words, as Learn 1.0 already extracts them), "the saying the character used" when `turns[].idiom` is set, and any card the writer judges the visit needs that the bank lacks.

### 3. Picking: relevant first, backfill second, sometimes nothing

One call per visit, **replacing Learn 1.0's page call** (same moment, `lib/learn-ahead.ts`, kicked off from `/v1/turn` after each learner turn from the 2nd on, cached by conversation id + turn count). New prompt `content/<country>/prompts/learn-card.md`, new `lib/learn-card.ts`:

1. **Shortlist by code** (no Claude, no word lists): bank cards at or below the learner's level, ranked by key overlap with the visit's own keys (city, place, place kind, the units of lessons done, the idiom said). About 30 headlines + ids.
2. **The writer** gets the transcript, the shortlist, and the models. A picked bank card may come back redrafted for this visit (its lines swapped for ones the character actually said, its headline fitted), keeping its id. It returns one of:
   - `{ pick: <bank card id>, because }`: a bank card this visit actually involved;
   - `{ make: LearnCard }`: a visit card (vocabulary from what was said, the saying used, or a new kind with the same shape);
   - `{ none }`: the visit gives nothing worth a card.
   This is the "you ordered coffee, want to learn more about ordering" mapping from `docs/after-conversation.md`, done as a judgement, not matching.
3. **Backfill** when the writer says none: a bank card that stands by itself (About this place for where you stood, Culture or A word from here for the city, A saying at the level), chosen by code from the shortlist.
4. **Whether the sheet shows** (by code, at the goodbye): show a relevant card (pick or make) whenever there is one; show a backfill card only if no sheet appeared in the last 3 visits (Josh, 2026-11-23); never after the welcome, a Magda lesson, or a visit that ended by back or swipe; never when level up is being offered that visit (level up wins, as `docs/after-conversation.md` already says). So most visits get a card that is about them, and the sheet doesn't become a ceremony.

Repeats and rotation are left until play shows them (below).

### 4. Remembering what was shown

New table `learn_cards_shown` (learner_id, conversation_id, card_id, kind, card jsonb, how 'pick'|'make'|'backfill', shown_at, closed_at). Migration in `scripts/db-migrate.mjs` first, code after (CLAUDE.md). It is a log, not memory: it serves the "last 3 visits" rule, the source footnote and the growth loop below. `closed_at − shown_at` is the only signal of whether a card was read.

**Memory is a nice-to-have, built when play shows the need** (Josh, 2026-11-23: "memory is a nice to have but not sure it would be needed unttil we see the issue - not a design decision - just input"). So the first version doesn't skip cards already shown or rotate kinds. With a bank of hundreds of cards per country and a writer reading each visit, repeats may be rare; if Josh sees one in play, the log already holds what's needed to filter shown cards out of the shortlist.

### 5. How the set grows

- **New kinds by hand:** add a cutter for a new source or a new kind to `scripts/learn-cards.mts`, run it, check in the cards. No app change.
- **Organically from play:** visit cards (`make`) are stored in `learn_cards_shown.card`. A script, `scripts/learn-cards-made.mts`, lists them grouped by kind and headline with counts and time open; the ones Josh likes are promoted into the bank (given keys and a stable id) with his yes. The writer may invent a new kind in the same shape (Josh, 2026-11-23: yes, logged for promotion). A new kind shows up here first, so the open set grows from what visits needed, and Josh decides what becomes permanent.
- **More sources:** the bank build is per source, so adding Mexico's missing grammar help, Magda's grammar inventory points, or new lessons just adds cards with the same keys.

### 6. The phone

- `PersonView`: at `.finished` (where it now waits 1.5 s and dismisses, `PersonView.swift:72-78`), ask `GET /v1/learn/card?conversation=<id>`; it returns the ready card or 204 at once (never waits on Claude). Card → present the sheet; 204 or slower than the existing 1.5 s → dismiss as today. Closing the sheet dismisses through the same leave path; `POST` the close time.
- One new view, `LearnCardSheet` (FuoriFeatures/Learn), drawing `LearnCard`. Sage becomes a token in `design/tokens.json`. `lang`-tagged rows get the learned language's tag.
- `docs/state-machines.md` updated in the same commit (the conversation's end gains a state).
- Josh sees one screenshot of the real sheet before it's built out (rule).

### 7. Retiring Learn 1.0 (last, after Josh has played 2.0)

Remove the book from `ConversationControls`, `LearnSheet.swift`, `LearnSource`, `/v1/learn`, `prompts/learn.md`, and the ahead page. Learn 1.0's corrections are not carried over (undecided; `review.mistakes` still reaches Magda's study file).

## Build order

1. **Bank first, Italy and Mexico:** `LearnCard` type in `lib/learn-card.ts`, `scripts/learn-cards.mts` cutting lessons, idioms, culture.json, city lists and `here` lines; the cards checked in. Josh reads a sample page of cards (an artifact) before anything else is built.
2. **Server:** migration for `learn_cards_shown`; the writer prompt + `lib/learn-card.ts` (shortlist, call, backfill, show rule) run ahead from `/v1/turn`; `GET /v1/learn/card` and the close `POST`; `/v1/content` untouched.
3. **App:** `LearnCardSheet`, the `PersonView` change, the token; one screenshot to Josh; build + CI.
4. **Josh plays** on his phone (after his yes to install), both countries.
5. **Growth script** (`learn-cards-made.mts`) once there are visits to read.
6. **Retire Learn 1.0.**

Syllabus `frames`/`common_errors` and grammar-help join the bank in a second pass, once the first sources have been played.

## Rules this keeps

Nothing language-specific in code (cards and prompt live in `content/<country>/`; `npm run test:language`); every Claude call through `lib/claude.ts` with `logUsage` (`test:claude-usage-log`); no phrase lists: relevance is the writer's judgement, the rest is ids and levels; Josh's card rules (one card, plain, whole sentences, English under, spoken order, no audio, no next visit, no city or day) are enforced by the cutter and the writer's output schema.

## Verification

- `npx tsc --noEmit`, `npm run lint`, `npm run test:language`, `npm run test:claude-usage-log`, `npm run test:prompt`.
- New `npm run test:learn-card` (code only): bank file shape and row limits per country; shortlist never returns a shown card or one above level; show rule (welcome, lesson, back/swipe, level up → no sheet; backfill spacing); `GET /v1/learn/card` returns 204 before the card is ready.
- Run against real visits: replay 20 stored conversations per country through the writer and print, side by side, transcript summary and the card chosen (pick/make/backfill/none), so how often a card is relevant is counted, not judged. Then `npm run smoke:live` both countries and Josh plays.
- iOS: `cd ios && make build`, CI; one screenshot of the sheet for Josh.
