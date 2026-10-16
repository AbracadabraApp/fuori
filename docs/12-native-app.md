# Native iPhone app: plan

Status: **decisions 1–6, 8 and 9 made** (Josh, 2026-10-15); 7 open. See [Decisions](#decisions). Josh decided to move Fuori to a native Swift app, built in Xcode with MCP. HTML stays for prototyping, but the web app will not be maintained. This plan was put together from three reviews of the repo: an iOS architect, a service architect and a migration planner. Where they disagreed, the disagreement is listed under [Decisions](#decisions).

## Summary

- **The server stays, and the web UI goes.** `lib/`, `content/`, prompts, Postgres and the `app/api/**` routes on Railway are the backend for the app. Keep Next.js, used only for its API routes. It's small (8 routes, about 535 lines; the logic is in `lib/`), and all 25 `test:*` scripts keep working. Move to Hono later only if Next gets in the way.
- **The client sends ids, and the server looks up the content.** Today the browser sends the whole `CharacterSheet` and builds the station clerk's setting itself (`app/api/turn/route.ts`, `app/page.tsx`). A public API can't trust that. Fixing it is the first server job.
- **SwiftUI app in `ios/` in this repo**, on `main`, with the same rules and the same `progress.md`.
- **Build order:** N0 contract and skeleton → N1 one conversation on the phone (the biggest step: audio) → N2 feeds, Magda and stamps → N3 parity (stations, settings, Mexico) → N4 TestFlight → N5 web sunset.
- **M3 language-level work continues on the server alongside**: prompt tier, measurement, profile, Magda. All M3 *web UI* work stops. Onboarding, the ladder, stamps and the city picker get built only in Swift.

## What the web app does today

| Feature | Today | Port |
|---|---|---|
| City feed (Polaroid cards, "Mostra altro", hidden filter) | `app/page.tsx`, `PlaceCard`, `ShowMore` | Must |
| Places feed (feed order, 10 places) | `lib/places/feed-order.ts` | Must |
| Conversation: record, level meter, Whisper, `{ line, en }`, ElevenLabs + fallback voice, subtitle reveal, retry once, E-codes to `/api/log` | `ConversationScreen.tsx` (794 lines), `lib/speech/*` | Must (core) |
| Save on leave (`lib/conversation/leave.ts`, sendBeacon → `/api/conversation/end`): memory, learning notes, study file | | Must. This is the connection that broke in M2. |
| Magda at the school | server + same screen | Must |
| Visit stamps | `/api/visits`, PlaceCard | Must, as the M3 redesign rather than today's circles |
| Settings (transcripts, English → speed, dialect) | settings sheet, `SettingsButton` | Must, saved on the server (today they reset on reload) |
| Stations: board, ticket, clerk knows the platform, "Sali" | `CityPicker`, `Ticket`, `lib/travel/departure.ts` | Must (the only way to change city) |
| Debug mode (`?debug=1`) | ConversationScreen | Must, as a hidden settings switch |
| Study export, admin transcripts/scorecard | admin routes | Stay on the server; not in the app |
| `/api/generate-image` | open xAI proxy, no auth | **Delete** (cost hole); images stay an offline script |

Safari workarounds that disappear on iOS: the silent-WAV audio unlock, `MediaRecorder` format guessing and the `audio-file.ts` extension fix, a fresh `AudioContext` per recording, `sendBeacon`, the cookie kept server-side because Safari wipes storage after about 7 days, and `onboundary` guessing.

## iOS client

**Stack:** SwiftUI + Observation (`@Observable`). iOS 26 minimum (decision 8). No third-party runtime dependencies; `swift-snapshot-testing` only as a test dependency.

```
ios/
  project.yml              XcodeGen; *.xcodeproj is git-ignored
  Makefile                 build, test, run-sim, shots, smoke-sim
  App/                     @main, dependency setup, root navigation
  Packages/
    FuoriCore/             Codable models, LanguagePack, Settings (no Apple-only imports → swift test on Linux)
    FuoriNetworking/       APIClient (URLSession async/await), error codes, retry once, /api/log reporter
    FuoriAudio/            AudioCoordinator, Recorder, VoiceGate, Player, SpeechFallback
    FuoriDesign/           Tokens.swift (generated), PolaroidCard, shared components
    FuoriFeatures/         CityFeed, PlaceFeed, Conversation, Station, Magda, Settings, Onboarding
```

- **Navigation:** one `NavigationStack` with a typed `Route` enum. Settings is a sheet, opened from the top-right button on every screen. Onboarding is a full-screen cover. Use one `@Observable` view model per screen; no TCA, coordinators or Combine.
- **On the device:** settings cache (`UserDefaults`; the server holds the real copy), the learner token (Keychain), the language pack JSON and images (disk cache). Everything else stays on the server. The app needs a network connection, as today.
- **Strings:** English UI text goes in a String Catalog. Words in the target language ("Binario", "Sali", "Mostra altro") come from the pack JSON (`language.ui`) and are never Swift literals. Extend `test:language` to scan `ios/**/*.swift` (it already missed "Start conversation" on the web).

### Audio pipeline

- **Session:** `.playAndRecord` with `.defaultToSpeaker` and `.allowBluetooth`. Turn it on when a conversation starts and off when it ends. Try `.default` mode first for TTS quality and switch to `.voiceChat` (echo cancellation) only if echo is a problem. Decide on a real device.
- **Recording:** `AVAudioEngine` input tap → 16 kHz mono → AAC `speech.m4a`. One code path feeds both the voice gate and the file.
- **Voice gate (M3 item 5), works in any language:** measure energy (RMS in dBFS) against a noise floor taken from the first 300 ms. Trim silence from both ends and keep 200 ms of padding. If there's less than about 250 ms of voice, don't upload. That means no Groq charge and no Whisper inventions on silence. Send the voiced milliseconds as a header. Add Apple's `SoundAnalysis` only if fans or traffic get through.
- **Tap to talk by default, hands-free as a setting (decision 4, revised by Josh 2026-10-15 after trying it).** The character always speaks by himself. Default: the pill turns into a mic when it's the learner's turn; tap to start, tap again when done (no silence timer; a turn is capped at 90 s). Settings → Hands-free (off by default) runs the conversation like a call, as below.
  1. Entering a place starts the conversation, and the character greets you.
  2. When the character finishes, the mic opens and the screen shows it's your turn. **The mic is closed while the character speaks**, so the phone never hears the character through its own speaker. A tap stops the character and opens your turn. Interrupting by voice would need Apple's echo cancellation (`setVoiceProcessingEnabled`); try that later, behind a setting.
  3. **Waiting for your first word: 10 s, for every level** (Josh, 2026-10-15). If nothing comes, the conversation pauses (mic off, tap to continue). That saves cost and avoids Whisper inventing words from silence.
  4. **Once you've spoken, the turn ends after 4 s of silence, the same starting wait for every level** (Josh, 2026-10-15; earlier 4–5 s, and 2 s cuts off a learner who's thinking of more to say). The level doesn't set the wait; the learner's own pauses and cut-offs do (6 and 7). A ring fills during the silence, and any sound resets it. A tap ends the turn at once.
  5. **The reply is prepared during the wait.** After about 1.5 s of silence the app uploads the voiced audio, transcribes it and asks for the reply in the background. If you speak again, that draft is thrown away and recording continues. If the silence holds, the reply plays as the ring completes, so the long wait doesn't add processing time on top. Wasted calls are logged, so their cost can be measured.
  6. **The wait adapts to the learner.** Measure the pauses inside a learner's turns (silences after which they kept talking) and set the wait just above their typical thinking pause, within limits, starting from 4 s. That's timing, not words, so it works in any language.
  7. **Cut-offs: adapt and count** (Josh, 2026-10-15). A cut-off is the learner starting to speak again within about 1.5 s after their turn ended: they weren't finished. The app then lengthens that learner's wait (e.g. +0.5 s, up to about 8 s; there's no "more time to answer" setting, Josh 2026-10-16) and reports it with the turn, so the server can show cut-offs per learner and per level in the scorecard and the numbers can be tuned. Timing only, so it works in any language. The speech that came after the cut-off is kept and joins the next turn, never thrown away.
  7. **Noisy places:** the voice detector re-measures the room's noise at the start of each turn. If cafés still trip it, add `SoundAnalysis` speech detection.
  8. **The English translation never shows until the character has finished speaking** (Josh, 2026-10-15), however early it arrives; the line itself types out in step with the voice.
  9. Asking in English ("Come si dice?") has a button on the web. Hands-free, Whisper's language detection could notice English on its own; decide in N1.
- **Playback:** download, then `AVAudioPlayer`. Replies are short, and you get the exact duration for the subtitle reveal. Stream only if measurements show it's needed. Fallback voice: `AVSpeechSynthesizer` with the pack's speech code and the best-quality voice, picked consistently from the character id. Show the fallback honestly with its E-code.
- **Interruptions:** recording stops all playback first (barge-in). On a call or Siri, stop everything and don't resume. If AirPods are removed, stop playback; never switch to the speaker. If the route changes mid-recording, rebuild the converter. Test Whisper accuracy with the AirPods microphone early. No background audio: silence when `scenePhase != .active`.
- **Saving on leave:** every exit (back, station, going to the background) goes through one `leaveConversation()`. It calls `POST …/end` inside `beginBackgroundTask`. If that fails, it keeps the id on disk and retries at the next launch, and the failure is shown, not swallowed. As a backstop, the server closes conversations that have been idle for more than 30 minutes, so memory never depends on the phone.

### Apple features

Use haptics, Keychain, `NWPathMonitor` (a plain "no connection" state), Dynamic Type, VoiceOver. No sign-in (decision 3). Not in v1: Live Activities, widgets, Siri/App Intents, push, SwiftData, or `SFSpeechRecognizer` as speech-to-text (Whisper is the decision).

## Server

### Routes

| Route | Change |
|---|---|
| `POST /api/turn` | The client sends `characterId`, `placeId`/`cityId`, `conversationId`, `learnerSaid` and an optional `trip`. The server loads the sheet, the transcript (already stored by `recordTurn`) and the clerk setting. `conversationId` moves into the body. The reply is still `{ line, en }`. |
| `POST /api/transcribe` | `audio/m4a` multipart plus `mode=target|en`. Checks length and size, and rejects near-silence on the server too. |
| `POST /api/speak` | Remove the `{ useBrowserSpeech }` JSON: any non-200 response means the fallback voice. Cap text length. Cache keyed on voice+text+speed (`Cache-Control: immutable`). |
| `POST /api/conversation/{id}/end` | Idempotent, returns 202 right away, and finishes the work on the server. |
| `/api/visits` | Folded into `GET /v1/me`. |
| `/api/generate-image` | Deleted 2026-10-15 (Josh). |
| `/api/log` | Kept for E-codes (small). |
| Admin | Unchanged, behind `ADMIN_KEY`. |
| **New** | `POST /v1/auth/device`, `GET /v1/me` (learner, settings, stamps), `PUT /v1/me/settings` (also fixes M3 #3), `GET /v1/content` (pack + manifest), `GET /healthz` (DB, git SHA, prompt version; used as the Railway health check). |

- **Versioning:** `/v1`. Only additive changes, because app builds stay on phones for months. The client sends `X-App-Version`, and the server can answer `426 upgrade_required`.
- **Contract:** the source of truth is the Zod schemas already in `lib/` (`TurnOutputSchema` etc.). Keep one JSON example per endpoint in `server/contract/` (or `contract/`), checked by both the server tests and the Swift tests. Hand-written `Codable` is fine for about 8 endpoints. Add OpenAPI codegen only if the two drift.
- **Errors:** `{ error: { code, message, retryable, retryAfterMs? } }`, reusing `lib/errors.ts` classifications.
- **Identity:** `POST /v1/auth/device` creates a learner and returns an opaque bearer token. The database stores a hash of it (`learner_tokens`). The app keeps it in Keychain, which survives a reinstall. Cookie and token resolve to the same learner id, so every web learner can keep their data (decision 6). Before the web is retired, the web shows a **"Move to the app" button**: it opens the app through a link carrying that learner's id, and the app takes over the same learner in one tap. Anyone who never taps it starts fresh in the app; their old data stays on the server. No sign-in (decision 3, Josh 2026-10-15): the token is stored as an iCloud Keychain item (synchronizable), so it follows the learner's Apple ID to a new iPhone with no account or screen; a learner without iCloud Keychain starts fresh on a new phone. This replaces both the email-link plan and Sign in with Apple.
- **Cost protection, before anyone except Josh gets TestFlight:**
  - App Attest when a device registers
  - a per-learner daily budget table (`usage_daily`: turns, speech-to-text seconds, TTS characters → `402 quota`)
  - rate limits per token and per IP
  - no client-supplied sheets

### Content and images

- **Text pack (about 1 MB):** export the pack to JSON with a script. Bundle it in the app, then refresh it from `GET /v1/content` when the version changes, so changes to the pantry, anchors or Magda don't need App Review. Prompts never leave the server.
- **Images: 806 MB, 1,452 files, stored as loose objects in git (about 900 MB).** They can't be bundled. **Moving to Cloudflare R2 (decision 5; Josh has an account):** R2 charges nothing for downloads and serves from a CDN; storage is about $0.015 per GB per month. Convert to WebP or HEIC (probably about 5× smaller, so feeds load faster on mobile data), name each file by its content hash, upload with a script, and have `npm run images` upload new images there. `/v1/content` lists the URLs. Stop adding images to git and delete them from the current files, but don't rewrite git history: that would break every other session's copy. **Set up 2026-10-15:** bucket `fuori-images` on Josh's Cloudflare account, public at `https://pub-b5019d0e071d4916b9dbf0957cb6a6c0.r2.dev` (Cloudflare's free address, rate-limited and meant for development; a custom domain before TestFlight goes beyond Josh). The laptop's `wrangler` is logged in with R2 access; R2 API keys (Object Read & Write, this bucket only) are in the laptop's `.env.local` (`R2_ACCOUNT_ID`, `R2_BUCKET`, `R2_PUBLIC_URL`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`), checked with an upload, read and delete; the cloud session needs the same variables to upload. **Uploaded 2026-10-15:** all 1,448 images (Italy 1,317, Mexico 131) as WebP at quality 80: 840 MB of JPEG became 366 MB, with no visible difference at full size. `content/<country>/images.json` maps each image id to its R2 key plus a fingerprint of the source JPEG. `npm run images:upload` uploads new or changed images only, `npm run images` runs it at the end, and `test:image-list` fails when an image the game uses isn't uploaded or has changed since. The web app still serves `public/images`; nothing was removed.
- **Railway watch paths:** both services ignore `ios/**`, `sketches/**` and `docs/**`, so Swift commits don't redeploy the server.

### Speed of a turn

Today's turn makes 3 serial phone round trips (transcribe → turn → speak) plus the time each model takes. **Measure first:** add `Server-Timing` per stage (db, stt, claude, tts) and the client's "end of speech → first audio" time. Set a target (for example p50 < 2.5 s, p95 < 4 s). If it misses, then in order:
1. A combined `POST /v1/turn/voice` (audio in → transcript, `{ line, en }`, audio).
2. Start TTS as soon as `line` has streamed (the schema puts `line` before `en`).
3. Write `recordTurn` after the response, with failures logged.
4. Try a faster ElevenLabs model, judged by ear.

## Testing and "done means used"

- **Server changes:** `npx tsc --noEmit`, the relevant `test:*`, then `smoke:live` for both countries after deploy, plus `railway logs`. Rewrite `smoke:live` as a `/v1` client (register a device, converse by `characterId`, end, check `/v1/me`, second-visit memory, Magda). It becomes the contract test the app has to agree with.
- **iOS changes:** `swift test` in the packages (voice gate fed with synthetic PCM, pack decoding, error mapping, ports of the `reveal` and `leave` tests), snapshot tests at 390×844, and a few XCUITests against a mock API.
- **Simulator smoke (`make smoke-sim`):** a debug-only "inject audio" source plays a recorded `.m4a` through city → place → conversation → leave. Then the server-side checks confirm the conversation ended and memory was written. It's off by default.
- **Device gate:** anything that touches audio counts as done only after it has been used on Josh's iPhone. Checklist: speak a turn, interrupt the character, background the app mid-speech, unplug AirPods, take a call. Anything not checked says "not verified" in the commit.
- **CI:** a GitHub Actions macOS job runs `xcodebuild test` on changes under `ios/**`. It's what makes Swift edits from the cloud session safe.

## Working with Xcode, MCP and several sessions

- **XcodeGen:** `project.yml` is the source of truth and `.xcodeproj` is generated, because hand-edited `project.pbxproj` files cause merge conflicts between sessions.
- **Laptop session:** Xcode MCP (Xcode 26's `xcrun mcpbridge` or XcodeBuildMCP) for build, test, run and screenshots. The `Makefile` is the fallback, and it's also what CI uses. Pipe `xcodebuild` through `xcbeautify`.
- **Cloud session (no Mac):** server, prompts, content, images, docs, contract, `smoke:live` and HTML sketches. Swift edits only when small, with macOS CI as the check and "not compiled on device" in the commit. `FuoriCore` and `FuoriNetworking` avoid Apple-only imports so `swift test` can run on Linux.

## HTML prototyping lane

- **Where:** `sketches/YYYY-MM-DD-topic.html`, at the repo root (not served by Railway). `prototype/index.html` stays untouched, as the historic demo.
- **Rules:** one file per sketch, no build step, no imports from `lib/` or `content/`, no live APIs or keys. Data is inline or a saved `/v1/content` fixture. To view one on the phone, publish it as a claude.ai artifact.
- **Handoff:** the sketch's top comment records the decision ("Josh picked B, date, why"). The Swift commit links it, and the sketch is deleted once the screen ships. Nobody ports the CSS.
- **Design tokens:** `design/tokens.json` (paper `#f5f1ed`, olive `#566330`, sand `#e8d5c4`, terracotta `#c0603a`, record red `#dc3545`, type scale, spacing, Polaroid border, shadow and tilt). A small script generates both `sketches/tokens.css` and `FuoriDesign/Tokens.swift`, and both outputs are committed.
- **Good uses:** onboarding, stamp designs, the beginner ladder, the city picker.

## Milestones

| | What | Size | Done means used |
|---|---|---|---|
| **N0** | **Done 2026-10-15** (Josh on his iPhone: cards, taps, swipe back). **Server half live 2026-10-15** (`/v1/*`, `/healthz`; the web's routes unchanged and `/api/generate-image` kept, since nothing is taken down yet). Server: ids not sheets, `/v1` beside the old routes, device token, `/v1/content`, `/v1/me`, `/healthz`, delete `/api/generate-image`, Railway watch paths. iOS: XcodeGen skeleton, packages, macOS CI, tokens. | 2 | `smoke:live` (both countries) passes against production with the bearer token; the app on Josh's iPhone lists the 20 cities from `/v1/content`. |
| **N1** | One conversation end to end: audio session, recorder, voice gate, transcribe, turn, speak + fallback, subtitle reveal, E-codes, leave with background task + server idle sweep. | 5 | Josh has a conversation of 6+ turns with Giulia on his iPhone and leaves. The admin transcript shows the turns, memory and learning notes. A second visit greets him by name. Plus: a long thinking pause mid-turn doesn't end the turn; staying silent pauses the conversation; a turn in a noisy café works. |
| **N2** | City and place feeds with image cache, Mostra altro, stamps (redesigned), Magda. | 3 | Fresh install → Roma → a bar → back shows a stamp → school → Magda brings up a mistake from that conversation. |
| **N3** | Stations and ticket, settings saved on the server, debug switch, Mexico, linking web learner data. | 3 | The same path in Italy and Mexico on the device, including a trip where the clerk names the ticket's platform. `smoke:live` passes for both. |
| **N4** | TestFlight to Josh: signing, icon, microphone text, privacy label, App Attest + budgets. | 1 | Josh plays from TestFlight on 3 separate days without the laptop, with no new E-codes in `railway logs`. |
| **N5** | Web sunset, about 2 weeks after N4: delete `app/page.tsx` and `app/components/`, replace them with a one-line page plus read-only admin. | 1 | Deploy succeeds, admin works, the app still works. |

The web UI is **frozen from now**: fix only outright breakage, since it's what Josh plays until N4. Moving `app/ lib/ content/ …` to `server/` is optional, after N5, done in one session together with Railway's Root Directory on both services.

## M3 roadmap, adjusted

The to-do list itself is [06-roadmap.md → Now](06-roadmap.md#now), which merges these with the milestones above (2026-10-15).

- **Server, now, alongside N0–N1:**
  - #1 tier in the character prompt (behind a setting, default today's behaviour)
  - #2 level measurement
  - #3 tier and settings in the learner profile (`/v1/me/settings`)
  - ~~#6 honest level and Magda tweaks~~ (cut, Josh 2026-10-15)
  - #7 lasting-learning measures
  - the server half of #5 (reject near-silence)
  - the ladder's server half (two in-character candidate replies)
  - art and place-uniqueness work (images and data)
- **Swift only:**
  - onboarding
  - beginner ladder UI
  - the voice gate on the device
  - redesigned stamps
  - city picker
  - settings as sentences
- **Paused:** every web UI item, including the "Start conversation" English label (make sure Swift reads `language.ui` instead).

## Risks

1. **Swift work that can't be checked** (cloud session, simulator microphone). This is how the M2 failure would repeat. Mitigation: macOS CI and the device gate.
2. **Audio on iOS** (echo, Bluetooth HFP quality, interruptions, backgrounding). Most of N1's size.
3. **Cost exposure** from a public token API before budgets exist. Budgets and App Attest come before any tester beyond Josh.
4. **Memory saved only on "end".** Mitigation: background task, retry at next launch, and the server idle sweep.
5. **Old app versions** after server changes. Mitigation: additive-only `/v1`, `426` for forced upgrades.
6. **App Review:** a specific microphone usage text, a privacy label declaring audio and text sent to Groq, Anthropic and ElevenLabs, a privacy policy URL, not in the Kids category, onboarding works without sign-in, and a "report this line" button as cheap insurance.
7. **Memory per country: resolved for now (2026-10-15).** Fuori and Afuera share one database and both Magdas have the id `magda`, so one learner playing both countries would get one study file mixing Italian and Spanish. Checked in the simulator: one app token worked on both servers. Fix: the app keeps one device token per country's server (Keychain account = the server's host), so each country has its own learner, as the web's separate cookies already do. **Josh (2026-10-15): Magda doesn't need to be shared across languages.** Each country keeps its own Magda and study file; with no sign-in there's nothing linking one person across countries, and nothing needs to.

## Decisions

Made by Josh, 2026-10-15:

1. **One app**, with the country chosen as the **first onboarding step** (a picture choice) **and switchable in Settings** (Josh, 2026-10-15), mapped to the two existing base URLs; each country keeps its own learner and Magda. Merge the two Railway services later if wanted. (The iOS reviewer had suggested two apps.)
2. **Keep Next.js as the API server.** Move to Hono later only if Next gets in the way.
3. **No sign-in** (Josh, 2026-10-15; was Sign in with Apple at M4). The silent device token is enough: kept in iCloud Keychain so it moves to a new iPhone with the learner's Apple ID. Also means no account-deletion flow, which App Review requires only for apps that create accounts.
4. **Revised 2026-10-15 (Josh, after trying it): tap to talk by default.** Hands-free extras deferred to the next release (Josh, 2026-10-16: an expert feature; a button is more forgiving on response time and gives the speaker more control). The character speaks by himself; the learner taps to start and taps again when done. Two-way hands-free (below) is a setting, off by default. Hands-free, as first decided:** a 4 s end-of-turn silence for every level, a 10 s wait for the first word, and cut-offs that lengthen the wait and are counted (see [Audio pipeline](#audio-pipeline)).
5. **Images move to Cloudflare R2** as WebP or HEIC. Josh has a Cloudflare account; the API token and domain are still to set up.
6. **Every web learner keeps their data**, through the "Move to the app" link.
8. **Checked on the laptop:**
   - The Apple Developer account is paid and active (profiles valid to May 2027, an App Store profile exists).
   - There's no signing certificate yet; Xcode makes one on the first build to the phone once signed in (Xcode → Settings → Accounts).
   - Bundle id: `com.joshp100.fuori`, matching Josh's other apps.
   - **Minimum iOS 26:** Xcode 26.6 is installed, Josh's iPhone 16 Pro runs 26.6.2 with Developer Mode on, and the household's other phones can run 26. Drop to 18 only if outside testers need it.
   - XcodeGen and xcbeautify are to be installed at N0 (`brew install`).
9. **M3 server work runs alongside N0–N1.**

Open:

7. **Who loses access at web sunset** (Android or desktop testers, the real Magda)? Does anyone need a read-only web view?

Next: update CLAUDE.md (native app, speech in/out, testing rules, `ios/` guidance, never hand-edit `.xcodeproj`), README, `docs/05-architecture.md` and `docs/10-testing.md`, and add N0–N5 to `docs/06-roadmap.md`.
