# Leveling: the model (2026-11-02)

Josh, 2026-11-02, after the first run: "if you are willing to sign up for that table as a leveling model I'm good going forward under your lead. Otherwise lets create a different model (as simple as works or works even while more complex parts aren't built)". Claude signed up for it, with the condition that its first version works with what exists now. The framing is in [05 → Josh's framing: one equation](05-designs.md#joshs-framing-one-equation-2026-11-02).

## The model

- **Learner:** one number per learner, updated after every conversation from its record: words spoken, the share in the language and in their own words push it up; being lost (English instead of an answer, the whole line again, silence) pulls it down a little.
- **Conversation:** a set of settings (talk block, English echo, answers to say back, question kind; later voice speed and subtitles), each with a difficulty value; the conversation's difficulty is their sum.
- **Choice:** the settings that put the learner's predicted share of followable words at about 90–95%. A bad conversation brings a support back.
- **Loop 1:** the learner's number, after every conversation. **Loop 2**, later: each setting's real value, fitted from everyone's records.

## Version 0 (works now)

- Setting values are hand-set guesses in the research's order, bundled as Josh's fading stages: the prototype's ladder (`tests/experiments/leveling/ladder.ts`) is v0 of the equation, not a separate design.
- The learner's number moves by simple rules on the record (`RULES`).
- Loop 2 waits for data: the app storing, per conversation, the settings, the learner's number before, the record after. A schema change: needs Josh's yes.

## How we know it works

1. **The dials turn:** each setting measurably changes how much is followable. Measured per setting, not by simulated learners climbing (Claude, 2026-11-02: the simulated learner improves on a schedule set in `learners.ts`, so its climbing tests our own numbers; designs A and B differ only at the step into Intermediate).
2. **The learner signals mean something:** on Josh's and Sophia's real conversations, good and bad conversations have clearly different records.
3. **In play:** words spoken per conversation, and the share in the language, rise over weeks.

If the dials don't turn, the model fails its first test.

## First evidence: the first run, re-scored

The 2026-11-02-19-51 run ([re-scored report](../../../tests/experiments/leveling/results/2026-11-02-19-51-all-rescored.md)), its saved conversations scored again (no new character calls, about $2), with a word said with its English counting as known and each conversation also scored as a whole:

| Design | Lines followable | Conversation: words known with the echo | Without the echo | Conversations 90%+ |
|---|---|---|---|---|
| A | 74% | 94% | 64% | 88% |
| B | 83% | 96% | 66% | 94% |
| C | 77% | 95% | 67% | 88% |

All of it is stage 1. With the echo, stage 1 sits in the 90–95% target; without it, about 65%. **The echo is worth about 30 points: the first dial turns.** The first run's 14–19% was the measure, not the dialogue (06-first-run.md). A, B and C are the same within 2–9 points, as expected: they don't differ below Intermediate.

## Next

1. **Measure the dials** (`tests/experiments/leveling/dials.mts`, to build): each setting on and off, about 10 characters each, scored with and without the echo and for liveliness.
2. **The learner signals on real conversations:** the record for Josh's and Sophia's conversations.
3. **Ask Josh** for the per-conversation storage (loop 2's data).

## Do the dials turn? First measure (Italy, 2026-11-02)

`dials.mts`: 10 people × 9 dials, an opening and 3 replies each, the same people for every dial, an A1 learner in their own words; scored at the stage-1 listener ([report](../../../tests/experiments/leveling/results/2026-11-02-20-40-dials-it.md), 1,080 calls, about $9). Change against stage 1, per person (± one standard error):

| Dial | Words known, with echo | Without echo |
|---|---|---|
| Talk: stage 2 | +0 ±2 | +6 ±3 |
| Talk: stage 3 | −2 ±2 | +3 ±3 |
| Support back | −1 ±2 | −2 ±2 |
| Echo: new words only | −0 ±2 | +4 ±3 |
| **Echo: off** | **−31 ±3** | +1 ±3 |
| Answers: one | −0 ±1 | +5 ±2 |
| Answers: a frame | +1 ±2 | +6 ±3 |
| **Intermediate (B1)** | **−45 ±3** | **−14 ±4** |

Read (Claude):
- **One Beginner dial turns: the English echo** (−31). The rest don't move the Italian: the talk blocks for stages 2 and 3 and "support back" leave it as easy as stage 1 (if anything easier). The talk block is a paragraph added after beginner.md, whose own rules ("a beginner can follow: short, common words, present tense") win.
- **Then a cliff:** Intermediate is 45 points harder with the echo gone and 14 harder in the Italian alone. Between stage 1 and Intermediate there is no measured middle.
- The answers dials can't show here: they change what the learner can say, and this learner always used their own words. The simulated A1 learner was never lost, even at 60% known: too competent, as research 02 warned, so its turns are no measure of difficulty.
- Liveliness: stage 1 the flattest (4.8), Intermediate the liveliest (6.0).

For the model: the difficulty of the language itself has no working dial below Intermediate. Next: give it one that's concrete enough to obey (the share of each turn in the language, phrase length, how many new words a turn), measure it the same way, and look for settings that fill the gap between stage 1 and Intermediate.

## The Language dial (leveling.md 2026-11-02c, Italy, 2026-11-02)

Same test, same 10 people ([report](../../../tests/experiments/leveling/results/2026-11-02-20-47-dials-it.md), 960 calls, about $8). Four Language blocks that give how much of the turn is in the language and how hard, in numbers, and say they replace beginner.md's guidance:

| Dial | Share of the line in the language | Words in the language per line | Known, with echo (Δ vs stage 1) | Without echo (Δ) |
|---|---|---|---|---|
| Stage 1 | 40% | 12.6 | 92% | 59% |
| Language 1 | 34% | 7.7 | −5 ±2 | −4 ±2 |
| Language 2 | 52% | 14.3 | −1 ±2 | +2 ±2 |
| Language 3 | 54% | 16.4 | +0 ±2 | +1 ±3 |
| Language 4 | 70% | 18.6 | −6 ±2 | −2 ±3 |
| Language 3, echo new words | 53% | 14.9 | +0 ±2 | +1 ±3 |
| Language 4, echo new words | 58% | 16.3 | −1 ±2 | +0 ±2 |
| Intermediate (B1) | 100% | 20.0 | −49 ±2 | −17 ±3 |

Read (Claude):
- **The dial turns how much, not how hard.** The share of the line in the language goes 34% → 52% → 54% → 70%, and its words per line more than double. But the words stay as easy as stage 1: known without the echo stays 55–62% at every level, against 43% at Intermediate. Inside beginner.md the model keeps beginner words whatever it's told about sentence length, tenses and new words.
- So there are two working dials and one missing: **amount** (Language blocks) and **echo** (on, new words, off); **word difficulty** moves only when the prompt changes from beginner.md to character.md.
- A path from stage 1 to Intermediate can be built from what turns: more of the language (1 → 4), then the echo fading (all → new words → off). The step that's left is the words themselves (about 60% → 43% known to a newcomer), which only the switch to the character prompt makes.

Next: approach the gap from above: character.md with levels.md's existing Beginner blocks (situation, still you, can answer, …), which never had the Beginner parts, to see whether word difficulty moves between 60% and 43% there.

## From above: the character prompt with Beginner blocks (Italy, 2026-11-02)

Same 10 people ([report](../../../tests/experiments/leveling/results/2026-11-02-20-50-dials-it.md), 600 calls, about $3): character.md with levels.md's existing Beginner blocks, all in the language, no Beginner parts or echo. Known to the newcomer listener, against stage 1's 59% (Δ per person):

| Dial | Known (all in the language) | Δ vs stage 1 | Words per line | Alive |
|---|---|---|---|---|
| character.md + Beginner: situation, still you | 55% | −4 ±3 | 11.4 | 5.8 |
| character.md + Beginner: still you, ask | 59% | −1 ±3 | 12.7 | 5.6 |
| character.md + Beginner: shape | 55% | −5 ±2 | 16.0 | 4.8 |
| character.md, no level block (Intermediate today) | 46% | −14 ±3 | 18.3 | 6.1 |
| character.md + Intermediate: B1 | 49% | −10 ±3 | 20.5 | 6.4 |

Read (Claude):
- **Word difficulty does turn, from above.** A Beginner block in the character prompt keeps the words as easy as stage 1 (55–59%) while everything is in the language and the conversation is livelier (5.6–5.8 against stage 1's 4.9). Without a block, or with the B1 one, the words are about 10–14 points harder.
- The B1 block isn't harder than no block (49% vs 46%, within the noise between runs: B1 measured 43% and 45% earlier). It works as a "still you" reminder, not a dial.
- So every step from stage 1 to Intermediate now has a setting that moves it, measured:

| Step | Prompt and settings | In the language | Known, with what they hear |
|---|---|---|---|
| 1 | beginner.md, stage 1, echo all, two answers | ~40% | ~92% |
| 2 | beginner.md + Language 2–3, echo all | ~53% | ~90% |
| 3 | beginner.md + Language 4, echo new words only | ~60–70% | ~90% |
| 4 | character.md + "Beginner: still you, ask" (English subtitle after each line, as the app shows) | 100% | ~57% (easy words, no echo) |
| 5 | character.md (Intermediate) | 100% | ~46% |

The biggest single step is 3 → 4, where the echo goes. In the model that's the learner's number at work: by step 4 they should know more of the words than the newcomer listener does, and the subtitle and help remain. Real play decides whether it's too big; "Language 4, echo off" is a measured setting that could sit between (57–60% known).

## Mexico (2026-11-02)

The same dials, Mexico's 10 people ([report](../../../tests/experiments/leveling/results/2026-11-02-22-09-dials-es-mx.md), 1,075 calls, about $9):

| Dial | In the language | Known, with echo | Without echo |
|---|---|---|---|
| Stage 1 | 47% | 94% | 75% |
| Talk: stage 2 | 48% | 90% | 77% |
| Echo off | 54% | 70% | 70% |
| Language 2 / 3 / 4 | 52% / 48% / 59% | 91–93% | 69–72% |
| Language 4, echo new words | 59% | 93% | 67% |
| character.md + "Beginner: still you, ask" | 100% | 64% | 64% |
| character.md (Intermediate today) | 100% | 54% | 54% |

Read (Claude): the same shape as Italy. The echo turns (−24), the talk block doesn't, the character prompt with a Beginner block keeps words easier than Intermediate (64% vs 54%). Two differences: Mexico's stage 1 already has more Spanish (47% vs 40%) and its words are easier for a newcomer (75% vs 59% known without the echo: many Spanish words are close to English), so the Language dial moves less (47% → 59%). The path holds in both countries.

## In the app (2026-11-02)

Josh: "go" to build 9, the record table and replacing the Beginner level. Version 0 is `lib/path.ts` (the steps and stages, RULES, moving up) and `lib/conversation-record.ts` (the record of every ended conversation, the path's state with it). Placement is still the onboarding level (Beginner or none → step 1); the finer placement by *Parli italiano?* (nothing → 1, a little → 3) is next. Silence isn't in the record: the server doesn't see it.
