# Learn: the teacher, outside the world

2026-10-19 · Josh · Draft. Josh's option D for Magda: a Learn feature next to the Diario, with full licence to speak and listen in English, and a teacher who is a character but plays no role in the world. Replaces Magda at the school for foreigners once built; until then the school stays as it is.

## Why (2026-10-19)

- Characters now teach in passing and give English when asked (teach3, [prompt-trials.md](prompt-trials.md)), so the world covers most day-to-day teaching.
- What only Magda did: explaining grammar openly, and the study-file loop (one thing to try in town, picked up next lesson). Both need a place where English is fine and nobody is pretending.
- At the school she was hard to reach: 4 of 106 conversations in the admin export, one a real lesson. Schools exist in 11 of 20 Italian cities. Getting there meant walking into a place in the world to step out of it.

## What it is

- **An icon left of the Diario** in the top-right toolbar, so the row is Learn · Diario · Settings, in the same modifier ([diario.md](diario.md) → Getting there). Fuori's own drawing, same stroke as `SettingsIcon`; 44 pt target; no badge. Not shown during a conversation (scenes stay in the world). Opens full screen with a close button; every exit saves through the one leave function.
- **A teacher, no roleplay.** One teacher with a name, a portrait and a voice, so it feels like a person, not a help system. She's openly your teacher and isn't in a city, a place or a scene. The world's rule (no English nobody asked for) doesn't apply here.
- **English both ways.** You can speak English, the language you're learning or a mix: `/v1/transcribe` with `mode: "any"` already lets Whisper detect the language. She answers in either and switches freely; her voice must read both well (check the ElevenLabs voice on mixed lines).
- **Two ways in, one conversation:**
  - **Ask:** "how do I say…", "why was it *sono andato*?", "what did the barista mean?". A quick answer, then you're done or it grows into practice.
  - **Lesson:** she suggests one thing from the study file (today's shape, minus the role-play step, since the town is where you practise), drills it, and ends with one thing to try in town.
- **The study file stays hers.** Same file, same fold after every conversation; she starts from it. She can quote what you actually said in town ("at the bar yesterday you said *io vuole*").
- Words on the screen (the feature's name, her opening) come from `/v1/content`; nothing in Swift.

## What changes

- The school for foreigners leaves the map; its places in the city files are hidden, not deleted.
- `pack.tutor` becomes the Learn teacher rather than a character at every school; same id, so her memory and study file carry over (no migration).
- `magda-teaching.md` becomes the Learn prompt: drop the school, the city and the in-lesson role-play; add Ask and English both ways. A prompt change: version bump, changelog, a trials row.

## Prototype first

| Step | What | Who | Goal and bar |
|---|---|---|---|
| L1 | The Learn prompt as a trial file; an experiment runs simulated learners through Ask (10 questions, English and mixed) and Lesson (5 study files) | Claude | Answers the question asked in 90%+; a lesson ends with one thing to try in town in 90%+; under ~40 words a turn unless explaining |
| L2 | Learn behind a setting (off by default): the icon opens a conversation with the teacher, `mode: "any"` transcription | Claude builds, Josh plays | Josh: it's where he'd go when stuck. Next build (releases are on hold) |
| L3 | Decide | Josh | Keep it, move the school out of the world, or change it |

## Open (Josh)

- Name and icon: "Impara"/"Aprende"? A different drawing from the Diario's book.
- Does she stay Magda (first name of Josh's real teacher; progress.md says check with her before sharing Fuori) or get a new name?
- Does the "one thing to try in town" become a mission from the Diario's chips, so the loop closes through missions?
- Is Learn there for Level 1 beginners, or does Level 1's adaptive character teaching carry them until Level 2?
