# Fuori

Voice-first Italian learning game. Read `README.md` and the numbered files in `docs/` before making product or architecture decisions; they are the source of truth for the design.

- `prototype/index.html` is the original claude.ai artifact demo. Keep it working and don't refactor it into the app; port ideas from it instead.
- The learner persona is someone who loves Italy and is staying for a while, not a tourist. Characters treat them as a newcomer who belongs and remember them across days.
- The world is open-ended: Claude generates places, people and scenes during play, and every day comes with 3–4 suggestions plus a change of scenery. Don't hand-write scripted scenes; hand-written content is limited to city pantries, a few anchor characters, Magda and level rules.
- Characters speak Italian, forgive speech-recognition noise, and correct real errors by recasting in character. They may use English only as their `englishAbility` allows, briefly, then return to Italian. Everyone teaches, always in role: characters help the learner the way a real person in their role helps a newcomer (slowing down, repeating, rephrasing, offering a word and its English, recasting a mistake); none steps out of role to sound like a language teacher with a lesson plan. Explicit lessons belong to Magda, who teaches at the school for foreigners in each city (teaching mode, not immersion; English and Italian freely) and uses the learner profile to suggest what to work on (Josh, 2026-10-13; see `docs/02-game-design.md`). For M1, `docs/M1-CONVERSATION-MODEL.md` is the source of truth for conversations and wins over `docs/04-conversation-engine.md`; keep the prompt short and the reply to `{ line, en }`.
- API keys are server-side only: `ANTHROPIC_API_KEY` (Claude), `GROQ_API_KEY` (Whisper on Groq), and later the TTS key. Never call these APIs from the browser and never commit `.env*` files.
- Speech in is Whisper on Groq (`/v1/transcribe` for the app, `/api/transcribe` for the web), not on-device speech recognition. Speech out is ElevenLabs through `/v1/speak` (`/api/speak` on the web), falling back to the phone's own voice (`AVSpeechSynthesizer`; browser `speechSynthesis` on the web) when it fails. The app never holds API keys or calls those services directly.
- The primary target is the native iPhone app in `ios/` (SwiftUI, iOS 26; plan in `docs/12-native-app.md`). The web app is frozen but stays up: fix only breakage, take nothing down. Hosting is Railway, which deploys from `main`; work and push on `main`.
- Keep `progress.md` current at the end of each session: what was done, decisions, open issues, next actions.
- Hand-written content (city pantries, anchors, Magda, level rules) lives in `content/it/` as data, not inside components. Generated characters and scenes are stored with learner data.
- Keep other languages possible without building them: nothing Italian-specific hard-coded in code or prompt templates (language name, speech-to-text code, voices, UI words and prompt examples come from `content/it/language.ts`), and all Claude calls go through `lib/claude.ts`. See "Keeping other languages possible" in `docs/05-architecture.md`; `npm run test:language` enforces it.
- Don't build on predicting what learners or characters will say: no phrase lists or keyword filters; prefer signals that work in any language (recording length, silence, a judge call).

## Testing
- Run `npx tsc --noEmit` after editing TypeScript or content files. Never claim a task is done until type checking passes.
- Check the dev server compiles without errors before showing work.
- For UI changes, verify the page loads correctly with `curl http://localhost:3000` or browser check.
- Don't modify or weaken existing tests to make them pass without approval.
- When fixing bugs, add a test that would have caught it.

## Definition of done
Added 2026-10-13 after M2 was reported "complete" while its core features had never run. The full account is in `docs/11-lessons-learned.md`.
- Done means used. Before calling anything done, complete or live, run it end to end the way a learner would (`npm run smoke:live`, and `COUNTRY=es-mx npm run smoke:live` for Mexico, or a browser) and say what was run. If it wasn't run, the commit says "not verified".
- After pushing, confirm the deploy succeeded (`railway status --json`) and read `railway logs` for errors from the new code.
- No silent failures: don't hide a failing call in a fire-and-forget `.catch()`; call server code directly, not over HTTP to the app itself.
- No placeholders in shipped code: no `TODO` stand-ins, demo ids or `localhost` URLs.
- Before reusing a database column, field, id or file, search for what already uses it.
- Test the connection, not just the parts: the place finds its character, ending a conversation stores what it should, the screen calls a route that exists.
- Experiments go behind a setting whose default is today's behaviour; Railway deploys `main`, so changing a default changes production.
- Never stash, clean or reset files you didn't create (`git stash -u`, `git clean`, `git checkout -- .`); another session may be mid-task in the same folder. Commit generated files promptly.

## iPhone app
One app for every country (Fuori in Italy, Afuera in Mexico; the country is chosen in onboarding): nothing in Swift assumes Italian, and every screen is checked in both countries. Follow Apple's Human Interface Guidelines strictly: use iOS's own components and behaviours and style on top of them. Full rules, decisions and reasons: `docs/13-ios-conventions.md` (from the HIG; `npm run hig` downloads a local copy).
- Must hold on every screen: the standard back button and swipe, and every exit (back, swipe, "Sali", background) saves through one leave function; text sizes from text styles (`Font.custom(_:size:relativeTo:)`, `@ScaledMetric`), so Dynamic Type and Bold Text work; colours and sizes only from the tokens (`design/tokens.json`, `npm run tokens`), text contrast at least 4.5:1; light-only until the night-paper palette (N2); the settings button (Fuori's own icon, `SettingsIcon`) top right on every screen; words in the learned language and any country default (a starting city) from `/v1/content`, never in Swift; no AI notes in the game: explanations only in onboarding and Settings → About Fuori.
- Conversation screen: standard navigation bar, then the approved paper name band, then the portrait. Subtitles type out in step with the voice; the English translation never shows until the character has finished speaking. The character speaks by himself; the learner taps to talk and taps again when done (default), or turns on Hands-free in Settings. Safeguards: Pause always visible; calls, Siri, AirPods out and backgrounding pause and the mic never reopens without a tap; tap-to-talk when VoiceOver is on; a "more time to answer" setting.
- Done for a screen also means, said in the commit: largest text size (AX5) without clipping; VoiceOver pass (labels; target-language words read in that language); 44 pt targets with a pressed state; back swipe saves; Reduce Motion respected; for audio screens, a call, Siri, AirPods in and out, backgrounding and locking checked on Josh's iPhone. Builds: `cd ios && make build` or XcodeBuildMCP; CI (`.github/workflows/ios.yml`) must pass. A simulator run is not "used": audio needs the phone.

## Working across sessions
- Several Claude sessions work on this repo: Claude Code on Josh's laptop (sometimes two at once, in the same folder) and a cloud session in the Claude app's "Fuori" project. None can see another's uncommitted work.
- Start every session with `git pull --rebase origin main`. End every session by committing and pushing to `main`, and update `progress.md`.
- Never leave work unpushed overnight. If it isn't on GitHub, the other session and Railway can't see it.
- Model IDs live only in `lib/claude.ts`. Don't hard-code them elsewhere.
- The character prompt lives in `content/it/prompts/character.md`, not in code. To change it: edit it, bump its `version`, and add a changelog entry at the bottom saying what changed, why, and what prompted it. `npm run test:prompt` enforces the changelog. Compare with `npm run test:conversations`.
- Commit messages explain the change for someone who wasn't there: what changed, why, what prompted it (bug, test result, Josh's feedback), and anything deliberately not done. A one-line message is only for trivial changes.
