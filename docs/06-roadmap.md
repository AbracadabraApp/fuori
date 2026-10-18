# Roadmap

Each milestone ends with something playable on your phone. There is no separate validation phase: the first real test is talking to a character in the app.

This file is the one place for **what's in each milestone** and **what to do next**. Parked ideas live in [Ideas](ideas.md); questions waiting on a decision live in [Open design questions](open-design-questions.md); what happened each session lives in `progress.md`.

## Now

The one to-do list, by feature area (reorganized 2026-10-18 at Josh's request). Each item says who does it: **Josh** or **Claude**. ⛔ marks a blocker: work that waits on someone. Detail lives in the linked docs; done and removed items are at the bottom of this file.

### ⛔ Blockers: what's waiting on Josh
Claude can't move these until Josh does:
1. **Play Afuera with the level trial on**, so Claude can review those conversations (→ Beginner ladder)
2. **Spec for the smaller world** (→ Smaller world, on hold)
3. **Feedback on the city picker**: what's wrong with it (→ Parity with the web)
4. **Device checks on the iPhone** (only Josh can do audio on the phone) (→ Conversation on the phone)

### Conversation on the phone
- [ ] **Josh** Try today's build: pick a country on first launch; Settings → switch country and back; Settings → Privacy; touch and hold Version → Learner shows 3c544022, debug panel; someone you met on the web remembers you; a typed reply with the mic off
- [ ] **Josh** Try Magda in the app
- [ ] **Josh** ⛔ Device checks: a call, Siri, AirPods in and out, backgrounding, locking
- [ ] **Josh** A long conversation on prompt 2026-10-18 (characters now see the whole conversation): does anyone still repeat their introduction or ask where you're from twice?

### Faster and reliable replies
Goal: reply under 2 s, 4 s at most (today about 6 s of waiting, Claude 3.6 s median of it).
- [x] **Claude** Raised the reply cap from 800 to 1200 in `lib/turn.ts` (Josh's OK, 2026-10-18). Round 16 (810 replies, same call with a 1500 cap; Italy's real scripts, simulated Mexico): median 329–343 tokens, 99% under 714, the largest 847; 2 of 810 (0.25%) went over 800, which fails the turn today; none over 1200. Most of it is thinking (with thinking median 355–396 tokens; without, 113–169). The replies near the cap took 7–8 s.
- [ ] **Claude** Investigate the ~6 s after a turn: where the time goes besides Claude
- [ ] **Claude** Try Haiku for characters (1.6 s against about 3.4 s), with the level judge as the guard
- [ ] **Claude** Start the voice as soon as the line is streamed
- In progress (another laptop session, not yet committed): replies without thinking (`TURN_THINKING=off`, a speed trial behind a setting)

### Characters feel alive
Goal: alive 7 (today about 6 in real conversations, 5–7 with simulated learners). Order decided by Claude, judged by Josh (2026-10-18); one change at a time through the replay gate.
- [x] **Claude** Real conversations sorted by what goes wrong (round 15): the worst were characters repeating themselves; the order form ("X o Y?") is rare in real play (8–15% of lines)
- [x] **Claude** Characters see the whole conversation, not the last 6 messages (prompt 2026-10-18): repeats halved (4.4% → 2.4% of lines)
- [ ] **Claude** One concrete detail per character (an opinion, something they care about): only 15 of 703 characters have more than role, traits and setting. Generate it for the characters in the replay set, put it in the prompt, replay; keep it if alive rises and lines a beginner can follow don't drop
- [ ] **Claude** Separately, "react before asking" in the prompt, with a count of repeated patterns (rules like it made tics before, round 5)
- [ ] **Claude** If it passes: generate details for the remaining ~680 characters, check a sample, fix only what's terrible
- [ ] **Claude** A replay set for Mexico (the replay set is one file and holds only Italy's conversations today)

### Language level of the dialogue (what characters say) ([language-levels-plan.md](language-levels-plan.md))
Goal: 90% of the character's words at the learner's level (Josh; the [research](research/language-app-levels.md#word-coverage-predicts-confusion-and-llm-judges-can-grade-speech) suggests 95% for easy listening). Today a beginner can follow about 25% of lines on today's prompt.
- [x] **Claude** Level on the scorecard: "Lines a beginner can follow" (`lib/level.ts`, `level.md`), scored by the replay; real play not yet
- [x] **Claude** The `test:conversations` grader no longer says complex language is fine; it reports "Lines a beginner can follow" instead (Josh's OK, 2026-10-18). Baseline: 10% Italy, 11% Mexico
- [ ] **Claude** Level in the character prompt for every learner, every turn, in role, once the learner's level exists (below). The Beginner block ("still you, sometimes ask") is picked and on trial for Josh. Beginners: characters teach key phrases in role, such as how to ask "Come si dice …?", instead of a button (Josh, 2026-10-16; asking it by voice already works)
- [ ] **Claude** Question ladder for Intermediate and Advanced (one fact, then anything), measured with the question-kind count
- [ ] **Claude** Level of real play on the scorecard (a call per line, so decide the cost first)
- [ ] **Josh + Claude** More dialect as you level up (the dialect setting is greyed out today)

### Learner level (placement and moving up)
Doesn't exist as a system yet; onboarding's placement, Magda's study-file Level line and an unused type are separate pieces ([language-levels-plan.md](language-levels-plan.md) → 1).
- [x] **Josh** Decided (2026-10-18): onboarding's level is a first guess; the first conversations confirm or move it. Round 14: one conversation corrected every misplacement
- [ ] **Claude** Level check at the end of each of the first 3 conversations, updating `learners.level`, behind a setting that's off by default
- [ ] **Claude** Run it on saved real conversations (Josh's included); **Josh** compares it with his own judgement
- [ ] **Claude** Moving up later: when 90% of the learner's speech is at the next level, across several conversations (Josh, 2026-10-15). Magda suggests it, the learner decides
- [ ] **Claude** Level and settings saved with the learner (speed, default subtitles); then turn on the greyed-out level control in Settings

### Onboarding ([onboarding-design.md](onboarding-design.md))
- [x] **Josh + Claude** Flow, engineering needs, built and tried in both countries (2026-10-17)
- [x] **Claude** The send-off failed on mixed answers (one English, one fluent): fixed 2026-10-18

### Beginner ladder ([beginner-scaffolding.md](beginner-scaffolding.md))
Five levels, from tapping a reply with English to filling a frame in your own words.
- [x] **Claude** Reply buttons from a separate call (`lib/replies.ts`, test-only): sensible 97–100%, ready before the character finishes speaking
- [ ] **Josh** ⛔ Play Afuera with the level trial on (Beginner "still you, sometimes ask", his learner only): plainer lines and now and then an easy yes/no or this-or-that question?
- [ ] **Claude** Review those conversations (prompt version `2026-10-18+Beginner: still you, sometimes ask`)
- [ ] **Claude** A first playable version of levels 1–3 behind a setting (live dialogue with reply buttons), so Josh can feel it in Afuera
- [ ] **Claude** Tests queued in [test-ideas.md](test-ideas.md): live with lookahead, a plan for the visit, "Ripeti?" on levels 4–5, Mexico at 20 conversations

### Smaller world for beginners: on hold until there's a spec (Josh, 2026-10-18)
Josh's idea (2026-10-17): for levels 1–3, fixed scripts per character, the same for every learner, in one neighbourhood until level 4. Explored in rounds 11–13 ([level-judge-test.md](level-judge-test.md)); described in [beginner-scaffolding.md](beginner-scaffolding.md) → "On hold". No work on it until the spec exists.
- [ ] **Josh** ⛔ Spec: what's fixed and what's generated; which neighbourhood(s) per country; how many visits and in what order; what earns leaving it; how it fits levels 1–3; whether audio is recorded once
- What the tests found: a scripted neighbourhood is cheap to write (24 characters, about 50 scripts, minutes) and the easiest dialogue yet (70–84% of lines a beginner can follow), but where both replies must lead to the same next line, one path ignores the learner's answer; forcing a this-or-that choice at every join made it a quiz (round 13)
- Parked tests: scripts as a tree with no joins; visits ordered so frames build up ("Vorrei…" before "Sono di…")

### Parity with the web
- [ ] **Claude** Visit stamps redesigned (collectible, on the caption, not a number in a circle)
- [ ] **Josh** ⛔ Say what's wrong with the city picker; then **Claude** improves it
- [ ] **Claude** Stations and ticket: departures board, the clerk names the platform, "Sali"

### Release
- [ ] **Josh + Claude** TestFlight: signing and the App Store Connect side (**Josh**); icon, microphone text, privacy label (**Josh** approves, **Claude** prepares); App Attest, usage tracking, per-learner budgets (**Claude**, before anyone but Josh gets it)
- [ ] **Claude** R2 custom domain (the free r2.dev address is rate-limited, for development only); **Josh** picks the domain
- [ ] **Josh + Claude** App Review: privacy policy URL (**Josh**), "report this line" button (**Claude**)
- [ ] **Claude** Web sunset, about 2 weeks after TestFlight

### Housekeeping
- [x] **Claude** Railway watch paths: docs-only commits are now skipped (seen 2026-10-18)
- [ ] **Claude** Move the test scripts from the laptop scratchpad into the repo (`qtype.mjs`, `replies.mjs`, `place-test.mts`, `repeat-test.mts` and others), so a cloud session can run them

### Next release (likely deferred)

Works or is wanted, but not for the first release.

- [ ] **both** Hands-free extras: prepare the reply during the silence; the wait adapts to cut-offs and counts them. Hands-free itself stays in Settings, off by default. Josh, 2026-10-16, after using it: it works well but feels like an expert feature, not because of difficulty but because of the focus a free-flowing conversation takes; pressing a button is more forgiving on response time (perception) and gives the speaker more control.
- [ ] **app** Night-paper palette, so the app follows the phone's Dark Mode (D1). Until then the app is light only (Josh, 2026-10-16: deferred).

## Earlier list (2026-10-12 to 10-14)

Kept for the record; what's next is [Now](#now) above. Item 13 moved there. How prompt changes are decided: [10-testing.md → Dialogue quality](10-testing.md#dialogue-quality-decided-2026-10-12).

1. ~~**Postgres, recording, memory, Roma portraits, ElevenLabs quota**~~ Done 2026-10-11/12. `ADMIN_KEY` set in Railway 2026-10-12. Josh's first remembered conversations (Rita, Giulia) were saved well; a true return visit is still to test.
2. ~~**Pronunciation fact line**~~ Done 2026-10-12 (character prompt 2026-10-12b): characters only see the transcription, so they stop drilling "ca-cio e pe-pe". Factual fix, no gate.
3. ~~**Score each conversation when it ends**~~ Built 2026-10-12 (`lib/quality.ts`, judge prompt `content/it/prompts/quality.md`, scorecard `lib/scorecard.ts`). Read at `/api/admin/conversations?format=scorecard`.
4. ~~**Replay test**~~ Built 2026-10-12: `npm run test:replay` (Josh's real lines, his characters plus a seeded sample, same scorer, `gate()`).
5. ~~**First prompt change through the gate: less history per turn, as real messages.**~~ Done 2026-10-13 (prompt 2026-10-12i + `TURN_HISTORY=recent`). Deployed to both Fuori and Afuera. Achieved: 20 words median (was ~60), 7% multi-question (target ≤10%), 100% garbled understanding, coherent conversations maintained.
6. ~~**Next candidates from the problem list**~~ Done 2026-10-13 (prompt 2026-10-12i + trait cleanup): 
   - ~~Too many questions per reply:~~ 7% via "No more words after a question mark" rule
   - ~~"as your character would":~~ Removed from prompt (was inviting performing)
   - ~~Traits as manner, not expertise:~~ ~430 red traits removed (storyteller, perfectionist, passionate, teaching, verbosity drivers) across Italy and Mexico
   - ~~Opener quality:~~ Improved from ~40 words to 13 words
   - "noticed" reply field: deferred (open design question)
7. ~~**Return-visit memory checks**~~ Done 2026-10-13. Characters remember names, facts, preferences across visits (Nonno Ettore, Sandro, Dario all confirmed working).
8. ~~**Repeated ids across Italian cities**~~ Done 2026-10-13. 44 IDs renamed in code, 44 images generated, `test:pack` passes. Database records not migrated (recent deployment, few testers, affected places currently hidden).
9. ~~**Image sizes and settings.**~~ Cancelled 2026-10-13. Not pursuing.

**Added 2026-10-13, not yet ranked against 1–9:**

10. ~~**Afuera doesn't auto-deploy.**~~ Resolved; checked 2026-10-14 with `railway status --json`: Afuera's source is `AbracadabraApp/fuori`, branch `main`, and it deployed `93037b1` by itself, the same commit as Fuori. Was: The Mexico service on Railway didn't pick up e612c70 while Fuori did, so it likely isn't connected to GitHub. Fix (Josh, in the Railway dashboard): Afuera → Settings → Source → `AbracadabraApp/fuori`, branch `main`, auto-deploy on. One-off meanwhile: `railway up --service afuera` from the laptop.
11. ~~**Mexican voices.**~~ Done 2026-10-14: native Mexican Spanish voices, 4 women and 4 men (Eduardo replaced Javi), in `content/es-mx/voices.ts`. `content/es-mx/voices.ts` reuses Italy's English premade ElevenLabs voices, so characters will sound foreign. Find Mexican-accented Spanish voices in the voice library, make one clip per voice of the same everyday line, Josh picks 4 women and 4 men by ear. Laptop session (ElevenLabs key).
12. ~~**Mexican image prompts.**~~ Cancelled 2026-10-13. Not pursuing.


## M1: Navigate cities and hold a conversation that's remembered

**Goal:** on your phone, browse Italian cities, pick a place, and hold a spoken conversation in Italian; come back another day and the character remembers you. Learn whether immersion alone works ([M1 conversation model](M1-CONVERSATION-MODEL.md)).

**Done**
- [x] Next.js app on Railway, deploying from `main`; API keys server-side only
- [x] 20 cities, each with places and one character per place (~636), watercolour city/place images and character portraits
- [x] Feeds: Polaroid cards, 10 at a time with "Mostra altro", big city / town alternating, stable order
- [x] Conversation: Whisper on Groq in, ElevenLabs out (gender-matched voices; phone voice as a stated fallback), Claude reply as `{ it, en }`
- [x] Subtitle-style text over the portrait, optional English, compact mic with live voice level
- [x] Prompt in `content/it/prompts/character.md` with version and changelog; version logged per turn
- [x] Honest errors with codes, phone errors in Railway logs, `?debug=1` panel
- [x] Tests: models, schema, prompt, reply, voices, feed, audio, roles, images, and graded simulated conversations

**To do**
- Prompt experiments: moved to [Now → Prompt experiments](#now) (2026-10-15), listed one by one.
- [x] Postgres: `learners`, `character_memories`, `conversations` ([Data model](09-data-model.md#storage-strategy)); anonymous learner id in a server-set cookie
- [x] Save each conversation: character, place, times, prompt version, and turns (who, text, English, time). No audio.
- [x] When a conversation ends, one Claude call writes:
  - the character's notes about you (fills `{relationship}` next visit)
  - a **review-log entry**: the 2–3 things most worth catching, judged by comparing the character's Italian with the learner's level (useful or recurring words and structures likely beyond them), plus real mistakes the learner made. Skips anything that could be speech-to-text noise.
- [x] Show the review log in debug mode only (in the admin transcripts, not to learners), to check it's accurate before anyone else sees it

**Done when:** you come back to a character another day and they remember your name and something you talked about; and the review log for a conversation picks things you'd agree were worth learning.

## M2: Measurement, teaching, and progress

### Backend / Infrastructure

**Review Generation (replaces simple review log):**
- [x] ~~Rich analysis after each conversation~~ Replaced 2026-10-14 by learning notes (in the memory call) and Magda's study file (docs/02-game-design.md → The study file). The list below was the removed Review's content:
  - Level detection (A1/A2/B1 with error rate and complexity evidence)
  - Error patterns (categorized: verb, article, syntax, pronunciation; with examples and frequency)
  - Missing structures (should use at their level but doesn't: past tense, future, subjunctive)
  - Communicative breakdowns (where stuck, fell back to English, didn't understand)
  - Complete vocabulary list (all content words: verbs with tenses, nouns, adjectives, prepositions; tagged with part of speech, examples with context)
  - Tense usage statistics (present 85%, past 10%, future 0% → shows what they avoid)
  - Suggested focus areas (prioritized: what to practice, why, method)
  - Strengths (positive reinforcement)
- [x] Storage: learning notes in `conversations.review`; the study file is Magda's `character_memories` row (`conversations.analysis` unused since 2026-10-14)

**Content Expansion:**
- [ ] Bench characters: audit Italy (10 exist, 6 hidden - decide which to show), deploy Mexico (5 generated), generate images for Mexico (5 portraits + 5 places)
- [ ] Travel: Stazione/Terminal place type (images generated), ticket seller characters (portraits generated), city picker UI after conversation, access all cities including hidden

### Frontend / User-facing

- [x] Magda at school (wired 2026-10-13; redesigned 2026-10-14: study file and one-goal lessons ending on success, struggle, ~20 replies or the learner's wish, plus one thing to try in town; prompt `content/<country>/prompts/magda-teaching.md`): teaching mode uses the study file; suggests what to practice based on patterns/missing structures; voice-first methods (drills, role-plays, error correction); simple and open prompt, refine later
- [ ] Visit marks: CSS stamp overlay (4 SVG variants generated: terracotta, olive, blue, wine); place ID hash picks variant; shows after first visit; character name appears after meeting

### Level-aware dialogue (deferred from M1)

**Context:** Phone testing shows characters speak too complex. M1 tests whether immersion + memory + review log work without level tuning. If dialogue needs adjustment in M2, this infrastructure becomes relevant.

**Approach:** Characters receive explicit level information ("They speak Italian at A2 level") and naturally adjust, not rigid vocabulary gating. Before trusting this in production, validate that Claude has a consistent, accurate model of CEFR levels.

**Validation steps:**
1. **Build level detection**: scorer that classifies Italian text as A1/A2/B1 with evidence
2. **Test on known examples**: validate scorer accuracy on reference materials, not just Claude-generated text
3. **Test in conversations**: simulated learners speak at specified levels, measure if:
   - Learners actually produce level-appropriate Italian (validates the simulation)
   - Characters adjust their complexity appropriately (validates level-aware prompting)
4. **Validate on real data**: check scorer against saved conversations from M1, compare with self-assessed level
5. **Iterate prompts**: use measurements to guide character prompt improvements

**Only then:** add level to production character prompts and trust it works.

**Removed from M2:**
- Learner profile (consolidated into Review generation)
- Dialogue digest (quality monitoring exists; focus on Review for learner features)
- Extended scoring (quality score, vocab count in Review instead)
- Character-judged success (already visible in conversation transcripts)
- Familiarity progression (Lei→tu already works via character memory)
- Reasons to return (design goal, improve character memory prompts; not separate feature)

**Cut from original M2:**
- Name field in settings (doesn't scale to general speech recognition issues)
- "Today" page / diario (extra UI; review log already works)
- Words at end of conversation (English transcript is enough; review log already captures what's worth learning)
- Messages from characters (→ deferred to ideas; keep it simple; focus on in-game experience first)

**Deferred to ideas:**
- Where next suggestions (characters suggest places; learners can already browse feed freely)
- Generation on explore (mechanics TBD: intent vs location vs hybrid)
- Voice messages, async communication, off-game contact (complexity; need very immersive experience or keep it simple)

**Done when:** you come back to the same bar on day 3, the barista greets you by name and remembers your usual; Magda at school helps you practice something you've been struggling with based on your recent conversations; you can see which places you've visited and travel to a new city via the train station.

## M2.1: Study tools and conversation quality

**Study export:** one Markdown file to drop into Gemini Notebook; see [Study export demo](study-export-demo.md).
- [x] Version 1: transcripts only, labelled by who, where and when, from an admin format (built 2026-10-14)
- [x] Josh tried it in Gemini Notebook (2026-10-14): it works. Kept as is; no version 2, and nothing in Fuori that repeats the notebook's review

**Done when:** ~~Josh has tried the export in Gemini Notebook and decided keep, change or drop~~ (kept, 2026-10-14). The character-memory items were cut (Josh, 2026-10-15).

## Done since 2026-10-15

- **server** Anchor code removed (2026-10-16, Josh): Giulia and Rita are ordinary Roma characters in `roma.ts` (same ids, so their memories stay linked; places still hidden). Gone: their hand-written sheets, fixed voices, the anchor branch in `characterForPlace`, `anchors` in the packs, and `test:conversations` always sampling them.

- [x] **N0** iPhone app: server `/v1` API and Xcode skeleton (Josh used it on his iPhone)
- [x] **N1** One conversation on the phone (Josh tried the latest build, tap to talk and the new sent state)
- [x] Prompt: characters only get text, can't hear pronunciation (2026-10-12b; Magda 2026-10-14b)
- [x] Bench characters (Josh, 2026-10-15)
- [x] `test:history`: "recent" is the only way to send the conversation (2026-10-16)
- [x] Error codes reach the server logs: `/v1/log`, the code on screen matches the log (2026-10-16)
- [x] Scorecard: reply time, coherence, feels alive; a broken conversation fails the gate (2026-10-16)
- [x] Dropped voices counted from the live logs: `npm run voice:failures` (2026-10-16)
- [x] Hidden debug switch: Settings → touch and hold Version (2026-10-16)
- [x] Typed reply, as an accessibility fallback only (D6) (2026-10-16; sending not yet tried)
- [x] Forced upgrade for old app versions: `MIN_APP_VERSION` → 426, "Update the app" (2026-10-16)
- [x] Country choice on first launch and the new Settings; Mexico in the app (2026-10-16; not yet tapped on the phone)
- [x] "More time to answer" removed (Josh, 2026-10-16: confusing)
- [x] `/api/generate-image` deleted: an open xAI proxy (Josh, 2026-10-15)
- [x] Prompt: traits as manner, not expertise (~430 traits removed, 2026-10-13)
- [x] Art less stereotypical; places more unique (Josh, 2026-10-15)

## Removed

- "Move to the app" link for web learners: cut by Josh, 2026-10-16. Only Josh's data needed moving: his iPhone's sign-in now points to his web learner (3c544022), done on the database the same day.
- "Come si dice?" button in the app (the web has one: hold to ask in English): cut by Josh, 2026-10-16; characters teach the phrase in conversation instead (see Language levels).
- Measure lasting learning (next-day recall of Magda's target, tried in town, day 7 and 30; was M3 #7): cut by Josh, 2026-10-16; level grading across conversations covers whether the learner is improving.
- Voice check before Whisper, server half (was M3 #5): dropped by Josh, 2026-10-16. Whisper on Groq reports no-speech 0.000 even on pure silence, so the server has nothing to check; the app's own check stops silent uploads.
- Honest learner level (Magda's slow band over sessions, strengths line, her lesson tweaks; was M3 #6): cut by Josh, 2026-10-15, as not practical.
- Replies without their English, English on tap (2026-10-15): replay A/B, replies got longer and 2 of 7 conversations broke.
- Prompt experiment "background as lived, fewer facts": cut by Josh, 2026-10-15; the prompt no longer carries any background (only name, age, role, city, setting, three traits, formality).
- "Noticed" reply field: folded into the level in the character prompt (Josh, 2026-10-15).
- Prompt experiment "who the learner is: lives here now, not a tourist": cut by Josh, 2026-10-15 ("they are a user of the app trying to learn a language").
- Richer character memories, character life updates, better reasons to return (was M2.1): cut by Josh, 2026-10-15.
- Email sign-in (was M4): Josh decided no sign-in ([12-native-app.md](12-native-app.md) decision 3).
- Hosted voices for every character (2026-10-14): ~$7,500 for 686 voices; the 8-voice pool works.
- Moved to [ideas.md](ideas.md) (2026-10-14): interactive transcript; voice notes and messages from characters.

## Later

See [Ideas](ideas.md): reading moments at real landmarks, food culture conversations, animated clips for the core cast, other languages (a costed estimate for Mexico: [Mexico version](mexico-version.md)).
