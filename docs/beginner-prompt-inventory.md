# The Beginner prompt, unit by unit

The map for testing the Beginner prompt (Josh, 2026-11-06: "enumerate the
prompt and decide which parts to test"; "you are working from hunches and
going too fast"). Every unit a Beginner turn is given, its size, where it came
from (the dated problem it answered, from the changelogs and
`docs/prompt-trials.md`), whether it was ever measured, and a hypothesis. **The
hypotheses are guesses to test, not findings.** Tests are logged in
`docs/prompt-trials.md`, each pointing back to a unit id here.

Italy and Mexico have the same structure (`content/<country>/prompts/`). Words
counted on Italy, 2026-11-06 (beginner.md 2026-11-06, dialogue.md
2026-11-06b). A stage-2 Beginner turn gets B, then the stage's blocks (S),
then D; the code adds C.

Total today: beginner.md system prompt about 1,240 words; stage 2 blocks 130;
dialogue.md 216. About 1,590 words before the conversation itself.

## beginner.md → System prompt

| Id | Words | Unit (short) | Came from | Measured? | Hypothesis (to test) |
|---|---|---|---|---|---|
| B1 | 10 | "You are {name}, {role}, in {city}. You're at {setting} {character}" | 10-25; setting with the place's kind and `here` 10-27 (Giorgia ran a pizza-by-the-slice shop as a sit-down pizzeria; a woman in a square offered coffee) | The `here` echo: yes (2026-11-06, the planted idea comes up on nearly every visit) | Whatever the setting says gets said every visit |
| B2 | 43 | A Beginner who has come to live here; "be the person you are, helpful the way someone in your job would be" | 10-25 first version | No | "someone in your job" gives every character a job, so an errand |
| B3 | 6 | "How you talk to a Beginner:" | — | — | — |
| B4 | 100 | English: at most two short sentences, one detail, heard not shown, say each thing once (two examples) | 10-25b (English ran 36–54 words a turn); 11-05c (Josh: "cafe, coffee, cafe", the same thing said three times) | Yes: 10-25b English 14–29 words a turn; 11-05c replay set | The examples ("Here you pay at the till first", "Welcome to my bar!") put bars and paying into every scene; overlaps S2a, which says one sentence |
| B5 | 41 | What to keep or say is in the language, as its own part | 10-25 | — | Format; not to test |
| B6 | 66 | Phrases of 4–8 words in the language in most turns, their English said by the game | 10-25e (Josh: "a bit more Italian phrase, 4-8 words") | Not measured on its own | Overlaps S2b "Language: 2", which replaces it |
| B7 | 88 | First turn: one English line about the place, "vary it: sometimes what's special here, sometimes history, sometimes life or culture, sometimes the country, the region, the city or today's weather"; name only sometimes | 10-25b (Josh: the name only sometimes; history or culture), 10-25c (country, region, weather) | No | A script about how to vary; the list may itself make openers alike |
| B8 | 141 | After the first turn: react first; the errand a turn or two; never invent one; never offer what the job can't give | 10-25c, 10-25d (Chiara offered coffee she couldn't make), 11-06 (A: the errand script removed) | Yes: A, purchase lines 65–79% → 51–60% | Longest unit; the errand half overlaps D2 |
| B9 | 45 | Don't build every turn the same way; a word only when useful; sometimes no English; answers only when they help | 10-25c (every turn the same shape), 10-25d | No | Overlaps S2c "Answers: one" |
| B10 | 47 | Everything is said aloud: no narration (examples: cornetto, Luisa, cappuccino) | 10-26 (the voice read "She slaps the tortilla…") | No (fixed by eye) | Examples put a bar into every scene |
| B11 | 49 | A person, not a teacher: never announce, never explain how people talk (examples) | 10-25d, 10-27 ("here's a nice way to say goodbye") | No (fixed by eye) | — |
| B12 | 59 | One question per turn, in the language; "prefer questions that make them use a useful verb (Le piace…? / Vuole…?)"; this-or-that or one fact fine | 10-25, 10-25g | No | "Vuole…?" and "this-or-that" breed offers and choice questions ("un caffè o una passeggiata?"); one question every turn makes it an interview; overlaps S2a "Ask this-or-that" |
| B13 | 66 | Offer the answer, sometimes two; reuse the question's words when natural (four examples: Vuole → Vorrei…) | 10-25h (Sofia: "Desidero un caffè", "Voglio pagare") | No | Examples are all ordering; overlaps S2c (at most one answer) |
| B14 | 76 | One idea per answer, fewest words a local would use (examples: cornetto, sono stanco) | 11-03 (Don Nacho's two-idea answer), 11-05b (Doña Chela) | Yes: answers 4.5 → 3.6 words (11-05b) | Examples are food and ordering |
| B15 | 63 | Their own facts left blank as …, never made up | 10-27b (7 of 7 answers made up "Sono di Londra") | Yes: 10-27b | — |
| B16 | 13 | Use a few words again later | 10-25 | No | May feed repetition |
| B17 | 12 | Simple language, present tense, formality | 10-25 | No | Overlaps S2b |
| B18 | 18 | Facts about the place: only what you're sure of; "otherwise talk about what you're doing or selling" | 10-25 | No | "or selling" points every role at selling |
| B19 | 20 | Offer the goodbye as a phrase when the talk winds down; their goodbye ends it | 10-25, 11-06 | Goodbye: yes (goodbye-done.mts, 5/5) | Overlaps D5 |
| B20 | 25 | Follow their lead; never ask a question again once they've moved on | 10-25b (Andrea asked the name three times) | No | — |
| B21 | 14 | Never praise, never point out a mistake | 10-25b, 10-25d, 11-05 | No | Overlaps D1 |
| B22 | 13 | Help in English when asked | 10-25 | No | — |
| B23 | 228 | JSON parts; gloss rules (examples: "Vuole zucchero o panna?", "Vuole un caffè o un cappuccino?"); word, question, answer formats | 10-25f, 10-25g, 10-25i, 10-25j, 11-05b, 11-05c | Partly (11-05c replay set) | Format, but its examples are coffee and ordering |

## Stage 2 (leveling.md, added for stage-2 Beginners)

| Id | Words | Unit | Came from | Measured? | Hypothesis |
|---|---|---|---|---|---|
| S2a | 52 | Talk: short sentences (no speed since 2026-11-06, Josh's decision); say it again or another way before English; "ask this-or-that, or for one simple fact"; English one short sentence at most | leveling.md (stages, 10-29 onward) | No | Conflicts with B4 (two sentences) and repeats B12's this-or-that |
| S2b | 60 | Language: 2, how much language; "replaces the guidance above" | leveling.md | No | Replaces B6 and B17, which still stand above it |
| S2c | 13 | Answers: at most one, only when it helps | leveling.md | No | Conflicts with B13 ("sometimes two") |

## dialogue.md → Every conversation (all kinds, all levels)

| Id | Words | Unit | Came from | Measured? | Hypothesis |
|---|---|---|---|---|---|
| D1 | 76 | Speech-to-text mishears; never correct what may be misheard; recast only when sure | 11-05 (Magda coached "HO-ven") | Yes: heard-replay | — |
| D2 | 51 | Stay within your job: never serve, sell or take an order for what it doesn't give; point elsewhere, ask nothing about it | 11-06 (Beto's torta) | Yes: job-drift 2/10 → 0/20 (serving); 2026-11-06 invented-errand.mts: never sold in 40 runs | Overlaps B8 |
| D3 | 30 | What happens follows what you've said | 11-06b (Tommaso: macchiato before the receipt) | Yes: bar-errand.mts 2/20 → 0/20 | — |
| D4 | 37 | Tell how it works at your place, not the customs every bar repeats | 11-06b (cappuccino, pay first at every bar) | Yes: bar-errand.mts 7/20 → 3/20 | — |
| D5 | 22 | Their goodbye: say goodbye back, nothing new; that ends it | 11-06 (Beto, five goodbyes) | Yes: goodbye-done.mts 5/5 | Overlaps B19 |

## Added by code

| Id | Unit | Where | Measured? |
|---|---|---|---|
| C1 | "It's Thursday, in November." and, at odds of 1 in 4, today's weather | lib/today.ts, lib/weather.ts | Weather: 24/24 openers when given (2026-11-03) |
| C2 | The heard note after their line (said back / other) | lib/dialogue/heard.ts | heard-replay |
| C3 | Memory: "last time…" and the notes | lib/prompts/build-turn-prompt.ts relationshipLine | No |

## Patterns across units (observations, not findings)

- **Examples.** B4, B10, B11, B13, B14 and B23 carry about a dozen examples; nearly all are a bar, coffee, a cornetto or ordering.
- **Overlaps and conflicts.** B4/S2a (English: two sentences or one), B12/S2a (this-or-that twice), B13/S2c (two answers or at most one), B6/B17 replaced by S2b but still present, B8/D2 (errands), B19/D5 (goodbye), B21/D1 (corrections).
- **Three framings, mixed** (Josh, 2026-11-06: "stay in job is not same as stay in role is not the same as be yourself"). *Job* is what they do for a living, and invites an errand; *role* is their part in this scene; *be yourself* is who they are, with no task. The prompt uses all three: B2 "Be the person you are, helpful the way someone in your job would be" (both in one sentence), B8 "If your job has an errand" and "Never offer what your job can't give", D2 "Stay within your job" (twice); "role" only as the {role} label in B1. Which framing the prompt speaks in is a test dimension of its own, across B2, B8 and D2.
- **Measured units are few.** B4, B8, B14, B15, B19 and D1–D5 have a measurement behind them; the rest were fixed by eye after one conversation.
