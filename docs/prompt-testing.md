# Prompt testing: how we change a prompt

Draft, 2026-11-06, for Josh's review. Josh: "You need to organize work in a disciplined way. You need to enumerate the prompt and decide which parts to test. You need to pick the smallest effective test size. You need tests that favor information gathering not 'guessed right', you need to consistently log tests." Then: "a prompt that doubled in size and got worse."

## Our pedagogy and what we test (Josh, 2026-11-07)

**Goal.** Cultural fluency: talking with local people about their place, in their language. Tipico, local and accurate.

**What we test.** Dialogue: every conversation where a character talks with the learner. In each, the character:

1. **At their level.** They can follow her.
2. **Accurate.** Nothing invented.
3. **Local and tipico.** Her place, her town, her country, as a local tells it.
4. **In character.** She stays her role.
5. **Responds to English.** She helps when they need it.
6. **Teaches in role.** Recasts, usable answers, no lectures.
7. **Remembers.** No retelling; uses what she knows about them.
8. **Brief.** Turns they can follow.

Each test card names the item it serves; how it's judged goes on the card. Measuring the learner's learning is a separate doc (to come).

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
10. **Define the behaviour, not a word.** A count by keyword measures the word, not the behaviour: "repeat" has to mean re-explaining as if new, not a recollection ("three days ago you saw the Danzantes") or a kept promise. When a keyword can't tell them apart, a judge with its reason shown does (T6 corrected).
11. **Maximise information gain; guard checks stay small.** Run first the tests whose outcome would change the most about what we know and do (Josh, 2026-11-07: a test that eliminates 80% of a prompt and wins is better than adding one more small thing to fix a moment). Run a test only when its outcome can't be predicted and each outcome would change what we do; a replication whose result is already known (T3 after T1) teaches little except by reading. Different mechanisms head to head teach the most. Before shipping, a small guard check still runs, though it teaches little.
12. **A result ends in a decision.** Every entry says what the result means for the prompt (cut, keep, rewrite, test further), in one line. A finding that changes nothing isn't finished.
13. **Guards on every test.** Words per turn, reply time, how much of the turn is in the language, answers offered. A change that wins its measure and breaks a guard isn't kept.
14. **One log.** `docs/prompt-trials.md`: every test is one entry, the card plus results, decision, output file and commit, written the same day whatever the outcome. A kept prompt change also bumps the version and adds a changelog entry (`npm run test:prompt`).
15. **Beginner first, then the rest.** Josh plays Beginner. Fixes go on the shared layer for every character and both countries ("fixes are global"), but they're tested where the problem shows first.
16a. **Over 5 minutes needs Josh's approval** (Josh, 2026-11-07: "we should require approval for any test over 5 min"). Every card estimates its running time; a test expected to take longer than 5 minutes runs only after Josh says yes to that card. A test that turns out longer than its estimate stops at 5 minutes and asks.
16. **Josh decides design, Claude decides tests.** Framings and goals ("stay in your job", "stay in your role" and "be yourself" are three different ideas) are Josh's to choose; the test design, running and reading are Claude's. A cut reaches the game only after Josh has seen its log entry, at the next release.

## Proposed additions (Claude, 2026-11-07, for Josh's review)

Six changes to the rules above, from a cloud-session review. None is in force until Josh says so.

