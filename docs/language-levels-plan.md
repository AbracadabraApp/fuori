# Language levels (M3): quick capture

Draft, 2026-10-14, from a conversation with Josh. Not a design yet; we lay it out properly after the Mexican place images are approved. Roadmap: [M3 → Language levels](06-roadmap.md#m3-polish-existing-work--language-levels).

## The problem

- **Characters speak too far above the learner.** Josh's Italian teacher tried the app and rated the speakers **B2+**. Phone testing said the same earlier.
- **The system doesn't adapt to the learner.** The character prompt deliberately tells characters nothing about level ("they hear the learner's level in their actual Italian and adjust"). That isn't working.

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

## Three tiers (Josh: beginner, intermediate, expert)

| | Beginner | Intermediate | Expert (or "Advanced"?) |
|---|---|---|---|
| Scale underneath | A1–A2 | B1–B2 | C1+ |
| Speech | Slower, short pauses | Just under natural | Natural |
| Characters | Short sentences, everyday words, rephrase readily, offer the English for a word, patient | Normal sentences, rephrase when you're stuck, English rarely | As they'd talk to anyone: idioms, speed, dialect |
| Screen | Subtitles and English on | Subtitles on, English off | Both off |
| Magda | Survival phrases, confidence | Past and future, fluency | Nuance, register, dialect |
| Replies | The ladder below | Speak freely; help if stuck | Speak freely |

Characters are told the tier; it doesn't break character. A beginner gets a more patient barista, not a teacher ("everyone teaches, always in role").

## Beginner ladder (Josh's idea)

Support comes off step by step:
1. **Pick:** the character speaks; the learner chooses one of two replies. No speaking yet.
2. **Read aloud:** pick a reply, then say it; Whisper checks it was roughly that.
3. **Speak, help nearby:** answer freely; the two replies appear only if asked for or after silence.
4. **Speak freely.**

The two replies are written fresh each turn by Claude, in character and context (not a phrase list). Possibly one natural reply and one slightly off. Fuori is voice-first, so step 1 should be brief.

Josh doesn't speak Spanish, so Afuera makes him a real beginner tester; expect better ideas once we start.

## Cautions

- **Beginner is the biggest jump:** from B2+ down to A1–A2 is not a prompt tweak. Day one and near-A2 need very different help; beginner may need two steps inside it, even if the learner sees one name.
- "Expert" may be a strong word for a learner; "Advanced" is an option.

## How we'll know it works

1. A judge (Claude) that rates a character's line on the CEFR scale, checked against the teacher's B2+ rating of today's characters.
2. Sample conversations per tier, judged automatically.
3. **Josh's teacher rates the samples per tier:** the most trustworthy test we have.
4. Josh plays Afuera as a beginner.

## Open questions

- Two steps inside beginner, or one?
- How the learner picks a tier at first (a question, a short chat with Magda, both?).
- Does the dialect setting become part of Expert, or stay a separate option?
- Save settings with the learner instead of resetting on reload (small fix, could come first).
