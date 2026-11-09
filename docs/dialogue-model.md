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

## What we've learned

**In short (Josh, 2026-11-06): less is more; global solutions; emulate working models (Mexico's `here` lines); avoid scripting; instructions lead to repetition.** The lessons below are the evidence.

Lessons from play and measurement, each with what showed it. Read before
changing a prompt or a `here` line (Josh, 2026-11-06: "we need to keep track of
some principles of dialogue we've learned"). Results are in
`docs/prompt-trials.md`; the gate is `tests/experiments/variety.mts`.

- **Whatever is in the setting gets said, almost every visit.** The weather
  line went into 24 of 24 openers; Luisa's cappuccino line, Nino's closed
  kitchen and Mexico's café de olla come back on every visit (2026-11-06,
  Josh: "these planted lines echo"). So a setting says what the place is,
  not talking points; if something should come up only sometimes, give it
  odds, as the weather has.
- **Planted talking points don't work.** A pride line was ignored or
  forced (Pasolini dropped into a correction); written as "today" it became
  invented news (Luisa's derby score); a planted acquaintance was mentioned in
  0 of 38 conversations (2026-11-04). Facts in the setting work; rules about
  what to talk about don't.
- **A scripted sequence makes every conversation the same.** "Let the errand
  lead: what they'd like, how much, how it's served, paying, goodbye" made
  every shop the same transaction (65–79% of a Beginner's lines); removing it
  cut that to 51–60% (2026-11-06).
- **With nothing to sell, characters invent something to sell.** Tickets at
  a theatre and a park, a coffee on a park bench, a taxi driver taking a torta
  order. A role gets an errand unless the shared rules say it has none
  (2026-11-06, Josh: "this drift is a app wide problem").
- **The place's own thing beats national customs.** Mexico's lines (café de
  olla, the seven moles, Talavera) gave more town content and no clichés;
  Italy's thin lines filled up with "cappuccino only in the morning" and "pay
  first" at every bar (2026-11-06). Tipico, not stereotypical; storytellers,
  not salespeople (Josh, 2026-11-03).
- **Repeats come from memory, not content.** Even Nino, whose visits work,
  tells the menu dish by dish every time; the character doesn't know what it
  already told this learner (2026-11-06). Better lines don't fix that.
- **The kind of place matters more than the prompt.** Landmarks, open spaces
  and roles with little to sell talk about the town in 67–97% of visits with
  almost no buying; shops in 8–33% (Beginner, 2026-11-06). The cheapest fix
  for too much buying is fewer shops on the map.
- **Fix once, on the shared layer.** A patch in three `here` lines hid a
  problem every role has; the fix belongs in `dialogue.md` for every
  conversation, both countries (Josh, 2026-11-05 and 2026-11-06).
- **Shortest rule first.** Try the fewest words that could work before
  adding cases (Josh, 2026-11-06: "maybe as simple as stay in your role";
  "even that is repetitive").
- **Small tests first.** Try an idea on the two or three places that show the problem, one level, one or two visits; widen to the full gate only when it shows promise (Josh, 2026-11-06: "smaller tests that show promise before going broader").
- **Make sure the test can show the problem.** A simulated learner who asks for a ticket makes the character talk about tickets; a judge asked about "errands" counted Beto's "¿Quiere tacos o pizza?" as one, though he stayed a taxi driver (Josh: "he didn't change roles"). Test one fixed moment where the character alone decides, read every line before trusting a count, and pick approaches that differ in kind (a rule, a fact, a deletion) to learn the most (Josh, 2026-11-06: "every experiment should maximize learning, not results").
- **Measure against noise.** Run today's code twice before a change, one
  change per row, the same cases and judges, with prompt versions, commit and
  reply time recorded; a change counts only if it moves a number beyond the
  gap between the two runs (2026-11-06).

## What there is

- **Four kinds of conversation:** town, the welcome, Magda's lessons, cultural
  stories. *How do I say it* is a tool inside any of them, not a kind.
- **Six levels:** Beginner stages S1, S2, S3, S4 (lib/path.ts), then
  Intermediate, then Advanced. The welcome is the one exception: it comes
  before there's a level.

## Decided

- **Content and display are separate** (Josh, 2026-11-07: "We should separate content and display"). Content is what the character says, written by the prompt at every level: her words in each language, how much English, how hard the language, what she talks about, her question, the answers she'd accept, the English meaning of each phrase. Display is what the learner sees and hears of it, decided in code by level: how many answers are shown (or one turned into a frame), whether the English echo is spoken, whether and when a translation shows, bubbles, buttons, timing. The prompt doesn't mention the screen. Today's Beginner stages mix the two (answers two/one/frame and the echo are display; how much and how hard the language is content); separating them points to one prompt with one dial for the language, and display rules per step. **Decided as the goal, not the build** (Josh, 2026-11-07: "while decided as goal it still needs to test into implementation"): the separated version replaces today's stages only after it wins a test against them (docs/prompt-testing.md → queue, CD1).

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
  4. *How do I say it* only puts the learner's own words into the language:
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

- **Who is talking, at a glance** (Josh, 2026-11-05: "I'm interested in if a user can tell who is talking"; "Beginner always being different is not a goal"): one bubble for her and one for the learner, the same on every screen and at every level. Hers on the left in warm parchment (#eee6d6, the Learn page's lessons field) with a thin #d6cab3 edge; the learner's on the right in solid olive (#dbe3c4, the old onboarding answers' green, made solid), its English in dark olive (#3f4a22). Solid, no transparency, so they read over any picture. No tails (Josh: "the left and right are clear and the tails look messy"). Josh: "colors are good". Not built yet.

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
