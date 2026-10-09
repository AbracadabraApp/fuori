# Architecture

The prototype runs inside a claude.ai artifact, where the microphone can be blocked and dictation tends to come through in English. The web app removes both problems: it runs on its own HTTPS domain, so it can record from the microphone, and it sends the audio to Whisper with the language set to Italian.

## Stack (recommended)

| Part | Choice | Why |
|---|---|---|
| App | **Next.js** (App Router) + TypeScript | One project for UI and server routes; frontend and API together |
| Hosting | **Railway** | Auto-deploys from GitHub, integrated Postgres, environment variables for secrets, automatic HTTPS (required for microphone access) |
| Database | **Railway Postgres** (M4) | Integrated with Railway hosting, easy provisioning |
| Claude | **Anthropic TypeScript SDK** (`@anthropic-ai/sdk`) in server routes only | The API key never reaches the browser |
| Speech in | **OpenAI Whisper API** (`whisper-1`) from M1 | Browser STT transcribes Italian as English gibberish; Whisper solves this. ~$0.12/day per learner. See [Language Services](08-language-services.md) |
| Speech out | Browser **speechSynthesis** with an Italian voice (M1); **hosted TTS** (ElevenLabs or Azure) with distinct character voices (M2) | Character voices are a big part of the feel; browser voices for M1, upgrade in M2 |
| Storage | **localStorage** (M1); **Railway Postgres** (M4) once memory and multi-device matter | Keep M1 simple |
| Auth | None for M1; add when there's more than one player (M4) | |

## Request flow

```
Browser                               Server routes                            APIs
-------                               -------------                            ----
mic → MediaRecorder → audio blob
                               ─────▶ /api/transcribe                   ────▶ Whisper
                               ◀───── Italian transcript                ◀──── (audio → text)

transcript + scene + state     ─────▶ /api/turn
                                      build prompt layers
                                      (house rules, character, memory,
                                       scene, transcript)                ────▶ Claude
                                                                         ◀──── JSON turn output
                                      validate, update state
render reply, speechSynthesis  ◀───── turn output
```

End-of-day: `/api/diario` takes the day's transcripts and returns the diario plus updated character memories.

**M2 with hosted TTS:** `/api/turn` also generates TTS audio for the character's response and returns audio URL or streams bytes.

## Claude API usage

- **Models.** Use **Claude Opus 5.5** (`claude-opus-5-5`) as the default. In-scene turns are latency-sensitive (voice conversation), so run them at a **low effort** setting and stream. If replies still feel slow, test **Claude Haiku 5.5** (`claude-haiku-5-5`) on the in-scene route and compare quality before switching. The end-of-day diario is not latency-sensitive and can run at higher effort.
- **Reliable JSON.** Use **structured outputs**: define the turn schema (Zod) and call the SDK's `messages.parse()` with `output_config.format`, so responses are validated against the schema. Don't rely on "reply with only JSON" prompting as the prototype does.
- **Prompt caching.** Put the stable layers (house rules, character sheet) first and mark a cache breakpoint after them; the transcript and latest line go last. Check `usage.cache_read_input_tokens` to confirm hits.
- **Refusals and errors.** Check `stop_reason` before reading content, and handle rate limits and transient errors with a friendly in-character fallback ("Scusa, non ho capito, puoi ripetere?").
- Before writing the API code, check the current SDK docs for exact parameter names; these details change.

## Data model

The full TypeScript interfaces are in [Data model](09-data-model.md), which is the source of truth.

Static content (characters, places, scenes, the route) lives in the repo as TypeScript or JSON files under `content/`, so it's versioned and easy to edit.

## Suggested layout

```
app/
  page.tsx                 journey map / today
  play/[sceneId]/page.tsx  conversation screen
  diario/page.tsx
  api/transcribe/route.ts  audio → Whisper → Italian (or English for "Come si dice?")
  api/turn/route.ts
  api/translate/route.ts   "Come si dice?" English → Italian
  api/diario/route.ts
lib/
  claude.ts                SDK client, prompt builder, schemas
  speech.ts                MediaRecorder capture + speechSynthesis (M1) wrappers
  state.ts                 local state (M1), DB later
content/
  characters/*.ts
  scenes/roma/*.ts
  route.ts
prototype/index.html       the original artifact demo
```

## Costs

At A1–A2, a turn is a few thousand input tokens (mostly cached) and a short output. A 20-minute day is roughly 30–50 turns plus one diario call. Measure real usage in M1 and set a per-day budget before inviting other players.

## Deployment (Railway)

**Why Railway:**
- Automatic HTTPS (required for browser microphone access)
- Integrated Postgres for M4
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
- `OPENAI_API_KEY` - Whisper for speech-to-text
- (M2) `ELEVENLABS_API_KEY` or `AZURE_SPEECH_KEY` - for character TTS

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
   # See Whisper/Claude API errors from phone requests
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
- `OPENAI_API_KEY` - Whisper for speech-to-text
- (M2) `ELEVENLABS_API_KEY` or `AZURE_SPEECH_KEY` - for character TTS

Stored in:
- `.env.local` for local development
- Railway dashboard for production
- Never committed; `.env*` stays in `.gitignore`

## Language validation for Italian

Italian quality is checked automatically rather than by manual review (the creator is an A1–A2 learner):

1. **Level rules** (`content/levels/a1-a2.ts`), built once from CEFR descriptors, a frequency word list and typical A1–A2 grammar coverage. They feed the house-rules prompt layer.
2. **Simulated learner** (`npm run test:learner`, from M2): Claude plays beginners with typical mistakes and transcription noise; a judge call scores each conversation against the level rules and the expected behaviours.

Details in [Testing → Language validation](10-testing.md#4-language-validation-automated). If the reports show systematic problems: adjust the house rules or character sheets first, then try a higher effort setting, and only then consider another model.

See [Language Services](08-language-services.md) for more on STT/TTS choices and Italian-specific considerations.
