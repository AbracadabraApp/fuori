# learn-card.md changelog

Newest first. One entry per version: what changed, why, what prompted it. The prompt is `../learn-card.md`; its models are `../learn-card-models.md`.

### 2026-11-24a: one card per kind from the visit, code picks; no bank
- **Changed:** the writer no longer picks from about thirty bank cards or says none. It writes one card for each kind the conversation can supply (when-you, learn-it, a-saying, formal-informal, a-word-from-here, this-or-that, about-this-place, culture, vocabulary), and code picks the kind: not one of the learner's last two cards, situations first (lib/learn-card-writer.ts). The language lines come from the conversation as said; place and culture are written from the scene and what the model knows, as the Learn page's good-to-know already is. The models' A word from here carries the word in its headline (design rule 15). Place and culture notes are asked for under 40 words, the limit code holds them to (the first replay lost two to it, at 44 and 47 words).
- **Why:** Josh, 2026-11-24, after his six Mexico visits of 11-23 ended on three cards, one of them a plaza fact from the bank: "I think the \"card bank\" idea took it in a wrong direction. In the table - the source was never a goal - the rest of them were"; then, of this design, "seems like a better design for the source"; of its mock-ups, "they are good"; "start". The variety is in code because a prompt asked to vary gives the same thing every time (docs/bugs.md B31).

### 2026-11-23b: first version
Pick a bank card the visit involved, make one from what was said, or say none (docs/learn-sheet-2-plan.md → Picking).
