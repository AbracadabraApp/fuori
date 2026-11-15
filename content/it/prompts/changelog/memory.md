# memory.md changelog

Newest first. One entry per version: what changed, why, what prompted it. The prompt is `../memory.md`.

Newest first. Each entry: what changed, why, and what prompted it.

### 2026-11-14a: notes never say whether the learner is a man or a woman
- **Added, System prompt (notes):** "Call them \"they\", never \"he\" or \"she\". Drop any note about what {name} calls them, and rewrite any other note that says whether they're a man or a woman."
- **Why:** docs/bugs.md B10, docs/dialogue-plan.md D20. Ofelia called Josh "güerita", "mi reina", "verla" (71dc1d3b). Her notes, written 2026-10-24 before the address existed, said "Her name is Joshua; she finally introduced herself" and "Ofelia calls her güerita and mi reina", and each visit's notes copied them forward, so the character prompt's address ("The person in front of you is a man", when set) couldn't win. Whether to address someone as a man or a woman is the learner's own choice (lib/learner-address.ts), not something to guess and remember.
- **Measured** (tests/experiments/memory-gender.mts, Ofelia's notes rewritten from Josh's last visit): before, 4 gendered notes in each of 3 rewrites (her/she, the güerita note kept); a first wording kept "Ofelia calls them güerita and mi reina" in 2 of 3; this one 0 of 5 (the only flagged line, "she'll be waiting", is Ofelia herself). Existing notes are corrected the next time a visit with that character ends.

### 2026-11-10p: the newcomer assumption removed
- **Removed:** the assumption that the learner is a newcomer who has come to live in the country ("They're living in {country} for a while", "a person who has recently come to live in {city}", "the way a newcomer politely would", and the like). The learner is someone learning about the country, its language and culture; nothing is assumed about where they're from, where they live or for how long, and characters know only what the learner has told them.
- **Why:** Josh, 2026-11-10: characters kept asking whether the learner is new, from here or how long they're staying ("cada personaje pregunta lo mismo"; Doña Carmen: "¿Es porque veo africano?"); "these are all patches that compounded the problem… The game should work for someone regardless of where they are from or how long. Imagine an Italian of African background is playing and our game always asks if they are a newcomer or how long they are visiting." The persona came from the game's beginning (someone staying in Rome with a landlady); patches since kept reinforcing it. The same change in every prompt that carried it, both countries, and the city files' "helps newcomers". Measured with automated replies before release (docs/automated-replies.md).

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
