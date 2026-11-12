# shapes.md changelog

Newest first. One entry per version: what changed, why, what prompted it. The prompt is `../shapes.md`.

### 2026-11-11b: the thread, every turn after the intro
- **Added:** "Shape: thread": "Pick up what they just said, stay with what you opened the visit with, add one thing to it, then ask." Sent on every turn after the intro of an ordinary visit (Intermediate and Beginner 2), joined before answer-first when both fire.
- **Why:** Josh, 2026-11-11: "My thought was basically that the intro sets the scene, the following discusses it", confirmed as the thing to build ("I was referring to this"). The chat turns knew the intro only as the first lines of the transcript and reached for a new thing about the place each turn; Elena's visit stayed on the costumes by habit, Bar Alba did not. The reference's "Build on the thread" (T23), as one row. The quiet default stands for turns with no intro (the welcome, lessons, Beginner 1).

### 2026-11-11a: the first shape, answer first
- **Added:** "Shape: answer first": "Answer what they asked first, before anything of your own." Sent as the bracketed note when what the learner said has a question mark (? or ¿), on Intermediate and Beginner 2 turns; joined to the answer setup at Beginner 2. The goodbye at Beginner 2 is offered once, on the learner's 8th turn, not on every turn from the 8th (`lib/beginner-2.ts` → `pickSetup`; the Chuy fault, 2026-11-10: ten goodbye turns in a row). The shape asked for is recorded with the turn on both paths (`steps.shape`).
- **Why:** docs/dialogue-structure-reference.md § 11, the first table (Josh, 2026-11-11: "ok - sounds like a good direction. make it practical"). Not "nothing else this turn": Nunzio's turn 8 answered the question and then asked one of his own, and that opened the best stretch of the conversation; the retold-as-new fault was the character skipping the answer. Repair on a thin reply is left out: no signal that works in any language tells "Sì." (a fine answer to a yes/no question) from a lost learner.
