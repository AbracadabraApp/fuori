# One turn engine: plan and design

Claude's proposal, 2026-11-11, written at Josh's request ("Write up the plan and design") after the question "what is wrong with Fuori" and "how to fix 1". Nothing here is agreed or built. Decisions that are Josh's are listed at the end.

Read for this: `lib/conversation/take-turn.ts`, `lib/turn.ts`, `lib/claude.ts`, `lib/beginner-2.ts`, `lib/prompts/build-turn-prompt.ts`, `lib/speech/hear-recording.ts`, the prompt files. Not read: `lib/beginner.ts`, `lib/lesson.ts`, `lib/welcome.ts`, `lib/intro.ts`, `lib/shapes.ts` in full, and the iPhone app. Nothing was run.

## The problem

`takeTurn` (`lib/conversation/take-turn.ts`) decides in one nested conditional which of eight conversations a turn belongs to. Each branch picks its own engine, prompt file, per-turn note, clean-up code and version string. So:

- A fix lands on one branch and the same fault stays on the others.
- A test built on one branch says nothing about the others. On 2026-11-11 a test exercised a branch the app doesn't play.
- Nobody can say from the code what a given learner will hear without tracing the level, the path stage, the welcome state, two app headers and the stored step.

## What's there now

Two engines sit under the eight branches.

- **The line engine** (`runTurn`, `lib/turn.ts`): one flowing line in the character's voice with its English, optionally answers to say back and a done flag. The first sentence can go to the voice while the rest is written.
- **The parts engine** (`runBeginnerTurn`, `lib/beginner.ts`): the reply as separate parts (English, phrase, question, answer), which code then rewrites and joins into the spoken line.

