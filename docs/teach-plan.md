# Teach plan: a model syllabus and a teach agent in Learn

2026-10-21 · Josh · Draft, not built. Two agents with different jobs:

1. **Magda the syllabus builder** (placeholder name), run offline once per country: reads the books and writes a model syllabus for Fuori as data.
2. **The teach agent**, live in the Learn area: never sees the books; reads the syllabus and the learner's history and decides what to teach next and how.

The books stay on Josh's laptop (`books-private/`, git-excluded). Only the syllabus, in our own words, goes into the repo and the app.

## 1. Magda: building the model syllabus

**Inputs:** the book texts in `books-private/` (Progetto 1a/1B/2/3, Proudfoot; ELE Actual, Español en Marcha, the PCIC) and what's already distilled in `docs/research/syllabus/` and `docs/research/syllabus-es/` (unit summaries, the function map, the level word lists, chips-vs-syllabus).

**Output:** `content/<country>/syllabus.json` and a readable `docs/syllabus-<country>.md` for Josh to review. Each unit:
- `id`, `level`, `order`
- `can_do`: one line from the learner's side ("Order at a bar and pay")
- `functions`
- `frames`: 3–8 short reusable chunks (*Vorrei…*, *Quanto costa…?*)
- `grammar`: only what the frames need
- `vocab_themes`: linked to `level-words-<country>.csv`
- `places`: kinds of place in the game where it comes up naturally (bar, market, station)
- `evidence`: what in a real conversation shows the learner has it ("said a *Vorrei…* request unprompted")

**Where it runs:** on the laptop, where the books are: a Claude Code session or a scripted agent with file access to that folder only, no web. The result is committed like any other content. Once for Italy, once for Mexico.

```
You are Magda, a language teacher designing the syllabus for Fuori, a game where a
newcomer to {country} learns {language} by talking with people in real places.

Read the course books in {books_dir} and the notes in docs/research/syllabus/.
Build a syllabus for A1–A2 that follows the books' order of teaching but is
reordered for life here: a newcomer needs the bar, prices and greetings in week one,
not in Unit 4.

For each unit give: id, level, can_do (one line, learner's view), functions,
frames (3–8 short reusable chunks), grammar (only what the frames need),
vocab_themes (link to level-words-{country}.csv), places (kinds of place in the
game where this comes up naturally), evidence (what in a real conversation shows
the learner has it).

Rules:
- Write everything in your own words. Quote the books only for short everyday
  phrases; never copy dialogues, exercises or explanations.
- Every frame must be something a person here really says.
- Note where the books disagree on order, and which you followed and why.
- End with gaps: situations a newcomer meets that no book covers.
Output: syllabus.json (the schema above) and a readable summary.
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
