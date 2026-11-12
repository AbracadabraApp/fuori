# Dialogue plan

2026-11-12 · laptop session (dialogue; another session has the user-facing changes) · Josh: "focus on our dialogue model", then "reorganize all of todays assessment into a action plan", then "make this part of the plan for any 'kept' items and cite the docs it resolves".

**Josh's answers, 2026-11-12:** 1 "yes"; 2 "c - good, a good enough, change 8 to 7"; 3 "we are cutting over to beg 2" (done by the other laptop session, b45d171); 4 "needs more fidelity"; 5 "yes"; 6 "yes". **Done today:** 1.1 and 2.3 (3322eb2), 1.2 and 1.3 (ecd7fab), 5.6 for Beginner 2 (f5a8ca5), decision 6 (614da8d). Each row below says so.

**Status of the rest: proposed by Claude, not agreed.** The order and the items are Claude's, from two reads of the code and prompts on `main` at e53902f (both countries; Italy's prompt texts match Mexico's apart from example phrases). The decisions that are Josh's are listed at the end; nothing that changes what a learner hears ships without his word.

**How to read it.** Each item says what it resolves: the inconsistency, and the docs and sections that hold the problem or the earlier thinking about it. When the item is done, those sections are brought up to date or archived (phase 6). An item with nothing cited is new today.

## Phase 1: fix what's live and wrong

