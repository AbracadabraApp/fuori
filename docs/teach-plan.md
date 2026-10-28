# Teach plan: a model syllabus and a teach agent in Learn

2026-10-21 · Josh · Draft. **Step 1 done for both countries (2026-10-22):** Italy: `content/it/syllabus.json`, `content/it/syllabus-words.csv`, readable `docs/syllabus-it.md`. Mexico: `content/es-mx/syllabus.json`, `content/es-mx/syllabus-words.csv`, readable `docs/syllabus-es-mx.md`. The teach agent is not built. Two agents with different jobs:

1. **Magda the syllabus builder** (placeholder name), run offline once per country: reads the books and writes a model syllabus for Fuori as data.
2. **The teach agent**, live in the Learn area: never sees the books; reads the syllabus and the learner's history and decides what to teach next and how.

The books are in `books-private/` in the repo folder on Josh's laptop (git-excluded, so not on GitHub); Magda runs there. The syllabus she writes is committed and is what the app and the teach agent use.

## Lessons and missions: the direction (Josh, 2026-10-27)

Agreed with Josh after a trial lesson (`content/it/prompts/lesson.md`, `tests/experiments/lesson.mts`, unit a1-15) and a comparison of four ways to make lessons:

- **Lessons come from the syllabus, adapted to the game** (option D). The syllabus sets the order and the content (its frames, model exchanges, plain explanation, the real trap); a lesson is **one step** of a unit (a1-15 has four: *ho* + participle, the irregulars, *sono* for going, time words). The game supplies the people and places: the exchange's "barista" becomes a character the learner knows, in their voice. Lessons can be made ahead per country and checked once.
- **The learner's history only places them** (where to start, what's solid). A lesson never quotes their mistakes or reports on them (Josh: opening on "you said *ho vedere*" was "harsh", read like "surveillance", and pinned the line on the wrong person; "it doesn't need to be true, it just needs to be a good lesson").
- **Missions are personal** (option C): built on what the learner already says plus the lesson's step, at their places with their people ("go back to Bar Mattina and tell Luisa what you had yesterday"). Doing it well needs a "can say" record beside the mistakes the notes keep today.
- **A mission comes after a lesson:** the lesson's "take it to town" becomes the unit chip's mission ([diario.md](diario.md) → chips with missions). Either can stand alone.
- **One mission, several ways in (Josh, 2026-10-28):** a mission is one record, shown wherever it fits, with the same status everywhere: at the end of its lesson, in the Missions area by topic, among the day's suggestions in a city with the right kind of place, and the other way round, a mission links back to its lesson ("learn it first"). A mission done before its lesson counts: the step is met or solid, and the lesson can be shorter or skipped.
- **Recommended first slice (Claude, 2026-10-28):** steps for Italy's first five A1 units; lessons made ahead from the syllabus; Magda live on rails (she gets the step's three practice questions and model answers, asks, listens, recasts); one mission per step, in Learn. Then the day's suggestions, then the progress table (met / studied / solid; a new table, created on first use) and the chips.
- **The chip ties them:** met (came up in a conversation), studied (lesson done), solid (a mission or any conversation shows the learner said it themselves).

Rejected: lessons improvised from the learner's history (A: too many verbs, mistakes up front, facts wrong); improvised from the unit and level (B: a stepping stone; contrasts with things not taught, generic answers).

## 1. Magda: building the model syllabus

**Inputs:** the book texts in `books-private/` (Progetto 1a/1B/2/3, Proudfoot; ELE Actual, Español en Marcha, the PCIC) and what's already distilled in `docs/research/syllabus/` and `docs/research/syllabus-es/` (unit summaries, the function map, the level word lists, chips-vs-syllabus).

**Output:** `content/<country>/syllabus.json` and a readable `docs/syllabus-<country>.md` for Josh to review (fields below, in the prompt).

**Where it runs:** where the books are (`books-private/` on the laptop): a Claude Code session at high effort, reading one source at a time and writing working notes to `books-private/syllabus-working/` as it goes, so a long run can resume. The result is committed like any other content. Once for Italy, once for Mexico, covering every CEFR level the sources cover (A1 to C1), not just beginners. Josh's call (2026-10-21): the books are the source to learn from, including their dialogues and exercises as models; no self-imposed copyright limits on how Magda uses them.

