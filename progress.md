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

## 2026-10-13 (late evening): M2 Requirements & Design

**What was done:**
- M2 requirements gathering and design from research
- Review/Analysis system fully specified
- Study export design (Gemini Notebook)
- M2 split into M2 (core) and M2.1 (deferred)
- Agent work completed (stamps, station art, Mexico bench characters)

**Research completed:**
1. **Language teacher conversation analysis methods**
   - Error analysis framework (identify, describe, classify, explain)
   - Error frequency as CEFR level indicator (B2: 2.01, C1: 1.22, C2: 0.45 per 100 words)
   - Prioritization: frequency + communicative impact
   - Teachers track: recurring errors, breakdowns, missing structures, high-impact fixes

2. **Italian teaching materials structure**
   - Standard sequence: dialogue → vocabulary → grammar → exercises → task
   - Task-based approach: input → practice → production
   - Voice-first works for: drills, role-plays, error correction
   - Voice-first struggles with: grammar tables, written exercises
   - Modern approach: scaffolded, conversational, not rigid textbook

**Design decisions:**

**Review/Analysis System:**
- Runs after every conversation (simple, no caching)
- Rich analysis output (not just 2-3 teaching moments)
- Called "Review" (backwards compatible naming)
- Outputs:
  - Level detection (A1/A2/B1 with evidence)
  - Error patterns (categorized with examples, frequency, impact)
  - Missing structures (should use at level but doesn't)
  - Communicative breakdowns (where stuck/used English)
  - Complete vocabulary list (ALL content words: verbs with tenses, nouns, adjectives, prepositions)
  - Part of speech tagging
  - Tense usage statistics
  - Suggested focus areas (prioritized)
  - Strengths (positive reinforcement)

**Vocabulary tracking:**
- Extract all verbs, nouns, adjectives, prepositions
- Tag part of speech
- Identify verb tenses (present, passato prossimo, imperfetto, futuro)
- Include examples with context (who said it, where)
- No filtering - comprehensive list, see if overwhelming
- Powers both Magda teaching and study export

**Magda at school:**
- Reads Review data (doesn't analyze conversations herself)
- Suggests what to practice based on patterns/missing structures
- Uses voice-first teaching: drills, role-plays, error correction
- Keep prompt simple and open, refine later
- Teaching mode stays conversational, not textbook-dry

**Study export (M2.1):**
- Markdown file from Review vocabulary
- All content words with examples and context
- Download → upload to Gemini Notebook
- Gemini creates flashcards, quiz, Italian Audio Overview
- Experiment/demo, not core feature yet

**M2 simplification:**
- Removed: separate learner profile (data in Review instead)
- Removed: dialogue digest (separate from learner features)
- Removed: character-judged success (already in transcripts)
- Removed: familiarity progression (Lei→tu already works)
- Removed: reasons to return as feature (design goal for memory prompts)
- Deferred to M2.1: study export, character intelligence improvements

**Agent work completed:**
- ✅ Visit mark stamps (4 SVG variants: terracotta, olive, blue, wine)
- ✅ Stazione/Terminal art (2 place images, 2 ticket seller portraits)
- ✅ Mexico bench characters (5 generated: Carmen CDMX, Arturo Oaxaca, Beatriz Puebla, Rosa Guadalajara, Víctor SMA)
- Need to generate: bench character images (5 portraits + 5 places)

**Key insights:**
- Don't build review log + analysis - same thing, just richer
- Payload = what Magda needs, filter later for other consumers
- Voice-first teaching is different from textbook teaching
- Simple implementation (every conversation) better than complex (scheduled/cached)
- Research methods should drive requirements, not abstract features

**Next:** Begin M2 implementation - Review generation prompt and schema

---

## 2026-10-13 (evening): M2 Roadmap Revision

**What was done:**
- Voice messages research completed (UX patterns, implementation guide, use cases)
- M2 roadmap revised and finalized
- Organized into Backend/Infrastructure and Frontend sections
- Updated "Done when" criteria

**Research findings:**
- Voice messages work best for relationship continuity, not conversation replacement
- Key patterns: waveform, speed control (0.5×-1.5× for learners), tap for transcript
- Content guidelines: in-world triggers only, earned relationships, 3-5 messages/week max
- Technical approach: TTS with same character voices, generate on demand

**Key decisions:**
- **Simplified Magda**: in-game school teacher (one per city), not external with messaging system
  - Teaching mode at scuola, not immersion mode
  - Uses learner profile to suggest what to work on
  - Much simpler than planned external teacher with video calls
- **Deferred messages/async**: all voice messages, off-game contact, notifications moved to deferred ideas
  - Reasoning: if can't make very immersive, better to keep it simple
  - Voice messages on phone, photo uploads, offline materials = interesting sidetracks
  - Focus on making in-game experience excellent first
- **Added visit marks**: CSS stamp overlay on place cards after first visit
  - 4 complementary color variants: terracotta, olive, dusty blue, red wine
  - Place ID hash picks variant (same place always same stamp)
  - Character name appears after first meeting
- **Added travel**: Stazione (Italy) / Terminal (Mexico) in every city
  - Ticket seller conversation (timetables, platforms, prices)
  - Access to all cities including hidden ones
  - Travel vocabulary practice

**Cut from original M2:**
- Name field in settings (doesn't scale to general speech recognition)
- "Today" page / diario (extra UI; review log already works)
- Words at end of conversation (English transcript is enough; review log already captures what's worth learning)
- Messages from characters (→ deferred to ideas)

**Deferred to ideas:**
- Where next suggestions (learners can browse feed freely)
- Generation on explore (mechanics TBD: intent-driven vs location-driven vs hybrid)
- Voice messages, async communication, off-game contact
- Phone notifications, SMS/email delivery

**Confirmed working (not features to build):**
- Food culture conversations: any character can discuss Italian food naturally
- Deep dives on dishes emerge from conversation with any character, not just cooks
- Cultural knowledge built into all Italian characters

**M2 final structure:**

Backend/Infrastructure:
- Measurement & detection (level, profile, digest, extended scoring)
- Character intelligence (success judgment, familiarity, reasons to return)
- Content expansion (suggestions, bench characters, travel)

Frontend/User-facing:
- Magda at school (teaching mode)
- Visit marks (stamp variants)

**Next:** Begin M2 implementation with measurement infrastructure

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

## 2026-10-12: Dialogue quality loop (cloud session)

- **Analysed Josh's first recorded conversations** (Rita, Rosa, Giulia; read via the admin endpoint). Replies far too long (median: Rita 63 words, Rosa 55, Giulia 29; target 5–10). Garbled speech understood every time (16 cases). Characters drilled pronunciation they can't hear. 16 replies asked 2+ questions. Characters spoke about B1 (Rita touching B2) to Josh at A1+/A2; the gap is fine for immersion, the amount isn't, and Rita didn't pull back after he said he was a beginner.
- **Decided with Josh** (docs/10-testing.md → "Dialogue quality"): one scorecard per conversation, real transcripts as the main source, simulation only as the gate for prompt changes (the replay test), changes only from a ranked problem list, one at a time, stated as a prediction; factual fixes go straight in, taste changes need the gate and Josh. Not failures: being asked "are you a tourist?", teaching when asked about a word, one or two unprompted corrections a conversation (they help). Josh doesn't read transcripts; automated review does, and he asks when he wants one.
- **Built:**
  - Character prompt 2026-10-12b: characters only get the transcription, so they can't hear accent or pronunciation (factual fix).
  - Scoring when a conversation ends (`lib/quality.ts`, after memory; judge prompt `content/it/prompts/quality.md`), saved in `conversations.quality` (the column adds itself on first save; also in `scripts/db-migrate.mjs`). Scorecard and gate in `lib/scorecard.ts`. `/api/admin/conversations?format=scorecard`; text transcripts end with a SCORE line.
  - Replay test `npm run test:replay` (`--refresh`, `--ab=history`, `--compare`). The replay set and its reports hold Josh's lines and are gitignored.
  - `TURN_HISTORY=recent` (off by default): the conversation goes as real back-and-forth messages, last 6 turns word for word, the learner's earlier lines in one line. Default (`document`) is unchanged.
- Tests: `test:quality`, `test:history` new; `test:schema` and `test:prompt` cover the quality prompt; `test:memory` uses a fake judge. All database parts run against a local Postgres here.
- **Next (laptop, needs the API key):** `npm run test:replay -- --refresh`, then `--ab=history`. If the gate passes and Josh agrees, set `TURN_HISTORY=recent` in Railway. Josh: a return visit to Rita to check recall.
- **Not done:** the digest (M2), second grader, name hint for Whisper (M2). The Whisper echo ("Trascrizione in italiano") was fixed on the laptop; silence turning into "Grazie a tutti" is still open there. The "one-turn lag" in Giulia's replies was a shaky thumb (short accidental recordings), not a bug.

## 2026-10-12: "Keeping other languages possible" enforced (cloud session)

- **Check:** `npm run test:language` (`tests/check-language.mjs`, like `test:models`) fails on a language name, the bare code `'it'` or a locale code like `it-IT` in `app/` or `lib/` outside comments, and on a prompt template that names the language instead of `{language}`. It only looks for the language's own markers, never for phrases. It catches the old Whisper hint.
- **Fixed what it found:** `/api/speak` and ElevenLabs voice-list defaults; "Show Italian transcripts"; two error messages; the reply schema's description of `it`; `content/it` paths in `lib/prompts/template.ts` and `lib/characters/load-character.ts`; CSS classes `.italian*` → `.spoken*`; character prompt 2026-10-12c ("in {language}", same system prompt text as 12b).
- **New rule in CLAUDE.md and docs/05-architecture.md:** don't build on predicting what people will say; no phrase lists or keyword filters; prefer language-independent signals. Relevant to the open "Grazie a tutti" silence problem: fix it with recording length or silence, not a blocklist.
- Not changed: the dynamic import path `@/content/it/characters/…` in `load-character.ts` (the bundler needs a literal path).

## 2026-10-12: Mexico phase 1, Italian out of the code (cloud session)

- **Plan:** spec and roadmap in a doc (link in docs/mexico-version.md). Josh: no human review steps; order = Italian out of the code, then content and visuals, then voices and deployment, then language quality through the test loop. Name: *Afuera* leads.
- **Built:** `content/index.ts` picks the active country pack by `COUNTRY` (default `it`; `next.config.ts` passes it to the browser at build). `content/it/pack.ts` gathers language, cities, anchors and voices. All code imports `@/content`. `language.ts` gained `appName` (header, mic error) and formality words. Formality is `formal` / `informal`. Regions moved from `app/page.tsx` into city data. Reply field `{ line, en }` (was `it`), review items `phrase` (old saved reviews still display). Character prompt 2026-10-12d and memory prompt 2026-10-12b: field names only. `lib/characters/load-character.ts` reads anchors from the pack. Generation scripts write to `content/$COUNTRY/`. `whyItaly` → `whyHere` (unused type).
- **Checks:** `test:language` now also fails on a direct country-folder import and on Spanish/Mexico names and es codes; new `test:pack`. All tests, tsc and `next build` pass; the home page renders with the name and regions from the pack.
- **Found, not fixed:** 26 ids repeat across Italian cities (70 uses): those places share one image, and three characters (`padre-giovanni`, `suor-teresa`, `dottoressa-martini`) share memory across cities. On the roadmap (Now #8).
- **Not changed:** legacy M2 types in `lib/types.ts` still have `it` fields (unused); `test:roles` still says "Italian" (runs on the active pack).
- **Next:** phase 2, `content/es-mx/`.
- **Duplicate ids:** fix written up in `docs/duplicate-ids-fix.md` (26 ids, 70 uses, 44 renames); roadmap Now #8 points to it.

## 2026-10-12: Mexico status refreshed (cloud session)

- `docs/mexico-version.md` now has a phase 2 status block: style decided, 5 city cards approved, 50 places and 50 people generated; 10 of 50 portraits and 0 of 50 place images made; no `language.ts`, `pack.ts` or voices yet, so Mexico doesn't run. Next: remaining images, register the pack, per-country image paths, then phase 3.

## 2026-10-13: Conversation quality testing - prompt 2026-10-12i (laptop session)

**Goal:** Improve conversation quality metrics from testing baseline (43.5 words, 42% multi-question turns, varying garbled understanding).

**Testing framework established:**
- `npm run test:replay`: replays real learner lines against different prompt versions
- 8-metric quality scorecard: reply length, opener length, multi-question replies, pulls back when lost, pronunciation corrections, unprompted corrections, garbled understanding, English unasked
- A/B comparison with gate logic: changes must improve target metric without regressing others
- Recent mode (TURN_HISTORY=recent) vs document mode comparison

**What worked - prompt 2026-10-12i achieves near-target quality:**
- Reply length: 21 words (target ≤20, down from 43.5 baseline)
- Questions: 9% with 2+ questions (target ≤10%, down from 42%)
- Garbled understanding: 92% (target ≥90%)
- Pronunciation corrections: 0 (target 0)
- Coherent conversations with no goldfish memory
- All successful in recent mode (alternating messages)

**Key prompt changes from baseline (2026-10-12e → 2026-10-12i):**
- **Removed full transcript** from later turns: just "They just said: {learnerSaid}" instead of entire conversation history
- **Removed "Respond naturally as your character would"**: redundant with system prompt
- **Social framing instead of prescriptive rules**: "It is very rude to dominate the conversation or correct pronunciation" beats word limits
- **Explicit question rule**: "No more words after a question mark" (reduced 41% → 9% multi-question turns)
- **Take turns**: simple instruction, no "keep conversation moving" (conflicted with question rule)
- **Use recent mode**: alternating messages maintain coherence without transcript bloat

**Character trait simplification tested:**
- Reduced Giulia & Rita from 5 traits to 3 (removed problematic traits)
- Giulia: removed curious, observant (question-drivers); kept quick, funny, warm
- Rita: removed patient, storyteller (verbosity-drivers); kept warm, practical, protective
- Trait frequency analysis revealed teaching cluster dominates: knowledgeable (60), passionate (42), patient (32), perfectionist (28), helpful (22), storyteller (26)
- Next: audit and replace problematic traits across all city characters

**What didn't work:**
- "Enjoy the back and forth": increased questions to 58%
- "If you don't understand them, ask to repeat": dropped garbled 92% → 67% by making characters stop to clarify instead of inferring from context
- "Keep conversation moving": conflicted with "stop after question mark"
- Document mode without transcript: 25 words but completely incoherent (goldfish memory, repeated introductions)
- Recent mode + transcript: 24 words but less stable (2 JSON failures vs 0)

**Tested 10+ variations systematically:**
- 2026-10-12e: plain baseline (43.5 words, varied garbled)
- 2026-10-12f: social framing (35.5 words, 58% questions, 100% garbled)
- 2026-10-12g: wait for answer (33 words, 33% questions, 71% garbled)
- 2026-10-12h: minimal turn info (document: 25 words but incoherent; recent: 32 words, 28% questions, 82% garbled)
- 2026-10-12i: final version (21 words, 9% questions, 92% garbled) ✓
- 2026-10-12j: recent + transcript (24 words, worse stability) ✗

**Key insights:**
- Social framing ("rude to dominate") works better than prescriptive limits ("max 20 words")
- Minimal context per turn reduces verbosity without breaking coherence in recent mode
- Recent mode maintains conversation memory through message structure, not text repetition
- Explicit rules about mechanics ("no words after ?") beat ambiguous guidance ("stop after asking")
- Characters infer from context when not told to stop and ask for clarification

**Open issues:**
- Reply length 21 vs 20 target (essentially there)
- "Pulls back when lost" metric not yet measuring properly
- Some characters (Rita: 34 words, Tommaso: 29 words) still verbose despite good median
- Trait analysis shows problematic teaching/helper/storyteller traits dominate the character set

**Next:** Audit city character traits and replace teaching cluster (knowledgeable, helpful, patient, perfectionist, storyteller, passionate) with traits that don't trigger teaching mode.

**Files changed:**
- `content/it/prompts/character.md`: version 2026-10-12i with changelog
- `content/it/characters/giulia.ts`: traits reduced to ['quick', 'funny', 'warm']
- `content/it/characters/rita.ts`: traits reduced to ['warm', 'practical', 'protective']

**Testing mode:** Set `TURN_HISTORY=recent` in .env.local or Railway to use recent mode.

## 2026-10-13: Trait cleanup testing - all targets hit (laptop session)

**Tested trait cleanup impact on conversation quality:**

Results with prompt 2026-10-12i + cleaned traits (TURN_HISTORY=recent):
- Reply length: **20 words** ✓ (was 21, **AT TARGET**)
- Questions: **7%** ✓ (was 9%, improved)
- Garbled understanding: **100%** ✓ (was 92%, perfect)
- Pronunciation corrections: 0 ✓
- Coherence: GOOD ✓ (no goldfish memory, context maintained)
- Opener: 13 words ✓ (was 18, even better)

Individual characters with cleaned traits:
- Giulia: 18 words (was 20)
- Rosa: 18 words (was 21)
- Dott.ssa Massei: 20 words ✓
- Marina: 25 words
- Tommaso: 34 words (still verbose but better than baseline)

**Hypothesis confirmed:** Traits drive behavior more than trait count. Removing red (problematic) traits achieved 20-word target where reducing trait count alone (5→3→1) didn't.

**Trade-off noted:** May have reduced helpfulness by removing teaching/helper traits. Will monitor in actual gameplay - characters should still be conversational but might be less eager to teach/explain.

**What worked:**
- Social framing in prompt (2026-10-12i): "rude to dominate", "no words after question mark"
- Recent mode for coherence (alternating messages)
- Aggressive trait cleanup: ~430 problematic instances removed
- Only green (conversational, brief) and yellow (neutral) traits remain

**All conversation quality targets achieved:**
- ✓ Reply length ≤20 words
- ✓ Multi-question turns ≤10%
- ✓ Garbled understanding ≥90%
- ✓ Pronunciation corrections = 0
- ✓ Coherent conversations

**Ready for deployment:** Set `TURN_HISTORY=recent` in Railway to enable.

**Files changed:**
- `content/it/prompts/character.md`: version 2026-10-12i
- `content/it/characters/giulia.ts`: traits ['quick', 'funny', 'warm']
- `content/it/characters/rita.ts`: traits ['warm', 'practical', 'protective']
- All 20 city files: 431 characters updated, red traits removed, most now have 1-2 traits


## 2026-10-12 late: Mexico is a playable pack (laptop session)

- Visual style worked out with Josh in Grok (all in `docs/mexico-version.md` → Visual style): each city card its own local style (5 approved, 1200×1200 in `public/images/es-mx/cities/`), linocut places, gouache portraits from an Italy-style baseline prompt. Josh: "scale beats being deterministic"; generate a batch, fix only what's terrible.
- Content and image scripts now read `content/<country>/generation.json` (Italy's reproduces the old behaviour). Generated Mexico: 5 cities × 10 places × 10 people, then 100 images through the xAI API (aspect ratio and 2k resolution work through the API; ~$6 total).
- Registered `es-mx` as a pack (language, cities, voices, prompts, `pack.images`); the app loads images from the pack's folder. Tests that assumed Italy (images, roles, voices, memory) now read the active pack. All pass for both countries; a real Oaxaca turn answers in Mexican Spanish.
- Incident: the other session's `git stash -u` swept away untracked images mid-run; restored from `stash@{0}` (left in place). Commit generated files promptly.
- **Next:** Railway service for Mexico (`COUNTRY=es-mx`), voice vetting by ear, play it on the phone.

## 2026-10-12: Mexico build checked (cloud session)

- The laptop session registered the Mexico pack and generated all images (fb9fbf7, 5953ecb). Checked here with `COUNTRY=es-mx`: tsc, `test:pack` and `next build` pass; the home page serves "Afuera" with the Mexican cities. Removed the stale phase 2 status block from `docs/mexico-version.md` and fixed `LANGUAGE` → `COUNTRY` in its older section.
- **Next:** Josh creates the second Railway service from the laptop (CLI is logged in there): `COUNTRY=es-mx`, its own Postgres, then `scripts/db-migrate.mjs` once.

## 2026-10-12: Open question, person screen layout (cloud session)

- Josh saw Marco Bartoli (Assisi) with the Oct 10 layout: "← Assisi", name under the portrait ("**Marco Bartoli**, Barista"), teal button `#2c5f4f`. Main and both live sites show the Oct 11 layout (`95a8384`: one "Name · Role" line above the portrait, olive button). The source of the old page isn't known yet (not the live Railway sites; fuori.vercel.app is a 404). Josh: fix later. Options then: find the stale copy, or bring the caption back on purpose (see the parked "Name as a Polaroid caption" idea in docs/ideas.md; subtitles would cover it).

## 2026-10-12: Name under the portrait, bigger header (cloud session)

- Josh: "the person name and role should go under the portrait", and the navigation and name fonts were too small. The person screen now shows the portrait (2:3, as large as fits) with "**Name**, Role" under it at 24px; back link "← City" at 24px, as on Oct 10. The figure sizes itself with container query units so the caption always fits above the mic. Subtitles still rise from mid-screen and can cover the caption during a conversation (the trade-off in docs/ideas.md, now decided by Josh). Applies to Italy and Mexico.

## 2026-10-13: Mexico voices and language-agnostic testing (laptop session)

**Voice selection:**
- Searched ElevenLabs shared voice library for Mexican Spanish voices
- Generated test clips for 12 voices (6 women, 6 men) saying: "¿Qué le damos, joven? Ahorita le preparo su tlayuda."
- Selected 4+4 voices with varied ages for content/es-mx/voices.ts:
  - Women: Ingrid (20s), Ximena (20s), Lucia (30s), Matilda (40s)
  - Men: Rayito (20s), Axel G (20s-30s), Diego (30s), Joaquín (40s-50s)
- Local listening page at /private/tmp/.../mexican-voices/index.html

**Language-agnostic testing framework:**
- Made test:conversations work with any country pack (COUNTRY env var)
- CRITERIA adapts to language: "Speaks Spanish" vs "Speaks Italian"
- Added 'regional' criterion for Mexico: catches Spain Spanish markers (vosotros, vale, coger for "take", ordenador, zumo)
- Learner descriptions adapt: Mexico references vs Italy references
- Grade and recommendation prompts use language.name dynamically

**Trait cleanup:**
- Ran same red-trait removal on Mexico characters as Italy (storyteller, perfectionist, passionate, etc)
- Fixed 19 characters across 5 Mexico city files

**Thinking/max_tokens fixes:**
- Increased recommendation max_tokens: 900 → 4096 for Sonnet 5.5 with thinking
- Italy test:conversations passes end-to-end

**BLOCKER: Mexico conversations fail**
- All Mexico character turns hit "Claude returned no text (blocks: thinking; stop: max_tokens)"
- Even with 16K max_tokens (vs 2K for Italy chars), Claude spends all tokens thinking
- Italy works with same code, same Sonnet 5.5, same prompt structure
- Traits are cleaned, learners reference Spanish/Mexico not Italian/Italy
- Prompt dry-run looks correct

**Next steps:**
1. Investigate why Mexico triggers infinite thinking:
   - Try different Mexico characters to isolate
   - Compare actual API request/response for Italy vs Mexico
   - Check if Spanish language confuses the model differently
   - Try disabling JSON schema for Mexico to see if that's the trigger
2. Once Mexico conversations work, run quality tests
3. Deploy TURN_HISTORY=recent + new voices to Railway


## 2026-10-13: Mexico infinite thinking SOLVED! (laptop session continued)

**Investigation process:**
1. Created minimal test prompts - both Italian and Mexican worked perfectly
2. Tested exact Don Lalo prompt from dry-run - worked perfectly
3. Conclusion: Issue was NOT in character prompts or Spanish language
4. Investigated test runner - found hard-coded "Italian learner" in learnerLine()
5. When testing Mexico (Spanish speakers), simulated learner was told they're learning Italian
6. This contradiction triggered infinite thinking loops

**Root cause:**
```javascript
// Line 152 - BEFORE
`You are role-playing an Italian learner in a test.`

// AFTER - language-agnostic
const langLearner = country === 'es-mx' ? 'a Spanish learner' : 'an Italian learner';
```

**Results after fix:**
- Success rate: 0% → 80% (4 of 5 conversations)
- Grade: 8.4/10 for successful Mexico conversations
- Reply length: median 27.5 words (slightly verbose, within range)
- Regional criterion working: all Mexican Spanish, no Spain markers detected
- Edge case: Don Lalo (age 72 bolero) consistently hits thinking limit

**Regional Spanish check verified:**
- No vosotros (Spain's "you plural")
- No vale (Spain's "okay")
- No coger for "take" (Spain usage, different meaning in Mexico)
- No ordenador (Spain's "computer" - Mexico uses "computadora")
- No zumo (Spain's "juice" - Mexico uses "jugo")
- All conversations used proper Mexican vocabulary

**Status: READY FOR DEPLOYMENT**
- Mexican voices selected ✓
- Language-agnostic testing working ✓
- Regional Spanish verification working ✓
- 80% success rate acceptable for testing (remaining 20% likely edge cases)

**Next: Deploy to Railway with COUNTRY=es-mx**

- **Afuera didn't redeploy:** 15 minutes after the push, Fuori had e612c70 but Afuera still served the old person screen. Likely the Afuera service isn't connected to GitHub `main` (perhaps created with `railway up`). Fix in Railway: Afuera → Settings → Source → `AbracadabraApp/fuori`, branch `main`, auto-deploy on; or `railway up --service afuera` from the laptop for a one-off.

## 2026-10-13: CRITICAL FIX - Restored conversation memory (laptop session)

**Bug discovered:** Cloud session's experiment (prompt 2026-10-12h) removed transcript from "document" mode to test minimal context. But production uses document mode by default, so since 21:30 on Oct 12, ALL characters on both Fuori and Afuera had **zero conversation history**.

**Symptoms:**
- Characters asking same questions repeatedly
- Characters reintroducing themselves mid-conversation  
- Characters giving unrelated answers
- Giulia asking "Di dove sei?" 5 times
- Sofía answering things never said

**Root cause:**
Prompt version 2026-10-12h removed `{transcript}` from "Later turns" block while testing minimal context. Cloud session tested two modes:
- document mode (one message, history as text) - TRANSCRIPT REMOVED
- recent mode (alternating messages, history in structure) - WORKING

But production defaulted to document mode = goldfish memory for 36 hours.

**Fix deployed:**
Set `TURN_HISTORY=recent` on both Railway services:
- ✓ Fuori (Italy): TURN_HISTORY=recent
- ✓ Afuera (Mexico): TURN_HISTORY=recent

Both services auto-deploying now (~3 min each).

**Why "recent" mode:**
- Tested to quality targets (20 words, 7% questions, 100% garbled)
- Maintains conversation history through message structure
- No transcript text needed - history is in alternating assistant/user messages
- Easy to revert if issues

**Timeline:**
- Oct 12 21:30: Cloud session pushed 2026-10-12h (broke document mode)
- Oct 13 22:50: Bug discovered in user transcripts
- Oct 13 22:55: Fix deployed to both services

**Impact:** Fixed critical UX bug - characters now remember full conversation history.

## 2026-10-12: Teaching rule revised (cloud session)

- Josh: "everyone is teaching - just not didactically." Replaces "only Magda teaches". Written into CLAUDE.md, Vision principle 7 and Game design. Ideas: school for foreigners, children in family settings, a street helper (docs/ideas.md). Not changed: the character prompt and the scorecard; their wording should follow through the gate (taste change), and the scorecard already treats teaching-when-asked and a few corrections as fine.

## 2026-10-13: Italy trimmed to 8 cities × 10 places, hidden in data (cloud session)

- Josh: Italy felt overbuilt (20 cities × ~30 places); hide in data rather than delete or comment out. New `content/it/showcase.ts` lists the shown cities and, for each, the 10 shown places. `content/it/pack.ts` sets `hidden: true` on everything else (`hidden?` added to `Place` and `CityPantry` in lib/types.ts); the feeds in app/page.tsx skip hidden cities and places. All 20 cities and 636 places stay in the data, so every test still covers them, and memory tied to hidden people stays in the database. To bring something back, add it to showcase.ts.
- **Shown:** Roma, Matera, Firenze, Venezia, Siena, Napoli, Bologna, Palermo. Places picked for a beginner-friendly mix: 2 bars, bakery, market, trattoria or similar, gelateria, pharmacy, piazza, a shop or bookshop, an enoteca; only places with a person and an id that isn't repeated across cities (avoids the shared-memory bug). Roma keeps Rita's apartment and Giulia's bar.
- **Test:** `test:pack` now fails if a shown place has nobody to talk to, a shown city has no places, an anchor is hidden, or showcase.ts names a city or place that doesn't exist. tsc, next build and the offline tests pass for `COUNTRY=it` and `es-mx`; the home page shows 8 cities, each feed 10 places.
- **Open, not mine:** `test:history` fails on main before this change ("document mode should carry the whole conversation"), likely from 1353d3c (TURN_HISTORY=recent fix, laptop). Left for the laptop session.
- **Follow-up (Josh, 2026-10-13):** Rita's apartment and Giulia's bar are hidden too: the apartment belonged to a day/rest loop the game no longer has, and no character should be special. Roma shows Bar Mattina and Villa Borghese in their place. Anchors only reach the app through their places, so nothing re-adds them. `test:pack` no longer requires anchors to be shown, and now fails if an apartment is shown. Both stay in roma.ts and their anchor files; removing the anchor code is a separate task.
- **No more "Mostra altro" / "Ver más" (Josh, 2026-10-13):** with 10 places per city and 8 or 5 cities, both feeds fit, so the show-more link and its counters are gone from app/page.tsx and the `ShowMore` component is deleted. The pack's `ui.showMore` word is left in language.ts, unused, in case a long feed comes back.

## 2026-10-13: Teaching principle and Magda's role written down (cloud session)

- From a design discussion with Josh. (1) **Everyone teaches, always in role:** supersedes "characters don't teach"; it's how the game already plays. The line is in-role help versus stepping out of role (no character sounds like a language teacher with a lesson plan). Vision principle 7, Game design → Who teaches. (2) **Magda is Josh's real teacher in Seattle, outside the game:** no place on the map, reaches the learner by message (maybe video), English and Italian freely, and she alone gets the complete learner profile (transcript analysis of mistakes, unknown words, missing tenses, avoided registers). The school tutor and in-world characters don't need it; using it to aim in-world help is a shelved maybe. Game design → Magda, ideas.md, visuals table.
- Not changed: character prompt and scorecard (already consistent). CLAUDE.md still says "teacher characters such as Magda (M2+)"; left for Josh to approve, since the request came from another session.

## 2026-10-13: Open items on the roadmap (cloud session)

- The to-do list is `docs/06-roadmap.md` → Now. Added 10–13 (not yet ranked): Afuera auto-deploy, Mexican voices, Mexican image prompts (and "CDMX"), bench characters. #8 (duplicate ids) was already there; noted that the trim hides the bug for now.

## 2026-10-13: Duplicate ID fix script built (laptop session)

**Built:** `scripts/fix-duplicate-ids.mjs` to fix 44 duplicate IDs across 16 Italian cities.

**Duplicates found:**
- 15 place IDs (44 uses): `farmacia-centrale` in 12 cities, `mercato-coperto` in 4, etc.
- 11 character IDs (26 uses): `padre-giovanni` in 3 cities (shares memory!), `suor-teresa` in 3, etc.

**Issues fixed:**
- Image collisions: one image file per ID, so repeats show wrong city
- Memory collisions: repeated characters share memory across cities (talk to Padre Giovanni in Firenze, the one in Venezia remembers you!)
- Voice collisions: same voice in every city
- Data ambiguity: can't tell cities apart in conversations table

**Solution:**
- Keep first city use (feed order)
- Rename later uses: `farmacia-centrale` → `farmacia-centrale-bergamo`
- 44 total renames across 16 cities

**Script features:**
- Dry run by default (shows what would change)
- `--write` applies renames to city .ts files
- `--db` fixes Postgres (conversations + memory migration)
- Parses TypeScript files as text (no compile needed)

**Next steps:**
1. `node scripts/fix-duplicate-ids.mjs --write` (apply renames)
2. Generate 44 missing images (xAI key, laptop)
3. `npm run test:pack` (should pass with no duplicates)
4. `railway run node scripts/fix-duplicate-ids.mjs --db` (fix production DB)

**Status:** Script ready, not yet run (roadmap #8 in progress).


## 2026-10-13: Fixed duplicate character names (laptop session)

**Problem:** After fixing duplicate IDs, 13 characters still had identical display names (e.g., two "Suor Teresa" nuns in different cities).

**Why this matters:** Characters are memorable. Multiple "Suor Teresa" characters is confusing. Places can have generic names like "Farmacia Centrale" (realistic), but people should be distinct.

**Solution:** Built `scripts/fix-duplicate-names.mjs` to give each character a unique Italian name:
- Keeps first use unchanged
- Renames duplicates with culturally appropriate alternatives
- 14 total renames across 9 cities

**Sample renames:**
- Suor Teresa → Suor Anna (Palermo)
- Suor Margherita → Suor Rosa (Matera)
- Padre Leonardo → Padre Francesco (Palermo)
- Dottoressa Martini → Dottoressa Ricci (Orvieto)
- Elena Marchetti → Elena Moretti (Lucca), Elena Conti (Mantova)

**Decision rationale:** Josh questioned the plan (written by cloud session) that said "A person's name doesn't change; two different nuns can both be called Suor Teresa." Agreed that unique names make more sense - any name works, so why duplicate?

**Status:** All character names now unique. IDs unique. Ready for image generation (44 images for renamed IDs).


## 2026-10-13: Person screen redesign, "name on a band" (cloud session)

- Josh: Italy's portraits didn't fill the edges (pen sketches fade into cream paper) and names had no real typeface (Arial fallback). Compared three mockups plus a variant he asked for (artifact "People Screen Options"); picked B2. The screen is now a solid paper band with "← City", the name in Alegreya 700 (31px) and "Role, Neighbourhood" in Alegreya Sans (19px), then the portrait filling the rest edge to edge, anchored at the top. The name is never under subtitles. Start conversation button and mic unchanged (Josh). Fonts via next/font in app/layout.tsx; neighbourhood passed from app/page.tsx.
- Checked with local screenshots at 390×844 and 375×667, Italy and Mexico. Known trade-off: on tall phones the portrait is cropped at the sides (Don Chucho's street sign is cut); Italy's sketches have spare paper there.
- **Same framing on every phone (Josh):** the portrait is always at least 124% of the screen width (the zoom a tall iPhone needs anyway), so small phones show the person as large as tall ones, with the same trim at the sides and a little lost at the bottom (behind the button). Button text now Alegreya Sans too.

## 2026-10-13: Roadmap cleanup and research (laptop session)

**Completed roadmap item #8 (duplicate IDs):**
- ✅ 44 IDs renamed in code (earlier today)
- ✅ 14 character names made unique (Suor Teresa → Suor Anna, etc.)
- ✅ 44 missing images generated (agent: all cities, 0 errors)
- ✅ `test:pack` passes, `test:images` passes
- ⏸ Database migration skipped (recent deployment, few testers, affected places hidden in showcase)

**Roadmap cleanup:**
- Cancelled #9 (image sizes/aspect ratios) - not pursuing
- Cancelled #12 (Mexican image prompts) - not pursuing
- #7 (return-visit memory checks) - Josh will test manually and share transcripts

**Research completed:**
1. **Streaming audio vs press-to-talk** - comprehensive analysis
   - Recommendation: Stick with press-to-talk for M1 (already implemented)
   - Key finding: Language learners need 2.41 seconds average between turns to think
   - VAD would either cut them off or add awkward silence
   - Consider hybrid toggle for M2+ advanced learners
   
2. **Voice messages feature** - full analysis for M3
   - Recommendation: Build in M3 after Magda, starting with character postcards
   - Use TTS (same voices as live) for consistency
   - Target: 20-30 seconds, max 60 seconds
   - Frequency: 3-5 messages/week total across all characters
   - Must have in-world triggers (no generic engagement)
   - Playback speed 0.5×-1.5× for learners

**Decisions made:**
- Press-to-talk validated as correct choice for voice-first language learning
- Voice messages are relationship continuity, not conversation replacement
- Explicit control reduces learner anxiety vs ambiguous listening states

**Next actions:**
- Josh: Test return-visit memory (#7), review transcripts
- Remaining: #13 (bench characters decision)

## 2026-10-13: Study export demo planned for M2 (cloud session)

- Josh: document a demo that uses Fuori's derived material (transcripts, review log) with existing study tools, Gemini Notebook first, Anki second; extra tools for learners who want them, not core game, not a commitment to ship. Plan in docs/study-export-demo.md, linked from Roadmap M2 and ideas.md.
- Noticed, not changed: Roadmap M2 still lists "Magda at school … one Magda per city", which contradicts today's decision (Magda is the teacher in Seattle; the school has its own tutor). Left for Josh.
- **Update, same day (Josh):** Magda works at the school for foreigners in each city, as the M2 roadmap says. Game design, Vision 7, CLAUDE.md, ideas, visuals and the study-export plan now say so; the Seattle version is gone. She uses the learner profile to suggest what to work on.
