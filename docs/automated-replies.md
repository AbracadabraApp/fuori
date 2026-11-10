# Automated replies: conversations that play themselves

**Status (2026-11-10, later):** steps 5 (tool check) and 2 (visits with memory, repeat counts) built and run: see "Tool check" and "Visits with memory" at the end. Before that: build steps 1 and 1b built (`tests/experiments/automated-replies.mts`): whole Beginner 2 visits through the game's Beginner 2 turn, the learner's reply kind picked by code at a persona's rates, said-back lines and edits in code, own words / a question / English written by one small call each. No database yet (no memory between visits). First runs below.

## Why

A simulated learner would be a big gain for development, but we've never had a good one (`docs/prompt-testing.md` → F2). Josh: the mistake may have been mixing **quality** with **utility**. F2 asked for both at once: lines Josh would believe came from a real learner (quality), and a learner that never brings up what's measured (utility). A believable learner wanders; a controllable one is a bit artificial. Nothing passed, and everything that waited on it stalled.

Josh's idea (2026-11-09): **automated replies, the character's own offered answers sent back as the learner's reply.** Every Beginner turn already carries answers to say back, so a conversation can play itself with no learner model at all.

## What it's for

Things that only show over many turns or visits, where a steering learner spoils the measure (Josh: "auto mode might catch drift, length, cultural content"; "also repeated stories across visits"):

