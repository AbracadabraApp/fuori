# The Beginner plan

**Status (2026-11-09):** a spec from Josh's decisions of 2026-11-08/09, ready to prototype. How the Beginner level runs today, the baseline: [beginner-as-live.md](beginner-as-live.md). Nothing is built; a prompt change ships only after a reviewed test card. The discussion that led here is kept below, under [How we got here](#how-we-got-here).

## What a Beginner visit is

- **A roleplay lesson with a real person in a real place**, not a free conversation. Lean on scaffolding; English makes beginners comfortable.
- **English on every turn defines Beginner**; no English is Intermediate. English is scaffolding.
- **Spoken, not read.** It's not a reading game: the character's English is heard; nothing extra goes on screen.
- **The character speaks as themselves**, never as a narrator (no "the owner is sitting by the door…" in their own voice).
- **Mechanics before dialogue:** this plan sets structure; what characters say goes to `docs/dialogue-ideas.md`.

## The scaffolding (as in production; leave as is)

Help to answer: lines to say back (whole answers, or a sentence start); How do I say it; help when asked; the mic's patience (2.5 s).
English to follow along: spoken English to set the scene; the echo; English under each answer, always shown.
Her words in the language show in one bubble as she says them; no taps anywhere. Dormant: the reply panel (`lib/scaffold.ts`), which the path never shows.

## The shape of a turn

**Jobs** (the code chooses which are in a turn):

| Job | What it does |
|---|---|
| React | responds to what they just said; the usual opening after the first turn |
| Recast | a React that says their line back right: only after their own words, only for a real mistake; the code allows it, the character decides |
| Set the scene | where we are, what's going on; the first turn |
| Say | something of the character's own |
| Ask | asks for their reply, in either language (defined by asking, not by language) |
| Offer answers | the learner's reply, set up (below); always last |

**Forms:** each job is said as English · the language · mixed (part each, one sentence) · English then the language's echo · the language then the English echo.

