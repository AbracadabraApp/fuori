# Scaffolding

Rewritten 2026-10-22 (Josh: "rewrite docs") into one current picture. Three plans were stacked here (17, 19 and 21 October), each replacing part of the one before, and the doc called scaffolding steps "levels"; the earlier plans are now under [History](#history) at the bottom. Research: [research/beginner-mode-scaffolding.md](research/beginner-mode-scaffolding.md), [research/flashcards-vocabulary-review.md](research/flashcards-vocabulary-review.md). The Diario: [diario.md](diario.md).

## The words (Josh, 2026-10-21; [glossary.md](glossary.md))

- **Level** is only the learner's level: Beginner, Intermediate, Advanced. It mainly sets how complex the dialogue is.
- **Scaffolding** is the support that gets a new learner used to the game: onboarding, the reply buttons, and the stages that follow, up to the stand-alone microphone. Its steps are **stages**, never levels.
- Beginners start with scaffolding, but the two are separate: finishing scaffolding doesn't make anyone Intermediate.
- **Scaffolding isn't a setting.** The game decides when you see it, by counting (`lib/scaffold.ts`), not by a judge or a switch. The rules and the full set of stages aren't settled yet.

**Next (Josh, 2026-10-22):** the reply buttons become a reply panel: answers as text, "read one out loud" above the usual mic, no tap stage, no Pause. Spec and assets: [reply-panel.md](reply-panel.md).

## The sequence a new learner meets

| # | Step | What happens | Status |
|---|---|---|---|
| 1 | **Onboarding** | Choose a country; the greeter asks two things, answered by button or voice; she places you at a level | Built ([onboarding-design.md](onboarding-design.md)) |
| 2 | **Reply buttons, stage A: tap** | Two good replies; tap one and it's sent | Built, live 2026-10-22; **going** (Josh, 2026-10-22: too simple; see [reply-panel.md](reply-panel.md)) |
| 3 | **Stage B: tap, then read it aloud** | Two good replies; tap one, then say it | Being built (2026-10-22) |
| 4 | **Stage C: choose, read it aloud** | Only one reply fits; choose, then say it | Being built (2026-10-22) |
| 5 | **The microphone alone** | Speak freely; today's game | Built |

In each of the first 3 conversations: A, B, C (one turn each), then the mic; from the 4th, the mic alone.

## 1. Onboarding sets the level

Onboarding is where the level comes from: the greeter's send-off judges your answers and stores Beginner, Intermediate or Advanced (`lib/onboarding.ts`; the app shows it while `/v1/me` says not onboarded). A second source exists: the level check after each conversation (`lib/learner-level.ts`), but it's **off** unless `LEVEL_CHECK` is set, and it isn't set on either service.

**No level yet counts as new (Josh, 2026-10-22).** If onboarding is skipped or reset (Settings → touch and hold Version → Restart onboarding) and never finished, the learner has no level. That learner gets the reply buttons, like a Beginner. Found when Josh's Mexico learner had no level (onboarding reset, `{"path":"reset"}`) and so never saw the buttons.

## 2. Reply buttons, stage A: tap (built)

**Who:** a learner whose level is Beginner or not set yet. Never Intermediate or Advanced; never with Magda, whose lessons don't count either.

**When (Josh, 2026-10-22: "a–c in a conversation, repeat in next 2 conversations"):** in each of a new learner's first 3 conversations, their first three turns step through the stages, one turn each, then they speak for the rest of that conversation. From the 4th conversation on, the mic alone.

| Learner turn in conversations 1–3 | 1st | 2nd | 3rd | 4th on |
|---|---|---|---|---|
| Stage | A tap | B tap, read aloud | C choose, read aloud | mic |

`STAGES` and `SCAFFOLD_CONVERSATIONS` in `lib/scaffold.ts`; one turn per stage is Claude's starting point. Conversations count from the first, or from `learners.scaffold_from` (a restart), ones where they said something, Magda's not counted. This replaced a schedule of 4, 3, 2, 1 taps over 12 conversations (2026-10-21).

**How it works:**
- The server decides with every line: `/v1/turn` returns `replies: true` and `stage` (`tap`, `read`, `choose`) when the learner's next turn uses the buttons. The app holds no switch (the hidden "Reply buttons (test)" toggle and the level picker were removed 2026-10-21).
- The replies come from a separate call, `POST /v1/replies` (`lib/replies.ts`, prompt `replies.md`), written while the character's voice plays, so the turn stays `{ line, en }`.
- They appear when the character has finished, so the learner listens first. Two whole-line replies on the same frame ("Vorrei…", "Mi chiamo…"), both sensible; pick what you'd actually say. The tapped one shows a plain selected state, no right or wrong colours.
- A tap sends the line through the typed-reply path (`learnerSaid` on `/v1/turn`), and the character answers to it.
- While scaffolding, the buttons and the character's line show English, whatever Settings says.
- A failed replies call falls back to the mic for that turn and is logged.
- Tests: `npm run test:scaffold` (who and when), `npm run test:replies-route`, `smoke:live`.

**Not built:** a second voice saying the tapped line (the character answers straight away); tapping a reply to cut the character off.

## 3–4. Stages B and C (Josh, 2026-10-21; proposed, not built)

| Stage | Buttons | You |
|---|---|---|
| A | Two replies, **both good** | **Tap** one; it's sent |
| B | Two replies, **both good** | Tap one, then **read it aloud** |
| C | Two replies, **only one good** | Choose and **read it aloud**; you have to understand her to pick |

Proposed details, not yet confirmed:
- **Read aloud:** tapping a reply chooses it (ink) and opens the mic; the dots show inside the chosen button; tap again when done (hands-free: silence ends it). No transcript on screen.
- **What's sent on B and C:** the chosen line, so a mumble or a speech-recognition slip can't derail a beginner; what was heard is kept for Learn's "you said". Speech checks are lenient: marking a right answer wrong is worse than passing a near-miss.
- **The wrong reply on C** is correct Italian that doesn't fit the moment (answers another question, wrong item, wrong time), never broken Italian: the screen must not model mistakes. Choosing it is answered by the character in role (puzzled, then helps), not by a buzzer or a red mark.
- **Needs:** `replies.md` must make a plausible wrong reply and say which one is right (trial in `docs/prompt-trials.md`); which stage you're on is counted, like the schedule above.
- If the mic is off or VoiceOver is on, B and C fall back to tapping.

## Not settled (Josh's to decide)

- **Whether anything moves a learner back** (a learner who struggles after conversation 3).
- **The full set of stages.** Candidates from earlier plans, none chosen: less English step by step (English on her line only, then none); fill the frame ("Vorrei ____", speak the rest your own way); a "Less help" button the learner can press.
- **The numbers:** one turn per stage, three conversations.
- **English under the character's line.** On 19 October Josh decided no translation line at any level, the English to come in the dialogue and on the buttons, once characters reliably give English when asked what something means. What's built shows English on her line while scaffolding. Which holds?
- **Whether the level check turns on** (`LEVEL_CHECK`), so a learner's level can move after onboarding rather than resting on two answers.

## Rules that still hold (from the 17 October plan)

- **Every reply is a whole line** built on a frame, never a lone word.
- **Every turn the character asks something,** since the replies need something to answer.
- **No Replay (Josh, 2026-10-17).** The words are on screen while scaffolding; once speaking, the learner can ask the character to repeat ("Ripeti?", "Più lentamente"), which stays in role.
- **Pause only in hands-free (Josh, 2026-10-17; CLAUDE.md since 2026-10-21).** In tap-to-talk the buttons and the pill already wait for a tap.
- **Few controls.** While tapping, the two buttons replace the mic pill; nothing appears or disappears except the result of your answer.
- **Largest text size (AX5):** the portrait stays put; the area above the controls scrolls within a capped height. The replies may cover most of the portrait at that size.
- **Wording:** any instruction ("Read your line out loud") is interface text, worded per country; target-language words come from `/v1/content`, never from Swift.
- **Writing the replies** stays a separate call unless a test shows folding them into the turn is better for latency and quality ([test-ideas.md](test-ideas.md)).

## Idea: a Done link (an idea only, Josh 2026-10-20)

Josh, 2026-10-19: "the beginner buttons really need a done button/link". It would fade in when the conversation is over, the same link and rule as for every learner (roadmap → Ending a conversation, round 20), and leave through the one leave function; its word from `/v1/content`. For a beginner to get there, the replies must be able to close a conversation: once the errand is done, one of the two replies is a goodbye or thanks (`replies.md`; test before building, since in round 19 no Mexico learner reached an end).

## The Diario's cards

The Diario ([diario.md](diario.md)) reviews phrases from your own conversations on cards. The 17 October plan gave each phrase its own step on the five-step ladder below (card practice moves it up; saying it yourself in a real conversation retires it). That ladder is now history, so the card screens need restating against the current stages; the Diario's missions prototype comes first ([diario.md](diario.md) → Prototype first).

### What each phrase needs

Written by the end-of-conversation step (`lib/remember.ts`), stored with the phrase:

| Field | Example |
|---|---|
| Frame, with its English | Vorrei… · I'd like… |
| Character, place | Giulia · Bar in Trastevere |
| Character's line, with its English | Buongiorno! Cosa prendi? · Good morning! What are you having? |
| Two whole-line replies on the frame, with English | Vorrei un cornetto integrale. · Vorrei un macchiato. |
| Character's answer to each | Un cornetto integrale, subito! · Un macchiato, arriva! |
| Audio | Character's line and answers in the character's voice; the replies in your voice |
| Stage | Where the phrase is in its practice |

## On hold: a scripted, smaller world for beginners (Josh, 2026-10-17; on hold until there's a spec, 2026-10-18)

Fixed scripts per character, the same for every learner, in one neighbourhood (Trastevere: 11 characters; Mexico City: 13 across four neighbourhoods) while the learner only taps; leaving the neighbourhood is the reward for speaking. Tests (rounds 11–13, [level-judge-test.md](level-judge-test.md)): cheap to write and the easiest dialogue yet (70–84% of lines a beginner can follow), but where both replies must lead to the same next line one path ignores the learner's answer, and forcing a this-or-that choice at every join made it a quiz. Costs: the open world, memory of the learner's own taps, their name without live audio. CLAUDE.md's "no scripted scenes" predates this and doesn't rule it out.

## Open questions

- Phrases that aren't frames (a noun like "cornetto integrale" on its own): either the end-of-conversation step always picks frame-shaped chunks, or such phrases ride inside a frame.
- Settings: Subtitles and English are overridden while scaffolding; Hands-free applies once speaking.

## History

**17 October: five steps ("levels 1–5"), replaced.** Each step changed only the screen, not how characters talk:

| | 1. Choose, all English | 2. Choose, English on the character | 3. Choose, Italian only | 4. Read out loud | 5. Fill the frame |
|---|---|---|---|---|---|
| Subtitles | Italian + English | Italian + English | Italian | Italian | Italian |
| Your side | Two replies, Italian + English | Two replies, Italian | Two replies, Italian | Your whole reply | "Vorrei ________" |
| Action | Tap | Tap | Tap | Speak | Speak, your way |

A second voice was to say your reply after each tap. Moving up: at 15 turns on a step, ask at the end of the conversation whether you're ready for less help; from 15 to 30 a "Less help" button; at 30 move up automatically, with Settings to step back; never down on its own. None of steps 2–5 or the moves were built.

**19 October: three "levels", partly kept.** 1. Character teaching (she teaches the line you need, in role, with taps at the start of each conversation that run out), 2. practising conversation, no taps, 3. today's game. Kept: the taps per conversation that run out (stage A's schedule). Dropped: character teaching as a separate step ([proposal-level1-teaching.md](proposal-level1-teaching.md), not chosen 2026-10-20); calling these levels (2026-10-21). Still open: no translation line (above).

**18–19 October: the first build,** behind a hidden test switch with a step picker (1–3) on the phone. Replaced on 2026-10-21 by the server deciding, with no switch.
