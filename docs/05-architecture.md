# Architecture

The prototype runs inside a claude.ai artifact, where the microphone can be blocked and dictation tends to come through in English. The web app removes both problems by running on its own domain, where the browser can listen with speech recognition locked to Italian.

## Stack (recommended)

| Part | Choice | Why |
|---|---|---|
| App | **Next.js** (App Router) + TypeScript | One project for UI and server routes; deploys to Vercel in minutes |
| Hosting | **Vercel** (free tier to start) | Zero-config deploys from GitHub, environment variables for secrets |
| Claude | **Anthropic TypeScript SDK** (`@anthropic-ai/sdk`) in server routes only | The API key never reaches the browser |
| Speech in | Browser **Web Speech API**, `lang = "it-IT"` (M1); a hosted speech-to-text service with Italian locked (later) | Free and instant to start; upgrade when accuracy or Firefox support matters |
| Speech out | Browser **speechSynthesis** with an Italian voice (M1); a hosted text-to-speech service with distinct voices per character (later) | Character voices are a big part of the feel, but not needed on day one |
| Storage | **localStorage** (M1); **Postgres** (e.g. Supabase or Neon) once memory and multi-device matter | Keep M1 simple |
| Auth | None for M1; Supabase Auth or similar when there's more than one player | |

## Request flow

```
Browser                               Server route (/api/turn)                 Claude API
-------                               ------------------------                 ----------
mic → SpeechRecognition(it-IT)
transcript + scene id + state  ─────▶ build prompt layers
                                      (house rules, character, memory,
                                       scene, transcript)                ────▶ messages.create / parse
                                                                         ◀──── JSON turn output
                                      validate, update state
render reply, speechSynthesis  ◀───── turn output
```

End-of-day: `/api/diario` takes the day's transcripts and returns the diario plus updated character memories.

## Claude API usage

- **Models.** Use **Claude Opus 5.5** (`claude-opus-5-5`) as the default. In-scene turns are latency-sensitive (voice conversation), so run them at a **low effort** setting and stream. If replies still feel slow, test **Claude Haiku 5.5** (`claude-haiku-5-5`) on the in-scene route and compare quality before switching. The end-of-day diario is not latency-sensitive and can run at higher effort.
- **Reliable JSON.** Use **structured outputs**: define the turn schema (Zod) and call the SDK's `messages.parse()` with `output_config.format`, so responses are validated against the schema. Don't rely on "reply with only JSON" prompting as the prototype does.
- **Prompt caching.** Put the stable layers (house rules, character sheet) first and mark a cache breakpoint after them; the transcript and latest line go last. Check `usage.cache_read_input_tokens` to confirm hits.
- **Refusals and errors.** Check `stop_reason` before reading content, and handle rate limits and transient errors with a friendly in-character fallback ("Scusa, non ho capito, puoi ripetere?").
- Before writing the API code, check the current SDK docs for exact parameter names; these details change.

## Data model (sketch)

```ts
Learner        { id, name, homeTown, whyItaly, level, settings }
Journey        { learnerId, day, location, stayId }
Character      { id, name, sheet, city, recurring }        // static content
Relationship   { learnerId, characterId, familiarity, memory: string[] }
Scene          { id, characterId, type: "errand"|"task"|"encounter", goal?: string[] }
SceneRun       { id, learnerId, sceneId, day, transcript, stepsDone, corrections }
Word           { learnerId, it, en, firstSeen, lastUsed, timesUsed }
Mistake        { learnerId, pattern, example, count, lastSeen }
Diario         { learnerId, day, summary, corrections, newWords, tryTomorrow }
```

Static content (characters, places, scenes, the route) lives in the repo as TypeScript or JSON files under `content/`, so it's versioned and easy to edit.

## Suggested layout

```
app/
  page.tsx                 journey map / today
  play/[sceneId]/page.tsx  conversation screen
  diario/page.tsx
  api/turn/route.ts
  api/diario/route.ts
lib/
  claude.ts                SDK client, prompt builder, schemas
  speech.ts                recognition + synthesis wrappers
  state.ts                 local state (M1), DB later
content/
  characters/*.ts
  scenes/roma/*.ts
  route.ts
prototype/index.html       the original artifact demo
```

## Costs

At A1–A2, a turn is a few thousand input tokens (mostly cached) and a short output. A 20-minute day is roughly 30–50 turns plus one diario call. Measure real usage in M1 and set a per-day budget before inviting other players.

## Secrets

- `ANTHROPIC_API_KEY` set in `.env.local` locally and in Vercel project settings. Never committed; `.env*` stays in `.gitignore`.
