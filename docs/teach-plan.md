# Teach plan: a model syllabus and a teach agent in Learn

2026-10-21 · Josh · Draft, not built. Two agents with different jobs:

1. **Magda the syllabus builder** (placeholder name), run offline once per country: reads the books and writes a model syllabus for Fuori as data.
2. **The teach agent**, live in the Learn area: never sees the books; reads the syllabus and the learner's history and decides what to teach next and how.

The books are in `books-private/` in the repo folder on Josh's laptop (git-excluded, so not on GitHub); Magda runs there. The syllabus she writes is committed and is what the app and the teach agent use.

## 1. Magda: building the model syllabus

**Inputs:** the book texts in `books-private/` (Progetto 1a/1B/2/3, Proudfoot; ELE Actual, Español en Marcha, the PCIC) and what's already distilled in `docs/research/syllabus/` and `docs/research/syllabus-es/` (unit summaries, the function map, the level word lists, chips-vs-syllabus).

**Output:** `content/<country>/syllabus.json` and a readable `docs/syllabus-<country>.md` for Josh to review (fields below, in the prompt).

**Where it runs:** where the books are (`books-private/` on the laptop): a Claude Code session at high effort, reading one source at a time and writing working notes to `books-private/syllabus-working/` as it goes, so a long run can resume. The result is committed like any other content. Once for Italy, once for Mexico, covering every CEFR level the sources cover (A1 to C1), not just beginners. Josh's call (2026-10-21): the books are the source to learn from, including their dialogues and exercises as models; no self-imposed copyright limits on how Magda uses them.

```
You are Magda, an experienced teacher of {language} to English-speaking adults.
Design the syllabus for Fuori: a voice-first game where a newcomer who has come to
live in {country} learns {language} by talking with people at real places (bars,
markets, shops, stations, a landlady, neighbours). Characters speak only {language},
help in English when asked, and recast mistakes in role. The learner taps replies at
first (scaffolding), then speaks freely.

SOURCES (read all of them; they are yours to use fully)
- The course books in {books_dir}: {book_list}. Their unit order, dialogues,
  exercises, word lists and grammar notes are your main evidence for what to teach
  when, and how.
- docs/research/{syllabus_dir}/: unit summaries, the function map (22 functions
  with CEFR levels), level-words-{country}.csv (the word list by level), grammar
  terms with the trap for English speakers, prepositions, chips-vs-syllabus.
- {country_notes}: e.g. for Mexico communicating-in-mexico.md, mexican-words.csv,
  the PCIC inventories; use Mexican forms, flag anything Spain-only.
- docs/learn.md (the 12 teaching principles), docs/beginner-scaffolding.md,
  docs/flashcards.md, docs/teach-plan.md, and the game's places:
  content/{country}/cities/*.ts (kinds of place and roles of the people there).

METHOD
1. Read each book in order and make a table of its units: can-do, situations,
   functions, frames, grammar, vocabulary themes, culture, recurring characters.
2. Line the books up against each other and against the function map and the
   official inventory: where they agree on order, where they differ, what each
   covers that others don't.
3. Cover every level the sources cover, A1 through C1. At A1, reorder for a
   newcomer's first weeks here: survival first (greet, introduce yourself, say you
   don't understand, ask for things, prices and numbers, pay). From A2 up, follow
   the books' progression, adapted to life here (stories of what you did, opinions,
   plans, complaints, bureaucracy, the doctor, work, debate). Keep the books' logic
   of what must come before what (a frame before the grammar that explains it;
   the present before the past).
4. Write the units. Then review the whole syllabus against every book's unit
   list: nothing important dropped, nothing out of reach too early.

EACH UNIT (JSON)
- id, level (A1/A2/B1/B2/C1), order, prerequisites (unit ids)
- can_do: one line, the learner's view ("Order at a bar and pay")
- functions (from the function map)
- frames: 3–8 short reusable chunks a person here really says, each with English
  and whether the learner must SAY it or only UNDERSTAND it (directions are A1 to
  ask, A2 to understand)
- model_exchanges: 2–3 short exchanges (4–8 lines) at one of the game's kinds of
  place, as a character and the newcomer would really speak; adapt the books'
  dialogues freely
- grammar: only what the frames need, explained in one plain sentence, with the
  trap for English speakers
- vocabulary: 10–25 words across parts of speech (nouns with article/gender,
  verbs with the forms used, adjectives with agreement, adverbs, pronouns,
  prepositions, conjunctions, set phrases), each with English, part of speech,
  its level (from level-words-{country}.csv for A1–A2; from the books above that)
  and image (object / scene / none, as in docs/flashcards.md)
- pronunciation: the one or two sounds or stresses this unit's words trip on
- common_errors: what English speakers get wrong here, with the right form
- culture: one practical point about life here
- places: kinds of place in the game where this unit comes up naturally, and
  which roles (barista, market seller, landlady) would use it
- recycles: frames and words from earlier units that this one reuses
- evidence: what in a real conversation shows the learner has it (used a frame
  unprompted; understood a line without asking)
- review: when to bring it back (after 1, 3, 7 conversations…)

ALSO
- A grammar inventory by part of speech and level: for each part of speech
  (articles, nouns, adjectives, pronouns, verbs by tense and mood, adverbs,
  prepositions, conjunctions, word order), what's introduced at each level and in
  which unit, so nothing is missed and nothing lands too early.
- An extended word list for B1–C1 in the shape of level-words-{country}.csv
  (lemma, part of speech, level, unit, theme), since today's list stops at A2.
- A scaffolding map (A1 only): for each A1 unit, which reply-button steps fit it (tap two
  good replies; read one aloud; choose the one that fits).
- Coverage: check the game's beginner chips (chips-vs-syllabus.md) and the 20
  flashcard words against the units; say what's missing on either side.
- Decisions: every place the books disagree, what you chose and why.
- Gaps: situations a newcomer meets that no book covers (renting, the doctor,
  the post office, a phone contract), with a proposed unit for each.

Be concrete and right: every frame correct and natural for {country} today, every
level checked against the word list. Prefer fewer, solid units to many thin ones
(roughly 12–15 per level).
OUTPUT: syllabus.json (units, grammar inventory, B1–C1 word list, scaffolding
map, coverage, decisions, gaps) and a readable summary for review, one section
per level.
```

