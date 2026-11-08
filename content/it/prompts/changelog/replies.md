# replies.md changelog

Newest first. One entry per version: what changed, why, what prompted it. The prompt is `../replies.md`.

### 2026-11-05: as briefly as a local says it; the English names a local thing

Josh, 2026-11-05, on Doña Chela's "Quiero probar un chapulín, por favor.": "reply is too long replies. One translation doesn't translate the subject." Same change as beginner.md 2026-11-05b, so every prompt that offers answers asks for them the same way (fixes are global). The Read prompt's replies are now as short as a local would say them, not "one short, whole sentence"; the Choose prompt keeps whole sentences, since its misfit must match the fit's length.

Newest first. Each entry: what changed, why, and what prompted it.

### 2026-10-22: the Choose prompt

Josh, 2026-10-22: the stages go tap, read aloud, choose, in each of a new
learner's first three conversations. The third needs a pair where only one
reply fits; the wrong one is correct language that doesn't fit the moment,
never broken language, so the screen never models a mistake
(docs/beginner-scaffolding.md → stages B and C). The System prompt is
unchanged. Trial (tests/experiments/reply-choice.mts, 84 pairs per country):
a first version passed all checks on 70% (Italy) / 75% (Mexico), its wrong
reply often another fair choice (coffee at a market) or given away by a
different greeting; this one, the wrong reply answering a different
question, passes 92% / 85%, at about 5 s instead of 2.

### 2026-10-17b: a polite no

Round 7: the "no" reply could sour the moment ("No, no me gusta Oaxaca" to a
proud local, "No, non voglio un caffè" to a host). Now a no keeps the
conversation going: "No mucho todavía, pero me gusta la plaza.", "No, no me
gusta el queso, pero quiero probar el mole." Other checks unchanged (all
good 91–92%, sensible 100%, 1.4–1.5 s).

### 2026-10-17: first version

Round 7 of docs/level-judge-test.md. A first version kept both replies on one
frame even after a yes-or-no question, so both said "Sì" and one answered
something else ("Ti piace l'arancia?" → "Sì, mi piace il mare"). This one makes
a yes and a no the two choices and asks for different choices, not two
wordings. On round 6's conversations: sensible 97–100%, every check passed on
92–100% of pairs, Sonnet 1.3–1.4 s, always ready before the character's voice
ends.
