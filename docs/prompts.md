# Prompts: what exists

Every prompt file the game loads, one row each (Italy's files; Mexico's are the same set). "Words" counts only what Claude can be sent (the fenced blocks); the rest of each file is its changelog and notes. Generated 2026-11-08 from `content/it/prompts/` and the code that loads each file; regenerate with the command at the bottom when a prompt is added or removed.

| Prompt | What it's for (the file's own first line) | Loaded by | Words | Version | Changelog entries |
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

## Not yet done

- Changelogs are about 73% of the words in these files; moving them out of the live files needs `npm run test:prompt` (which enforces a changelog in each file) changed first.
- Whether the same rule sits in two files (commerce curbs in `dialogue.md` and `beginner.md`; `levels.md` and `leveling.md`) is not checked here.
- Italy against Mexico: the file sets are the same apart from the archived `lesson.md`; their wording was not compared.
