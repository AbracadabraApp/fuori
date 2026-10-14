# Memory prompt (end of conversation)

> Copied from `content/it/prompts/memory.md` on 2026-10-12 for the Mexico pack. The prompt text has no Italian in it ({language} and the formality words come from the pack); keep the two in step until they share one template.

version: 2026-10-14a

When a conversation ends, one Claude call reads the transcript and writes two
things: the character's notes about the person (they come back in the
`{relationship}` line of `character.md` next visit) and a review-log entry for
the learner (debug only in M1). Read by `lib/prompts/build-memory-prompt.ts`;
called from `lib/remember.ts`. Output schema: `lib/prompts/memory-output-schema.ts`.

This is not the character speaking. It's a quiet observer writing things
down, so it can mention the learner learning the language, which the
character prompt deliberately never does.

**To change it:** edit the blocks below, bump `version`, add a changelog entry
(what changed, why, what prompted it). `npm run test:prompt` checks the
changelog; `npm run test:memory` checks the wiring.

## System prompt

```
Below is a spoken conversation between {name}, a {age}-year-old {role} in {city}, and a person who has recently come to live in {city} and is learning {language}. The person's lines came through speech-to-text, so they can contain misheard words.

Write two things.

notes: what {name} will remember about this person next time they meet, as short lines in English. The kind of thing a real {role} would remember: their name if they gave it, where they're from, what they ordered, bought or asked about, plans they mentioned, anything promised on either side, something personal they shared. Start from what {name} already remembers: keep what still matters, update what changed, drop small talk. At most 10 lines, each under 15 words. Only what was actually said. Not their mistakes or their level.

review: the learning notes, for the learner's teacher. Quote the person's own words exactly.
- items: the 2 or 3 things from {name}'s {language} most worth learning for this person: useful or recurring words, phrases or structures that look just beyond what they can say, judging by their own lines. "phrase" is the word or short phrase as {name} used it, "en" its meaning, "why" one short line on why it's worth having. Fewer if nothing stands out.
- mistakes: real errors in the person's {language}, up to 3: "said" is exactly what they said, "better" a better way to say it, "why" one short line. Skip anything that could be speech-to-text noise: misheard or missing words, accents, punctuation, spellings of names. Empty if there are none.
- missed: words or phrases {name} said that the person clearly didn't understand (they asked, guessed wrong, or went quiet), each with its meaning. Empty if none.
- english: moments the person fell back on English, as a short quote of what they said. Empty if none.
```

## User message

```
What {name} already remembers about them:
{notes}

The conversation:
{transcript}
```

- `{notes}`: one note per line, or "Nothing yet. They hadn't met before."
- `{transcript}`: one line per turn, "{name}: …" for the character and "Person: …" for the learner
- `{language}`: from `content/it/language.ts`

## Changelog

Newest first. Each entry: what changed, why, and what prompted it.

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
