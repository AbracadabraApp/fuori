# Prompt testing: how we change a prompt

Draft, 2026-11-06, for Josh's review. Josh: "You need to organize work in a disciplined way. You need to enumerate the prompt and decide which parts to test. You need to pick the smallest effective test size. You need tests that favor information gathering not 'guessed right', you need to consistently log tests." Then: "a prompt that doubled in size and got worse."

## Why: the Beginner prompt

The Beginner system prompt (`content/*/prompts/beginner.md`) went from 504 words (2026-10-25b) to 1,245 (2026-11-06) in 18 versions over 12 days, and the shared rules (`dialogue.md`) and the stage text (`leveling.md`) are added on top. It shrank only twice. The pattern behind the growth:

- **One complaint, one new rule.** Each version answers a problem seen in one conversation ("cafe, coffee, cafe", a taxi driver taking an order) with a sentence added, rarely with one removed.
- **Fixed by eye.** About ten of the units were ever measured; the rest were judged on a handful of replies.
- **Examples become content.** About a dozen examples sit inside rules, nearly all a bar, a coffee, a cornetto or an order; characters quote them back (a cornetto at a pharmacy).
- **Rules overlap and conflict.** English is "two short sentences" in one place and "one sentence" in the stage text; answers are "sometimes two" and "at most one"; "stay within your job" sits in two files.
- **Instructions get repeated.** Whatever is planted, a topic in a `here` line or a weather line, gets said on nearly every visit (24 of 24 openers for the weather). The same is true of instructions about what to talk about.
- **Big tests, loose judges.** Tests of 12 places × 3 visits × 2 levels with a simulated learner and a lenient judge reported "drift" that wasn't there, and results were logged unevenly.

So the job now is less adding and more finding out what each part does.

## The rules

1. **Know the parts.** Every prompt has an inventory: each unit, its size in words, the dated problem it was written for, whether it was ever measured (`docs/beginner-prompt-inventory.md` for the Beginner prompt). A test names the unit it touches.
2. **Cutting is the default.** A unit stays only if removing it measurably hurts. A new unit has to beat cutting an old one: the prompt does not grow without a test that shows the words pay. Examples go first.
3. **One variable.** A test changes one thing. Two changes at once (a sentence and its example; a topic and an instruction) can't be told apart afterwards.
4. **Write the card before running.** The question, the variable, what's held constant, the measure, the hypothesis with its threshold, and what each other outcome would mean. A threshold set after seeing the data isn't a threshold.
5. **Fixed moments, not free play.** A unit is tested at the moment it acts, with the learner's lines fixed, taken from real conversations and stored once (`tests/experiments/moments.json`): an opener, the turn after "I'm very hungry", a turn where answers are offered. A simulated learner adds its own variation and can start the very thing being measured (asking about coffee in a café). Free play (the variety gate) is for checking a kept change, not for testing a unit.
5b. **Two types of test** (Josh, 2026-11-06: "they can be different types of tests"). A **moment test** is one turn with everything fixed, the learner's line and the memory notes too: it shows what a unit does. A **visit test** is several visits in a row with memory written by the real summariser between them: it shows what carries over and repeats (T1). Visit tests still use fixed learner lines, not a free simulated learner. The card says which type.
6. **Smallest size that can answer.** Start at Beginner, stage 2, one country, 2 moments × 5 runs per version. Run the control twice the first time a moment is used, to see the noise. Widen only when the result is close; stop when it's clearly no.
7. **Count in code where possible.** Words, English sentences, questions per turn, answers offered, a word from a fixed list (the parts already carry their kinds). When a judge is needed: one yes/no question, its reason printed, and every line read before a count is believed.
8. **Keep everything, read everything.** Every reply is saved to a file. Nothing is reported until the lines have been read. Report the numbers first, then what they mean.
9. **Fix what's counted before the run, and keep it clean.** A word list or set is written on the card before running, and leaves out every word that's already in the prompt or in the learner's lines: a place named in the character's own `here` line isn't something she brought up. The learner's lines (fixed or simulated) must not name what's being measured.
10. **A result ends in a decision.** Every entry says what the result means for the prompt (cut, keep, rewrite, test further), in one line. A finding that changes nothing isn't finished.
11. **Guards on every test.** Words per turn, reply time, how much of the turn is in the language, answers offered. A change that wins its measure and breaks a guard isn't kept.
12. **One log.** `docs/prompt-trials.md`: every test is one entry, the card plus results, decision, output file and commit, written the same day whatever the outcome. A kept prompt change also bumps the version and adds a changelog entry (`npm run test:prompt`).
13. **Beginner first, then the rest.** Josh plays Beginner. Fixes go on the shared layer for every character and both countries ("fixes are global"), but they're tested where the problem shows first.
14. **Josh decides design, Claude decides tests.** Framings and goals ("stay in your job", "stay in your role" and "be yourself" are three different ideas) are Josh's to choose; the test design, running and reading are Claude's. A cut reaches the game only after Josh has seen its log entry, at the next release.

