# Fuori

**Fuori** ("outside") is a voice-first game for learning a country, Italy or Mexico (**Afuera** in Mexico): its language and its culture, food, traditions, history and geography. You are someone learning about the country; the game assumes nothing about where you're from or how long you're there (Josh, 2026-11-10). You can go almost anywhere and meet whoever is there: Claude creates the places and people, suggests a few things to do each day, and remembers everyone you've met. Every conversation is spoken, every character is played by Claude, and mistakes are corrected the way a friendly local would correct them: by saying it back right and carrying on.

## Status

**M2 live** (Magda, memory, study file, visit stamps); M3 (polish and language levels) is next. The game is the native iPhone app in `ios/` (one app for both countries); the website is switched off (`proxy.ts` answers only `/v1`, `/api/admin` and `/healthz`). Two server deployments from one codebase on Railway, both from the `live` branch (`npm run release` moves it to `main`): **Fuori** (Italy, 20 cities) and **Afuera** (Mexico, 14 cities), chosen by the `COUNTRY` variable.

- **Play:** cities → places → a spoken conversation. Whisper on Groq hears you, Claude plays the character (`{ line, en }`), ElevenLabs speaks (the phone's own voice as fallback). Settings: your level, show the language's words, show English, allow dialect.
- **Memory:** characters remember you across visits. When a conversation ends, one call writes the character's notes and the learning notes, which feed Magda's study file. Magda teaches only in Learn's lessons, never in a city (Josh, 2026-11-07).
- **Stations:** a departures board and ticket take you to another city.
- **Checks:** `npm run test:*` (quick checks), `npm run test:replay` (Josh's real lines replayed through the current prompt), `npm run smoke:live` (a scripted learner on the live servers; `COUNTRY=es-mx` for Mexico).
- `prototype/index.html` is the original single-page demo (one "day", four scenes) that runs as a claude.ai artifact. Kept as reference.
- Interface mockups: [Fuori mockups](https://claude.ai/artifact/1zVpF11bWHivP3RxVruKyx). They predate the open-ended direction; adapted for current implementation.
- See [progress.md](progress.md) for the session log and [Roadmap → Now](docs/06-roadmap.md#now) for what's next.

## Planning documents

Read them in order:

1. [Vision](docs/01-vision.md): who it's for, the learner persona, principles
2. [Game design](docs/02-game-design.md): the open world, daily suggestions, people, changing scenery, Magda, levelling up, interface
3. [Cities and people](docs/03-journey.md): city pantries, seed characters, suggested route
4. Dialogue: [how it works today](docs/dialogue-now.md) (checked against the code), [what's decided](docs/dialogue-model.md), [the plan](docs/dialogue-plan.md), [terms and bids](docs/dialogue-structure-reference.md), [faults with examples](docs/dialogue-ideas.md). The October designs ([conversation engine](docs/archive/04-conversation-engine.md), [M1 conversation model](docs/archive/M1-CONVERSATION-MODEL.md)) are archived
5. [Architecture](docs/05-architecture.md): server stack, voice, data model, API use
6. [Roadmap](docs/06-roadmap.md): milestones, starting with M1
7. [Visuals](docs/07-visuals.md): portrait style, moods, SVG avatars, photos
8. [Language services](docs/08-language-services.md): speech-to-text (Whisper on Groq), voices, models, costs
9. [Data model](docs/09-data-model.md): TypeScript interfaces for all content and learner data
10. [Testing](docs/10-testing.md): testing strategy, conversation tests, validation protocols

Undecided ideas are parked in [docs/ideas.md](docs/ideas.md).

## Debugging on the phone

- **Error codes.** When something fails, the learner sees a plain message with a code like `E-7K2F`. The app sends the details to `/v1/log`, which keeps them in the `app_errors` table (read with `/api/admin/conversations?format=errors`), and the server routes tag their own errors with the same code. Find them in the server log with `railway logs | grep E-7K2F`.
- **Honest failures.** Temporary failures are retried once. If something still fails, the screen says plainly what failed ("Speech recognition failed…", "Giulia couldn't reply…") with the code. Characters don't cover for system errors by asking you to repeat; that only hides bugs. When your speech comes through garbled, Claude gets the text and asks you to repeat in the character's own words. A failed hosted voice falls back to the phone's own voice. All failures are logged.
- **Debug panel.** In the app, Settings → touch and hold Version → Debug panel. The conversation screen then shows how each turn was played, and each turn can be rated (`/v1/rate`, kept in `turn_ratings`). (The web's `?debug=1` went with the website.)