| What | How it shows | Counted in code or judged |
|---|---|---|
| **Drift** out of role | long conversations (15–20 turns) and several visits; real slips came at turns 8–20 | judged (a role question), flagged |
| **Length** | her words in the language per turn and whether they creep up; English per turn; turns per conversation; the goodbye offered around turn 8 or dragged out (Beto's five goodbyes) | code |
| **Cultural content** | something true and particular to this town | judged, as in the variety gate |
| **Repeated stories across visits** | exact repeats: the scorecard's "Repeats from earlier visits" (8+ word sentences from the last 3 visits); retold in new words (Don Ramón): content words (names, dishes, places) shared between visits flag the visit to read | code flags; "told as if new" vs "picked up as a thread" judged or read |

Because the learner only says what she offered, whatever local talk, drift or retelling appears came from her. A repeated topic isn't the fault (it helps learning); a visit replaying an earlier one as if new is.

## Design

**Where it runs.** A test script, through the server's own turn code (as `tests/experiments/moments.mts` and the variety gate do), against the test database, so memory is written between visits by the real summariser. Not in the app for now; a later option is a hidden "automated replies" switch in the Version panel to watch a conversation play on the phone.

**The learner's turn.** Offered answers aren't enough (Josh, 2026-11-09: "the automated reply would need to generate replies beyond offered replies"): real learners answer in their own words, ask her things, answer in English, get stuck. So each turn has two steps, and only the second may write anything:

1. **Code picks the kind of reply**, at seeded rates (the persona below): say an offered answer back; an edit of one; own words; a question to her; English; help ("how do you say…?"); silence; a push off the topic; goodbye.
2. **The line:**
   - *Said back and edits:* from her offered answer, by code, so exactly what was done is known (one word swapped, a gender or verb mistake, spelling mangled the way speech-to-text does, the English under the bubble said instead, a word dropped or the sentence left unfinished).
   - *Own words, a question, English, help, a push:* one small generation call writes a line **of that kind only**, answering her last line, at the persona's length (words per line from real play) and level (mostly words she has just used, plus a few). It never brings up a topic of its own, except for a push. Then, at the persona's rate, a mistake is added by code, so mistakes are known too.

The difference from the simulated learner that failed (F2): code decides what kind of reply comes and when, so a run is controlled and repeatable; the generation only fills in one line of a set kind. Realism is checked by numbers against real play, never by believability.

**Persona mixes from real play** (the rates of each kind, not believability, make it realistic; the deep dive's counts):

| Persona | Said back | Own words | English or help |
|---|---|---|---|
| Like Jennifer (Mexico, S2–S3) | ~85% | ~0% | a few asides |
| Like Josh at S1 (Italy) | ~58% | ~35% | a few |

Checked against real play by numbers (words per line, share of English, said back against own words), never by "would Josh believe it". The Nov 8 test learner already matched real learners on words per line (8.7 against 8.5).

**Turns with no bubbles** (Beginner 2's glossed words, free replies, Intermediate): nothing to pick. The turn could also carry likely answers that aren't shown. That would serve three things: automated replies on every setup, replies written ahead on every setup, and the record telling said back from own words without bubbles. A Beginner 2 decision, not built.

**Runs.** A set of places × visits × persona, both prompt versions when comparing; every turn saved to a file and read before any number is reported (`docs/prompt-testing.md` rule 8). Italy first, Mexico to confirm.

## What it is and isn't

- **A tool, not a test of a change.** In the testing method's terms it's the free-play check after a change is kept, and a drift check between releases. Testing a unit stays with fixed moments (rule 5).
- **Smoother than real play** at first: real learners are messier than any mix. The rates and the generated kinds narrow the gap; play shows what's left.
- **Josh's playing stays the test of realism** (does a conversation flow, is it alive).
- **Judged measures are flagged** (rule 7b); the code counts come first.

## Build steps (when it's picked up)

1. The script: one place, one visit, said back only, through the turn code; save every turn.
1b. The generated kinds (own words, question, English, help), one call each, of a set kind and length.
2. Visits with memory between them; the repeat counts (exact and content-word overlap).
3. The edits and the push; the two persona mixes; the check against real play's numbers.
4. Length and goodbye counts; then the flagged judges (role, particular to the town) from the variety gate.
5. A tool check: does it run, are the counts right on lines read by hand (called a tool check, not a test).

## First runs (2026-11-10, cluster 1, persona "josh", 6 characters × 2 visits, up to 12 turns)

| | Italy | Mexico |
|---|---|---|
| Turns | 119 | 102 |
| Broken | 1 | 5 (all "hit max_tokens", intermittent: the same turn replayed came back at 137 tokens) |
| Setup followed | all but the character's own last goodbye | the same |
| English beside every question | 118/118 | 97/97 |
| Words a turn: English / the language | 13.7 / 10.0 | 13.1 / 12.6 |
| The English invitation on other turns | 0 | 0 |
| Announcing ("You could ask me one of these:") | 27 turns (22 on questions-to-ask) | 15 (14 on questions-to-ask) |
| Visits ended on a goodbye | 11/12 | 6/12 (the broken turns stopped 5 visits early) |

Read from the counts: the setup line next to the latest message holds (no invitation copied, bubbles where the setup wants them); questions-to-ask announces itself on most of its turns; about 3% of turns run past the token limit.

## Tool check (2026-11-10, Mexico, 4 characters × 1 visit × 10 turns, persona josh)

Read all 40 of the character's turns by hand (`tests/experiments/out/automated-toolcheck-*.json`) against what the script counted. No game code or prompt changed.

| Count | By hand | Verdict |
|---|---|---|
| Setup followed 38/40 | The two "failures" were the characters' own last goodbyes (done, nothing to say back, by design). Every other turn had the setup's shape: opener 4/4 with two answers; two-en turns with a question and two answers; ask-en turns with two questions to ask; goodbyes with two replies | **Wrong, fixed**: a turn that ends the visit counts as followed (40/40) |
| English beside every question 40/40 | All 26 turns with a question have its English straight after (code's `questionEcho` fired on exactly those 26). The 14 others (the ask-en turns, the goodbyes) have no question to echo, so passed trivially | **Misleading, fixed**: now "25/25 turns with one" |
| Words a turn: English 5.0 | Only counted the English parts. In cluster 1 every phrase carries its English as a gloss (written by `glossAll` in code, 40 of 40 turns changed), about 15 words a turn, so what the learner reads is ~20 English words | **Wrong, fixed**: English = parts + glosses, both shown (20.7 = 4.8 + 15.9) |
| Words a turn: Spanish 18.0 | Hand count of one turn (Memo's tejuino, 25) = the script's | Right |
| Announcing 0 | None of the 40 turns announces its answers; and the check can fire (27 hits in the first Italy run) | Right (it is a phrase check in English, so it only sees English announcing) |
| English invitation on other turns 0 | None on a turn that isn't the invite turn | Right |
| Visits ended on a goodbye 3/4 | Chucho, Mateo and Rosario ended (done); Memo's goodbye turns came at 9 and 10 with answers and no "done", cut off by the 10-turn limit | Right (a turn limit, not a drag) |
| Code fixes: glossAll 40 · questionEcho 26 | A fix is listed only when it changed the parts. Claude's own parts carry no gloss at all in cluster 1 here, so `glossAll` changes every turn; `questionEcho` matches the turns with a question | Right, and a finding: in cluster 1 all the English under her phrases is added by code, none is Claude's |

Also noticed by hand, not counted before: **goodbyes that don't close.** After the learner's goodbye the character sometimes answers with a goodbye that still offers two replies and isn't done (Mateo turn 10 done with replies; Memo turns 9 and 10 not done). The script now prints goodbye turns a visit (2 is the normal pair).

Of the 40 turns, none read as out of role or broken. The learner side is plainly artificial in places ("Me gusta los tacos y la fruta", "qué hayen el barrio"), which is the point of the tool, not a count problem.

## Visits with memory (2026-11-10, cluster 1, persona josh, 10 places × 5 visits × 12 turns, each country, on the mini)

How it runs: a place's five visits are played in order. After each visit the game's own memory writer (`summarizeWithClaude` in `lib/remember.ts`, the call a real conversation ends with, notes capped at 10) writes the character's notes from the transcript and the notes so far; they are passed as `memory` into the next visit's turns, as `take-turn.ts` does. No database. The notes grew as they should (6 → 8 → 10 after visits 1–3 in the pilot) and read sensibly ("They walk a lot around the Roma."). Counts, quotes and every turn: `tests/experiments/out/automated-memory-{es-mx,it}-*.json` (not in git; they hold the lines). Pilot (2 places × 3 visits) ran first and showed the same pattern.

| | Mexico | Italy |
|---|---|---|
| Visits / turns / broken | 50 / 522 / 3 | 50 / 545 / 0 |
| Setup followed | 519/519 | 545/545 |
| Words a turn: English / the language | 19.3 / 17.4 | 17.4 / 15.5 |
| Visits that ended on a goodbye (12-turn limit) | 32/50 | 41/50 |
| Visits with more than 2 goodbye turns (dragged out) | 19/47 | 31/50 |
| **Repeats, later visits (40 each)** | | |
| Exact sentence repeats, 8+ words (the scorecard's rule) a visit | 3.2 | 1.6 |
| Exact repeats, 4+ words a visit | 17.4 | 18.7 |
| Judge: told or asked again as if new, per later visit (stories / facts / questions) | 1.9 (2 / 54 / 21) | 2.2 (0 / 53 / 34) |
| Judge: later visits with at least one | 35/40 | 33/40 |
| Judge: picked up openly as a thread ("as I told you") | 3 in 40 visits | 3 in 40 |
| Judge: per visit number (v2 / v3 / v4 / v5) | 1.9 / 2.1 / 2.0 / 1.7 | 2.2 / 2.4 / 2.2 / 1.9 |

**What the counts mean, after reading ~28 of the judge's items by hand (14 a country):**
- **The judge over-counts.** About 10 of the 28 are the character saying the same thing again as if new, in the same or nearly the same words: "Mi descanso es a las dos." (Diego, visit 3, word for word as visit 2); "Sto aprendo una bottiglia di Brunello." (Leonardo, visits 3 and 4); "A novembre c'è poca gente." (Alessandro, visits 1, 2 and 5); "Le piace guardare la strada dalla finestra?" asked in visits 3 and 5 (Roberto); "Mi nieto lee las etiquetas despacito" retold with the same grandson (Ana); "Macino il caffè fresco. Poi premo…" (Luisa). The rest are the same *topic* again in new words (weather, which flavour you like, the cooking of the dish): the town stays the town, and by the doc's own rule a repeated topic isn't the fault. So roughly one flagged item in three is a true retelling, about **0.7 a later visit**; the judge's 2 a visit is the ceiling.
- **Memory is written but hardly shows.** Only 3 of 40 later visits in each country pick something up openly, against ~2 things a visit told again as new. The notes exist and are in the prompt; the character doesn't say "you came last time".
- **Exact identical sentences are rare at 8+ words (about 2–3 a visit) and common at 4+ words (17–19 a visit):** Beginner sentences are short, so the scorecard's 8-word rule mostly can't see Beginner repeats. Most of the 4+ are routine ("Hoy hace fresquito", "Que le vaya bien") that a shopkeeper really repeats.
- **The content-word measure doesn't work as built.** 56% of a later visit's words (5+ letters) occur in earlier visits, against 63% (Mexico) and 71% (Italy) for *other* places' visits, but the "other places" pool is nine characters' lines, a bigger pool, so the comparison isn't fair. Dropped as a measure; the exact repeats and the judge carry it. (Left in the output; don't quote it.)
- **Goodbyes drag.** 19 of 47 Mexico visits and 31 of 50 Italy visits had 3–4 goodbye-setup turns, where two is the pair (the learner's goodbye, her answer). In Italy more than half of the visits.
- Italy ended on a goodbye 41/50, Mexico 32/50; the rest hit the 12-turn limit, 3 Mexican visits stopped early on a broken turn (max_tokens, as before).

**Not done / caveats.** The judge is flagged (rule 7b), and over-counts, by my read of 28 items, not all of them; the true-retelling rate (about a third of flags) is from that small sample. The learner here is Josh's persona (50% said back), the same for every visit, and she never asks about the earlier visit, so a real learner who asks "have we met?" is not covered. Cluster 1 only. No game code or prompt was changed.
