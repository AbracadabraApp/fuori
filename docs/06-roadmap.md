# Roadmap

Each milestone ends with something playable on your phone. There is no separate validation phase: the first real test is talking to a character in the app.

## M1 — Navigate cities and hold a conversation

**Goal:** open the app on your phone, browse Italian cities, select a place in Roma, and hold a spoken conversation that transcribes as Italian.

**Setup**
- [ ] Make `main` the GitHub default branch and work on it (Railway deploys from `main`)
- [x] `npx create-next-app@latest` in the repo root (TypeScript, App Router, ESLint); keep `prototype/` as is
- [x] API keys: Anthropic (have), Groq (free tier, for Whisper), xAI (for image generation). Put them in `.env.local` as `ANTHROPIC_API_KEY`, `GROQ_API_KEY`, and `XAI_API_KEY`
- [ ] Railway: `npm i -g @railway/cli`, `railway init`, link the GitHub repo, add the same variables in the dashboard

**Content**
- [ ] Level rules: have Claude build `content/it/levels/` (A1 and A2 steps) from CEFR descriptors, the *Profilo della lingua italiana*, De Mauro's *vocabolario di base* and typical A1–A2 grammar (see [Testing → 4a](10-testing.md#4a-level-rules-from-published-standards))
- [x] Roma pantry in `content/it/cities/roma.ts` and the two anchors (Rita, Giulia) from [Cities and people](03-journey.md)
- [x] `content/it/language.ts` (language name, speech code, UI words, prompt examples)
- [x] 20 city images: watercolor sketches with distinctive scenes showing life and activity

**Backend**
- [x] `/api/generate-image`: xAI Grok for watercolor city/place images
- [x] `/api/transcribe`: MediaRecorder audio → Whisper on Groq → Italian text (basic implementation)
  - Handles audio/webm (Chrome) and audio/mp4 (iPhone Safari)
  - Accepts `language` field: `it` for turns, `en` for "Come si dice?"
- [x] `/api/turn`: Claude conversation with character context (basic implementation, needs structured output with Zod)
- [ ] `/api/suggest`: the director's 3–4 suggestions plus "cambia aria" (deferred to M2)
- [ ] `/api/scene`: scene from a suggestion or a free request (deferred to M2)
- [ ] `/api/translate`: "Come si dice?" (English → Italian) (deferred to M2)

**Frontend** (adapted from [mockups](https://claude.ai/artifact/1zVpF11bWHivP3RxVruKyx))
- [x] **Cities feed**: scrolling cards (Polaroid-style) for 20 Italian cities with watercolor images
- [x] **Places feed**: shows places within selected city (only Roma has place data)
- [x] **Navigation**: Cities → Places → Conversation (Modified Option C)
- [x] **PlaceCard component**: square image on top, prominent city/place name below, region/neighborhood
- [x] **Settings UI**: gear icon in header, sheet with "Show transcripts" and "Allow dialect" toggles (UI only)
- [x] Conversazione: portrait area, mic button (from 2026-10-09 work, needs wiring to APIs)
- [ ] Speech in: hold or tap the mic → `/api/transcribe` → text (partially done, needs full integration)
- [ ] Speech out: best available Italian browser voice; slow mode
- [ ] Transcript display during conversation (when "Show transcripts" enabled)
- [ ] Simple SVG avatars for every character, with mood expressions
- [ ] Save progress and generated characters in localStorage
- [ ] Oggi: suggestion tiles plus "cambia aria" and "vai dove vuoi" (deferred to M2)

**Deploy and test**
- [ ] `git push origin main` → Railway; check HTTPS and the mic on iPhone Safari
- [ ] Safari Web Inspector for phone debugging; `railway logs` for API errors

**Done when:** on your phone, you can browse 20 Italian cities, select Roma, pick a place (Giulia's bar), and hold a voice conversation in Italian.

**Status:** City feed and navigation complete. Conversation engine built but needs wiring to the UI. Ready for deployment and phone testing.

## M2 — Daily suggestions and people who remember you

**Complete M1 conversation integration:**
- [ ] Wire ConversationScreen to `/api/transcribe` and `/api/turn`
- [ ] Implement "Show transcripts" toggle functionality
- [ ] Implement "Allow dialect" toggle functionality
- [ ] Add structured output (Zod schemas) to `/api/turn`
- [ ] Add place data for cities beyond Roma

**Suggestion system (originally planned for M1):**
- [ ] `/api/suggest`: the director's 3–4 suggestions plus "cambia aria"
- [ ] `/api/scene`: scene from a suggestion or a free request; generates and saves a new character
- [ ] Oggi screen with scrolling suggestion cards
- [ ] "Vai dove vuoi" free request flow

**Memory and progression:**
- [ ] Character memory and familiarity across days (sconosciuto → amico, Lei → tu)
- [ ] Day flow: suggestions → conversations → diario; "try tomorrow" goals feed the next day's suggestions
- [ ] Quaderno with last-used dates; stale words worked into suggestions
- [ ] Changing scenery: new neighbourhood, day trip, moving to a new city; people stay where you met them
- [ ] Viaggio and Tu screens
- [ ] Simulated-learner test (`npm run test:learner`) ([Testing → 4b](10-testing.md#4b-simulated-learner)); rerun after prompt changes
- [ ] Illustrated portraits for the anchors (see [Visuals](07-visuals.md)); generated people keep SVG avatars
- [ ] Save progress and generated characters in localStorage

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
