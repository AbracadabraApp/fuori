# Dialogue plan

The one list of dialogue work (laptop dialogue session; another session has the screen). How dialogue works today is [dialogue-now.md](dialogue-now.md); what's decided is [dialogue-model.md](dialogue-model.md). Started 2026-11-12 from Josh: "focus on our dialogue model" and "reorganize all of todays assessment into a action plan"; rewritten the same day to be readable (Josh: "yes" to tidying it). The older item numbers (1.1, 5.4…) are kept in brackets, because commits and messages use them.

**Rule for the work (Josh, 2026-11-12):** experiments are for creating information in an unknown situation. Where the information is already there (his words, a cause found), build it and let his play judge it.

## To do (2026-11-14)

Josh, 2026-11-14: "I think no work list has been made. Just documentation. Create a todo list out of all the work - bubbles, bids, terms, etc". Gathered from bids.md, questions-and-bubbles.md, dialogue-structure-reference.md, mix.md, learner-loop.md, play-readings.md, bugs.md and this plan's older sections. Everything from 2026-11-12 and 13 is live (origin/live at c60d638), so the old "Now" and "Waiting on you" are done and folded in here. **Who:** *build* = ready, on Josh's word, with a changelog entry; *Josh* = his choice or his play; *count* = read saved visits, changes nothing; *later* = not before the items it depends on.

