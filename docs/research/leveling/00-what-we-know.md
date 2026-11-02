# Leveling: what we already know

2026-11-02 · Phase 0 of [level-research-plan.md](../../level-research-plan.md) · Scope: Beginner → Intermediate. Read from the repo only; where a claim is inferred rather than stated, it says so.

## 1. Current system, as built

**The learner's level** is one field, `learners.level`: `beginner`, `intermediate`, `advanced` or empty. It is set three ways: onboarding's send-off judge (`lib/onboarding.ts`, "if in doubt, choose the lower level"), level buttons (`/v1/onboarding/level`), or Settings (`/v1/me/level`, live since 2026-10-23). Build 8 skips the greeter, so a new player has no level, and **no level counts as Beginner** (`lib/conversation/take-turn.ts`). **Nothing moves the level after that.** The level check (`lib/learner-level.ts`) is built but off (`LEVEL_CHECK` unset).

**Beginner (or no level).** `content/<country>/prompts/beginner.md` replaces the character prompt (`lib/beginner.ts`). The reply comes in parts: English (heard, not shown), words or short phrases, one question, and answers to say back. Phrases show as bubbles, with their English a tap away. Code keeps only the last question (`tidyParts`). The prompt asks for "short, common words, present tense". Speech runs at 0.7 because the English setting is on by default (`ConversationModel.swift`). The read/choose reply panel (`lib/scaffold.ts`) is skipped whenever a reply has parts (`app/v1/turn/route.ts`). So, inferred from code: Beginners on this path never see those stages.

**Intermediate.** The plain `character.md` (version 2026-10-21) **with no level information at all**. Its stated principle is that characters "hear the learner's level in their actual Italian and adjust". `levels.md` holds only Beginner blocks, with no Intermediate block. They reach the prompt only through `LEVEL_TRIAL` for listed learner ids, and only on the non-Beginner path. Screen defaults: subtitles on, English off, speech at 0.9. "Say it in English" (`say-it.md`) is the one call that does take the level.

**Unused:** `content/it/levels/*.ts` (A1–B1 definitions; only archived tests import them), Magda's free-text "Level:" line, and `LearnerProfile.level` in `lib/types.ts`.

## 2. What's been measured

| Measure | Where | Numbers |
|---|---|---|
| **Lines a beginner can follow** (90%+ of words known by "listener 1–2", `level.md`, `lib/level.ts`) | Replay and `test:conversations` only; not real play | Baseline prompt: Italy 23–27%, Mexico 24–51% (rounds 1–4). Grader baseline 10% Italy, 11% Mexico (roadmap). Short prompt 18b: 37%. Beginner "still you, sometimes ask": Italy 62–68%, Mexico 80–91% (round 6). Target 90% |
| CEFR judge accuracy | level-judge-test r1–2 | Haiku on exam lines: 66% exact, 100% within one level, rank correlation 0.89. On graded readers 0.84, but **rates too easy** |
| Today's characters, CEFR judge | same | Mostly A2–B1; Josh's teacher heard B2+ |
| Question kind per turn | r5–10 | "Sometimes ask": 77–100% answerable; choice questions on 43% of Italy turns |
| Alive (`quality.md`) | r8–10 | About 5 in both countries; target 7 |
| Phrases in the language per conversation (`phraseStats`) | live since 10-27 | Beatrice (Beginner): ~105, ~3 a reply |
| Placement | r14, simulated | Onboarding wrong 18/18 when the learner didn't answer as themselves; one conversation fixed all |

Not found: any measure of the live Beginner format against the 90% word target, or any level score on real play (cost: one call per line).

## 3. What was tried and what happened

