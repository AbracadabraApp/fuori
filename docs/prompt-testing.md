# Prompt testing: how we change a prompt

Draft, 2026-11-06, for Josh's review. Josh: "You need to organize work in a disciplined way. You need to enumerate the prompt and decide which parts to test. You need to pick the smallest effective test size. You need tests that favor information gathering not 'guessed right', you need to consistently log tests." Then: "a prompt that doubled in size and got worse."

## Our pedagogy and what we test (Josh, 2026-11-07)

**Goal.** Cultural fluency: talking with local people about their place, in their language. Tipico, local and accurate.

**What we test.** Dialogue: every conversation where a character talks with the learner. In each, the character does nine things in three groups, matching the goal: the language, the culture, and real people to talk with (Josh, 2026-11-07). The numbers stay as they were, since cards and log entries cite them.

**Culture** (tested first, Josh, 2026-11-07). Goal: the learner comes away knowing real things about this place: true, specific things a local would tell a newcomer about their shop, their town, their country, that the learner could bring up with someone else tomorrow. It fails two ways, both about what she says: invented (item 2) or generic, true anywhere (item 3). How she says it (lecturing, not sounding local) belongs to items 8 and 4, not here (Josh, 2026-11-07: "guidebook is probably the wrong test").

2. **Accurate.** Nothing invented.
3. **Local and tipico.** Her place, her town, her country, as a local tells it.

**Character** (tested first, with Culture). Goal: the learner meets a real person who knows them: someone in a real role who acts like it and remembers them, so the learner wants to come back. It fails when a student on the steps takes a food order, or she retells last visit's story as new. How she helps them learn is the teaching, tested with Language.

4. **In character.** She stays her role.
7. **Remembers.** No retelling; uses what she knows about them.

**Language** (after Culture and Character; to be rethought before it's tested, Josh, 2026-11-07: "not a very well thought through structure, it's been jerry-rigged into the prompt; it's important but we are right to tackle it after other dialogue"). Working goal: the learner can follow her and copy her: every turn within reach at their level, short enough to hold, and correct, since they repeat it; English there when they ask. It fails when a closing question is above a Beginner, a turn runs long, she says "il gnocchi", or she won't help in English.

1. **At their level.** They can follow her.
8. **Brief.** Turns they can follow.
9. **Grammatical.** Her own language is correct, since the learner copies it.
5. **Responds to English.** She helps when they need it.
6. **Teaches in role.** A fishmonger helps a newcomer the way a fishmonger would (slows down, repeats, offers a word, recasts a mistake), never as a school teacher (Josh, 2026-11-07: "Does a fish monger turn into a school teacher"). Tested with the teaching, not with Character (Josh, 2026-11-07: "the teaching issue belongs in the teaching tests"): C2 showed the teacher talk comes with the teaching format (answers to say back), so it's tested when that part is built.

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
3. **One variable, one measure.** A test changes one thing and measures it one way, on one item (Josh, 2026-11-07: "Tests should have a single measure for each variable"). Two changes at once (a sentence and its example; a topic and an instruction) can't be told apart afterwards.
4. **Write the card before running.** The question, the variable, what's held constant, the measure, the hypothesis with its threshold, and what each other outcome would mean. A threshold set after seeing the data isn't a threshold. Every test script calls `startTest(<card title>)` (`tests/experiments/common.mts`) first: it refuses to run without the card in the log, every line filled, a `Reviewed:` line, and `Josh: yes` when the time is over 5 minutes (Josh, 2026-11-07: "We need a strict methodology for testing").
5. **Fixed moments, not free play.** A unit is tested at the moment it acts, with the learner's lines fixed, taken from real conversations and stored once (`tests/experiments/moments.json`): an opener, the turn after "I'm very hungry", a turn where answers are offered. A simulated learner adds its own variation and can start the very thing being measured (asking about coffee in a café). Free play (the variety gate) is for checking a kept change, not for testing a unit.
5b. **Two types of test** (Josh, 2026-11-06: "they can be different types of tests"). A **moment test** is one turn with everything fixed, the learner's line and the memory notes too: it shows what a unit does. A **visit test** is several visits in a row with memory written by the real summariser between them: it shows what carries over and repeats (T1). Visit tests still use fixed learner lines, not a free simulated learner. The card says which type.
5c. **Four methods, one job each** (settled with Josh, 2026-11-07).

| Method | Job | Not for |
|---|---|---|
| Historical (real conversations from the admin export) | Finding problems and counting how often they happen today, before a test is chosen | testing a change |
| Moments (one turn, with the conversation before it, from a real conversation) | Testing a change on a problem that shows in one turn | anything that builds across visits |
| Multi-turn (visit tests) | Testing what builds across visits: buying, repeats, local talk, memory | single-turn problems |
| Invented (a simulated learner) | The free-play check after a change is kept (the variety gate) | testing a change, until F2 passes |

A moment carries the conversation before it: Beto's order came back 4/5 that way (V2 rewritten). Multi-turn tests use short fixed learner lines that fit after almost any reply and don't name what's measured ("Buongiorno", "Come sta?", "Da quanto tempo lavora qui?", "Grazie, a domani", in the country's language); the pilot checks they read naturally.
5d. **Two judges: Claude and Grok** (settled with Josh, 2026-11-07). A judgment measure (rule 7b) is judged by both Claude and Grok (`grok-4.7`), each given the same question; neither is the primary. A line counts when they agree. Where they disagree, the line is read: usually a rule is missing (the small judge test: whether "voleva / quería" is fine at Beginner when the answers model it), and that rule is Josh's to decide. The disagreement rate decides whether a judge question is trusted: few disagreements, the count stands; many, the question is fixed before its count is used. Josh marks only the disagreements, not 20 replies per item. Fact measures need no judge. Grok is used in test scripts only: it never plays a character and its key is never in the app or the server.

