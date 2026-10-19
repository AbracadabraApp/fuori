# Teaching in Conversation: Prompts and Screen

2026-10-19 · Josh · **Proposed.** From the cloud session's review of `docs/prompt-trials.md` and the `levels.md` changelog. Mockups: the "Teaching moments: one thing each" row on the canvas "Duolingo-inspired beginner ideas" in the Claude app.

## The idea in one line

The teaching is in what the character says. The screen only marks it: an underline on the one thing she teaches, grey italic for English. No new controls, no transcript of the learner.

## Prompts: no new level prompts

Earlier drafts proposed a level 1 "teach" block and a separate level 2 block. Reviewing the log, both would repeat known problems:

- **Levels 1–5 are steps within the beginner tier** (`beginner-scaffolding.md`) and differ by screen, not prompt. The prompt has one Beginner block, part of the beginner / intermediate / advanced tiers. A level-1 prompt and a level-2 prompt would be a second level system.
- **"They're learning Italian" turns characters into teachers** (character.md changelog, 2026-10-11). "Sounds like a lesson" is measured for this reason.
- **Choice questions become an order form.** Round 9: "Vuoi X o Y?" on 43–44% of turns, graded "a language-lesson script". Round 5: a tacked-on "sì o no?" on nearly every turn. A "Capisci?" check every turn would do the same and add double questions, which is what failed `teach` and `teach2`.
- **Unasked English fails a gate measure by design.** If proactive English is ever wanted at level 1, the measure needs a level-aware exception first.
- **Teaching is already in `character.md`, at all levels** (Josh, 2026-10-19). `character-teach3` passes the replay gate within noise: a recast as a statement, only when the meaning is clear, noise left alone.

**Suggested:** level 1 is the existing Beginner block + `teach3` + the English rule from `english3` (no translation line; English when asked, in English or in the language). These have only been tested one at a time. Next: replay the three **stacked**, Mexico first (the level trial already runs there). Add a new sentence only if, stacked, she still doesn't hand over words often enough.

## What she does (from today's transcripts and the trials)

Each turn, inside an ordinary short line, at most one of:

| Move | Driven by | Example (real or trial target) |
|---|---|---|
| Hands over the word you said in English | today's prompt | "Box? Una scatola! Otto euro." |
| Says what it means, because you asked | `english3` | "Siediti? Sit down. Siediti qui!" |
| Recasts your mistake as a statement | `teach3` | You: "per due persona" → "Per due persone, perfetto. A che nome?" |
| Gives the phrase when you ask how to say it | `teach2` idea (in the language) | "Si dice: a che ora? Prova!" |
| Is pleased when you get it | today's prompt | "Giusto! Bravo." |

Not on the list, on purpose: unasked English, a choice question every turn, a comprehension check every turn.

## The screen

- Her line types out with her voice, as now.
- **Underline:** the one thing she taught in that turn (the handed-over word, the recast form, the phrase). One per line at most. These are the phrases `memory.md` already logs for review, so the Diario can draw on them.
- **Grey italic:** English in her line, which is there because you asked for it or said it yourself.
- No transcript of what you said (immersion, `ConversationModel.swift`), no buttons at these levels in the mockups, nothing else new.
- Because your words aren't shown, her line has to carry the link: she echoes what she's answering ("Box? Una scatola!").

## What the software has to produce

For each character line, which span is the taught phrase and which spans are English. Best as the same side call that already runs while the voice plays (as for reply buttons), so the turn stays `{ line, en }` and the replay gate is untouched. Then: does the marked phrase match what `memory.md` logs?

## Open for Josh

1. Ship `teach3` (the candidate) and `english3`?
2. Proactive English at level 1: wanted at all? If yes, the "English unasked" measure needs a level exception first.
3. Is a learner who sees no translation line at levels 1–2 right, given English comes only when asked?
