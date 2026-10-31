# N6 release plan

Draft, 2026-10-30, for sharing. Written by Claude from the roadmap as Josh reorganized it today ([06-roadmap.md](06-roadmap.md) → Now); the order is Claude's proposal until Josh confirms it. Decisions marked "Josh" are his.

## Where things stand

**N5 is finished: nothing left in its list.** The family plays TestFlight build 8. N5 brought the Beginner level (characters set the scene in spoken English, then the words in the language, one question and answers to say back), hands-free for everyone, lessons from the syllabus in both countries (21 for Italy, 25 for Mexico), each city's own food places, Italy's cast rebalanced, and a whole-app scan in three rounds. Turns take about 2 s from the end of the learner's turn to the character's voice.

**Dropped from N5 (Josh, 2026-10-30):** the orientation tour (build 8 skips the greeter), "Try Magda" and the Learn trials (the lessons replaced them), the smaller world for beginners.

## What N6 is for

Learning comes first (CLAUDE.md: "It's a language-learning game, not a language-generating game"). N6 has four themes, in that order of weight:

1. **Level:** every learner at the right level, and the level changing as they improve.
2. **Teaching:** Learn, and what comes after a conversation.
3. **The world:** who you meet and where.
4. **Speech and speed**, measured on real recordings.

## The plan, in order

| # | Item | Theme | Waiting on Josh |
|---|---|---|---|
| 1 | **A level for new players.** Build 8 skips the greeter, so a new player starts with no level and gets Beginner-format conversations. Proposed: one level question by buttons after the country choice. | Level | Yes or no to the proposal |
| 2 | **The lesson shape.** Magda teaches on the conversation screen, a practice dialogue is the assignment, then her review ([teach-plan.md](teach-plan.md)). | Teaching | Approve the screen design before it's built |
| 3 | **TestFlight build 9**, carrying 1 and 2 plus the scan's app fixes (Flashcards, the recorder, the voice, Learn pausing the conversation). | Shipping | "Go" |
| 4 | **The goodbye rule.** Her goodbye ends the conversation and a finish link replaces the mic; the learner can leave early but not continue (Josh, 2026-10-23). | Teaching | The word: "Esci" or "Fuori" for Italy, Mexico's ("Salir"?) |
| 5 | **The English fading over time.** Josh's staggered plan: a stage per conversation, one support faded at a time, advancing on mastery. | Level | Agree what fades at each stage, then play it |
| 6 | **Transcription measured on the kept recordings**, then a shorter end-of-turn wait for Intermediate and Advanced (Beginners keep 2.5 s). | Speech | The shorter wait, before it ships |
| 7 | **A reason to be there for Mexico's people:** one sentence per character on why they're at their place today (11 of 65 have one). Likely small gain: Mexico's characters already fit their places. | World | Whether to do it at all |
| 8 | **The level framework:** placement, moving up, level in the prompt. | Level | Turning on the level check (adds a production database column) |
| 9 | **The conversation library** beyond Josh's and Sophia's recordings. | Speech | Each further learner, one at a time; testers need the privacy policy |
| 10 | **Adventures:** places where something happens, people with something to show, a mystery across days and places ([adventures.md](adventures.md)). | World | His ideas, still forming |
| 11 | **The missions prototype and card maker v2.** | Teaching | What missions are for, now they're out of lessons |
| 12 | **Parity with the web:** visit stamps (design locked 2026-10-29), stations and ticket, the city picker. | World | Stations' design; what's wrong with the city picker |
| 13 | **A log of every turn's timings**, phone and server, kept across deploys. | Speech | A new database table |

**Started 2026-10-30, at Josh's request:** visit stamps (12) and the transcription measurement (6), the two that need nothing from Josh.

## Three answers unblock the top of the list

1. The level question for new players: yes or no.
2. The finish-link word for each country.
3. "Go" for build 9, best once 1 and 2 are built.

## Before anyone outside the family

Not part of N6 unless Josh moves it in ([06-roadmap.md](06-roadmap.md) → Release, Stage 2): App Attest; a daily usage budget per learner that survives deploys (today's caps reset on every deploy); an image domain; a privacy policy naming Groq, Anthropic and ElevenLabs; the App Privacy label; tester notes, with the questions updated (the wait is ~2 s, the Beginner level exists, it's hands-free). Then the App Store.
