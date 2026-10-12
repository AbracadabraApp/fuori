# Roadmap

Each milestone ends with something playable on your phone. There is no separate validation phase: the first real test is talking to a character in the app.

This file is the one place for **what's in each milestone** and **what to do next**. Parked ideas live in [Ideas](ideas.md); questions waiting on a decision live in [Open design questions](open-design-questions.md); what happened each session lives in `progress.md`.

## Now (ranked)

Updated 2026-10-12 (evening). Top of the list first; strike items off here as they're done. How prompt changes are decided: [10-testing.md → Dialogue quality](10-testing.md#dialogue-quality-decided-2026-10-12).

1. ~~**Postgres, recording, memory, Roma portraits, ElevenLabs quota**~~ Done 2026-10-11/12. `ADMIN_KEY` set in Railway 2026-10-12. Josh's first remembered conversations (Rita, Giulia) were saved well; a true return visit is still to test.
2. ~~**Pronunciation fact line**~~ Done 2026-10-12 (character prompt 2026-10-12b): characters only see the transcription, so they stop drilling "ca-cio e pe-pe". Factual fix, no gate.
3. ~~**Score each conversation when it ends**~~ Built 2026-10-12 (`lib/quality.ts`, judge prompt `content/it/prompts/quality.md`, scorecard `lib/scorecard.ts`). Read at `/api/admin/conversations?format=scorecard`.
4. ~~**Replay test**~~ Built 2026-10-12: `npm run test:replay` (Josh's real lines, his characters plus a seeded sample, same scorer, `gate()`).
5. **First prompt change through the gate: less history per turn, as real messages.** Built behind `TURN_HISTORY=recent` (off). Prediction: median reply falls from ~60 words (Rita, Rosa on 2026-10-12) to under 30, with nothing else worse. On the laptop: `npm run test:replay -- --refresh`, then `npm run test:replay -- --ab=history`. If the gate passes and Josh agrees, set `TURN_HISTORY=recent` in Railway; confirm on the next ~10 real conversations.
6. **Next candidates from the problem list** (after #5, one at a time, through the gate): the opener and too many questions per reply. Earlier audit notes, still relevant:
   - the opener has nothing to respond to ("Someone has just walked up to you"), so the character fills the silence with several things at once. Letting the learner speak first was considered and dropped (Josh: he'll only ever say "buongiorno", so the character still has to give him something to answer). What's wanted: an opener that hands the learner one clear thing to respond to. Levers: what the character is doing right now (the scene), and the cold-start scene card with things to do there (ideas.md Coda #7), so the learner arrives with a reason
   - "as your character would" invites performing the character; anchors' `setting` is an image description, which becomes talking points
   - traits as manner, not expertise, on 5–10 characters ("local historian" → a history lecture; ~150 of 634 characters have traits like knowledgeable, storyteller, expert, chatty)
   - the "noticed" reply field, if Josh decides yes ([open question](open-design-questions.md#11-level-and-speaking-2026-10-11))
7. **Return-visit memory checks** (by hand until the M2 digest): does a character use your name and something you said; does a correction you give ("vivo qui adesso") change how they treat you next time?
8. **Repeated ids across Italian cities (found 2026-10-12 by `test:pack`).** 26 place and character ids are used in 70 places, e.g. `farmacia-centrale` in 8 cities (one image for all) and characters `padre-giovanni`, `suor-teresa`, `dottoressa-martini` in two cities each, so they share a portrait and **share memory** across cities. Fix: prefix ids with the city when generating, rename the existing ones, then make `test:pack` fail on repeats.
9. **Image sizes and settings (low priority).** The image request sets no size, so the generator picks one: cities are all square (49), places are mostly wide 3:2 (537 wide, 62 tall, 7 square), portraits are mostly tall 2:3 (596, though `07-visuals.md` says square). Place cards show a square crop, so wide images lose their sides and signs can be cut off. Steps: decide the size for each kind of image; set it in the request (`aspect_ratio`, check xAI accepts it with one test); give every place prompt its location and a sign rule (Caffè Toledo came out as Paris's Café de Flore because its prompt never says Napoli, and about 350 of 594 place prompts don't name Italy or the city); then regenerate only the ones that are off. Tested wording: "…a busy café on a main shopping street in the Centro Storico of Napoli, Italy… The café's sign reads "Caffè Toledo". Any other lettering is everyday Italian street detail, like a chalkboard menu or a street name; no banners, emblems or signs naming the neighbourhood or city."

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
