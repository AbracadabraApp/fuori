# leveling.md changelog

Newest first. One entry per version: what changed, why, what prompted it. The prompt is `../leveling.md`.

### 2026-11-06: no speed of speech

Josh, 2026-11-06: speed of speech doesn't belong in a character prompt (his decision, no test: written words can't make the voice slower; its speed is set in the voice, 0.9 in the app). Removed "Speak very slowly and carefully" (stage 1), "Speak slowly and clearly" (stages 2 and 3) and "Slow down even more" (support back); what the words did that a model can do in writing stays: one idea at a time, short sentences, the key thing twice. Same day: "slowly" out of Ximena's here line and "fast-talking" out of three personalities.

### 2026-11-05b: stage 1 doesn't say the key word twice

Josh, 2026-11-05, hearing Beginner openings: "totally incoherent, repetitive with no pauses". Stage 1 asked to "say the key word again without being asked", which gave "Nieve. Nieve de tuna. ¿Quiere nieve de tuna…?" (tests/experiments/replay-set.mts). Dropped; the rest of the stage is unchanged. With beginner.md 2026-11-05c (say each thing once).

### 2026-11-05: answers, not "whole sentences"

Josh, 2026-11-05, on Doña Chela's "Quiero probar un chapulín, por favor.": "reply is too long replies. One translation doesn't translate the subject." Same change as beginner.md 2026-11-05b, so every prompt that offers answers asks for them the same way (fixes are global). Stages 1 and 2 no longer ask for whole sentences: how long an answer is comes from beginner.md (the fewest words a local would use). Stage 3's frame is unchanged.

### 2026-11-02d: in the app, for the path

Josh, 2026-11-02: yes to replacing the Beginner level with the leveling model's path (lib/path.ts). The app now reads Talk: stage 1–3, Talk: support back, Language: 2 and 4, Answers: two, one and frame, and Echo: new words for the path's stages S1–S3; no block's text changed. The rest (Language 1 and 3, Echo: off, the speaking judge and its examples, design C's check and regenerate) stay test-only.

### 2026-11-02c: Language blocks, a dial for how much and how hard

The dial test (docs/research/leveling/07-model.md): the Talk blocks for stages 2 and 3 left the {language} as easy as stage 1 (within ±3 points of words known), since beginner.md's own rules win, and Intermediate was 45 points harder with nothing in between. The Language blocks say how much of the turn is in the language and how hard, in numbers (phrases, words per sentence, new words a turn, tenses), and say they replace beginner.md's guidance on it. To be measured with dials.mts.

### 2026-11-02b: the speaking judge reads five conversations, leans lower, has examples

The first real run (tests/experiments/leveling/results/2026-11-02-19-51-all.md): design B's judge said "not enough to tell" for the improving learner in every conversation; six learner turns, with one to four in their own words, are too little to rate. Now it reads the last five conversations together (RULES.speakingPool) and needs five own-words lines across them; it's told that speech-to-text tidies errors and that beginners sound more able than they are (a phrase reused from the character isn't theirs yet), and given a rated example per level, in the language. From the cloud session's notes on the same run, 2026-11-02. "Not enough to tell" stays allowed.

### 2026-11-02: first version

For the leveling prototype (05-designs.md, Phase 2 of
docs/level-research-plan.md): talk blocks per Beginner stage written as how
the person talks, in CEFR terms (01 §3: A1 "very slow… repetition, rephrasing
and repair", A2 "slowly and clearly… repetition or reformulation", questions
yes/no → this-or-that → one fact → open, Josh 2026-10-17); support blocks
for Josh's fading plan (answers two, one, a frame; the English echo fading);
design C's check and regenerate (03-controlling-generation.md: the only way
past what a prompt can do); design B's speaking judge with "not enough to
tell" (04 §3). Not yet run against Claude (written in a cloud session with
no API key; the harness's --dry mode exercised everything around them).
