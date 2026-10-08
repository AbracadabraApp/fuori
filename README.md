# Fuori

**Fuori** ("outside") is a voice-first game for learning Italian by living it. You are someone who loves Italy and has come to spend a stretch of time there. Day by day you settle into neighbourhoods, become a regular at the bar, take day trips, and meet people. Every conversation is spoken, every character is played by Claude, and mistakes are corrected the way a friendly Italian would correct them: by saying it back right and carrying on.

## Status

- `prototype/index.html` is a single-page demo of one "day" with four scenes (Roma bar, Napoli market, Firenze station, Bologna piazza). It runs as a claude.ai artifact and uses Claude through the artifact runtime.
- The real web app has not been started. The plan is in `docs/`.

## Planning documents

Read them in order:

1. [Vision](docs/01-vision.md): who it's for, the learner persona, principles
2. [Game design](docs/02-game-design.md): days, stays, day trips, the daily rhythm, progression
3. [The journey](docs/03-journey.md): the route, places and recurring characters
4. [Conversation engine](docs/04-conversation-engine.md): how characters talk, forgive, correct and remember
5. [Architecture](docs/05-architecture.md): web app stack, voice, data model, API use
6. [Roadmap](docs/06-roadmap.md): milestones, starting with pre-M1 validation
7. [Visuals](docs/07-visuals.md): character portraits, moods and places
8. [Language services](docs/08-language-services.md): STT/TTS choices for Italian, model validation
9. [Data model](docs/09-data-model.md): TypeScript interfaces for all content and learner data
10. [Testing](docs/10-testing.md): testing strategy, conversation tests, validation protocols

Undecided ideas are parked in [docs/ideas.md](docs/ideas.md).
