# Lessons learned

What went wrong, what fixed it, and what every Claude session should do differently. Newest first. The short rules live in CLAUDE.md ("Definition of done"); this file is the account behind them.

## 2026-10-13: M2 marked complete, but its core never ran

Written by the laptop session at Josh's request after wiring up M2 (commit `97e54b8`). These were significant errors: the milestone was reported as "complete" and "fully live" while its central features did nothing, and one would have destroyed data.

### What was wrong

**1. The Review was never written.** When a conversation ended, the server called its own `/api/conversation/<id>/review` route over HTTP, at `NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'`. That variable wasn't set on Railway, and Railway runs the app on a different port, so the call failed every time. The failure was caught and logged inside a fire-and-forget `.catch()`, inside a beacon handler that ignores all errors. Nobody saw it. The commits said "Migration 004 deployed - M2 fully live".

**2. The Review would have overwritten memory.** That route saved the Review into `conversations.review`, the column that already held the short review log written with character memory (added the day before). Had the route ever been reached, each Review would have replaced the memory log. Production was checked: 16 memory logs intact, none overwritten, only because bug 1 stopped it.

**3. Magda couldn't be found.** Her character file, portrait and teaching prompt existed, and 15 schools pointed to `characterId: 'magda'`, but she was registered nowhere the app looks. Every school said "nobody to talk to here yet". The commit said "M2 content complete... ready to deploy".

**4. Magda's teaching prompt was never used.** `magda-teaching.md` was written, but no code read it. Even if she had been found, she would have been an ordinary character with no Review.

**5. Stamps never appeared.** The feed asked `/api/learner/demo-learner/visited-places`: a placeholder learner with a `TODO`, a route that took the learner id from the URL (so anyone could read anyone's visits), and a fetch that ran only on changing city, not on coming back from a place.

**6. The Review code broke standing rules.** A model id hard-coded in `lib/review.ts` (CLAUDE.md: model IDs live only in `lib/claude.ts`), the prompt read from `content/it/` directly (breaks Mexico), and Italian tense names in shared types.

**7. An experiment shipped to production and removed all conversation history.** Character prompt 2026-10-12h removed the transcript from the "document" history mode while testing the "recent" mode. Production ran document mode, so for about a day every character on both sites heard only the learner's latest sentence: Giulia asked "Di dove sei?" five times and greeted Josh afresh at the end of a conversation. Fixed by setting `TURN_HISTORY=recent` on both Railway services.

**8. One session's `git stash -u` swept away another session's work.** While the laptop session was generating 90 Mexican images (untracked files), the other session stashed including untracked files. The images and their progress file vanished mid-run; they were found in `stash@{0}` and restored.

**Mistakes by the laptop session itself (also worth learning from):**
- Proposed copying the content scripts for Mexico, against the one-codebase decision already in `docs/mexico-version.md`, because it hadn't read that doc first.
- Proposed making Magda an ordinary character in each city file, which would have split her memory into ten Magdas, before reading what her role is (CLAUDE.md and the roadmap say she's the one teacher).
- Turned every observation into a new prompt rule while working on Mexican images, until Josh said three times it was "overly deterministic".
- Generated content with a duplicate id and an id containing "ñ"; caught by checks before shipping.

### What was fixed (commit `97e54b8`, and `TURN_HISTORY=recent` on Railway)

*Later (2026-10-14, commit `792d3d5`):* the per-conversation Review described below was removed and replaced by learning notes in the memory call and Magda's study file (`lib/study-file.ts`); `lib/review.ts`, `review.md` and `test:review` no longer exist. See [Game design → The study file](02-game-design.md#the-learner-profile-is-magdas-the-study-file).

- **Review:** written directly at the end of a conversation, after memory and only when memory found new turns, into its own column `conversations.analysis`. Uses `lib/claude.ts` and the active country's `review.md`; language-neutral types; nested replies unwrapped. Magda's lessons aren't reviewed.
- **Magda:** one `tutor` per country pack, the same id at every school (one memory), placed in each school's city. `/api/turn` gives her the teaching prompt filled with her memory of the learner and their latest Review.
- **Stamps:** `/api/visits` reads the learner from the cookie; the feed refetches on returning from a place.
- The `pages/` routes were removed. `npm run test:review` checks the connections: every school finds Magda with one id, her prompt fills, the Review is stored without touching the memory log, visits are counted.
- **Verified on the live site** with a scripted learner: talk to Sandro, leave (memory and Review written), the visit counted for the stamp, then Magda opened by quoting the real mistakes from that conversation.

### Why it happened

- **"Done" meant "written and committed", not "used".** No one ran the feature the way a learner would, locally or on the live site. Every one of bugs 1–5 shows up in the first minute of trying.
- **Failures were silent.** Fire-and-forget calls with a `.catch()` that only logs, inside handlers that swallow everything, and nobody reading the logs after deploying.
- **Tests checked parts, not connections.** Prompt files, schemas and images had checks; nothing checked "a school finds its character", "ending a conversation stores a Review", or "a visit shows a stamp".
- **Placeholders shipped:** `demo-learner`, `localhost:3000`, `TODO`.
- **Reuse without looking:** the `review` column was reused without searching for what already wrote it.
- **Experiments changed production by default:** Railway deploys `main`, so an experiment that changes default behaviour is a production change.
- **Two sessions share one working tree** (both on the laptop), and one used a git command that touches files it didn't create.
- **Not reading the docs first.** CLAUDE.md says to read `docs/` before product or architecture decisions; skipping it caused the laptop session's wrong proposals.

### What to do differently

These are now in CLAUDE.md under "Definition of done".

1. **Done means used.** Before calling anything done, complete or live, run it end to end the way a learner would: on the live site with `npm run smoke:live` (a scripted learner: conversation, memory, Review, stamp, second visit, Magda; `COUNTRY=es-mx` for Mexico) or in a browser, and say exactly what was run. If it wasn't run, the commit says "not verified".
2. **After pushing, confirm the deploy succeeded** (`railway status --json`) **and read the logs** (`railway logs`) for errors from the new code.
3. **No silent failures.** Don't hide a failing call in a fire-and-forget `.catch()`. Call server code directly rather than over HTTP to yourself.
4. **No placeholders in shipped code:** no `TODO` stand-ins, demo ids or `localhost` URLs. Search for them before committing.
5. **Before reusing a column, field, id or file, search for what already uses it.**
6. **Test the connection, not just the parts.** Each feature gets a check that the pieces are joined: the place finds its character, ending a conversation stores what it should, the screen asks a route that exists.
7. **Experiments don't change production by default.** Put them behind a setting whose default is today's behaviour, and change the default only when Josh decides.
8. **Never stash, clean or reset files you didn't create** (no `git stash -u`, `git clean`, `git checkout -- .`): the other session may be mid-task in the same folder. Commit generated files promptly.
9. **Read the relevant `docs/` before proposing a design,** especially decisions already made (one codebase, Magda's role, no special characters).
