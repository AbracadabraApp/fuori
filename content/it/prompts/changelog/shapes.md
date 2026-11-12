# shapes.md changelog

Newest first. One entry per version: what changed, why, what prompted it. The prompt is `../shapes.md`.

### 2026-11-12a: "Shape: close" removed; the goodbye on the 7th turn
- **Removed:** "Shape: close" ("You've covered what you set out at the start: wind down warmly…"), played at Beginner 2 on the turn after the intro's last beat. Since 11d the beats are no longer taken up one a turn, so the turn after the beat count said "you've covered what you set out" whether it had or not, at turn 4 or 5. Beginner 2's goodbye setup is now offered once on the learner's 7th turn (lib/beginner-2.ts → GOODBYE_AFTER, was 8), with or without beats. Answer first is the one shape left.
- **Why and prompted by:** the dialogue inventory (docs/dialogue-plan.md 1.2); Josh, 2026-11-12, on how a Beginner visit should end: closing when the talk is done is best ("c - good"), a fixed turn "good enough, change 8 to 7". Closing when the talk is done stays in the plan (5.3).

### 2026-11-11d: the thread and the beat removed; the director speaks only when something happens
- **Removed:** "Shape: thread" and "Shape: beat". After the intro, no note on a turn unless a signal fires: a question from the learner (answer first), and at Beginner 2 the close after the last beat (with the goodbye setup) and the answers setup the turn already carries. The intro's beats go to the character once, in the system prompt (intro.md 11e → Beats).
- **Why:** the quiet default of § 11 (docs/dialogue-structure-reference.md), restored: a note on every turn makes every turn the same turn (Elena's visit; Beginner 1's history); the beats as a per-turn order made it worse. Josh, 2026-11-11: "go".

### 2026-11-11c: the beat, and the close after the last one
- **Added:** "Shape: beat" ("Pick up what they just said, then say one more thing about {beat}, then ask"), sent instead of the thread line when the opening left beats (intro.md 11d): the turns after the intro take them up in order. "Shape: close" ("You've covered what you set out at the start: wind down warmly, with nothing new, and leave them room to say goodbye"), sent on the turn after the last beat at Beginner 2 only, where that turn also plays the goodbye setup (two goodbyes as answers) instead of the fixed 8th turn. At Intermediate the beats are taken up and then nothing: no wind-down, the character goes on by habit (Nunzio's 14-turn visit was the best stretch; a nudge at turn five would have cut it; caught by the cloud session before release).
- **Why:** Josh, 2026-11-11: the intro sets the scene, the turns discuss it ("Lets do that"), and the visit is done when the thing is done, not at a count.

### 2026-11-11b: the thread, every turn after the intro
- **Added:** "Shape: thread": "Pick up what they just said, stay with what you opened the visit with, add one thing to it, then ask." Sent on every turn after the intro of an ordinary visit (Intermediate and Beginner 2), joined before answer-first when both fire.
- **Why:** Josh, 2026-11-11: "My thought was basically that the intro sets the scene, the following discusses it", confirmed as the thing to build ("I was referring to this"). The chat turns knew the intro only as the first lines of the transcript and reached for a new thing about the place each turn; Elena's visit stayed on the costumes by habit, Bar Alba did not. The reference's "Build on the thread" (T23), as one row. The quiet default stands for turns with no intro (the welcome, lessons, Beginner 1).

### 2026-11-11a: the first shape, answer first
- **Added:** "Shape: answer first": "Answer what they asked first, before anything of your own." Sent as the bracketed note when what the learner said has a question mark (? or ¿), on Intermediate and Beginner 2 turns; joined to the answer setup at Beginner 2. The goodbye at Beginner 2 is offered once, on the learner's 8th turn, not on every turn from the 8th (`lib/beginner-2.ts` → `pickSetup`; the Chuy fault, 2026-11-10: ten goodbye turns in a row). The shape asked for is recorded with the turn on both paths (`steps.shape`).
- **Why:** docs/dialogue-structure-reference.md § 11, the first table (Josh, 2026-11-11: "ok - sounds like a good direction. make it practical"). Not "nothing else this turn": Nunzio's turn 8 answered the question and then asked one of his own, and that opened the best stretch of the conversation; the retold-as-new fault was the character skipping the answer. Repair on a thin reply is left out: no signal that works in any language tells "Sì." (a fine answer to a yes/no question) from a lost learner.
