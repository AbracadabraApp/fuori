# The mix: code-switching with glosses

A draft, not decided (2026-11-13). Josh: "I want to try and formalize this mix use - because it is going to be the model ffor all beginner levels, replace into, and may be used in intermediate." Everything below that isn't quoted is Claude's proposal.

## The name

What bilinguals do when they talk to someone who doesn't share their language: they speak English, slip in a phrase of their own language because it carries the meaning, the feeling or the place, and **gloss** it (say what it means in English). Linguists call it **code-switching** (within a sentence, **code-mixing**); the wider view is **translanguaging**. Josh's research, 2026-11-13: idioms and culturally loaded phrases are said in the language and then glossed; ordinary ideas are said straight in English.

That is the Beginner turn already: a bilingual local talking to a visitor. Proposed words for the glossary:
- **the mix**: a turn in English with pieces of the language in it.
- **piece**: a word, phrase or short sentence in the language.
- **gloss**: a piece's English, right beside it.
- **echo**: a whole sentence in the language, then the same sentence in English (Josh, 2026-11-13: "echo 50/50 can be easier than mix 70/30").
- **unsupported run**: a piece the learner gets no English for.

## What it's for

The learner understands every line, and hears the language in pieces small enough to catch and say back. Josh, 2026-11-13: "I bigger issue is the runs of spanish without English support"; "5-10% less sspanish is hard for a non spanish speaker to pick out". So the measure is support, not the amount.

## One rule, every level

**Every piece the learner doesn't already know has its gloss.** The only language without one is what they already know: what they said themselves, what was glossed earlier in the visit, and greetings.

## The dials (by level)

Josh: "Could level prompts be as easy as saying not much, a bit more, more".

| | Step 1 | Step 2 | Step 3 | Intermediate |
|---|---|---|---|---|
| How much | not much | a bit more | more | mostly the language |
| Piece size | a word or phrase | a phrase | a short sentence | sentences |
| Which pieces get a gloss | all | new ones | new ones | when asked |
| Patterns | mix | mix, echo | mix, echo | — |

Patterns can be combined in a turn: Josh, 2026-11-13: "pastiche of mixed then echo - then mix".

## Where it's used

- **All Beginner steps:** the table above.
- **The first turn of a visit, in place of the intro:** Josh: "First turn shoulld offer something that iss a break from getting quizzed, but in character mode - no subtitles or sheet. For it to work the english/spanish mix needs to be good."
- **Intermediate, when the learner asks for help:** the character switches to the mix for the help, then goes back.
- **The other way round (an idea):** the character asks the learner a favour, "come si dice in inglese?" (dialogue-ideas.md, 2026-11-13).

## What the numbers say (2026-11-13)

Turns with a run of 3+ words in the language and no English (`tests/experiments/unsupported-runs.mts`, a judge; the replays are `tests/experiments/b2-turn-length.mts` on five of Josh's 11-12 visits, 40 turns):

| | Unsupported runs | Spanish |
|---|---|---|
| Josh's real turns, 11-12 evening (100) | 62% | ~50% |
| Step 1 as it was (12i), replayed | 63% | 45% |
| Step 1 on main (13a), replayed | 46% | 32% |
| 13a told "each with its English right after it, like an echo: never {language} on its own", replayed | 41% | 28% |

The wording moves it, but not to zero: what's left is mostly stock phrases ("que le vaya muy bien", "qué bueno, joven", "fue un gusto") and a sentence the character adds of its own.

## How to get it to zero (proposal)

Prompt wording asks for the rule; structure would guarantee it. The character writes its turn as pieces, each piece in the language with its gloss, and English in between; the code puts the line together, so an unsupported run can't happen, and the level's dials (how many pieces, which get a gloss, echo or not) become settings in code rather than sentences in a prompt (dialogue-model.md, "Content and display are separate", 2026-11-07).

History to know: Beginner step 1 used a parts reply until 2026-11-10q and was moved to one line, after Josh called a phrase repeated around its English a "sandwich" ("weird"; tests/check-beginner-2.ts). The proposal isn't the sandwich: each piece is said once, with its gloss once.

## Measures

The amount of the language, unsupported runs, turn length; and Josh's ear, which decides.
