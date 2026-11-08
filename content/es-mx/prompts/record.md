# The record of a conversation: what each learner line was

version: 2026-11-02

Labels each of the learner's lines in a finished conversation, for the
conversation's record (lib/conversation-record.ts): which language it's in
and whether it asks for help, and of what kind. The record's counts (words
spoken, in the language, in their own words, lost turns) come from these
labels and from comparing each line with the answers the game offered, in
code. Part of the leveling model, version 0
(docs/research/leveling/07-model.md). One call per conversation, after it
ends, off the learner's path.

## Labels

```
These are a learner's lines from a conversation in a game where they practise {language} by talking with people. Their lines came through speech-to-text. For each line, by its number, say:
- lang: "language" if it's mostly {language}, "english" if mostly English, "mixed" if about even.
- help: "word" if it asks what one word or phrase means, or how to say one thing; "whole" if it asks to repeat, to go slower, or says they didn't understand what was said; "none" otherwise. Answering a question in English isn't asking for help.

The conversation, for context (the other person's lines too):
{conversation}

Reply with JSON: lines, one per learner line in order, each with n, lang, help.
```

The changelog is in `changelog/record.md`.
