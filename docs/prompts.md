# Prompts: what exists

Every prompt file the game loads, one row each (Italy's files; Mexico's are the same set). "Words" counts only what Claude can be sent (the fenced blocks); the rest of each file is its changelog and notes. Generated 2026-11-08 from `content/it/prompts/` and the code that loads each file; regenerate with the command at the bottom when a prompt is added or removed.

| Prompt | What it's for (the file's own first line) | Loaded by | Words | Version | Changelog entries (now in `changelog/<name>.md`) |
|---|---|---|---|---|---|
| `beginner.md` | How characters talk to a Beginner: | lib/beginner.ts | 1245 | 2026-11-07a | 20 |
| `lesson-steps.md` | Turns one syllabus unit into its lessons, one per step, made ahead and checked once (Josh, 2026-10-27: | scripts/make-lessons.mts | 1124 | 2026-11-03 | 0 |
| `leveling.md` | Prompts for the leveling prototype (tests/experiments/leveling/, designs A, B and C in docs/research/leveling/05-designs.md), and since 2026-11-02d the | lib/path.ts | 1018 | 2026-11-06 | 7 |
| `lesson-flow.md` | A lesson (docs/learn.md → A lesson; N6 item 4, pass 1; Josh, 2026-11-02): | lib/lesson.ts | 905 | 2026-11-05 | 4 |
| `culture.md` | Cultural lessons (docs/culture.md → Cultural lessons; Josh, 2026-11-03): | lib/culture.ts, scripts/make-culture.mts | 724 | 2026-11-06 | 6 |
| `levels.md` | What a character is told about how much {language} the learner follows. | lib/conversation/level-trial.ts, lib/prompts/build-turn-prompt.ts | 616 | 2026-11-02 | 7 |
| `quality.md` | When a conversation ends, after the memory call, one Claude call reads the transcript and counts the things on the dialogue scorecard that code can't | lib/quality.ts | 548 | 2026-10-27 | 3 |
| `say-it.md` | The learner said something in English during a conversation (Josh, 2026-10-23: | lib/say-it.ts | 537 | 2026-11-05 | 8 |
| `learn.md` | The Learn page: a sheet over the conversation, written from it (Josh, 2026-10-20 and 21; docs/learn.md → The page). | lib/learn.ts | 500 | 2026-10-27 | 12 |
| `replies.md` | After a character speaks, a learner in scaffolding (docs/beginner-scaffolding.md, lib/scaffold.ts) picks one of two replies. | lib/replies.ts | 463 | 2026-11-05 | 4 |
| `magda-teaching.md` | Magda is the one character who teaches (CLAUDE.md). | lib/prompts/build-tutor-prompt.ts | 381 | 2026-11-07 | 5 |
| `onboarding.md` | The woman from the country card welcomes a newcomer (docs/onboarding-design.md). | lib/prompts/build-onboarding-prompt.ts | 366 | 2026-10-16a | 1 |
| `memory.md` | When a conversation ends, one Claude call reads the transcript and writes two things: | lib/prompts/build-memory-prompt.ts | 320 | 2026-11-07a | 4 |
| `welcome.md` | The newcomer's first conversation (docs/onboarding-design.md → The welcome, redone; Josh, 2026-11-05): | lib/welcome.ts | 303 | 2026-11-05 | 5 |
| `dialogue.md` | The rules that hold in every conversation, whoever the character and whatever the kind (town, the welcome, Magda's lessons, cultural stories), at every | lib/dialogue/rules.ts | 265 | 2026-11-06b | 4 |
| `study-file.md` | Magda's study file: her short, cumulative record of one learner (docs/02-game-design.md → The study file). | lib/study-file.ts | 252 | 2026-10-14a | 1 |
| `level.md` | Measures the level of what a character says, for the "on level" goal on the dialogue scorecard (docs/06-roadmap.md → 2; 90% of the character's words at | lib/level.ts | 162 | 2026-10-18 | 1 |
| `learner-level.md` | Onboarding places a learner from two answers; the first few conversations confirm or move it (Josh, 2026-10-18). | lib/learner-level.ts | 144 | 2026-10-18 | 1 |
| `facts.md` | A narrow fact judge for anything written about a city that a character will say as true: | scripts/cinema-fact-check.mts, scripts/fact-check.mts | 123 | 2026-11-04 | 1 |
| `record.md` | Labels each of the learner's lines in a finished conversation, for the conversation's record (lib/conversation-record.ts): | lib/conversation-record.ts | 117 | 2026-11-02 | 1 |
| `character.md` | The prompt every character gets, for every conversation turn. | lib/prompts/build-turn-prompt.ts | 92 | 2026-11-08a | 17 |
| `name.md` | In onboarding the greeter asks the learner's name and they answer on the mic; speech to text gives a whole sentence ("My name is Josh", "Mi chiamo | lib/onboarding.ts | 84 | 2026-10-22 | 1 |

**Total:** 22 files, 10289 words that Claude can be sent.

## Archived (not loaded by the game)

Moved out of `content/*/prompts/` on 2026-11-08 to `tests/archive/prompts/<country>/`: six trial copies of `character.md` (`character-english`, `-english2`, `-english3`, `character-teach`, `-teach2`, `-teach3`, about 2,400 words each, 14 changelog entries each) and Italy's `lesson.md` (nothing loaded it). Two experiment scripts (`tests/experiments/core-behaviours.mts`, `help-asks.mts`) can compare prompt files by name through `PROMPTS=`; to rerun one of the trial arms, copy its file back into `content/<country>/prompts/` first.

## Changelogs

Moved out of the live files on 2026-11-08 to `content/<country>/prompts/changelog/<name>.md` (44 files, about 23,900 words). A prompt file now holds only its version and what Claude can be sent. The checks that look for the newest changelog entry read it through `tests/prompt-files.ts`. Verified: for all 44 files the headings, fenced blocks and version line are identical before and after, so what Claude is sent did not change.

## Italy against Mexico (2026-11-08)

Compared part by part: the same 22 files in both countries, 113 named parts, paired in order. **107 of 113 parts are at least 90% the same words**; the differences are the language's own examples. The six that differ more:

- `beginner.md` › English: brief: 85% the same (100 words Italy, 104 words Mexico)
- `beginner.md` › Voice: no narration: 73% the same (47 words Italy, 49 words Mexico)
- `beginner.md` › Answers: as a local says them: 70% the same (66 words Italy, 69 words Mexico)
- `beginner.md` › Answers: one idea: 66% the same (76 words Italy, 78 words Mexico)
- `lesson-steps.md` › System prompt: 86% the same (709 words Italy, 580 words Mexico)
- `leveling.md` › Speaking examples: 54% the same (119 words Italy, 120 words Mexico)

`lesson-steps.md` is the only file with a clearly different size (709 live words Italy, 580 Mexico). Nothing here looks like drift; the Mexican files follow the Italian ones, with Spanish examples.

## Rules written more than once (2026-11-08)

Checked the files that are combined into one conversation prompt (`beginner`, `character`, `dialogue`, `levels`, `leveling`, `magda-teaching`, Italy's wording). **No sentence is repeated word for word**: the only close pair is the reply-format line in `beginner` and `character`. The repetition is in the ideas, each written in different words in several parts:

| Topic | Parts that mention it | Files |
|---|---|---|
| Brevity (short, brief, at most N sentences) | 26 | beginner, dialogue, leveling, levels, magda-teaching |
| English (when to speak it, helping in English) | 24 | beginner, character, leveling, levels, magda-teaching |
| One question | 18 | beginner, character, dialogue, leveling, levels, magda-teaching |
| Commerce (job, errand, sell, serve, order) | 5 | beginner (Flow, Facts, Who: the learner, Reply format), dialogue |
| Corrections (never point out, recast) | 5 | beginner (Mistakes), character (Talk), dialogue (two parts), magda-teaching |
| Stay in role, not a teacher | 5 | beginner, dialogue, leveling, levels, magda-teaching |
| Goodbye and ending | 4 | beginner, dialogue, magda-teaching |
| Facts: only what you're sure of | 3 | beginner (two parts), dialogue |

Merging any of these is a change to what Claude is sent, not a tidy-up, so nothing was merged on 2026-11-08. The candidates, in the order I'd take them: commerce (the shared rule drafted in the conversation of 2026-11-08, Beginner's two sentences replaced by it), corrections, then brevity. Each needs Josh's wording first.

## Not yet done

- Merging the repeated rules above, topic by topic, each with Josh's wording.
