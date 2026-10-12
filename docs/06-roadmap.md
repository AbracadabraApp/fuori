# Roadmap

Each milestone ends with something playable on your phone. There is no separate validation phase: the first real test is talking to a character in the app.

This file is the one place for **what's in each milestone** and **what to do next**. Parked ideas live in [Ideas](ideas.md); questions waiting on a decision live in [Open design questions](open-design-questions.md); what happened each session lives in `progress.md`.

## Now (ranked)

Updated 2026-10-12. Top of the list first; strike items off here as they're done.

1. ~~**Postgres in Railway**~~ Done 2026-10-11: tables created on Railway (learners, character_memories, conversations).
2. **Memory, saved transcripts and the review log** (M1, below): core M1 completion.
   - **Recording: done 2026-10-12.** Every turn is saved (`lib/recording.ts`); leaving marks the conversation ended. Read them at `/api/admin/conversations?key=…&format=text` once `ADMIN_KEY` is set in Railway.
   - **Still to do:** the end-of-conversation Claude call that writes the character's notes and the review log (hook: `/api/conversation/end`), and loading notes into `{relationship}` on the next visit.
   - **Then:** read real transcripts to judge reply length and the prompt audit fixes (below).
3. **Roma portraits** (laptop, needs the xAI key): 23 Roma city characters have no portrait. `npm run images -- --city roma`, then `npm run test:images` should report 0 missing.
4. **Prompt experiments** (version bump + changelog each time). Audit 2026-10-12, most likely causes of long turns first:
   - the opener has nothing to respond to ("Someone has just walked up to you"), so the character fills the silence with several things at once. Letting the learner speak first was considered and dropped (Josh: he'll only ever say "buongiorno", so the character still has to give him something to answer). What's wanted: an opener that hands the learner one clear thing to respond to. Levers: what the character is doing right now (the scene), and the cold-start scene card with things to do there (ideas.md Coda #7), so the learner arrives with a reason
   - the history is sent as one document ("Previous conversation: … Respond naturally as your character would"), not as alternating chat messages: try real dialogue messages
   - "as your character would" invites performing the character; anchors' `setting` is an image description, which becomes talking points
   - a factual line that characters only receive text and can't hear accent or pronunciation (Salvatore "corrected" *grazie* and "Grigianto")
   - who the learner is: someone who lives here now, not a tourist (Salvatore asked how many days you're staying)
   - traits as manner, not expertise, on 5–10 characters ("local historian" → a history lecture; ~150 of 634 characters have traits like knowledgeable, storyteller, expert, chatty)
   - the "noticed" reply field, if Josh decides yes ([open question](open-design-questions.md#11-level-and-speaking-2026-10-11))
5. ~~**ElevenLabs quota**~~ Checked by Josh 2026-10-12: the quota was used up, which caused the voice dropping mid-conversation on 2026-10-11. Long replies (~500 characters each) use it fast. Josh upgraded the ElevenLabs plan the same day.
6. **Image sizes and settings (low priority).** The image request sets no size, so the generator picks one: cities are all square (49), places are mostly wide 3:2 (537 wide, 62 tall, 7 square), portraits are mostly tall 2:3 (596, though `07-visuals.md` says square). Place cards show a square crop, so wide images lose their sides and signs can be cut off. Steps: decide the size for each kind of image; set it in the request (`aspect_ratio`, check xAI accepts it with one test); give every place prompt its location and a sign rule (Caffè Toledo came out as Paris's Café de Flore because its prompt never says Napoli, and about 350 of 594 place prompts don't name Italy or the city); then regenerate only the ones that are off. Tested wording: "…a busy café on a main shopping street in the Centro Storico of Napoli, Italy… The café's sign reads "Caffè Toledo". Any other lettering is everyday Italian street detail, like a chalkboard menu or a street name; no banners, emblems or signs naming the neighbourhood or city."

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
- [ ] Postgres: `learners`, `character_memories`, `conversations` ([Data model](09-data-model.md#storage-strategy)); anonymous learner id in a server-set cookie
- [ ] Save each conversation: character, place, times, prompt version, and turns (who, text, English, time). No audio.
- [ ] When a conversation ends, one Claude call writes:
  - the character's notes about you (fills `{relationship}` next visit)
  - a **review-log entry**: the 2–3 things most worth catching, judged by comparing the character's Italian with the learner's level (useful or recurring words and structures likely beyond them), plus real mistakes the learner made. Skips anything that could be speech-to-text noise.
- [ ] Show the review log in debug mode only, to check it's accurate before anyone else sees it

**Done when:** you come back to a character another day and they remember your name and something you talked about; and the review log for a conversation picks things you'd agree were worth learning.

## M2: Magda, the day, and people who know you

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
