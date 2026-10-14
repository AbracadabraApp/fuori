# Study export demo (M2 experiment)

Written 2026-10-13 from a discussion with Josh. **A demo to see what we get, not a commitment to finish or ship.** These are extra tools for learners who want them, not part of the core game. Background and the decision behind it: [Ideas → Study export, not study tools](ideas.md#study-export-not-study-tools-josh-2026-10-13).

## The question

Fuori already derives study material from every conversation: the transcript, the review log's words and phrases worth keeping, and the mistakes with a better way to say them, each tied to a person, a place and a city. **Is that material good enough to study from when it's handed to a study tool that already exists?**

We use existing products rather than building our own:
- **Gemini Notebook** (formerly NotebookLM) is the main test. It has no API, but it takes documents as sources and makes flashcards, quizzes, mind maps and Audio Overviews (a podcast-style conversation, in 80+ languages) from them.
- **Anki** is a second, smaller test: its import takes a simple spreadsheet-style file and gives offline spaced repetition.

## What Fuori already has

- Every conversation is recorded: who said what, with English, in the `conversations` table (`lib/recording.ts`).
- When a conversation ends, the review log is written next to it (`lib/memory.ts`, `ReviewLog`): `items` (phrase, English, why it's worth keeping) and `mistakes` (what the learner said, the better version, why).
- `/api/admin/conversations?format=text` already prints transcripts for reading.
- **Caveat:** the review log is still debug-only and its picks haven't been checked. The demo is partly a way to check them.

## The demo

### 1. A study pack export (Claude, about half a day)

A script or admin format that writes one document for a date range, for one learner:

- **Header:** learner, dates, cities visited, number of conversations.
- **One section per conversation:** who (name, role), where (place, neighbourhood, city), when.
  - **Words and phrases:** the phrase, its English, why it's worth keeping, and the line in the conversation where it came up.
  - **Things to say better:** what was said, the better version, why.
  - **The conversation:** the full transcript, with English.
- **A short instruction block at the top** for the notebook ("These are a learner's real conversations in Italian at about A2; make study material from the words, phrases and corrections, using the people and places as context").

Format: Markdown, which pastes cleanly into a Google Doc or uploads as a text source. Same for both countries; nothing language-specific in the code (the pack's language and app name come from the country pack).

Second file, same data: a two-column CSV for **Anki** (front: the phrase and the line it came from; back: English and who said it where). Text only for the demo; the character's voice as audio is a later step if the demo earns it.

### 2. Try it (Josh, about an hour)

With a week or two of real conversations:
1. Create a Gemini Notebook and add the study pack as a source.
2. Ask for flashcards and a quiz.
3. Make an Audio Overview **in Italian**, ideally asking for a slow, simple level. This is the interesting one: a podcast about your own week in Rome.
4. Try a mind map or report, if curious.
5. Import the CSV into Anki and study a few cards.

### 3. Judge it

- **Cards:** of 20 flashcards, how many would you actually keep?
- **Context:** do the cards and quiz use your real conversations (Franco, the artichokes, Trastevere), or could they be from any textbook?
- **Audio Overview:** is the Italian at a level you can follow? Does it get things wrong about what happened?
- **The review log itself:** reading the pack, are its picks the right ones? (This feeds the M1 check that's still open.)
- **Effort:** is exporting and uploading by hand acceptable for an occasional "study my week" tool?

**Done when:** Josh has tried the pack in Gemini Notebook and Anki and decided keep, change or drop.

## Not in the demo

- No study features inside the game: no drills, streaks or quizzes in Fuori (Josh's decision).
- No automatic upload: Gemini Notebook has no API; the learner uploads the file.
- No in-app button yet: the export runs from a script or the admin route. A learner-facing "Export my study pack" comes only if the demo is worth it.
- No audio in Anki cards yet.

## Things to know

- **Privacy:** the pack contains the learner's own spoken lines and goes to Google when uploaded. Fine for Josh's own conversations; anyone else would need to choose to export, with a plain note about where it goes.
- **Magda:** the learner profile is hers (see [Game design → Magda](02-game-design.md#magda-your-teacher-in-seattle)). A study pack is a different thing: a learner's own material for their own study. They can share the same review log underneath.
