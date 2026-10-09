# Roadmap

Each milestone ends with something playable on your phone. There is no separate validation phase: the first real test is talking to a character in the app.

## M1 — Play a day in Roma

**Goal:** open the app on your phone, see Claude's suggestions for the day, pick one, and hold a spoken conversation that transcribes as Italian.

**Setup**
- [ ] Make `main` the GitHub default branch and work on it (Railway deploys from `main`)
- [ ] `npx create-next-app@latest` in the repo root (TypeScript, App Router, ESLint); keep `prototype/` as is
- [ ] API keys: Anthropic (have) and Groq (free tier, for Whisper). Put them in `.env.local` as `ANTHROPIC_API_KEY` and `GROQ_API_KEY`
- [ ] Railway: `npm i -g @railway/cli`, `railway init`, link the GitHub repo, add the same variables in the dashboard

**Content (first task)**
- [ ] Level rules: have Claude build `content/it/levels/` (A1 and A2 steps) from CEFR descriptors, the *Profilo della lingua italiana*, De Mauro's *vocabolario di base* and typical A1–A2 grammar (see [Testing → 4a](10-testing.md#4a-level-rules-from-published-standards))
- [ ] Roma pantry in `content/it/cities/roma.ts` and the two anchors (Rita, Giulia) from [Cities and people](03-journey.md)
- [ ] `content/it/language.ts` (language name, speech code, UI words, prompt examples)

**Backend**
- [ ] `/api/suggest`: the director's 3–4 suggestions plus "cambia aria" ([Conversation engine](04-conversation-engine.md#making-the-world))
- [ ] `/api/scene`: scene from a suggestion or a free request; generates and saves a new character when needed
- [ ] `/api/turn`: layered prompt, structured JSON output with a Zod schema; opening line from the scene's guide
- [ ] `/api/transcribe`: MediaRecorder audio → Whisper on Groq → Italian text
  - Handle audio/webm (Chrome) and audio/mp4 (iPhone Safari); send the blob with a matching filename
  - Accept a `language` field: `it` for turns, `en` for "Come si dice?"
- [ ] `/api/translate`: "Come si dice?" (English → Italian)

**Frontend** (follow the [mockups](https://claude.ai/artifact/1zVpF11bWHivP3RxVruKyx))
- [ ] Oggi: suggestion tiles plus "cambia aria" and "vai dove vuoi" (placeholder colour tiles until photos exist)
- [ ] Conversazione: portrait area, transcript, quiet correction notes, big mic button, "Come si dice?", "Piano · Ripeti"
- [ ] Speech in: hold or tap the mic → `/api/transcribe` → text; fallback to typing if the mic is blocked
- [ ] Speech out: best available Italian browser voice; slow mode
- [ ] Simple SVG avatars for every character, with mood expressions
- [ ] Save progress and generated characters in localStorage

**Deploy and test**
- [ ] `git push origin main` → Railway; check HTTPS and the mic on iPhone Safari
- [ ] Safari Web Inspector for phone debugging; `railway logs` for API errors

**Done when:** on your phone, Claude suggests a day in Roma, you pick a place, talk with whoever is there, and what you say comes through as Italian.

## M2 — People who remember you

- [ ] Character memory and familiarity across days (sconosciuto → amico, Lei → tu)
- [ ] Day flow: suggestions → conversations → diario; "try tomorrow" goals feed the next day's suggestions
- [ ] Quaderno with last-used dates; stale words worked into suggestions
- [ ] Changing scenery: new neighbourhood, day trip, moving to a new city; people stay where you met them
- [ ] Viaggio and Tu screens
- [ ] Simulated-learner test (`npm run test:learner`) ([Testing → 4b](10-testing.md#4b-simulated-learner)); rerun after prompt changes
- [ ] Illustrated portraits for the anchors (see [Visuals](07-visuals.md)); generated people keep SVG avatars

**Done when:** you come back to the same bar on day 3 and the barista greets you by name and remembers your usual order, and the diario points out a mistake you made twice.

## M3 — Magda, levels and voices

- [ ] Magda: messages when mistakes pile up or a level step is near; weekly lesson; one-page summary for real lessons
- [ ] Level evidence and steps (A1 → A1+ → A2 …); harder situations and more dialect as you level up
- [ ] Hosted TTS (ElevenLabs or Azure) with distinct voices for the anchors and Magda
- [ ] Postcards and messages from people in cities you've left

## M4 — Accounts and costs

- [ ] Postgres + auth; progress syncs across devices
- [ ] Usage tracking and per-learner daily budgets

## Later

See [Ideas](ideas.md): reading moments at real landmarks, food culture conversations, animated clips for the core cast, Groundhog Day replays, other languages.

## Open questions

- Hosted voices: browser voices are free but robotic. When is it worth paying for better TTS?
- How much English should characters ever use? (Current answer: none, except in hints and side notes. Magda may explain in English.)
