# Architecture

The prototype runs inside a claude.ai artifact, where the microphone can be blocked and dictation tends to come through in English. The web app removes both problems: it runs on its own HTTPS domain, so it can record from the microphone, and it sends the audio to Whisper (hosted by Groq) with the language set to Italian.

## Stack (recommended)

| Part | Choice | Why |
|---|---|---|
| App | **Next.js** (App Router) + TypeScript | One project for UI and server routes; frontend and API together |
| Hosting | **Railway** | Auto-deploys from GitHub, integrated Postgres, environment variables for secrets, automatic HTTPS (required for microphone access) |
| Database | **Railway Postgres** from M1 (character memory) | Integrated with Railway hosting, easy provisioning. See "Where learner data lives" below |
| Claude | **Anthropic TypeScript SDK** (`@anthropic-ai/sdk`) in server routes only | The API key never reaches the browser |
| Speech in | **Whisper on Groq** (`whisper-large-v3-turbo`) from M1 | Browser STT transcribes Italian as English gibberish; Whisper locked to Italian solves this. Groq's free tier covers a prototype. See [Language Services](08-language-services.md) |
| Speech out | Browser **speechSynthesis** with an Italian voice (M1); **hosted TTS** (ElevenLabs or Azure) with distinct character voices (M3) | Character voices are a big part of the feel; browser voices first, upgrade in M3 |
| Storage | **Railway Postgres** for learner data from M1; localStorage only for per-device conveniences (debug mode) | Memory must survive and be visible to the server (decided 2026-10-10) |
| Auth | None for M1: an anonymous learner id in a server-set cookie. Email sign-in link later (M4) for other devices and recovery | |

## Request flow

```
Browser                               Server routes                            APIs
-------                               -------------                            ----
start of day                   ─────▶ /api/suggest  (the director)      ────▶ Claude
tap a tile / "vai dove vuoi"   ─────▶ /api/scene    (+ new character)   ────▶ Claude

mic → MediaRecorder → audio blob
                               ─────▶ /api/transcribe                   ────▶ Whisper (Groq)
                               ◀───── Italian transcript                ◀──── (audio → text)

transcript + scene + state     ─────▶ /api/turn
                                      build prompt layers
                                      (house rules, character, memory,
                                       scene, transcript)                ────▶ Claude
                                                                         ◀──── JSON turn output
                                      validate, update state
render reply, speechSynthesis  ◀───── turn output
```

End-of-day: `/api/diario` takes the day's transcripts and returns the diario, updated character memories, level evidence and any Magda message. `/api/magda` runs her lessons. See [Conversation engine](04-conversation-engine.md).

**M3 with hosted TTS:** `/api/turn` also generates TTS audio for the character's response and returns audio URL or streams bytes.

## Claude API usage

- **Models.** Use **Claude Opus 5.5** (`claude-opus-5-5`) as the default. In-scene turns are latency-sensitive (voice conversation), so run them at a **low effort** setting and stream. If replies still feel slow, test **Claude Haiku 5.5** (`claude-haiku-5-5`) on the in-scene route and compare quality before switching. The end-of-day diario is not latency-sensitive and can run at higher effort.
- **Reliable JSON.** Use **structured outputs**: define the turn schema (Zod) and call the SDK's `messages.parse()` with `output_config.format`, so responses are validated against the schema. Don't rely on "reply with only JSON" prompting as the prototype does.
- **Prompt caching.** Put the stable layers (house rules, character sheet) first and mark a cache breakpoint after them; the transcript and latest line go last. Check `usage.cache_read_input_tokens` to confirm hits.
- **Refusals and errors.** Check `stop_reason` before reading content. Retry transient errors once; if it still fails, tell the learner plainly what failed, with an error code, rather than an in-character "puoi ripetere?" that would hide the bug (decided 2026-10-11).
- Before writing the API code, check the current SDK docs for exact parameter names; these details change.

## Data model

The full TypeScript interfaces are in [Data model](09-data-model.md), which is the source of truth.

Hand-written content (city pantries, anchor characters, Magda, level rules) lives in the repo as TypeScript files under `content/it/`. Generated characters and scenes are learner data, stored with the learner's progress.

### Where learner data lives (decided 2026-10-10)

Learner data, starting with character memory in M1, lives in **Railway Postgres**, not on the phone. Reasons:

- **Safari erases site storage** (localStorage, IndexedDB) after about 7 days without a visit unless the site is added to the home screen. Characters would forget you after a short trip.
- **The server needs it.** Messages from characters (see `docs/ideas.md`) require the server to know who you've met and what you talked about.
- **It can be inspected.** Tests, debugging and both Claude sessions can see what a character remembers and why.
- **No migration later.** Starting on the phone would mean building storage twice and moving data between them.

