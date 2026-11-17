# Architecture

The prototype runs inside a claude.ai artifact, where the microphone can be blocked and dictation tends to come through in English. The game removes both problems: it records from the microphone itself and sends the audio to Whisper (hosted by Groq) with the language set to the one being learned. The game was first a web app; it is now the native iPhone app in `ios/` (plan in [Native app](12-native-app.md)), and the website is switched off (Josh, 2026-10-26): `proxy.ts` answers 404 to everything but `/v1` (the app), `/api/admin` and `/healthz`. The web code stays in the repo, unused.

## Stack

| Part | Choice | Why |
|---|---|---|
| App | **Native iPhone app** (SwiftUI, iOS 26) in `ios/`, one app for every country | See [Native app](12-native-app.md) |
| Server | **Next.js** (App Router) + TypeScript; the app calls the `/v1` routes | One project for server routes (and the switched-off web UI) |
| Hosting | **Railway**: two services from one codebase, Fuori (`COUNTRY=it`) and Afuera (`COUNTRY=es-mx`), deployed from the `live` branch | Deploys from GitHub, integrated Postgres, environment variables for secrets, automatic HTTPS |
| Database | **Railway Postgres**, one database shared by both countries | Integrated with Railway hosting, easy provisioning. See "Where learner data lives" below |
| Claude | **Anthropic TypeScript SDK** (`@anthropic-ai/sdk`) on the server only, all calls through `lib/claude.ts` | The API key never reaches the app |
| Speech in | **Whisper on Groq** (`whisper-large-v3-turbo`) through `/v1/transcribe` | Browser STT transcribes Italian as English gibberish; Whisper locked to the language solves this. Groq's free tier covers a prototype. See [Language Services](08-language-services.md) |
| Speech out | **ElevenLabs** through `/v1/speak`, a voice per character; the phone's own voice (`AVSpeechSynthesizer`) when it fails | Character voices are a big part of the feel |
| Storage | **Railway Postgres** for learner data; the app's own settings stay on the phone | Memory must survive and be visible to the server (decided 2026-10-10) |
| Images | **Cloudflare R2** (`fuori-images` bucket), addresses served in `/v1/content` | The JPEG masters are in R2 at `masters/`, not in git |
| Auth | No sign-in: `/v1/auth/device` makes a learner and a bearer token for the device, kept in the Keychain, one per country's server. Email sign-in was cut ([Native app](12-native-app.md) decision 3) | |

## Request flow

