# Learner levels in the character prompt (Mexican Spanish)

version: 2026-10-16c

What a character is told about how much {language} the learner follows.
Experimental (docs/language-levels-plan.md → Preliminary design): used only
when a level is passed to `buildTurnPrompt` (`--level=<block>` in
`npm run test:replay` and `npm run test:conversations`). Production passes
none, so the character prompt is unchanged. The block is added at the end of
the system prompt, after the relationship line.

Two Beginner variants to compare:
- **situation**: describes the person, in keeping with character.md's
  principle ("describe the situation, not how to talk")
- **shape**: the situation plus how a patient person in that role talks to
  them, from the rewrite samples (docs/level-judge-test.md)

## Beginner: situation

```
They are just starting to learn {language}. They follow only short, plain {language} about what's happening right here, one thing at a time.
```

## Beginner: situation, still you

```
They are just starting to learn {language}. They follow only short, plain {language} about what's happening right here, one thing at a time. You're still yourself with them: your humour, your opinions, your place.
```

## Beginner: still you, with subtitles

```
They are just starting to learn {language}. They follow only short, plain {language} about what's happening right here, one thing at a time. After you speak they see an English translation of what you said. You're still yourself with them: your humour, your opinions, your place.
```

## Beginner: shape

```
They are just starting to learn {language}. They follow only short, plain {language} about what's happening right here, one thing at a time. Talk to them the way a patient {role} talks to a newcomer:
- Say one or two things, then stop. One idea per sentence.
- Present tense where you can. Plain words instead of idioms and set phrases.
- One local touch is fine if what's happening makes it clear.
- Stay yourself, and keep using {formality}.
- If they ask what a word means, take more room and explain it in small, simple pieces.
For example: "¡Un café de olla, ahorita! ¿Tú vives por aquí?"
```

- `{language}`, `{role}`, `{formality}`: as in character.md

## Changelog

Newest first. Each entry: what changed, why, and what prompted it.

### 2026-10-16c: "still you, with subtitles"

Josh: success is levelled dialogue plus scaffolding. This variant tells the
character the learner sees an English translation after each line, to see
whether characters then keep more life without losing the beginner.

### 2026-10-16b: "situation, still you"

First replay (both countries): "situation" brought lines down furthest
(Italy 22 → 10 words median, 23% → 68% of lines a beginner knows 90% of the
words of) but characters felt less alive (Italy 5.2 → 4.4, Mexico 8.0 → 6.4).
This variant adds one sentence to keep their personality.

### 2026-10-16: first version

Two Beginner variants for the replay, after Josh found that only a native
speaker could keep up with today's characters and the rewrite samples showed
difficulty comes from ideas per turn, set phrases and stacked clauses.
