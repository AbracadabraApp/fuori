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