**Identity in M1:** on first visit the server creates an anonymous learner id and sets it in an HTTP-only cookie. Server-set cookies are not subject to Safari's 7-day storage wipe. No login. Clearing Safari or switching phones starts fresh until email sign-in (M4).

**Minimal memory in M1:** when a conversation ends, Claude writes a few short notes about the learner (name, where they're from, what they ordered or planned, promises). Next time, those notes and the visit count go into that character's prompt. Tables and details: [Data model → Storage](09-data-model.md#storage-strategy).

## Suggested layout

```
app/
  page.tsx                 Oggi: today's suggestion tiles
  viaggio/page.tsx         cities
  play/[sceneId]/page.tsx  conversation screen
  diario/page.tsx
  tu/page.tsx              your journal
  api/suggest/route.ts     the director: today's suggestions
  api/scene/route.ts       scene (and new character) from a suggestion or free request
  api/transcribe/route.ts  audio → Whisper on Groq → Italian (or English for "Come si dice?")
  api/turn/route.ts
  api/translate/route.ts   "Come si dice?" English → Italian
  api/diario/route.ts      end of day: diario, memories, level evidence, Magda triggers
  api/magda/route.ts       tutor lessons
lib/
  claude.ts                SDK client, prompt builder, schemas
  speech.ts                MediaRecorder capture + speechSynthesis (M1) wrappers
  state.ts                 local state (M1), DB later
content/
  it/                      everything specific to Italian
    language.ts            language config (see below)
    levels/*.ts            CEFR steps (A1, A1+, A2…)
    cities/*.ts            pantry per city: neighbourhoods, places, food, customs
    characters/*.ts        anchors (Rita, Giulia) and Magda
    route.ts               suggested route (inspiration only)
prototype/index.html       the original artifact demo
```

## Keeping other languages possible

Fuori is Italian-only, but four cheap rules keep a second language from being a rewrite later:

1. **Language content in its own folder.** Everything Italian-specific lives under `content/it/`: city pantries, anchor characters, Magda, level rules.
2. **One language config.** `content/it/language.ts` holds the speech-to-text language code (`it`), TTS voice choices, which level rules file to use, the language's name for prompts ("Italian"), and the UI words ("Come si dice?", diario, quaderno, "Ascolto…").
3. **Nothing language-specific hard-coded.** Prompts and components read the language name, examples and UI words from the config. The house-rules prompt takes its forgiveness and correction examples ("bone journal" → buongiorno, *vorrei* vs *voglio*) from the config, not from the template.
4. **All model calls in one module.** Every Claude call goes through `lib/claude.ts`, so swapping or adding a model provider touches one place.

**Country packs (2026-10-12):** `content/index.ts` exports the active pack, chosen by the `COUNTRY` setting of each deployment; each pack (`content/<country>/pack.ts`) holds its language config, cities, anchors and voices. Code imports `@/content`, never a country folder.

**Enforced** by `npm run test:language` (2026-10-12): it fails when a language name, the bare code `'it'` or a locale code like `it-IT` appears in `app/` or `lib/` outside comments (the reply's `{ it, en }` field names are allowed), or when a prompt template in `content/*/prompts/` names the language instead of using `{language}`, or when code imports a country folder directly. `npm run test:pack` checks each pack is complete. Added after a Whisper hint in Italian slipped into `/api/transcribe` and was echoed into learners' lines.

**Related rule: don't build on predicting what people will say.** No phrase lists or keyword filters for what learners or characters say (or what Whisper invents); prefer signals that work in any language, such as recording length, silence, or a judge call that reads the whole conversation.

Not building: a language picker, translated UI, or a second language. See [Ideas](ideas.md#other-languages).

## Costs

At A1–A2, a turn is a few thousand input tokens (mostly cached) and a short output. A 20-minute day is roughly 30–50 turns plus one suggestion call, a few scene calls and one diario call. Measure real usage in M1 and set a per-day budget before inviting other players.

## Deployment (Railway)

**Why Railway:**
- Automatic HTTPS (required for browser microphone access)
- Integrated Postgres (used from M1 for learner data)
- Preview environments for feature branches
- Simple Git-based deploys
- Environment variables management

**M1 Setup:**

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize in project root
cd ~/fuori
railway init

# Link to GitHub repo (enables auto-deploys)
railway link

# Deploy
git push origin main
# Railway auto-deploys from main branch
```

**Environment variables:**

Set in Railway dashboard (Project → Variables):
- `ANTHROPIC_API_KEY` - Claude API for conversations
- `GROQ_API_KEY` - Whisper on Groq for speech-to-text
- (M3) `ELEVENLABS_API_KEY` or `AZURE_SPEECH_KEY` - for character TTS

Never commit `.env*` files; keep in `.gitignore`.

**Deployment workflow:**

```
Development:
├── Local: .env.local for secrets
├── Run: npm run dev
└── Test: http://localhost:3000

Production:
├── Push: git push origin main
├── Railway: auto-builds and deploys (~30 seconds)
├── URL: fuori.railway.app (automatic HTTPS)
└── Test on phone: open URL, test voice features

Preview branches:
├── Create: git checkout -b feature/new-character
├── Push: git push origin feature/new-character
├── Railway: creates fuori-pr-123.railway.app
└── Merge when tests pass
```

**Monitoring:**

```bash
# View logs
railway logs

# Check deployment status
railway status

# Open in browser
railway open
```

## Mobile Testing Strategy

Fuori is **mobile-first** - the primary experience is on a phone. Desktop is secondary.

**Primary target:** iPhone Safari (iOS 15+)
**Secondary target:** Chrome on Android

**Why mobile matters:**
- Voice is the primary interaction
- Browser microphone requires HTTPS (Railway provides this)
- Touch targets must be large enough
- Real-world testing catches audio issues

**Testing workflow:**

1. **Deploy to Railway** (from laptop)
   ```bash
   git add .
   git commit -m "Test new feature"
   git push
   # Wait 30 seconds
   ```

2. **Test on phone**
   - Open fuori.railway.app on phone
   - Test voice interaction end-to-end
   - Check console logs via remote debugging

3. **Debug remotely** (if issues found)

   **iOS Safari:**
   ```
   On iPhone:
   - Settings → Safari → Advanced → Web Inspector (enable)
   - Connect iPhone to Mac via USB

   On Mac:
   - Safari → Develop → [Your iPhone] → fuori.railway.app
   - See phone's console logs, network requests, errors
   ```

   **Chrome Android:**
   ```
   On phone:
   - Chrome → Settings → Developer options → USB debugging

   On laptop:
   - Open chrome://inspect
   - See phone's Chrome tabs
   - Click "inspect" to debug
   ```

4. **Check Railway logs** (for API errors)
   ```bash
   railway logs
   # See Whisper (Groq) / Claude API errors from phone requests
   ```

**Mobile-specific checks before M1 completion:**

- [ ] Mic permission prompt appears on first use
- [ ] Recording starts when mic button pressed
- [ ] Whisper returns Italian text (not English gibberish)
- [ ] Text-to-speech plays without buffering
- [ ] Touch targets are 44px minimum (mic button, "Come si dice?")
- [ ] Conversation log scrolls smoothly
- [ ] Text input fallback works if mic blocked
- [ ] Works in portrait orientation
- [ ] Works in landscape orientation
- [ ] App continues after phone lock/unlock
- [ ] Works on mobile data (not just WiFi)

**Add mobile logging:**

```typescript
// lib/mobile-logger.ts
export function logMobile(event: string, data: any = {}) {
  const log = {
    event,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    ...data,
  };

  console.log('[MOBILE]', log);

  // Also send critical events to server for debugging
  if (event.includes('error') || event.includes('failed')) {
    fetch('/api/log', {
      method: 'POST',
      body: JSON.stringify(log),
    }).catch(() => {}); // Don't let logging break the app
  }
}

// Usage in components
logMobile('mic-started');
logMobile('whisper-response', { text, latency: Date.now() - start });
logMobile('whisper-error', { error: error.message });
```

## Secrets

Environment variables:
- `ANTHROPIC_API_KEY` - Claude API for conversations
- `GROQ_API_KEY` - Whisper on Groq for speech-to-text
- (M3) `ELEVENLABS_API_KEY` or `AZURE_SPEECH_KEY` - for character TTS

Stored in:
- `.env.local` for local development
- Railway dashboard for production
- Never committed; `.env*` stays in `.gitignore`

## Language validation for Italian

Italian quality is checked automatically rather than by manual review (the creator is an A1–A2 learner):

1. **Level rules** (`content/it/levels/a1-a2.ts`), built once from CEFR descriptors, a frequency word list and typical A1–A2 grammar coverage. They feed the house-rules prompt layer.
2. **Simulated learner** (`npm run test:learner`, from M2): Claude plays beginners with typical mistakes and transcription noise; a judge call scores each conversation against the level rules and the expected behaviours.

Details in [Testing → Language validation](10-testing.md#4-language-validation-automated). If the reports show systematic problems: adjust the house rules or character sheets first, then try a higher effort setting, and only then consider another model.

See [Language Services](08-language-services.md) for more on STT/TTS choices and Italian-specific considerations.
