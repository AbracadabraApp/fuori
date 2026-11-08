# lesson-flow.md changelog

Newest first. One entry per version: what changed, why, what prompted it. The prompt is `../lesson-flow.md`.

### 2026-11-05: one correction rule; the example said before it's asked for

Josh's family's play, 2026-11-04 and 05: Magda coached Jennifer's "¿Owen me ayuda?" (a misheard "Joven, ¿me ayuda?") into "HO-ven", and met "Estoy en el barco de canzart" with "Almost! The word you want is cansado". Josh: fixes "are global improvements not local to lessons or conversations or one country"; "its ok not to get corrected all the time". Corrections and mishearings now have one rule for every conversation (dialogue.md, added to every system prompt), and the app tells the character whether an offered answer was said back (lib/dialogue/heard.ts); this file no longer has its own. Removed: Teach's "if it was off, say it right once" (both modes); the reviews' fix now only from a line sure to have been heard right. Teach says the example aloud before offering it to say back (Josh, 2026-11-05: Magda says the phrase before asking for it; Jennifer was shown "Joven, ¿me ayuda?" without hearing it).

### 2026-11-03: the speaking mode for the Intermediate lessons

Josh, 2026-11-03, on serving the Intermediate lessons as sets 2 and 3 in the Beginner format (English explanations, answers to say back): "seems like we should have an intermediate mode for intermediate lessons". The roadmap's proposal, now built: Magda teaches in the language (English only when asked), a short reason for the grammar, one point; practice in the learner's own words with no answers to say back, a sentence start only if they're stuck, four turns; the review recasts one fix and asks for a new sentence of their own. The character prompt carries these (lib/lesson.ts → speaking). The Beginner blocks are unchanged.

### 2026-11-02b: straight into the lesson; the review keeps to the step

The first lesson trial (a1-01-1, both countries): Magda opened with "Welcome to Matera!" (beginner.md's line about the place) and introduced herself in the review; the review's fix was about something else they said (*mi chiamo*, *mucho gusto*), not the step. Now: no line about the place and no introduction; examples come with who says it; the review keeps to today's step, and the practice scenes keep to moments where the step is used (Mexico's partners had asked names, and the review fixed the name).

### 2026-11-02: first version

Pass 1 of lessons (Josh, 2026-11-02: "Build N6 items 3b then 4"; the handoff in docs/learn.md → Building it). Magda teaches in two or three turns (Josh: "2–3 turns"), in the Beginner format for everyone (Josh: lessons are A1); practice briefs say what's practised and the turn count ("turn N of 3; wrap up on the last", as agreed in learn.md → Ending a practice dialogue); the review is one thing right, one fix, say it once more.
