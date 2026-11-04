# Lesson judges: the evaluation so far (2026-11-02 and 11-03)

How lessons are checked before they ship: five separate judges, no human proofreading and no outside tools (Josh). Briefs: [docs/lesson-judges.md](../../../docs/lesson-judges.md). One bounded pass: write; judge once; fix only failed lines; recheck those once; a lesson still failing is dropped. Run by Claude agents in the cloud session (no API key needed), each judge a separate agent that never saw the writing.

## 1 · Italy's 21 Beginner (A1) lessons, live in the app (`content/it/lessons.json`)

| Judge | First pass | After fixes (recheck of the 115 changed lines) |
|---|---|---|
| Grammar | 1 | 0 |
| Naturalness | 7 | 2 (judges' own fixes applied) |
| Level | 9 | 1 (applied) |
| Teaching | 25 in 15 lessons | 7 in 5 lessons (not fixed) |
| Translation | 27 | 3 quote marks (fixed) |

What it showed: the Italian is mostly right; problems cluster in Magda's practice questions and in lessons teaching more than one point. The writing prompt (`content/it/prompts/lesson-steps.md`, 2026-11-02) was changed for that.

**Status: held (Josh, 2026-11-02).** The live lessons are unchanged. The fixed version is kept as `results/it-a1-fixed-lessons.json` for the Beginner rewrite, which will also merge the 21 lessons into 14 chips ([docs/learn.md](../../../docs/learn.md) → Lesson chips) and needs the 7 teaching failures fixed.

Files: `results/it-a1-{grammar,naturalness,level,teaching,translation}.json` (first pass), `it-a1-summary.md`, `it-a1-changes.json` (every change, before and after), `it-a1-recheck-*.json`, `it-a1-fixed-lessons.json`.

## 2 · Italy's 60 Intermediate (B1) lessons, a draft the app doesn't read (`content/it/lessons-b1.json`)

13 B1 units, written by four agents from the syllabus with the Intermediate prompt (Josh signed off on the level, 2026-11-02).

| Judge | Failures |
|---|---|
| Grammar | 0 |
| Level | 0 |
| Naturalness | 18 in 13 lessons (6 in the history unit: a "neighbour" telling dates like a guide) |
| Teaching | 12 in 10 lessons |
| Translation | 20 in 11 lessons |

**Second runs of grammar and level** (the first found nothing): grammar 1 minor (a missing article), level 3 mild; the first run's zeros were close to right. The level judge also found the syllabus contradicts itself: some B1 unit frames use forms its own grammar inventory places at B2 or C1 (*magari* + imperfect subjunctive, *il quale*, impersonal *si*, the past infinitive). A syllabus question for later.

**Fixed and rechecked once (2026-11-03):** 110 changes in 27 lessons (`it-b1-changes.json`); one role changed (b1-13-1: a newcomer reading a plaque). Recheck of the changed lines: grammar 0, level 0, translation 0, naturalness 2, teaching 2. By the rule, the four lessons still failing were **dropped**: b1-02-4 (*Chi te l'ha detta?* sounds odd aloud), b1-07-3 (level and naturalness pulled one example opposite ways), b1-07-5 (intro slips in a second point), b1-08-5 (an example showed "even if", not "even though"). **56 lessons remain**, ready but not served.

Build note: some learner lines have gendered forms (*sono venuto*, *sia stanca*); before these go live, lines the learner says back need the form that matches the learner.

Files: `results/it-b1-*.json`.

## Gaps found along the way
- The game has no roles or places for some units: taxi driver, hotel receptionist, church custodian or guide; hotel, church, museum. Writers stretched existing ones.
- LanguageTool caught no Italian grammar errors in a test; subtitle word lists count words, not phrases. Both dropped.

## 3 · Italy's Intermediate rewrite: 56 lessons become 38 chips (2026-11-03, `content/it/lessons-b1.json`, not served)

Josh's four areas and chip names (docs/learn.md → Lesson chips, Italy B1); written by four agents from the judged 56, then judged once:

| Judge | First pass | Recheck of the 57 changed values |
|---|---|---|
| Grammar | 0 | 0 |
| Naturalness | 5 | 3 |
| Level | 8 (impersonal *si*, B2; a relative with the subject after the verb) | 0 |
| Teaching | 46 in 22 lessons (31 practice answers copying examples) | 5 |
| Translation | 2 | 1 |

Most recheck failures were left-overs of applying the fixes (a role not changed with its line, an English line not changed with its Italian, a mission still listening for the old phrase); all nine were fixed with the judge's own fix, as in the A1 passes, and no lesson was dropped. Cut to keep one point a lesson: *stavo per* from "Then suddenly", century names from "Local history", *te lo* with *posso* from "Do it for someone".

Josh's calls on the teaching judge's held suggestions (2026-11-03): "Everyone" → "Some, every"; "How much?", "How come?" and "Polite commands" stay as they are.

The writing instructions need the lesson the teaching numbers show: practice answers must use the point in a new sentence, never an example's. Files: `results/it-b1-rewrite-*.json`.

## 4 · Mexico's Beginner rewrite: 25 lessons become 23 chips (2026-11-03, branch `claude/mexico-rewrite`)

Josh's chips (docs/learn.md → Lesson chips, Mexico A1): the 25 merged into 20, plus three paying lessons from syllabus unit a1-06. The first lessons written under `lesson-steps.md` 2026-11-03 (practice answers as new sentences).

| Judge | First pass | Recheck of the 27 changed values |
|---|---|---|
| Grammar | 0 | 0 |
| Naturalness | 4 (limes aren't bought by twos; *¿me regala?* is for small free things) | 4 |
| Level | 3 (*pisar*, *oír*, *atender* in practice prompts) | 0 |
| Teaching | 11 (3 practice answers copying examples, against 31 in Italy's B1 rewrite) | 5 |
| Translation | 3 | 2 |

The recheck's 11 were wording slips in the fixes and two unchanged fields the fixes broke (a notice's *-es* plural lost with the limes; a context about limes); all fixed with the judges' fixes or a simpler line where a fix brought in an A2 pronoun, as in the other passes; no lesson dropped. Files: `results/mx-a1-rewrite-*.json`.
