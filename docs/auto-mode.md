# Auto mode: conversations that play themselves

**Status (2026-11-09):** notes and a design from a conversation with Josh. Nothing built. On the to-do list (`docs/06-roadmap.md` → Now).

## Why

A simulated learner would be a big gain for development, but we've never had a good one (`docs/prompt-testing.md` → F2). Josh: the mistake may have been mixing **quality** with **utility**. F2 asked for both at once: lines Josh would believe came from a real learner (quality), and a learner that never brings up what's measured (utility). A believable learner wanders; a controllable one is a bit artificial. Nothing passed, and everything that waited on it stalled.

Josh's idea (2026-11-09): **an auto response mode, the character's own offered answers sent back as the learner's reply.** Every Beginner turn already carries answers to say back, so a conversation can play itself with no learner model at all.

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

**Where it runs.** A test script, through the server's own turn code (as `tests/experiments/moments.mts` and the variety gate do), against the test database, so memory is written between visits by the real summariser. Not in the app for now; a later option is a hidden "auto" switch in the Version panel to watch a conversation play on the phone.

**The learner's turn**, each picked at seeded rates:
- **Say an offered answer back:** the first, the second, or the one that fits a persona.
- **Edits to her answer** (utility behaviours, each known exactly, so no judge is needed to know what the learner did):
  - one word swapped, or a gender or verb mistake;
  - spelling mangled the way speech-to-text does;
  - the English under the bubble said instead;
  - a word dropped, or the sentence left unfinished;
  - silence;
  - a push: an off-topic request (for drift; real slips came after pushing).
- **Goodbye** when she offers it, or after a set number of turns.

**Persona mixes from real play** (the rates, not believability, make it realistic; the deep dive's counts):

| Persona | Said back | Own words | English or help |
|---|---|---|---|
| Like Jennifer (Mexico, S2–S3) | ~85% | ~0% | a few asides |
| Like Josh at S1 (Italy) | ~58% | ~35% | a few |

Checked against real play by numbers (words per line, share of English, said back against own words), never by "would Josh believe it". The Nov 8 test learner already matched real learners on words per line (8.7 against 8.5).

**Turns with no bubbles** (Beginner 2's glossed words, free replies, Intermediate): nothing to pick. The turn could also carry likely answers that aren't shown. That would serve three things: auto mode on every setup, replies written ahead on every setup, and the record telling said back from own words without bubbles. A Beginner 2 decision, not built.

**Runs.** A set of places × visits × persona, both prompt versions when comparing; every turn saved to a file and read before any number is reported (`docs/prompt-testing.md` rule 8). Italy first, Mexico to confirm.

## What it is and isn't

- **A tool, not a test of a change.** In the testing method's terms it's the free-play check after a change is kept, and a drift check between releases. Testing a unit stays with fixed moments (rule 5).
- **It tests the most obedient learner unless edits are mixed in.** Conversations are smoother than real ones; the edits and the push fill that in.
- **Josh's playing stays the test of realism** (does a conversation flow, is it alive).
- **Judged measures are flagged** (rule 7b); the code counts come first.

## Build steps (when it's picked up)

1. The script: one place, one visit, say-back only, through the turn code; save every turn.
2. Visits with memory between them; the repeat counts (exact and content-word overlap).
3. The edits and the push; the two persona mixes; the check against real play's numbers.
4. Length and goodbye counts; then the flagged judges (role, particular to the town) from the variety gate.
5. A tool check: does it run, are the counts right on lines read by hand (called a tool check, not a test).
