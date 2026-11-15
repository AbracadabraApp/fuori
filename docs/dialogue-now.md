# Dialogue now: how it works today

Checked against the code and prompts on `main` at f039f1fe, 2026-11-14 (Mac mini session; both countries, whose prompt texts match apart from example phrases). Sections 1 to 3 and 5 were rewritten that day after the fifteen changes of 2026-11-13 and 14 (the intro cut, the endings, the comment, idiom and help turns, steps 4–6, the level-up past the steps, memory without gender); section 4's counts are still the 2026-11-12 snapshot. This describes what the code does, not what was decided or planned: decisions are in [dialogue-model.md](dialogue-model.md), the work in [dialogue-plan.md](dialogue-plan.md), the bids model, the bid menu and how a Beginner turn ends in [bids.md](bids.md), the terms in [dialogue-structure-reference.md](dialogue-structure-reference.md), what plays wrong in [bugs.md](bugs.md), ideas in [dialogue-ideas.md](dialogue-ideas.md). Rewrite this page when the code changes; a line here that the code no longer does is a bug in the page.

**Live or not:** check `git log origin/live` and `/healthz` (it reports the commit), not `progress.md`. On 2026-11-14 everything described here was live (origin/live at ea5a4838).

## 1. A turn

`takeTurn` (`lib/conversation/take-turn.ts`) loads the character's memory and the learner's level, then picks the kind of conversation in a single conditional (eight rows below; two are no longer reached). Under it are two engines:

- **The line engine** (`runTurn`, `lib/turn.ts`): one flowing line in the character's voice with its English; optionally answers to say back and a done flag. The first sentence can go to the voice while the rest is written.
- **The parts engine** (`runBeginnerTurn`, `lib/beginner.ts`): the reply as parts (english, word, question, answer), which code may rewrite and joins into the spoken line.

