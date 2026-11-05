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
  never chosen) is gone from the next phone build.
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
  least 4.5:1 contrast). Built 2026-11-05 for the next phone build
  (BeginnerBubbles.swift): light italic in muted #666666 (5.7:1 on the white
  answer bubble); her bubbles show no English and nothing happens on a tap,
  except where the answer is a tap (mic off, VoiceOver, the welcome's buttons).

- **Everyone starts at Beginner** (Josh, 2026-11-05: "for now everyone starts
  at beginner"), at S1; Settings → level changes it (Beginner, Intermediate,
  Advanced). Built 2026-11-05: the welcome's button starts everyone at S1
  (lib/welcome.ts → finishWelcome). Faster assessment
  later: docs/ideas.md → Assessing level faster.

## Not decided yet

- **Whether English is needed** anywhere else on screen: at S4 (today an
  English line under hers) or under her lines at any level.
- **The screen:** subtitles or bubbles, and what the subtitle line shows. Josh
  is working this out; the one global subtitle setting is hidden in Settings
  for now (2026-11-05).

## How the code is organised (Claude, 2026-11-05; Josh: "think about ways the code should be written to make changes to dialogue issues consistent as well as changes to dialogue scaffolding")

Today `lib/conversation/take-turn.ts` picks one of five prompt paths by kind of conversation, and each path's prompt file carries its own rules about English, answers and corrections, so a fix in one never reaches the others. The target:

- **`lib/dialogue/`: the one place dialogue behaviour lives.**
  - `rules.ts` with `content/<country>/prompts/dialogue.md`: the rules that hold in every conversation (corrections, mishearings, and later questions and answers by level), added to every system prompt by one function. A fix to how characters handle the learner goes here, once.
  - `heard.ts`: reads what the learner said against what was offered (any language, no phrase list) and adds a short note to their message for the character. The said-back fact.
  - `level.ts` (later): the learner's place on the path resolved once, setting the reply form (parts or a line), the stage blocks and the answer limit. Scaffolding changes go here and reach every kind.
- **Kinds supply briefs only:** a lesson, a cultural story or the welcome gives its topic and when it ends; its prompt file says nothing about English, answers or corrections.
- **A test** builds the prompt for every kind and checks the shared rules are in each, so a new kind or a new prompt can't miss them.
