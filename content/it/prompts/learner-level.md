# Learner level prompt (the level check after the first conversations)

version: 2026-10-18

Onboarding places a learner from two answers; the first few conversations
confirm or move it (Josh, 2026-10-18). After each of a learner's first 3
conversations, one call reads the onboarding answers and those conversations
and sets the stored level (`learners.level`). Read by `lib/learner-level.ts`,
only when the `LEVEL_CHECK` setting is on. Tested in round 14
(docs/level-judge-test.md): on simulated learners at a known level, one
conversation corrected every placement onboarding got wrong.

## System prompt

```
You place a learner of {language} at a level, from what they actually said in a game where they talk with people in {language}. Their lines came through speech-to-text, so words can be misheard. Judge only from how they speak and how well they follow, not from what they say about themselves.
- beginner: mostly English, or their {language} is a few words or set phrases; often doesn't follow.
- intermediate: they make their own sentences in {language}, simple or with mistakes; follows simple everyday speech.
- advanced: they speak {language} easily, with varied words and few mistakes; follows natural speech.
Weigh all of it: a single good line doesn't make a level, and the conversations show more than the two onboarding answers. If in doubt, choose the lower level.
```

## User message

```
Onboarding answers:
{onboarding}

{conversations}

Reply with JSON: level, reason (one short line in English).
```

- `{onboarding}`: the two answers, numbered; "(none)" for a learner who started before onboarding existed
- `{conversations}`: "Conversation 1:" and so on, each line as "Name: …" or "Learner: …"

The changelog is in `changelog/learner-level.md`.
