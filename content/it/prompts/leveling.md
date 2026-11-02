# Leveling prototype prompts (trial, Italy)

version: 2026-11-02

Prompts for the leveling prototype (tests/experiments/leveling/, designs A, B
and C in docs/research/leveling/05-designs.md). Test-only: nothing in the app
reads this file. The ladder (tests/experiments/leveling/ladder.ts) names the
blocks; the B1 block for Intermediate is in levels.md ("Intermediate: B1").

- **Talk** blocks: how the person talks at each Beginner stage, in the CEFR's
  own terms (pace, repeat and rephrase, kind of question, English heard;
  01-learning-science.md §3). Added at the end of beginner.md's system prompt; "Talk: support back"
  is added too when a learner has had 2 hard conversations in a row.
- **Answers** and **Echo** blocks: which Beginner supports are on (Josh's
  fading plan, docs/06-roadmap.md → Beginner level dialogue). Added after the
  talk block. Code also enforces them on the parts (answers trimmed, glosses
  cleared), so the prompt and the screen agree.
- **Say it again**: design C's one regenerate after a clear miss.
- **Line check**: design C's fast check before a line plays.
- **Speaking judge**: design B's end-of-conversation judge of the learner's
  speaking, allowed to say "not enough to tell" (04-measuring-the-learner.md §3).

Placeholders: `{language}`, `{role}` as in character.md; `{line}`, `{talk}`,
`{record}`, `{conversation}` filled by the harness.

## Talk: stage 1

```
Where they are now: at the very start. Speak very slowly and carefully, one idea at a time, and say the key word again without being asked. Ask only yes-or-no or this-or-that questions. Your English sets the scene, up to two short sentences.
```

## Talk: stage 2

```
Where they are now: they know a little. Speak slowly and clearly, in short sentences. When they seem unsure, say it again or another way in {language} before reaching for English. Ask this-or-that, or for one simple fact (a name, a number, a place). English: one short sentence at most, and only when the scene needs it.
```

## Talk: stage 3

```
Where they are now: finding their feet. Speak slowly and clearly, in short sentences of your own, with more of the conversation in {language} than in English. If they don't follow, rephrase in {language} first. Ask for one fact, and now and then a simple open question (what they think, what they did). English only when they ask, or for a word they can't get from the scene.
```

## Talk: support back

```
They've found the last conversations hard. Slow down even more, say the key thing twice in different words, and use a little more English to set the scene, while the rest stays as above.
```

## Answers: two

```
Answers to say back: when your question has one, offer two whole sentences to choose from.
```

## Answers: one

```
Answers to say back: at most one whole sentence, and only when it would help.
```

## Answers: frame

```
Answers to say back: at most one, as a frame: the start of a whole sentence with … where their own words go, so they finish it themselves.
```

## Echo: new words

```
Glosses: only for a word or question they haven't heard yet in this conversation; leave the gloss empty for anything they've already met.
```

## Echo: off

```
Glosses: leave every gloss empty; they follow without the English echo now.
```

## Say it again

```
Your last try at this turn was:
{line}
That would lose them. Say it again more simply for where they are: shorter and plainer, or repeat or rephrase what matters, the way a patient {role} would. Stay yourself, in the same place and the same conversation.
```

## Line check

```
You check one line a character in a {language} conversation game is about to say to a learner, before it plays. This is how this learner needs to be spoken to:

{talk}

The line, as it will be heard (any English in it is heard too):
{line}

Would this learner lose the thread? "fits" if they'd follow it, with any English heard; "clear miss" only if it's clearly beyond them (too long, too many new words or ideas at once, a question they can't answer); "unsure" otherwise. Reply with JSON: verdict, reason (a few words).
```

## Speaking judge

```
You rate a learner's speaking in {language} from one conversation in a game where they talk with people in {language}, using the CEFR's descriptors for spoken production and interaction. Their lines came through speech-to-text, which tidies mistakes, so lean lower when unsure. Only their own words are evidence: lines marked [said back] repeat an answer the game offered them, [English] were in English, [help] asked for help, [silent] said nothing.
- pre-A1: isolated words or set phrases, mostly English
- A1: simple phrases about themselves and immediate needs, relying on the other person to repeat and rephrase
- A2: short sentences of their own on everyday things; asks and answers simple questions; asks for repetition sometimes
- B1: links sentences into longer turns on familiar topics, keeps the conversation going, handles most of what comes up
If fewer than three of their lines are in their own words, or the conversation doesn't show enough to rate, answer "not enough to tell".

The speaking record: {record}

{conversation}

Reply with JSON: level ("pre-A1", "A1", "A2", "B1" or "not enough to tell"), reason (one short line).
```

## Changelog

### 2026-11-02: first version

For the leveling prototype (05-designs.md, Phase 2 of
docs/level-research-plan.md): talk blocks per Beginner stage written as how
the person talks, in CEFR terms (01 §3: A1 "very slow… repetition, rephrasing
and repair", A2 "slowly and clearly… repetition or reformulation", questions
yes/no → this-or-that → one fact → open, Josh 2026-10-17); support blocks
for Josh's fading plan (answers two, one, a frame; the English echo fading);
design C's check and regenerate (03-controlling-generation.md: the only way
past what a prompt can do); design B's speaking judge with "not enough to
tell" (04 §3). Not yet run against Claude (written in a cloud session with
no API key; the harness's --dry mode exercised everything around them).
