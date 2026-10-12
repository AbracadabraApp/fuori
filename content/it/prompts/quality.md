# Quality prompt (scoring a conversation)

version: 2026-10-12

When a conversation ends, after the memory call, one Claude call reads the
transcript and counts the things on the dialogue scorecard that code can't
count (docs/10-testing.md → "Dialogue quality"). Read by `lib/quality.ts`,
which adds the measurements code can do (reply length, questions) and saves
both with the conversation. The replay test uses the same call, so real play
and tests are scored the same way.

This judges the character, never the learner, and only counts: it doesn't
grade taste ("feels alive" is Josh's call).

**To change it:** edit the blocks below, bump `version`, add a changelog entry
(what changed, why, what prompted it). Scores carry the version that wrote
them, so a change here shows up as a new column, not a jump in the numbers.

## System prompt

```
You review a spoken conversation from an app where a person who has recently come to live in {city} practises {language} by talking with the people there. {name} is a {age}-year-old {role}, played by an AI. The person's lines came through speech-to-text, so they can contain misheard words; {name} only ever sees that text.

Count what {name} does. Count only what is clearly there; when unsure, don't count it.

- pronunciationCorrections: lines where {name} comments on or drills the person's pronunciation, accent or syllables. {name} can't hear them, so any of this is a mistake.
- correctionsAsked: lines where {name} corrects or explains the person's {language} because they asked (what a word means, how to say something, "is that right?").
- correctionsUnprompted: lines where {name} explicitly points out a mistake the person didn't ask about ("si dice…", "attenzione, è…"). Simply using the right form in a natural reply doesn't count.
- garbled: the person's lines that look garbled by speech-to-text (misheard or nonsense words, not ordinary grammar mistakes).
- garbledMissed: of those, how many {name} misunderstood, ignored the likely meaning of, or commented on.
- lost: each person's line that signals they didn't follow (non capisco, come?, più piano, ripeti, switching to English to say they're lost). For each, "line" is its number among the person's lines (1 = their first), and "pulledBack" is whether {name}'s next reply was clearly simpler and shorter than the one before.
- englishUnasked: {name}'s lines that use English the person didn't ask for. A word in quotes because they asked how to say it doesn't count.
- note: the single biggest problem with {name}'s side of the conversation, in one sentence. "None" if nothing stands out.
```

## User message

```
The conversation ({name}'s lines and the person's lines, in order):
{transcript}
```

- `{transcript}`: one line per turn, "{name}: …" for the character and "Person N: …" for the learner (N counts their lines from 1)
- `{language}`: from `content/it/language.ts`

## Changelog

Newest first. Each entry: what changed, why, and what prompted it.

### 2026-10-12: first version
- Counts the judged items on the scorecard: pronunciation corrections, corrections asked for and unprompted, garbled lines missed, pulling back when the person is lost, English nobody asked for, and the biggest problem.
- Teaching isn't a failure: corrections the person asks for are counted separately, and one or two unprompted corrections a conversation is fine (Josh, 2026-10-12: they help). Being asked "are you a tourist?" isn't counted at all: it's what happens to an American ordering coffee.
- **Prompted by:** the dialogue quality plan (docs/10-testing.md), after the first analysis of Josh's real conversations.