| # | What | Resolves | Check | Needs |
|---|---|---|---|---|
| 1.1 | **Done 3322eb2.** Take the "where they're from / newcomer" wording out of Beginner 1: `beginner.md` → "Who: the learner" ("with a newcomer"), "Flow: react, then move on" ("talk the way such a person would with a newcomer (where they're from, how they find the city, the place, their plans)"), "Answers: their facts left blank" (its list of where-from, how long, where they live); `leveling.md` → "Language: 4" ("to a newcomer who manages"); `levels.md` → "Beginner: shape" ("talks to a newcomer"). Both countries, changelogs | Every Beginner is told to ask what CLAUDE.md's learner rule and `character.md` → Relationship ("It's rude to ask…") forbid. Docs: `dialogue-ideas.md` → "Are you new here?" in almost every opener (2026-11-09); `progress.md` → Decisions, "No newcomer assumption" (the 20% → 5% cut that never reached Beginner 1) | Beginner 1 openers in a batch, before and after, counted by the quality judge's `touristAsked` / `newcomerAssumed` | Josh: Beginner 1 is "production untouched" (`beginner-2.md` → Rules for the work) |
| 1.2 | **Done ecd7fab** (Josh's "a": the goodbye offered once on the 7th turn; the close by the beat count removed; "c", closing when the talk is done, stays as 5.3). Beginner 2's close follows the talk, not the beat count: `lib/shapes.ts` → `beatFor` fires "close" on the turn after `beats.length`, and `shapes.md` → "Shape: close" tells the character "You've covered what you set out" whether it has or not | A leftover of the beat-per-turn note removed in shapes.md 11d. Docs: `dialogue-structure-reference.md` § 12 → Status; `progress.md` 2026-11-11 night 2 (Built, Then) | `test:shapes`, `test:beginner-2`; one visit on a local server | Josh: how a Beginner 2 visit ends (decision 2) |
| 1.3 | **Done ecd7fab.** `intro.md` → both "Reply" blocks say beats are what "the visit's later turns take them up one at a time"; the "Beats" block says "not a list to work through". One wording, both countries | Same leftover. Docs: `intro.md` changelog 11d / 11e | `test:prompt` | None (wording; changelog) |
| 1.4 | **Comments fixed ecd7fab;** the recorded "opener" left (the intro does offer two answers). Stop recording "opener" as the setup on an intro turn (the intro never sends `Setup: opener`); fix the stale comments (`take-turn.ts` "the thread names the next beat"; `shapes.ts` "thread+answer-first") | The turn records name a setup that wasn't played. Docs: `progress.md` 2026-11-11 mini → Memory (the opener as a suspected cause of return visits opening as first meetings, now overtaken by the intro) | tsc | None |
| 1.5 | **Overtaken by the cut-over:** the old Beginner goes in a week. Beginner 1's answers against the decision: `path.ts` S2 plays "Answers: one" and S3 "Answers: frame" (a single answer), though "never a single answer to read out" was agreed and "Replaces S1 two answers, S2 one, S3 a frame" | `dialogue-model.md` → Decided → Answers to say back (Josh, 2026-11-05: "fine"), never built into the path | `test:beginner` both countries | Josh: production Beginner 1 again (decision 1), or leave it to Beginner 2 replacing it (decision 3) |

## Phase 2: the newcomer framing in the content writers and lessons

| # | What | Resolves | Needs |
|---|---|---|---|
| 2.1 | `lesson-steps.md`: the learner's example lines labelled role "newcomer" → "learner"; `culture.md` → Pick ("the people the newcomer can meet") and Choose ("the order a newcomer might enjoy them") | CLAUDE.md's learner rule. Docs: `progress.md` 2026-11-10 Learn-link ideas ("Mexico's lesson examples label the learner role: newcomer") | None for the prompts; regenerating lessons or culture is Josh's (no Magda or lesson tests without his approval) |
| 2.2 | Lesson practice scenes run on `beginner.md`, and the Practice brief patches it ("don't ask their name or where they're from"): after 1.1, drop the patch so two prompts stop pulling against each other | `lesson-flow.md` → Practice, Practice speaking | After 1.1; Josh, as a lesson change |
| 2.3 | **Wording done 3322eb2;** the blocks go with the old Beginner. `levels.md` → "Intermediate: B1" and "B1, support back" ("They have been living here a while… anyone new in town"): reachable only through `LEVEL_TRIAL`. Fix the wording or delete with 5.6 | CLAUDE.md's learner rule | With 5.6 |

## Phase 3: measure before building (reads saved visits; no prompt changes)

**First run, 2026-11-12** (`scripts/bid-count.mjs`; the table is in [dialogue-now.md](dialogue-now.md) § 4). 3.1: a baseline for Beginner 1 and 2, mostly from one or two learners; offered answers are said back 82% (Beginner 2) and 54% (Beginner 1); the frame to finish is the bid most often left on (27%); the open question without answers got own words on all 16 bids. Intermediate since 11-10q has 18 bids, too few to read. 3.2: 3 of 18 Intermediate turns since 11-10q ask and carry on; too few, rerun after Josh's next Intermediate visits. 3.3: no return visit since the ledger exists; waits for a second visit to Raymundo or Isidro (Guanajuato).

| # | What | Resolves |
|---|---|---|
| 3.1 | **The bid-response count:** for each kind of bid live today (say it back, choose, questions to ask; Intermediate's open questions and statements), did the learner reply, how much, did the visit go on. The learner's reply is the verdict; no judge | `dialogue-structure-reference.md` § 1a → "The learner's reply is the verdict on a bid" and § 2a → "What it would take" (the count "can be made first from saved visits, for the three live rows") |
| 3.2 | **Asks and carries on as if answered:** recount on visits since the intro build (13 of 67 Intermediate turns before it), against `character.md` → "No more words after a question mark" | `dialogue-ideas.md` → The character asks and carries on, as if answered |
| 3.3 | **Return visits:** does the intro pick up from the last visit and leave out what "Told them about" lists? The told-ledger's first check, before Remember (4.2b) builds on it | `dialogue-structure-reference.md` § 12.3; `progress.md` handoff → Open (1) "a second visit to the same character (the ledger)" |

## Phase 4: build the bids model

| # | What | Resolves | Ships on |
|---|---|---|---|
| 4.1 | **Accept, then bid**, at Intermediate: the one line Beginner 1 has and Intermediate lacks ("first react to what they just said… then move on", `beginner.md` → Flow) | `dialogue-structure-reference.md` § 1a → "Two moves a turn"; § 10.4 (the model's Take by habit); `dialogue-ideas.md` → Top 10 at Intermediate #1 (forgetting the visitor) and the asks-and-carries-on entry | Josh's play and a changelog; a card only if 3.1 makes it a number |
| 4.2 | **The menu of asks, one kind at a time**, each played before the next: (a) Finish it (already live as Beginner 1 S3's "Answers: frame": port it), (b) Remember (after 3.3), (c) Guess, (d) Notice or do, (e) Offer | `dialogue-structure-reference.md` § 2a (the menu) and § 12.1 (the palette); `dialogue-model.md` → Decided → Questions (S1–S3 end every turn on a question: the menu keeps that, varying the kind); the Dora remark (`progress.md` 2026-11-11 night) | Josh's play, a row at a time |
| 4.3 | **Cultural lessons:** the Story brief's fixed "Have you ever…?" at the end of the first two turns becomes a choice of bid | `culture.md` → Story; `dialogue-ideas.md` → Open-ended talk doesn't need a question every turn | Josh: a lesson prompt |

## Phase 5: structure, waiting on Josh's decisions

| # | What | Resolves |
|---|---|---|
| 5.1 | **Settled by the cut-over** (b45d171): every Beginner plays the new one on its stored step; `path.ts` still decides who is a Beginner, and its stages play only for the old Beginner, a week. **Two ladders.** `lib/path.ts` (Beginner 1: S1–S4, moved by counts) and `lib/level-up.ts` (Beginner 2: steps 1–6, offered, chosen) know nothing of each other; a learner at S4 gets no intro, no shapes, no beats. The welcome brief still says it "starts everyone at Beginner S1" | `beginner-2.md` → Progression; `beginner-2-step-2.md` → The step up; `dialogue-model.md` → Decided → Everyone starts at Beginner; `06-roadmap.md` → Learner level (placement and moving up) |
| 5.2 | **Cut over** (b45d171); the old Beginner's code goes in a week. Left: the welcome and lessons still run on `beginner.md`. **Beginner 2 replacing Beginner 1**, and with it every dialogue fix made once instead of twice (the intro, shapes and beats reach Intermediate and Beginner 2 only; Beginner 1, the welcome, lessons and Magda have none) | `06-roadmap.md` → Now, "If Beginner 2 replaces Beginner 1: the changes after"; `beginner-2-step-2.md` → Goal; `beginner-2.md` → Beginner 1 rules Beginner 2 breaks; the "fixes are global" rule |
| 5.3 | **Next:** Josh's "c": the goodbye when the talk is done, with a signal that works in any language. **One goodbye.** Today four: Beginner 1 offers it when the model judges ("Goodbye: offer it"); Beginner 2 has that line plus the code's goodbye setup at the beat count or turn 8; lessons end by turn count; Intermediate ends only on the learner's goodbye (`dialogue.md`) | `dialogue-structure-reference.md` § 11 (the first table: "Close… replaces GOODBYE_AFTER = 8"); `progress.md` 2026-11-10 mini (Chuy) |
| 5.4 | **Josh: "needs more fidelity":** a fuller write-up of what steps 4–6 would sound like, before deciding. **Beginner 2 steps 4–6**, never played: the parts reply with "Level: 2" and "Level: 3" texts written for the flowing line ("never a sentence followed by its own translation", while the parts format gives every phrase its English). Fix, or cap the level-up at 3, before anyone reaches it (about nine conversations away) | `beginner-2.md` → The reply ladder; `beginner-2-step-2.md` → Step 2 |
| 5.5 | **Length rules in prose:** "Don't talk too much" in a prompt whose principle is "No length rules" (`character.md`); "two or three sentences", "three or four of them a turn" (`scaffolding.md` → Level 1, 1b, 2); "four or five" (`intro.md`). Into code, or out | `progress.md` 2026-11-11 deep dive → the late review ("three are length rules in prose… if the limits matter they belong in code") |
| 5.6 | **Done for Beginner 2** (f5a8ca5: the summary call, the answer inside her line). `levels.md` and `leveling.md`'s blocks go with the old Beginner in a week. **Dead code and blocks:** the summary side call and the answer said inside her line (`lib/beginner-2.ts`); `levels.md`'s trial blocks; `leveling.md`'s "Say it again", "Line check", "Speaking judge", "Echo: off", "Language: 1", "Language: 3" (test scripts only). Their tests go with them | `one-turn-engine.md` § 2; `summary-and-mixed.md` (the summary, settled for the frame); `scaffolding.md` → Summary, Line: answer inside |
| 5.7 | **The rules inventory** (stage 5): every rule sorted into shape, moment, content or prohibition. Beginner 1's 23 rule blocks against Intermediate's ~100 words of situation are the two principles side by side | `dialogue-structure-reference.md` → decisions in the deep-dive entry (`progress.md` 2026-11-11); `06-roadmap.md` → Now, "Dialogue by shape" |
| 5.8 | **The turn-code refactor:** parked until a change has to reach every conversation | `one-turn-engine.md` § 3, § 4 (who plans a turn: kept as an open question here) |
| 5.9 | **No Intermediate lessons in Mexico** (`content/it/lessons-b1.json` and `lesson-steps.md` → "System prompt: Intermediate" exist for Italy only). Content; may be the other session's | `lesson-flow.md` (the speaking mode) |

## Taken from Josh's play, 2026-11-12 (handed over by the screen session on Josh's "yes")

| # | What | Status |
|---|---|---|
| A | **Beginner turns long and mostly English** (visits 6159f8cb Isidro, 409863b2 Raymundo: step 1 turns of 70–85 words, three or four Spanish phrases; Josh earlier: "Everything is basically too long"). With 5.5 | Cause found: Level 1 asks for "three or four" glossed phrases a turn and "two or three sentences"; the phrases win. Replayed on Josh's two visits with today's call (`tests/experiments/b2-turn-length.mts`, 20 turns): median 60 words heard, 4 sentences, 28% Spanish. A shorter Level 1 (one or two phrases, English only to carry the Spanish, two short sentences and the question): median 37 words, 3 sentences, 34% Spanish. Waiting for Josh's word to ship it |
| B | **Speech-to-text given the answers just offered** ("Quiero ver los altares" heard as "Kiran Velos Altera", and Don Isidro called Josh "Kiran", visit 6159f8cb) | Logged; when is Josh's call |

## Steps 4–6, in more detail (5.4; Josh: "needs more fidelity")

What a learner gets at each step today, read from the code on `main` at 614da8d (`lib/beginner-2.ts` → `CLUSTERS`, `LEVEL_OF_CLUSTER`, `QUESTION_ECHO*`, `FRAME_CLUSTERS`; `lib/level-up.ts`; `scaffolding.md`). Steps 1–3 are for comparison; 4–6 have never been played.

| Step | What the character is told (Level text) | What the learner is given to answer with (setups, drawn per turn) | Question's English said | Reply and screen | Voice |
|---|---|---|---|---|---|
| 1 | Level 1: mostly English, the language slotted in with its English beside it; 2–3 sentences, the question in the language with its English | two answers with English · two questions to ask | yes | one line; her bubble shows only the question | starts on the first sentence |
| 2 | Level 1b: the same, the English left out after phrases heard before | the same as step 1 | yes | the same | the same |
| 3 | Level 2: half and half, never a sentence and its translation | the same + no answers (open question) | only for a new kind of question | the same | the same |
| 4 | Level 2 again | questions to ask · no answers | no | **parts** (phrase, question and answer bubbles, joined into the spoken line by code) | **waits for the whole reply** |
| 5 | Level 3: mostly the language; English only when asked or for a word they can't get from the scene | two answers with English · no answers | no | parts | waits |
| 6 | Level 3 again | no answers, every turn | no | parts | waits |

After step 6 nothing: the level up is never offered at the top, and nothing moves the learner to Intermediate.

**What doesn't hold together:**
- **The screen and the wait change at step 4, and nothing else does.** The text is the same Level 2 as step 3, but the reply switches from one line to parts: a different screen (bubbles per phrase) and a slower start (the voice waits for the whole reply). That goes against "one screen, all levels".
- **The text and the format disagree at step 4.** Level 2 says "never a sentence followed by its own translation", while the parts format asks for every phrase "with its English".
- **Step 5 gives back what step 4 took away.** Step 4 has no answers with English; step 5 brings back two answers with English.
- **The steps no longer follow the ladder they were built from** (`beginner-2.md` → The reply ladder: nine rungs, seven clusters). Five rungs aren't in the code: one bubble with English; one bubble in the language only; two bubbles in the language only; the two answer-inside rungs (removed today, never played); built from glossed words. So steps 4–6 only vary questions to ask, two answers with English, and none.
- **The level-up preview doesn't match what plays.** It rewrites her last line as one line with the next step's text, while steps 4–6 play in parts.
- **Level 3 was copied from the old Beginner's stage 3** ("Talk: stage 3", without its question rule), not written for this ladder.

**From the goal, a direction to look at** (Claude's, not decided). What should change from step to step is how much of the language the learner hears and how much they have to produce. The screen and the engine shouldn't change. Read that way, steps 4–6 would stay on the one-line reply of steps 1–3, and each would take away one support:
- **Step 4:** the frame flips. Mostly the language, with an English aside of her own now and then: the Spanish-frame aside of card B2-E5 (a thought on 6 of 8 turns, but followed on only 1 of 8 without help). Answers as at step 3.
- **Step 5:** answers in the language only, no English under them (ladder rung 5: choosing means understanding both). English only when asked.
- **Step 6:** no answers; their own words. The level up's next offer is Intermediate.

**To give it more fidelity before deciding**, which you choose: (a) hear today's steps 4–6 as they'd play now, one visit each with the auto-responder, as audio; (b) hear the direction above, written as Level texts on the one-line reply, against (a). Either is about 15 minutes of listening; (b) is a prompt comparison, so it needs a card.

## Phase 6: the documentation, once items above are done or decided

**Five current docs, one job each:**

| Doc | Job |
|---|---|
| `dialogue-now.md` (new) | How dialogue works today, checked against the code with a date: the eight kinds of conversation, what each level is given, the ladders, the goodbyes, the open inconsistencies (this plan's phases 1, 2 and 5). Rewritten when the code changes |
| `dialogue-model.md` | Decisions only, as now, brought up to date (the intro, shapes and the quiet default, beats once, level up, the frame at step 1, bids as the lens), plus a "Tried and dropped" list, one line each with its card |
| `dialogue-plan.md` (this) | The only list of dialogue work; the roadmap links here |
| `dialogue-structure-reference.md`, renamed "Dialogue terms and bids" | Bids, terms, the menu, research findings; the built-status lines move to `dialogue-now.md` |
| `dialogue-ideas.md` | The fault log: open faults on top with their examples, fixed ones below |

`beginner-2.md` stays as Beginner 2's spec and takes what's still true from `beginner-2-step-2.md` and the conclusion of `summary-and-mixed.md`. Research, `prompt-trials.md`, `prompt-testing.md` and `automated-replies.md` stay as they are.

**What's kept, and where** (no content is deleted: what leaves the current docs goes to `docs/archive/` with "superseded by …, date" on top):

| Kind | Kept? | Where |
|---|---|---|
| Josh's words, a decision of his, dated | Always, word for word | `dialogue-model.md`, or the reference for the bids model |
| Evidence: a result, a count, a quoted turn with character, place, time | Always | The fault log, the cards, or beside the decision it backs |
| A reason behind a decision | One copy | Beside the decision |
| What the code does | Only if the code still does it, rechecked, not copied | `dialogue-now.md` |
| A design wanted and not built | Kept | This plan, or the reference for theory |
| A design dropped, a test that said no | One line: tried, dropped, why, card | `dialogue-model.md` → Tried and dropped, or `prompt-trials.md` |
| Claude's proposals never answered | Kept, labelled as Claude's | This plan, "Proposed, not agreed" |
| A past day's status and next steps | Out of the current docs | Archive; `progress.md` keeps the dated log |
| The same thing told twice | One copy, the closest to the source | Linked from the rest |
| Reviews and back-and-forth | The conclusion stays; the exchange is archived | Archive |

Where a doc paraphrases Josh and his words can't be found, it moves as Claude's reading, marked so. Where it's unclear whether something is decided, it stays open and goes on a list for Josh; filing doesn't decide it.

**To archive when their content has moved:** `beginner-plan.md` (already marked superseded), `beginner-deep-dive.md`, `beginner-2-step-2.md`, `summary-and-mixed.md`, `one-turn-engine.md`, `level-judge-test.md`, `language-levels-plan.md`, and `beginner-as-live.md` only once Beginner 1 is retired. `M1-CONVERSATION-MODEL.md` and `04-conversation-engine.md` only with decision 6.

**How Josh checks it:** one move list per commit (moved, archived and why, dropped as already in X); a short list of anything of his that would sit only in the archive; line counts before and after (about 3,400 lines in ten docs now). `06-roadmap.md` and `progress.md` are shared with the other laptop session: tell it before changing them.

## Josh's decisions, in the order they unblock work

1. ~~**Beginner 1 (production):**~~ yes, done. may 1.1 (and 1.5) change `beginner.md` and the path's blocks, or does everything wait for Beginner 2?
2. ~~**How a Beginner 2 visit ends**~~ the 7th turn for now; when the talk is done next (5.3). (1.2, 5.3): when the talk is done (and how that's seen), the goodbye offered once at turn 8, or only on the learner's goodbye.
3. ~~**Which ladder survives**~~ cut over to the new Beginner. **Which ladder survives, and when Beginner 2 replaces Beginner 1** (5.1, 5.2).
4. **Steps 4–6:** needs more fidelity: see "Steps 4–6, in more detail" above; pick (a) or (b) to hear. fix, or cap the level-up at step 3 for now (5.4).
5. ~~**Dead code**~~ yes, done for Beginner 2. and the tests that cover it (5.6).
6. ~~**CLAUDE.md's source of truth:**~~ yes, done. point it at `dialogue-now.md` and `dialogue-model.md` instead of `M1-CONVERSATION-MODEL.md` and `beginner-scaffolding.md` → Goals, and archive the M1 doc and `04-conversation-engine.md` (about 30 links to fix).

Phase 3 needs none of these and can start now.