### Bids and endings
| # | To do | From | Who |
|---|---|---|---|
| D1 | A goodbye can carry one invitation from the character's world ("Mañana le enseño la mina"), no question; allowed, not required. Today dialogue.md's goodbye lines say "nothing new" | learner-loop.md (bids for returns) | **done** (577a8ea: the goodbye and the close may say what the character would show, do or tell next time, still with no question; replayed goodbyes: Italy 0/16 → 6/16, Mexico Beginner 4/12 → 12/12; watch for a habit at Beginner; not released) |
| D2 | Keep the bid: the next visit opens on it, whenever it comes. First play a return to Isidro (the mine) or Elena (Ballarò) to see if memory already carries it | learner-loop.md | Josh (2026-11-14: "will do"), then build if it doesn't |
| D3 | An offered story gets told (Beatrice's devil story: "want to hear it?", yes, never told); same family as B6, the character not taking up what was said | play-readings.md; bugs.md B6 | build, with B6 |

### Questions and bubbles (Beginner)
| # | To do | From | Who |
|---|---|---|---|
| D4 | ~~Read the five rewritten visits and say what holds~~ **Done** (Josh, 2026-11-14), so D6–D9 and D25–D33 no longer wait on it | questions-and-bubbles.md → Next step | done |
| D5 | Recount B24 (the closing questions) on visits played on the live version | bugs.md B24 | count, **too early** (2026-11-14: one Beginner visit with replies on the live version, Italy; its 5 questions: no "¿Lo ve?", no A or B, but all yes/no, now "Le piace…?" and "Vuole…?"). Recount after more play |
| D6 | Comment or question: some turns close on a comment, set in the draw of turn kinds (code, no new instruction) | questions-and-bubbles.md | **done** (d18ac92b: a comment setup at steps 1–5, weight 2; not released) |
| D7 | **The last sentence follows the question's ladder, whether it's a comment or a question:** steps 1–3 its English said and printed under it, steps 4–5 said only, step 6 neither (ladder: dialogue-model.md, 2026-11-12). Josh, 2026-11-14: "i think the distinction was questions are read in english but comments werent but I don't think that holdds"; then, after a print-Spanish-only spec: "ok - my mistakee - follow the laddedr". Today the code finds only a question (`questionOf`, the question echo since 27a7fdb), so a turn ending on a comment gets no English said or shown. One bubble uses its words, one is new | questions-and-bubbles.md | **done** (d18ac92b: a comment's last line printed and said by the ladder, as a question's; not released) |
| D8 | New kinds of question, one at a time, each played before the next: About you first, with answers that open a thread ("Sì, mio nonno era giardiniere"); then Guess, Remember, Offer, Help, Words, senses beyond sight | bid menu (dialogue-structure-reference.md § 2a, bids.md); questions-and-bubbles.md | build, one by one |
| D9 | Thread: the turn after a bubble goes one step deeper into whichever was said | questions-and-bubbles.md → Thread; play-readings.md | build with D8 |

### Bubble types (what the learner is offered to say)
Today's pairs are mostly yes/no, this/that, two questions to ask and goodbyes, in four verbs and two fillers ("me gusta mucho", "es muy bonito"), almost never about the learner (questions-and-bubbles.md → What the visits show). New kinds, each with its pair; one at a time beside D8, played before the next.
| # | Bubble type | Example | Who |
|---|---|---|---|
| D25 | **Help**: the learner can ask for help, offered as a bubble when a turn was hard. None today | "No entiendo." / "¿Otra vez, más despacio?" | **done** (eb48ab3: one of the two answers can ask about a word given no English, or for it again more slowly, now and then; replayed: 0/21 → 5/21 turns; not released) |
| D26 | **About me**: something of the learner's own that opens a thread (the Beginner's way to bring a grandfather) | "Mio nonno era giardiniere." / "Nella mia città ci sono parchi grandi." | build (with D8, D9) |
| D27 | **A pick with a reason** in place of a bare pick | "El patio, es más tranquilo." | **done** (392587ed: the pair rules in scaffolding.md Answers; replayed 30 pairs: yes/no 10 → 0, filler 9 → 5, asks back 0 → 4, describes 1 → 3; not released) |
| D28 | **An answer that asks back** in place of yes or no | "Todavía no. ¿Vale la pena?" | **done** (392587ed: the pair rules in scaffolding.md Answers; replayed 30 pairs: yes/no 10 → 0, filler 9 → 5, asks back 0 → 4, describes 1 → 3; not released) |
| D29 | **A description** that puts the place in the learner's mouth, in place of "es muy bonito" | "Hay muchas flores y veladoras." | **done** (392587ed: the pair rules in scaffolding.md Answers; replayed 30 pairs: yes/no 10 → 0, filler 9 → 5, asks back 0 → 4, describes 1 → 3; not released) |
| D30 | **One is right** (comprehension or a guess); a wrong pick gets a light recast in role, since it may be a mishearing | "¿El comal para qué es?" → "Para tostar tortillas." / "Para lavar los platos." | build (with Guess, D8) |
| D31 | **Words**: the learner teaches the character, Josh's favour the other way round | "Se dice 'bell'." / "No sé, ¿cómo se dice?" | build (with Words, D8) |
| D32 | **Gaps only for words the learner has**: a name, a place, a number ("Me llamo …"); a gap that needs a word in the language stalls | "Soy de …" | **done** (392587ed: the pair rules in scaffolding.md Answers; replayed 30 pairs: yes/no 10 → 0, filler 9 → 5, asks back 0 → 4, describes 1 → 3; not released) |
| D33 | **A pair is two real things that lead to different places**: no "No, no lo veo", no "No, gracias" that stops the scene, no two echoes | (questions-and-bubbles.md → a test for a pair) | **done** (392587ed: the pair rules in scaffolding.md Answers; replayed 30 pairs: yes/no 10 → 0, filler 9 → 5, asks back 0 → 4, describes 1 → 3; not released) |
| D40 | **A speaker icon on each reply bubble** that plays its line, as Say it has (SayItBubbles.swift, "hear it"); the character never reads them (Josh, 2026-11-14: "use icon"; "i don't want the character reading any reply bubbles"). A new element on the screen, so a mockup to Josh first | dialogue-model.md; BeginnerBubbles.swift | **done** (variant A, Josh 2026-11-14: a speaker after the line on every answer bubble, as Say it's; plays it in the phone's voice with the mic closed, then reopens it; not where the bubble is itself a tap; builds; not on the phone yet) |