Every reply: thinking off (`noThinkingFor`); the system prompt plus the whole conversation as messages; on some turns a bracketed note at the end of the newest message. The shared rules of `dialogue.md` (mishearings, stay within your job, cause before effect, your place's customs, their goodbye ends it) go into every kind.

| # | Kind | Engine | What it's given | Who gets it |
|---|---|---|---|---|
| 1 | Intermediate visit (and Advanced) | line | `character.md` (with the level fact: "They're learning {language} and follow most of it" / "They speak {language} well") + `dialogue.md` + the place's here line + memory; a shape note only when they asked something; the Help asked note after they asked for help; the Close note on the 15th character turn | Learners at Intermediate or Advanced |
| 2 | Intro | none | Cut on 2026-11-13 at every level (`intro = false` in take-turn; `lib/intro.ts` and `intro.md` remain, unused): a visit opens on the character's first ordinary turn | Nobody |
| 3 | Beginner, steps 1–6 | line | the Intermediate prompt + `scaffolding.md` → the step's Level text (1, 1b, 2, 2b, 3, 3) + Answers + a setup note on every turn + shapes; the answers come with the reply and go to the app as answer parts | Every Beginner, on the stored step |
| 4 | (Beginner on the parts format) | parts | The branch is still in take-turn but no step reaches it: all six steps are on the line reply since D10 (`FRAME_CLUSTERS = 6`) | Nobody |
| 5 | The old Beginner | parts | `beginner.md` (23 rule blocks) + the path stage's `leveling.md` blocks | Only behind the hidden switch (Version → Beginner: Old); due for removal about 2026-11-19 (D22) |
| 6 | Welcome | parts | `beginner.md` + `welcome.md`, step counted by code; English only | A learner who hasn't finished it |
| 7 | Lessons | parts (Beginner format) or line (Italy's Intermediate lessons) | `beginner.md` or `character.md` + a `lesson-flow.md` brief; ended by turn count | Learn → Lessons |
| 8 | Magda outside a lesson | line | her tutor prompt | (the server answers her only inside a lesson) |

Cultural lessons (`culture.md` → Story) play as a lesson part, in the Beginner or the speaking format by level.

## 2. By level

**Intermediate and Advanced.** No intro. The character gets one fact about the learner's level (`character.md` → Learner: Intermediate / Advanced) and no other level rules. The director is silent except "Answer what they asked first" when the learner's line has `?` or `¿` (`lib/shapes.ts`). The visit ends when the learner says goodbye or that they have to go, in any words (the reply's `done`), or on the character's 15th turn, when it gets the Close note and closes the visit itself (`CLOSE_AT_INTERMEDIATE`). Once the learner asks for help or says it's hard, the reply's `hard` flag is saved on the turn and every later turn of the visit gets the Help asked note (short sentences, known words, a new word's English right after it).

**Beginner** (`lib/beginner-2.ts`; `docs/beginner-2.md`). Six steps on one screen and one reply format, each taking a support away:

| Step | Level text | Kinds of turn in the draw | The last line's English |
|---|---|---|---|
| 1 | 1: English with pieces of the language slotted in as `{piece \| English}`, put together by code (`lib/dialogue/pieces.ts`) | two answers, notice, questions to ask, comment | printed and said |
| 2 | 1b: English and the language mixed, two or three phrases with their English | the same | printed and said |
| 3 | 2: half and half | the same, and no answers | printed and said |
| 4 | 2b: mostly the language, an English aside now and then | the same | said, not printed |
| 5 | 3: English only when asked | two answers, questions to ask, comment, no answers | said, not printed |
| 6 | 3 | no answers | neither |

- **The draw** (`pickSetup`): seeded by the conversation and the turn, by weight: two answers 3, comment 2, no answers 2, notice 1, questions to ask 1. Never the same kind three times running; questions to ask never twice running, nor after the learner's own question; notice at most once a visit. The first turn is the opener (the place, two answers).
- **Comment** (D6, D7): the turn ends on a comment of the character's own, not a question; one answer takes up its words, one is new. Its last line is printed and said by the same ladder as a question's (`lastLineOf`, `withLastEnglish`).
- **Answers** (`scaffolding.md` → Answers): two different things a person might say there, each taking the talk somewhere; not a yes and a no, not a compliment; a blank only for a name, a place or a number; now and then one answer asks about a word given no English, or for it again more slowly. Answers keep their English at every step. A turn that asks for answers always has them.
- **Idiom** (D13, `lib/idioms.ts`): about one visit in three, on the 4th character turn, in place of a turn that gives answers. Code picks one from `content/<country>/idioms.json`, weighted to the common and easy, leaving out the learner's idioms from their last 30 visits; the character says it with its words in English and asks what it means; the answers are two guesses; the next turn says what it means. Saved on the turn only when it was said.
- **Endings:** the goodbye setup once, on the learner's 7th turn (the character winds down, the two answers are goodbyes, and it may invite the learner back for something of its own: D1); on the 8th the Close note, and the visit ends there whatever the reply says. Before that, leaving in any words ends it, and the character winds down by itself when the talk has run its course. Every setup note except the opener's and the goodbye's carries "if they are leaving, skip this".
- **Help asked:** as at Intermediate.
- **Moving up** (`lib/level-up.ts`): after 3 conversations of 3 or more replies at a step, the game offers the next; the learner chooses; "not yet" asks again 3 conversations later. At step 6 the offer is Intermediate, and at Intermediate it is Advanced (D34, D35). Nothing offers a step down.

**The old Beginner** (behind the hidden switch; `lib/path.ts`, `beginner.md`, `leveling.md`). `path.ts` still decides who is a Beginner for everyone. Four stages, moved by counts from each conversation. The welcome and the lessons still play in its format (rows 6 and 7).

## 3. Memory

At the end of a visit `remember.ts` runs `memory.md` once, as an observer, not the character. It writes two things.

- **Notes:** up to 10 short lines in English of what this character would remember about this person and what it told them, rewritten from the character's earlier notes (keep, update, drop). Kept per character and per learner; no character reads another's (Josh, 2026-11-14: "character knowledge should be siloed - unless we introduce gossip"). Next visit `character.md` → "Met before" gives them to the character. Since 2026-11-14 the notes say "they", don't record what the character calls the learner, and rewrite any note that says man or woman; how to address the learner comes only from the learner's own setting.
- **The review:** useful phrases, mistakes, missed phrases, English used. `lib/study-file.ts` folds it into Magda's study file, which only her lessons read. No turn of an ordinary visit reads it. The Learn page behind the Learn link is a separate call, written when the learner opens it (`lib/learn.ts`).

Because notes are rewritten from notes, an error is carried forward until something removes it: a misheard name (B8), a wrong name for a relative (B9), a gender (B10, fixed). Nothing checks a note against the transcript.

The told-ledger ("Told them about: …") was filled from the intro's beats; with the intro cut nothing new is added to it (seen in take-turn; not traced further).

## 4. What the saved visits show (2026-11-12 snapshot; before the changes above)

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

## 4a. Tools for checking dialogue

- **Replay real visits through today's code:** `COUNTRY=es-mx npx tsx --env-file=.env.local tests/experiments/b2-turn-length.mts <snapshot.json> <conversation id prefix>… [--takes=2] [--level=<file>]`. Each of the learner's real lines, at the same point in the visit, goes through the call the game makes at Beginner step 1; it prints each reply with its words, sentences, Spanish words and whether it ends on a question. The most useful check of 2026-11-12: it showed the cause of the long turns, Notice repeating, and the replayed return visit. A check, not an experiment.
- **What learners do after each kind of bid:** `node scripts/bid-count.mjs <snapshot.json>` (§ 4). Rerun after 20 new-Beginner visits with three or more replies (dialogue-plan.md).
- **The snapshot:** `node scripts/archive-conversations.mjs`, run from `~/fuori` (the folder linked to Railway), writes `~/fuori-archive/conversations-<date>T<hhmm>.json` (private, never in git). `--since=<day>` writes a separate `partial-conversations-…` file, so a full copy is never overwritten.

## 5. Inconsistencies open today (2026-11-14)

The work list is [dialogue-plan.md](dialogue-plan.md) → To do; what plays wrong is [bugs.md](bugs.md). In the code itself:

- The welcome and the lessons still run on the old Beginner's prompt (`beginner.md`) and the parts format, so a fix to the Beginner's scaffolding doesn't reach them.
- Two branches in `takeTurn` are no longer reached: the intro (`intro = false`) and the Beginner on the parts format (every step is on the line reply). `lib/intro.ts`, `intro.md` and the told-ledger's source go with the first.
- The old Beginner is still behind its switch (removal due about 2026-11-19, D22).
- `scaffolding.md`'s Answers block now holds five rules in one paragraph (one idea each; two different things; blanks; the help answer; winding down), about 1,780 words in the file against 1,270 on 2026-11-12. In the first visits after the release one of them was already not holding ("never about something already explained": bugs.md B24).
- Section 4's counts predate all of this; rerun `scripts/bid-count.mjs` after 20 visits on the live version (D16).

## 6. The shared dialogue layer (Claude's proposal, 2026-11-05; Josh: "think about ways the code should be written to make changes to dialogue issues consistent as well as changes to dialogue scaffolding")

Moved here from dialogue-model.md on 2026-11-12: a proposal, not a decision. Built: `lib/dialogue/rules.ts` with `dialogue.md` (in every kind's prompt; `npm run test:dialogue` checks it) and `lib/dialogue/heard.ts`. Not built: `level.ts`. The text as written:

Today `lib/conversation/take-turn.ts` picks one of five prompt paths by kind of conversation, and each path's prompt file carries its own rules about English, answers and corrections, so a fix in one never reaches the others. The target:

- **`lib/dialogue/`: the one place dialogue behaviour lives.**
  - `rules.ts` with `content/<country>/prompts/dialogue.md`: the rules that hold in every conversation (corrections, mishearings, and later questions and answers by level), added to every system prompt by one function. A fix to how characters handle the learner goes here, once.
  - `heard.ts`: reads what the learner said against what was offered (any language, no phrase list) and adds a short note to their message for the character. The said-back fact.
  - `level.ts` (later): the learner's place on the path resolved once, setting the reply form (parts or a line), the stage blocks and the answer limit. Scaffolding changes go here and reach every kind.
- **Kinds supply briefs only:** a lesson, a cultural story or the welcome gives its topic and when it ends; its prompt file says nothing about English, answers or corrections.
- **A test** builds the prompt for every kind and checks the shared rules are in each, so a new kind or a new prompt can't miss them.
