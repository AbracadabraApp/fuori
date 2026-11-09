# Beginner deep dive (2026-11-09)

Five read-only reports put together: production code (origin/live bb0b6e6), proposed changes (beginner-plan.md), real play (last 14 days, production DB), dependencies, and history (git and changelogs). Facts unless marked *opinion*. Baseline: [beginner-as-live.md](beginner-as-live.md); spec: [beginner-plan.md](beginner-plan.md).

## 1. Production: what the code check found

- **Bug: the heard note never reaches the character in the app.** `app/v1/turn/route.ts:121` rebuilds the transcript as `{who, transcript, translation}`, and the turn schema (`lib/turn-request.ts`) drops unknown keys, so `offered` is lost and `readHeard` always returns null. The "they said back your answer / their own words" note (dialogue.md, 2026-11-05) has only ever run in unit tests. A fix sits in the `beginner-shapes` worktree, uncommitted.
- **Records undercount turns.** Two Nov 9 conversations recorded 5 and 4 learner turns where the transcripts have 12 and 18, so neither counted toward moving up. Not yet checked whether these predate the record rewrite released Nov 8 (bb0b6e6).
- **beginner-as-live.md is wrong in three places:**
  - The welcome places everyone at step 1. `placement()` (step 3 for own words) is only on the older send-off path.
  - The language parts' English is never shown, not even on a tap ("Nothing happens on a tap", BeginnerBubbles.swift).
  - Choosing Beginner in Settings restarts at step 1 only from step 5 or above; otherwise the last step resumes.
- **The reply panel isn't fully dormant.** It is suppressed only when a reply has parts, so S4 or a failed path lookup can still show it. In practice it doesn't.
- **Readings from How do I say it count as own words** in the record (inferred from code).
- **S4 has no English parts:** it's the Intermediate prompt plus a block, with no answers, no heard note and no help-when-asked. Under "English on every turn defines Beginner", step 4 is already Intermediate.
- **The prompt layers conflict:**
  - S1's "yes/no or this-or-that only" against beginner.md's "prefer verbs".
  - Phrases of 4–8 words against 5–8 words.
  - S3's "English for unguessable words" against "English only if asked".
  - "Echo: new words" is prompt-only, although leveling.md says code clears the glosses.

## 2. Real play (Oct 26 – Nov 9)

- **38 Beginner conversations, 21 with a learner turn.** 17 are opener-only, most in bursts (5 places in 1 minute). *Opinion:* browsing, not quitting. Sophia had none.
- **Who replied how (classified from transcripts):**

| Learner | Turns | Said back | Own words | English/help | Garbled |
|---|---|---|---|---|---|
| Jennifer (MX, S2–S3) | 34 | 85% | 0 | 3 asides | 2 |
| Josh MX (S2) | 32 | 72% | 3 | 4 | 2 |
| Josh IT (S1) | 81 | 58% | 35% | 3 | 3 |
| Josh IT Siena (Oct 28) | 35 | ~23% | ~66% | 1 | 3 |

- **Nobody has moved up.** Jennifer can't: with 0 own-words turns she never reaches "counted", yet the step's fixed pattern raised her to S3 anyway. There she said: "is it giving you bubbles or are you having to fill it in? I'm having to fill it in."
- **Nearly every turn has the same shape:** an English line, a phrase or two, one question (46 were either/or), then answers.
- **The same openers and arcs repeat:**
  - 19 of 38 openers ask the learner's name, three times right after a "welcome back".
  - The cash-or-card question came up 9 times.
  - Josh, mid-conversation: "perché ogni bar ha detto le stesse cose?"
- **What broke:**
  - Wrong name: Luisa called Josh "Gabriele" on all 3 visits.
  - Wrong learner facts: Jennifer called "de Canadá".
  - Role slips: a student offered water; a taxi driver took a food order.
  - A ticket office said the learner's request for them.
  - Beto's goodbye took 5 exchanges.
  - Mishearings: "Giovanni" for giovedì.
- **What worked:** help and culture questions answered in role (why you pay at the cassa first, cavolo nero is kale, gricia vs amatriciana), and a simple re-ask after garbled speech.

## 3. History: what has held

- **Rules enforced in code have held; prompt rules keep coming back.** In code: one question a turn, the gloss added by code, tidyParts, pauses. Back again despite prompt fixes: repetition (4 times), the English balance, teacher talk, long answers. This supports picking the turn's shape in code.
- **Stage blocks barely moved anything when measured** (Talk 2/3: no change; the English echo was the only dial that did). Supports the short prompt.
- **Each fix moves the failure somewhere else.** Freeing characters from the sale made Mexico repeat its one planted idea (1.1 → 2.6 repeats). Check repeats across visits, not just within a turn.
- **Scaffolding UI was built ahead of play, then reversed within a day,** three times: buttons → reply panel → Say it in English. Hence: side by side first.

## 4. The plan against all this

**The plan answers:**
- the same shape every turn (the picker);
- the stage blocks that cut English, and S4 with none (English on every turn);
- Jennifer's S3 frame struggle (the frame isn't in the kept reply forms).

**Risks the history points to (*opinion*):**
- The English-then-language echo reverses the Nov 5 "say each thing once" fix ("cafe, coffee, cafe"). Keep it a restatement, never word for word, and count repeats.
- Allowing "just say …" relaxes two earlier teacher-talk fixes. Watch for "let me ask"-style announcing.

**Undefined before code can rely on it:**
- The seed: per conversation, per turn?
- What "the same shape" compares: jobs only, or forms too?
- How long a job can be.
- What "ready" means on the ramp.
- What happens to step 4.

**Reply forms that change the counting, so they should wait until Josh says how each counts:**
- *Answers in her speech, spoken only:* nothing is offered, so a said-back line counts as own words, gets no heard note and no drafted reply.
- *Answer in English on purpose:* counts as lost, which pushes the conversation toward hard.

**Safe to try now, because counting is unchanged:**
- two answers;
- one answer;
- a question to ask her (an answer that ends in "?");
- the answer in her speech *and* shown.

**Contracts a change must not break:**
- the parts schema (four fields, strict, in an order PartsWatcher's regex expects);
- `lineFromParts`, which iOS mirrors to time the bubbles;
- the `+S1` tag in the prompt version (the record reads the stage from it);
- `isSaidBack` / offered answers;
- Italy and Mexico parity.

## 5. Trying it: side by side before any cutover

1. **Offline first:**
   - The new version is built beside today's; `beginner.md` stays as the control.
   - Test card: a visit with fixed learner lines (not a simulated free learner), reviewed, Italy first.
   - Josh reads the same places played both ways.
2. **Then live, for listed learners only** (`BEGINNER_SHAPES_LEARNERS`, empty means off):
   - About half their Beginner conversations play the new one, not labelled.
   - The prompt version records which.
   - Same app, records and moving up.
   - Needs Josh's OK as an exception to "no test flags".
3. **Compare after 10–20 of each:** transcripts and counts from transcripts, then Josh's verdict.
4. **Cutover or back out:**
   - Cutover makes the new version the default, with today's kept a week.
   - Backing out is emptying the list.