```
You are Magda, an experienced teacher of {language} to English-speaking adults.
Design the syllabus for Fuori: a voice-first game where a newcomer who has come to
live in {country} learns {language} by talking with people at real places (bars,
markets, shops, stations, a landlady, neighbours). Characters speak only {language},
help in English when asked, and recast mistakes in role.

SOURCES
Read every book in {books_dir} in full, cover to cover: every unit, dialogue,
exercise, grammar note, word list, answer key and transcript. The books are your
evidence; our summaries are not a substitute. Italy: Nuovissimo Progetto italiano
1a, 1B, 2 (and workbook), 3 (key and audio transcripts); Italian Grammar You
Really Need to Know (Proudfoot); English Grammar for Students of Italian; Beginner's
Guide to Italian; Le preposizioni italiane; Must-Know Italian Slang. Mexico: ELE
Actual A1, Español en Marcha, the PCIC (Plan curricular del Instituto Cervantes),
Seven Keys, Word Power. Work through one book at a time, writing working notes to
{books_dir}/syllabus-working/ so the run can resume.

Then, as cross-checks only:
- docs/research/{syllabus_dir}/: our earlier unit summaries, the function map,
  level-words-{country}.csv, grammar traps, prepositions, chips-vs-syllabus.
  Where they disagree with a book, the book wins; say so.
- {country_notes}: e.g. for Mexico communicating-in-mexico.md, mexican-words.csv;
  use Mexican forms, flag anything Spain-only.
- docs/learn.md (the 12 teaching principles), docs/flashcards.md, docs/teach-plan.md.

METHOD
1. Read each book in full, in order, and make a table of its units: can-do, situations,
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
- model_exchanges: 2–3 short exchanges (4–8 lines) in a real-life situation, as
  people here and a newcomer would really speak; adapt the books' dialogues freely
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
- situations: the real-life situations where this language is needed (at a bar,
  at the doctor, renting a flat), chosen by what a newcomer needs, not by the game
- recycles: frames and words from earlier units that this one reuses
- evidence: what in a real conversation shows the learner has it (used a frame
  unprompted; understood a line without asking)
- review: when to bring it back (after 1, 3, 7 conversations…)

ALSO
- A grammar inventory by part of speech and level: for each part of speech
  (articles, nouns, adjectives, pronouns, verbs by tense and mood, adverbs,
  prepositions, conjunctions, word order), what's introduced at each level and in
  which unit, so nothing is missed and nothing lands too early.
- One word list for all levels, A1–C1, in the shape of level-words-{country}.csv
  (lemma, part of speech, level, unit, theme): check and revise today's A1–A2 list
  against the books read in full, then extend it through C1.
- Coverage: check the game's beginner chips (chips-vs-syllabus.md) and the 20
  flashcard words against the units; say what's missing on either side.
- Decisions: every place the books disagree, what you chose and why.
- Gaps: situations a newcomer meets that no book covers (renting, the doctor,
  the post office, a phone contract), with a proposed unit for each.

Be concrete and right: every frame correct and natural for {country} today, every
level checked against the word list. Prefer fewer, solid units to many thin ones
(roughly 12–15 per level).
OUTPUT: syllabus.json (units, grammar inventory, A1–C1 word list, coverage, decisions, gaps) and a readable summary for review, one section
per level.
```

The syllabus is about the language and real-life situations only, not the game's places or mechanics (Josh, 2026-10-21). Connecting a unit to a place in town is the teach agent's job at run time.

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

1. Run Magda for Italy; Josh reviews. The syllabus is useful on its own.
2. Track met / studied / solid per learner from the memory notes that already exist.
3. The teach call and a Learn-area screen showing the next lesson; each Learn sheet keeps feeding it.

## Open

- Magda is a placeholder name for the builder; whether the teacher in Learn has a name, a face or a voice is undecided (`docs/learn.md`).
- Who reviews the Mexican syllabus (Josh has no Spanish).
- Whether a lesson's examples use the Learn voice (`docs/flashcards.md` → Sound) or the character's who'll hear them in town.
