# Roadmap

Each milestone ends with something playable.

## Pre-M1 — Italian Language Validation

**Goal:** Validate that Claude, Whisper, and the conversation design work well for Italian before building.

Checklist:
- [ ] Test Claude Opus 5.5 with 20-30 Italian conversations
  - Note: the prototype runs on claude.ai's fast model tier, not on Opus 5.5 through the API. Use it for a feel of the design, but test the production model with a small script against the API (same prompt, `claude-opus-5-5`, low effort) before deciding
- [ ] Native Italian speaker (ideally A1-A2 teacher) reviews for naturalness, corrections, regional authenticity
- [ ] Test Whisper: record yourself saying 20 common Italian phrases, measure accuracy
- [ ] Measure Whisper latency (should be <2s for short phrases)
- [ ] Calculate realistic per-learner costs with actual usage
- [ ] Document any systematic Claude issues (e.g., error patterns, unnatural constructions)
- [ ] Decision: continue with Claude or test GPT-4o; continue with Whisper or try alternative
- [ ] Get OpenAI API key for Whisper (in addition to Anthropic key)

**Done when:** Native speaker confirms Italian is natural for A1-A2 level, Whisper accuracy is good for your voice, costs are acceptable, and you have both API keys ready.

## M1 — Web app with Italian voice (first build session)

**Goal:** the prototype's four scenes running as a real web app, with speech recognition locked to Italian.

Checklist:

**Setup:**
- [ ] `npx create-next-app@latest` in the repo root (TypeScript, App Router, ESLint); keep `prototype/` as is
- [ ] Install Railway CLI: `npm i -g @railway/cli`
- [ ] Initialize Railway: `railway init` and link to GitHub repo
- [ ] Set up environment variables in `.env.local`: `ANTHROPIC_API_KEY` and `OPENAI_API_KEY`
- [ ] Add same variables to Railway dashboard

**Backend:**
- [ ] `/api/transcribe` route: MediaRecorder audio blob → Whisper API → Italian text
  - Handle audio/webm (Chrome) and audio/mp4 (iPhone Safari); send the blob with a matching filename
  - Accept a `language` field: `it` for turns, `en` for "Come si dice?"
  - Return clear errors for debugging
- [ ] `/api/turn` route: port the prototype's prompt into layered form ([conversation engine](04-conversation-engine.md)), structured JSON output with Zod schema
  - Include new `confused` field in turn schema
  - Update prompts to reduce scaffolding (hints only when confused or requested)
- [ ] `/api/translate` route: for "Come si dice?" button (English → Italian)

**Frontend:**
- [ ] Conversation screen: port the prototype UI (scene picker, log, corrections, quaderno, goals)
  - Show hints only if `confused: true` OR user requested help
  - Hide "Understood as" unless significantly different (or remove entirely for cleaner immersion)
  - Touch targets 44px minimum for mobile
- [ ] Speech in: MediaRecorder → `/api/transcribe` → show Italian text in input field
  - Loading states: "Ascolto..." → "Trascrivo..." → result
  - Fallback to text input if mic blocked or API fails
  - Mobile logging for debugging
- [ ] "Come si dice?" button: speak English → quick translation → show Italian phrase to repeat
- [ ] Speech out: pick the best available Italian browser voices; slow mode control
- [ ] Persist progress in localStorage

**Deployment & Testing:**
- [ ] Make `main` the GitHub default branch and work on it (Railway deploys from `main`)
- [ ] Deploy to Railway: `git push origin main`
- [ ] Verify HTTPS works (required for microphone)
- [ ] Test on iPhone Safari: full voice conversation flow
- [ ] Set up remote debugging (Safari Web Inspector)
- [ ] Test on Mac Chrome: desktop experience
- [ ] Check Railway logs for API errors

**Done when:** you can hold a spoken conversation in each of the four scenes **on your phone**, what you say transcribes as Italian (not English gibberish), hints only appear when you're genuinely stuck, and touch targets are easy to hit with your thumb.

Optional: simple SVG avatars per character, with a few expressions driven by the `mood` field.

## M2 — Roma, days 1–4

- [ ] Content files for Roma: the cast of 8 and the 14 conversations in [the journey](03-journey.md)
- [ ] Day builder: Giulia every morning, rotating errands, a new evening character, at most four conversations a day
- [ ] Onboarding: name, where you're from, why Italy (spoken, to Rita on arrival)
- [ ] Day structure: colazione → errands → sera → diario, with a "today" screen
- [ ] Character memory across days (familiarity, remembered facts)
- [ ] Diario at the end of each day; "try tomorrow" goals fed into the next day's prompts
- [ ] Quaderno with last-used dates; recycle stale words into scenes
- [ ] Character portraits (see [Visuals](07-visuals.md)): SVG placeholders first, then generated portraits with moods
- [ ] Hosted TTS (ElevenLabs or Azure): generate 8 distinct character voices with different ages/genders/personalities
  - Pre-generate voice profiles, test with sample lines
  - Integrate server-side TTS generation
  - Cache common phrases to reduce costs

**Done when:** on day 3 Giulia greets you by name and remembers your usual order, the diario points out a mistake you made twice, and each character has a distinct voice.

## M3 — Evening encounters and the first day trip

- [ ] Evening conversation engine: hidden agendas, soft arc, natural ending, diario note
- [ ] Day 5: Orvieto day trip, including the train there and back
- [ ] A small set of saved test conversations to rerun when prompts change

## M4 — Real accounts and multi-device

- [ ] Postgres + auth; progress syncs across devices
- [ ] Usage tracking and per-learner daily budgets
- [ ] Cost monitoring dashboard
- [ ] Multi-device state synchronization

## M5 — The rest of the season

- [ ] Firenze, Siena, Bologna, Napoli content
- [ ] Encounter characters who reappear in later cities
- [ ] Level progression to B1

## Open questions

- Hosting voices: browser voices are free but robotic. When is it worth paying for better TTS?
- Should the learner be able to pick the route, or is the season fixed for the first version?
- How much English should characters ever use? (Current answer: none, except in hints and the side notes.)