| Idea | When | Result | Why | Source |
|---|---|---|---|---|
| Let characters infer level from learner speech | to 10-15 | Failed: teacher rated B2+ | No level signal | language-levels-plan |
| Other judges: letters, levels described, imagined learner, length/tense rules | 10-16 | All worse than "CEFR named" (rules: 0.46–0.50) | CEFR is a scale Claude knows; no recall leak | level-judge-test r1–2 |
| Frequency list (Kelly); syllabus list (1,479 lemmas) | 10-16, 10-19 | Kelly unsound; syllabus list correlates 0.28–0.36 with the judge | Kelly calls *pranzo* hard; list gaps, lemmatizer errors | r1, r23 |
| Rewrite pass for beginner lines | 10-16 | Simpler, but lost persona, place, teaching; +1–3 s | Better with whole conversation in view | r1 samples |
| Level block: "situation" vs "shape" (rules) | 10-16 | Situation won; both flatter | Describe the person, not how to talk | r2 |
| "Still you" | 10-17 | 60–63% / 77–86%, livelier; picked | — | r3 |
| Haiku for characters | 10-17 | 1.6 s, 43–57%; Mexico slid 87% → 27% late | Not ready | r3–4 |
| "Ask" / "sometimes ask" an easy question | 10-17 | "Ask" became an interrogation; "sometimes ask" picked | Order form ("Vuoi X o Y?") | r5–6, r9 |
| Block live for Josh (Chucho, Mexico) | 10-19 | 23 words a line, 42% double questions | Not replayed on prompt 18b | roadmap |
| Scripted beginner world | 10-17 | Easiest (70%/84%), but joins ignore choices; quiz feel | Skipped 10-30 | r11–13 |
| Reply buttons, read/choose stages | 10-17 to 10-22 | Good pairs; fixed schedule dropped learners too early | "Say it" direction instead | beginner-scaffolding |
| Say it in English | 10-23 | Level right 100% | Kept | prompt-trials |
| Beginner level dialogue (`beginner.md`) | 10-25 on | English 36–54 words a turn → 14–29; Josh: "right direction" | Live | prompt-trials |
| Level check after 3 conversations | 10-18 | Works on simulated learners | Built, off | r14 |

## 4. Decisions already made by Josh

- Three levels; Beginner is one level, no hidden steps. Tier in the prompt every turn, in role (10-15; not done for Intermediate).
- Targets: 90% of a character's words at level; move up when 90% of the learner's speech is at the next level over several conversations; the game suggests, the learner decides (10-15). A judge calibrated on exam material; teacher and Josh are spot checks (10-15).
- What they hear (level) and how they take part (scaffolding) are separate; listening sets how characters talk, speaking decides moving up (10-16, 10-21).
- No word lists in the prompt; nothing language-specific in code; no phrase lists (10-16, CLAUDE.md).
- Questions mark the levels: choice, then one fact, then open (10-17).
- Onboarding is a first guess, conversations correct it (10-18); no level = Beginner (10-22).
- Scaffolding and the fading English go by counting, not a judge or a setting (10-21, 10-25).
- Staged plan to Intermediate: 1,1,1,1,1 · 1,2,1,1,2 · 2,2,2,3,3; count practice, not visits; fade one support at a time; advance on mastery, count as default (10-25, not built).
- English teaches, never replaces (10-27). Teaching wins over speed and liveliness (10-19).

## 5. Open problems and known failure modes

- **Intermediate has no leveling.** No tier in its prompt, and no Intermediate block was ever written or tested.
- **No path from Beginner to Intermediate.** Nothing moves the level. The two levels use different prompts and reply shapes (inferred: a cliff, not a ramp).
- **Every new player starts as Beginner** (build 8).
- **Simpler means flatter.** Every simplifying block cost liveliness; the order form appears.
- **Drift:** Haiku slid late in conversations; Sonnet only slightly (66–69% → 61–64%); the live trial ran long.
- **The judge is lenient for listening**, so labels like "A2" overstate what a beginner follows.
- **No learner-speech judge.** It needs an examiner-graded learner corpus. Whisper errors cloud the evidence.
- **Stale docs:** prompt-trials says `levels.md` runs for Josh's Mexico learner, but that learner is a Beginner and gets `beginner.md`. The roadmap calls the Settings level control greyed out, but it has been live since 10-23. The research plan's "tier in the prompt is ignored" isn't stated in any source. What the sources show is that no tier reaches the prompt.

## 6. Assets a new design can reuse

- **Syllabus** (`content/{it,es-mx}/syllabus.json`): 69 units A1–C1 per country, 611/610 frames, with can-do, functions, situations, model exchanges, grammar, common errors and recycling; grammar inventory (304/348 points).
- **Word lists** (`syllabus-words.csv`): Italy 3,906 lemmas A1–C1 (A1 1,038, A2 1,072), Mexico 3,300, with part of speech, level, unit and theme.
- **Lessons** made ahead from the syllabus (`lessons.json`).
- **Judges:** `level.md`, `quality.md`, `learner-level.md`, `question-kinds.mts`, `line-level.mts` (early vs late).
- **Harnesses:** `test:replay` (Josh's real lines, Italy), `test:conversations` (simulated learners, `--level`), synthetic set (28 per country), `placement.mts`, `learner-levels.mts`, `beginner-dialogue.mts`.
- **Recordings:** `replay:recordings` (31, mostly Mexico flashcards). The exam and graded-reader answer keys stayed on the laptop, not in the repo.
