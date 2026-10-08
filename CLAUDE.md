# Fuori

Voice-first Italian learning game. Read `README.md` and the numbered files in `docs/` before making product or architecture decisions; they are the source of truth for the design.

- `prototype/index.html` is the original claude.ai artifact demo. Keep it working and don't refactor it into the app; port ideas from it instead.
- The learner persona is someone who loves Italy and is staying for a while, not a tourist. Characters treat them as a newcomer who belongs and remember them across days.
- Characters must stay in Italian, forgive speech-recognition noise, and correct real errors by recasting in character (see `docs/04-conversation-engine.md`).
- API keys are server-side only: `ANTHROPIC_API_KEY` (Claude), `OPENAI_API_KEY` (Whisper), and later the TTS key. Never call these APIs from the browser and never commit `.env*` files.
- Speech in is Whisper (`/api/transcribe`), not browser speech recognition. Speech out is browser `speechSynthesis` in M1, hosted TTS from M2.
- Mobile-first: iPhone Safari is the primary target. Hosting is Railway, which deploys from `main`; work and push on `main`.
- Keep `progress.md` current at the end of each session: what was done, decisions, open issues, next actions.
- Game content (characters, scenes, route) lives in `content/` as data, not inside components.
