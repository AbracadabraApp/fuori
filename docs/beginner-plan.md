# The Beginner plan

**Status:** draft for Josh (Claude, 2026-11-08). How the Beginner level runs today, the baseline: [beginner-as-live.md](beginner-as-live.md). Everything below the goal is a proposal; the decisions are Josh's and marked as such. Nothing is built until he approves; prompt changes then go through a test card.

## Direction (Josh, 2026-11-08)

"I'd lean on scaffolding. Think of beginner as roleplay lessons not conversation. English makes beginners comfortable." Then: "Yes but needs stage directions." Earlier the same night: "Making beginner more deterministic (but varied) seems better", and of adaptive support and the stage changes: "too complicated, too optimistic".

**Mechanics before dialogue** (Josh, 2026-11-08: "I'd focus on mechanics more than dialogue"): the plan works on the structure (the lesson's shape, answers, English, stage directions, how a visit ends, what counts); what characters say goes to `docs/dialogue-ideas.md` and waits.

**A Beginner visit is a short roleplay lesson with a real person in a real place.**
- **English carries the learner:** the character sets the scene, explains, and tells them what to say, warmly, like a friend who lives there.
- **Stage directions are for the character, not the learner** (Josh: "why does user need stage directions"): each turn the code gives the character its beat, like a director's note: the scene and hello; a moment that needs a line, with the line offered to say back; react, then the next moment; the goodbye offered to say back. Not "teach a phrase" (Josh: "heavy"): the English sets up the moment and the answer to say back does the teaching; nobody explains how to say it. The learner never sees them; this is the deterministic part ("more deterministic, but varied"): the code sets the beat, the character fills it with this person, this place.
- **One predictable shape, varied by place and person:** the scene → a moment that needs a line (offered to say back) → react → the next moment → goodbye.
- **The scaffolding leads:** answers to say back every time, the echo, help in English whenever asked.

**Changes this means** (Josh decides each):
- Two Beginner rules turn around: *English: brief* (at most two sentences) and *Role: not a teacher* (never explain how people talk). *Voice: no narration* stays: nothing the learner hears is narration.
- CLAUDE.md's Beginner teaching rule changes to match: Beginner visits teach openly, in role.

**Sketch: Nino's visit (2026-11-09) as a roleplay lesson.** Same person, place and facts as the real conversation; answers to say back after each turn. *The italic lines here only help the reader picture it; they aren't said or shown.* The beat the code would give him each turn: scene and name → a moment needing "Cosa mi consiglia?" → a choice with "Vorrei…" → coming back ("Torno…") → goodbye. The sketch still has him explaining phrases ("Here you say…", "Try it"); with the lighter beats he'd only set up the moment and offer the line.

> *Garbatella, after lunch. The osteria's kitchen is closed. Nino sits by the door with his coffee, next to the chalk menu board.*
>
> **Nino:** Ah, a new face! Come in. I'm Nino, this is my osteria. Here you say your name like this: *Mi chiamo Nino.* Now you. *Come si chiama?*
> → *Mi chiamo …*
>
> **You:** Mi chiamo Joshua.
>
> *He shakes your hand and points at the board.*
> **Nino:** *Piacere*, Joshua: nice to meet you. This board has everything we cook. To ask what's good, Romans say *Cosa mi consiglia?*, "what do you recommend?" Try it.
> → *Cosa mi consiglia?*
>
> **You:** Cosa mi consiglia?
>
> *He taps the first line.*
> **Nino:** La carbonara! My mother's recipe; my son Marco makes it now. If you want it, you say *Vorrei la carbonara.* Or the cacio e pepe. *Carbonara o cacio e pepe?*
> → *Vorrei la carbonara.* / *Vorrei la cacio e pepe.*
>
> **You:** Vorrei la cacio e pepe.
>
> *He laughs and nods toward the dark kitchen.*
> **Nino:** Good choice, but the kitchen opens tonight: *La cucina apre stasera.* On Thursdays we make gnocchi. To say you'll come back: *Torno giovedì.*
> → *Torno giovedì.* / *Torno stasera.*
>
> **You:** Torno giovedì.
>
> **Nino:** *Perfetto!* Then it's *a giovedì*, "see you Thursday": *a* and the day.
> → *A giovedì, Nino!*

The details are his own (his mother's recipes, Marco in the kitchen, Thursday gnocchi), not the facts every character repeats (Josh caught "Egg, never cream" in the first sketch: carbonara without cream is in 6 real conversations). A roleplay-lesson prompt has to keep it that way.

Phrases practised: *Mi chiamo…, Piacere, Cosa mi consiglia?, Vorrei…, Torno giovedì, A giovedì.* The real conversation had six "X or Y?" questions and taught no phrase outright.

**Next:** Josh reads the sketch. If it's right, a test card: replay real Beginner visits with a roleplay-lesson prompt against today's, read side by side.

## Earlier draft (before the direction)

## Mechanics: scaffolding is the key (Josh, 2026-11-08)

Josh: "The scaffolding is key mechanic." Scaffolding is how the learner takes part; the level is how the character talks (`docs/glossary.md`). An earlier table here mixed the two (Josh: "I don't agree with table").

**The scaffolding in the app today** (how the learner takes part):
1. Lines to say back: whole answers, or the start of a sentence to finish.
2. The reply panel: read one aloud, or choose the one that fits (`lib/scaffold.ts`; first turns for new learners outside the Beginner format).
3. Say it in English: say it in English, get the line back in the language, read it aloud.
4. Help when asked: in English, a word, a phrase or an explanation.
5. The mic's patience: a Beginner's turn ends after a longer silence (2.5 s).

**How the character talks at Beginner (the level, not scaffolding):** today's S1 English is right (Josh: "In production S1 English is good"; "English works. Well spoken. It's not a reading game"): up to two short spoken sentences to set the scene or explain, the short English echo after a phrase, nothing extra on screen. One fix: the character speaks as themselves, never as a narrator. Nino's opening "The kitchen is closed after lunch, but the owner is sitting by the door…" said in his own voice before "Mi chiamo Nino" (Josh: "weird with narrator and same voice") becomes his own words: "Come in! The kitchen's closed till tonight, but sit with me. I'm Nino…". The cause is the opener rule plus a setting written as a scene description.

- **Two Beginner levels, then Intermediate** (Josh asked why levels 1 and 2 of a three-level draft differed: two answers against one is a difference in the question, not in help).
- **Progress (proposal):** 5 good visits at a level move you up; good = at least 3 of 4 questions answered in the language, an offered answer said back counts; English or asking for the whole line again doesn't. No automatic move down; the level can always be chosen in Settings.
- **Shapes (proposal):** 4, chosen by code each turn: she asks (answers offered); she tells (a reaction line offered); you ask (the line offered is a question); goodbye (after about 8 turns). Claude writes only the words inside the shape.

## The goal

From the Beginner goals (Josh, 2026-10-25, `docs/beginner-scaffolding.md` → Goals) and CLAUDE.md: in each conversation a Beginner **understands what's going on, says whole sentences in the language, and leaves with a word or two that matter**, with a real person in a real place in the country. Over the level, they move from saying back offered answers to answering in their own words, and then on to Intermediate.

## What real play shows (14–20 days of transcripts)

- **Every turn has one shape:** an English aside, then "X or Y?", then two answers to say back. Nino tonight: carbonara or cacio e pepe, pepper or pecorino, gricia or amatriciana, tonight or Thursday, lunch or dinner, coffee or leave.
- **Six of the Beginner top-10 problems don't appear at Intermediate** (interviewing by multiple choice, the same shop script, stepping out to manage the lesson, narrator and tour guide…). The same characters in the same places come alive at Intermediate, so the difference is the Beginner format, not the cast.
- **Facts go wrong inside the forced choice** (sugar offered after the coffee is served; another coffee at a closed bar).
- **Learners do say the answers back:** about 40% of Josh's S1 turns word for word and 60% of Jennifer's S2 turns, about 70% on or close to an offered answer.
- **Saying back never moves you up:** a conversation counts only with 3 turns in your own words, so S1 holds the learner who uses it as intended (Josh: 2 counted conversations in 3 days at step 1).
- **Placement can overshoot:** "own words" in onboarding put Jennifer at step 3 (S2, little English); she couldn't follow.

## The proposal (four parts)

**1. Fewer rules for the shape of a turn (Josh's "overbuilt" theory).** The Beginner prompt is 1,550 words in 23 sections; the character prompt that works at Intermediate is 534. Keep what the goals need: the parts format (English, the words, a question, answers to say back), easy language, English when asked, no corrections pointed out. Cut the sections that prescribe shape: the place opener (the source of the guidebook openings), "Variety: not the same shape" (an instruction about variety tends to cause its own repetition), the flow rule, and the question rule's "this or that". A turn may end without a question; a question may be one of two, one fact, or open, at the stage's level. Some answers to say back may be questions the learner asks (from D1: "¿Usted qué me recomienda?"). **Test (a card first):** replay real Beginner conversations with today's prompt and the short one; count one-shape turns, fact slips, lines a beginner can follow (the 90% goal), and the share said back.

**2. What counts toward moving up. Josh decides.** Options:
- (a) At steps 1–2, a turn answered in the language counts, said back or in their own words; from step 3, own words only. *Claude's recommendation: S1's job is saying whole sentences (goal 3), and saying back is exactly that.*
- (b) Any turn in the language counts at every step.
- (c) Keep the rule, but step 1 ends after a set number of conversations.

A change to `lib/path.ts` with a test; no prompt involved.

**3. Placement. Josh decides.** "Own words" in onboarding places at step 2 (S1 and S2 mixed, English support kept) instead of step 3. One example so far (Jennifer). A one-line change in `lib/path.ts → placement`, with its test.

**4. The fading itself: watch, don't change.** Keep the stages (1,1,1,1,1 · 1,2,1,1,2 · 2,2,2,3,3, then Intermediate). After 1–3, check in the records: does a learner's share of turns in their own words rise across conversations, and does someone playing most days reach step 3 in about two weeks?

**Order:** 2 and 3 first (small, code only, need only Josh's choice); then 1 (a test card, then the run); 4 is watching the records afterwards.

## Gathered items, and where each fits

- **The Beginner plan, one item** (Josh, 2026-11-08: "these are all one item"). One plan for how a Beginner conversation goes and how a learner moves through the level, covering together:
  - *The shape of turns:* every turn the same shape (an English aside, then "X or Y?"); Josh's theory is that `content/it/prompts/beginner.md` (1,550 words, 23 sections) over-determines the conversation.
  - *What counts toward moving up:* a conversation counts only with 3 turns in the learner's own words, so at S1, where answers are offered to say back, saying them back never moves you up (Josh at step 1: 2 easy counted conversations in 3 days; real play says an answer back on ~40% of S1 turns).
  - *Placement:* onboarding's "own words" answer puts a learner at step 3 (S2, little English); Jennifer couldn't follow and was reset to step 1 (2026-11-08).
  - *The path's fading* (`lib/path.ts`, built 2026-11-02): stages per step 1,1,1,1,1 · 1,2,1,1,2 · 2,2,2,3,3, then Intermediate; English, answers to say back and question kind fade by stage. Does it work in play?
  - Next: Claude drafts the plan from the goal (what a Beginner should get from a conversation), for Josh. Done when: Josh approves it; changes then follow with tests.
- **Italy's Beginner lessons: 7 teaching failures left** (five judges on 21 lessons; `tests/experiments/lesson-judges/README.md`). Next: Claude lists the 7 with the lines for Josh. Done when: fixed or accepted by Josh.
- **How much a beginner can follow:** the goal is 90% of the character's words at the learner's level; on the last measure a beginner could follow about 25% of lines (old list → Language level of the dialogue).
- **Teaching in role at Beginner:** characters teach key phrases such as "Come si dice …?" in role, instead of a button (Josh, 2026-10-16; old list → Language level, first item).
- **Josh: settle CLAUDE.md's teaching rules by level** once the Beginner level is kept (old list → Beginner level dialogue).
- **Say it in English, the scaffolding loop** (say it in English → a line in the language → read it out loud): measuring English transcription on recordings, and the tabled help with the learner's own language (old list → Scaffolding).
- **Replies written in advance for the offered answers** stays under Faster replies (it's speed), but its numbers (~40% of S1 turns said back) belong to this plan too.
- **Tester question:** can beginners follow at their level? (old list → Release, Stage 2, question 3.)
- **The learner asks too** (from D1, Josh, 2026-11-07: "encouraging learners to ask questions may also help"): some of the answers to say back could be questions ("¿Usted qué me recomienda?", "Cuénteme más"). In test C4 the learner's own questions were what brought out local talk. D1 itself is off the to-do list (2026-11-08); the character's side (one answerable question, not the same one every visit) is in the dialogue top 10.
