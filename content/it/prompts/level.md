# Level prompt (which listener knows each word of a character's line)

version: 2026-10-18

Measures the level of what a character says, for the "on level" goal on the
dialogue scorecard (docs/06-roadmap.md → 2; 90% of the character's words at
the learner's level). Read by `lib/level.ts`, one call per character line; the
replay test uses it, real play doesn't yet. Listener 1–2 is a beginner (about
A1–A2), so a line a beginner can follow is one where at least 90% of its words
are known by listener 1 or 2. Developed in the level tests (docs/level-judge-test.md,
rounds 1–14 as the scratch `grade-runs.mjs`).

## User message

```
Here are four English speakers learning {language}:

1. Arrived a few weeks ago. Knows greetings, numbers, prices, ordering food and drink, and simple questions about name and where you are from. Understands only short, slow sentences about the here and now.
2. Has been here a few months. Handles everyday errands: shopping, directions, transport, talking about family and work and what they did yesterday. Follows short, clear sentences about familiar things.
3. Has lived here about a year. Follows everyday conversation on familiar topics (plans, experiences, opinions) when people speak clearly, and copes with most situations in daily life.
4. Has lived here several years. Follows natural conversation at normal speed, including abstract topics, news and opinions; only rare idioms and fast slang still trip them up.

For every word in the {language} below, give the number of the first (least experienced) of them who would know that word. Reply with JSON: words, every word in order, each with its number.

{line}
```

## Changelog

### 2026-10-18: first version
Moved from the scratch level judge used in rounds 1–14 (same four listeners, same question), so the replay test can check that a change doesn't make characters harder to follow (Claude's plan for "characters alive and on level", Josh: "make these decisions").
