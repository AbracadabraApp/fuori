# memory.md changelog

Newest first. One entry per version: what changed, why, what prompted it. The prompt is `../memory.md`.

Newest first. Each entry: what changed, why, and what prompted it.

### 2026-11-07a: the notes also hold what the character told them
- **Changed:** "what {name} will remember about this person" became "…, and what {name} told them".
- **Why:** the notes recorded only the learner, so on a return visit the character didn't know what they'd already said and replayed the earlier visit: the same story told as new, the same question asked again after it was answered (test C5, docs/prompt-trials.md: with today's notes Don Ramón asked "¿Ya fue al Jardín?" on all three visits and retold his quiet-town childhood each time; with the clause he carried a thread instead: the churros promised, the churro lady, "¿fuiste por fin…?").
- **Prompted by:** C4 and C5, 2026-11-07; Josh: repeating topics helps learning, "groundhog day conversations feel broken", and a failure seen in a small test is enough.

### 2026-10-14a: learning notes for Magda's study file
- **Added** two fields to the review (now called the learning notes): `missed` (words the person didn't understand, with meaning) and `english` (moments they fell back on English). Mistakes must quote what they actually said.
- **Why:** the learning notes are now the only per-conversation record of learning; Magda's study file is built from them. The heavy per-conversation "Review" is removed (docs/02-game-design.md → The study file).
- **Prompted by:** Josh, 2026-10-14: redesign Magda's teaching around a study file and one-goal lessons.

### 2026-10-12b: review item field `phrase`
- **Renamed** the review item's field from `"it"` to `"phrase"`, which was named after the Italian language code. Reviews saved before this still show (the admin text reads either name).
- **Prompted by:** Mexico phase 1, get Italian out of the code.

### 2026-10-12: first version
- Notes and review log in one call, as planned in `docs/09-data-model.md` → Storage. Notes are capped at 10 lines and merged with what the character already remembered, so memory stays short as visits add up.
- The review log follows the M1 roadmap: 2–3 things worth catching from the character's speech, judged against the learner's own lines, plus real mistakes; speech-to-text noise is skipped.
- Notes leave out mistakes and level, so characters don't start remembering people as students.
- **Prompted by:** roadmap Now #2, finishing M1 memory.