17. **A learning guard on every card.** Guards today are words per turn, reply time, language share and answers offered; none says what the learner learns, though teaching wins (CLAUDE.md). Add: the language is at the learner's level (the level judge), and where the moment holds a learner mistake, whether it was recast correctly. A change that wins its measure but makes the character harder to learn from fails.
18. **Calibrate a judge before trusting it.** Claude judging Claude shares blind spots (the lenient drift judge, rule 7). Before a judge's count is used, Josh marks about 20 replies yes or no for the judge's question; the judge is kept only if it agrees on at least 17. Stored once per question (`tests/experiments/judges/<question>.json`) and reused.
19. **A difference threshold written in advance.** With 10 runs, a gap of 2 or 3 is usually noise. Each card states its threshold before running, e.g. "B wins by at least 4 of 10, and the two control runs are within 2 of each other"; a close result is rerun, not read.
20. **Every complaint becomes a moment first.** When Josh hits something in play, the exact turn (the learner's line, the memory notes, the stage) goes into `moments.json` before anyone fixes it. Every kept change is then rerun on all stored moments: a check between one-moment tests and the full variety gate, so an old problem can't come back unseen.
21. **A category can be one variable.** "All examples out" or "the whole opener recipe out" is one variable: the kind of thing. Test the category first and split it only if it loses, instead of about 25 one-unit cuts that interact.
22. **Rerun the control when the model changes.** Every card records the model id and settings; after a model change, old results are not trusted until the control has been run again on the new model.

Smaller: a kept change gets a small check in the other country before it ships ("fixes are global"); the welcome counts as a kind of conversation and gets cards like the rest.

## Time box and better judges (2026-11-07)

**Time box: 1 to 3 days** (Josh, 2026-11-07: "I'm more inclined for a 1 to 3 day time box"). The first real results (V2, then A1) come within 1 to 3 days, with only the judges those tests need. If the process hasn't produced decisions by then, cut the process back rather than add to it. Suggested days (Claude): day 1, V2 on real conversations with a level count from word lists and Claude judges for the other items; day 2, a second model's judge where Claude's answers look shaky, and Josh marks the disagreements; day 3, decide what the results say and plan the next round.

**Risks named (Claude's assessment, 2026-11-07):** judges are the weak link (Claude judging Claude, on soft items like local and native); process can outrun results; the prompt may not be the biggest lever (the kind of place, `here` lines, memory and the model are test variables too); the eight items stand in for learning, checked only by a few players; few runs means noise, so thresholds must be respected.

**Proposals for better judges, for Josh's decision:**
- **A second judge from another company's model** for the subjective items (sounds native, local and tipico, in character): agreement strengthens a verdict; disagreement marks the line for a human. Needs that provider's key, in test scripts only. The roadmap already allows it when a shared blind spot shows up.
- **Native-language resources, so some judges become measurements:**
  - At their level: official graded word lists, counted in code: Italian, De Mauro's *Nuovo vocabolario di base* and the *Profilo della lingua italiana* (already cited for CEFR levels); Spanish, the Instituto Cervantes *Plan Curricular*. Kept as content per language.
  - Accurate: a judge that checks each claim against a source (the place's or dish's Italian or Spanish Wikipedia page), not the model's memory.
  - Sounds native: the judge anchored with real native dialogue as examples (textbook dialogues, transcribed film and TV).
- **A native reader as the gold standard:** about 20 lines marked once by an Italian and a Mexican reader (a friend or a paid tutor) calibrate every judge better than anything automatic.
- **Open question for Josh:** on 2026-11-02 he ruled out outside tools ("LanguageTool caught no Italian grammar errors; subtitle lists count words, not phrases"). Graded level lists and source-checked facts are a different kind of resource; whether the ruling covers them is his call.

## The queue

Tests to run, in order, each to become a full card before it runs. The tools come first: rules 5, 7 and 8 work around a simulated learner that steers and judges that were lenient or literal; F1 and F2 fix the tools themselves. Who decides what: design questions are Josh's (rule 16).

| # | Question | Type | Unit | Waits on |
|---|---|---|---|---|
| F1 | **Fix the judges, don't work around them** (Josh, 2026-11-07: "we are working around flawed judges or learners rather than fixing them"). One narrow judge per item of "What the character must do", each with pass and fail examples. A judge passes when it agrees with Josh on at least 17 of 20 replies he marks for its item; only a passing judge is used, and then lines are read as samples, not all. | tool | method | Josh marks 20 replies per item |
| F2 | **Fix the simulated learner.** A learner at a set level who only responds to what the character says, never brings up a topic of their own, and makes realistic mistakes and mishearings. It passes when Josh would believe its lines came from a real learner at that level, and it brings up the measured topic itself in under 1 in 20 conversations. With F1 and F2 passing, whole dialogues become usable for items 3, 4 and 7, not only moments. | tool | method | Josh reads a sample of its lines |
| V1 | Does a gain on a moment show up in whole conversations? One change known to move a moment, measured on its moments and on whole dialogues (5 places × 2 visits, fixed learner lines). If moments win and dialogues don't, that item needs dialogue tests (Josh, 2026-11-07: "the implication is tune moments, trust conversation improves") | moment, then dialogue | method | Q1 |
| V2 | Can a problem seen in a conversation be isolated as a moment? A judge marks turns that break one of the eight items in 10 dialogues; each becomes a moment, replayed 5 times: does the problem come back in at least 2? (Josh: "problems in conversation can be isolated") | dialogue, then moment | method | Q1 |
| Q1 | Build `moments.json`: the real turns behind recent complaints. **Started 2026-11-07:** 10 moments gathered from the experiments that held them inline (Luisa and Doña Chela's openings, Carla's invented errand, Beto's torta, Ardit's ribollita, Magda's joven and cansado, Efrén's return visit); `tests/experiments/moments.mts` replays one through the server's turn code; `npm run test:moments` checks they still point at real places. Four complaints still need their real turns from the admin export (listed in the file: Don Nacho's long answer, the cornetto at a pharmacy, Luisa's cappuccino line, Giorgia's pizzeria), and Italy has only 3 | setup | — | the laptop, for the four turns |
| Q2 | Calibrate the judges the queue needs (native-sounding; recast correct; at the learner's level) | setup | — | Josh marks ~20 replies each |
| A1 | **Does each part do something?** Leave-one-out (Josh, 2026-11-07: "part vs no part for each part … a baseline for the value of including a part before tweaking it"): the Beginner moments with all parts, then with each named part switched off in turn (`setPartsOff`), single parts only. Each removal is judged on the items its part claims to serve, plus the guards. Who: you, Who: the learner, How you talk and Reply: parts format stay in. About 20 parts × moments × 5 runs; a part showing no effect gets a rerun before it's called dead. Output: a value for every part, the baseline before any part is changed. Script: `tests/experiments/ablate.mts` | moment | every part of beginner.md | F1, Q1 |
| A1b | **Do parts cover for each other?** A hypothesis, not an assumption (Josh, 2026-11-07): run only if A1 shows a part with no effect where it should matter. Switch off that part and the one the inventory guesses overlaps it, together (`PAIRS=1`), on the same moments; if the pair loses what neither did alone, they cover for each other: keep one, not both | moment | the pairs A1 points to | A1 |
| T8 | Does the Beginner prompt need its display instructions? Remove every mention of the screen or the game from beginner.md and the stage text ("shown in a bubble", "the game says its English right after", "heard, not shown", "shown to them, not said by you"), rules otherwise unchanged; Beginner moments at S1 and S2, 10 runs each, against today's. Serves items 1, 5, 6, 8; counted: valid parts, English sentences per turn, English repeating the language's meaning, words per turn. Hypothesis: no worse beyond noise (B no more than 2 of 20 worse per item), about 120 words shorter. If worse, the display talk was doing content work: rewrite it as a content rule. The clean single cut before CD1 (Josh, 2026-11-07: "testing base prompt (no display) vs current") | moment | the display mentions in English: brief, Language: what to keep, Language: phrases, Answers: as a local says them, Reply: parts format | F1, Q1 |
| CD1 | Content and display separated (dialogue-model.md → Decided): one Beginner prompt with one language dial and no mention of the screen, answers and the English echo chosen by display rules per step, against today's S1–S3 stage texts, on the stored moments at each step. Wins if it's at least as good on items 1 (at their level), 5 (responds to English) and 6 (teaches in role), with the prompt much shorter | moment | beginner.md, leveling.md | F1, Q1 |
| Q3 | The floor: the smallest Beginner prompt beside today's, on the stored moments | moment | whole beginner.md | Q1 |
| Q4 | All examples out of beginner.md (one category) | moment | the examples inside B4, B11, B13… | Q1 |
| Q5 | B21 ("never point out a mistake") out, since dialogue.md's D1 already covers corrections | moment | B21 | Q1, Q2 (recast judge) |
| Q6 | Answers outside an errand: as brief as a local says them, or a whole sentence with the question's verb | moment | the answer units | Josh decides the framing first |
| Q7 | Intermediate prompt written in Italian (character.md translated; the JSON line stays English) | moment | character.md, whole | Q1, Q2 (native judge) |

## The card

Every card is reviewed by the **test designer** agent (`.claude/agents/test-designer.md`) before it runs: can it answer its question, the smallest size that can, what it would teach, and its place in the queue. Give it the card, or "the queue" to reorder (Josh, 2026-11-07).

Every test starts as this card, shown to Josh in this form and pasted into the log:

```
Test T<n>: <the question in one line>
Serves: <item 1–8 from "What the character must do">
Type: moment / visit
Unit: <part name(s), e.g. "English: brief", and file>
Variable: <the one thing that changes> (A: …, B: …)
Held constant: <everything else, including the learner's lines>
Moments: <which, from moments.json>
Measure: <what is counted, how (code or judge), out of how many>
Hypothesis: <expected result, with the threshold>
Other outcomes: <what each would mean>
Size: <moments × runs × versions>
Time: <estimated minutes; over 5 needs Josh's yes before running>
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
- A second log was started (rule 14).
- Results came without the decision they implied (rule 12).
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
