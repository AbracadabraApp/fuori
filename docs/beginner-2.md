# Beginner 2

**Status (2026-11-09):** the plan, from Josh's decisions of 2026-11-09 (the handoff `~/.claude/plans/graceful-stirring-rossum.md`, and the session after it). Nothing is built. Supersedes the direction of [beginner-plan.md](beginner-plan.md) (the turn-shape spec, kept as the record); the facts behind it are in [beginner-deep-dive.md](beginner-deep-dive.md).

## Rules for the work

- **Beginner 1 = production, untouched.** Beginner 2 is new code beside it, even for bug fixes found while building (the heard note). Josh picks the version in the hidden panel (Settings → touch and hold Version → "Beginner: 1 · 2", default 1) and plays them against each other. When 2 is better, it replaces 1.
- **Plan first, build only once Josh agrees the plan.** Talk, no multiple-choice questions.
- **Be a partner:** build on Josh's ideas; don't hedge and then backtrack; critique only when asked.
- **Goal before speed** (Josh: "you were in such a rush to move forward you were inattentive to the actual goal"). Restate the learner-facing goal before building or proposing, and check each step against it. Analysis changes the design before code is written.

## What Beginner 2 is

- **The goal is communication.** Both sides talk like bilingual people and use both languages.
- **The character is themselves** (Nino stays Nino), a bilingual friend. English is used freely and in every way, at every point. How much English is used is not the level.
- **The learner may reply in either language.** If they're unclear, the character encourages an English reply.
- **The gain:** the character asks in the language and the learner understands, whatever language they answer in.
- **Errors are signal, not failure.** A corrected error (uptake, self-correction) is a strong gain. Mistakes are never pointed out.

## What a bilingual friend does

Real moves, each a different kind of turn, and the source of variety (Josh: the problem is too few shapes; the character is bilingual):

- explains in English, the way a local friend would (why you pay at the cassa first; cavolo nero is kale);
- gives the word, then uses it ("Here we call it *il coperto*. Il coperto è due euro.");
- switches mid-sentence ("Allora, the best thing here is *la gricia*. Sai cos'è?");
- asks about English ("How do you say *cornetto* in America?");
- checks they followed ("Did you get that? *Chiusa*, closed.");
- tells something short in English with the key words in the language (the festival, her nonna's recipe);
- slows down or rephrases when they're lost.

Also real: a turn with no question (a remark they react to), the learner leading (they ask or comment, she answers), a short turn (a reaction and one answer).

## How the learner replies

Most replies are set up one of two ways: **the bubbles** (she asks, two answers to say back, as in Beginner 1) or **her glossed words, no bubbles** (she glosses the words that matter as she asks, and they build the answer: "Piccante o dolce? Spicy or sweet, quale ti piace? which do you like?" → "Piccante" or "Mi piace dolce").

| Reply | Bubbles | Who makes the sentence |
|---|---|---|
| Two answers to choose from | yes | she does |
| One answer | yes | she does |
| A question for them to ask her | yes | she does; they lead |
| Built from her glossed words | no | they do |
| Answers set up in her speech ("…just say *Vorrei la carbonara*") | spoken, or spoken and shown | she does |
| Answer in English, invited ("*Il Palio è una follia*, it's madness. What do you think?") | no | they do, in English; it stands, nothing comes back to say; she can turn it later with more of the language |
| Free | no | they do |

Out: three or more answers (crowds the screen); one word missing with words to choose (a puzzle); and, as unrealistic classroom exercises no one does in a bar (Josh): repeat after her, finish her sentence, a key word only, a hint in English only, a listening turn, catch her out. Not yet judged: build it from two pieces.

## Measuring

**The reply table** (Josh's experiment on the Nunzio visit, Palermo, 52ae014d): the learner's reply, judged against what the character asked.

| Exchange | Score |
|---|---|
| English asked, English answered | ~+1 |
| Language asked, offered answer read back | ~+1 |
| Language asked, answered in English | +2 |
| Garbled attempt | +2 |
| Own words in the language (a reply built from her glossed words included) | +3 |
| Uptake or self-correction | +4 |
| Silence | 0 |

Nunzio visit: 40 over 13 replies.

**Content, counted in code** (no judge, any language): words per turn, unique words per conversation, number of turns. Nunzio: 14 turns, 31.4 words a turn, 229 unique; Josh: 13 turns, 14.8 words a turn, 108 unique (1,038 bytes against 2,475).

**Next experiment:** compute both over all real conversations. Do they rise across visits? Do they tell the players apart (Josh, Jennifer)?

## Progression

Within a conversation and across conversations. What exactly changes is open. A loose TCP picture: start small, grow while exchanges land, back off on a breakdown, remember the level across visits. The reply table is the candidate measure. Ask before removing scaffolding: the learner decides, and each ask names the one part that changes.

## Beginner 1 rules Beginner 2 breaks

1. **English: brief** (`beginner.md`: at most two short sentences) → English is used freely, in every way.
2. **English only when asked** → the character invites an English reply when the learner is unclear.
3. **English reply = lost** (`conversation-record.ts` `feltOf`: lost on 40% or more of turns = hard) → an English reply is communication (+2).
4. **Said back doesn't count** (`RULES.countedOwnTurns`: 3 own-words turns) → every reply counts, reading included (+1).
5. **Stages turn English down** (`leveling.md`; S3 English only when asked; S4 none) → the amount of English isn't the level.
6. **Errors are only "own words"** in the record → uptake and self-correction score +4.

The earlier spec's section-by-section list is in [beginner-plan.md](beginner-plan.md) → "Production rules this overrides".

## Carried over, to rethink before use

In the `../fuori-beginner-shapes` worktree, uncommitted:
- **The heard-note fix and its test** (offered answers kept through `/v1/turn`), for Beginner 2 only.
- **A turn-shape picker** (`lib/beginner-shape.ts`) and a short prompt (`beginner-shapes.md`). They came before the decisions above. Decided for it so far: a new pick every turn, seeded by conversation and turn number, the opening by learner, place and day. Its six mid-conversation shapes, five ending in a question, are too few; shapes should come from the bilingual moves above.
- **Card B1** (Reviewed: pending); the test designer asked for changes.
