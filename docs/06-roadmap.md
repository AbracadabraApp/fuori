# Roadmap

Each milestone ends with something playable on your phone. There is no separate validation phase: the first real test is talking to a character in the app.

This file is the one place for **what's in each milestone** and **what to do next**. Parked ideas live in [Ideas](ideas.md); questions waiting on a decision live in [Open design questions](open-design-questions.md); what happened each session lives in `progress.md`.

## Now (ranked)

Updated 2026-10-12 (evening). Top of the list first; strike items off here as they're done. How prompt changes are decided: [10-testing.md → Dialogue quality](10-testing.md#dialogue-quality-decided-2026-10-12).

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
7. **Return-visit memory checks** (by hand until the M2 digest): does a character use your name and something you said; does a correction you give ("vivo qui adesso") change how they treat you next time?
8. **Repeated ids across Italian cities** (found 2026-10-12 by `test:pack`). 26 place and character ids are used 70 times, so those places share one image (`farmacia-centrale` covers 12 cities) and 11 repeated characters **share memory and voice across cities** (Padre Giovanni in Firenze, Venezia and Assisi). Fix: keep each id in its first city, rename the 44 later uses to `<id>-<city>`, generate their images, move any affected memory, and make `test:pack` fail on repeats. Plan and full list: [duplicate-ids-fix.md](duplicate-ids-fix.md). (The Italy trim of 2026-10-13 shows only places whose ids aren't repeated, so the bug can't be seen in the app right now, but it comes back as soon as a repeated place is shown again.) About 2 hours plus a 44-image run (laptop, xAI key).
9. ~~**Image sizes and settings.**~~ Cancelled 2026-10-13. Not pursuing.

**Added 2026-10-13, not yet ranked against 1–9:**

10. **Afuera doesn't auto-deploy.** The Mexico service on Railway didn't pick up e612c70 while Fuori did, so it likely isn't connected to GitHub. Fix (Josh, in the Railway dashboard): Afuera → Settings → Source → `AbracadabraApp/fuori`, branch `main`, auto-deploy on. One-off meanwhile: `railway up --service afuera` from the laptop.
11. **Mexican voices.** `content/es-mx/voices.ts` reuses Italy's English premade ElevenLabs voices, so characters will sound foreign. Find Mexican-accented Spanish voices in the voice library, make one clip per voice of the same everyday line, Josh picks 4 women and 4 men by ear. Laptop session (ElevenLabs key).
12. ~~**Mexican image prompts.**~~ Cancelled 2026-10-13. Not pursuing.
13. **People with time on their hands (bench characters).** The in-world teaching point with no transaction (see [Game design → Who teaches](02-game-design.md#who-teaches)). 10 of 634 Italian characters have a role that isn't a job (pensionato, studentessa, nonna or abitante del quartiere), nearly all in piazzas and parks: 4 shown (Ettore and Gina in Roma, Elena in Matera, Giovanna in Venezia), 6 hidden. Borderline, all hidden: Federico (poeta locale, Taormina), Dante and Davide (storico locale, Venezia and Verona). Decide whether to show one per city: Firenze, Siena, Napoli and Bologna each have one waiting in `content/it/showcase.ts`; Palermo has none. Open design question first: what is he when he's not teaching? No character has a time constraint (hours, schedule) today.

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
- [ ] Prompt experiments ([Now #3](#now-ranked)): text-only clarification, "lives here" context, manner traits
- [x] Postgres: `learners`, `character_memories`, `conversations` ([Data model](09-data-model.md#storage-strategy)); anonymous learner id in a server-set cookie
- [x] Save each conversation: character, place, times, prompt version, and turns (who, text, English, time). No audio.
- [x] When a conversation ends, one Claude call writes:
  - the character's notes about you (fills `{relationship}` next visit)
  - a **review-log entry**: the 2–3 things most worth catching, judged by comparing the character's Italian with the learner's level (useful or recurring words and structures likely beyond them), plus real mistakes the learner made. Skips anything that could be speech-to-text noise.
- [x] Show the review log in debug mode only (in the admin transcripts, not to learners), to check it's accurate before anyone else sees it

**Done when:** you come back to a character another day and they remember your name and something you talked about; and the review log for a conversation picks things you'd agree were worth learning.

## M2: Magda, the day, and people who know you

- [ ] Dialogue digest: every few hours or N new conversations, refresh the problem list and scorecard by prompt version, catch conversations that never sent an end signal, notify Josh only on a regression or a taste change to approve ([plan](10-testing.md#dialogue-quality-decided-2026-10-12)); then a second grader (Grok) on the judge
- [ ] Name field in settings, sent to Whisper as a hint so names aren't misheard ("Josh" came through as "Josué")
- [ ] Magda reads the review log: picks a few things to work on, messages when something keeps coming up
- [ ] End-of-day "Today" page (the diario), drawn from the review log
- [ ] Learner profile that travels across characters, starting from the learner's stated level and updated from how they speak ([idea](ideas.md#level-speaking-and-review-2026-10-11))
- [ ] Character-judged success after each conversation, from concrete questions (understood what you wanted? had to repeat? fell back on English?)
- [ ] Familiarity over visits (stranger → regular → friend, *Lei* → *tu*); structured facts and promises
- [ ] Where next: characters suggest places, "cambia aria", "vai dove vuoi" (`/api/suggest`, `/api/scene`)
- [ ] Reasons to return: what's new in a character's life since your last visit, generated when you come back
- [ ] Fewer, deeper cities with places and people generated as you explore

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

**Done when:** you come back to the same bar on day 3, the barista greets you by name and remembers your usual, and Magda points out something you've been missing.

## M3: Levels, interaction and polish

- [ ] Interact with the transcript: tap a word for its meaning, translate the whole reply, save words (deferred from M1: too much interface for now)
- [ ] Level steps (A1 → A1+ → A2 …) from evidence in conversations; level rules exist in `content/it/levels/`
- [ ] More dialect as you level up ("Allow dialect" setting)
- [ ] Voice notes and messages from characters; postcards from cities you've left
- [ ] Hosted voices for every character; Magda's voice

## M4: Accounts and costs

- [ ] Email sign-in link; progress follows you across devices (Postgres is already in place from M1)
- [ ] Usage tracking and per-learner daily budgets (Claude, Whisper, ElevenLabs)

## Later

See [Ideas](ideas.md): reading moments at real landmarks, food culture conversations, animated clips for the core cast, other languages (a costed estimate for Mexico: [Mexico version](mexico-version.md)).
