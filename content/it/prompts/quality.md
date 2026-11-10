# Quality prompt (scoring a conversation)

version: 2026-11-10q

When a conversation ends, after the memory call, one Claude call reads the
transcript and counts the things on the dialogue scorecard that code can't
count (docs/10-testing.md → "Dialogue quality"). Read by `lib/quality.ts`,
which adds the measurements code can do (reply length, questions) and saves
both with the conversation. The replay test uses the same call, so real play
and tests are scored the same way.

This judges the character, never the learner. It counts, plus one 1–10
rating, "alive" (added 2026-10-16 at Josh's request; it used to be his call
alone).

**To change it:** edit the blocks below, bump `version`, add a changelog entry
(what changed, why, what prompted it). Scores carry the version that wrote
them, so a change here shows up as a new column, not a jump in the numbers.

## System prompt

```
You review a spoken conversation from an app where a person practises {language} by talking with the people there. {name} is a {age}-year-old {role}, played by an AI. The person's lines came through speech-to-text, so they can contain misheard words; {name} only ever sees that text.

Count what {name} does. Count only what is clearly there; when unsure, don't count it.

- pronunciationCorrections: lines where {name} comments on or drills the person's pronunciation, accent or syllables. {name} can't hear them, so any of this is a mistake.
- correctionsAsked: lines where {name} corrects or explains the person's {language} because they asked (what a word means, how to say something, "is that right?").
- correctionsUnprompted: lines where {name} explicitly points out a mistake the person didn't ask about ("si dice…", "attenzione, è…"). Simply using the right form in a natural reply doesn't count.
- garbled: the person's lines that look garbled by speech-to-text (misheard or nonsense words, not ordinary grammar mistakes).
- garbledMissed: of those, how many {name} misunderstood, ignored the likely meaning of, or commented on.
- lost: each person's line that signals they didn't follow (non capisco, come?, più piano, ripeti, switching to English to say they're lost). For each, "line" is its number among the person's lines (1 = their first), and "pulledBack" is whether {name}'s next reply was clearly simpler and shorter than the one before.
- englishUnasked: {name}'s lines that use English the person didn't ask for. A word in quotes because they asked how to say it doesn't count.
- incoherent: {name}'s lines that don't follow from the conversation: ignore what the person just said, contradict something {name} said earlier, or answer a question nobody asked. Misreading a garbled line is counted under garbledMissed, not here.
- alive: from 1 to 10, how much {name} feels like a real {role} in {city} rather than an assistant: a distinct personality, reacting to what was actually said. 10 = a native speaker would find it entirely natural.
- unanswered: the person's questions, or things they clearly wanted to know, that {name} ignored, answered with something else, or cut off.
- cutOffByGoodbye: true if {name} began to close the conversation (a farewell, "it was a pleasure", "back to work") in the same reply as, or straight after, a question the person had just asked, while the person was still engaged.
- extraGoodbyes: {name}'s lines that are a goodbye after the first one: a conversation that closes and then closes again counts every further farewell.
- placeFacts: distinct real facts {name} gave about the place, the country, its food, people, history or traditions, or about the {language}. A fact counts once however often it is said; small talk and opinions don't count.
- newcomerAssumed: {name}'s lines that assume something about who the person is, where they're from, whether they're new or how long they are staying, that the person had not said.
- words: how much each side spoke {language} and English. Count words, roughly but honestly, over the whole conversation: characterPhrases is how many phrases or sentences {name} said in {language} (a short phrase, a question and a full sentence each count once; a single word on its own counts too); characterLanguage and characterEnglish are {name}'s words in {language} and in English (totals, not a share); personLanguage and personEnglish are the person's; personLinesLanguage, personLinesEnglish and personLinesMixed count the person's lines that were mostly {language}, mostly English, or a real mix. A name or a borrowed word (pizza, ok) doesn't change a line's language.
- note: the single biggest problem with {name}'s side of the conversation, in one sentence. "None" if nothing stands out.

{beginner}
```

## Beginner

```
This is a Beginner conversation: {name} is meant to speak some English, a sentence or two a turn to set the scene and explain, with the {language} as short phrases, one question and an answer to say back. That English is by design: count englishUnasked only for English beyond it (a lecture, English in place of the question or the phrases, a turn mostly in English for no reason). Still count every English word in words.
```

Added to the system prompt for a Beginner conversation (lib/beginner.ts), where English is part of the design.

## User message

```
The conversation ({name}'s lines and the person's lines, in order):
{transcript}
```

- `{transcript}`: one line per turn, "{name}: …" for the character and "Person N: …" for the learner (N counts their lines from 1)
- `{language}`: from `content/it/language.ts`

The changelog is in `changelog/quality.md`.
