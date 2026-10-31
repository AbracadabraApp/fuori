# Roadmap

Each milestone ends with something playable on your phone. There is no separate validation phase: the first real test is talking to a character in the app.

This file is the one place for **what's in each milestone** and **what to do next**. Parked ideas live in [Ideas](ideas.md); questions waiting on a decision live in [Open design questions](open-design-questions.md); what happened each session lives in `progress.md`.

## Now

The one to-do list, by feature area (reorganized 2026-10-18 at Josh's request). **Releases** (reorganized 2026-10-30 at Josh's request into done, next, and what to skip or move; the skip-or-move list is Claude's proposal until Josh decides each line):

**Done**
- **N4** (Josh, 2026-10-25): TestFlight 0.1.0 (5): scaffolding, say it in English, one tap per turn, the bottom bar, the launch screen and country choice, faster replies, Learn in both countries.
- **N5 so far** (TestFlight builds 6, 7 and 8; the family is on 8):
  - Beginner level dialogue live in both countries, tap to first word ~1.8 s; hands-free for everyone (mic closes after 5 s of nothing); the device checks (Josh: "works").
  - Lessons from the syllabus (21 for Italy, 25 for Mexico), opened from the Learn home's Lessons card; the schools taken out of the world; missions out of lessons, the assignments are the practice dialogues (Josh, 2026-10-29).
  - Recordings kept 30 days for Josh's learners and Sophia's (Josh's yes, 2026-10-29).
  - Places with their city's own food (delis, street food, restaurants, specialty pastry shops; bakeries and Italy's wine bars hidden); the City Pantry Formula rewritten; Italy's cast rebalanced with a `here` line for everyone; the Beginner prompt told the kind of place and why the person is there; neighbourhoods checked one by one.
  - Say it, the Learn page and Beginner answers stop rewriting the learner's Italian or inventing facts about them.
  - How much of the language is spoken, measured per conversation (the quality judge's `words`).
  - Build 8 skips the greeter's tour.
  - Josh played the Beginner level, hands-free and the new places (done, Josh 2026-10-30).
  - The whole-app scan, three rounds: every Claude call has a time limit, a resent turn is answered once, per-learner caps on every route, fixes to the recorder, the voice and Flashcards.

**Next (N5)**
1. **The lesson shape** ([teach-plan.md](teach-plan.md)): Magda teaches on the conversation screen, a practice dialogue as the assignment, then her review.
2. `here` lines for Mexico's people.

**Skipped or moved** (Claude proposed, Josh decided 2026-10-30)
- **Skipped (Josh, 2026-10-30):** the orientation tour (build 8 dropped the greeter; item 2 above covers the level it asked); "Try Magda in the app" and Learn L1–L3 (the lessons replaced them); the smaller world for beginners (the Beginner level dialogue does much of its job).
- **Moved to N6 (Josh, 2026-10-30):** TestFlight build 9; the turn-timings log; visit stamps, stations and ticket, the city picker; adventures; the missions prototype (P1–P4) and card maker v2; then a level for new players, the goodbye rule, the English fading over time, and transcription measured on the kept recordings.
- *Keep deferred:* hands-free extras and the night-paper palette (→ Next release).

**Before testers outside the family** (the list is Stage 2 under Release, below): App Attest; a daily usage budget per learner that survives deploys (today's caps live in the server's memory and reset on every deploy); the image domain; a privacy policy naming Groq, Anthropic and ElevenLabs; the App Privacy label; tester notes. The tester questions need updating first: the wait is now ~2 s, not ~4 s; the Beginner level exists; it's hands-free, not "tap again when you're done". Then Stage 3, the App Store, and the web sunset.

- **N6:** a framework for level, repeatable and improving (placement, moving up, level in the prompt); the conversation library beyond Josh's and Sophia's recordings; a shorter end-of-turn wait for Intermediate and Advanced (Beginners keep 2.5 s), tuned from the recordings. Moved here from N5 (Josh, 2026-10-30): TestFlight build 9 with the scan's app fixes (Flashcards, the recorder, the voice, Learn pausing the conversation); a log of every turn's timings, phone and server, kept across deploys (typical and worst 1 in 20, counted from after the end-of-turn wait); visit stamps, stations and ticket, the city picker (→ Parity with the web); adventures; the missions prototype and card maker v2 (→ Diario); a level for new players (build 8 skips the greeter, so a new player starts with none; Claude's proposal: one level question by buttons after the country choice, → Learner level); the goodbye rule (→ Ending a conversation; **Josh** picks the word); the English fading over time (→ Beginner level dialogue); transcription measured on the kept recordings (`npm run replay:recordings`; 23 Mexico, 1 Italy so far).
- **Later:** prompt caching (speed and cost only, no quality change: the turn prompt is ~140 tokens, the Beginner prompt ~1,400); real accounts, when someone needs Fuori on more than one device.

### ⛔ Blockers: what's waiting on Josh
Claude can't move these until Josh does:
1. ~~Play Afuera with the level trial on~~: done 2026-10-19 (Chucho, 23 turns; reviewed under Scaffolding)
2. ~~Spec for the smaller world~~: skipped (Josh, 2026-10-30)
3. **Feedback on the city picker**: what's wrong with it (→ Parity with the web)
4. ~~Device checks on the iPhone~~: done (Josh, 2026-10-27: "works")
5. **Record the speech-to-text test set** on the iPhone: about 20 short turns per language (hesitant and wrong ones included) plus 30–50 typical English and mixed requests; one set for both jobs (→ Faster and reliable replies; Scaffolding → Measure English transcription). Superseded: Josh's real turns are kept since 2026-10-27 (conversation library, smallest version)

### Conversation on the phone — N4 done (2026-10-25)
- Josh played build 0.1.0 (1) from TestFlight in Italy (2026-10-18): quality good, shorter replies, easier to understand, relatively fast. The mic tap wasn't crisp or obvious
- [x] **Claude** The mic tap plainly registers (Josh chose the states, 2026-10-18): cream with a waveform while the character speaks, cream with a mic on your turn, green with live dots and a stop as soon as you tap (before the mic is ready), terracotta once sent, taps ignored. **Josh** to check on the next TestFlight build
- [x] **Claude** "No such file" errors at step transcribe on that build: a second tap while the mic was opening started a second recording, and the orphaned watcher later finished the turn again with the file already deleted. Fixed in the next build
- [x] **Josh** Try today's build: pick a country on first launch; Settings → switch country and back; Settings → Privacy; touch and hold Version → Learner shows 3c544022, debug panel; someone you met on the web remembers you; a typed reply with the mic off Josh, 2026-10-23: good (country choice on a fresh install, switching country, Privacy)
- ~~**N5 (moved from N4, Josh 2026-10-23: leave Magda where she is; she becomes Learn and Teach in N5)** **Josh** Try Magda in the app~~: skipped (Josh, 2026-10-30: the lessons replaced it)
- [x] **Claude** Bottom bar: one circle in two colours, no Pause or Play (Josh, 2026-10-22; [bottom-bar.md](bottom-bar.md)): green mic and your wave, terracotta sending dots and her wave; interruptions return to your turn; the Learn link on the right, centred on the circle Built 0dde6b8 (2026-10-22), on Josh's phone
- [x] **Josh** Bottom bar on the phone: the four states in both countries: good (Josh, 2026-10-23) (a call, Siri, AirPods and backgrounding: N6, Josh 2026-10-23)
- [x] **Josh** A long conversation on prompt 2026-10-18 (characters now see the whole conversation): does anyone still repeat their introduction or ask where you're from twice? Josh, 2026-10-23: no

### Open bugs and learner data — N4 done (2026-10-25)
- [x] **Claude** Recording error "0 buffers failed to write" / "the mic wasn't on": found from the saved reports (2026-10-23) and fixed in 27c8902: the send tap's cancelled watcher ticked once more and set the circle back to "talking", so a second tap found the mic closed. **Josh** to confirm on the next build that it's gone
- ~~Merge learner `dd6ec6fb` (Josh's Franco conversations) into `3c544022`~~: not important (Josh, 2026-10-23); left as is
- [x] **Josh** Whose learner `819f7aed` is ("José", 1 conversation with Franco, 17 Oct): Josh testing (2026-10-23). Left as is

### Faster and reliable replies — N4 for the two speed fixes (save after sending, voice on the first sentence); N5 for testing outside services
Goal: reply under 2 s, 4 s at most. Measured 2026-10-18 (`npm run measure:turn`, Server-Timing on `/v1`): Claude was nearly all of the wait, mostly thinking before the reply; transcribing 0.3 s, the voice 0.5–0.8 s, the network and sign-in tens of milliseconds.
- [x] **Claude** Raised the reply cap from 800 to 1200 in `lib/turn.ts` (Josh's OK, 2026-10-18). Round 16 (810 replies, same call with a 1500 cap; Italy's real scripts, simulated Mexico): median 329–343 tokens, 99% under 714, the largest 847; 2 of 810 (0.25%) went over 800, which fails the turn today; none over 1200. Most of it is thinking (with thinking median 355–396 tokens; without, 113–169). The replies near the cap took 7–8 s.
- [x] **Claude** Where the time goes: `measure:turn` and per-step timing in the logs (`turn-timing`, `transcribe-timing`, `speak-timing`)
- [x] **Claude** Haiku for characters through the replay: 1.3 s, but double questions 21% and the most broken replies; not taken
- [x] **Claude** Josh's short prompt and no thinking before a reply (prompt 2026-10-18b, Josh: "take the best"): replay reply time 3.7 → 1.8 s, 26 → 16 words, feels alive 6.0 → 5.4. Live wait still to measure after the deploy
- [x] **Claude** Save the turn after the reply is sent, not before (up to 1 s on some turns): 8b599c1 (2026-10-22). Readers of the conversation wait for the save
- [x] **Claude** Step 1 (acfece6, 2026-10-22): the server starts the voice as soon as the line is written, before the English; /v1/speak takes it
- [x] **Claude** Step 2 (d167356 server, 0f8bc32 app, 2026-10-22): the app says the first sentence while the rest is written. Live, median tap to voice: Italy 3.3 s before → 2.5 s (step 1) → 1.9 s; Mexico 1.7 s (`measure:turn --stream`)
- [x] **Josh** On the phone (Mexico, 2026-10-22): the voice flows from the first sentence to the rest; subtitles and tap to stop look right ("I think so"). Pause and resume not yet tried
- [ ] **Claude** Test every outside service on speed, failures and cost, one at a time with `measure:turn` and the logs (Josh, 2026-10-18). Each gets a short write-up: what we use, what else it offers, what was measured, keep or change:
  - **Claude:** prompt caching (not used yet; the prompt passes the ~1,024-token minimum only around turn 6–8, so mainly a cost saving, plus cheaper test runs); time to first token (0.8–1.2 s today, and one 4.4 s outlier on 2026-10-18); how often a call fails or is retried
  - **Groq Whisper:** `whisper-large-v3` against `-turbo`; upload and transcribe time against recording length; hallucination on near-silence; failure rate
  - **ElevenLabs:** voice model (Flash against Multilingual) on speed and how it sounds; streaming the audio; the quota and how often the app falls back to the phone's voice
  - **Railway and storage:** server region against Josh's location (network time per call), Postgres query times, R2 image load times (r2.dev is rate-limited)
- [x] **Claude** Voice speed, first round (Josh: "measure speed first"; `tests/experiments/voice-speed.mts`, 5 rounds, both languages, laptop network, 2026-10-18). Median seconds for a short / medium / long line (~4 / 15 / 40 words):
  - Speech in: Groq `whisper-large-v3-turbo` (today's) 0.26 / 0.29 / 0.36, the fastest. `whisper-large-v3` 0.29 / 0.32 / 0.46, and with no language given it once returned Spanish as English. ElevenLabs Scribe v1 and v2 0.40 / 0.6 / 0.7. Keep Groq turbo
  - Speech out, whole file: Flash v2.5 (today's) 0.23 / 0.37 / 0.65 and Turbo v2.5 the same; Multilingual v2 1.0 / 1.4 / 2.9 and v3 1.1 / 2.1 / 4.2, too slow to use. Keep Flash
  - Speech out streamed: Flash's first byte comes at 0.17–0.19 s whatever the length, so streaming saves up to about 0.45 s on long lines
  - So speech in and out together are under 1 s; the rest of the wait is Claude. Other providers aren't timed: none is expected to beat these on speed by more than about 0.1 s, and Josh (2026-10-18) doesn't want ones expected to be slower tested. The one kind that could save time is speech to text that streams while the learner talks (Deepgram, for example), which would take the 0.3 s off; worth a look only after the reply and the voice stream
- [ ] **Claude** Test speech-to-text alternatives to Whisper on Groq: Deepgram Nova-3, AssemblyAI, OpenAI `gpt-4o-transcribe` / `gpt-4o-mini-transcribe`, ElevenLabs Scribe, Speechmatics and Google Chirp. Measure on one fixed set of real learner recordings in Italian and Mexican Spanish: errors on a beginner's accent and mistakes (the transcript must keep the learner's mistakes, not fix them), behaviour on silence and noise, speed and price per minute. **Josh** ⛔ records the set (about 20 short turns per language, including hesitant and wrong ones). Apple's on-device recognition is out of scope unless Josh reopens it (CLAUDE.md: speech in is Whisper on the server)

### Core behaviours (round 18) — N5
- [ ] **Josh** Decide: when a learner asks "say it in English", is the translation shown under the line enough? Today the character repeats in the language and never speaks English (on every prompt tested)
- [ ] **Claude** Recasting mistakes fell with the short prompt (13–19% of replies, from 31–44%): try one short line in the prompt, gated on this test and the replay (speed, words, alive)

### Characters feel alive — N5
Goal: alive 7 (today about 6 in real conversations, 5–7 with simulated learners). Order decided by Claude, judged by Josh (2026-10-18); one change at a time through the replay gate.
- [x] **Claude** Real conversations sorted by what goes wrong (round 15): the worst were characters repeating themselves; the order form ("X o Y?") is rare in real play (8–15% of lines)
- [x] **Claude** Characters see the whole conversation, not the last 6 messages (prompt 2026-10-18): repeats halved (4.4% → 2.4% of lines)
- [ ] **Claude** One concrete detail per character (an opinion, something they care about): only 15 of 703 characters have more than role, traits and setting. Generate it for the characters in the replay set, put it in the prompt, replay; keep it if alive rises and lines a beginner can follow don't drop
- [ ] **Claude** Separately, "react before asking" in the prompt, with a count of repeated patterns (rules like it made tics before, round 5)
- [ ] **Claude** If it passes: generate details for the remaining ~680 characters, check a sample, fix only what's terrible
- [ ] **Claude** A replay set for Mexico (the replay set is one file and holds only Italy's conversations today)

### Language level of the dialogue (what characters say) ([language-levels-plan.md](language-levels-plan.md)) — N6, the level framework
Goal: 90% of the character's words at the learner's level (Josh; the [research](research/language-app-levels.md#word-coverage-predicts-confusion-and-llm-judges-can-grade-speech) suggests 95% for easy listening). Today a beginner can follow about 25% of lines on today's prompt.
- [x] **Claude** Level on the scorecard: "Lines a beginner can follow" (`lib/level.ts`, `level.md`), scored by the replay; real play not yet
- [x] **Claude** The `test:conversations` grader no longer says complex language is fine; it reports "Lines a beginner can follow" instead (Josh's OK, 2026-10-18). Baseline: 10% Italy, 11% Mexico
- [ ] **Claude** Level in the character prompt for every learner, every turn, in role, once the learner's level exists (below). The Beginner block ("still you, sometimes ask") is picked and on trial for Josh. Beginners: characters teach key phrases in role, such as how to ask "Come si dice …?", instead of a button (Josh, 2026-10-16; asking it by voice already works)
- [ ] **Claude** Question ladder for Intermediate and Advanced (one fact, then anything), measured with the question-kind count
- [ ] **Claude** Level of real play on the scorecard (a call per line, so decide the cost first)
- [ ] **Josh + Claude** More dialect as you level up (the dialect setting is greyed out today)

### Conversation library — N6 (Josh, 2026-10-23)
Real learner speech kept as a test set, so changes can be replayed on the same input. Today only the text Whisper returned is saved; the app deletes each recording, so nothing real can be transcribed again.
- [x] **Josh** Decided: Josh's learners and Sophia's, 30 days (Josh, 2026-10-26 and 10-29); testers wait for the privacy policy (N5, Stage 2)
- [x] **Claude** Smallest version (2026-10-26, Josh: "ok" to only his own recordings, 30 days): `/v1/transcribe` keeps the recordings of the learners in `KEEP_RECORDINGS_FOR` (Josh's Italy and Mexico learners) in the private R2 bucket `fuori-recordings` (deleted after 30 days by a lifecycle rule) with what was heard (`lib/speech/keep-recording.ts`); `npm run replay:recordings` runs them through today's speech to text and routing and lists what changed. Not yet: what happened next (sent, say it, "didn't catch that") beside each, family and testers
- [ ] **Claude** Keep each turn's recording with its transcript, the language Whisper heard and what happened next (sent, say it in English, "didn't catch that"), e.g. in R2 beside the images
- [ ] **Claude** Replay tools: run the library through another speech-to-text provider, the language routing (say it in English), or the end-of-turn silence, and compare with what happened
- [ ] **Claude** Meanwhile, from text only: read the saved learner lines for transcription that went wrong (garbled, invented on silence, English turned into nonsense) for a rough error rate

### Device checks — done (Josh, 2026-10-27: "works")
- [x] **Josh** Device checks (Josh, 2026-10-27: calls, Siri, AirPods and backgrounding "works"), on the iPhone during a conversation (while the character speaks and while the mic is open): a phone call comes in; Siri; AirPods out; AirPods in; swipe to the home screen; lock the phone. Each time it should pause, save like any exit, and never reopen the mic without a tap; AirPods out shouldn't carry on through the phone speaker (CLAUDE.md → iPhone app). A simulator can't test this

### Learner level (placement and moving up) — N6, the level framework
Doesn't exist as a system yet; onboarding's placement, Magda's study-file Level line and an unused type are separate pieces ([language-levels-plan.md](language-levels-plan.md) → 1).
- [x] **Josh** Decided (2026-10-18): onboarding's level is a first guess; the first conversations confirm or move it. Round 14: one conversation corrected every misplacement
- [x] **Claude** Level check at the end of each of the first 3 conversations, updating `learners.level` (`lib/learner-level.ts`, `learner-level.md`, `test:learner-level`). Off unless `LEVEL_CHECK` is set (`all` or learner ids); the `level_checks` column is created the first time it runs
- [ ] **Josh** ⛔ Turn it on (for himself first, then `all`): setting it adds a column to the production database
- [ ] **Claude** Run it on saved real conversations (`tests/experiments/learner-levels.mts`); **Josh** compares it with his own judgement
- [ ] **Claude** Moving up later: when 90% of the learner's speech is at the next level, across several conversations (Josh, 2026-10-15). Magda suggests it, the learner decides
- [ ] **Claude** Level and settings saved with the learner (speed, default subtitles); then turn on the greyed-out level control in Settings

### Onboarding ([onboarding-design.md](onboarding-design.md)) — N4 done; the orientation tour skipped (Josh, 2026-10-30)
- [x] **Josh + Claude** Flow, engineering needs, built and tried in both countries (2026-10-17)
- [x] **Claude** The send-off failed on mixed answers (one English, one fluent): fixed 2026-10-18
- ~~**N5 (from N4)** **Josh + Claude** Orientation tour to replace onboarding ([orientation-script.md](orientation-script.md), draft, 2026-10-23): the greeter's tour in 7 cards, mixed Italian and English (name by mic, Masculine/Feminine and level by buttons, what Fuori is, say it in English as an example, getting help with Learn, off you go; mock-ups on the canvas, row H). The game's rules don't apply to onboarding (Josh). Depends on say it in English~~: skipped (Josh, 2026-10-30: build 8 dropped the greeter; the level question in Next covers what it asked)
- [x] **Claude** Launch and opening moment: built 2d2c660 (2026-10-23), on Josh's phone; the first-launch choice not yet seen. **Josh** to look: (Josh, 2026-10-22: "a strong intro"; canvas "Launch screen", https://claude.ai/artifact/5mTwgS9R8CubVMyUKaXoJZ). The system launch screen is paper with the icon (a `LaunchBackground` colour set named in `UILaunchScreen`, fixing the white flash, iOS conventions A13); the app's first view matches it exactly and holds the large picture for about a second at least (longer only while content loads), then fades to where the learner left off. A tap skips it. On first launch it stays and becomes the country choice, Fuori | Afuera (board 2), replacing today's two-card screen. Reduce Motion: plain crossfade. Check in both countries, AX5, VoiceOver

### Beginner level dialogue — N5 ([beginner-scaffolding.md](beginner-scaffolding.md) → Beginner level dialogue)
- [x] **Josh + Claude** Goals (2026-10-25)
- [x] **Claude** Trial prompt, three versions on Josh's real conversations and a simulated beginner (docs/prompt-trials.md)
- [x] **Claude** First playable version (aff1c7e, 2026-10-25): Beginners get the turn in parts (English heard, words and question as bubbles, answers to say back); live in both countries (smoke:live), on Josh's phone
- [x] **Josh** Play it in both countries; then what to change (played, Josh 2026-10-30)
- [ ] **Josh + Claude** Getting harder over time (Josh, 2026-10-25, a plan, not built): slower and staggered, a stage per conversation: 1,1,1,1,1 · 1,2,1,1,2 · 2,2,2,3,3, then on to Intermediate. Stages fade the English echo, the answers to say back (two, one, a frame, none), the bubbles, and raise her Italian and the questions (this-or-that, one fact, open). Principles: count practice, not visits (conversations where the learner said enough); fade one support at a time; stretch, then consolidate (the staggering); advance on mastery (answering in their own words) with the count as the default
- [ ] **N6 (moved from N5, Josh 2026-10-30)** **Claude** The English fading over time, by count (part of the plan above)
- [x] **Josh + Claude** Hands-free as the default (on for everyone 2026-10-26, Josh: "hands free on 5s": the mic opens after she speaks and closes after 5 s with nothing said, still your turn; tap-to-talk under VoiceOver; Josh to play it on the phone) (Josh, 2026-10-25: "creeping in as a better UI than clicking the microphone"): she speaks, the mic opens by itself, silence sends. Room noise or a covered mic misfires today with or without the tap, so only the tap changes. Try it on Josh's phone first (a developer switch), Beginner conversations with and without the tap
- [ ] **Josh + Claude** Premade place notes (checked facts per place) if the openers drift
- [x] **Claude** Faster Beginner turns (145ee09, 2026-10-26): the voice starts with the first parts; live, tap to first word 1.9 s Italy, 1.7 s Mexico (was ~4 s)
- [ ] **Josh** Then: keep it and settle CLAUDE.md's teaching rules by level

### Scaffolding ([beginner-scaffolding.md](beginner-scaffolding.md)) — N4 done; open items N5
**Direction, 2026-10-23 (Josh):** inside the game, scaffolding becomes one loop: say it in English → a line in the language comes back → read it out loud. The reply panel stays until that's been played. Design: bubble (canvas row G, `design/say-it-in-english/`); details in beginner-scaffolding.md.
- [ ] **N6, with the conversation library (moved from N4, Josh 2026-10-23)** **Claude (laptop)** Measure English transcription on the recordings from blocker 5 (**Josh** records them: 30–50 typical English and mixed requests on his iPhone) through `/v1/transcribe`; count the ones wrong enough to change the line. Try ElevenLabs Scribe on the same clips
- [x] **Claude** Say it in English, rough version to play (built 2026-10-23 d56b402, routing fixed through a730bc1; in build 5): when the recording isn't the learned language, one short call returns the line at the learner's level (the gist, not word for word); show the grey *Come si dice:* bubble with what was said and the "Say this:" bubble with hear-it; the reading is sent as usual. Prompt trial row in prompt-trials.md
- [x] **Claude** One tap per turn (built 2026-10-23; finished sentences end sooner, 015f3ac): tap once; English ends on silence, the mic reopens for the reading (waits for speech to start, closed while hear-it plays), the reading ends on silence and is sent; tap again next turn
- [x] **Claude** Beginner opener hint: built 10537a1 (2026-10-23), on Josh's phone. Was:: her first line in each conversation ends with a small mic and "Answer in <language> or English" (G1); nothing above the mic
- [ ] **Tabled (Josh, 2026-10-23: English gets help first; correcting the learner's language waits)** Claude (laptop): test Claude's take for the learner's spoken language (Italian or Spanish) on logged learner turns (what they meant, clean, at their level; none when unclear); Josh reads it beside Whisper's text before anything's built
- [ ] **N5 (from N4)** **Josh** Play the rough version with a family beginner; then decide whether the reply panel goes (Josh, 2026-10-23, on his phone: "reply panel good")
Onboarding, then reply buttons for the first turns of each conversation (stage A, built 2026-10-21, server-decided, no switch), then the mic. Stages B and C proposed; the rest not settled.
- [x] **Claude** Reply buttons from a separate call (`lib/replies.ts`, test-only): sensible 97–100%, ready before the character finishes speaking
- [x] **Josh** Played Afuera with the level trial on: Chucho the shoeshiner, 23 turns (2026-10-19, prompt `2026-10-18b+Beginner: still you, sometimes ask`)
- [x] **Claude** Reviewed it. Good: easy questions came back ("¿negros o cafés?", "¿billetes o monedas?", two "¿sí o no?"); he helped in role every time Josh reached for a word (derecho, la cuenta, quédese con el cambio); judge alive 7. Not yet beginner-plain: median 23 words a line (the trial's replay runs were about 10, on the older prompt), and 42% of replies asked two questions (target ≤ 10%). The trial block hasn't been replayed on prompt 2026-10-18b; next: replay it there before more play
- [x] **Claude** First playable levels 1–3 behind a setting (2026-10-19): Settings → touch and hold Version → Reply buttons (test), level 1–3. The replies are written while the character speaks and replace the mic pill; a tap sends the line. `smoke:live` checks `/v1/replies` (Mexico passes) (Since then: the setting is gone, always on at Beginner, 2026-10-21; the steps are stages, not levels, docs/glossary.md; all click-to-answer scaffolding is to be replaced by say it in English, 2026-10-23)
- ~~Play 10 minutes in Afuera at level 1, then level 3~~: superseded (no setting or levels any more; say it in English replaces the reply buttons, Josh 2026-10-23)
- [ ] **N6 (moved from N4, Josh 2026-10-23)** **Claude** Tests queued in [test-ideas.md](test-ideas.md): live with lookahead, a plan for the visit, "Ripeti?" on levels 4–5, Mexico at 20 conversations

### Diario: the review place ([diario.md](diario.md); card screens in [beginner-scaffolding.md](beginner-scaffolding.md)) — N5
Josh, 2026-10-18: no end of day; a book in the top bar, left of settings, opens phrase cards from your own conversations, at each phrase's own beginner level.
- [x] **Claude** Card test (round 17, [level-judge-test.md](level-judge-test.md)): today's review phrases are mostly the character's lines (18–22% card-worthy); a card maker passes 69–78% of cards on 9 checks; level is the weak spot (about half the lines at 90% of words)
- [ ] **N6 (moved from N5, Josh 2026-10-30)** **Claude** Missions prototype P1–P3 first ([diario.md](diario.md) → Prototype first; Josh, 2026-10-19: prototype before building the whole feature)
- [ ] **Josh** P4: after playing the prototype, build the whole chips-and-missions feature, change it, or drop it
- [ ] **N6 (moved from N5, Josh 2026-10-30)** **Claude** Card maker v2 (on hold until P4: chips with missions may replace cards)
- [ ] **Josh** Decide: does the 90%-of-words bar apply to the whole card, or to the frame and the character's line (the slot noun comes from the learner's own scene, with English on levels 1–2)?
- [ ] **Claude** Cards from their own step after each conversation (round 17: today's review phrases mostly can't be cards)
- [ ] **Claude** A judge call per conversation: did the learner say a card's phrase themselves (retires it). No phrase matching
- [ ] **Josh** Decide: the learner's voice for their replies (one voice per country, or matched to the learner); whether the book shows during a conversation (diario.md suggests not)
- [ ] **Claude** Build after reply buttons (levels 1–3), since the cards are those screens

### Learn and Teach: the teacher outside the world ([learn.md](learn.md), [teach-plan.md](teach-plan.md); Josh, 2026-10-19, option D for Magda) — N5
- [ ] **Josh + Claude** Lessons from the syllabus, one step each, voiced by people the learner knows; missions after them, built on what the learner can say (Josh, 2026-10-27: [teach-plan.md](teach-plan.md) → Lessons and missions). Next: one lesson made straight from a unit's step (a1-15 step 1) to compare with the improvised trial; split units into steps; a "can say" record in the memory notes
- ~~**Claude** L1: the Learn prompt as a trial file, Ask and Lesson runs with simulated learners (bars in learn.md)~~: skipped (Josh, 2026-10-30: the lessons replaced it)
- ~~**Claude** L2: Learn behind a setting (off by default): an icon left of the Diario opens the teacher, English and the language both ways (`mode: "any"`); next build~~: skipped (Josh, 2026-10-30: the lessons replaced it)
- ~~**Josh** L3: keep it and take the school out of the world, or change it; name, icon, whether she stays Magda~~: skipped (Josh, 2026-10-30: the lessons replaced it)

### Adventures ([adventures.md](adventures.md); Josh, 2026-10-27: ideas forming) — N6 (moved from N5, Josh 2026-10-30)
- [ ] **Josh** Play the current places (Rome first) and note who and where feels off
- [x] **Claude** Then (done 2026-10-29): the Beginner prompt told the kind of place and why the person is there (no invented jobs: a student selling pizza, a woman in a square making coffee); check every city for customers placed in shops
- [ ] **Josh + Claude** Adventures: places where something happens, people with something to show (scholar, priest, docent, professor, journalist, archaeologist), and a mystery to solve across days and places; Rome first

### Smaller world for beginners — skipped (Josh, 2026-10-30; had been on hold for a spec since 2026-10-18)
Josh's idea (2026-10-17): for levels 1–3, fixed scripts per character, the same for every learner, in one neighbourhood until level 4. Explored in rounds 11–13 ([level-judge-test.md](level-judge-test.md)); described in [beginner-scaffolding.md](beginner-scaffolding.md) → "On hold". No work on it until the spec exists.
- ~~**Josh** ⛔ Spec: what's fixed and what's generated; which neighbourhood(s) per country; how many visits and in what order; what earns leaving it; how it fits levels 1–3; whether audio is recorded once~~: skipped (Josh, 2026-10-30)
- What the tests found: a scripted neighbourhood is cheap to write (24 characters, about 50 scripts, minutes) and the easiest dialogue yet (70–84% of lines a beginner can follow), but where both replies must lead to the same next line, one path ignores the learner's answer; forcing a this-or-that choice at every join made it a quiz (round 13)
- Parked tests: scripts as a tree with no joins; visits ordered so frames build up ("Vorrei…" before "Sono di…")

### Parity with the web — N6 (moved from N5, Josh 2026-10-30)
- [ ] **Claude** Visit stamps redesigned: design locked 2026-10-29 (a scontrino pinned in the picture's corner, *già visto* then *di casa*; [visited-badge.md](visited-badge.md)); not built
- [ ] **Josh** ⛔ Say what's wrong with the city picker; then **Claude** improves it
- [ ] **Claude** Stations and ticket: departures board, the clerk names the platform, "Sali"

### Release: the route to TestFlight (broken down 2026-10-18)
Two stages. A TestFlight for Josh alone needs no Apple review and none of the cost protection; anyone else does ([12-native-app.md](12-native-app.md) → Cost protection). Josh's developer account is paid (Movie Genius shipped from it), so App Store signing works.

**Stage 1: TestFlight for Josh only** (internal testing; N4 in 12-native-app.md, scaffolding included) — **done 2026-10-25, build 0.1.0 (5)**
- Josh, 2026-10-18: hold new TestFlight builds until a milestone; server changes still reach build 1 through Railway. Waiting for the next build: the mic states (87ed253, 9c2ed05) and the double-tap fix (5e54841); an idea only (Josh, 2026-10-20): an exit link that fades in when the conversation is over (round 20's `over` flag), to tap or ignore
- [x] **Claude** Icon (2026-10-17), microphone usage text, export compliance (`ITSAppUsesNonExemptEncryption: false`), version 0.1.0 build 1
- [x] **Josh** Created the app in App Store Connect (2026-10-18); **Claude** registered the bundle id `com.joshp100.fuori` (it wasn't: phone builds used the wildcard profile)
- [x] **Claude** `make archive`, `make export`, `make upload` (`ios/Makefile`); build 0.1.0 (1) uploaded 2026-10-18. Bump `CURRENT_PROJECT_VERSION` in `project.yml` before each upload
- [x] **Claude** Release-build check: production servers only, launch-argument shortcuts are debug-only
- [x] **Claude** The sign-in token carries over from the Xcode build to the TestFlight one. Confirmed 2026-10-19: on the phone, build 1 signed in as Josh's own learner in both countries (Italy `3c544022`, from the web days; Mexico `25d15e1d`), and Josh: characters remember him from the web. (The Mac install is a separate learner, as expected: its Keychain is its own)
- [x] **Josh** Installed from TestFlight and played in Italy (2026-10-18)
- [x] **N6 (moved from N4, Josh 2026-10-23)** **Josh** The device checks (Conversation on the phone): Josh, 2026-10-27, "works" (on his phone's development build)
- ~~Gate: play from TestFlight on 3 separate days without the laptop~~: dropped (Josh, 2026-10-23: not a release item; Claude wrote it into the plan). Claude reads the saved app error reports (`format=errors`) as Josh plays

**Stage 2: before anyone else gets it** — N5 (external testers; Apple's beta review, usually about a day)
- [ ] **Claude** App Attest when a device registers
- [ ] **Claude** Usage tracking and a per-learner daily budget (`usage_daily`: turns, speech-to-text seconds, voice characters → `402 quota`; the app already falls back to the phone's voice on `quota`)
- [ ] **Claude** R2 custom domain for images (r2.dev is rate-limited, for development only); **Josh** picks the domain
- [ ] **Claude** Privacy policy page at a public URL; **Josh** approves the text
- [ ] **Claude** One line on the microphone step of onboarding saying what is sent to outside AI services
- [ ] **Josh** App Privacy label in App Store Connect (audio and text sent to Groq, Anthropic and ElevenLabs); **Claude** drafts the answers
- [ ] **Josh** Beta app description, feedback email and notes for the reviewer; **Claude** drafts them
- [ ] **Josh** Approve what testers are asked to test (2026-10-18; things Josh can't judge himself, having built it and knowing the language):
  1. First 5 minutes alone: choose a country, allow the mic, pick a place and start talking, with no help
  2. Speed: does the ~4 s wait feel like a conversation or like waiting? Decides how urgent starting the voice on the first sentence is
  3. Beginners: can they follow at their level? The tests say only about a third of lines are easy enough
  4. Coming back: do they return on a second day unprompted, and does the character remember them?
  5. Mexico from someone who doesn't speak Spanish
  6. Anything broken: a reply that doesn't follow, English nobody asked for, the mic not opening, a hang

  TestFlight "What to Test" text (draft): *Pick Italy or Mexico and talk to whoever you meet. Tap to speak, tap again when you're done. Please tell us: was anything confusing in the first few minutes? Did the replies come fast enough to feel like a conversation? Could you follow what people said? Did anyone remember you when you came back another day? Screenshot anything broken or odd (shake or use TestFlight's feedback).*

**Stage 3: the App Store** (later) — N5
- [ ] **Claude** "Report this line" button; screenshots, description, age rating and review notes (**Josh** approves)
- [ ] **Claude** Web sunset, about 2 weeks after TestFlight
- [ ] **Josh** Storefronts: launch outside the EU and skip the EU trader declaration (Josh, 2026-10-18: learners are English speakers, not Italians, and the store is chosen by the Apple ID's country, not where they are). Declare trader status (App Store Connect → Business) only if EU stores are wanted later
- Screenshots for the App Store page: 3–10 at the 6.9-inch size (1320×2868), taken from the app by **Claude**; a preview video is optional. Nothing beyond the icon is needed for TestFlight

### Housekeeping — N4 done
- [x] **Claude** Railway watch paths: docs-only commits are now skipped (seen 2026-10-18)
- [x] **Claude** Move the test scripts from the laptop scratchpad into the repo: done 2026-10-18 (`tests/experiments/`, README there: qtype → question-kinds, replies → reply-buttons, place-test → placement, repeat-test → repeats, cap-test → reply-tokens, real-judge → real-conversations); ticked 2026-10-22

### Next release (likely deferred) — N5

Works or is wanted, but not for the first release.

- [ ] **both** Hands-free extras: prepare the reply during the silence; the wait adapts to cut-offs and counts them. (Hands-free itself is on for everyone since 2026-10-26.) Josh, 2026-10-16, after using it: it works well but feels like an expert feature, not because of difficulty but because of the focus a free-flowing conversation takes; pressing a button is more forgiving on response time (perception) and gives the speaker more control.
- [ ] **app** Night-paper palette, so the app follows the phone's Dark Mode (D1). Until then the app is light only (Josh, 2026-10-16: deferred).

#### Ending a conversation (round 19; Josh, 2026-10-19; next release, Josh 2026-10-19: reply buttons first)
Josh: some conversations are clearly over (both said ciao, arrivederci, ci vediamo; you paid and said thank you) but the only way out is back. Investigate game-wide, missions included ("Done").
- [x] **Claude** Round 19 (`tests/experiments/conversation-ends.mts`, admin export): Italy 28 conversations, 17 reached a natural end (13 of those left within one exchange; characters never opened something new after it, 2 added a reminder or answered a silent turn); 11 left mid-question. Mexico 9: 8 left mid-question and no learner said goodbye
- [x] **Claude** Round 20 (`end-detect.mts`, Italy 26 conversations, 153 turns): an `over` flag on the character's reply and a separate judge both end nothing early (0%) and catch 82% of ended conversations (bar 90%); the misses are mostly where only the character said goodbye, which isn't Josh's "both say ciao". The flag costs nothing and doesn't change the line. Mexico untested: only 1 conversation reached an end
- **N6 (moved from N5, Josh 2026-10-30; placed in N5 by Josh 2026-10-23).** **Josh, 2026-10-23:** the learner's goodbye is the trigger; she answers with hers and the conversation is over: the mic goes, a finish link leaves like Back; the learner can leave early but not continue. Round 20's `over` flag is the mechanism (its misses were where only she said goodbye). Supersedes "ignore it and keep talking" below. Details in beginner-scaffolding.md
- ~~Decide: add `over`; the link fades in, ignore it and keep talking, nothing ends by itself~~: superseded by the goodbye rule above (Josh, 2026-10-23: the learner can leave early but not continue)
- [ ] **Josh** Pick the word: "Esci" or "Fuori" for Italy, and Mexico's ("Salir"?); it comes from `/v1/content`, not Swift
- ~~Reply buttons get the same Done link~~: superseded (say it in English replaces the reply buttons; the goodbye rule ends conversations for everyone, Josh 2026-10-23)

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
