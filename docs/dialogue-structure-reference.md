# Beginner dialogue redesign: terms, sequences, turn design and memory (reference)

2026-11-11 · Claude, from a session with Josh · Everything is numbered so a card, a log entry or a message can cite it ("T3", "S6", "F2"). Sources and the long form: [research/frame-gloss-echo.md](research/frame-gloss-echo.md). Nothing here changed code or prompts; the card for the first sequences is S1 in [prompt-trials.md](prompt-trials.md) (drafted, reviewed, not re-reviewed, not stamped, not run).

## 0. Decided design (Josh, 2026-11-11)

The smallest version, and the one to try first: **a subtitle area added to the portrait and chat screen that already exists, used for a long Spanish intro, with the English subtitle tracking the Spanish line by line (T27); then the chat bubbles exactly as they are now.** Nothing more: no new scene or component (the buttons in the mockup's top bar are existing ones: Josh named learn books, exit buttons and lesson styles), no change to levels, no new rules beyond the intro's subtitle showing in step (today the English waits until the character has finished; Josh: his rule to change). Mockup: the portrait with a caption and English under it, then the same portrait with the bubble and mic.

Sample, Don Arturo, Gran Café de la Parroquia, Malecón, Veracruz (hand-written for design; the glass-and-spoon custom needs a fact check): eight Spanish sentences, about 90 words, about 35 seconds, each with its English subtitle, ending on "¿Quiere un lechero?" and the first Say-backs "Sí, por favor." / "¿Desde arriba?".

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

In the product today: T10 to T15 exist as setups or prompt content; T1 to T3 are the live cluster-1 frame; T6 is missing on the live cluster-1 path (no answers since fe38bc2); T16 to T21 have no rule.

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

- **P1** The live cluster-1 path has no answers and no per-turn setup (fe38bc2); S2, S4, S6 with Say-back, S12 and S13 need answers there first.
- **P2** The auto-responder plays the parts format, not the live path; it needs pointing at the live call before it can test any of this.
- **P3** Card S1 (S1 to S8's first cases: the Take, Slot and Recycle arms) is drafted and reviewed ("run with changes", applied); needs a re-review and a stamp; its thresholds are set after A's pilot and then frozen; Josh said "Not yet" to the re-review and the run.
- **P4** A culture card for S11 to S14 isn't drafted; Josh hasn't said go.
- **P6** The story design (T22 to T26, S15, sections 6 and 7) is design only. If taken forward, its first slice would replace S1's Take arm; it needs a card, a review and Josh's go. The thread and turn-size memory need code on the live path (P1) and the memory hold lifted.
- **P5** Memory, the opener replay, the goodbye fix and the earlier items remain on hold as listed in progress.md.
