# Glossary

2026-10-21 · Josh · The words for Fuori's parts, so docs, code and talk say the same thing. Settled terms first; proposals until Josh decides. Old docs keep their old words until they're next touched.

## Settled

- **Learn** (Josh, 2026-10-21): everything taught outside the world. Magda, the scuole, the Diario and missions all fall into Learn; tutor, school, study file, Diario, chips and missions are older names for its parts. See [learn.md](learn.md). Its parts:
  - **Learn area**: the "home" for structured, scripted, comprehensive learning (Josh, 2026-10-21): what Italian learners need, in course order, aware of the learner's whole conversation history. The book icon in the nav bar, next to Settings; where Magda, the Diario and missions live. Not built.
  - **Learn agent**: the "co-pilot" of each conversation (Josh, 2026-10-21): it reviews that one conversation and writes its Learn sheet (`prompts/learn.md`). Reached from the conversation (the Learn link), not from the book: the book is the area.
  - **Learn sheet**: what the agent writes for one conversation (corrections, words, good to know), shown over the paused conversation. Each sheet feeds the Learn area.
  - **Learn link**: how you reach the sheet, bottom right in a conversation; it appears once there's something to go over.
- **Scaffolding** (Josh, 2026-10-21): the support that gets a new learner used to the game, everything before the stand-alone microphone: onboarding, the reply buttons, the stages that follow. Beginners start with scaffolding, but scaffolding isn't the level: the level (Beginner, Intermediate, Advanced) sets how complex the dialogue is; scaffolding sets how you take part. It isn't a setting: the game decides when you see it, by counting (`lib/scaffold.ts`), not by a judge. The rules and the full set of stages aren't settled yet (Josh, 2026-10-21). Today it's the reply chain: tap one of two good replies, then read one aloud, then choose the one that fits and read it ([beginner-scaffolding.md](beginner-scaffolding.md) → the three-step chain). Past scaffolding, the learner speaks with the mic alone.

- **Services** (or "plumbing"; Josh, 2026-10-21): what's underneath the game, not a part of it: Whisper on Groq (speech in), ElevenLabs and the phone's voice (speech out). Proposed to include Claude API calls (`lib/claude.ts`), Railway and the database too.

## Proposed (not settled)

- **Level** means only the learner's level (Beginner, Intermediate, Advanced). Not the scaffolding steps (call those stages), not CEFR (A1, A2: research docs only).
- **Conversation**: one visit to one character. **Turn**: one exchange. **Line**: what one person says. **Scene**: the setting a conversation opens in (place, moment, why you came). "Dialogue" is the name of the area, not the thing.
- **Replies**: the two buttons in a conversation.
- **Character** for everyone you meet; "person" only in "person screen".
- **World**: cities, places, the pantry, the day's suggestions.
- **Learner**: who you are, your level, your history.
- **Judge**: a call that measures instead of talking (level, quality).
