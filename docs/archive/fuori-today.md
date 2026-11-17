# Fuori today

A one-page picture of the app as it is on 2026-11-04, for a session or a person who hasn't seen it lately (Josh: the cloud project's session was advising on a much earlier version). The design's source of truth is still `CLAUDE.md`, `README.md` and the numbered files in `docs/`; the session log is `progress.md`.

## What it is

A voice-first game for learning a country: **Fuori** for Italy, **Afuera** for Mexico, one iPhone app for both (the country is chosen in onboarding). The goal, in Josh's words: to know Italy or Mexico, its language, culture, food, traditions, history and geography, so the learner can discuss real things with real people in their language. A learning game, not a generating game: when teaching conflicts with speed or liveliness, teaching wins. Not Duolingo: lessons teach fluency, culture and language together, never grammar points on their own.

The players today are Josh and his family (Sophia in Mexico, Jennifer in Mexico), on TestFlight.

## How it's built

- **iPhone app** (`ios/`, SwiftUI, iOS 26) is the only client. The website is switched off.
- **Server**: Next.js on Railway, two services (Fuori, Afuera), deploys from `main`. Postgres for learners, conversations and memory.
- **Speech in**: Whisper on Groq. **Speech out**: ElevenLabs (flash v2.5), the phone's own voice as fallback. **Dialogue**: Claude, every call through `lib/claude.ts`.
- **Content as data**: `content/it/` and `content/es-mx/` hold the cities, places and people, prompts, voices and lessons. Nothing language-specific in code (`npm run test:language`).

## How play works

- **An open world, not scripted scenes.** 21 Italian cities (Roma nuova is the Rome in use) and 5 Mexican ones. Each place has one character from the city files, with a `here` line saying who they are and what they care about. Claude speaks as them. No branching dialogue, no hand-written scenes.
- **Places are transactional, cultural or open** (a bar, the Colosseo, a park bench). Culture comes from the settings: open characters bring a topic they love (folklore, history, food, religious traditions) and get talking about it.
- **Characters remember the learner** across visits (notes written when a conversation ends) and help in English only when asked.
- **Hands-free**: the character speaks, the mic opens by itself, silence sends the turn.
- **Levels**: Beginner, Intermediate, Advanced. Beginners hear a little spoken English setting the scene, then the words that matter and whole-sentence answers to say back. Intermediate and above talk freely.
- **After each conversation**: a review (useful phrases, the learner's real errors with fixes) and a quality score.

## Learn

The Learn page, opened from the book next to Settings:
- **Lessons** as chips in areas, one set at a time (Beginner first; Intermediate lessons are sets 2 and 3). Magda, the teacher at the school for foreigners, teaches each lesson; a short practice scene and her review follow.
- **Culture chips** among the lessons: short story lessons about the city (being redone).
- **Flashcards**: the deck, with pictures.
- **History** (cities, people, conversations): hidden for now.

## How work is done

- **Measure before changing.** Every prompt change is tested against a baseline (`tests/experiments/`, `npm run test:conversations`) and recorded in `docs/prompt-trials.md`, kept or dropped. Each prompt has a version and a changelog.
- **No phrase lists or keyword filters**: signals that work in any language, or a judge call.
- **Done means used**: run end to end (`npm run smoke:live` in both countries), deploy confirmed, and on Josh's phone for anything with audio.
- **Ideas wait for decisions**: `docs/ideas.md` and `docs/dialogue-ideas.md` (problems seen in play, collected with examples before any fix).

## Ruled out, so don't propose them

Scripted or branching scenes; phrase lists; frequent corrections (Josh: "it's ok not to get corrected all the time", and speech-to-text mishears); framing words as "kept" or owned; feature flags (the family are the users); grammar-first lessons.