What the iPhone app calls today (all `/v1`, signed in with the device's bearer token except `/v1/content` and `/v1/auth/device`):

```
App                                   Server routes                            APIs
---                                   -------------                            ----
first launch                   ─────▶ /v1/auth/device  (learner + token)
open the app                   ─────▶ /v1/content      (cities, places, people, words, image addresses)
                               ─────▶ /v1/me           (level, visit stamps, onboarding done?)
open a place                   ─────▶ /v1/turn         (no conversationId: the opening line) ────▶ Claude

mic → recording (m4a)
                               ─────▶ /v1/transcribe                    ────▶ Whisper (Groq)
                               ◀───── transcript                        ◀──── (audio → text)

transcript + conversationId    ─────▶ /v1/turn
                                      build the prompt (lib/turn.ts,
                                       content/<country>/prompts/,
                                       memory, the conversation so far) ────▶ Claude
                                                                         ◀──── { line, en, … }
                                      save the turn
line + characterId             ─────▶ /v1/speak                         ────▶ ElevenLabs
play the voice                 ◀───── audio/mpeg (or an error: the phone's own voice)

leave                          ─────▶ /v1/conversations/{id}/end
                                      character notes, learning notes,
                                      Magda's study file, the record     ────▶ Claude
```

Also: `/v1/replies` and `/v1/say-it` (scaffolding and "How do I say it"), `/v1/level-up`, `/v1/learn`, `/v1/learn/home` and `/v1/lesson/start` (Learn and Magda's lessons, whose turns go through `/v1/turn`), `/v1/onboarding/*`, `/v1/me/*` (settings), `/v1/rate` (the debug panel), `/v1/log` (errors), `/v1/cinema`. `/api/admin/conversations` is for tools (admin key). The web's `/api/turn`, `/api/transcribe`, `/api/speak`, `/api/conversation/end`, `/api/visits` and `/api/log` remain in the repo behind `proxy.ts`.

Not built: the director (`/api/suggest`, the day's suggestions), `/api/scene` (scenes and new characters from a suggestion), the end-of-day diario (`/api/diario`) and `/api/magda`. See [Conversation engine](archive/04-conversation-engine.md) for the original design.

## Claude API usage

- **Models.** Model ids live only in `lib/claude.ts`: `CLAUDE_MODEL` (overridable by the variable of the same name) for everything, and `TURN_MODEL` for the characters' replies (defaults to `CLAUDE_MODEL`; set it in a test to try a faster model without changing the judge). Turns are latency-sensitive (voice conversation), so they stream (`lib/turn.ts`) with thinking off (`noThinkingFor`).
- **Reliable JSON.** Use **structured outputs**: each call passes a JSON schema in `output_config.format` (the schemas are in `lib/prompts/*-output-schema.ts`). Don't rely on "reply with only JSON" prompting as the prototype does.
- **Prompt caching.** Put the stable layers (house rules, character sheet) first and mark a cache breakpoint after them; the transcript and latest line go last. Check `usage.cache_read_input_tokens` to confirm hits. (No call sets a cache breakpoint today.)
- **Refusals and errors.** Check `stop_reason` before reading content. Retry transient errors once; if it still fails, tell the learner plainly what failed, with an error code, rather than an in-character "puoi ripetere?" that would hide the bug (decided 2026-10-11).
- Before writing the API code, check the current SDK docs for exact parameter names; these details change.

## Data model

The full TypeScript interfaces are in [Data model](09-data-model.md), which is the source of truth.

Hand-written content (city pantries, Magda, level rules, prompts, idioms) lives in the repo as TypeScript, JSON and Markdown files under `content/<country>/` (`content/it/`, `content/es-mx/`). Generated characters and scenes are learner data, stored with the learner's progress.

### Where learner data lives (decided 2026-10-10)

Learner data, starting with character memory in M1, lives in **Railway Postgres**, not on the phone. Reasons (written for the web app):

- **Safari erases site storage** (localStorage, IndexedDB) after about 7 days without a visit unless the site is added to the home screen. Characters would forget you after a short trip.
- **The server needs it.** Messages from characters (see `docs/ideas.md`) require the server to know who you've met and what you talked about.
- **It can be inspected.** Tests, debugging and both Claude sessions can see what a character remembers and why.
- **No migration later.** Starting on the phone would mean building storage twice and moving data between them.

**Identity:** on first launch the app calls `/v1/auth/device`, which creates a learner and a bearer token; the app keeps the token in the Keychain, one per country's server, so each country has its own learner. The server keeps only a hash of the token (`learner_tokens`). No login; a new phone starts fresh. (The web used an anonymous learner id in an HTTP-only cookie.)

**Minimal memory in M1:** when a conversation ends, Claude writes a few short notes about the learner (name, where they're from, what they ordered or planned, promises). Next time, those notes and the visit count go into that character's prompt. Tables and details: [Data model → Storage](09-data-model.md#storage-strategy).

## Layout

```
ios/                       the iPhone app (SwiftUI; FuoriKit holds the features)
app/
  v1/                      the app's API: auth, content, turn, transcribe, speak,
                           conversations/[id]/end, replies, say-it, level-up, learn,
                           lesson, onboarding, me, rate, log, cinema
  api/admin/               tools (admin key)
  api/…, page.tsx          the switched-off website and its routes
  healthz/                 Railway's check
proxy.ts                   what the server answers (the website is off)
lib/
  claude.ts                the Anthropic client and the model ids
  turn.ts, beginner.ts     a character's reply; the Beginner turn
  prompts/                 prompt builders and output schemas
  speech/, voice/          Whisper on Groq; ElevenLabs and the fallback voice
  remember.ts, memory.ts   what's written when a conversation ends
  db.ts                    Postgres
content/
  index.ts                 the active country pack (COUNTRY)
  it/, es-mx/              everything specific to a country
    pack.ts                the pack: language, cities, Magda, voices
    language.ts            language config (see below)
    cities/*.ts            pantry per city: neighbourhoods, places, people, food, customs
    characters/magda.ts    Magda (everyone else is in the city files)
    prompts/*.md           the prompts (character.md and the rest), changelogs in prompts/changelog/
    levels/*.ts            CEFR steps (A1, A1+, A2…; Italy only, not used yet)
scripts/                   db-migrate, release, smoke-live, images, voices…
prototype/index.html       the original artifact demo
```

## Keeping other languages possible

Fuori started Italian-only; four cheap rules kept a second language from being a rewrite, and Mexico (`es-mx`) was added as a second country pack:

1. **Language content in its own folder.** Everything country-specific lives under `content/<country>/` (`content/it/`, `content/es-mx/`): city pantries, Magda, prompts, level rules.
2. **One language config.** `content/<country>/language.ts` holds the speech-to-text language code (`it`), TTS voice choices, which level rules file to use, the language's name for prompts ("Italian"), and the UI words ("Come si dice?", diario, quaderno, "Ascolto…").
3. **Nothing language-specific hard-coded.** Prompts and components read the language name, examples and UI words from the config. The house-rules prompt takes its forgiveness and correction examples ("bone journal" → buongiorno, *vorrei* vs *voglio*) from the config, not from the template.
4. **All model calls in one module.** Every Claude call goes through `lib/claude.ts`, so swapping or adding a model provider touches one place.

**Country packs (2026-10-12):** `content/index.ts` exports the active pack, chosen by the `COUNTRY` setting of each deployment; each pack (`content/<country>/pack.ts`) holds its language config, cities, Magda and voices. Code imports `@/content`, never a country folder.

**Enforced** by `npm run test:language` (2026-10-12): it fails when a language name, the bare code `'it'` or a locale code like `it-IT` appears in `app/` or `lib/` outside comments, or when a prompt template in `content/*/prompts/` names the language instead of using `{language}`, or when code imports a country folder directly. `npm run test:pack` checks each pack is complete. Added after a Whisper hint in Italian slipped into `/api/transcribe` (the web route) and was echoed into learners' lines.

**Related rule: don't build on predicting what people will say.** No phrase lists or keyword filters for what learners or characters say (or what Whisper invents); prefer signals that work in any language, such as recording length, silence, or a judge call that reads the whole conversation.

Not building: a language picker or translated UI. See [Ideas](ideas.md#other-languages).

## Costs

At A1–A2, a turn is a few thousand input tokens (mostly cached) and a short output. A 20-minute day is roughly 30–50 turns plus one suggestion call, a few scene calls and one diario call. Measure real usage in M1 and set a per-day budget before inviting other players.

## Deployment (Railway)

**Why Railway:**
- Automatic HTTPS
- Integrated Postgres (used from M1 for learner data)
- Simple Git-based deploys
- Environment variables management

**Two services** from one repo: Fuori (`COUNTRY=it`, `fuori-production.up.railway.app`) and Afuera (`COUNTRY=es-mx`, `afuera-production.up.railway.app`), sharing one Postgres. Railway deploys the **`live` branch**, not `main` (Josh, 2026-11-06). Sessions push to `main` freely; `npm run release` (from `~/fuori`, which is linked to Railway) moves `live` to `main`, waits for both services if anything Railway builds changed, and runs `smoke:live` in both countries. Railway's watch patterns skip `ios/`, `docs/`, `design/`, `sketches/`, `tests/`, `.github/` and top-level `.md` files. When to release: CLAUDE.md → Definition of done.

**Environment variables:** see [Secrets](#secrets).

**Workflow:**

```
Development:
├── Local: .env.local for secrets
├── Run: npm run dev (or npm run dev:sim for the simulator)
└── The app: point it at a local server with -FuoriServer

Production:
├── Push: git push origin main (deploys nothing)
├── Release: npm run release (moves live to main, waits, smoke:live in both countries)
└── Check: railway logs for errors from the new code
```

**Monitoring:**

```bash
railway logs        # server log
railway status      # deployment status
npm run deploy:wait # wait for a deploy
```

## Testing on the phone

The game is the native iPhone app; the web's mobile Safari checks, remote Web Inspector and `lib/mobile-logger.ts` plan went with the website. How the app is tested (builds, CI, Josh's iPhone, when to use the simulator): CLAUDE.md → iPhone app, and [Native app](12-native-app.md). Errors from the app go to `/v1/log` and are kept in the `app_errors` table.

**One screen shape (Josh, 2026-10-13):** design and check layouts at the modern iPhone shape only (iPhone X and newer, e.g. 390 × 844). Older short screens (iPhone SE, 6–8) aren't a target; layouts should degrade gracefully there, not get their own design.

## Secrets

Environment variables:
- `ANTHROPIC_API_KEY` - Claude
- `GROQ_API_KEY` - Whisper on Groq for speech-to-text
- `ELEVENLABS_API_KEY` - character voices (`/v1/speak`)
- `DATABASE_URL` - Postgres
- `ADMIN_KEY` - `/api/admin`
- `COUNTRY` - which country pack the service serves (`it`, `es-mx`)
- `R2_*` - only for the image scripts (`npm run images:upload`), not the server

Stored in:
- `.env.local` for local development
- Railway dashboard for production
- Never committed; `.env*` stays in `.gitignore`

## Language validation for Italian

Language quality is judged by Josh's play: counts on real or replayed turns show direction, his ear decides (CLAUDE.md → Testing, 2026-11-16). The tools for counting:

1. **Level rules** (`content/it/levels/`: `a1.ts`, `a1plus.ts`, `a2.ts`, `a2plus.ts`, `b1.ts`), built once from CEFR descriptors, a frequency word list and typical grammar coverage. No code reads them today.
2. **Replay and simulated learners:** `npm run test:replay` (Josh's real lines against a prompt, scored by the same scorer as live conversations, `lib/quality.ts`) and `npm run test:conversations` (scripted learners against the real turn code). Both read side by side for direction, never as a gate.

How testing works now: [Testing](10-testing.md#how-testing-works-now-2026-11-16).

See [Language Services](08-language-services.md) for more on STT/TTS choices and Italian-specific considerations.