6. **Two sizes: a pilot, then the real run** (Josh, 2026-11-07: "the smallest test possible to make sure the test runs, and maybe get an early direction; larger tests to improve accuracy"). The **pilot** is the smallest run that exercises every step (1 moment × 2 runs per version, about a minute): it checks the script, the counts and the saved lines, and may show a direction. A pilot's numbers are never a result and never decide anything. The **real run** is sized for accuracy, set on the card before the pilot: start at Beginner, stage 2, one country, 2 moments × 5 runs per version, with the control run twice the first time a moment is used, to see the noise. Widen when the result is close; stop when it's clearly no. A pilot that shows a broken measure is fixed and piloted again before the real run.
7. **Count in code where possible.** Words, English sentences, questions per turn, answers offered, a word from a fixed list (the parts already carry their kinds). When a judge is needed: one yes/no question, its reason printed, and every line read before a count is believed.
7b. **Facts first; a judgment is flagged** (Josh, 2026-11-07: "tests should be flagged if not easily measure with facts"). Every card says whether its measure is a **fact** (counted in code: words, sentences, questions, a word written on the card before the run, the same words in two openers) or a **judgment** (a judge decides). A judgment card is flagged as such on the card and in its log entry, and its result is read as weaker. Difficulty is a fact: the words in the language per turn, leaving out her English and the answers to say back (Josh, 2026-11-07: "a better way to test difficulty is number of words"); not a judge.
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
18. *(Replaced by rule 5d, 2026-11-07: two judges, Josh marks only their disagreements.)* **Calibrate a judge before trusting it.** Claude judging Claude shares blind spots (the lenient drift judge, rule 7). Before a judge's count is used, Josh marks about 20 replies yes or no for the judge's question; the judge is kept only if it agrees on at least 17. Stored once per question (`tests/experiments/judges/<question>.json`) and reused.
19. **A difference threshold written in advance.** With 10 runs, a gap of 2 or 3 is usually noise. Each card states its threshold before running, e.g. "B wins by at least 4 of 10, and the two control runs are within 2 of each other"; a close result is rerun, not read.
20. **Every complaint becomes a moment first.** When Josh hits something in play, the exact turn (the learner's line, the memory notes, the stage) goes into `moments.json` before anyone fixes it. Every kept change is then rerun on all stored moments: a check between one-moment tests and the full variety gate, so an old problem can't come back unseen.
21. **A category can be one variable.** "All examples out" or "the whole opener recipe out" is one variable: the kind of thing. Test the category first and split it only if it loses, instead of about 25 one-unit cuts that interact.
22. **Rerun the control when the model changes.** Every card records the model id and settings; after a model change, old results are not trusted until the control has been run again on the new model.

23. **Grammatical: the ninth item, now in force** (Josh, 2026-11-07: "grammar would be proposed new variable", then put in the Language group with items 1 and 5). Prompted by V2: a character said "il gnocchi" (gli gnocchi), and no item covered it; item 2 (accurate) is about facts. Now item 9 under "Our pedagogy and what we test".

Smaller: a kept change gets a small check in the other country before it ships ("fixes are global"); the welcome counts as a kind of conversation and gets cards like the rest.

## Time box and better judges (2026-11-07)

**Time box: 1 to 3 days** (Josh, 2026-11-07: "I'm more inclined for a 1 to 3 day time box"). The first real results (V2, then A1) come within 1 to 3 days, with only the judges those tests need. If the process hasn't produced decisions by then, cut the process back rather than add to it. Suggested days (Claude): day 1, V2 on real conversations with a level count from word lists and Claude judges for the other items; day 2, a second model's judge where Claude's answers look shaky, and Josh marks the disagreements; day 3, decide what the results say and plan the next round.

**Risks named (Claude's assessment, 2026-11-07):** judges are the weak link (Claude judging Claude, on soft items like local and native); process can outrun results; the prompt may not be the biggest lever (the kind of place, `here` lines, memory and the model are test variables too); the nine items stand in for learning, checked only by a few players; few runs means noise, so thresholds must be respected.

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

**First: Culture and Character** (items 2, 3, 4, 7; Josh, 2026-11-07). The judges and moments built here serve these items first: F1 and Q2 start with judges for accurate, local and tipico, in character, and remembers; A1 judges each part on these items first.

| # | Question | Type | Unit | Waits on |
|---|---|---|---|---|
| F1 | **Fix the judges, don't work around them** (Josh, 2026-11-07: "we are working around flawed judges or learners rather than fixing them"). One narrow judge per item of "What the character must do", each with pass and fail examples. Each judge question is asked of Claude and Grok together (rule 5d); it passes when they rarely disagree, and Josh marks only the lines where they do. Only a passing question is used, and then lines are read as samples, not all. | tool | method | Josh marks the judges' disagreements |
| F2 | **Fix the simulated learner.** A learner at a set level who only responds to what the character says, never brings up a topic of their own, and makes realistic mistakes and mishearings. It passes when Josh would believe its lines came from a real learner at that level, and it brings up the measured topic itself in under 1 in 20 conversations. With F1 and F2 passing, whole dialogues become usable for items 3, 4 and 7, not only moments. | tool | method | Josh reads a sample of its lines |
| V2 | **Moments vs conversations, the problem side** (rewritten with Josh, 2026-11-07): can a character falling out of role (Beto taking a food order, Carla inventing an errand, Giorgia offering pizza from the steps), seen in a real conversation, also be seen and recreated in a moment, or does it need the conversation? **Part 1:** Claude and Grok read whole real conversations and mark every out-of-role reply; each mark is checked again with only the moment (the reply and the line before it): still seen? **Part 2:** each marked moment replayed 5× with today's prompt: does it fall out of role again (≥ 2 of 5)? Most pass both: moments are enough for role problems; fail part 1: the problem needs the conversation; fail part 2: the moment doesn't recreate it. JUDGMENT (flagged, rule 7b): both judges, every line read. Script `tests/experiments/v2-role.mts`. The first run (difficulty and grammar, V2 and V2b in the log) wasn't a fair test of this (Josh: "testing difficulty and grammar are poor ways to compare testability of moments") | dialogue, then moment | method | — |
| Q1 | Build `moments.json`: the real turns behind recent complaints. **Started 2026-11-07:** 10 moments gathered from the experiments that held them inline (Luisa and Doña Chela's openings, Carla's invented errand, Beto's torta, Ardit's ribollita, Magda's joven and cansado, Efrén's return visit); `tests/experiments/moments.mts` replays one through the server's turn code; `npm run test:moments` checks they still point at real places. Four complaints still need their real turns from the admin export (listed in the file: Don Nacho's long answer, the cornetto at a pharmacy, Luisa's cappuccino line, Giorgia's pizzeria), and Italy has only 3 | setup | — | the laptop, for the four turns |
| Q2 | Calibrate the judges the queue needs: first accurate, local and tipico, in character, teaches in role (recast correct), and remembers; later native-sounding, at the learner's level | setup | — | Josh marks ~20 replies each |
| H2 | **Do product lists in a shop's `here` line keep every visit on buying?** Salumeria Simoni's line lists what it sells and buying stayed at 83–100% (283bdb6's guard). The same shops with the product list as one plain sentence vs as now. Serves item 4 (in character) | visit | `here` lines of shops | F1, Q1 |
| H1 | **How many facts should a `here` line hold?** 283bdb6 promised two to four plain facts per line; many Mexican lines carry five or six (median 62 words, Italy 36). Do 5–6 facts make her lecture or recite, against 2–4? T5 found a fuller line helped her bring something new, so it could go either way. Visit test, 2–3 places per country, the same line cut to 4 facts vs kept at 6. Serves items 3 (local and tipico) and 8 (brief) | visit | `here` lines | F1, Q1 |
| V1 | Does a gain on a moment show up in whole conversations? One change known to move a moment, measured on its moments and on whole dialogues (5 places × 2 visits, fixed learner lines). If moments win and dialogues don't, that item needs dialogue tests (Josh, 2026-11-07: "the implication is tune moments, trust conversation improves") | moment, then dialogue | method | Q1 |
| A1 | **Does each part do something?** Leave-one-out (Josh, 2026-11-07: "part vs no part for each part … a baseline for the value of including a part before tweaking it"): the Beginner moments with all parts, then with each named part switched off in turn (`setPartsOff`), single parts only. Each removal is judged on the items its part claims to serve, plus the guards. Who: you, Who: the learner, How you talk and Reply: parts format stay in. About 20 parts × moments × 5 runs; a part showing no effect gets a rerun before it's called dead. Output: a value for every part, the baseline before any part is changed. Script: `tests/experiments/ablate.mts` | moment | every part of beginner.md | F1, Q1 |
| A1b | **Do parts cover for each other?** A hypothesis, not an assumption (Josh, 2026-11-07): run only if A1 shows a part with no effect where it should matter. Switch off that part and the one the inventory guesses overlaps it, together (`PAIRS=1`), on the same moments; if the pair loses what neither did alone, they cover for each other: keep one, not both | moment | the pairs A1 points to | A1 |

**Then: Language** (items 1, 5, 6, 8, 9), and the whole-prompt cuts.

| # | Question | Type | Unit | Waits on |
|---|---|---|---|---|
| L1 | **What makes a character turn teacher?** From C2 (2026-11-07): with only the floor, 17 of 40 replies were teacher talk (Beto's "Let me help you say it in Spanish" 10/10, Giorgia correcting Sam outright 7/10), against 0 of 40 with the frozen prompt; the floor never says the learner is learning, so the likely cause is the reply format asking for "something they could say back". Head to head on the floor, on Beto hungry and Giorgia later: the format's wording made neutral, against the frozen "Role: not a teacher" part, against the frozen "Mistakes: never point out" part. Counted in code: replies with teacher phrases, from a list written on the card. Serves item 6. Also from C2, for the same layer: the answers invent the learner's facts without "Answers: their facts left blank" (Carla 10/10 "Vengo dall'America" against "Sono di …"), and some English parts carry the language | moment | the reply format, Role: not a teacher, Mistakes: never point out | the Language part rethought |
| T8 | Does the Beginner prompt need its display instructions? Remove every mention of the screen or the game from beginner.md and the stage text ("shown in a bubble", "the game says its English right after", "heard, not shown", "shown to them, not said by you"), rules otherwise unchanged; Beginner moments at S1 and S2, 10 runs each, against today's. Serves items 1, 5, 6, 8; counted: valid parts, English sentences per turn, English repeating the language's meaning, words per turn. Hypothesis: no worse beyond noise (B no more than 2 of 20 worse per item), about 120 words shorter. If worse, the display talk was doing content work: rewrite it as a content rule. The clean single cut before CD1 (Josh, 2026-11-07: "testing base prompt (no display) vs current") | moment | the display mentions in English: brief, Language: what to keep, Language: phrases, Answers: as a local says them, Reply: parts format | F1, Q1 |
| CD1 | Content and display separated (dialogue-model.md → Decided): one Beginner prompt with one language dial and no mention of the screen, answers and the English echo chosen by display rules per step, against today's S1–S3 stage texts, on the stored moments at each step. Wins if it's at least as good on items 1 (at their level), 5 (responds to English) and 6 (teaches in role), with the prompt much shorter | moment | beginner.md, leveling.md | F1, Q1 |
| Q3 | The floor: the smallest Beginner prompt beside today's, on the stored moments | moment | whole beginner.md | Q1 |
| Q4 | All examples out of beginner.md (one category) | moment | the examples inside B4, B11, B13… | Q1 |
| Q5 | B21 ("never point out a mistake") out, since dialogue.md's D1 already covers corrections | moment | B21 | Q1, Q2 (recast judge) |
| Q6 | Answers outside an errand: as brief as a local says them, or a whole sentence with the question's verb | moment | the answer units | Josh decides the framing first |
| Q7 | Intermediate prompt written in Italian (character.md translated; the JSON line stays English) | moment | character.md, whole | Q1, Q2 (native judge) |
| H3 | ~~Topic-and-example or plain facts?~~ **Settled by Josh, 2026-11-07, no test:** "rewrite them as facts". Roma nuova's seven topic-and-example lines (Giorgia, Matteo, Ettore, Daniele, Gina, Don Paolo, Serena) are plain facts like everywhere else; the approach was only ever in Rome | — | Roma nuova `here` lines | done |

## The card

Every card is reviewed by the **test designer** agent (`.claude/agents/test-designer.md`) before it runs: can it answer its question, the smallest size that can, what it would teach, and its place in the queue. Give it the card, or "the queue" to reorder (Josh, 2026-11-07).

Every test starts as this card, shown to Josh in this form and pasted into the log:

```
Test T<n>: <the question in one line>
Serves: <item 1–9 from "Our pedagogy and what we test">
Type: moment / visit
Unit: <part name(s), e.g. "English: brief", and file>
Variable: <the one thing that changes> (A: …, B: …)
Held constant: <everything else, including the learner's lines>
Moments: <which, from moments.json>
Measure: <what is counted, how (code or judge), out of how many>
Fact or judgment: <fact (counted in code) / JUDGMENT (flagged: a judge decides)>
Hypothesis: <expected result, with the threshold>
Other outcomes: <what each would mean>
Size: pilot <moments × runs × versions>; real run <moments × runs × versions>
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

## New prompts, today's as the control (Josh, 2026-11-07)

The dialogue prompts (`beginner.md`, `character.md` with `levels.md` and its variants, `culture.md`, `welcome.md`, the lesson files) each grew their own words for the same things. Josh: rebuild rather than tune them one by one, "with an existing prompt as control".

1. **One shared character core, written new and short:** who you are, your place, your role, only what you know, what you remember about them. The Culture and Character tests run on it, once, for every type.
2. **Each type adds only what differs:** the Beginner format, the level, a lesson's steps. That's the Language work, after Culture and Character.
3. **Today's prompts are frozen as the control** (Josh, 2026-11-07: "why not leave beginner prompts alone and measure the new prompts against it"). No more tuning `beginner.md` or the other dialogue prompts: the examples and the five "stay in role" sentences stay as they are, so every result is measured against the same thing. A problem from play becomes a stored moment the new prompt has to pass, not a patch; the frozen prompt is patched only for something broken in play. C1's "cut the examples" is therefore not applied.
4. **Today's prompt is the control in every test.** The new core replaces a type's prompt only when it does at least as well on that type's stored moments; a rule from the old prompt comes back only when a test shows it's missed (the floor method below). The old prompts and their changelogs are the list of problems to check, not the text.

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
