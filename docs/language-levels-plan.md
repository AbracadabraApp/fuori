# Language levels (M3): quick capture

Draft, 2026-10-14, from a conversation with Josh; a preliminary design was added 2026-10-16 (below), not yet discussed. Originally: we lay it out properly after the Mexican place images are approved. Roadmap: [Now → Language levels](06-roadmap.md#now).

Research behind this plan: [How language apps handle levels](research/language-app-levels.md) (2026-10-15), product and technical, with ranked implications for Fuori.

## The problem

- **Characters speak too far above the learner.** Josh's Italian teacher tried the app and rated the speakers **B2+**. Phone testing said the same earlier.
- **The system doesn't adapt to the learner.** The character prompt contains no level information. Characters get only the learner's transcribed words and are expected to infer the level from them. That isn't working; the fix is to put the tier in the prompt on every turn (Josh, 2026-10-15).

## What exists today (checked in code, 2026-10-14)

| Setting | What it actually does |
|---|---|
| Italian subtitles | Shows the character's line. Display only. |
| English subtitles | Shows the English and slows speech to 0.7. |
| Dialect | Only sets speech to full speed (1.0). Characters are never told about it; nobody speaks dialect. |
| (none) | Default speech speed 0.9. |

- Settings reset on every reload (not saved).
- Speed is the only adaptation, and it follows the settings, not the learner.
- Magda already judges a level and writes it in the study file; nothing else reads it.
- Level rules exist in `content/<country>/levels/`, unused by characters.

## The shape: learner, then system (Josh)

**1. What level is the learner?**
- What they say: a tier picked at the start (the screen settings stay as personal overrides).
- What their speech shows: Magda's judgment, plus evidence from conversations.
- One answer, stored with the learner. Magda can suggest moving up; the learner decides.

**2. How does the system adapt?** Speech, characters, screen, Magda (table below).

## Three tiers: Beginner, Intermediate, Advanced

**Decided (Josh, 2026-10-15): three levels, named Beginner, Intermediate and Advanced.** No hidden steps inside Beginner; "Advanced" rather than "Expert". The five scaffolding levels in [beginner-scaffolding.md](beginner-scaffolding.md) are not steps of this kind: they change how a Beginner takes part, while how characters talk follows the tier (Josh, 2026-10-17).

| | Beginner | Intermediate | Advanced |
|---|---|---|---|
| Scale underneath | A1–A2 | B1–B2 | C1+ |
| Speech | Slower, short pauses | Just under natural | Natural |
| Characters | Short sentences, everyday words, rephrase readily, offer the English for a word, patient | Normal sentences, rephrase when you're stuck, English rarely | As they'd talk to anyone: idioms, speed, dialect |
| Screen | Subtitles and English on | Subtitles on, English off | Both off |
| Magda | Survival phrases, confidence | Past and future, fluency | Nuance, register, dialect |
| Replies | The ladder below | Speak freely; help if stuck | Speak freely |
| What characters ask | Yes or no, or this or that ("Con zucchero o senza?") | One fact ("Di dove sei?", "Quanti ne vuoi?") | Anything: opinions, stories ("Che ne pensi?") |

Characters are told the tier; it doesn't break character. A beginner gets a more patient barista, not a teacher ("everyone teaches, always in role").

**What characters ask is the clearest difference between the levels (Josh, 2026-10-17).** It describes the outcome, not prompt wording: how a prompt gets there is for testing. A beginner always has something to answer, and something small; the questions open up as the learner does. It works the same in any language, and a "this or that" question gives the reply buttons their answers. Measured per turn by the kind of question a character's line leaves (none, yes or no, choice, one fact, open), as in `docs/level-judge-test.md` (round 5). The risk is the opposite one: a character who only asks turns a conversation into an intake form, so at higher levels the character leads less.

## Beginner ladder (Josh's idea)

**Superseded (2026-10-17):** the scaffolding design in [beginner-scaffolding.md](beginner-scaffolding.md) replaces this sketch (its own five-step plan was later replaced too; that doc is current as of 2026-10-22). Kept below for history.

Support comes off step by step:
1. **Pick:** the character speaks; the learner chooses one of two replies. No speaking yet.
2. **Read aloud:** pick a reply, then say it; Whisper checks it was roughly that.
3. **Speak, help nearby:** answer freely; the two replies appear only if asked for or after silence.
4. **Speak freely.**

The two replies are written fresh each turn by Claude, in character and context (not a phrase list). Possibly one natural reply and one slightly off. Fuori is voice-first, so step 1 should be brief.

Josh doesn't speak Spanish, so Afuera makes him a real beginner tester; expect better ideas once we start.

## Onboarding

Josh, 2026-10-15, after looking at Praktika's onboarding (30+ screens, a "select the words you know" check that cognates fool, a "building your plan" progress screen). Fuori's onboarding rehearses the game's own loop (city, person, talk) and places the learner by doing, not by a test.

1. **Pick a city type:** three pictures with a line each (big city, hill town, by the sea). Low stakes; teaches that you choose where to go; sets the first city.
2. **Pick a face:** three people who could help you get started. The choice is a soft signal (patient shopkeeper or quick barista), and makes the onboarding someone, not a form.
3. **That person asks your name** and uses it from then on.
4. **They ask what you hope to get from Fuori,** by voice, in English or Italian ("whichever you like"), with one example line so nobody faces a blank page. Claude reads goals, situation and a first level guess (best of all if they answer in Italian), and starts Magda's study file.
5. **The ladder:** they climb the beginner ladder with you. Step 1 a question with two tap answers; step 2 two Italian phrases on buttons, say the one you agree with; step 3 a spoken line with its transcript, answer or attempt; optional step 4 without the transcript. After each: "does this still feel comfortable?" Stop and start there, or go on. Language-neutral signals add evidence: spoke or not, recording length, silence, English fallback.
6. **Summary in plain sentences**, each changeable ("You're starting out. People will speak slowly and show the English. We'll start in Bologna."). No settings screen, no CEFR labels. Claude returns structured settings (tier, starting rung, subtitles, speed) plus a confidence; it asks one more question only when unsure.
7. **You're in the city,** and the person you picked lives there and remembers you.

Rules: about two minutes; the learner's word wins (Claude suggests, the learner decides, the level judge corrects quietly later); anxious learners will stop early, so move them up quickly once they do well. Built from the ladder's pieces, so building the ladder builds most of this.


**Revised (Josh, 2026-10-15, later): no city or face pickers.** Onboarding is: choose a country (its picture: `design/country-cards/`) → the woman in that picture greets you (`it-greeter.jpg`, `es-mx-greeter.jpg`) and does steps 3–6 (name, what brings you, the ladder, the summary) → the country's city list. She exists only in onboarding: no anchor character, no home city. No sign-in either (docs/12-native-app.md decision 3). The steps above for picking a city type and a face are superseded.
## Preliminary design (draft, 2026-10-16)

Drafted from the level judge test and the rewrite samples ([level-judge-test.md](level-judge-test.md)). Captured before discussion: Josh has concerns still to raise, so nothing here is decided.

### 0. Two separate things (Josh, 2026-10-16)
- **What they hear (the level):** how characters speak: ideas per turn, phrasing, speed. The prompt.
- **How they take part (the Beginner path):** what the learner does on their turn: tap a reply, read one aloud, speak with help, speak freely, and when the English shows. The ladder: screens and buttons, not the prompt.

They move independently (simple dialogue with free speaking, or the reverse); "Beginner" names a starting combination of the two. **Success is the two together (Josh, 2026-10-16):** levelled dialogue plus the scaffolding (the English translation after each line, tap-a-reply buttons, reading a reply aloud, slower speech). The dialogue doesn't have to carry a beginner alone, so its target can stop short of stripping the characters bare; the replay tests dialogue without scaffolding, which is the harsh case, and the real test is a beginner playing with the scaffolding on. Josh: if the dialogue isn't at beginner level the game doesn't work (only a native speaker has kept up so far), so the Beginner dialogue comes first.

### 1. The learner's level
**What exists (checked in code, 2026-10-17): no systemic learner level.** Josh: this is "the level of the learner", one of the three levels (the learner, the dialogue that follows it, the scaffolding), and it doesn't exist yet. Pieces only:
- **Onboarding** places the learner once (`learners.level`: beginner, intermediate, advanced; `lib/onboarding.ts`, "if in doubt, choose the lower level"). Nothing reads it after that except `/v1/me`, and nothing ever moves it.
- **Magda's study file** has a "Level:" line, a rough CEFR level with evidence from several conversations, or "unsure" (`content/<country>/prompts/study-file.md`). It's free text for Magda and the study export (`lib/study-export.ts`), not a stored field, on a different scale, and it doesn't feed `learners.level`.
- **`LearnerProfile.level` / `levelEvidence`** in `lib/types.ts` (A1–B1) are from the early design and unused.
- **The dialogue scorecard** (`lib/quality.ts`, prompt `quality.md`) scores every real conversation when it ends and the replay test the same way. It judges the character, never the learner, but two of its counts are evidence about the learner: lines where they signalled they were lost ("non capisco", "ripeti", switching to English) and their lines garbled by speech-to-text.
- Character memory deliberately leaves level out (`memory.md`), so characters don't remember people as students.

To build: what moves a learner between Beginner, Intermediate and Advanced, from what evidence, and where it's stored (one place, not three).
- One tier per learner (Beginner, Intermediate, Advanced), set in onboarding, saved with the learner, changeable in Settings (the greyed-out control turns on).
- Two different things, measured separately (Josh: learners and characters may be levelled differently):
  - **What they can follow** (listening) sets how characters talk to them.
  - **What they can say** (speaking) decides moving up.
- The tier also sets speed, default subtitles, how readily characters offer English, and Magda's focus (the tier table above).

### 2. Characters: the level in the prompt, as a shape, not a word list
The samples showed difficulty comes from too many ideas per turn, set phrases ("di passaggio", "faccia pure", "non costa niente") and stacked clauses, more than from hard words. So each turn the prompt gets a short level block near the end (so earlier lines in the conversation don't pull it back up), worded as how this person talks to this newcomer. Beginner, roughly:
- one or two things per turn, one idea per sentence
- present tense first
- plain words instead of set phrases
- one bit of local colour allowed, made clear by the context
- keep Lei or tu as it was (the rewrites drifted to tu)
- when explaining a word they asked about, take more room, in small pieces

Intermediate loosens this; Advanced is how they'd talk to anyone, and where dialect comes in. Each country keeps two or three example turns per tier as language data in `content/<country>/levels/`, in that language (Beginner model: Giulia's "Un caffè lungo, subito! Tu abiti qui vicino?"). No word lists, nothing Italian in code.

### 3. Measuring it
- Judge: Haiku with CEFR named (best and cheapest in the test, no recall leak), after the conversation ends with the quality judge, so no added wait.
- Two numbers per conversation: the level of the character's lines, and the share of the character's words a learner at that tier would know (the 90% target).
- The replay runs with a simulated learner at each tier; a prompt change may not push any tier off level. "On level" joins faster and length on the scorecard.
- The length goal becomes ideas per turn rather than a 20-word cap, which would punish a good explanation (Rita's "assaggiare", 28 words).

### 4. Moving up
- The same judge rates the learner's own lines after each conversation, plus signals that work in any language: falling back to English, asking for a repeat, going quiet, turn length.
- When 90% of their speech is at the next level across several conversations (start with 5), Magda suggests moving up; the learner decides.
- Needs its own answer key: learner speech graded by examiners (a learner corpus), not exam listening scripts.

### 5. Safety nets, only if needed
- The Beginner ladder (pick, read aloud, speak with help) for day one, when even A1 Italian is too much without English.
- A rewrite pass for Beginner lines that fail a quick check. Shown to work in the samples, but it adds about 1–3 s per turn against the "Faster" goal.

### Order
1. Level block in the prompt, tried in the replay at each tier against today's prompt (testing only, nothing ships).
2. "On level" on the scorecard (Haiku judge).
3. Tier saved with the learner; Settings control on; onboarding sets it.
4. Rating the learner's speech; moving up.
5. Dialect for Advanced; the rewrite pass if step 1 falls short.

### Risks
- The judge reads text, not speed; speed is a voice setting per tier.
- Haiku wobbles run to run: average over a conversation, not single lines.
- Day-one Beginners will lean on English and the ladder however simple the Italian gets.

## Cautions

- **Beginner is the biggest jump:** from B2+ down to A1–A2 is not a prompt tweak. Day one and near-A2 need very different help; within Beginner the ladder and the character's patience carry that range (Beginner stays one level, Josh 2026-10-15).

## How we'll know it works

1. A judge (Claude) that rates a character's line on the CEFR scale, **calibrated against official CEFR exam material** (CELI, CILS, PLIDA for Italian; DELE for Spanish): exam-board-graded samples at each level serve as its examples and answer key. This scales to any language with CEFR exams; one teacher doesn't (Josh, 2026-10-15). Exam dialogues are tidier than casual speech, so expect slightly high ratings of natural talk.
2. A word-coverage check: the share of a line's words outside a frequency list for the language (language data). No calibration needed.
3. Sample conversations per tier, 10+ turns (to catch drift), judged automatically.
4. Spot checks: Josh's teacher on Italian samples, and Josh playing Afuera as a beginner. Useful, but nothing depends on them.

## Targets (Josh, 2026-10-15)

- **Characters:** 90% of each line's words at the learner's level, the rest a little above (about one new word in ten). The listening research suggests 95% for easy comprehension; 90% chosen for more stretch.
- **Moving up:** when 90% of the learner's own speech is at the next level, across several conversations. Magda suggests, the learner decides.

## Open questions

- ~~Two steps inside beginner, or one?~~ One: three levels, Beginner, Intermediate, Advanced (Josh, 2026-10-15).
- How the learner picks a tier at first: answered by the onboarding above (2026-10-15).
- Does the dialect setting become part of Advanced, or stay a separate option?
- Speed already follows the subtitle and dialect switches (0.7 / 0.9 / 1.0), but none of the settings are saved. Once a tier exists, it should set speed and default subtitles directly, and tier and overrides should be saved with the learner.
