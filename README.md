# Fuori

**Fuori** ("outside") is a voice-first game for learning Italian by living it. You are someone who loves Italy and has come to spend a stretch of time there. You can go almost anywhere and meet whoever is there: Claude creates the places and people, suggests a few things to do each day, and remembers everyone you've met. Every conversation is spoken, every character is played by Claude, and mistakes are corrected the way a friendly Italian would correct them: by saying it back right and carrying on.

## Status

**M1 in progress** — City feed and navigation complete, conversation engine built, ready for deployment testing.

- `prototype/index.html` is a single-page demo of one "day" with four scenes (Roma bar, Napoli market, Firenze station, Bologna piazza). It runs as a claude.ai artifact and uses Claude through the artifact runtime. Still works; kept as reference.
- **The web app is running locally at http://localhost:3000** with:
  - 20 Italian cities with distinctive watercolor card images
  - Full navigation: Cities → Places → Conversation
  - Conversation engine with Whisper (Groq) and Claude
  - Settings UI (toggles not yet functional)
  - Next step: deploy to Railway and test on iPhone
- Interface mockups: [Fuori mockups](https://claude.ai/artifact/1zVpF11bWHivP3RxVruKyx). They predate the open-ended direction; adapted for current implementation.
- See [progress.md](progress.md) for detailed status and [Roadmap](docs/06-roadmap.md) for what's next.

## Planning documents

Read them in order:

1. [Vision](docs/01-vision.md): who it's for, the learner persona, principles
2. [Game design](docs/02-game-design.md): the open world, daily suggestions, people, changing scenery, Magda, levelling up, interface
3. [Cities and people](docs/03-journey.md): city pantries, anchors, seed characters, suggested route
4. [Conversation engine](docs/04-conversation-engine.md): suggestions, scenes and characters; how characters talk, forgive, correct and remember
5. [Architecture](docs/05-architecture.md): web app stack, voice, data model, API use
6. [Roadmap](docs/06-roadmap.md): milestones, starting with M1
7. [Visuals](docs/07-visuals.md): portrait style, moods, SVG avatars, photos
8. [Language services](docs/08-language-services.md): speech-to-text (Whisper on Groq), voices, models, costs
9. [Data model](docs/09-data-model.md): TypeScript interfaces for all content and learner data
10. [Testing](docs/10-testing.md): testing strategy, conversation tests, validation protocols

Undecided ideas are parked in [docs/ideas.md](docs/ideas.md).
