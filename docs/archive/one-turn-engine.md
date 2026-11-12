# The turn code: a map, a small refactor, and who plans a turn

> **Archived 2026-11-12:** its map of the turn code lives on, checked, in docs/dialogue-now.md; the refactor is parked and "who plans a turn" is an open question in docs/dialogue-plan.md.

Claude (Mac mini session), 2026-11-11. First written at Josh's request ("Write up the plan and design") as an eight-step plan for one turn engine. Rewritten the same night after a review of it and the discussion that followed (Josh: "update the docs you've committed… stick to your guns, don't accept points you don't agree with but do consider best cases against"). Nothing here is agreed or built.

**Status:** not a dialogue plan, and parked as a refactor. What stands is the map (§1), two deletions (§2), a small refactor worth doing only when a change has to reach every conversation (§3), and the question the discussion ended on: who plans a turn, code or Claude (§4).

Read for this: `lib/conversation/take-turn.ts`, `lib/turn.ts`, `lib/claude.ts`, `lib/beginner-2.ts`, `lib/shapes.ts`, `lib/prompts/build-turn-prompt.ts`, `lib/speech/hear-recording.ts`, the prompt files. Not read: `lib/beginner.ts`, `lib/lesson.ts`, `lib/welcome.ts`, `lib/intro.ts`, the iPhone app. Nothing was run.

## 1. The map: eight conversations, two engines

`takeTurn` (`lib/conversation/take-turn.ts`) decides in one nested conditional which conversation a turn belongs to. Two engines sit under it.

- **The line engine** (`runTurn`): one flowing line in the character's voice with its English, optionally answers to say back and a done flag. The first sentence can go to the voice while the rest is written.
- **The parts engine** (`runBeginnerTurn`): the reply as separate parts (English, phrase, question, answer), which code rewrites and joins into the spoken line.

| # | Conversation | Engine | Brief or prompt | Code after the reply | Who gets it today |
|---|---|---|---|---|---|
| 1 | Lesson, speaking mode | line | lesson brief | forced done | Intermediate lessons |
| 2 | Lesson, Beginner format | parts | lesson brief | done flag | every other lesson part, Magda included |
| 3 | Welcome | parts | welcome brief by counted step | adds the address buttons | a learner who hasn't finished it |
| 4 | Intro (a visit's first turn) | its own call (`runIntro`, `intro.md`) | intro prompt | beats kept for later turns | Intermediate and Beginner 2 visits |
| 5 | Beginner 2, steps 1 to 3 | line | level text, answer rules, setup note, shape note | `lineWithAnswers`, the question's English | the hidden switch, or the learner's stored step |
| 6 | Beginner 2, steps 4 to 6 | parts | scaffolding file, setup note | `shapeParts`, `flowingLine`; the voice waits for the whole reply | the same |
| 7 | Beginner 1 | parts | stage text | none here | every Beginner in production |
| 8 | Intermediate, Advanced, Magda outside a lesson | line | level block or tutor prompt, shape note | none | everyone else |

What each turn is handed, across all eight: a system prompt (character, plus a brief), the conversation so far, and on some turns a bracketed note on the newest message. The note carries the answer setup (`pickSetup`, Beginner 2, every turn) and a shape (`pickShapes`: answer first, close; only when a signal fires). Thinking is off on every reply (`noThinkingFor`). The intro is the one place Claude looks ahead: it writes the opening and a list of beats, which later turns get once as material.

## 2. Dead code that can be deleted

- **The summary side call** (`writeSummaries`, `summariesFor`, `withSummaries`, `stretchesOf`): `GLOSS_ALL` is false for every step, so it never runs.
- **The answer inside her line** (`insideSpeech`, the `inside-en` and `inside` rungs): in no step of the ladder.
- `glossAll` goes with the first.

Existing checks exercise these functions, so their tests go with them; that needs Josh's word (CLAUDE.md: don't weaken tests without approval). No prompt text changes.

## 3. The refactor, cut to what I still hold

**What I hold.** The conditional is a real fault, not only untidiness: on 2026-11-11 a test was built on a branch the app doesn't play, and nothing in the code would have stopped it. Two steps fix that and change nothing a learner hears:

- **A replay set.** Twenty saved real visits, and a script that runs them through `takeTurn` without saving and prints each turn's assembled prompt. Its job is to prove a prompt is unchanged. It cannot judge dialogue, and isn't meant to: a saved learner line answers the reply given that day, and stops fitting once the character changes.
- **Split deciding from running.** `takeTurn` becomes: load what's known (database reads), work out the turn's settings (a pure function: which engine, which brief, which note, how many answers, how it ends), run, finish, save. Both engines stay. The settings are saved with the turn. Checked by the replay set: every assembled prompt identical, character for character.

I called the pure function `planTurn` in the first version. That was a bad name: it is settings picked by code, and "plan" should be kept for Claude's own planning (§4). Call it `turnSettings`.

