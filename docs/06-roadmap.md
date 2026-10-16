# Roadmap

Each milestone ends with something playable on your phone. There is no separate validation phase: the first real test is talking to a character in the app.

This file is the one place for **what's in each milestone** and **what to do next**. Parked ideas live in [Ideas](ideas.md); questions waiting on a decision live in [Open design questions](open-design-questions.md); what happened each session lives in `progress.md`.

## Now

One list, merged 2026-10-15 from the iPhone milestones (N, plan in [12-native-app.md](12-native-app.md#milestones)) and the game milestones (M3, M4). Roughly in order; each item says where the work is: **app** (Swift, `ios/`), **server**, or **both**. Old labels kept in brackets so earlier notes still make sense.

**Finish the conversation on the phone**
- [ ] **app** Magda tried in the app (N2)
- [ ] **app** Device checks: a call, Siri, AirPods in and out, backgrounding, locking (from N1)
- [ ] **both** Error codes reach the server logs; today the app only prints them (from N1)
- [ ] **both** Response timing: investigate the ~6 s after a turn (deferred, Josh)

**Language levels** (three levels: Beginner, Intermediate, Advanced; plan in [language-levels-plan.md](language-levels-plan.md))
- [ ] **server** Measure the level of what characters say, before tuning: a judge calibrated on official exam samples (CELI, CILS, PLIDA; DELE), word coverage against a frequency list per language, `test:levels` with 10+ turn conversations (M3 #2)
- [ ] **server** Level in the character prompt, every turn, worded in role; prompt version and changelog (M3 #1). Replaces the "noticed" field idea (Josh, 2026-10-15: it's basically the language level).
- [ ] **both** Level and settings saved with the learner: sets speech speed and default subtitles, switches as personal overrides (M3 #3, N3)
- [ ] **server** Voice check before Whisper, server half: reject near-silent recordings; the app's half is done (M3 #5)
- [ ] **server** Honest learner level: Magda's level as a slow band over several sessions, a strengths line in the study file, her lesson tweaks (M3 #6)
- [ ] **server** Measure lasting learning: next-day recall of Magda's target, tried in town, retention at day 7 and 30 (M3 #7)
- [ ] **both** More dialect as you level up; the dialect setting does nothing today (M3)

**Prompt experiments** (each one: prompt version, changelog entry, replay gate `npm run test:replay`)

Goals (Josh, 2026-10-15). Every experiment says which goal it moves; none may make another worse.

| Goal | Today | Target | Measured by |
|---|---|---|---|
| **Faster** | Claude 4–5 s of a ~6 s wait after the learner's turn | Reply in under 2 s, 4 s at most ([10-testing.md](10-testing.md) performance targets) | Not yet: the replay test doesn't time replies |
| **On level** | Teacher rated characters B2+; the prompt has no level | Characters speak at the learner's level (Beginner A1–A2, Intermediate B1–B2, Advanced C1+) | Not yet: the level judge (Language levels, M3 #2) |
| **Length** | Median 21 words per reply | 20 or fewer, heading toward 10 ([10-testing.md](10-testing.md) scorecard) | Replay test, already |

- [ ] **server** Add to the scorecard (`lib/scorecard.ts`), so the replay gate checks them (Josh, 2026-10-15):
  - [ ] Reply time per turn (goal: faster)
  - [ ] Level of the character's lines, from the level judge (goal: on level; M3 #2)
  - [ ] Broken replies (malformed JSON, no reply): any one fails the change; today they're dropped from the scores
  - [ ] Coherence: replies follow from what was said, judged
  - [ ] Feels alive, from `test:conversations` (the scorecard already has its other three: English, garbled speech, pulls back)
  - [ ] Dropped audio can't be scored here (the replay is text only): count voice failures from the live logs instead
  - Note: the `test:conversations` grader says not to penalise complex language; "on level" needs that changed (Josh's OK)
- [x] ~~Characters only get text, can't hear pronunciation~~ (prompt 2026-10-12b; Magda 2026-10-14b)
- [x] ~~Traits as manner, not expertise~~ (~430 traits removed, Italy and Mexico, 2026-10-13)
- [ ] **server** Faster replies: try Haiku for turns, and start the voice as soon as the line is streamed (part of the timing investigation).
- Tried and set aside: replies without their English, English on tap (2026-10-15: replies got longer, 2 of 7 conversations broke).

**Onboarding and the beginner path** ([onboarding-design.md](onboarding-design.md))
- [ ] **both** Onboarding, including the country choice (M3)
  - [ ] Define the frontend flow
  - [ ] Define the engineering needs
  - [ ] Implement
- [ ] **both** Beginner ladder, behind a setting: pick one of two replies → read it aloud → speak with help nearby → speak freely (M3 #4)

**Parity with the web** (N2, N3)
- [ ] **app** Visit stamps redesigned: bottom right on the caption, collectible designs (passport stamps, seals, wine and cigar labels), not a number in a circle (M3, N2)
- [ ] **app** City picker improved; needs Josh's feedback on what's wrong (M3)
- [ ] **both** Mexico in the app (N3)
- [ ] **both** Stations and ticket: departures board, the clerk names the platform, "Sali" (N3)
- [ ] **app** Hidden debug switch (N3)
- [ ] **both** "Move to the app" link so web learners keep their data (N3)

**Release**
- [ ] **both** TestFlight: signing, icon, microphone text, privacy label, App Attest, usage tracking and per-learner daily budgets (N4, M4)
- [ ] **server** Web sunset, about 2 weeks after TestFlight (N5)

**Waiting on a decision**
- [ ] **People with time on their hands (bench characters).** The in-world teaching point with no transaction (see [Game design → Who teaches](02-game-design.md#who-teaches)). 10 of 634 Italian characters have a role that isn't a job (pensionato, studentessa, nonna or abitante del quartiere), nearly all in piazzas and parks: 4 shown (Ettore and Gina in Roma, Elena in Matera, Giovanna in Venezia), 6 hidden. Borderline, all hidden: Federico (poeta locale, Taormina), Dante and Davide (storico locale, Venezia and Verona). Decide whether to show one per city: Firenze, Siena, Napoli and Bologna each have one waiting in `content/it/showcase.ts`; Palermo has none. Open design question first: what is he when he's not teaching? No character has a time constraint (hours, schedule) today.

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

- [x] **N0** iPhone app: server `/v1` API and Xcode skeleton (Josh used it on his iPhone)
- [x] **N1** One conversation on the phone (Josh tried the latest build, tap to talk and the new sent state)
- [x] Art less stereotypical; places more unique (Josh, 2026-10-15)

## Removed

- Prompt experiment "background as lived, fewer facts": cut by Josh, 2026-10-15; the prompt no longer carries any background (only name, age, role, city, setting, three traits, formality).
- "Noticed" reply field: folded into the level in the character prompt (Josh, 2026-10-15).
- Prompt experiment "who the learner is: lives here now, not a tourist": cut by Josh, 2026-10-15 ("they are a user of the app trying to learn a language").
- Richer character memories, character life updates, better reasons to return (was M2.1): cut by Josh, 2026-10-15.
- Email sign-in (was M4): Josh decided no sign-in ([12-native-app.md](12-native-app.md) decision 3).
- Hosted voices for every character (2026-10-14): ~$7,500 for 686 voices; the 8-voice pool works.
- Moved to [ideas.md](ideas.md) (2026-10-14): interactive transcript; voice notes and messages from characters.

## Later

See [Ideas](ideas.md): reading moments at real landmarks, food culture conversations, animated clips for the core cast, other languages (a costed estimate for Mexico: [Mexico version](mexico-version.md)).
