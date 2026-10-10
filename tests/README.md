# Tests

## Quick checks (free, seconds)

- `npx tsc --noEmit`: type check
- `npm run test:models`: no Claude model IDs hard-coded outside `lib/claude.ts`
- `npm run test:schema`: the `/api/turn` output schema follows structured-output rules
- `npm run test:prompt`: every character prompt says where the character is

## Conversation test: grade and recommend

```bash
npm run test:conversations              # 6 characters, 6 learner turns each (~85 API calls)
npm run test:conversations -- --count=10 --turns=8
npm run test:conversations -- --dry     # show the sample and a prompt, no API calls
```

1. **Sample** existing characters: Giulia and Rita always, plus random characters from the city files (one per city).
2. **Simulate** a conversation with a learner type from `conversations/learners.ts` (beginner with speech-to-text noise, hesitant beginner, improving A2). Character replies go through `lib/turn.ts`, the same code as `/api/turn`.
3. **Grade** the character 1–10 on four things: speaks Italian, understands imperfect speech, matches the learner, feels like a real person.
4. **Recommend** up to 3 changes in a report at `tests/conversations/reports/<date>.md`, with every transcript.

It never edits files. Read the report, decide, change the prompt or character data, rerun.

Needs `ANTHROPIC_API_KEY` in `.env.local`.

The old simulated-learner suite and improvement loop are in `archive/` (see its README).
