# N6 release plan

Rewritten 2026-11-02 at Josh's request ("rewrite N6 to meet relevant goals and fold in the proposed leveling work"), from the cloud session's proposed order and Claude's revisions to it. The first draft (2026-10-30) is in git history. The order is Claude's proposal until Josh confirms it; decisions marked "Josh" are his.

## Where things stand

- **N5 is finished.** The family plays TestFlight build 8.
- **Done in N6 so far:**
  - **Visit stamps:** built 2026-10-30, not yet on a phone; they ship with build 9.
  - **Transcription measured** on the 31 kept recordings: no model switch.
  - **A reason to be there** for all 61 of Mexico's shown characters (1c35809).
  - **The first leveling measurements** ([research/leveling/07-model.md](research/leveling/07-model.md)).
- **Dropped:**
  - **The goodbye rule:** Josh, 2026-10-30, "a lot of code for not a clear problem". Lessons keep their own turn-count end.
  - **The level question as buttons:** placement becomes a conversation inside the leveling model, item 3.

## What N6 is for

Learning comes first (CLAUDE.md: "It's a language-learning game, not a language-generating game"). N6 has one main goal and three smaller ones.

1. **Every learner at the right level, and the level moving as they improve.** This is the leveling model (Josh's framing, 2026-11-02; Claude signed up for it the same day):
   - **The learner:** one number per learner, updated after every conversation from what happened.
   - **The conversation:** its difficulty is the sum of its settings.
   - **The choice:** the settings are chosen so that about 90–95% of what the learner hears is followable.
   - **Learning across learners:** later, everyone's records show how much each setting is really worth.
2. **Teaching:** the lesson shape.
3. **Speed:** a shorter wait after Intermediate and Advanced turns.
4. **The world:** stations, the city picker, adventures, missions.

**How we'll know N6 worked: words spoken per conversation** (Josh, 2026-11-02: the main engagement signal), with the share in the language and in the learner's own words rising over the weeks. The level measures are guardrails.

## What the leveling measurements found (2026-11-02, Italy)

Each setting was changed on its own and played with the same 10 people. Each result is the share of words a newcomer can follow, counting the English they hear ([07-model.md](research/leveling/07-model.md)):

- **The English echo** is the one Beginner setting that changes how much is followable: turning it off costs about 30 points.
- **The talk instructions for stages 2 and 3 do nothing.** The Beginner prompt's own rules win.
- **A new "Language" setting changes how much of a turn is in the language** (34% → 70%), but not how hard its words are.
- **The character prompt with a Beginner instruction** keeps the words easy with everything in the language, and is livelier.
- **Intermediate as it is today** is the top step.

So every step from stage 1 to Intermediate has a setting that moves it:

| Step | Prompt and settings | In the language | Followable |
|---|---|---|---|
| 1 | Beginner prompt, stage 1, English echo on everything | ~40% | ~92% |
| 2 | Beginner prompt, more of the language (Language 2–3) | ~53% | ~90% |
| 3 | Beginner prompt, mostly the language, echo on new words only | ~60–70% | ~90% |
| 4 | Character prompt + "Beginner: still you, ask", with subtitles | 100% | ~57%, easy words |
| 5 | Character prompt (Intermediate today) | 100% | ~46% |

The biggest step is from 3 to 4, where the echo goes. "Mostly the language, echo off" (about 58%) is a measured setting that can sit between them if play shows the step is too big. Mexico hasn't been measured yet.

## The plan, in order

| # | Item | Goal | Waiting on Josh |
|---|---|---|---|
| 1 | **TestFlight build 9:** the scan's app fixes (Flashcards, the recorder, the voice, Learn pausing the conversation), visit stamps, and the Missions placeholder. The family is playing bugs that are already fixed. | All | "Go" |
| 2 | **A record of each conversation:** the step it played at, plus counts. The counts are words spoken, how many in the language, how many in the learner's own words, help asks (one word or the whole line), and silences. It's one table, numbers only, no words or audio. Moving up and supports coming back need it, and it's what the model will learn from. Words spoken, a line per player per week, shows in the admin. | Level | Yes to the database change |
| 3 | **The leveling model, version 0, in the app** (server only: it ships with a deploy, not a build). Details below. | Level | Yes to replacing today's Beginner level |
| 4 | **The lesson shape** ([teach-plan.md](teach-plan.md)): Magda teaches on the conversation screen, a practice dialogue is the assignment, then her review. The biggest teaching gain left. | Teaching | Approve the screen design |
| 5 | **A shorter end-of-turn wait** for Intermediate and Advanced; Beginners keep 2.5 s. The transcription measure is done, so this is only the tuning. | Speed | The wait, before it ships |
| 5b | **Faster replies:** prompt caching (0.1–0.3 s, no change to what she says); finding the 0.4 s Beginner turns lost since 10-26 (2.3 s Italy, 2.1 s Mexico today); preparing her reply during the silence (up to ~1 s). Added 2026-11-02, not started. | Speed | A go for preparing the reply during the silence |
| 6 | **Parity with the web:** stations and ticket, the city picker. | World | Stations' design; what's wrong with the picker |
| 7 | **Adventures** ([adventures.md](adventures.md)): places where something happens, people with something to show, a mystery across days and places. | World | Your ideas, still forming |
| 8 | **Missions**, once they're defined; the placeholder ships in build 9. The card maker waits on them. | Teaching | What missions are for |
| 9 | **The conversation library and the turn-timings log:** words, audio and timings kept beyond the family's recordings. | Speed | A privacy decision; each further learner, one at a time |

Items 1–3 can run at the same time: build 9 is the app, items 2 and 3 are the server.

### Item 3 in detail

1. **Mexico measured first:** the same tests as Italy (about $20). Its prompts are the same, but the language isn't.
2. **The path:** the five steps above, as data (which prompt, which instructions, echo, answers). Your fading plan sets the pattern within a step (1,1,1,1,1 · 1,2,1,1,2 · 2,2,2,3,3).
3. **Placement by conversation:** the onboarding script's *Parli italiano?* (Mexico: *¿Hablas español?*) chooses the starting step: nothing → step 1, a little → step 3, getting by → step 5. Learners who already have a level are placed by it.
4. **Moving up:** by counts from the record. A one-word help ask is learning, not struggle. "Hard" means being lost: English instead of an answer, the whole line again, or silence. After two hard conversations in a row, a support comes back; the label never moves down. The thresholds are numbers in one place, to be tuned from play.
5. **Before it ships:** the live test in both countries. Then you and Sophia play it; words spoken in the admin shows whether it's working.

Not in version 0: the speaking judge, which the step into Intermediate may want later and which was tested only on simulated learners; and learning each setting's value from everyone's records, which needs weeks of item 2's data.

## Three answers unblock the top of the list

1. "Go" for build 9.
2. Yes to the record table (item 2).
3. Yes to replacing today's Beginner level with the path (item 3).

## Before anyone outside the family

Not part of N6 unless Josh moves it in ([06-roadmap.md](06-roadmap.md) → Release, Stage 2):
- App Attest;
- a daily usage budget per learner that survives deploys;
- an image domain;
- a privacy policy naming Groq, Anthropic and ElevenLabs;
- the App Privacy label;
- tester notes.
