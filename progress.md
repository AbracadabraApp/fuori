# Fuori Development Progress

## Current phase: M1, conversations working on the phone; memory next

**What to do next lives in [docs/06-roadmap.md → Now](docs/06-roadmap.md#now-ranked)** (ranked). Open decisions: [docs/open-design-questions.md](docs/open-design-questions.md). Parked ideas: [docs/ideas.md](docs/ideas.md). This file is the session log; the dated entries below say what happened and why.

### Decisions
- **Immersion, not full understanding** (2026-10-11): for learners who tolerate not understanding; characters above your level and teaching in character are fine; breaking character isn't. See `docs/01-vision.md` → Level.
- **Open-ended world** (2026-10-09): Claude generates places, people and scenes. Every day: 3–4 suggestions from the director, plus "cambia aria" and "vai dove vuoi". Hand-written content is limited to city pantries, a few anchors per city (Roma: Rita, Giulia), Magda and level rules. Replaces the scripted 18-day season.
- **Vocabulary emerges from context** (2026-10-09): No vocabulary lists or tracking in M1. Market vocabulary appears when you visit markets, bar vocabulary at bars. Multiple instances of each place type (many bars, not one scripted bar).
- **Daily rituals are good** (2026-10-09): The bar can be your daily stop. Relationships deepen and characters level up with you naturally. Director offers variety but never forces it.
- **Moods removed for M1** (2026-10-09): Simplified to get conversation working. Will add with illustrated portraits in M2.
- **Navigation flow** (2026-10-10): Modified Option C - Cities feed → Places feed (in city) → Conversation screen. City switcher as card at bottom. No floating buttons. Settings accessible from gear icon in header.
- **City images with life** (2026-10-10): Watercolor sketches show people and activity (markets, cafés, street scenes) not empty architectural postcard views. Each city has distinctive visual identity through specific prompts (Roma: evening café; Milano: aperitivo hour; Palermo: street market; etc.). No hints approach tested but abandoned - prescriptive prompts better for visual distinction across 20 cities.
- **20 cities in M1** (2026-10-10): Big cities (Roma, Firenze, Venezia, Milano, Napoli, Bologna, Torino, Palermo, Genova) + smaller towns (Siena, Lucca, Verona, Bergamo, Mantova, Matera, Lecce, Orvieto, Assisi, Siracusa, Taormina). Enough for testing feed UI, scrolling, choice patterns. Pre-generated images only; on-the-fly city generation deferred.
- **Magda, the tutor:** the only character who teaches; messages, weekly lessons, summary for real Zoom lessons. First name only; check with the real Magda before sharing Fuori.
- **Levels:** CEFR steps (A1 → A1+ → A2 …) with the *Profilo della lingua italiana*; evidence from conversations, no tests; dialect grows with level. Characters adapt dynamically based on conversation.
- **Interface:** Instagram-like; **scrolling full-width image cards** for city/place feeds (not 2x2 tiles); Polaroid-style cards with image on top, white caption below; conversation screen like a video call.
- **Speech in:** Whisper on **Groq** (free tier) instead of OpenAI. Implemented in M1.
- **Speech out:** browser voices until hosted TTS (ElevenLabs or Azure) in M3.
- **Language validation is automated:** level rules from published standards; simulated-learner test with a judge from M2. No native-speaker gate.
- **Visuals:** all illustrated (watercolour and ink, travel-sketchbook style). Illustrated portraits for anchors and Magda; SVG avatars for generated people; illustrated place cards for suggestions.
- **Hosting:** Railway, deploys from `main`. Mobile-first, iPhone Safari.
- **Help:** natural character help first; hints only when the character is confused or the learner asks.

### References
- Planning docs: `docs/`
- Roadmap: `docs/06-roadmap.md`
- Data model: `docs/09-data-model.md`

---
Top section last updated: 2026-10-11 (older decisions above kept for history; the roadmap is current).

## M1 Implementation Notes

**What was built:**
- Minimal conversation engine: you speak Italian → Whisper transcribes → Claude responds in character → browser speaks it
- Roma pantry: 25+ places across 6 neighborhoods (Trastevere, Monti, Testaccio, Centro Storico, Prati, San Lorenzo)
- Multiple instances per place type: 3 bars, 3 markets, 2 bakeries, 2 trattorias, etc.
- Giulia (barista, 32, quick-talking) and Rita (host, 58, warm) with full character sheets

**What was simplified:**
- No mood system (will add with illustrated portraits in M2)
- No structured output parsing yet (M2 will use Zod schemas with Claude's output_config)
- No corrections display (Claude corrects naturally in dialogue, but not extracted in M1)
- No word tracking or quaderno (M2)
- No localStorage or progress saving (M2)
- No suggestion system or Oggi screen yet (M2)

**Key insight from CEFR research:**
Working backwards from A1-A2 Italian standards confirms the environmental vocabulary approach:
- A1-A2 needs: food, home, transport, shopping, time, basic culture
- These naturally emerge from: bars, markets, shops, stations, churches, piazzas
- B1+ needs: work, health, opinions, stories, abstract topics
- These come from: deeper conversations at the same places, plus cafés, cultural sites, professional contexts
- The same places work across levels; what changes is who you meet and what you discuss

**What worked well:**
- Roma pantry with abundance (multiple bars) lets choice create routines organically
- Character sheets with rich personality and speech style give Claude enough to stay in character
- Simple hold-to-record UI is the right starting point

**Local test URL:** http://localhost:3000

---

## 2026-10-10: City Feed and Navigation

**What was built:**
- Full three-level navigation: Cities feed → Places feed → Conversation screen
- 20 Italian city cards with watercolor sketch images
- PlaceCard component: Polaroid-style with square image on top, white caption below
- City names prominent (32px, weight 700) for readability even without recognizing images
- Settings UI: gear icon in header opens sheet from top with "Show transcripts" and "Allow dialect" toggles (non-functional yet)
- Image generation via xAI Grok API (`/api/generate-image`)

**Image generation iterations:**
1. **First attempt**: "No hints" approach - just city names. Result: all similar muted tones, towers/churches, no life
2. **Problem identified**: AI defaulted to empty architectural postcard views
3. **Solution**: Prescriptive prompts with specific scenes and activities for each city
   - Roma: outdoor café in Trastevere, people dining, warm evening light
   - Milano: aperitivo hour in Navigli, young people, canal-side bar
   - Napoli: busy Spaccanapoli street, laundry overhead, locals in conversation
   - Palermo: Ballaro market, vendors, colorful awnings, bright Mediterranean light
   - And 16 more distinctive scenes
4. **Result**: Visually distinct cards with recognizable character and life

**Key insights:**
- With only 20 cities in M1, being prescriptive about images is better than relying on AI interpretation alone
- Images need people and activity to feel inviting, not empty tourist views
- City names must be visually prominent - many users won't recognize cities from watercolor sketches
- Settings as an overlay (not replacement screen) keeps context visible
- Three-level navigation (Modified Option C) works well for mobile

**Technical notes:**
- Script safety: `fs.existsSync()` checks prevent accidental regeneration
- Backup system: `-backup.jpg` files created before regenerating
- Rate limiting: 3-second delays between image generations to avoid API limits
- All images stored in `public/images/cities/` as static assets

**What's ready for deployment:**
- City feed with 20 Italian cities
- Navigation to places (though only Roma has place data)
- Conversation screen UI (conversation engine from 2026-10-09)
- Settings UI (toggles don't do anything yet)

**Next step:** Deploy to Railway and test full flow on iPhone

---

## 2026-10-10 (continued): Art Style Progression & City Pantry Formula

**Art style progression established:**
Three distinct styles for visual hierarchy and increasing fidelity:
1. **Cities**: Loose watercolor with ink lines (atmospheric, flowing)
2. **Places**: Soft pastel sketch (warm, colorful, textured)
3. **People**: Pen and ink portrait with minimal wash (crisp, detailed, personal)

Tested with Giulia's bar (pastel) and portrait (pen/ink) - progression works well for travel journal aesthetic.

**City Pantry Formula documented:**
Established systematic structure for all city pantries (25-30 places):
- Daily routine: 3 bars, 2 bakeries
- Food/shopping: 2-3 markets, 2 restaurants, 1-2 specialty
- Cultural: 1 landmark, 1-2 churches, 1 park, 1-2 piazzas
- Social: wine bars, bookshop
- Practical: pharmacy, transport
- City character: 2-3 unique places

This ensures vocabulary consistency across cities while allowing unique character. Documented in `docs/03-journey.md`.

**Key insight:**
Roma pantry already has good balance - emphasizes daily life vocabulary (bars, markets, shops) over tourist checklist, which is correct for language learning.

## 2026-10-10: Fix silent Giulia on iPhone

**Problem:** On the phone, Giulia's bubble was empty and nothing played. Railway was serving an old commit from `claude/voice-prototype`, whose `/api/turn` used the retired model `claude-opus-4-20250514`, so every turn failed and the page hid the error.

**Fixed on `main`:**
- `lib/claude.ts` now holds the Anthropic client and `CLAUDE_MODEL` (default `claude-sonnet-5-5`, override with the `CLAUDE_MODEL` env var). `/api/turn`, the content scripts and the test runners use it.
- `npm run test:models` fails if a model ID is hard-coded anywhere else.
- ConversationScreen shows the server's actual error message instead of a generic one.
- iPhone audio unlock: the Start and mic taps play a silent sound first, and ElevenLabs audio reuses that unlocked element, so Safari lets Giulia speak after the network call.

**Open:** Railway must deploy from `main` (Service → Settings → Source → Branch).

## 2026-10-10: Conversation Model Simplified - Back to Basics

**Major design decision:** The initial M1 implementation (commit 4541dca) over-engineered the conversation system. Stripping it back to the true M1 vision: radically minimal, pure voice immersion.

**What was built (but wrong):**
- 400-line prompt builder with 6 layers
- Rigid level rules (A1: "3-5 words per sentence", max 2 new words)
- Complex structured output (10+ fields: correction, words, steps_done, hint, confused, mood, scene_over, memory_notes)
- Explicit goal tracking
- Word counting and vocabulary limits

**What M1 actually is:**
- Simple ~20-line prompt: character basics + "match their level" + natural help
- Output: just `{it, en}` 
- No rigid structures, no counting, no explicit scaffolding
- Everything through voice: "ripeti" to repeat, "più lento" for slower, "parla inglese?" for English
- UI: Portrait + Mic button. That's it.

**The hypothesis:** Can natural conversation alone drive language learning?

**Documented in:** `docs/M1-CONVERSATION-MODEL.md`

**Why the mismatch happened:**
- `docs/04-conversation-engine.md` contradicts itself: natural philosophy but complex schema
- Discussion about simple approach wasn't written down
- Lost between sessions due to inadequate documentation
- Defaulted to implementing what was specified vs questioning complexity

**Lesson:** Write down design decisions immediately. When docs contradict philosophy, ask first.

**Next:** Rebuild `/api/turn` with the simple model before testing on iPhone.

---

## 2026-10-10 (continued): M1 Conversation System Rebuilt - Simple and Working

**What was done:**
The conversation system was completely rebuilt to match the true M1 vision documented in M1-CONVERSATION-MODEL.md.

**Files changed:**

1. **lib/prompts/turn-output-schema.ts** - Simplified from 110 lines to 18 lines
   - Output now just `{it: string, en: string}`
   - Removed: correction, words, steps_done, hint, confused, mood, scene_over, memory_notes

2. **lib/prompts/build-turn-prompt.ts** - Simplified from 400 lines to 113 lines
   - Removed 6-layer system (house rules, level rules, relationship, scene, goals)
   - Now just: character info + "match their level" + natural help guidance
   - Added support for character.englishAbility (fluent, basic, none)
   - No word counting, no rigid structures, no explicit scaffolding

3. **lib/types.ts**
   - Added `englishAbility?: 'fluent' | 'basic' | 'none'` to CharacterSheet
   - Simplified TurnOutput to just `{it: string, en: string}`

4. **app/api/turn/route.ts** - Simplified API endpoint
   - Removed scene, level, relationship parameters (no longer needed)
   - Now just needs: character, transcript, learnerSaid
   - Simplified Zod validation to match new output schema

5. **app/components/ConversationScreen.tsx**
   - Removed correction display
   - Removed steps tracking
   - Removed scene and level from API call
   - No longer shows understood text or goal completion

6. **content/it/characters/giulia.ts** and **rita.ts**
   - Added `englishAbility: 'basic'` to both characters

**Result:**
- Type checking passes (`npx tsc --noEmit` ✓)
- Conversation system now matches M1 philosophy: radically simple, natural adaptation
- Ready for testing on iPhone

**The transformation:**
- **Before**: 400-line prompt builder, 10+ output fields, rigid level rules, word counting
- **After**: ~50-line prompt builder, 2 output fields, natural conversation

**Next:** Test full flow on iPhone (city feed → places → conversation with Giulia)

---


## 2026-10-10: Simple conversation test (cloud session)

- Archived the old simulated-learner suite and automated improvement loop to `tests/archive/` (it tested its own copy of the prompt, could edit its own rubric, and predated the simple conversation model). Removed `test:learner` and `improve:loop*` scripts.
- New `npm run test:conversations`: samples Giulia, Rita and random city characters, simulates conversations with 3 learner types, grades 4 things (Italian, understands imperfect speech, matches the learner, feels real), writes a report with up to 3 recommendations. Never edits files. `--dry` shows the sample without API calls.
- `lib/turn.ts` (`runTurn`) now holds the Claude call; `/api/turn` and the test share it.
- `lib/characters/for-place.ts`: places now get their own city character (name, role, personality) instead of falling back to Giulia. The page uses it.

**Next:** run `npm run test:conversations` on the laptop (needs `.env.local`) and read the first report.

## 2026-10-10 evening: ConversationScreen matches the M1 doc (cloud session)

- Removed the hard-coded Giulia fallback (`testCharacter`, `testScene`) and the unused `scene` and `level` props. The screen now requires the place's character.
- Removed leftover replay state and the learner-transcription state (the learner's words are never shown, per the M1 doc).
- Errors name the actual character instead of "Giulia".
- Places with no character (most of Roma besides Giulia's bar and Rita's apartment) show "nobody to talk to here yet" instead of silently becoming Giulia.
- Text stays as the doc says: Italian on by default, English off, both in Settings.
- Styles moved from inline to CSS modules (`page.module.css`, `PlaceCard.module.css`, `ConversationScreen.module.css`) with shared color tokens in `globals.css` (`--green`, `--paper`, `--sand`, …). Screens verified pixel-identical with before/after screenshots. The app is now light-only (dark mode previously made unstyled text near-invisible on white). Removed unused `AudioPlayer.tsx`.

## 2026-10-10 evening: Images (cloud session)

- Bug: the image script's pattern matched each city block before its first place, so 18 cities' first place (e.g. Caffè Schiuma) was saved as `<city>.jpg`. Renamed the 18 files and fixed the pattern in `scripts/generate-images*.mjs`.
- Roma's 24 places had no `imagePrompt`; added them in the same pastel style.
- Missing images now show the sand placeholder instead of a broken icon (place cards and portraits).
- `npm run test:images` lists missing images. `npm run images -- --city roma` generates them (needs `XAI_API_KEY`).
- **Next (laptop):** run `npm run images -- --city roma` (24 images), generate `portraits/rita.jpg` from the prompt in `content/it/characters/rita.ts`, then `npm run test:images` should pass. Commit the images and push.

## 2026-10-10 evening: Errors, logging, debug mode (cloud session)

- Phone errors now reach Railway logs via `/api/log`, with a code (`E-XXXX`) shown to the learner; server routes log the same code (`x-fuori-id` header). `railway logs | grep E-XXXX`.
- One automatic retry for temporary failures (network, 429, 5xx). If transcription or the reply still fails, the character says "Scusa… puoi ripetere?" (from `content/it/language.ts`, tu/Lei) instead of an error. Hosted voice failures fall back to the browser voice silently (logged).
- Plain-language messages: microphone blocked (with the iPhone setting), no connection, or "Something went wrong (code)". No raw technical text.
- Debug mode: `?debug=1` shows heard text, voice path, timings, speed and full last error.
- Tested in a browser: opening failure, mic blocked, transcription failing twice, reply failing with debug on. All logged with matching codes.
- `tsconfig.tsbuildinfo` is now gitignored (it was causing noise in every commit).
- Noticed: Giulia's portrait has "Caffè a Firenze" written in it, but she works in Roma.

## 2026-10-10 night: Gender and voices (cloud session)

- Every city character now has `gender` ('f'/'m'): read from the portrait description where it said so (499), otherwise from the first name (96). The two methods agreed on all 499 where both applied. Giulia and Rita are 'f'.
- Voices are picked in `content/it/voices.ts`: Giulia (Lily) and Rita (Matilda) are fixed; everyone else gets a voice from a female or male pool, chosen by a hash of their id so it never changes between visits. The browser fallback also picks a male or female Italian system voice.
- Found: where a portrait description had no gender, the image generator drew a man. 10 women had men's portraits (Benedetta, Simona, Valentina, Claudia the bookseller, Elisabetta, Grazia, Maria, Isabella, Valeria, Sofia). Removed those images and added "The subject is a woman/man." to all 96 descriptions.
- New: `npm run test:voices`, `npm run voices` (lists ElevenLabs voices verified for Italian, with preview links).
- Noticed: 15 character ids appear in two cities (e.g. padre-giovanni), so those pairs share one portrait file.

**Next (laptop):** `npm run images` to regenerate the 10 portraits (plus Roma places and Rita), `npm run voices` and listen; swap any pool voice that sounds wrong in Italian.

## 2026-10-10 night: "Mostra altro" (cloud session)

- City and place feeds show 10 cards, then a centred "Mostra altro" link with an olive sprig on each side adds the next 10 below (`app/components/ShowMore.tsx`; text in `content/it/language.ts` → `ui.showMore`). Each city starts at its first 10 places.
- City order alternates big city / smaller town, spread across regions, Roma first (`content/it/cities/index.ts`).
- Place feeds are ordered by `lib/places/feed-order.ts`: rotate through neighbourhoods and avoid repeating a kind within 3 cards (was: all of one neighbourhood first). Replaces the 2026-10-10 "group by neighbourhood" ordering. `npm run test:feed` checks it.

## 2026-10-10 night: Decision: minimal memory in M1, in Railway Postgres

- Character memory moves from M2 into M1, in its minimal form: visit count plus a few short notes per character, written by Claude when a conversation ends and added to the prompt next time.
- Stored in Railway Postgres from M1 (`learners`, `character_memories`), not localStorage: Safari wipes site storage after ~7 days without a visit, the server needs memory for future messages, and it can be inspected. Anonymous learner id in a server-set HTTP-only cookie; no login until M4.
- Updated: `docs/05-architecture.md`, `docs/09-data-model.md`, `docs/06-roadmap.md`, `docs/M1-CONVERSATION-MODEL.md`.
- **Next:** add a Postgres service in Railway (sets `DATABASE_URL`), then build the memory flow.

## 2026-10-11: Fix: Giulia never heard the learner (cloud session)

- Every turn failed transcription, so Giulia always said "Scusa, non ho sentito bene". Cause: the phone uploaded the recording as a file named "blob" (no extension) and Groq picks the format from the extension. The extension mapping added on 2026-10-10 only ran for raw Blobs, never for uploads.
- Fix: `lib/speech/audio-file.ts` names the file by type (`speech.m4a` on iPhone) on the phone and again on the server; strips codec parameters ("audio/mp4;codecs=…"). `npm run test:audio`.
- After two failures in a row, the error code is shown under the in-character recovery line, so a persistent problem isn't hidden.
- Decision (Josh): no in-character cover for system errors. Hard-coded "Scusa… puoi ripetere?" lines removed; a failing system now gets a plain message saying what failed, with the code. Garbled-but-transcribed speech is still handled by Claude in character. An empty recording or empty transcript shows "Didn't catch anything" without calling Claude.
- "Didn't catch anything" now has a code and is logged with the recording's length, size, type, what Whisper returned, and whether the character was still speaking. Debug mode shows the last recording's details.
- Tapping the mic while the character is talking now stops them (you're interrupting; iPhone can also record silence while playing audio).

## 2026-10-11: Roma gets its people (cloud session)

- Roma was hand-written before the other cities were generated, so 23 of its 25 places had nobody ("nobody to talk to here yet"). Added 23 characters in the same format as other cities (name, gender, age, role, personality, portrait description) and linked each to its place: e.g. Sandro at Bar Angolo, Nonna Gina in Piazza Santa Maria, Don Paolo at the basilica.
- **Next (laptop):** `npm run images -- --city roma` to generate their 23 portraits (place images already exist), then `npm run test:images` should pass.

## 2026-10-11: Conversation screen from phone notes (cloud session)

Notes from the first real phone use are in `docs/ideas.md` → "Coda". Acted on the interface ones:
- Compact header ("‹ Firenze" at 17px) and a one-line name · role under it.
- Portrait shown full at the start; the reply text floats over it from 50% down the screen and scrolls inside itself if long. The page never scrolls, so the face stays visible (Rosa's portrait used to scroll off, leaving her apron).
- Mic states: Tap to speak / Listening… tap to send (pulsing red) / Rosa is thinking… (dots) / Rosa is speaking · tap to interrupt. The opening line now shows "thinking" too.
- 234 English character roles translated to Italian, matching gender (fruit vendor → fruttivendola). `npm run test:roles`.
- Checked at 390×844 and 375×667. The "speaking" state couldn't be seen in the headless browser (no audio); check it on the phone.
- Mic, revised after Josh's feedback: compact olive pill. While you talk, five olive bars move with your actual microphone level (proof your voice is being captured; not a transcription). While the character prepares a reply, terracotta dots (red reads as an error). If no sound arrives within 2 seconds: "Not hearing you. Check the mic isn't covered or muted." Dropped the "is thinking / is speaking" text; hints are only "Tap to speak" / "Tap to send".
- Brand green is now olive (`--green: #566330`, was #2c5f4f), new `--terracotta: #c0603a`. Both pass contrast; states also differ by shape (bars vs bouncing dots), not color alone.

## 2026-10-11: Character prompt describes the situation, not the behaviour

- Long, lecture-like openers (Marco the archaeologist introducing himself with his CV) came from what the prompt didn't say: that this is spoken, face to face, and who the person is. Added: "This is a real, face-to-face moment. Your words are spoken aloud and heard, not read." and "They're new to the neighbourhood." First turn is now "Someone has just walked up to you." instead of "Start the conversation."
- Deliberately no "learning Italian" (teacher mode) or "foreigner" (tour-guide mode), and no length rules (Josh: wary of prescriptive dialogue).
- Prompt moved to `content/it/prompts/character.md` (version + changelog), filled in by `lib/prompts/build-turn-prompt.ts`. The version is logged with every turn (`event: turn`, `promptVersion`), sent in an `x-prompt-version` header, shown in debug mode, and printed in conversation-test reports. Verified the file produces the same prompt text as the old code for all 1,272 character/turn combinations.
- 2026-10-11b: "They're new to the neighbourhood" → `{relationship}` slot ("You haven't met them before." until memory fills it).
- CLAUDE.md: prompt-change process and commit-message standard.

## 2026-10-11: Mic and text card, round 3 (from iPhone screenshot)

- Removed the "Not hearing you" warning: on iPhone the voice meter read zero even while speech was going through, so the warning was a false alarm (and stayed up).
- Voice meter: fresh AudioContext per recording, created after the mic is live (a context created earlier can stay silent on iOS once recording starts). Until real sound reaches the meter, the dots pulse gently instead of sitting still. Debug mode shows "Meter: state, sample rate, peak (no signal)" to confirm on the phone. **Not verified on iPhone** (only Chromium here).
- Text card: removed backdrop blur and mask-based fade (Safari showed square, sliced edges); soft edges now come from plain gradient overlays.
- Controls: no hint text, smaller pill (96×46), anchored near the bottom; controls area 148px → 84px, so long replies fit without scrolling on 390×844 and 375×667.

## 2026-10-11: Dialogue model, mic size, image optimisation

- **Dialogue model (decided):** subtitles. The reply card is anchored just above the mic and grows upward over the portrait as needed, up to just below the name line; it scrolls only past that. Short replies leave the face visible; it never covers the mic. Replaces the fixed "starts at 50%" card.
- Mic pill back to 112×52; controls area 72px with tighter padding.
- Portraits, city and place images use next/image: resized WebP served to fit the screen (~100–120 KB vs ~570 KB originals). No change to dimensions or cropping.
- Checked at 390×844 and 375×667 with short, long and triple-length replies.

## 2026-10-11: Honest voice fallback (from Salvatore turning into a woman)

- Mid-conversation the ElevenLabs voice stopped and Salvatore (a man) spoke with the iPhone's female voice. Two silent failures: the hosted voice failed and the app fell back without saying so, and a stock iPhone has only Alice (female), so the "male voice" lookup quietly used her.
- ElevenLabs errors are now classified (`elevenLabsError` in `lib/voice/providers/elevenlabs.ts`): quota used up (ElevenLabs sends 401 `quota_exceeded`, which looked like a bad key), rate limit, rejected key, other. The server log says which. `/api/speak` answers 402 for quota/key (not retried; retrying can't help) and 429 for rate limits (retried once).
- When the phone's voice takes over, a small note appears above the mic: "Voice service quota used up, so using the phone's voice. (E-XXXX)" and/or "No male Italian voice on this phone (Settings → … → Italian)". Not a red error box: the conversation keeps working. Cleared when the hosted voice works again. Debug panel shows which phone voice was used and "(wrong gender)".
- `browserVoiceFor` returns `{ voice, matchesGender }`; still speaks with the wrong gender rather than going silent. Tests added to `npm run test:voices`.
- **Open:** cause of this failure not confirmed. Likeliest is the ElevenLabs character quota (long replies today). Check elevenlabs.io usage, or `curl https://api.elevenlabs.io/v1/user/subscription -H "xi-api-key: $ELEVENLABS_API_KEY"` on the laptop. The cloud session can't reach ElevenLabs or Railway.
- **Open (prompt, not changed):** Salvatore "corrected" Josh's pronunciation of *grazie* and "Grigianto" → Agrigento. He only gets Whisper's text, so these corrections are invented or are Whisper's misspellings. Proposed adding a factual line: "You only receive their words as text. You can't hear their accent, pronunciation or tone." Awaiting Josh.

## 2026-10-11: Level, speaking and where things live (docs only)

Discussion with Josh after Salvatore and Suor Agata. No code or prompt changes.
- **Decided:** Fuori is immersion for learners who tolerate not understanding, not a beginner course; characters speaking above your level is fine; teaching in character is fine, breaking character isn't. In `docs/01-vision.md` (Level, principle 7) and `docs/M1-CONVERSATION-MODEL.md`.
- **Roadmap rewritten** to match what's built (it still listed conversation wiring and Railway as to-do). Now has a ranked **Now** list (test level and length first, then prompt experiments, Postgres, memory + saved conversations + review log, ElevenLabs quota) and clear M1/M2/M3 scope. M1 now includes saving conversations and a review-log entry (debug only); learner profile, success scoring and Magda are M2; interactive transcript M3.
- `docs/09-data-model.md`: `conversations` table (turns as JSON, review entry, prompt version; no audio).
- `docs/open-design-questions.md` #11: six open decisions (noticed field, trait reframing, learner level reaching characters, starting level, where the review shows, pace/pauses).
- `docs/ideas.md`: the long section from earlier today cut to four parked ideas with links.
- The stale "Next actions" and "Open issues" lists at the top of this file are removed; the roadmap replaces them.

---

## 2026-10-11: Database and memory system built

**What was built:**
Complete M1 memory infrastructure for character memories, learner identification, and conversation storage.

**Files created:**
1. **lib/db.ts** - Postgres connection pool utility
   - Safe connection pooling (max 20, 30s idle timeout)
   - SSL detection for Railway internal vs external connections
   - Generic query function with TypeScript types

2. **scripts/db-migrate.mjs** - M1 schema migration
   - Creates 3 tables: `learners`, `character_memories`, `conversations`
   - Idempotent (safe to run multiple times)
   - Verifies tables after creation

3. **lib/learner.ts** - Anonymous learner identification
   - HTTP-only cookie (`fuori_learner_id`, 1 year)
   - `getOrCreateLearnerId()`: creates learner record and sets cookie
   - `getLearnerId()`: reads existing cookie without creating

4. **lib/memory.ts** - Character memory and conversation storage
   - `loadCharacterMemory()`: gets visit count, last visit, notes for a character
   - `startConversation()`: creates conversation record with metadata
   - `addConversationTurn()`: saves turns incrementally as JSONB
   - `endConversation()`: saves character notes + review log, updates memory
   - TypeScript interfaces: `CharacterMemory`, `ConversationTurn`, `ReviewLog`

**Schema:**
```sql
learners (id uuid, created_at timestamptz)
character_memories (learner_id, character_id, visits, last_visit, notes text[])
conversations (id, learner_id, character_id, place_id, city_id, prompt_version,
               started_at, ended_at, turns jsonb, review jsonb)
```

**Deployed:**
- Migration run successfully on Railway via `railway ssh`
- All 3 tables created and verified in production Postgres
- Ready for integration into conversation flow

**Next:**
- Integrate memory functions into `/api/turn` route
- Load character memory at conversation start for `{relationship}` prompt slot
- Save conversation turns as they happen
- Generate review log on conversation end (Claude call to extract learning moments)

**Dependencies added:**
`pg` and `@types/pg` for Postgres client

## 2026-10-11 evening: Characters stop talking when you leave (cloud session)

- Bug (Josh, iPhone): characters kept talking after going back to the places list, and even after switching to another app.
- Cause: nothing stopped the audio when the conversation screen closed or the page went to the background, and a reply still on its way would start speaking after you'd left.
- Fix: `lib/speech/silenceAll()` stops the hosted voice, the phone's voice, the recorder, the mic and the level meter. `ConversationScreen` calls it when the screen closes, when the app goes to the background (`visibilitychange`) and on `pagehide`. A reply or recording that finishes after you've left is dropped instead of spoken or sent. Coming back to the app doesn't replay anything; the text is still there.
- Test: `npm run test:silence`.
- **Not verified on iPhone** (no audio in the headless browser here).
- For the memory work: leaving the screen is also "conversation ends", so the end-of-conversation call can hang off the same cleanup effect.

## 2026-10-11 evening: Typewriter subtitles (cloud session)

- Josh: with the whole reply on screen he reads ahead instead of listening. Subtitles now type out word by word as the reply is spoken.
- Pacing follows progress through the audio (hosted voice: current time ÷ duration; phone voice: its word boundaries where reported, else an estimate), not each word's real timing, so it can drift a word or two in pauses. Exact timing via ElevenLabs `with-timestamps` is the upgrade if the drift bothers.
- The card is sized for the whole reply from the start (unspoken words laid out but invisible), so it doesn't grow as it types. Whole words only.
- Shows everything at once when speech ends, when you interrupt with the mic, when you leave or switch apps, or if there's no voice at all. English (if on) appears after the Italian has been spoken.
- `lib/speech/reveal.ts`, `npm run test:reveal`. Checked in Chromium with a fake reply and 4-second clip (screenshots at 0.7/2.2/3.7/6.2s). **Not verified on iPhone.**
- Also tonight: default speech speed 0.7 → 0.9, beginner (English on) 0.5 → 0.7.

## 2026-10-12: Voice dropout cause confirmed

- Josh checked ElevenLabs: the character quota was used up. That's why the voice dropped mid-conversation on 2026-10-11 and the phone's voice took over. The fallback note now says "Voice service quota used up" when it happens. Josh upgraded the ElevenLabs plan.

## 2026-10-12: Recording conversations; prompt audit (cloud session)

- **Recording.** Josh wants real transcripts to analyse after the fact. Every turn is now saved to Postgres via `/api/turn` (`lib/recording.ts`, built on the laptop's `lib/memory.ts` and `lib/learner.ts`): the opening line starts a conversation (anonymous learner cookie), each reply appends the learner's line and the character's, in order. The conversation id travels in an `x-conversation-id` header; the screen sends it back with each turn and, on leaving, a beacon to `/api/conversation/end` marks it ended (a new turn reopens it). Debug mode shows "Saved: yes (id)".
- Safety: recording never blocks or breaks a reply (errors logged, conversation carries on); does nothing without `DATABASE_URL`; a learner can only add to their own conversations.
- **Reading them:** `GET /api/admin/conversations?key=…&format=text` (plain transcripts, phone-friendly) or JSON without `format`. Locked by `ADMIN_KEY` in Railway; 404 if it isn't set. **Josh: add `ADMIN_KEY` in Railway** to use it.
- Fixed: `lib/db.ts` and `scripts/db-migrate.mjs` forced SSL for anything not inside Railway, so a local database couldn't connect; now off for localhost too. `query()` no longer uses `any`. `addConversationTurn` now takes the learner id (ownership) and reopens an ended conversation.
- Test: `npm run test:recording` (needs a local `DATABASE_URL`; skips otherwise; refuses Railway). Checked end to end locally: admin route 404 without key, text output, end beacon.
- **Not done:** the end-of-conversation notes + review log call, and loading notes into the prompt.
- **Prompt audit** (no changes made): most likely causes of long turns are structural, not wording: the character speaks first with nothing to respond to, and history is sent as a document rather than alternating messages. Details in roadmap Now #4.

## 2026-10-12: Length measured in the conversation test (cloud session)

- Decided with Josh: Claude tests the breadth of places and characters; Claude analyses Josh's transcripts; Josh notices problems and makes the final call (docs/10-testing.md).
- `lib/dialogue-stats.ts`: word and question counts per character reply (opener words, median/avg/longest, share over 30 words, questions per reply, share asking 2+). Yardstick from conversation research: turns are about 5–10 words. Measurements only, never sent to characters. `npm run test:stats`.
- `test:conversations`: a **Length** section in every report and per-character opener/median columns; a `.json` summary beside each report for comparing runs; `--seed=N` gives the same sample every time for before-and-after. The grader text is unchanged (still told not to penalize complex Italian; changing that needs Josh's OK); length is counted, not graded. Fixed a stale path in the recommender (prompt lives in `content/it/prompts/character.md`).
- Recorded conversations use the same measurements (`conversationStats` in `lib/recording.ts`).
- Rehearsed the whole test with a fake Claude here (no API key in the cloud session); the real baseline run is for the laptop: `npm run test:conversations -- --seed=7`.

## 2026-10-12: Roma character portraits generated for phone testing

**What was done:**
- Generated all 23 Roma character portraits using xAI Grok imagine-image-2.0
- Updated image generation manifest with completed portraits
- Committed and pushed portrait files to enable testing on phone

**Why:**
- Only anchor characters (Giulia, Rita) had portraits before; other Roma characters showed placeholder icons
- Complete portrait coverage needed for full Roma experience testing on iPhone
- Remote testing setup requested: dev server already accessible at http://192.168.4.182:3000 on local network

**Technical:**
- Used `npm run images -- --city roma` via `/api/generate-image` endpoint
- 22 new portraits generated (sandro-bar-angolo was already done)
- All portraits use pen and ink style with minimal watercolor wash per character portraitPrompt
- Total: 23 Roma character portraits + 2 anchors (Giulia, Rita) = 25 characters with portraits

**Next:**
- Test full Roma experience on iPhone via network URL
- Generate portraits for other cities if needed
- Continue with memory integration and conversation recording features

## 2026-10-12: Character memory (laptop session)

- **Built:** when a conversation ends, one Claude call (`lib/remember.ts`, prompt `content/it/prompts/memory.md` with version + changelog) writes the character's notes about you (at most 10 short lines, merged with what they already remembered) and the review log (2–3 things worth learning from their Italian, real mistakes, speech-to-text noise skipped). Next visit, the notes and visit count fill `{relationship}`: "You've met them twice. The last time was yesterday. You remember: …". Character prompt 2026-10-12: the wording moved from code into `character.md`; a first meeting is word-for-word unchanged.
- **When it runs:** the end beacon now also goes out when the app goes to the background (on iPhone, locking or switching apps never closes the screen, and Safari may drop the page later). Needs at least 2 learner lines. Safe to receive repeatedly: `conversations.memory_turns` makes it run once per new stretch of talk (two signals at once write once); a visit counts once per conversation; a failed call is released so the next signal retries.
- **Snapshot:** each conversation stores `memory_at_start`, and every turn of it uses that, so memory written mid-conversation (backgrounding) doesn't make the character "remember meeting you earlier today".
- **Where to see it:** admin transcripts (`format=text`) show REVIEW and THEY REMEMBER NOW under each conversation (needs `ADMIN_KEY` in Railway, still not set). No debug-panel line: Josh prefers checks done programmatically over debug states in the app, which are easy to leave on.
- **Smoke test:** `npm run smoke:memory -- --url=https://fuori-production.up.railway.app` holds a typed conversation with Sandro, ends it, opens a second visit and checks the `x-memory` header. Run on production after the deploy: memory written in 4 s, second visit "1 visits, 5 notes", Sandro greeted Josh by name, remembered Trastevere and followed up on an unanswered question. Test learner deleted afterwards via `railway ssh`.
- Noticed in that run (for the prompt work, not changed): Sandro's replies ran 40–50 words, and he called a two-week resident "ancora un turista con il contratto d'affitto".
- **Tried for real** on a sample Sandro conversation: good notes (name, Seattle, Trastevere, promised to try the maritozzo), caught *due settimana*, ignored "marito zoo" as noise; merges without duplicates; ~6 s (the phone doesn't wait).
- Tests: `npm run test:memory` (prompt part always; database part with a local `DATABASE_URL`: `createdb fuori_test`). `test:schema` also checks the memory schema; `test:prompt` checks memory.md's changelog.
- **Railway:** columns `memory_turns` and `memory_at_start` added via `railway ssh` before the push; deploy `c158992` succeeded.
- **Not done:** conversations that never send an end signal (page killed without a background event) aren't remembered; catching up on stale ones at the next opening would fix that if it shows up. Not verified on iPhone.

## 2026-10-12: Whisper echo fixed (laptop session)

- **Found in recorded transcripts:** learners' lines contained "Trascrizione in italiano…", the hint we sent Whisper. Whisper echoes its prompt into short or quiet recordings, and characters answered words nobody said.
- **Fix:** `/api/transcribe` sends no prompt; the language code comes from `content/it/language.ts`. `npm run test:transcribe` calls the route with a fake Whisper and fails if a prompt is sent (fails on the old code).
- **Seen, not fixed:** Whisper turns 3 s of silence into "Grazie a tutti." (likely Josh's first line to Giulia today). Whisper's scores can't tell silence from speech. Decided not to filter phrases: the code must work for any language, and nobody can predict what learners or characters will say. If it keeps showing up in transcripts, the language-neutral fix is checking on the phone whether the recording has any sound.
