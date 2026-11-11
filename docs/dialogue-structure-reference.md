# Beginner dialogue redesign: terms, sequences, turn design and memory (reference)

2026-11-11 · Claude, from a session with Josh · Everything is numbered so a card, a log entry or a message can cite it ("T3", "S6", "F2"). Sources and the long form: [research/frame-gloss-echo.md](research/frame-gloss-echo.md). Nothing here changed code or prompts; the card for the first sequences is S1 in [prompt-trials.md](prompt-trials.md) (drafted, reviewed, not re-reviewed, not stamped, not run).

## 0. Decided design (Josh, 2026-11-11)

The smallest version, and the one to try first: **a subtitle area added to the portrait and chat screen that already exists, used for a long Spanish intro, with the English subtitle tracking the Spanish line by line (T27); then the chat bubbles exactly as they are now.** Nothing more: no new scene or component (the buttons in the mockup's top bar are existing ones: Josh named learn books, exit buttons and lesson styles), no change to levels, no new rules beyond the intro's subtitle showing in step (today the English waits until the character has finished; Josh: his rule to change). Mockup: the portrait with a caption and English under it, then the same portrait with the bubble and mic.

Sample, Don Arturo, Gran Café de la Parroquia, Malecón, Veracruz (hand-written for design; the glass-and-spoon custom needs a fact check): eight Spanish sentences, about 90 words, about 35 seconds, each with its English subtitle, ending on "¿Quiere un lechero?" and the first Say-backs "Sí, por favor." / "¿Desde arriba?".

**Built 2026-11-11 (laptop session; released the same evening, cd6cadb then e7d0ba7 with the question rule, intro.md 2026-11-11b):** the intro as `lib/intro.ts` with its own prompt (`content/<country>/prompts/intro.md`: character.md's three "who" blocks, the memory line, a content brief: the custom, how and why, the person in one clause, six to eight sentences, the question last, a return visit resumes), played on the opening of every ordinary visit at Intermediate and Beginner 2 (two answers with it); the app shows the portrait alone with the subtitle band, typed in step with the voice, the English under it, and the name band and chat come in on the question (`PersonView.swift` → `IntroSubtitle`, `ConversationModel` → `inIntro`). Read in both countries (`tests/experiments/intro-live.mts`): 7–8 sentences, Mexico about 130 words, Italy about 100, every one ending on a question; the return visits picked up the day before ("¿volvió usted por otra torta ahogada, como la de ayer?"). Josh on length: cultural points first, 30 s is fine, no biography to make it 45; the Mexico intros run long and his ear decides.

The sections below are the discussion and the options. Sections 6 and 7 (turn pseudo code, memory at turn size) and T23 to T26 and S15 are options Claude over-built, not the plan; memory read and written more often (J9) is still Josh's wish, on hold for the live system.

## 1. The question and Josh's judgments

- **J1.** The frame (a language piece slotted into one line of English) is better structurally than the echo (a language sentence, then its full English): "it's one line of dialogue; with the echo you just listen to the echo."
- **J2.** The frame doesn't use enough of the language. The fix is more use of the frame (more language clauses slotted in), not a return to the echo.
- **J3.** Judge builds by structure, not by language words a turn: those counts reward the echo.
- **J4.** Level 1's text is already long; don't add words.
- **J5.** Cultural content is a goal and works well on its own, but it produces an English monologue with a weak connection to the learner (2026-11-11).
- **J6.** The "sí" in Concha's conversation came from having no proposed answers.
- **J7.** A medium-length Intro that sets the scene, then a shorter turn each time, holds a beginner's interest. Drilling Spanish is work, so the language shouldn't carry the turn (2026-11-11).
- **J8.** Less memory loss, more building on the story: a turn picks up the last thread and adds to it, rather than reporting back what was said ("my abuela grew up on a coffee plantation", not "you've got your coffee, and I was telling you about my abuela").
- **J9.** Memory could be read and written more often (2026-11-11).

## 2. Terms (labels for the parts of a dialogue)

The character's moves:
- **T1 Scene:** a short line about what's here or what the character is doing, in English.
- **T2 Slot:** a language chunk of 4 to 8 words inside the English line.
- **T3 Gloss:** the brief English for a Slot, only where needed.
- **T4 Echo:** a full language sentence, then its full English (the old pattern; the control).
- **T5 Ask:** the one question: yes/no, either/or or open.
- **T6 Say-back:** one or two short answers the learner can say.
- **T7 Help:** repeat, slower, rephrase or English, on request.
- **T8 Recycle:** a chunk reused in a later turn, in a new situation.
- **T9 Fade:** less support each time a chunk has landed.
- **T10 Open:** the first turn: a greeting and a line about the character's own place, before any Ask.
- **T11 Close:** the wind-down and the goodbye the learner can say.
- **T12 Invite:** a turn that asks in English whether they'd like to know anything.
- **T13 Learner asks:** the learner gets two short questions to ask the character.
- **T14 Blank:** a Say-back with a slot for something about the learner, left as "...".
- **T15 Fact:** the character tells something real about the place or country (the culture; the scorecard's Content).

The interactional moves (not built as rules):
- **T16 Take:** the character reacts to what the learner just said before moving on.
- **T17 Confirm:** the character repeats the learner's answer back as a question, or checks "¿entiende?".
- **T18 Recast:** a correction inside a natural reply, one thing changed (skip when a mishearing is likely).
- **T19 Repair offered:** repeating or rephrasing before being asked, when the learner seems lost.
- **T20 Anchor:** a line that points at something visible, so the scene carries the meaning.
- **T21 Expand:** the character adds one detail to the learner's short answer.

Added from J7 to J9 (the story and memory design):
- **T22 Intro (corrected 2026-11-11):** a long Spanish intro on the portrait, with a tracking English subtitle (T27), ending on the first question; then the chat as it is now. It carries the scene, the character and the culture (T15). (First written as a medium-length English stretch; Josh's design is Spanish with subtitles.)
- **T23 Build:** a line that takes the thread from the last turn and adds one new thing to it. It replaces "Recap": the old thread shows only as the hook the new thing hangs on. A Fact (T15) is usually the Build, so culture arrives as the next thing in the story.
- **T24 Thread:** the beats the character has told so far (who, what, where), newest last. The next Build must attach to the newest and must not repeat any.
- **T25 Learner facts:** what the learner has clearly said about themselves, written only when stated, never inferred.
- **T26 Chunk ledger:** the Slots heard and which have landed, setting support (T9) and what to Recycle (T8).

From reading the syllabus notes (Josh asked for ideas, 2026-11-11):
- **T27 Subtitle:** the English line that tracks the Spanish in step, like a film subtitle, in a subtitle area added to the portrait. Used for the Intro only.
- **T28 Function:** what a phrase does: greet, give your name, say where we are, ask for something. Intros and Say-backs are built from one function, so the learner's own detail can be swapped in (T14 Blank).
- **T29 Heard-first:** a phrase is heard in the Intro before it is offered as a Say-back (the textbook order: dialogue before production).
- **T30 Cognate:** a word that looks and sounds the same in both languages (café, mar); carries meaning without English, with what the portrait shows (T20 Anchor).
- **T31 Manner:** how a local talks, as against what a local knows: a greeting plus a small personal question, diminutives, "¿mande?", a soft refusal. Culture that lives in speech; Fact (T15) is culture that lives in information.
- **T32 Register:** *usted* or *tú*, set per character (`{formality}`); already in the product.

In the product today: T10 to T15 exist as setups or prompt content; T1 to T3 are the live cluster-1 frame; T6 is back on the live cluster-1 path since 2026-11-11a (answers on the one-line reply; missing between fe38bc2 and that); T16 to T21 have no rule.

## 3. Findings (what research says; strength)

- **F1.** Short turns, one idea each, one question at the end: the CEFR's A1 partner behavior. Standard, descriptive, never tested as a design.
- **F2.** Help on request beats simplifying ahead of time (Loschky 1994; negotiation moves). Moderate.
- **F3.** Elaborating (rephrase, gloss, add) is at least as good as simplifying; one listening study found it best. Moderate, little of it listening.
- **F4.** Chunks are the beginner's unit. Good.
- **F5.** Saying aloud beats silent reading; retrieving beats repeating (Pimsleur's cue, attempt, confirmation). Good for the effects; Pimsleur itself has no controlled trial.
- **F6.** A frame the learner fills, with support that fades. Weak (small studies, few controls).
- **F7.** Glosses help vocabulary, more for beginners, and L1's edge over L2 glosses shows on immediate tests, not delayed ones. Almost all reading.
- **F8.** With bilingual subtitles, attention goes mostly to the L1 line (eye-tracking); comprehension was no worse. Subtitles, not voice.
- **F9.** Intra-sentential code-switching: positive on participation, small studies and self-report; no controlled test against monolingual talk.
- **F10.** Personalized questions easy to hard (TPRS circling): practitioner craft, almost no controlled research.
- **F11.** Complex or even ungrammatical native-speaker input didn't hurt comprehension when the situation was plausible; the effect of simplifying on learning is open. Weak.
- **F12.** Sandwiching (language, English, repeated): practitioner guidance only, no experiment.

- **F13 (syllabus notes).** The textbook order: a phrase is heard in a dialogue before it's seen or produced; meaning comes from photos and cognates, not English; phrases are grouped by function with the learner's own details swapped in; recycling comes in a review or episode, not a retelling (research/textbook-a1-sequence.md). Our own reading, not a study.
- **F14 (Mexico communication notes).** A Mexican character greets and asks a small personal question before the transaction, uses diminutives and "¿mande?", softens a refusal, and remembers the learner (research/syllabus-es/communicating-in-mexico.md). Source: one intercultural guide.

**G (gaps).** G1 no study compares a slotted piece against the echo for beginners by voice. G2 no right share of language to English. G3 no listening-specific gloss meta-analysis. G4 no ideal whole-dialogue order. G5 several sources are slides or secondary summaries.

## 4. Sequences (orders of terms) to investigate

Within one turn:
- **S1 Scene + Slot (Gloss), then Ask echoed:** today's live frame; the baseline.
- **S2 Scene + Slot (Gloss), then Ask in the language only, Say-back shown:** does dropping the echo and adding answers change what the learner does? (J6)
- **S3 Slot first (Gloss), then Scene, then Ask:** does leading with the language make the learner listen to it?
- **S4 Scene, Slot, Say-back offered before the Ask.**
- **S5 Echo, then Ask:** the control.
- **S6 Take, Slot, Ask, Say-back,** against the same turn with no Take.

Across turns:
- **S7 Ask kinds in order:** either/or, then yes/no, then open.
- **S8 Slot with Gloss on turn 1, Recycle on turn 3 with no Gloss.**
- **S9 Recycle plus Fade over a whole visit.**
- **S10 Help offered every turn,** against Help on request only.

Culture (from J5):
- **S11 Take, Fact (one sentence), Ask about the Fact:** the question depends on the Fact, so the learner must have listened. Lowest risk; ranked first.
- **S12 Fact, Slot, Say-back:** the thing the Fact is about is named once as a chunk the learner can say back.
- **S13 Learner asks, Fact:** the learner pulls the culture by choosing one of two questions. Strongest on engagement; needs the answers path.
- **S14 Fact capped at one sentence, then hand over:** the cheapest variant and the control for S11 to S13.
- **S11, revised by J8:** Take, Build (usually the Fact, attached to the last beat), Ask about the Build.

Story shape (from J7 and J8):
- **S16 Intro built from one Function (T28), with Heard-first Say-backs (T29) and Manner (T31) in the speech:** the syllabus ideas, applied to the decided design. Josh's pick of Claude's ideas, pending.
- **S15 Intro, Slot, Ask, Say-back on turn 1; then Take, Build, Slot (0 to 2, growing out of the Build), Ask, Say-back on every later turn.** The story carries the turn; the language grows out of it.

## 5. Measures

- **M1** Runs of language words by length (1 word, 2 to 3, 4 to 8, over 8), slotted clauses per turn. A model call copies the runs out and code counts them; flagged weaker.
- **M2** Language words and English words a turn (a guard, never the yardstick; J3).
- **M3** Reactions: turns after the first that start with language words (code proxy), every hit read.
- **M4** Reuse: turns from the third on that reuse an earlier piece with no English within five words.
- **M5** Followable on first hearing: the scorecard's instrument; Claude's read is uncalibrated.
- **M6** Whether the learner says the Say-back, and what the learner says instead.
- **M7** Longest run of English in a turn (a code count; the monologue measure for J5).
- **M8** Whether the learner's next line builds on the Fact (Josh's listening, or a judge).
- **M9** Content (facts per reply) must not drop (the guard for S11 to S14).
- **M11** Build repeats: Builds that restate a beat already in the thread (a code count; the retold-as-new problem was about a fifth of facts in the auto-responder runs).
- **M12** Attached Builds: Builds that mention something from the last turn (code proxy, every hit read).
- **M13** Intro length and the share of turns with a Build.
- **M10** Josh's blind read, by ear, with hidden A-against-A pairs: the decision.

## 6. Turn design (pseudo code, design only; nothing built)

Principle: code chooses the turn's shape (rules enforced in code have held; prompt rules keep coming back, beginner-deep-dive); the model writes the pieces.

```
turn(1):   Intro(scene + who + hook, 3 to 5 sentences, culture in it)
           + Slot(1, with Gloss) + Ask(easy) + Say-back
turn(n>1): signal = lostOrAskedForHelp(learnerSaid)      # silence, "what?", English
           if signal:  [Repair(T19), Slot(shorter), Ask(yes/no), Say-back]
           elif winding down: [Take, Close, Say-back(goodbyes)]
           else: Take (a clause, from learnerSaid)
                 Build (one new beat attached to thread.last; not in thread)   # T23
                 Slot  (0 to 2, grows out of the Build; one with its Gloss on first use)
                 Ask   (about the Build; easy kind first: either/or, yes/no, open)
                 Say-back (1 to 2)
                 every 4th turn: Invite or Learner asks instead of the Ask
caps (guesses): Intro up to ~70 words; later turns up to ~40; longest English run up to ~25
checks (code): one Ask, in the language; Say-back present; no Build restating a beat in the thread;
               every Build attached to something in the last turn; first use of a Slot has English;
               Recycle has none; on a failed check regenerate once, else drop the piece
assemble:  spoken = one line of dialogue (Take, Build, Slot with Gloss, Ask); shown = Say-backs
```

A Concha-style turn: Take "Ah, café con leche, buena elección." Build "My abuela grew up on a coffee plantation." Slot "Una finca de café (a coffee farm)." Ask "¿Le gusta el café fuerte? (Do you like strong coffee?)" Say-back "Sí, me gusta fuerte." / "No, con leche."

Open: whether one model call can write all the pieces or the Fact needs its own; the caps and the fourth-turn rotation are guesses; whether a medium Intro keeps a beginner listening is for Josh's ears. The research on Intro and Build is thin: sources favor context carrying meaning (T20) and elaboration (F3); nothing found tests an Intro with Builds against short turns.

## 7. Memory at turn size (design; on hold for the live system, J9)

Now, as read: a model writes notes once, when the visit ends; each turn reads the earlier visits' notes; within a visit the character has only the transcript.

| | Written | Read |
|---|---|---|
| Thread (T24) | every turn, by code, from the Build part the turn returned | every turn, to attach the next Build and block repeats |
| Learner facts (T25) | every turn, only when stated, in a field the turn returns | every turn, so blanks and Takes use them |
| Chunk ledger (T26) | every turn, by code | every turn, to set support and pick Recycle |
| Visit summary | once, at the end: folds the three lists into a short note | the next visit's Intro, which resumes the thread instead of re-opening |

No extra model call per turn: code writes the first three from structured output; the one model call stays at the end of the visit and consolidates. It targets retelling (retold-as-new), the opener replay on return visits (found earlier; "this is your first turn" setup), and the weak link to the learner (a Take can use what they said two turns ago). Risks: speech-recognition mishearing (write only what's clearly stated; CLAUDE.md: characters know only what the learner told them); drifting summaries (recursive summaries degrade, LLM-Rsum in llm-language-learning.md: keep lists append-only per visit, consolidate once); prompt size (cap the thread to the last few beats plus the one-line visit summary). Josh's "hold on memory" stands: no code, prompt or card until he says go.

## 8. Prerequisites and status

- **P1** The live cluster-1 path has the answers and the per-turn setup line again since 2026-11-11a (`lineWithAnswers`, `runTurn` with `answers` and `note`); S2, S4, S6 with Say-back, S12 and S13 can use it. Not released until the next build (the app change in `PersonView.swift`).
- **P2** The auto-responder plays the parts format, not the live path; it needs pointing at the live call before it can test any of this.
- **P3** Card S1 (S1 to S8's first cases: the Take, Slot and Recycle arms) is drafted and reviewed ("run with changes", applied); needs a re-review and a stamp; its thresholds are set after A's pilot and then frozen; Josh said "Not yet" to the re-review and the run.
- **P4** A culture card for S11 to S14 isn't drafted; Josh hasn't said go.
- **P6** The story design (T22 to T26, S15, sections 6 and 7) is design only. If taken forward, its first slice would replace S1's Take arm; it needs a card, a review and Josh's go. The thread and turn-size memory need code on the live path (P1) and the memory hold lifted.
- **P5** Memory, the opener replay, the goodbye fix and the earlier items remain on hold as listed in progress.md.

## 9. Core observations on the prompt and the code (Claude, 2026-11-11; Josh: "add to doc")

From reading `lib/beginner-2.ts`, `lib/conversation/take-turn.ts`, `lib/prompts/build-turn-prompt.ts` and `content/*/prompts/scaffolding.md` as they run today, for the structure deep dive.

- **O1 The turn's structure exists only as prose, in one paragraph.** The `Level: 1` block is the whole description of a turn's shape ("two or three of them a turn, inside your English sentences… then one question at the end"). Nothing names the parts, their order or their length; the model infers a shape from the paragraph and its examples, and the examples ("el comal", "la silla") become content, the pattern that grew Beginner 1's prompt from 504 to 1,245 words (prompt-testing.md → Why).
- **O2 Code decides two things per turn, neither of them the character's turn.** `pickSetup` draws a setup at random per turn, and the setups are about the answer bubbles (two answers, one, questions to ask, none) plus a goodbye at a fixed count (`GOODBYE_AFTER`, the Chuy fault). The character's own moves (Take, Fact, Slot, Ask) have no code lever. Every cross-turn idea in §4 (S7 to S10: the Ask ladder, Recycle, Fade) has nowhere to live: there is no state across turns except the transcript and a counter.
- **O3 Most of beginner-2.ts repairs structure after the fact.** `flowingLine`, `questionEcho`, `withQuestionEnglish`, `withoutAnnouncing`, `invited`, `fullerGlosses`, `withoutSaidInEnglish`, `shapeParts`: eight fixers reshape what came back. That is the repo's strongest evidence that prose can't hold a structure. The principle in §6 (code picks the shape, the model writes the pieces) is the opposite of what runs.
- **O4 The cluster-1 reply is one string, so code can't see the structure.** With `line`, `en` and `answers` there is no way to count a Slot's length, check a Gloss is present or confirm one Ask without a second model call to copy the pieces out, which is why card S1's main measure (M1) is flagged weak. The parts format gives code the pieces but pulled the language out of the sentence (progress.md, 2026-11-10 night). The way between is one line plus spans marking the language pieces ("the spans format, later").
- **O5 The right lever exists and is underused.** The per-turn `note` goes in brackets at the end of the newest message, where the model weighs it most (`build-turn-prompt.ts`). Today it carries only the answer setup. A turn shape could be one short note line per turn ("react to what they said, add one new thing, then your question in {language}") from code, with the Level paragraph shrinking.

**Implication.** The first implementation work for the deep dive isn't a theory; it's two enabling pieces: spans in the reply (O4) and a shape note per turn (O5). Without them a theory is a prompt paragraph judged by ear.

**On the numbering** (Josh, 2026-11-11: "discussion of dialogue gets very vague easily"). The terms are kept because a change can name its part and a real turn can be labelled by its parts; the numbers are for cards and logs, the words for conversation. A term earns its place only when something built or on a card uses it.

## 10. The Intermediate dialogue in terms (Claude, 2026-11-11; Josh: "represent the current intermediate dialogue in terms, or create new ones")

From two directions: the prompt (`content/*/prompts/character.md` 2026-11-10q and `dialogue.md` 2026-11-10p) and one real conversation (Josh with Nunzio, Palermo, 2026-11-09, character prompt 2026-11-08b, 14 character turns; archive `conversations-2026-11-10.json` on the mini). The archive's newest 200 have no Mexico Intermediate conversation longer than one turn, so the transcript side is Italy only.

### 10.1 New terms (no fit in T1 to T32)

- **T33 Full:** the whole turn in the language, English only as display (the Intermediate reply, `{ line, en }`). The counterpart of the Beginner frame (Scene + Slot).
- **T34 Translation:** the full English of the line, shown after the character finishes (Intermediate display today). Distinct from Gloss (T3, spoken, brief, inside the line) and Subtitle (T27, shown, tracking).
- **T35 Serve:** the transaction, when the role has one ("a turn or two of the visit, not the whole of it").
- **T36 Refer:** sending them elsewhere for what the role doesn't give ("la Vucciria è a due passi"; dialogue.md: "tell them where to get it").
- **T37 Story:** a piece of the character's own life or past ("lo mangiavo da ragazzo"). Culture that lives in a person; Fact (T15) is culture that lives in information, Manner (T31) culture that lives in speech.
- **T38 Do:** an invitation to act in the scene ("Veda se riesce a toccarne una"; Level 1's "what you'd tell them to do: mire, suba"). Both levels.
- **T39 Praise:** "Bene, brava!", "buon orecchio". Named so it can be counted: it is the move that reads as a tutor's script at Beginner.
- **T40 Reassure:** the character answers an apology or a stumble ("Non si scusi, parla benissimo"). Not Help (T7), which is on request.
- **T41 Rest:** a turn that ends on a statement and leaves the learner to lead. At Beginner a dead end (dialogue-model.md: S1 to S3 end on a question); at Intermediate where Nunzio's conversation got good.

Inputs (what the prompt gives the model; not moves): **I1 Setting** (the here line), **I2 Notes** (the character's memory of the learner, with "don't tell them again"), **I3 Learner said** (the newest message), **I4 Heard note** (the app's check against the answers offered; none at Intermediate, which has no answers), **I5 Register** (T32).

### 10.2 The prompt, in terms

| Prompt text | Term |
|---|---|
| "Someone approaches." | Open (T10) |
| "No more words after a question mark" | Ask (T5) ends the turn when there is one; nothing says there must be |
| "Talk about what's here"; the setting line | Anchor (T20), Fact (T15) from I1 |
| "If your job has a sale, it's a turn or two" | Serve (T35) |
| "tell them where to get it, and ask nothing about it" | Refer (T36) |
| "use the right words yourself… not every time" | Recast (T18) |
| "Don't tell them again what you've already told them"; the notes | Thread across visits (T24), Learner facts (T25), from I2 |
| "It's rude to ask someone where they're from or how long they've been here" | a forbidden Ask kind (the tourist question) |
| "say goodbye back… nothing new" | Close (T11) |
| `{ line, en }` | Full (T33) spoken, Translation (T34) shown |

No Slot, Gloss, Say-back or Echo. The prompt prescribes no order inside a turn and no shape across turns; everything below is the model's habit.

### 10.3 Nunzio's turns, labelled

| Turn | Labels |
|---|---|
| 1 | Open, Anchor ("questi alberi"), Fact (cent'anni), Ask as a tag ("sa?") |
| 2 | Fact (Australia, 1800s), Anchor as a question ("Vede le radici?"), Fact. Rest; words after the question mark |
| 3 | Take (the name), Anchor (novembre), Ask about them ("di passaggio a Palermo?": the tourist question the prompt forbids) |
| 4 | Take, Fact + Anchor (Palazzo Steri, qui di fronte), Ask yes/no |
| 5 | Confirm ("Ha ragione"), Fact (arabi, normanni), Refer (la Vucciria). Rest |
| 6 | Take ("Certo che lo conosco"), Fact (pani ca meusa), Story ("lo mangiavo da ragazzo"). Rest |
| 7 | Take, Fact (milza, strutto), Fact (tradition). Rest |
| 8 | Help on request (milza = spleen), Praise ("buon orecchio"), Ask about them (gardens in your country) |
| 9 | Take ("Ma guarda!"), Expand, Ask open |
| 10 | Take, Anchor (vecchietti sulle panchine), Expand. Rest |
| 11 | Praise, Story (opinion), Ask either/or |
| 12 | Take, Anchor + Fact (fichi, radici), Do ("Veda se riesce a toccarne una"). Rest |
| 13 | Reassure ("Non si scusi, parla benissimo"), Take, Expand. Rest |
| 14 | Close, nothing new |

### 10.4 What the labelling shows

- **The model's default shape, with no instruction, is Take, then one added thing (Fact, Anchor, Story or Expand), then sometimes an Ask.** Take is in 12 of 13 turns after the first. That is S11-revised (Take, Build, Ask), arrived at by habit, not design.
- **Rest is half the conversation:** 6 of 13 non-closing turns end on an Ask (1 tag, 3 yes/no, 1 open, 1 either/or); 7 end on a statement and Josh led the next turn himself.
- **Both prompt breaches are Ask-shaped:** words after the question mark (turn 2) and the tourist question (turn 3).
- **Nothing recycles and nothing fades,** since there are no chunks: at Intermediate the unit is the idea, not the phrase. A turn is usually three sentences.

## 11. Code picking shapes: the idea and the first table (Claude, with another laptop session's refinement; Josh, 2026-11-11: "yes")

**The idea.** Code decides what kind of turn comes next; the model writes the words for it. A shape is a short list of moves in order (Take, Fact, Ask; Reassure, Slot, Ask yes/no; Close). Today the model chooses the shape from a paragraph of prose and its own habits, and gets it right often (§10: Take, one added thing, sometimes an Ask) and wrong in ways no one chose (the goodbye at a fixed count, the tourist question). With code picking shapes, the prompt keeps describing who the character is and where they are, and a turn gets one extra line saying what this turn does, in the character's situation, not in our terms ("React to what they said, then one thing about your place, then one question"). The model stays the writer; the code is the director. The lever exists: the bracketed `note` at the end of the newest message (O5), which Beginner 2 already fills with the answer setup.

**Not scripting.** The code never writes a line, never picks a topic, never fixes an order for a visit. It chooses from a few turn kinds the way a host does: a moment for a question, a moment to let them lead, a moment to help. Every word is the character's; two visits with the same shapes read differently.

**Why.** A theory becomes something to switch on (the Ask ladder is a table, nothing else changes). A test becomes a fact (the shape asked for is recorded per turn, so "did the character do what the turn asked" is a count, not a judge's guess). The prompt can shrink, because the sentences that tried to hold structure come out.

**The quiet default is the design, not a first version** (the other session's refinement, agreed). The director speaks only at moments code can see and stays silent otherwise: an instruction on every turn breeds repetition (Beginner 1's history), and Nunzio's conversation got its shape, Rest turns included, from habit. At Intermediate the note is empty unless a moment fires. At Beginner cluster 1 the note already speaks every turn with the answer setup, so "quiet" there means the answers only, no shape; the repetition risk is a Beginner risk.

**The first table.** Each moment is detected with a signal that works in any language (CLAUDE.md: recording length, silence, punctuation, a judge or the reply's own flag; no phrase lists).

| Moment | Signal | Shape |
|---|---|---|
| They said goodbye, or the talk is winding down | the reply's `done` flag set by the learner's goodbye, not a turn count | Close (T11). Replaces `GOODBYE_AFTER = 8`, the one fault proven in play (Chuy); goes first |
| They said almost nothing, or asked for help | recording length or word count; a help request in either language | Repair (T19): a shorter piece of the language, an easy Ask |
| They asked something | `?` or `¿` in what they said (already used in `pickSetup`) | Answer it first, before anything of the character's own. Not "nothing else": Nunzio's turn 8 answered the spleen question and then asked about Josh's country, and that opened the best stretch. The retold-as-new fault was the character skipping the answer, not adding to it |
| The opening | turn 0 | Intro (T22), the decided design (§0) |
| Everything else | | no note: the model's Take, one new thing, sometimes an Ask (or a Rest, T41) |

The Ask ladder (S7) and Recycle (S8) join the table later only if Josh's ear says the chat needs them; not the start.

**Built 2026-11-11 (laptop session; released the same evening, cd6cadb):** `lib/shapes.ts` (the table: `pickShape` from signals, `shapeNote` from `content/<country>/prompts/shapes.md`, `noteOf` joining the shape and the answer setup into the one bracketed note) on Intermediate and all Beginner 2 clusters; Beginner 1, the welcome, lessons and Magda untouched. Rows: **answer first** (a `?` or `¿` in what they said), the **intro** (turn 0, § 0), and the **goodbye once** (Beginner 2's goodbye setup on the 8th turn only, no longer every turn after it: `pickSetup`). Repair on a thin reply left out: no signal in any language tells "Sí." from a lost learner. The shape is recorded on both paths (`steps.shape`, in the turn log too). Checked through the real route on a local server: the opening streamed its first sentence with the intro flag and came back with 8 sentences and two answers; a learner question ("¿Por qué usa grasa?") got answered first ("La grasa, the polish, feeds the leather…") and the turn logged `shape: answer-first`. `npm run test:shapes` in both countries.

## 12. The turn as a selection from the table: the palette of asks, progression, the told-ledger (Claude with Josh, 2026-11-11 evening; Josh: "ok")

Josh's picture of the design, confirmed as § 6 and § 11 said plainly: **at the start of a turn, code selects a set of moves from the table, and that set is the turn's shape; the model writes each move in the character's words.** Shape is about fit (what this moment asks of the character and of the learner); variety is what fit produces, since moments differ, plus a rotation rule so the learner's move doesn't go flat. Three things came out of the discussion that § 11 didn't have.

**A turn's selection has three parts.**
- *Picked by the moment* (the rows of § 11): they asked → Answer first; turn 8 → Close once; turn 0 → Intro; visit 2, turn 1 → Resume.
- *Drawn from the palette* (new): the ask kind and its balloons, seeded and weighted like the setups (`pickSetup`), never the same kind twice running, each gated on what exists.
- *Always there, by habit* (not selected, not instructed): Take and one new thing, which the model does unasked (§ 10.4).

**12.1 The palette of asks** (Josh: "something asks if you remember, something has you compare two things, something hands you a topic and asks if you have questions… variety to the shape of a question rather than read this balloon or that"). In the character's situation, not our terms; the balloons follow the kind:
- **A1 Remember:** "¿Se acuerda cómo se llama esta salsa?" Balloons: the phrase from earlier, one with its English, one without. Gate: something told earlier in the visit, or in the notes from last time (12.3).
- **A2 Compare:** "¿Cuál prefiere, el de arriba o el de abajo?" Two balloons, two things in front of them. (Today's "two answers" is usually this.)
- **A3 Guess:** "¿Para qué cree que es este gancho?" Two guesses, one right. Gate: an Anchor (T20) in the turn.
- **A4 Hand a topic:** a little about the mercado, then stop; the balloons are two questions to ask (T13, the `ask-en` setup). Gate: a Fact (T15) in the turn.
- **A5 Finish it:** "El café se sirve con…" One balloon, the ending.
- **A6 Say it back:** the plain say-this (T6), as now.
- **A7 Your own words:** "¿Y usted, qué desayuna?" No balloons, or one with a blank (T14). Gate: the mic open, not buttons.
- **A8 Rest:** no ask (T41); he ends on a statement and the learner leads.
Added one or two at a time, each played before the next. Rotation: never the same kind twice running (the rule `pickSetup` already applies to invitations).

**12.2 Progression is which moves are open.** The game has no progression today (no stored step; every day is step 1). In this design the step opens the table: step 1 Intro with subtitles, the frame, Say it back and Compare; step 2 drops the English after phrases heard before, Remember and Guess come in; step 3 Your own words and Rest (the learner leads), a phrase said without the balloon (Fade, T9); step 4 the subtitles fading to the language alone. Mechanism, and the word for it: **level up** (Josh, 2026-11-11: "terminology is complicated, but we do have 'level up' as a simple offer after N conversations; doesn't have to be success based and is user chosen"): after N conversations the game offers it, the learner chooses, no score decides; the stored step, the count and the offer screen in [beginner-2-step-2.md](beginner-2-step-2.md) → The step up. The rows read the step, nothing else changes.

**12.3 The told-ledger.** The intro always says "the thing the place is known for", so a third visit is the lechero again; and Remember needs to know what was told. The fix is a line in the memory notes already written at the end of a visit (what the character told them: customs, stories, facts), read by the Intro (pick one not yet told) and by Remember (pick one told). Across visits only; within a visit the transcript serves. No new state beyond a line in the notes.

**Status.** 12.1 and 12.3 are design, agreed with Josh 2026-11-11 ("ok"); the stage map is in [06-roadmap.md](06-roadmap.md) → Now. **12.2 is built (2026-11-11 evening, not released):** the stored step (`learners.step`, `lib/level-up.ts`), the count of conversations with 3 or more replies since the step was set or the offer last declined, the offer after 3 (`GET /v1/level-up`, with the character's last line and the same line at the next step from `level-up.md`), the learner's yes or not yet (`POST`), and the screen as the approved mockups (`ios/.../LevelUp/LevelUpView.swift`, offered over the place list when a conversation is saved). The turn reads the stored step when the app sends no cluster header. Josh: "lets use the level up pages as designed". Live today: the table of § 11 (three rows) and a palette of one (Say it back, with Compare as the model's habit).