### Promotion (moving up)
Today (`lib/level-up.ts`): after 3 conversations at a step, each with 3 or more replies, the game offers the next step and the learner chooses ("Not yet" asks again 3 conversations later); no score decides (Josh, 2026-11-11). It runs from step 1 to step 6 and stops there.
| # | To do | From | Who |
|---|---|---|---|
| D34 | **Step 6 to Intermediate:** nothing is offered at the top of Beginner today | this plan → Steps 4–6 | **done** (0e6aefbb: after 3 counted visits at step 6 the offer moves the learner to Intermediate, as Settings would; the app takes the new level at once; the offer screen labels the card "Intermediate" with a preview line at that level; not released; the screen's new words not yet seen by Josh) |
| D35 | **Intermediate to Advanced:** an offer to move up, as between steps; the Advanced experience itself not worked on yet (Josh, 2026-11-14: "we can put a step in but not focus on the advanced exxperience yet") | lib/level-up.ts | **done** (0e6aefbb: the same offer from Intermediate to Advanced; Advanced itself unchanged; Advanced gets no offer. Note: a long-time Intermediate with no start date, e.g. Sophia, is offered Advanced after her next ordinary visit) |
| D36 | **Each step hands over more of the bidding**, in its bubbles: answers to say back, then questions to ask, a sentence to finish, About me, then the learner's own words; the bubbles fade from answers to hints. Promotion changes what the learner is offered to say, not only how much English they hear | bids.md → The steps in between; beginner-2.md → The reply ladder; D25–D33 | build, with D10 |
| D37 | **Going back:** a learner who keeps asking for English ("mucho mucho inglés por favor", B7) is offered the step below, or the visit backs off (D12). A step can be set by hand today, but nothing offers it | bugs.md B7 | future (Josh, 2026-11-14: "SAVE ON LIST As future") |
| D38 | **The pace:** how long learners stay at each step, and whether they say yes or "Not yet" | lib/level-up.ts | count |
| D39 | **The offer's preview** rewrites the character's last line at the next step as one line; steps 4–6 play as separate bubbles, so the preview doesn't match what comes | this plan → What doesn't hold together | **done with D10**: every step now plays as one line, so the preview's one line matches |

### The mix and English
| # | To do | From | Who |
|---|---|---|---|
| D10 | Steps 4–6: **build the direction below** (one screen, one support taken away per step). Decided (Josh, 2026-11-14): "don't gate on play today", so no hearing them as they play first | this plan → Steps 4–6 | **done** (67432462: steps 4–6 on the one-line reply; step 4 Level 2b, step 5 Level 3, step 6 no answers; the question's English printed 1–3, said 1–5; answers keep their English at every step, Josh's 2026-11-09 rule, so "step 5: answers in Spanish only" was dropped; not released) |
| D11 | Too fast and too much Spanish at step 1 | bugs.md B7 | build, after play on the live version |
| D12 | Asking for help moves the hard words into "new, with a gloss" for the rest of the visit, at every level (Nunzio went back to new words after two turns) | mix.md → three bins; bugs.md B13 | **done** (32c601f, 2026-11-14: a `hard` flag on the reply, dialogue.md's Help asked note on every later turn; Nunzio replayed: "quercia (oak)" 6 of 6, median 29 words against 39; not released) |
| D13 | Idioms in play: code picks one by weight (importance, due for this learner, not heard just now) and the character may use it, glossed picture then meaning, at a rate per level. The stores exist, unused | mix.md → Idioms | **done at Beginner** (2026-11-14: an idiom to guess about one visit in three, the follow-up next turn, the learner's recent ones left out; Intermediate, saying it back and recall later still to come; not released) |
| D14 | The mix as pieces put together by code, so an unsupported run can't happen | mix.md → How to get it to zero | build (Josh, 2026-11-14: "yes") |

### Memory and learning from play
| # | To do | From | Who |
|---|---|---|---|
| D15 | How often learners come back to the same character (decides how much a richer character memory is worth) | learner-loop.md | **done** (2026-11-14, 209 visits since 2026-10-12: 111 of 141 learner–character pairs met once; a third of visits are returns, but half of those are re-entries within the hour; real returns are two learners, median about 3 days apart) |
| D16 | Which kinds of bid get taken up: rerun `scripts/bid-count.mjs` once there are 20 new-Beginner visits with three or more replies | bids.md; this plan → Later | count |
| D17 | A shared file of how the learner speaks and learns (level, recurring mistakes, words met; nothing about their life), read by every character and by Magda in place of the study file | learner-loop.md | later |
| D18 | Observers read family play and flag problems as candidates for bugs.md | learner-loop.md | later |

### Bugs still open (bugs.md)
| # | To do | Who |
|---|---|---|
| D20 | B10 the learner addressed in the feminine (Ofelia) | **fix on main + database** (2026-11-14): Josh's address was already "a man"; the cause was gendered memory notes. memory.md now writes "they" (b1e1ab33, not released); Ofelia's and Nonno Ettore's notes corrected in the database. Closes when Ofelia is played without it |
| D21 | B12: when the learner replies, the reply bubbles go but the character's last bubble stays until the next line arrives; both should go on the reply (Josh, 2026-11-14) | **done** (059fc9f, 2026-11-14: the character's bubble and the answers go when the reply is sent, at every level; make build and package tests pass; not on the phone yet) |

### Added from the Mac mini's reading (2026-11-14)
Josh, to the Mac mini session, after it re-read this list against questions-and-bubbles.md: "add missing D items based on today". These are things that reading found and no item above carries.
| # | To do | From | Who |
|---|---|---|---|
| D41 | **Count what the bubbles offer, on the live version:** pairs by kind (yes/no, this/that, two questions to ask, comment and question, goodbyes), the filler lines ("me gusta mucho", "es muy bonito"), how many different verbs, gaps. Today's count was made by hand-written throwaway code; save it as a script beside `scripts/bid-count.mjs`, which counts what learners do after a question, not what they are offered. Run with D5 and D16 | questions-and-bubbles.md → What the visits show | count |
| D42 | **When the learner adds something of their own to a bubble, does the character take it up?** Josh did in 33 of 56 replies in the five visits (about himself 8, his own questions 7); how the characters answered was not read. Evidence for B6 and D3 | questions-and-bubbles.md → What the learner said | count |
| D43 | **Bubble type: from what the character remembers about this learner.** One bubble in 110 could belong to no other learner ("Sí, la crema, como siempre"). A wrong memory makes a wrong bubble ("Silvia está bien", B9), so after B8 and B9 | questions-and-bubbles.md | build, after B8, B9 |
| D44 | **Try the new kinds at sights first.** The narrow pairs come from plazas, churches and murals, where the character has nothing to hand over and offers to show things; a place that sells something gives two real bubbles unprompted ("Con chile." / "Sin chile.") | questions-and-bubbles.md → Ten days | build (the order for D6–D8, D25–D33) |
| D45 | **The categories are not judged.** Words, Help and Play are Claude's additions to Josh's four; three placements are open (a guess: Play or Comprehension, as in the comal example; belief; "teach me") | questions-and-bubbles.md → Placements not settled | **decided** (Josh, 2026-11-14): Help and Play: "include". Words waits for step 6 or Intermediate ("i like the idea but its not working": at Beginner the English gives the answer away). So seven categories, Words not yet at Beginner; the kinds stay held until Josh has played (D8, D30, D46) |
| D46 | **Kinds D8 doesn't name:** in Help, advice ("¿Lo pinto azul o rojo?"), a favour ("¿Me pasa el cepillo?"), settling an argument; in Play, a bet, a dare, imagine. After Guess and Help have been played | questions-and-bubbles.md → The kinds | build, with D8 |
| D47 | **Keep the questions-to-ask turns when D6 changes the draw.** They were 8 of 55 turns in the five visits, taken 6 times of 7, with the most varied Spanish of any bubbles | questions-and-bubbles.md | build (a guard on D6) |
| D48 | **Record which bubble a reply was read from, or none.** Nothing does today, so take-up is matched by eye and a misheard bubble looks like the learner's own words; D16, D41 and D42 all lean on it | questions-and-bubbles.md → What the visits show | later |
| D49 | **This plan below the To do:** the Done table's "Live?" column says No for rows that have been live since c60d638; "What each step plays today" and the deep-dive thread on the intro predate the intro cut and the close on the 8th turn (13b–13d) | this plan | **done** (2026-11-14: the Done table's "Live?" column checked against origin/live; every row live) |
| D50 | **A loop analysis of the game, run off every conversation** (Josh, 2026-11-14, evening: "having conversation data get aggregated on turn would add more than tracking what words were missed"; then, when the Mac mini session wrote this up as totals per learner: "i was meaning more of loop analysis for the game triggered of each conversation"). So it is learner-loop.md's loops, +dialogue above all, and D18 given a shape: when a visit ends, an observer reads its turns and writes flags as data, turn by turn (a question repeated, an answer offered about something already explained, the same pair pattern every turn, what the learner said not taken up, a visit running past its close, a misheard line kept as a fact, and what went well: a bid kept, the learner's own words), added up across visits. It is what was done by hand three times today (B24, the bubble counts, the read of the first visits after the release). Each saved turn already has its kind, step, offered answers, reply, reply time, `hard` and `idiom`; missing are the observer, the totals, and which answer a reply was read from (D48). The per-visit list of missed words (memory.md's review) is read by no part of play | learner-loop.md → Four loops; D18; `lib/recording.ts` | count first, by script on saved visits (D41, D42 are two of its columns), then the observer |
| D51 | **The Learn sheet at the end of a visit, at a third of today's page** (Josh, 2026-11-14, evening: "the sheet would have to be about 1/3 the content of the current link - more dismissable *as it would interrupt* and more entertaining in some way?"; the design is after-conversation.md, Kind 2 and "The sheet"). Checked the same evening: the Learn page is not empty at Beginner (four of Josh's visits through the live writer: 2–3 fixes, 5–7 words, 3–4 verbs and a culture note each), but about half the fixes are wrong because the learner was reading an offered answer aloud ("No quiero ver más el mural" was the answer "No, quiero ver más el mural") or was misheard. So: the culture note first, two or three words, at most one fix and never from a line that matches an offered answer, no verb table; something to hear, what they'll remember about you, or what's next with them, as the entertaining part. A mockup to Josh first, with a real visit, after he has played some visits ("ill do some visits and you can put it later") | after-conversation.md; lib/learn.ts | Josh plays, then a mockup |
| D52 | **Recycling: pieces the learner has met come back from other characters** (Josh, 2026-11-15: "so this is a learning feature - not a spanish/english scaffolding issue: characters"; on Claude's "Hearing the same piece in different places is how it sticks. It doesn't change how much English the learner gets, so the level stays consistent"). Code tracks what the learner met and said (the braces give every piece and its English) and hands a character a few to use where they fit; how much English the learner hears stays with the level. The same record, also learning features and not the mix (Josh, 2026-11-15: "and these are as well"): **recall in character**, now and then, once a visit, a character asks about something the learner met earlier, spaced, rare, not a quiz (the comal, mix.md → Research); **level up from what they know**, a step offered when the learner has met and said enough, not by counting conversations; **material for Learn**, the end-of-visit sheet (D51) and Magda's lessons | mix.md → Scaffolding throughout | Josh: shape first, nothing built |

### Docs and code housekeeping
| # | To do | Who |
|---|---|---|
| D22 | Remove the old Beginner and its prompt blocks (due about 2026-11-19, a week after the cut-over) | build |
| D23 | One doc for bids and the turn: bids.md, the terms and bid menu of dialogue-structure-reference.md, and questions-and-bubbles.md, once the Mac mini session is done with the last | **done** (2026-11-14: docs/bids.md is the one document: the model, the Gottman background and bid menu from dialogue-structure-reference.md § 1a and § 2a, and questions-and-bubbles.md, moved word for word; both old places keep a pointer) |
| D24 | beginner-prompt-inventory.md describes the old Beginner prompt; the test-designer agent reads it. Redo it for the new prompt or retire it with D22 | **done** (2026-11-14: archived with a "superseded" note; the test-designer agent and prompt-testing.md now point at scaffolding.md's blocks and changelog) |

Suggested order: D1, D20 and D12 (small, ready); D2 and D4 (your play and reading); then D6–D9 with the bubble types D25–D33 (D25 Help and D26 About me first); D5, D15 and D16 whenever a session is free, since they change nothing.

## Done (2026-11-12)

"Live?" checked against origin/live on 2026-11-14 (git merge-base --is-ancestor).

| What | Commit | Live? |
|---|---|---|
| "Where are you from" and "newcomer" lines out of the Beginner prompt [1.1, 2.3] | 3322eb2 | Yes |
| Beginner goodbye offered once on the 7th turn; the close by the intro's beat count removed; the intro prompt's beats wording made consistent [1.2, 1.3] | ecd7fab | Yes |
| Dead code out: the summary call, the answer said inside her line [5.6] | f5a8ca5 | Yes |
| CLAUDE.md points at dialogue-now, dialogue-model and this plan; the M1 and October designs archived | 614da8d | (docs) |
| Every Beginner on the new Beginner; the old one behind the hidden switch for a week (the screen session) [5.1, 5.2] | b45d171 | Yes |
| Shorter step 1 (median 60 → 37–47 words on your Guanajuato visits replayed) [A] | b27cb88 | Yes |
| A goodbye with your name or a thanks still ends the visit [part of 5.3] | b27cb88 | Yes |
| "Take up what they just said before you add anything of your own" (the accept half of your bids model) [4.1] | b27cb88 | Yes |
| Beginner intro question six words at most (the screen session) | intro.md 12b | Yes |
| The question's English shown and said at steps 1–3; the "English only the first time or when new" rules removed ("i never proposed that"; the screen session) | 27a7fdb | Yes |
| The lesson and culture writers say "learner", not "newcomer"; Magda sees the learner's example lines as "you" (146 lines in saved lessons were labelled newcomer); the lesson practice patch against "where they're from" removed [2.1, 2.2] | 8be8049 | Yes |
| A new kind of question at steps 1–3, Notice: the character points at something you can see and asks whether you see it ("¿Los ve? Do you see them?"), with two answers; in the rotation beside two answers and questions to ask [4.2] | e2412d4, adjusted in 95af83e | Yes |
| A Beginner visit winds down when the talk has run its course, before the turn's setup; the goodbye on the 7th turn stays as the fallback [5.3, your "c"] | 95af83e | Yes |
| Cultural lessons: the teller's question varies (what you make of it, something to picture or notice, something of your own like it) instead of "Have you ever…?" every turn; the answer taken up [4.3] | f612b53 | Yes |
| Beginner "questions to ask" turns stay, and the questions offered come out of what the character just said ("¿Qué es el huitlacoche?" after she names it), not stock ones like the bus fare (Josh: "I appreciate variety, but also coherent play") | 9a23f81 | Yes |
| Step 2 as short as step 1 (two short sentences and the question) with two or three Spanish phrases against step 1's one or two | 20926c8 | Yes |
| From Josh's evening play (Don Chucho, Raymundo): a return visit greets you as someone known, asks after what you told the character, and talks about something other than the work; "talk like a regular" for every character you've met; no "mire" given as a model; the goodbye left to you (no double goodbye); no repeats within a visit | ed467dd | Yes |
| Measures: what learners do after each kind of question (`scripts/bid-count.mjs`); turn length on replayed real visits (`tests/experiments/b2-turn-length.mts`) [3.1, A] | 8423712, 970ba64 | (tools) |
## For the deep dive (Josh, "later tonight or tomorrow")

The frame is [bids.md](bids.md) (a draft, not agreed): a turn as take-up, bid and supply. The threads to bring:
- **What a visit is for, and what makes the seventh visit worth having.** Culture first; the intro as a rest (both now in dialogue-model.md).
- **The small design** for the faults that kept coming back: the character says when it's winding down (one yes/no in its reply; turn 7 becomes a late safety net); memory keeps the learner's own words with dates and loose ends, checked against the transcript; a visit has a point (from the character alone, or offered from the town and the date).
- **Steps 4–6 as "from engagement to bids":** the steps hand the bidding over (answers to say back, questions to ask, a sentence to finish, their own words), and the bubbles fade from answers to hints.
- **The intro at Intermediate:** none, or thicker on culture (open, in dialogue-model.md).
- **Evidence:** Josh's round of play (the list in progress.md), read in bid terms.

## Later

- **Remove the old Beginner** (a week from 2026-11-12) with its prompt blocks in `levels.md` and `leveling.md`, and decide whether the welcome and lessons move to the new Beginner's prompt. [5.2, 5.6]
- **Rerun the counts** after 20 visits on the new Beginner with at least three replies from the learner (Josh: "how many conversations not days"; at about six questions a visit, enough to read each kind of question on): what learners do after each kind of question; whether characters ask and then carry on as if answered. `node scripts/bid-count.mjs` on a fresh snapshot. [3.1, 3.2]
- **Length rules written as prose** ("two short sentences", "six words at most"): leave unless your play says they don't hold. [5.5]
- **A step-3 character ended on an English question** (Don Chucho: "Hmm, maybe you want a boleada?"): watch for more before fixing.
- **Dropped: the rules inventory** (Josh, 2026-11-12, by not choosing it; Claude: an analysis that wouldn't change what's heard). Rules get fixed when play shows them misfire. [5.7]
- **No Intermediate lessons in Mexico** (Italy has them): deferred (Josh, 2026-11-12). Content, not the dialogue model; Sophia plays Mexico at Intermediate. [5.9]
- **Parked:** the turn-code refactor, until a change has to reach every kind of conversation. [5.8]

## Steps 4–6, in detail

**Your ladder for the character's question** (Josh, 2026-11-12, "this is what i want"; for "¿Le gustan los túneles?"):

| Beginner step | Under the question in her bubble | What the character says aloud |
|---|---|---|
| Steps 1, 2 and 3 | The Spanish, with "Do you like the tunnels?" printed under it | The Spanish question, then "Do you like the tunnels?" |
| Steps 4 and 5 | The Spanish only | The Spanish question, then "Do you like the tunnels?" |
| Step 6 (the last Beginner step) | The Spanish only | The Spanish question only |

Steps 1–3 play this way since 27a7fdb. Your worry about today's code: at step 4 all of the question's English went at once ("deep water").

**What each step plays today** (code on main, 2026-11-12):

| Step | What the character is told | What the learner gets to answer with | Reply and screen | Voice starts |
|---|---|---|---|---|
| 1 | Mix English and Spanish; one or two phrases with their English; two short sentences, then the question with its English | Two answers with English, or two questions to ask | One line; her bubble shows the question | On the first sentence |
| 2 | The same length as step 1, with two or three phrases (scaffolding.md 12h) | The same | The same | The same |
| 3 | Half Spanish, half English, never a sentence followed by its translation; the question with its English | The same, or none (an open question) | The same | The same |
| 4 | The same text as step 3 | Two questions to ask, or none | **Separate bubbles per phrase**, joined into the spoken line by code; the question's English not added by code | **After the whole reply is written** |
| 5 | Mostly Spanish; English only when asked or for a word they can't get from the scene | Two answers with English, or none | Separate bubbles | After the whole reply |
| 6 | The same as step 5 | None | Separate bubbles | After the whole reply |

After step 6 nothing: the level up isn't offered at the top, and nothing moves the learner to Intermediate.

**What doesn't hold together:**
- The screen and the wait change at step 4 while what the character is told doesn't (step 4 has step 3's text). Against "one screen, all levels".
- Step 5 gives back the answers with English that step 4 took away.
- The steps no longer follow the ladder they were designed from (`beginner-2.md` → The reply ladder): five of its rungs aren't in the code.
- The level-up preview rewrites her line as one line; steps 4–6 play in separate bubbles.
- Steps 5–6's text was copied from the old Beginner's stage 3, not written for this ladder.
- Step 2 now plays almost the same as step 1.

**A direction** (Claude's, not decided): what changes from step to step is how much Spanish the learner hears and how much they must say; the screen and the start of the voice don't change. So steps 4–6 stay on the one-line reply of steps 1–3, each taking away one support, with your ladder for the question:
- **Step 4:** mostly Spanish, with an English aside of her own now and then; answers as at step 3; the question's English said but not printed.
- **Step 5:** answers in Spanish only, no English under them; the question's English said but not printed.
- **Step 6:** no answers, their own words; the question in Spanish only. The next level up is Intermediate.

## Taken from your play (handed over by the screen session)

- **A. Beginner turns long and mostly English** (visits 6159f8cb Isidro and 409863b2 Raymundo, 2026-11-12: step 1 turns of 70–85 words). Cause: step 1 asked for three or four phrases with their English inside two or three sentences, and the phrases won. Replayed through today's call on those visits: 60 words a turn → 37 (two takes) and 47 (one take, as shipped); Spanish 28% → 34%. Shipped b27cb88.
- **B. Speech-to-text given the answers just offered** ("Quiero ver los altares" heard as "Kiran Velos Altera"). **Off the list:** Josh, 2026-11-12: "We don't support speech to text"; "i haven't experienced comprehension issues with whisper = background noice and mishearing but not misunderstanding".

## Notes on the open items

What each one resolves, and where the earlier thinking is.

- **Closing when the talk is done** [5.3]: four endings today (old Beginner: the model offers the goodbye; new Beginner: the goodbye on the 7th turn; lessons: a turn count; Intermediate: the learner's goodbye). Earlier thinking: `dialogue-structure-reference.md` § 11 (the first table); `progress.md` 2026-11-10 mini (Chuy: the goodbye on ten turns running).
- **Newcomer in the writers** [2.1, 2.2]: CLAUDE.md's learner rule; `progress.md` 2026-11-10 Learn-link ideas; `lesson-flow.md` → Practice; `lesson-steps.md`; `culture.md` → Pick, Choose.
- **New kinds of question** [4.2]: `dialogue-structure-reference.md` § 1a (bids; what kind of bid gets taken up), § 2a (the menu), § 12.1 (the palette); the count in `dialogue-now.md` § 4; `dialogue-model.md` → Questions (Beginner turns end on a question; the menu varies the kind, not that).
- **Steps 4–6** [5.4]: `beginner-2.md` → The reply ladder, Progression; `archive/beginner-2-step-2.md`; the Spanish-frame aside on card B2-E5 (`prompt-trials.md`).
- **Old Beginner removal** [5.2, 5.6]: `06-roadmap.md` → Now, "If Beginner 2 replaces Beginner 1: the changes after"; `archive/one-turn-engine.md` § 2.

## Documentation

**Target: five current documents, one job each.** `dialogue-now.md` (how it works, checked against the code; done), `dialogue-model.md` (decisions only), this plan (the work), `dialogue-structure-reference.md` (terms and bids), `dialogue-ideas.md` (faults with examples). `beginner-2.md` stays as the Beginner's spec.

**Done:** `dialogue-now.md`; CLAUDE.md and the README point at these; `M1-CONVERSATION-MODEL.md` and `04-conversation-engine.md` archived; the Beginner goals moved word for word into `dialogue-model.md`. 2026-11-12, evening: `dialogue-model.md` has the decisions of 11-10 to 11-12 (each quote checked against the record) and a "Tried and dropped" list; the fault log has an index of open and fixed; `level-judge-test.md`, `language-levels-plan.md`, `one-turn-engine.md`, `beginner-plan.md` and `beginner-deep-dive.md` archived, every link updated.

**Next:** after steps 4–6 are decided, `archive/beginner-2-step-2.md` and `archive/summary-and-mixed.md`; `archive/beginner-as-live.md` with the old Beginner; `dialogue-structure-reference.md`'s built-status lines into `dialogue-now.md`.

**What's kept when a document moves:** Josh's words and decisions, word for word; evidence (results, counts, quoted turns with character, place and time); one copy of each reason; what the code does only if it still does it. A dropped design keeps one line (tried, dropped, why). Nothing is deleted: what leaves goes to `docs/archive/` with "superseded by …, date" on top. Where it's unclear whether something was decided, it stays open and is put to Josh.
