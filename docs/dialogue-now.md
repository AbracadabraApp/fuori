# Dialogue now: how it works today

Checked against the code and prompts on `main` at 8430f5a, 2026-11-12 (laptop session; both countries, whose prompt texts match apart from example phrases). This describes what the code does, not what was decided or planned: decisions are in [dialogue-model.md](dialogue-model.md), the work in [dialogue-plan.md](dialogue-plan.md), the terms and the bids model in [dialogue-structure-reference.md](dialogue-structure-reference.md), faults in [dialogue-ideas.md](dialogue-ideas.md). Rewrite this page when the code changes; a line here that the code no longer does is a bug in the page.

**Live or not:** `main` is ahead of what Railway serves; `progress.md` → the top handoff says which commits are live.

## 1. A turn

`takeTurn` (`lib/conversation/take-turn.ts`) loads the character's memory and the learner's level, then picks one of eight kinds of conversation in a single conditional. Under it are two engines:

- **The line engine** (`runTurn`, `lib/turn.ts`): one flowing line in the character's voice with its English; optionally answers to say back and a done flag. The first sentence can go to the voice while the rest is written.
- **The parts engine** (`runBeginnerTurn`, `lib/beginner.ts`): the reply as parts (english, word, question, answer), which code may rewrite and joins into the spoken line.

