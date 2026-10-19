# Prompts: what exists and what's been tried

**Read this before writing a new prompt** (Josh, 2026-10-18: someone may reinvent a prompt for one purpose when an existing one is already better). First check whether an existing prompt does the job, or most of it; then check below whether the idea was already tried.

Each prompt's own changelog (bottom of its file) records the versions that shipped. This file adds what's easy to lose: what each prompt is for, and trials that didn't ship. Add a row in the same commit as the trial, even when it's dropped. The text of a deleted trial stays findable by its commit.

## What exists

All in `content/<country>/prompts/`, one copy per country.

| Prompt | What it does | Runs in production | Reuse it for |
|---|---|---|---|
| `character.md` | A character's next line, `{ line, en }` | Every turn | Anything a character says, including lines written outside a live conversation (a Diario card's line and answers) |
| `levels.md` | Level blocks appended to the character prompt | Josh's Mexico learner only (`LEVEL_TRIAL`) | Making any character line easier |
| `replies.md` | Two whole-line replies on one frame, answering the character's last line | No (route built, app not yet) | Reply buttons, Diario card replies |
| `magda-teaching.md` | Magda's lessons | Conversations with Magda | Explicit teaching |
| `onboarding.md` | The greeter: follow-up, placement, send-off | Once per new learner | — |
| `memory.md` | After a conversation: the character's notes, and review phrases, mistakes, missed, English | Every conversation | What the learner got wrong or needed (the Diario's frames start here) |
| `study-file.md` | The learner profile Magda reads | Every conversation | — |
| `quality.md` | Judges a conversation (alive, replies that don't follow, …) | Every conversation; also the replay judge | Judging dialogue |
| `learner-level.md` | The learner's level from their first conversations | No (`LEVEL_CHECK` off) | Placing a learner |
| `level.md` | Which words of a line a beginner knows | No (replay and experiments) | Measuring any line's level |

Experiment prompts live inside `tests/experiments/*.mts` and are listed below when they're tried.

## Trials

Measures are only comparable within one block (same judge, replay set and history window). The block says what it was measured on.

### character.md

Measured on the replay, Italy, 28 conversations, whole-conversation history (from 2026-10-18). Goal of these trials: faster, shorter replies without losing the rest.

| Version or trial | Status | Text | Wait | Words | Beginner follows | 2+ questions | Garbled understood | Alive | Decision |
|---|---|---|---|---|---|---|---|---|---|
| 2026-10-18 (long prompt), thinking | Replaced | 18bd99e | 3.4 s | 23 | 25% | 10% | 81% | 6.0 | Production before 18b |
| short, thinking | Tried | `character-short.md`, 5e20523 | 2.8 s | 16 | 39% | 8% | 88% | 5.1 | Became 18b |
| **short, no thinking = 2026-10-18b** | **Production** | `character.md` | **1.9 s** | 17 | 37% | 14% | 94% | 5.3 | Shipped (Josh: "take the best"), 55520dc |
| short2 ("Have a chat…", "Hello"), thinking | Dropped | `character-short2.md`, 03662a2 | 3.3 s | 20.5 | 41% | 9% | 84% | 5.3 | Longer than short |
| short2, no thinking | Dropped | same | 2.1 s | 22 | 40% | 23% | 91% | 5.4 | Longer; double questions |

Earlier, on the 6-message history (not comparable with the block above), 5e20523: short + Haiku 1.3 s but 21% double questions and broken replies (dropped); short + traits line 3.1 s, 20 words (dropped).

Core behaviours (round 18, `core-behaviours.mts`, 8 characters × 2 runs; goal: CLAUDE.md's behaviours hold on the short prompt):

| Version | "Say it in English" spoken in English | Mistake recast | How do I say / Come si dice / garbled / no unasked English |
|---|---|---|---|
| 2026-10-18, thinking | 0% / 0% (Italy / Mexico) | 31% / 44% | — |
| 2026-10-18b, no thinking (production) | 0% / 0% | 13% / 19% | 100% |
| 2026-10-18b, thinking | 0% / 0% | 19% / 13% | 94–100% |

English when asked, for dropping the English translation line (Josh, 2026-10-19). Goal: with no translation on screen, "what does that mean?" and "say it in English" get English in the spoken line, briefly; no English nobody asked for. Probes: `core-behaviours.mts` with `PROMPTS=`, 8 characters × 2 runs; real asks: `help-asks.mts` replaying Josh's real asks (Italy 23, Mexico 5–6, from the admin export; "wanting English" includes "how do I say X", where an answer in the language is right, so it understates).

| Trial | Status | Text | Say it in English (Italy / Mexico) | What does it mean | No unasked English | Real asks wanting English, spoken English | Decision |
|---|---|---|---|---|---|---|---|
| 2026-10-18b (production) | Production | `character.md` | 0% / 0% | 0–6% / 0% | 100% / 100% | 22% / 0% | — |
| + "They see no translation… tell them in English, briefly, then carry on" | Dropped | `character-english.md` | 0–13% / 0–6% | 0–13% / 13–19% | 100% / 100% | 48% / 20% | The JSON line still said `line` is "in {language}", so the English went into `en` |
| + same, and the JSON line: `"line": "what you say, out loud: {language}, and English only when they ask for it"` | **Best so far** | `character-english2.md` | **100% / 100%** | **94% / 63%** | 100% / 100% | 52% / 33% | Not yet: in long real conversations "what does X mean" is still often explained in the language; needs the replay gate before it ships |
| + "what something means, in English or in {language}" (CLAUDE.md: help comes in English either way) | Tried | `character-english3.md` | 100% / 100% | 88% / 81%; asked in the language 100% / 81% | 100% / 100% | 55% / 40% | "How do I say" fell to 69% Italy: "In English: you say 'Vorrei…'" |
| english3 + teaching: "When they get a word or a verb form wrong, use it the right way in your answer, in passing" | Tried | `character-teach.md` | 100% / 94–100% | 88% / 88%; in the language 94–100% / 88–100% | 100% / 100% | 50% / 60% | See teaching below |
| teach + "When they ask how to say something, just say it in {language}" | Tried | `character-teach2.md` | 100% / 100% | 75% / 88%; in the language 75% / 100% | 100% / 100% | 48% / 17% | Within noise of teach (16 samples swing about ±15%); replay gate decides |

Teaching in character (Josh, 2026-10-19: at all levels; vocabulary, gender or number, conjugation, dialect). Goal: characters pick up more of the learner's errors, in role, without lessons or longer lines. `teach-moments.mts` replays each chance the character missed in Josh's real conversations (Italy 78–79, Mexico 6–8: too few) and judges the new line; mistake probe from `core-behaviours.mts`.

| Prompt | Mistake probe (Italy / Mexico) | Missed chances now picked up, Italy (conjugation) | Sounds like a lesson | Words per line | Decision |
|---|---|---|---|---|---|
| 2026-10-18b (production) | 0% / 13% | 21% (17%) | 1 | 26.1 | — |
| `character-english3.md` | 6% / 31% | 23% (23%) | 6 | 26.6 | — |
| `character-teach.md` | 69–100% / 88% | 49% (37%) | 5 | 29.3 | Replay gate next |
| `character-teach2.md` | 81% / 75% | 42% (34%) | 3 | 28.5 | Replay gate next |


### Diario cards (experiment, `tests/experiments/diario-cards.mts`)

Goal: cards worth reviewing, made from a real conversation. Round 17, admin export (Italy 28, Mexico 9 conversations).

| Version | Status | Pass 9 checks | Beginner follows line / replies | Decision |
|---|---|---|---|---|
| Today's stored review phrases (`memory.md`) as cards | — | 18–22% card-worthy | — | Not enough on their own |
| Card maker v1, one new prompt | Tried | 69% / 78% | 54% / 57% Italy, 38% / 35% Mexico | **Next: build from existing prompts instead** (`memory.md` picks frames, `character.md` + Beginner writes the line and answers, `replies.md` the replies), and compare |

### Noticing a conversation is over (experiment, `tests/experiments/end-detect.mts`)

Goal: the game knows when both have said goodbye, or the errand is paid and thanked (Josh, 2026-10-19), without ending anything early. Round 20, Italy, 26 real conversations, 153 character turns (Mexico: 1 conversation reached an end, too few). Truth: round 19's judge. Bar: ends early on 2% of turns or fewer, catches 90% of ended conversations.

| Way | Status | Ends early | Catches the end | Extra cost | Words per line | Decision |
|---|---|---|---|---|---|---|
| `over` on the character's reply (production `character.md`, trial schema) | Tried | 0% | 82% of 17 | none | 25.2 (25.6 without) | Recommended; changes `{ line, en }`, needs Josh |
| Separate judge after each line | Tried | 0% | 82% of 17 | a call, median 1.3 s, while the voice plays | unchanged | Same result for more cost |

