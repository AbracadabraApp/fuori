# Dialogue plan

The one list of dialogue work (laptop dialogue session; another session has the screen). How dialogue works today is [dialogue-now.md](dialogue-now.md); what's decided is [dialogue-model.md](dialogue-model.md). Started 2026-11-12 from Josh: "focus on our dialogue model" and "reorganize all of todays assessment into a action plan"; rewritten the same day to be readable (Josh: "yes" to tidying it). The older item numbers (1.1, 5.4…) are kept in brackets, because commits and messages use them.

**Rule for the work (Josh, 2026-11-12):** experiments are for creating information in an unknown situation. Where the information is already there (his words, a cause found), build it and let his play judge it.

## Now: being worked on

1. **Done for the Beginner (see Done); Intermediate unchanged.** **Closing a visit when the talk is done** (your "c", 2026-11-12). Today a Beginner visit offers the goodbye on the 7th turn whatever is happening, and an Intermediate visit ends only when the learner says goodbye. Wanted: the character winds down when the talk has run its course, using a signal that works in any language. [5.3]
2. **Done (see Done).** **"Newcomer" in the lesson and culture writers.** The prompt that writes lessons labels the learner's lines "newcomer"; the one that picks cultural stories speaks of "the newcomer". Then the lesson practice prompt can drop its patch ("don't ask their name or where they're from"), which exists only because the Beginner prompt used to ask. Regenerating lessons or stories is your call. [2.1, 2.2]
3. **Done (see Done).** **A first new kind of question for Beginners.** Today the character's questions are nearly all "this or that?" (the Dora shape); after the six-word cap, five of six Italian intro questions start "Preferisce…". First new kind: *Notice* ("See those arches above us?") or *Offer* ("Want to try one?"), played before the next. "Finish the sentence" comes later: learners left on it more than on any other kind (27%). [4.2]

## Waiting on you

1. **Release.** On main, not live: the shorter step 1, the goodbye fix and "take up what they said first" (b27cb88); the shorter intro question (intro.md 12b); the question's English at steps 1–3 and the "first time or when new" rules removed (27a7fdb).
2. **Steps 4–6.** Never played; today they switch to a different screen and a slower start, and don't follow your ladder for the question's English. Your ladder is the target (below). How to get there: (a) hear steps 4–6 as they play today, or (b) build my direction (below) and hear it. [5.4]
3. **Play, when you can:** Beginner turn length; a goodbye said with your name; whether characters take up what you say without sounding formulaic; a second visit to Raymundo or Isidro in Guanajuato (does the character remember what it told you?); a few Intermediate visits.

## Done (2026-11-12)

| What | Commit | Live? |
|---|---|---|
| "Where are you from" and "newcomer" lines out of the Beginner prompt [1.1, 2.3] | 3322eb2 | Yes |
| Beginner goodbye offered once on the 7th turn; the close by the intro's beat count removed; the intro prompt's beats wording made consistent [1.2, 1.3] | ecd7fab | Yes |
| Dead code out: the summary call, the answer said inside her line [5.6] | f5a8ca5 | Yes |
| CLAUDE.md points at dialogue-now, dialogue-model and this plan; the M1 and October designs archived | 614da8d | (docs) |
| Every Beginner on the new Beginner; the old one behind the hidden switch for a week (the screen session) [5.1, 5.2] | b45d171 | Yes |
| Shorter step 1 (median 60 → 37–47 words on your Guanajuato visits replayed) [A] | b27cb88 | No |
| A goodbye with your name or a thanks still ends the visit [part of 5.3] | b27cb88 | No |
| "Take up what they just said before you add anything of your own" (the accept half of your bids model) [4.1] | b27cb88 | No |
| Beginner intro question six words at most (the screen session) | intro.md 12b | No |
| The question's English shown and said at steps 1–3; the "English only the first time or when new" rules removed ("i never proposed that"; the screen session) | 27a7fdb | No |
| The lesson and culture writers say "learner", not "newcomer"; Magda sees the learner's example lines as "you" (146 lines in saved lessons were labelled newcomer); the lesson practice patch against "where they're from" removed [2.1, 2.2] | 8be8049 | No |
| A new kind of question at steps 1–3, Notice: the character points at something you can see and asks whether you see it ("¿Los ve? Do you see them?"), with two answers; in the rotation beside two answers and questions to ask [4.2] | e2412d4, adjusted in 95af83e | No |
| A Beginner visit winds down when the talk has run its course, before the turn's setup; the goodbye on the 7th turn stays as the fallback [5.3, your "c"] | 95af83e | No |
| Cultural lessons: the teller's question varies (what you make of it, something to picture or notice, something of your own like it) instead of "Have you ever…?" every turn; the answer taken up [4.3] | f612b53 | No |
| Beginner "questions to ask" turns stay, and the questions offered come out of what the character just said ("¿Qué es el huitlacoche?" after she names it), not stock ones like the bus fare (Josh: "I appreciate variety, but also coherent play") | 9a23f81 | No |
| Step 2 as short as step 1 (two short sentences and the question) with two or three Spanish phrases against step 1's one or two | 20926c8 | No |
| From Josh's evening play (Don Chucho, Raymundo): a return visit greets you as someone known, asks after what you told the character, and talks about something other than the work; "talk like a regular" for every character you've met; no "mire" given as a model; the goodbye left to you (no double goodbye); no repeats within a visit | (next) | No |
| Measures: what learners do after each kind of question (`scripts/bid-count.mjs`); turn length on replayed real visits (`tests/experiments/b2-turn-length.mts`) [3.1, A] | 8423712, 970ba64 | (tools) |

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
- **Steps 4–6** [5.4]: `beginner-2.md` → The reply ladder, Progression; `beginner-2-step-2.md`; the Spanish-frame aside on card B2-E5 (`prompt-trials.md`).
- **Old Beginner removal** [5.2, 5.6]: `06-roadmap.md` → Now, "If Beginner 2 replaces Beginner 1: the changes after"; `archive/one-turn-engine.md` § 2.

## Documentation

**Target: five current documents, one job each.** `dialogue-now.md` (how it works, checked against the code; done), `dialogue-model.md` (decisions only), this plan (the work), `dialogue-structure-reference.md` (terms and bids), `dialogue-ideas.md` (faults with examples). `beginner-2.md` stays as the Beginner's spec.

**Done:** `dialogue-now.md`; CLAUDE.md and the README point at these; `M1-CONVERSATION-MODEL.md` and `04-conversation-engine.md` archived; the Beginner goals moved word for word into `dialogue-model.md`. 2026-11-12, evening: `dialogue-model.md` has the decisions of 11-10 to 11-12 (each quote checked against the record) and a "Tried and dropped" list; the fault log has an index of open and fixed; `level-judge-test.md`, `language-levels-plan.md`, `one-turn-engine.md`, `beginner-plan.md` and `beginner-deep-dive.md` archived, every link updated.

**Next:** after steps 4–6 are decided, `beginner-2-step-2.md` and `summary-and-mixed.md`; `beginner-as-live.md` with the old Beginner; `dialogue-structure-reference.md`'s built-status lines into `dialogue-now.md`.

**What's kept when a document moves:** Josh's words and decisions, word for word; evidence (results, counts, quoted turns with character, place and time); one copy of each reason; what the code does only if it still does it. A dropped design keeps one line (tried, dropped, why). Nothing is deleted: what leaves goes to `docs/archive/` with "superseded by …, date" on top. Where it's unclear whether something was decided, it stays open and is put to Josh.