**What I've dropped.** Steps 3 to 7 of the first version (Beginner 2's later steps, Beginner 1, the welcome and lessons onto the line engine; the parts engine deleted). They are not a refactor. Each rests on a product decision of Josh's (is the flowing line the Beginner format everywhere; is Beginner 2 ready to replace Beginner 1; do steps 4 to 6 of the ladder stay), each changes what a learner hears and so needs a test card, and I designed them without reading the lesson, welcome or Beginner 1 code. They also delete repairs that each record a real fault (answers announced in 36 of 42 turns; the inside answer held 3 of 15 times from the prompt) without saying what replaces them.

**When to do it.** Not now. When a dialogue change has proved itself on the branch Josh plays and has to be carried to every conversation; that is the moment eight branches cost something.

**The best case against even this much.** The laptop session changes `take-turn.ts` most nights (shapes, the intro, level up), so a refactor of it collides with live work. A pure refactor still risks the family's production play for no audible gain. And the branches may thin out by themselves once Beginner 1 is retired, which is a product decision that will be made anyway.

## 4. Who plans a turn

The first version and the discussion used "plan" for opposite things. In the first version, code works out the turn and Claude writes it, as now. In Josh's and the laptop's sense, Claude plans the turn itself before it speaks.

**Today.** Code steers: the answer setup every Beginner 2 turn, a shape when a signal fires. Claude writes each reply once, with thinking off, having seen neither a plan for the visit (beyond the intro's beats) nor an example of a good visit.

**Three ways to give Claude a planning step:**

| Way | What it does | Cost |
|---|---|---|
| Thinking on | Claude reasons before each reply | Delay before the first spoken word, every turn |
| A planning field before the line in the reply | Claude writes what this turn should do, then the line; the note is saved and readable | The same delay, a little smaller |
| Draft, check against a standard, rewrite once (the laptop's review, progress.md 2026-11-11) | A second pass | About double the wait, or the intro only |

The intro is the cheapest place to try any of them: the learner is already waiting for a long opening there. Any of the three is a prompt change and needs a card.

**My position.** Code and Claude should each plan what they can see. Code sees counts, punctuation and what was offered, so it can keep variety (rotation) and must set whatever the app has to draw (how many answer bubbles). It cannot see what the moment asks: whether the learner is lost, amused, or has just said something worth following. Claude can. So the fit of a turn to the moment should be Claude's choice, in a short plan it writes, and the reply mode stays code's. The terms table (dialogue-structure-reference.md § 14) is what would make that plan short.

**The best case against.** Claude's unplanned habits are where today's faults come from (two questions in a turn, the tourist question, the same Take-Fact-Ask every turn), and a plan written by the same model in the same call may just restate the habit. A planning step costs time on every turn in a voice app where the wait is already 2 to 5 seconds. Code's choice is recorded and countable ("did the character do what the turn asked"), which is the one thing the test method has been missing; a plan Claude writes and then follows proves nothing by matching itself. And selection by code from a list has never been tried beyond two shapes, so it is untested, not failed (see the correction below).

## 5. The review of the first version, and my answer to each point

A review of the first version (relayed by Josh) made five points.

1. **"It solves a code problem and files it under dialogue."** Agreed on the filing. The first version ended by arguing against itself and should have been half a page. Held: the code problem is real and caused a wrong test (§3).
2. **"Built on code the author didn't read."** Agreed. The first version said so and then planned deletions in that code anyway.
3. **"It slips three product decisions into a refactor."** Half agreed. They weren't slipped: they were listed as Josh's, in their own section. But they don't belong in a refactor at all, and they are out (§3).
4. **"Its checks don't fit the repo's rules."** Agreed on the error: steps that change what's heard need a card, and "Josh plays it" is not a check. Not agreed that the replay set is a weakness for proving only that nothing changed: for a refactor that is exactly the proof needed.
5. **"It deletes repairs without saying what replaces them."** Agreed.

Its keep list (the map, the dead code, and the point that the character writes one turn at a time, steered by a note, never seeing a visit whole) is what §1, §2 and §4 now are.

## 6. A correction to the first version's reasoning

The first version said the design "most likely to cause flat dialogue" is turn-by-turn steering, citing "a note on every turn makes every turn the same turn". Josh's correction, which I accept: that observation was of one note repeated on every turn (the beat note; before it, the same two-answers setup, "Dora the Explorer"). It says nothing against picking a different move from a list each turn. Rotation was the fix applied to the setups.

What I still hold, more narrowly: rotation was applied, and I have no record of how it sounded afterwards, so it is a fix made, not a result heard. And a seeded draw gives variety, not fit; it cannot choose the move the moment calls for. Whether varied selection by code improves dialogue is unknown. The palette of eight kinds of question in dialogue-structure-reference.md § 12.1 is the design that would test it; one of the eight is live.
