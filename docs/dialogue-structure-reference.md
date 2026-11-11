# Beginner dialogue structure: terms, sequences and findings (reference)

2026-11-11 · Claude, from a session with Josh · Everything is numbered so a card, a log entry or a message can cite it ("T3", "S6", "F2"). Sources and the long form: [research/frame-gloss-echo.md](research/frame-gloss-echo.md). Nothing here changed code or prompts; the card for the first sequences is S1 in [prompt-trials.md](prompt-trials.md) (drafted, reviewed, not re-reviewed, not stamped, not run).

## 1. The question and Josh's judgments

- **J1.** The frame (a language piece slotted into one line of English) is better structurally than the echo (a language sentence, then its full English): "it's one line of dialogue; with the echo you just listen to the echo."
- **J2.** The frame doesn't use enough of the language. The fix is more use of the frame (more language clauses slotted in), not a return to the echo.
- **J3.** Judge builds by structure, not by language words a turn: those counts reward the echo.
- **J4.** Level 1's text is already long; don't add words.
- **J5.** Cultural content is a goal and works well on its own, but it produces an English monologue with a weak connection to the learner (2026-11-11).
- **J6.** The "sí" in Concha's conversation came from having no proposed answers.

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
- **M10** Josh's blind read, by ear, with hidden A-against-A pairs: the decision.

## 6. Prerequisites and status

- **P1** The live cluster-1 path has no answers and no per-turn setup (fe38bc2); S2, S4, S6 with Say-back, S12 and S13 need answers there first.
- **P2** The auto-responder plays the parts format, not the live path; it needs pointing at the live call before it can test any of this.
- **P3** Card S1 (S1 to S8's first cases: the Take, Slot and Recycle arms) is drafted and reviewed ("run with changes", applied); needs a re-review and a stamp; its thresholds are set after A's pilot and then frozen; Josh said "Not yet" to the re-review and the run.
- **P4** A culture card for S11 to S14 isn't drafted; Josh hasn't said go.
- **P5** Memory, the opener replay, the goodbye fix and the earlier items remain on hold as listed in progress.md.
