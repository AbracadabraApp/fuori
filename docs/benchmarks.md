# Benchmarks: each service call per turn

What a learner waits for on a turn, split by service, so a change to any one of them can be compared (Josh, 2026-11-08: "I would like bench marks for each service call per turn"). Measured from the laptop against the live server with `npm run measure:turn -- --stream --turns=6` (and `COUNTRY=es-mx` for Mexico): a fresh learner plays the way the app does, recording → `/v1/transcribe` (Whisper on Groq) → `/v1/turn` (Claude, streamed) → `/v1/speak` (ElevenLabs). Medians; the network part is the laptop's, not a phone's. Rerun after any change to a service and add a row.

| Date | Build | Country | Speech to text (Groq) | Claude: first words | Claude: whole reply | Voice (ElevenLabs) | Total wait, done → her voice |
|---|---|---|---|---|---|---|---|
| 2026-11-08 | bb0b6e6 | Italy | 338 ms | 1,449 ms | 2,327 ms | 123 ms | **1,946 ms** |
| 2026-11-08 | bb0b6e6 | Mexico | 427 ms | 1,684 ms | 2,697 ms | 166 ms | **2,306 ms** |

The total is speech to text + Claude's first sentence + the voice for it: the app starts speaking the first sentence while the rest is written. Claude is three quarters of the wait.

Outliers in this run (single turns, not in the medians): Mexico turn 1 voice 2,624 ms, turn 6 speech to text 1,582 ms. Openings (no speech to text): Italy 3,167 ms.

Not yet measured here: a Beginner answer said back with the replies written ahead (1c87680, not released; locally ~0.1 s for Claude's part).