| # | Conversation | Engine | Brief or prompt | Code after the reply | Who gets it today |
|---|---|---|---|---|---|
| 1 | Lesson, speaking mode | line | lesson brief | forced done | Intermediate lessons |
| 2 | Lesson, Beginner format | parts | lesson brief | done flag | every other lesson part, Magda included |
| 3 | Welcome | parts | welcome brief by counted step | adds the address buttons | a learner who hasn't finished it |
| 4 | Intro (a visit's first turn) | its own call (`runIntro`, `intro.md`) | intro prompt | beats saved for later turns | Intermediate and Beginner 2 visits |
| 5 | Beginner 2, steps 1 to 3 | line | level text, answer rules, setup note, shape note | `lineWithAnswers`, question's English | the hidden switch only |
| 6 | Beginner 2, steps 4 to 6 | parts | scaffolding file, setup note | `shapeParts`, `flowingLine`; the voice waits for the whole reply | the hidden switch only |
| 7 | Beginner 1 | parts | stage text | none here | every Beginner in production |
| 8 | Intermediate, Advanced, Magda outside a lesson | line | level block or tutor prompt, shape note | none | everyone else |

Three things found while reading that change the earlier account:

- The second Claude call for English remarks (`writeSummaries`) is switched off: `GLOSS_ALL` is false for every step, so `summariesFor` returns before calling. It is dead code, not a live delay.
- The "answer inside her line" rungs are in no step of the ladder. `insideSpeech` and the two rungs are dead too.
- Branch 5 already turns the line engine's reply into the parts the app draws (answer parts only, her line as the subtitle). So the app already plays a Beginner turn from the line engine.

## The design

One engine, and every conversation differs only in data handed to it.

```
takeTurn(request)
  ctx   = loadTurnContext(request)   // database reads only: memory, address, level, path stage, welcome state, stored step
  plan  = planTurn(ctx)              // pure: no database, no Claude
  reply = plan.opening ? runIntro(plan) : runTurn(plan)
  out   = finish(reply, plan)        // pure
  save(out, plan)
```

**`planTurn` returns a `TurnPlan`:**

| Field | What it holds | Who sets it |
|---|---|---|
| `kind` | visit, welcome, lesson or tutor | the request |
| `opening` | this is a visit's first turn | the transcript |
| `system`, `firstTurn` | a replacement prompt | Magda only |
| `brief` | text added to the system prompt: the level's text, the lesson's or welcome's brief, the intro's beats | level, lesson, welcome |
| `note` | this turn's note on the newest message: the reply setup and the shape | the ladder and `pickShapes` |
| `answers` | how many answers to say back, 0 to 2 | the reply setup |
| `questionEnglish` | say the question's English after it | the step |
| `withDone`, `forcedDone` | how the conversation can end | lesson, welcome, visit |
| `extraParts` | parts code adds to the reply (the welcome's address buttons) | welcome |
| `version` | the string logged and saved with the turn | built from the above |

**`finish`** is `lineWithAnswers` made general: trim the answers to `plan.answers`, add the question's English when asked, add `extraParts`, set `done`. Nothing else touches the reply.

**What this buys:**

- `planTurn` is a pure function, so a test can list every case (level by step by kind by first turn or later) and check the plan in milliseconds, with no Claude call.
- The plan is saved with the turn. Any reply can be traced to the exact brief and note that produced it, not only a version string.
- A fix to how a reply is written or cleaned up is made once.
- The replay set (below) runs through the same function the app calls.

**What goes away with the parts engine:** `runBeginnerTurn`, `beginner.md`, the parts schema as something Claude writes, `shapeParts` and its eight steps (`glossAll`, `withEnglish`, `withoutAnnouncing`, `questionEcho`, `fullerGlosses`, `invited`, `insideSpeech`, `withSummaries`), `flowingLine`, `withoutSaidInEnglish`, the summary call, and the rule that the voice waits for the whole reply.

**What stays separate:** the intro is still its own call with its own prompt. It is the opening of the same engine, picked by `plan.opening`.

## The plan

Steps 0 to 2 change nothing a learner hears. Steps 3 to 6 each change what someone hears, so each is a prompt change under CLAUDE.md's rule and needs Josh's yes.

| Step | What | Changes what's heard | How it's checked |
|---|---|---|---|
| 0 | **Replay set.** Twenty saved real visits with the learner's lines as spoken, and a script that runs them through `takeTurn` without saving and prints each turn's assembled prompt and reply. | No | It runs on main and prints today's prompts |
| 1 | **Split out `loadTurnContext`, `planTurn`, `finish`.** `takeTurn` becomes plan, run, save. Both engines still exist; the plan names which. | No | The assembled prompt for every turn of the replay set is identical, character for character, before and after. A table test covers every case of `planTurn` |
| 2 | **Delete dead code:** the summary call, the inside rungs, `glossAll`. | No | Type check, the existing Beginner 2 checks, replay set identical |
| 3 | **Beginner 2 steps 4 to 6 onto the line engine.** | Yes, behind the hidden switch only | Josh plays steps 4 to 6 |
| 4 | **Beginner 2 becomes the Beginner.** The switch goes; Beginner 1 goes. | Yes, for every Beginner | Josh's decision that it's ready |
| 5 | **Welcome onto the line engine,** its brief unchanged in meaning. | Yes | Josh plays the welcome once |
| 6 | **Beginner-format lessons onto the line engine.** | Yes | Josh plays one lesson |
| 7 | **Delete the parts engine** and everything listed above. | No | Type check, replay set, both countries' smoke test |

After step 1 the main gain is already there: one place to see what a turn will be, and a replay set through the live function. Steps 3 to 7 remove the second engine.

## Decisions that are Josh's

1. **Is the one flowing line the Beginner format everywhere,** the welcome and lessons included? He chose it for visits. Steps 5 and 6 depend on a yes; without it the design still holds with two engines behind one plan, and steps 5 to 7 are dropped.
2. **Is Beginner 2 ready to replace Beginner 1** (step 4)?
3. **Do steps 4 to 6 of the ladder stay?** They are the only users of the parts engine inside Beginner 2. If the ladder ends at step 3 for now, step 3 of this plan is a deletion.

## Risks and what isn't covered

- The app draws parts. Branch 5 shows it can draw a line-engine turn, but the welcome's address buttons and lesson screens weren't read. Step 5 and 6 start by reading the app's side.
- A written-ahead reply (an offered answer's reply, drafted before the learner speaks) goes through `takeTurn` with a deferred save. The plan must be the same when the draft is written and when it is committed; the reply setup is seeded by conversation and turn number, so it should be, but this needs a test in step 1.
- This fixes where a turn is decided. It does not make the dialogue better by itself, give the character a whole visit to plan, change memory, or fix the judge. Those are the other points of the same review.