**The echo** lets the character speak the language safely without losing the learner. It works in the setting, in the dialogue, and when an answer is offered in her speech. Either direction can be a phrase or a restatement, never a literal translation:
- the language, then English: helps them understand (today's echo, kept as it is);
- English, then the language: underlines the words worth keeping (*piccante o dolce*); the Ask after it can use those words with no echo.

**Five settings the code picks each turn:** which jobs, their order (React/Recast and Set the scene first, answers last), the form of each, the length of each (a word to a sentence), and the answers' form. The character gets one line ("This turn: React · Say (the language, English echo) · Ask (the language) · Answers (2)") and fills it as this person in this place.

**Rules:** every Beginner turn has at least one job with spoken English in it (English under the answers doesn't count); Recast only after their own words; the first turn sets the scene; the goodbye is offered after about 8 turns or when they say it.

**Where more shapes come from: what a bilingual local does** (Josh, 2026-11-09: too few shapes is the problem, and the character is bilingual). Real moves, each a different turn:
- explains in English, the way a local friend would (why you pay at the cassa first; cavolo nero is kale);
- gives the word, then uses it ("Here we call it *il coperto*. Il coperto è due euro.");
- switches mid-sentence ("Allora, the best thing here is *la gricia*. Sai cos'è?");
- asks about English ("How do you say *cornetto* in America?");
- checks they followed ("Did you get that? *Chiusa*, closed.");
- tells something short in English with the key words in the language (the festival, her nonna's recipe);
- slows down or rephrases when they're lost.

Also real: a turn with no question (a remark they react to), the learner leading (they ask or comment, she answers), a short turn (a reaction and one answer). **Two ways to set up the reply** (Josh, 2026-11-09): she asks, and either
- **the bubbles:** two answers to say back (Beginner 1 today), or
- **the gloss in her speech, no bubbles:** she glosses the words that matter as she asks, and the learner builds the answer from them ("Piccante o dolce? Spicy or sweet, quale ti piace? which do you like?" → "Piccante" or "Mi piace dolce").

**Varied, but predictable:** a seeded pick among the shapes the rules allow, never repeating either of the last two turns' shapes. A new pick every turn, seeded by the conversation and the turn's number, so a conversation replays with the same shapes (for side-by-side tests and Records); the opening, before there's a conversation, by learner, place and day, so tomorrow's opener differs (Josh, 2026-11-09).

## How the learner replies

- Two answers to choose from; one answer (today).
- A question for them to ask her.
- Answer in English, offered on purpose; the line in the language comes back to say (How do I say it).
- Built from her glossed words, no bubbles: she glosses the key words as she asks (*piccante o dolce*, spicy or sweet; *quale ti piace*, which do you like) and they make their own answer from them.
- Answers offered in her speech ("…just say *Vorrei la carbonara*, I'd like the carbonara"): spoken only, or spoken and shown.

Out: three or more answers (crowds the screen); one word missing with words to choose (a puzzle); answer then "E lei?" (the same as one or two answers). Out as unrealistic, classroom exercises no one does in a bar (Josh, 2026-11-09): repeat after her; a sentence start to finish; a key word only; a hint in English only; a listening turn; catch her out. Not yet judged: build it from two pieces; free.

## Across Beginner

- **A ramp, English as the floor.** What changes is what the English does, not how much: English leads, the language echoes it → the language leads, English echoes it → English only sets the scene. Not "harder" or "less".
- **Ask before removing scaffolding.** When the record says a learner looks ready, they're asked, and they decide. Each ask names the one part that changes ("Want to hear the Italian first, with the English after?"), never "less English".
- **Open:** what the record counts as ready, and how far apart the asks are.

## Production rules this overrides

Checked against the live files (`content/it/prompts/beginner.md` 2026-11-07a, `leveling.md`, `lib/path.ts`, CLAUDE.md). **Kept** = unchanged; **Changed** = rewritten; **To code** = the shape picker does it, so the prompt rule goes; **Removed** = goes with nothing in its place.

**The Beginner prompt's 23 sections**

| Section | Now says | Here |
|---|---|---|
| Who: you | name, role, city, setting, character | **Kept**; the setting line said as the character's own, never narrated |
| Who: the learner | a Beginner living here; help them talk | **Kept** |
| How you talk | (heading) | **Kept** |
| English: brief | at most two short sentences; never say in English what the language then says | **Changed**: the two sentences stay; the "never say it twice" clause goes (English then the language's echo is a form) |
| Language: what to keep | what to keep or say is in the language, each its own part | **Kept** |
| Language: phrases | one or two 4–8-word phrases most turns | **To code** (forms and length) |
| Opener: the place | first turn opens with a varied English line about the place, sometimes names | **To code** (Set the scene, first turn); the varied-opener instruction goes |
| Flow: react, then move on | react, then move on; an errand is a turn or two; no invented errand | **To code** (React); the errand sentences **kept** |
| Variety: not the same shape | don't build every turn the same way; sometimes no English | **Removed** (the code varies the shape; "no English" breaks the Beginner definition) |
| Voice: no narration | no stage directions | **Kept** |
| Role: not a teacher | never announce what you're doing or explain how people talk | **Changed**: setting up the learner's line in her speech is allowed ("…just say *Vorrei…*"); announcing ("let me ask you") still not |
| Question: one | one question a turn, in the language, as a question part | **Changed / to code** (Ask: either language; one a turn kept) |
| Answers: as a local says them | | **Kept** |
| Answers: one idea | | **Kept** |
| Answers: their facts left blank | | **Kept** |
| Words: reuse | use a few words again | **Kept** (the underline then the Ask is one way) |
| Language: easy | short, common words, present tense, polite form | **Kept** |
| Facts: only what you're sure of | | **Kept** |
| Goodbye: offer it | when it winds down | **To code** (after about 8 turns, or their goodbye) |
| Lead: follow theirs | | **Kept** |
| Mistakes: never point out | never praise or point out | **Kept** (Recast is the shared rule's "use the right words yourself", not pointing out) |
| English: help when asked | | **Kept** |
| Reply: parts format | english, word, question, answer, gloss | **Kept**; the gloss is the language-then-English echo; the underline is an `english` part then a `word` part (to check) |

**The stage system**

| Production | Here |
|---|---|
| `leveling.md` blocks: Talk stage 1/2/3, Language 2/4, Answers two/one/frame, Echo: new words, Talk: support back | **Removed**, replaced by the shape line through `stageText` |
| `lib/path.ts` stages S1–S4 and steps (1,1,1,1,1 · 1,2,1,1,2 · 2,2,2,3,3) | **Replaced later** by the ramp and the asks (step 5 of Next); the prototype runs at the start of the ramp |
| Moving up: 3 own-word turns to count, 4 easy of 5 | **Open** (what counts as ready); unchanged until then |
| Placement: "own words" → step 3 | **Open**, with the ramp |

**Elsewhere**

| Production | Here |
|---|---|
| CLAUDE.md, Beginner: "a sentence or two of spoken English…, then in the language the words that matter, one question, and whole-sentence answers to say back" | **Changed** (Josh decides the wording): the Ask in either language; answers in the forms above, including in her speech |
| CLAUDE.md: "none steps out of role to sound like a language teacher" | **Changed for Beginner**: a roleplay lesson in role, setting up the learner's lines |
| `docs/beginner-scaffolding.md` Goals 4: "Every question comes in English first, then in the language" | **Changed**: one form among five, picked by the code |
| Shared rules (`dialogue.md`: mishearings, stay in your job, order of events, your place's ways, goodbye) | **Kept**, all |

## Built from production

The turn stays `runBeginnerTurn` / `buildBeginnerPrompt` with the parts format (english, word, question, answer, gloss), `tidyParts`, the shared dialogue rules, the said-back note, memory and the setting line; the app side doesn't change for the core mechanic. **New:** a shape picker in code; its line goes in through the existing `stageText` hook in place of the stage blocks; the Beginner prompt shrinks to who and where. To check: Ask in English and the underline as an `english` part followed by a `word` part, with no schema change. Tested with `npm run test:conversations` (A/B variants, simulated learner, kept transcripts).

## Next

1. ~~This spec~~ (2026-11-09).
2. The shape picker and a short Beginner prompt, offline; a test card first (reviewed), then real places (Nino, Antonio, Tere and others) played today's way and the new way.
3. Josh reads them side by side.
4. If better: into the game, then his phone.
5. Then, one at a time: answers in her speech, the question for them to ask, answer in English on purpose, the ramp and the asks.

---

## How we got here

The discussion of 2026-11-08/09, kept as it was written; where it disagrees with the spec above, the spec wins.


## Where it stands (2026-11-09)

**Decided (Josh):**
- **English on every turn defines Beginner** (Josh, 2026-11-09: "English on every turn should define beginner"); no English is Intermediate. In production this conflicts with the Beginner prompt's *Variety* rule ("sometimes no English at all") and with stages S2 and S3, which cut the English; under this definition both go.
- **Beginner is a ramp, with English as the floor** (Josh, 2026-11-09: "English is scaffolding. Scaffolding changes with levels"; "within beginner English can vary"; "your last beginner turn doesn't need to be as easy as your first, just be it uses English"). Difficulty rises across Beginner; every turn keeps English; no English is Intermediate. **It's not about quantity** (Josh): what changes is the English's job, not its amount: English leads and the language echoes it → the language leads and English echoes it → English only sets the scene. (Josh: "harder" or "less" distract from knowing the scaffolding: the point is what each part does.) As a mechanic: one dial, how far along Beginner the learner is, set from their record, instead of separate stages.
- A Beginner visit is a roleplay lesson; lean on scaffolding; English makes beginners comfortable.
- The scaffolding parts stay as they are.
- S1's spoken English stays as it is: spoken, not shown ("not a reading game").
- Stage directions are for the character (the code's beat each turn), never shown or said to the learner.
- Mechanics before dialogue.

**Open (Claude's proposals, Josh to decide):**
1. **Narrator lines:** the character speaks as themselves ("Come in! The kitchen's closed till tonight…"), never describes the scene in the third person.
2. **The shape of a turn:** set by code, 4 shapes (she asks, she tells, you ask, goodbye), instead of the prompt's 23 rules.
3. **Levels and progress:** 2 Beginner levels (say it back; finish it yourself), 5 good visits to move up.

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

## Mechanics: the shape of a turn (draft, 2026-11-09)

Built from Josh's points in one pass (he found the piece-by-piece questions tedious). For him to react to as a whole.

**A turn is made of jobs.** Each job is said in one of five forms (Josh: react in English or the language, say something part English part the language, ask in English with no Italian or in Italian with an English echo): **English · the language · mixed (part each, one sentence) · English then the language's echo · the language then the English echo.** The echo is a form, not a job of its own.

| Job | What it does | Notes |
|---|---|---|
| React | responds to what they just said | the usual opening after the first turn |
| Recast | a React that says their line back right | only after their own words, and only for a real mistake; the code allows it, the character decides (the shared rule: not every time; mishearings make bad corrections) |
| Set the scene | where we are, what's going on | first turn; the character speaks as themselves, never as a narrator |
| Say | something of the character's own | |
| Ask | asks for their reply | either language; defined by asking, not by language |
| Offer answers | lines to say back, English under each | always last |

**The code sets each turn's shape with five settings** and tells the character in one line ("This turn: React · Say (the language, English echo) · Ask (the language) · Answers (2)"); the character fills it:
1. which jobs are in it
2. their order (React/Recast and Set the scene first, Answers last; Say and Ask in between)
3. the form of each (the five above)
4. the length of each (a word to a sentence)
5. the answers' form (two, one, a sentence start, or a question for them to ask)

**Rules every Beginner turn keeps:**
- At least one job with spoken English in it (any form but the language alone); English under the answers doesn't count, it's read.
- Recast only after their own words.
- First turn: Set the scene. Last: the goodbye offered (after about 8 turns, or when they say it).

**What the echo is for** (Josh, 2026-11-09): "Echo should let the speaker safely speak Italian and not lose the learner." The safety net that lets the character say real sentences in the language.
It works wherever she speaks (Josh: "in a setting, in a dialogue, in queueing up answers without bubbles"): setting the scene, the dialogue itself (React, Say, Ask), and an answer offered in her speech ("…just say *Vorrei la carbonara*, I'd like the carbonara"), which is what makes answers without bubbles safe.
In either direction it can be a phrase or a restatement, the meaning in other words, never a literal translation (Josh: "It also works in phrases or restatements. Not meant as literal translation").

**The echo does both, by direction** (Josh, 2026-11-09: "Things are spicy or sweet (echo); do you like spicy or do you like sweet (no echo)"; "More like Italian underline"; "It should do both"):
- **The language, then the English echo:** helps them understand what was just said: today's echo, **kept as it is** (Josh: "Italian then English is fine").
- **English, then the language's echo (new):** underlines the words worth keeping (*piccante o dolce*), not a whole translation.
The Ask after an underline can use those words with no echo; the answer reuses them.

**Varied, but predictable:** among the shapes the rules allow, a seeded pick that never repeats either of the last two turns' shapes. Where they are on the Beginner ramp sets which language leads: English leads with the language echoing → the language leads with English echoing → English only sets the scene.

## Mechanics: how the learner can reply (Josh's picks, 2026-11-09)

Beyond today's two answers and one answer ("We should try to think of responses beyond 2 answers and one answer"). From a list of 14:

**Kept:**
- **A question for them to ask her** (the line offered is a question).
- **Answer in English**, offered on purpose as the turn's reply: the line in the language comes back to say (How do I say it).
- **Answers offered in her speech** ("…just say *Vorrei la carbonara*"): heard, not read; spoken only, or spoken and shown.
- Today's **two answers** and **one answer** stay.

**Out:** three or more answers (crowds the screen, as three bubbles did on 11-05); one word missing with words to choose (a puzzle); answer then "E lei?" (the same as one or two answers).

**Not yet judged:** repeat after her; a sentence start to finish; build it from two pieces; a key word only; a hint in English only; free; a listening turn; catch her out.

**Ask before removing scaffolding:** when the record says a learner looks ready, they're asked, and they decide. Each ask names the one part that changes, in plain words ("Want to hear the Italian first, with the English after?"; "Want to try answering without the lines to say back?"), never "less English" (Josh: wrong measure).

## Mechanics: scaffolding is the key (Josh, 2026-11-08)

Josh: "The scaffolding is key mechanic." Scaffolding is how the learner takes part; the level is how the character talks (`docs/glossary.md`). An earlier table here mixed the two (Josh: "I don't agree with table").

**The scaffolding in the app today. Leave as is** (Josh, 2026-11-09: "We should leave scaffolding parts"; "I think you are missing English parts"):

*Help to answer*
1. Lines to say back: whole answers, or the start of a sentence to finish.
2. How do I say it: say it in English, get the line back in the language, read it aloud.
3. Help when asked: in English, a word, a phrase or an explanation.
4. The mic's patience: a Beginner's turn ends after a longer silence (2.5 s; Intermediate 2.0 s).

*English to follow along*
5. Spoken English to set the scene: up to two short sentences a turn, heard, not shown.
6. The echo: short spoken English right after a phrase or question in the language.
7. The English under each answer to say back, always shown.

Her words in the language show in one bubble as she says them (her question in bold), with no English shown and nothing on a tap: her English is only heard (Josh, 2026-11-05). The translation shown after she finishes is the Intermediate screen (with the English setting on), not Beginner. (Corrected 2026-11-09: an earlier list here had "English a tap away" and "the translation once she's finished" for Beginner; neither is in the code.)

Dormant: the reply panel (read one aloud, or choose; `lib/scaffold.ts`). It shows only on turns without Beginner parts in a new learner's first 3 conversations, which the path never produces; every turn since the 2026-11-08 release logged `replies="no"`.

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
- **How do I say it, the scaffolding loop** ("How do I say it" → a line in the language → read it out loud): measuring English transcription on recordings, and the tabled help with the learner's own language (old list → Scaffolding).
- **Replies written in advance for the offered answers** stays under Faster replies (it's speed), but its numbers (~40% of S1 turns said back) belong to this plan too.
- **Tester question:** can beginners follow at their level? (old list → Release, Stage 2, question 3.)
- **The learner asks too** (from D1, Josh, 2026-11-07: "encouraging learners to ask questions may also help"): some of the answers to say back could be questions ("¿Usted qué me recomienda?", "Cuénteme más"). In test C4 the learner's own questions were what brought out local talk. D1 itself is off the to-do list (2026-11-08); the character's side (one answerable question, not the same one every visit) is in the dialogue top 10.
