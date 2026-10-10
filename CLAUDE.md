# Fuori

Voice-first Italian learning game. Read `README.md` and the numbered files in `docs/` before making product or architecture decisions; they are the source of truth for the design.

- `prototype/index.html` is the original claude.ai artifact demo. Keep it working and don't refactor it into the app; port ideas from it instead.
- The learner persona is someone who loves Italy and is staying for a while, not a tourist. Characters treat them as a newcomer who belongs and remember them across days.
- The world is open-ended: Claude generates places, people and scenes during play, and every day comes with 3–4 suggestions plus a change of scenery. Don't hand-write scripted scenes; hand-written content is limited to city pantries, a few anchor characters, Magda and level rules.
- Characters must stay in Italian, forgive speech-recognition noise, and correct real errors by recasting in character (see `docs/04-conversation-engine.md`). Only Magda, the tutor, may teach or explain in English.
- API keys are server-side only: `ANTHROPIC_API_KEY` (Claude), `GROQ_API_KEY` (Whisper on Groq), and later the TTS key. Never call these APIs from the browser and never commit `.env*` files.
- Speech in is Whisper on Groq (`/api/transcribe`), not browser speech recognition. Speech out is browser `speechSynthesis` until hosted TTS in M3.
- Mobile-first: iPhone Safari is the primary target. Follow the interface mockups linked in `README.md`. Hosting is Railway, which deploys from `main`; work and push on `main`.
- Keep `progress.md` current at the end of each session: what was done, decisions, open issues, next actions.
- Hand-written content (city pantries, anchors, Magda, level rules) lives in `content/it/` as data, not inside components. Generated characters and scenes are stored with learner data.
- Keep other languages possible without building them: nothing Italian-specific hard-coded in code or prompt templates (language name, speech-to-text code, voices, UI words and prompt examples come from `content/it/language.ts`), and all Claude calls go through `lib/claude.ts`. See "Keeping other languages possible" in `docs/05-architecture.md`.

## Testing
- Run `npx tsc --noEmit` after editing TypeScript or content files. Never claim a task is done until type checking passes.
- Check the dev server compiles without errors before showing work.
- For UI changes, verify the page loads correctly with `curl http://localhost:3000` or browser check.
- Don't modify or weaken existing tests to make them pass without approval.
- When fixing bugs, add a test that would have caught it.

## Working across sessions
- Two Claude sessions work on this repo: Claude Code on Josh's laptop and a cloud session in the Claude app's "Fuori" project. Neither can see the other's uncommitted work.
- Start every session with `git pull --rebase origin main`. End every session by committing and pushing to `main`, and update `progress.md`.
- Never leave work unpushed overnight. If it isn't on GitHub, the other session and Railway can't see it.
- Model IDs live only in `lib/claude.ts`. Don't hard-code them elsewhere.
