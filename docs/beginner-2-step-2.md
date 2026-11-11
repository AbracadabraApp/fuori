# Beginner 2: step 2, and the step up

2026-11-10, night · laptop session · a one-page start for tomorrow. Step 1 (the English frame) went in tonight as `scaffolding.md` → "Level: 1" (2026-11-10q), not released. The ladder is in [beginner-2.md](beginner-2.md) → Progression; the research behind it in [summary-and-mixed.md](summary-and-mixed.md) → Frame mix; the screen in [after-conversation.md](after-conversation.md).

## Where things are

| | Her speech | Their reply | Exists? |
|---|---|---|---|
| Step 1 (cluster 1) | English frame; each Spanish phrase with its English after it; the question in Spanish, then English | two bubbles with English · questions to ask | **yes**, tonight; play it after the release |
| Step 2 (cluster 2) | English frame; the Spanish phrases **without** the English after each (heard before); the question still echoed | two bubbles with English · questions to ask | **no**: cluster 2 plays the old "Level: 1b" text (Beginner 1's stage: short Spanish sentences, English as little as needed) |
| Steps 3–6 | half and half → Spanish frame → Spanish | per the ladder | **no**: the old Level 2 and 3 texts under new numbers |

The Cluster stepper (Settings → touch and hold Version → Cluster 1–6) is the level-up for now: Josh picks the cluster by hand.

## Done the same night: cluster 1 runs on the Intermediate prompt with the frame brief (2026-11-10s)

Josh: "why isn't it just using the frame". It now does: `take-turn.ts` runs Beginner 2 cluster 1 through `runTurn` (the Intermediate prompt, one flowing line) with `scaffolding.md` → "Level: 1" as the brief, the exact call that made the lines Josh judged; `withQuestionEnglish` says the question's English after it (Josh: "Final Question always gets English echo"). Runs through that call: Mexico 2 + 2 characters, Italy 2, two turns each: 28% in the language, three to four pieces a turn, mostly phrases ("Suba a la silla, climb up on the chair, and I'll get to work. ¿Quiere una boleada? Do you want a shoe shine?"), 4.0–4.8 s a turn (the voice starts on the first sentence, as at Intermediate). On screen: the whole line as the subtitle, as at Intermediate; no bubbles for the Spanish and no two answers to say back yet; the reply panel Intermediate shows in a learner's first conversations stands in. Clusters 2–6 still run on the Beginner prompt (parts). Not released.

**Done 2026-11-11a (laptop):** the two answers to say back are back on cluster 1 (Josh: "getting answer bubbles working again first"): the same `runTurn` call also returns `answers` (`scaffolding.md` → "Reply: line and answers"; the turn's setup line in brackets on the newest message, as in the parts format), `lineWithAnswers` sends them as answer parts, and the app keeps her line as the subtitle when the parts are only answers (`PersonView.swift`; needs a new build). Connection runs: Mexico 3 characters × 2 turns, Italy 2 × 2: two answers on 10 of 10 turns, 20–21% in the language, 3.7 runs a turn, 4.6–8.0 s. **Still open:** the Spanish as bubbles (the spans format below, a screen question), and the brief's noun guard (Josh: the Spanish in the live transcript "are likely things like nouns"): watch the single-word count.

## The reply format with spans (later; was "first thing tomorrow" before 10s)

Josh played 10q live (Don Efrén, Guadalajara, 2026-11-11 04:36 UTC): "speaking straight english except question". Three wordings of the Level 1 brief that night, each failing differently in the parts format: one Spanish phrase a turn (10q); rows of bare labels between the English ("La silla. El cepillo."); the Spanish hidden inside the English boxes (10r, on `main`, not released). The cause is the format, not the words: the lines Josh judged ("that's la silla, the chair, where you climb up") were written as one flowing string in the Intermediate format; the parts format makes the character pull the Spanish out of the sentence into its own box.

**The fix:** at Level 1 the character writes one flowing line (as Intermediate) and lists the spans in the language it used, each with its English; code cuts the line at those spans into the parts the app already shows (english heard, the spans as word parts with their English, the question echoed, the answers). `buildBeginnerPrompt` gets a second output format block for Level 1 (`scaffolding.md` → "Reply: line and spans"), `runBeginnerTurn` converts to parts after the reply, `flowingLine` becomes unnecessary for that path (the line is the character's own). Check: `b2-frame-live.mts` in both countries, reading for phrases inside sentences with their English beside them, then Josh plays. An evening.

## Step 2: what to write

One prompt block, `scaffolding.md` → "Level: 1b" rewritten (both countries, version bump, changelog), same shape as Level 1 minus the English after each phrase. Draft:

> They have a little {language} now, from a few conversations. You're a bilingual local, so with them you still talk mostly in English, and you put the {language} in where it fits: the names of things, set phrases, and the one short {language} sentence that matters, each as a word part. Don't give the English after a {language} phrase they've heard before or can get from what you just said in English; give it only for a new word that matters, in a word or two. You are still yourself, here, doing what you do. Keep each turn short: a few sentences and your question in {language}, with its English.

What the code does with it: nothing new. `GLOSS_ALL` is off in every cluster; `questionEcho` is on for clusters 1–2 (`QUESTION_ECHO`), so the question keeps its English by code (Josh: "Final Question always gets English echo"); `flowingLine` joins the spoken line. The reply setups for cluster 2 are already two answers and questions to ask.

How to check it, as tonight: `COUNTRY=es-mx npx tsx --env-file=.env.local tests/experiments/b2-frame-live.mts` with the cluster set to 2 (add a `--cluster=2` flag to the script: `CLUSTERS[1]` for the level text and `shapeParts`), two turns each for four characters, and the same in Italy; read for: the Spanish phrases still whole and in place, fewer English glosses than step 1, the question echoed every time. Then Josh plays it on the Cluster stepper. Not a card: Josh judged the frame on a list; step 2 is the same frame with one thing taken away.

Open while writing it: whether "a word or two" of English for a new word slides back into labels ("el comal, the griddle"); it's what the frame does at step 1 anyway, so fine here; the question is only whether the glosses thin out.

## The step up: what has to exist

Nothing of it exists (checked 2026-11-10: no screen, no stored step, no count, no copy).

1. **The learner's step, stored** on their record, replacing the hidden `x-fuori-cluster` header: set by the offer, read by `/v1/turn` (`clusterFrom` reads the record instead of the header; the header stays as an override for Josh's testing).
2. **The count** of conversations that count at the current step (3 or more learner replies; opener-only visits don't), from `conversations`, reset when the step changes.
3. **A route** the app asks at leave, say `GET /v1/step-up?conversation=…`: due or not (count ≥ 3–5, not asked in the last few), and when due: her name and place, her last line of this conversation as said, the same line rewritten at the next step (one small call, keeping her form of address, usted/tú or Lei/tu), the answers line and the yes-button words for that step from content. `POST` with the answer: step up (write the step, reset the count) or not yet (mark asked).
4. **The copy per step** in `/v1/content`, both countries: the headline ("Ready for more?"), the warm line, the answers line, the yes in the language; nothing in Swift.
5. **The screen**, as the approved mockups (Mexico: papel picado and the colibrí; Italy: the awning and lemons): name and place, the warm line, "Ready for more?", the two cards each with a play button (her voice, through `/v1/speak`), the answers line, the yes button, "Not yet" underlined. Out to the place list either way. Two notes from the review: decorations in the sketchbook hand, or accepted as a poster register; the magenta line one shade darker for contrast.
6. **Steps 2 and 3 written** before the screen ships, or the first "Yes" steps into the old Level 2 text.

Build order: step 2 (above) → the stored step and the count → the route with the rewrite → the screen → step 3. The screen is a day; the steps are the work.

## Goal: Beginner 2 replaces Beginner 1 (Josh, 2026-11-10). What remains

Beginner 1 = `beginner.md` + `lib/path.ts` (a fixed playlist of stages with a moving-up rule that fired once in 185 records) + the record's rules (`lib/conversation-record.ts` → `feltOf`: an English reply counts as lost). Beginner 2 = the Intermediate character prompt + `scaffolding.md` + `lib/beginner-2.ts`, switched on by a header the app sends, with no stored progress. To swap, in order:

1. **Josh plays step 1 and says it's better** (after a release): the only gate. A few conversations, both countries.
2. **Steps 2 and 3 written** (above), so a learner has somewhere to go. Steps 4–6 can come after the swap; step 6 is the Intermediate prompt itself.
3. **The stored step and the offer** (above: the step on the learner's record, the count, `/v1/step-up`, the copy, the screen). Without it every learner is stuck at step 1; this is the one piece that can't wait. Beginner 1's `lib/path.ts` stages and its moving-up rule go with it.
4. **Beginner 2 on by default:** `beginnerVersionFrom` returns 2 unless the header says 1 (the hidden switch flips meaning, then goes); the Cluster stepper becomes an override of the stored step for Josh's testing.
5. **The record's rules** (docs/beginner-2.md → "Beginner 1 rules Beginner 2 breaks"): an English reply is communication, every reply counts, uptake scores; `feltOf` and `countedOwnTurns` rewritten; the scorecard and grade already split by `+C<cluster>`.
6. **What else reads `beginner.md`:** the welcome (`lib/welcome.ts`) and lessons run the Beginner format with `beginner.md`'s System prompt blocks (`buildBeginnerPrompt` defaults to it). They keep it, or move to `scaffolding.md`'s blocks; either way `beginner.md` isn't deleted by the swap.
7. **Onboarding places a new learner at step 1** (it stores `beginner`; the step defaults to 1): nothing to do beyond 3.
8. **Tests and smoke:** `check-beginner`, `check-path` and the version/stage tests follow the new rules; `smoke:live` plays a Beginner conversation in both countries and must pass before the release that swaps.
9. **Release, then Josh and Sophia play.** Beginner 1's code is removed later, once nothing refers to it (`new beside old`: the old one goes when the new one has won in play, not before).

Sizes: 1 is Josh's time; 2 is an evening; 3 is the week (server a day or two, screen a day, both countries); 4, 5, 7, 8 a day together; 6 nothing now.