Every reply: thinking off (`noThinkingFor`); the system prompt plus the whole conversation as messages; on some turns a bracketed note at the end of the newest message. The shared rules of `dialogue.md` (mishearings, stay within your job, cause before effect, your place's customs, their goodbye ends it) go into every kind.

| # | Kind | Engine | What it's given | Who gets it |
|---|---|---|---|---|
| 1 | Intermediate visit (and Advanced) | line | `character.md` + `dialogue.md` + the place's here line + memory; the intro's beats once; a shape note only when they asked something | Learners at Intermediate or Advanced |
| 2 | Intro (first turn of a visit) | its own call (`runIntro`, `intro.md`) | `character.md`'s Who and Relationship blocks + the Brief | Intermediate and Beginner 2 visits |
| 3 | Beginner 2, steps 1–3 | line | the Intermediate prompt + `scaffolding.md` → Level 1 / 1b / 2 + Answers + the setup note every turn + shapes + beats | Beginner 2 (the hidden Version switch, or the stored step) |
| 4 | Beginner 2, steps 4–6 | parts | `beginner-2.md` prompt + Level 2 / 3 + the setup note + shapes + beats; the voice waits for the whole reply | The same, from step 4 (never played) |
| 5 | Beginner 1 | parts | `beginner.md` (23 rule blocks) + the path stage's `leveling.md` blocks | Every Beginner in production, and learners with no level |
| 6 | Welcome | parts | `beginner.md` + `welcome.md`, step counted by code; English only | A learner who hasn't finished it |
| 7 | Lessons | parts (Beginner format) or line (Italy's Intermediate lessons) | `beginner.md` or `character.md` + a `lesson-flow.md` brief; ended by turn count | Learn → Lessons |
| 8 | Magda outside a lesson | line | her tutor prompt | (the server answers her only inside a lesson) |

Cultural lessons (`culture.md` → Story) play as a lesson part, in the Beginner or the speaking format by level.

## 2. By level

**Intermediate.** The intro opens: name and role in one sentence, four or five about what the place is known for, one question out of it (`intro.md` 11e), with the beats (three or four things it set out). Later turns get the beats once in the system prompt ("come back to them when the talk gives you a reason… not a list to work through"). The director is silent except "Answer what they asked first" when the learner's line has `?` or `¿` (`lib/shapes.ts`). No close: the visit ends when the learner says goodbye (`done`).

**Beginner 2** (`lib/beginner-2.ts`; `docs/beginner-2.md`). Six steps, each a cluster of answer setups and a Level text (`LEVEL_OF_CLUSTER`: 1, 1b, 2, 2, 3, 3). Steps 1–3 run on the line engine with the English frame (mostly English, phrases of the language slotted in, the question in the language with its English). Every turn gets a setup by a seeded draw (`pickSetup`: step 1 rotates two answers and questions to ask, never the same three times running), answer first on a question, and at the turn after the beat count "Shape: close" with the goodbye setup (turn 8 without beats). The step is stored (`learners.step`) and offered up after 3 conversations of 3+ replies (`lib/level-up.ts`).

**Beginner 1** (`lib/path.ts`, `beginner.md`, `leveling.md`). Four stages, moved by counts from each conversation (4 easy of the last 5): S1 two answers and yes-or-no / this-or-that questions only; S2 about half in the language, one answer; S3 mostly the language, the answer as a sentence to finish; S4 the character prompt with `levels.md` → "Beginner: still you, ask", which gets no intro, no shapes, no beats. Goodbye: the model offers it when it judges the talk is winding down.

## 3. Memory

At the end of a visit `remember.ts` runs `memory.md`: up to 10 notes (what the character would remember, what it told them) and the learner's review. If the visit had an intro, its beats are added to a "Told them about: …" line that accumulates across visits (the told-ledger). Next visit, `character.md` → "Met before" gives the notes and "Don't tell them again what you've already told them"; the intro's Brief picks up where they left off and tells something not yet told.

## 4. What the saved visits show (2026-11-12 snapshot)

From `~/fuori-archive/conversations-2026-11-12.json` (private): 271 ordinary visits by 44 learners, smoke-test learners, lessons, Magda and the welcome left out. Script: `node scripts/bid-count.mjs ~/fuori-archive/conversations-<date>.json`. "Said back" is the reply close to one of the offered answers (word overlap); "left" is the visit ending on that turn, which for a statement is usually the character's goodbye.

| Level | Bid | Bids | Left after it | Of replies: said back | Own words | Median words |
|---|---|---|---|---|---|---|
| Beginner 2 | two answers | 87 | 11% | 82% | 18% | 5 |
| Beginner 2 | questions to ask | 32 | 3% | 61% | 39% | 5 |
| Beginner 2 | question, no answers | 16 | 0% | 0% | 100% | 4 |
| Beginner 2 | intro | 8 | 3 of 8 | 60% | 40% | 4 |
| Beginner 2 | goodbye setup | 15 | 20% | 67% | 33% | 6 |
| Beginner 1 | two answers | 111 | 17% | 54% | 46% | 4 |
| Beginner 1 | one answer | 57 | 12% | 74% | 26% | 6 |
| Beginner 1 | fill in (…) | 55 | 27% | 45% | 55% | 4 |
| Intermediate before 11-10 | question at the end | 293 | 18% | n/a | all | 6 |
| Intermediate before 11-10 | asks, then carries on | 44 | 43% | n/a | all | 10 |
| Intermediate before 11-10 | statement | 119 | 34% | n/a | all | 5 |
| Intermediate 11-10q on | question at the end | 10 | 0 | n/a | all | 9 |
| Intermediate 11-10q on | asks, then carries on | 3 | 0 | n/a | all | 10 |

Readings, not conclusions (one or two learners carry most rows): offered answers are mostly said back, more at Beginner 2 (82%) than Beginner 1 (54%); a frame to finish (…) is the bid most often left on (27%); the open question with no answers, pulled on 2026-11-11 as "difficult for this level", was never left and got own words every time (16 bids, one evening); Intermediate since 11-10q has 18 bids, too few to read. The intro "left" cases are three Palermo visits opened and closed within a minute (2026-11-12 00:17–00:18), more likely browsing than a verdict.

**Return visits since the told-ledger:** none yet. Two visits have stored beats (Raymundo and Isidro, Guanajuato, 2026-11-12 morning), each a first meeting; the ledger is written (Isidro's notes carry it twice, once as prose and once as the "Told them about" line). Plan item 3.3 waits for a second visit to either.

## 5. Inconsistencies open today

The list, with what each resolves, is [dialogue-plan.md](dialogue-plan.md) phases 1, 2 and 5. In short: Beginner 1 tells characters to ask where the learner is from (1.1); Beginner 2's close fires on the beat count (1.2); `intro.md` says both "one at a time" and "not a list" (1.3); setups recorded but not sent (1.4); Beginner 1's single answer against the 11-05 decision (1.5); newcomer wording in the lesson and culture writers (2.1–2.3); two ladders (5.1); dialogue fixes reaching Intermediate and Beginner 2 only (5.2); four goodbyes (5.3); steps 4–6 unplayed with mismatched texts (5.4); length rules in prose (5.5); dead code (5.6).
