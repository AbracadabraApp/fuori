# record.md changelog

Newest first. One entry per version: what changed, why, what prompted it. The prompt is `../record.md`.

### 2026-11-02: first version

For the leveling model's record of each conversation (Josh, 2026-11-02: yes to the record table). The server can't tell which language a learner's line was in or whether it asked for help from what it stores (speech-to-text is forced to the learned language), so one call labels the lines when the conversation ends. Language and help kind are what the "hard" rule needs: a one-word help ask is learning, asking for the whole line again or answering in English is being lost (docs/research/leveling/07-model.md).