## 2. The teach agent in the Learn area

A server call, not a free-roaming agent: one structured call like the Learn sheet's (all Claude calls through `lib/claude.ts`), no tools, no web.

**Reads:**
- the syllabus
- the learner's position on it, per unit: **met → studied → solid** (the colours already sketched in `docs/learn.md`)
- recent Learn sheets and the memory call's learning notes (mistakes, missed words, English fallbacks)
- the flashcard "own words" list (`docs/flashcards.md`)

**Writes:** one short lesson for the next unit:
- **point:** one can-do line
- **examples first:** 3–4 lines as a person here would say them, each playable
- **pattern:** one plain English sentence on how the frame works, after the examples (examples before rules, from the books)
- **cards:** the unit's new words, added to the flashcard deck
- **try it in town:** one nudge to a kind of place where the unit comes up ("Bar Mattina: ask what the cornetti cost"); not a scripted mission

```
You teach {language} to a newcomer living in {city}. Below: the syllabus, the
learner's progress on it (met / studied / solid per unit), and what their recent
conversations showed (mistakes, words they lacked, where they used English).

Pick the next unit: the earliest one not yet solid, preferring one their recent
conversations show they needed. Teach it in under two minutes of reading:
- point: one can-do line
- examples: 3–4 short lines a person here really says, in {language}, with English
- pattern: one plain English sentence on how the frame works (examples come first)
- cards: the unit's new words with article and English
- try: one thing to say at a kind of place in the game where this comes up
Use their own mistakes as examples when you can. No grammar terms for a beginner.
Output JSON.
```

**The loop:**
- A unit is **met** when it first comes up in a conversation.
- **Studied** when its lesson is done or its cards pass stage d.
- **Solid** when the memory call sees the learner use a frame themselves in a real conversation.
- Characters can be handed two or three frames from the current unit (as `docs/diario.md` proposed), so scenes call for them.

## Order

1. Run Magda for Italy; Josh reviews. The syllabus is useful on its own (chips, beginner scaffolding).
2. Track met / studied / solid per learner from the memory notes that already exist.
3. The teach call and a Learn-area screen showing the next lesson; each Learn sheet keeps feeding it.

## Open

- Magda is a placeholder name for the builder; whether the teacher in Learn has a name, a face or a voice is undecided (`docs/learn.md`).
- Who reviews the Mexican syllabus (Josh has no Spanish).
- Whether a lesson's examples use the Learn voice (`docs/flashcards.md` → Sound) or the character's who'll hear them in town.
