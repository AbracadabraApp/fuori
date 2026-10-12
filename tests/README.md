# Tests

## Quick checks (free, seconds)

- `npx tsc --noEmit`: type check
- `npm run test:models`: no Claude model IDs hard-coded outside `lib/claude.ts`
- `npm run test:schema`: the `/api/turn` output schema follows structured-output rules
- `npm run test:prompt`: every character prompt says where the character is
- `npm run test:reply`: reading Claude replies works when the reply starts with a non-text block
- `npm run test:images`: every city, place and city character has an image file (generate missing ones with `npm run images -- --city <id>`)
- `npm run test:voices`: every character has a voice matching their gender (`npm run voices` lists Italian voices on the ElevenLabs account)
- `npm run test:feed`: place feeds mix neighbourhoods and kinds, and include every place once
- `npm run test:transcribe`: `/api/transcribe` sends Whisper no prompt (Whisper echoes it into short recordings)
- `npm run test:audio`: phone recordings get a file name with the right extension (Whisper rejects "blob")
- `npm run test:roles`: character roles are in Italian (they show on screen and go into the prompt)
- `npm run test:memory`: memory fills the prompt's `{relationship}` line; with a local `DATABASE_URL`, also that memory is written once per ending, counts one visit per conversation, and retries after a failure (fake Claude)

## Conversation test: grade and recommend

```bash
npm run test:conversations              # 6 characters, 6 learner turns each (~85 API calls)
npm run test:conversations -- --count=10 --turns=8
npm run test:conversations -- --dry     # show the sample and a prompt, no API calls
npm run test:conversations -- --seed=7  # same sample every run: use for before-and-after a change
```

Each report now has a **Length** section (counted, not graded): opener words, median and longest reply, share of replies over 30 words, questions per reply, and share asking 2+ questions. A `.json` summary is saved next to each `.md` report so runs can be compared. Yardstick: real conversational turns are about 5–10 words. See docs/10-testing.md → "How dialogue quality is judged".

1. **Sample** existing characters: Giulia and Rita always, plus random characters from the city files (one per city).
2. **Simulate** a conversation with a learner type from `conversations/learners.ts` (beginner with speech-to-text noise, hesitant beginner, improving A2). Character replies go through `lib/turn.ts`, the same code as `/api/turn`.
3. **Grade** the character 1–10 on four things: speaks Italian, understands imperfect speech, adapts when the learner is lost, feels like a real person. Characters may talk as fast and complex as real Italians; the simulated learner says when they don't understand, and the grade is about how the character responds.
4. **Recommend** up to 3 changes in a report at `tests/conversations/reports/<date>.md`, with every transcript.

It never edits files. Read the report, decide, change the prompt or character data, rerun.

Needs `ANTHROPIC_API_KEY` in `.env.local`.

The old simulated-learner suite and improvement loop are in `archive/` (see its README).
