# Roadmap

Each milestone ends with something playable.

## M1 — Web app with Italian voice (first build session)

**Goal:** the prototype's four scenes running as a real web app, with speech recognition locked to Italian.

Checklist:
- [ ] `npx create-next-app@latest` in the repo root (TypeScript, App Router, ESLint); keep `prototype/` as is
- [ ] Get an Anthropic API key from the Console; put it in `.env.local` as `ANTHROPIC_API_KEY`
- [ ] `/api/turn` route: port the prototype's prompt into layered form ([conversation engine](04-conversation-engine.md)), structured JSON output with a Zod schema
- [ ] Conversation screen: port the prototype UI (scene picker, log, corrections, quaderno, goals)
- [ ] Speech in: `SpeechRecognition` with `lang = "it-IT"`, interim results into the input, auto-send on pause
- [ ] Speech out: pick the best available Italian voice; slow mode
- [ ] Persist progress in localStorage
- [ ] Deploy to Vercel, set the key in project settings, test on iPhone Safari and Mac Chrome

**Done when:** you can hold a spoken conversation in each of the four scenes on your phone, and what you say shows up in Italian.

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

**Done when:** on day 3 Giulia greets you by name and remembers your usual order, and the diario points out a mistake you made twice.

## M3 — Evening encounters and the first day trip

- [ ] Evening conversation engine: hidden agendas, soft arc, natural ending, diario note
- [ ] "Come si dice…?" help button
- [ ] Day 5: Orvieto day trip, including the train there and back
- [ ] A small set of saved test conversations to rerun when prompts change

## M4 — Real accounts and better voices

- [ ] Postgres + auth; progress syncs across devices
- [ ] Hosted text-to-speech with a distinct voice per character
- [ ] Hosted speech-to-text option for better accuracy and Firefox support
- [ ] Usage tracking and a per-learner daily budget

## M5 — The rest of the season

- [ ] Firenze, Siena, Bologna, Napoli content
- [ ] Encounter characters who reappear in later cities
- [ ] Level progression to B1

## Open questions

- Hosting voices: browser voices are free but robotic. When is it worth paying for better TTS?
- Should the learner be able to pick the route, or is the season fixed for the first version?
- How much English should characters ever use? (Current answer: none, except in hints and the side notes.)
