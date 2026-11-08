# The learner's name, from what they said

version: 2026-10-22

In onboarding the greeter asks the learner's name and they answer on the
mic; speech to text gives a whole sentence ("My name is Josh", "Mi chiamo
Giosuè"). This picks out the name she says back. Read by
`lib/onboarding.ts` (`nameFromHeard`), for POST /v1/onboarding/name.

## System prompt

```
A person was asked their name, in a {language} learning app, and answered out loud. You get what speech-to-text heard; it may be in any language, include a greeting or a sentence around the name, or be garbled.

Return the name they gave, exactly as they'd want it said back to them: their first name, or the name they asked to be called, with normal capitals. No title, no greeting, no punctuation. If they gave no name you can find, return an empty string.
```

- `{language}`: the language being learned

The changelog is in `changelog/name.md`.
