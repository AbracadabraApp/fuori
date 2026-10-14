# Study export demo (M2 experiment)

Written 2026-10-13 from a discussion with Josh. **A demo to see what we get, not a commitment to finish or ship.** These are extra tools for learners who want them, not part of the core game. Background and the decision behind it: [Ideas → Study export, not study tools](ideas.md#study-export-not-study-tools-josh-2026-10-13).

## The question

Fuori already derives study material from every conversation: the transcript, the review log's words and phrases worth keeping, and the mistakes with a better way to say them, each tied to a person, a place and a city. **Is that material good enough to study from when it's handed to a study tool that already exists?**

We use an existing product rather than building our own: **Gemini Notebook** (formerly NotebookLM). It has no API, but it takes documents as sources and makes flashcards, quizzes, mind maps and Audio Overviews (a podcast-style conversation, in 80+ languages) from them. One file, dropped into Gemini. (An Anki CSV was planned as a second file; dropped by Josh, 2026-10-14.)

## What Fuori already has

- Every conversation is recorded: who said what, with English, in the `conversations` table (`lib/recording.ts`).
- When a conversation ends, its learning notes are written next to it (`lib/memory.ts`, `ReviewLog`): `items` (phrase, English, why it's worth keeping), `mistakes` (what the learner said, the better version, why), `missed` (not understood) and `english` (fell back on English).
- `/api/admin/conversations?format=text` already prints transcripts for reading.
- **Caveat:** the review log is still debug-only and its picks haven't been checked. The demo is partly a way to check them.

## The demo

### 1. The export, in versions

One Markdown file for one learner and a date range, dropped into Gemini Notebook. Markdown pastes cleanly into a Google Doc or uploads as a text source. Same for both countries; nothing language-specific in the code (the language, app name and level come from the country pack). Built as an admin format next to `/api/admin/conversations?format=text`, which already prints transcripts.

**Version 1: transcripts only (Josh, 2026-10-14).** Start with the simplest file and see if Gemini can find the words, phrases and mistakes itself; the characters' recasts already carry most corrections.
- **A short note for Gemini at the top:** these are a learner's real conversations in {language} at about {level}; make study material from them, using the people and places as context; the learner's lines are speech-to-text and may contain transcription errors, so ignore spelling and pronunciation.
- **Header:** learner, dates, cities visited, number of conversations.
- **One section per conversation:** who (name, role), where (place, neighbourhood, city), when, then the full transcript with each line's English.
- Lessons with Magda are left out: they are practice, not conversations in town.

**Version 2, only if version 1 falls short** (cards miss real mistakes, or Gemini is thrown by speech-to-text errors): add the learning notes to each conversation: things to say better (`mistakes`), words and phrases worth keeping (`items`), what wasn't understood (`missed`), and fallbacks to English (`english`). Comparing the two also shows whether the learning notes add anything Gemini can't find on its own.

### 2. Try it (Josh, about an hour)

With a week or two of real conversations:
1. Create a Gemini Notebook and add the study pack as a source.
2. Ask for flashcards and a quiz.
3. Make an Audio Overview **in Italian**, ideally asking for a slow, simple level. This is the interesting one: a podcast about your own week in Rome.
4. Try a mind map or report, if curious.

### 3. Judge it

- **Cards:** of 20 flashcards, how many would you actually keep?
- **Context:** do the cards and quiz use your real conversations (Franco, the artichokes, Trastevere), or could they be from any textbook?
- **Audio Overview:** is the Italian at a level you can follow? Does it get things wrong about what happened?
- **Version 1 enough?** Do the cards catch your real mistakes from the transcripts alone, or is version 2 needed?
- **Effort:** is exporting and uploading by hand acceptable for an occasional "study my week" tool?

**Done when:** Josh has tried the pack in Gemini Notebook and decided keep, change or drop.

## Not in the demo

- No study features inside the game: no drills, streaks or quizzes in Fuori (Josh's decision).
- No automatic upload: Gemini Notebook has no API; the learner uploads the file.
- No in-app button yet: the export runs from a script or the admin route. A learner-facing "Export my study pack" comes only if the demo is worth it.

## Things to know

- **Privacy:** the pack contains the learner's own spoken lines and goes to Google when uploaded. Fine for Josh's own conversations; anyone else would need to choose to export, with a plain note about where it goes.
- **Magda:** the learner profile is hers (see [Game design → Magda](02-game-design.md#magda-at-the-school)). A study pack is a different thing: a learner's own material for their own study. They can share the same review log underneath.
