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
