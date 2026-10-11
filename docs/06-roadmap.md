# Roadmap

Each milestone ends with something playable on your phone. There is no separate validation phase: the first real test is talking to a character in the app.

This file is the one place for **what's in each milestone** and **what to do next**. Parked ideas live in [Ideas](ideas.md); questions waiting on a decision live in [Open design questions](open-design-questions.md); what happened each session lives in `progress.md`.

## Now (ranked)

Updated 2026-10-11. Top of the list first; strike items off here as they're done.

1. **Measure level and length in `npm run test:conversations`.** Add a level-fit score and a turn-length score (separate from naturalness), level before and after "non capisco", and a simulated learner who never says they're learning. The grader currently says not to penalize complex Italian, so nothing catches the main problem from phone play; changing that line needs Josh's OK. Gives a baseline before any prompt change.
2. **Score the learner, without using it.** A scorer that reads a conversation and estimates the learner's level from what they said, with the evidence. Not sent to characters. Tested the same way as the characters: simulated learners of known levels (A1, A2, B1) talk to characters, and the scorer should recover each one's level. Caution: the same model writing and judging the learners is circular, so also check it on Josh's real conversations once they're saved, against Josh's own sense of his level (not a measured one). Short conversations give little evidence, so it should say when it can't tell. Becomes the starting point for the learner level in M2.
3. **Prompt experiments, each compared with the test above** (version bump + changelog each time):
   - a factual line that characters only receive text and can't hear accent or pronunciation (Salvatore "corrected" *grazie* and "Grigianto")
   - who the learner is: someone who lives here now, not a tourist (Salvatore asked how many days you're staying)
   - traits as manner, not expertise, on 5–10 characters ("local historian" → a history lecture; ~150 of 634 characters have traits like knowledgeable, storyteller, expert, chatty)
   - the "noticed" reply field, if Josh decides yes ([open question](open-design-questions.md#11-level-and-speaking-2026-10-11))
4. **Postgres in Railway** (Josh): unblocks memory, saved transcripts and the review log.
5. **Memory, saved transcripts and the review log** (M1, below).
6. **ElevenLabs quota** (Josh): check usage; likely cause of the voice dropping mid-conversation on 2026-10-11.

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
- [ ] Level and length in the conversation test ([Now #1](#now-ranked))
- [ ] Learner-level scorer, observe only ([Now #2](#now-ranked))
- [ ] Prompt experiments ([Now #3](#now-ranked))
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

See [Ideas](ideas.md): reading moments at real landmarks, food culture conversations, animated clips for the core cast, other languages.
