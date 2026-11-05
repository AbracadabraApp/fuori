# The dialogue model

How a character and the learner talk to each other, in every conversation.
Decisions only, each with who decided and when; anything not listed here is
undecided, whatever the code does today (Josh, 2026-11-05: "user experiences
are intentional"). Background and today's behaviour, from the code: the shared
doc "The dialogue model" (https://claude.ai/artifact/XvRja1uP7z4L8WxieCU44R).

## Principles

- **One pattern for all dialogue** (Josh, 2026-11-05: "i agree with the one
  pattern"). The learner's level sets how the dialogue works, in every kind of
  conversation; a kind only chooses its topic and when it ends.
- **Fixes are global** (Josh, 2026-11-05: issues like Jennifer's with Magda or
  his with Lorenzo "are global improvements not local to lessons or
  conversations or one country").
- **Intentional, no discovery** (Josh, 2026-11-05: "if something is in the user
  experience its there for a reason and doesn't need discovery"; "if we decide
  to show english its a decision, or suggest 2 answers rather than 1 or create
  a partial phrase"). No hidden taps or gestures.

## What there is

- **Four kinds of conversation:** town, the welcome, Magda's lessons, cultural
  stories. *Say it in English* is a tool inside any of them, not a kind.
- **Six levels:** Beginner stages S1, S2, S3, S4 (lib/path.ts), then
  Intermediate, then Advanced. The welcome is the one exception: it comes
  before there's a level.

## Decided

- **Where English goes** (Josh, 2026-11-05): "if english is needed it should be
  spoken by the character or listed underneath the italian within the answer
  bubble." Whether it's needed, and at which levels, is not decided. Nothing is
  shown on tap: the tap for English on Beginner bubbles (built 2026-10-25,
  never chosen) goes.
- **Questions** (Josh, 2026-11-05, "ok"): at S1–S3 every turn ends with one
  question, except the goodbye; a Beginner can't start talk unprompted, and a
  turn with nothing to answer is a dead end. From S4 up a question isn't
  required (open talk can be a statement; a character who steps away comes
  back, docs/dialogue-ideas.md).
- **Four fixes, for every conversation and both countries** (agreed 2026-11-05):
  1. The character is told whether the learner said the offered answer back,
     worked out by the app in any language (close counts), so a mishearing is
     never treated as the learner's words.
  2. Corrections: a recast, only when the words were clearly heard, not every
     time, never pronunciation.
  3. Mishearings handled once, in the shared turn, not in each prompt.
  4. *Say it in English* only puts the learner's own words into the language:
     never answers the character's question for them (cause: say-it.md, "it
     answers or follows {name}'s last line"; Lorenzo, 2026-11-05).

- **Answers to say back** (Claude's proposal; Josh, 2026-11-05: "fine"): the
  question decides the form, two real choices or a frame about the learner;
  never a single answer to read out (it can put words in their mouth); the
  stages fade the help (S1 the most, S4 none); the character models the
  sentence in her own line. In Magda's teaching she says the phrase and the
  learner repeats it, not an answer bubble. Replaces S1 two answers, S2 one,
  S3 a frame (never chosen as such).
- **English in answer bubbles** (Claude's proposal; Josh, 2026-11-05: "fine"):
  every answer bubble shows its English under the Italian, always; it goes
  when answers go (S4). Style: light italic (Josh: "light italics or
  parentheses or both"; Claude: italic in the muted ink, no parentheses, at
  least 4.5:1 contrast).

## Not decided yet

- **Whether English is needed** anywhere else on screen: at S4 (today an
  English line under hers) or under her lines at any level.
- **The screen:** subtitles or bubbles, and what the subtitle line shows. Josh
  is working this out; the one global subtitle setting is hidden in Settings
  for now (2026-11-05).