## The card

Every test starts as this card, shown to Josh in this form and pasted into the log:

```
Test T<n>: <the question in one line>
Type: moment / visit
Unit: <inventory id and file>
Variable: <the one thing that changes> (A: …, B: …)
Held constant: <everything else, including the learner's lines>
Moments: <which, from moments.json>
Measure: <what is counted, how (code or judge), out of how many>
Hypothesis: <expected result, with the threshold>
Other outcomes: <what each would mean>
Size: <moments × runs × versions, time>
Guards: words per turn, reply time, language share, answers offered
Result: <numbers, both control runs>
Read: <yes, all lines; file>
Decision: keep / cut / widen / drop, and why
```

## What the first tests taught (2026-11-06)

**T1:** a `here` line sentence telling the character what to talk about ("You love talking about café de olla…", Ximena, Café Amapola) was said on 15 of 15 visits; without it, 0 of 15. **T1b:** removing it didn't reduce her local talk (14 of 15 visits with it, 15 of 15 without). **Decision:** `here` lines say who the person is and what the place is, with no "you like telling…" or "you love talking about…"; that goes for every country and every new line.

How the first tests went wrong, each now a rule above:
- The plan came as an essay and a table of codes Josh couldn't read; the tests arrived undefined, and Josh had to ask for the variable, the result and the hypothesis one at a time (rule 4, the card; Talking about tests).
- The first version of T1 changed two sentences at once (rule 3).
- Hidden instructions inside `here` lines ("explaining the menu slowly") went unnoticed until Josh asked (rule 1: the inventory lists every instruction, including those inside `here` lines).
- A second test was proposed that wasn't different from the first: a planted "story" is the same instruction as a planted "topic" (rule 4: the card's question has to say what it would teach that the last test didn't).
- Results were reported from the first line of each visit, and the rest wasn't saved (rule 8).
- The question changed after the data was seen, and the counted set was written afterwards and included Condesa, which is in her own line (rules 4 and 9).
- A simulated learner chatted freely, against the plan's fixed moments, and its own prompt named Condesa (rules 5 and 9).
- No threshold before running, and findings that went beyond the numbers ("crowds out", "no real culture") were logged, then withdrawn when Josh asked for the measurement (rules 4 and 8).
- A second log was started (rule 12).
- Results came without the decision they implied (rule 10).
- The tests before these were too large (12 places × 3 visits × 2 levels) with a lenient judge (rule 6, rule 7).

## Taking a grown prompt back down

For a prompt that doubled and got worse, in this order:

1. **The floor.** Build the smallest prompt that can work: who and where the character is, the Beginner format (parts, one question, answers to say back), and the level. Run it on the moments beside today's prompt. It shows how much the other 900 words are doing.
2. **Cut the suspects one at a time** from today's prompt (leave one out): the examples inside rules, then the units that overlap (two rules for one thing: keep one), then the scripts (the opener recipe, the errand sequence), then instructions that tell the character what to talk about.
3. **Add back only what a test shows.** A unit cut in step 2 comes back only if the floor or the cut version measurably loses something the learner needs.
4. **Then the variety gate once,** at both levels, to check nothing broke in free play, and Josh plays it on the phone.

## Talking about tests

- The card, not an essay. Codes like B10 only next to the words they stand for.
- A question gets a one-line answer.
- Numbers before interpretation; "I don't know yet" when the lines haven't been read.
