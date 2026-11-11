# Beginner 2: step 2, and the step up

2026-11-10, night · laptop session · a one-page start for tomorrow. Step 1 (the English frame) went in tonight as `scaffolding.md` → "Level: 1" (2026-11-10q), not released. The ladder is in [beginner-2.md](beginner-2.md) → Progression; the research behind it in [summary-and-mixed.md](summary-and-mixed.md) → Frame mix; the screen in [after-conversation.md](after-conversation.md).

## Where things are

| | Her speech | Their reply | Exists? |
|---|---|---|---|
| Step 1 (cluster 1) | English frame; each Spanish phrase with its English after it; the question in Spanish, then English | two bubbles with English · questions to ask | **yes**, tonight; play it after the release |
| Step 2 (cluster 2) | English frame; the Spanish phrases **without** the English after each (heard before); the question still echoed | two bubbles with English · questions to ask | **no**: cluster 2 plays the old "Level: 1b" text (Beginner 1's stage: short Spanish sentences, English as little as needed) |
| Steps 3–6 | half and half → Spanish frame → Spanish | per the ladder | **no**: the old Level 2 and 3 texts under new numbers |

The Cluster stepper (Settings → touch and hold Version → Cluster 1–6) is the level-up for now: Josh picks the cluster by hand.

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
