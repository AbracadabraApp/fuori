# Diario: Phrase Review

2026-10-18 · Josh · Draft. The Diario-specific half of the beginner work. Scaffolding stages and what each phrase stores live in [beginner-scaffolding.md](beginner-scaffolding.md) (its five-step ladder, which the cards used, is history as of 2026-10-22); this doc covers how you get to the Diario, the chip wall, groups, heat and retiring phrases. Research: [research/beginner-mode-scaffolding.md](research/beginner-mode-scaffolding.md), [research/flashcards-vocabulary-review.md](research/flashcards-vocabulary-review.md).

Mockup: the interactive Diario canvas in the Claude app (chip → deck → end of pass), https://claude.ai/artifact/4RpwTiTgFXkNcT2ASs7LGg. It predates two decisions: it still shows Replay and Pause on the cards. [beginner-scaffolding.md](beginner-scaffolding.md) wins (no Replay; Pause only in hands-free). The card screens in [design/beginner-levels/levels.html](../design/beginner-levels/levels.html) are current.

## Getting there: a book icon next to Settings (Josh, 2026-10-18)

- A book icon sits immediately left of the Settings icon in the top-right toolbar, wherever Settings appears (D2 in [13-ios-conventions.md](13-ios-conventions.md); today the city and place lists via `.settingsToolbar()` in `FuoriFeatures/Settings/Settings.swift`).
- Add it in the same modifier as a second `ToolbarItem(placement: .primaryAction)`, so the two always travel together. Rename the modifier if it no longer fits (`.topToolbar()` or similar).
- Fuori's own drawing, like `SettingsIcon` (a small open book, same stroke weight), in `FuoriDesign`; not the system `book`. VoiceOver label "Diario". 44 pt target.
- Opens the Diario as a full-screen cover with a close button (it's a place you spend a few minutes, not a quick sheet). Back swipe or close returns to where you were.
- No badge or count on the icon: no streak pressure, matching "no likes, no streaks" in [02-game-design.md](02-game-design.md).
- Before the first conversation the Diario has no phrases: the wall shows all chips cool, with one line pointing you to a place to go.
- Open: whether the book shows during a conversation. Suggest not, so scenes stay in the world; Settings stays there per D2.
- This replaces, for now, the bottom-tab idea in [02-game-design.md](02-game-design.md) (Oggi · Viaggio · Diario · Tu). There is no end-of-day Diario (Josh, 2026-10-18: "end of day is gone").

## Direction: chips with missions (Josh, 2026-10-18; proposed until Josh reviews the chips)

- 90 chips, all prebuilt: 30 for beginners (what you're **doing**: ordering, asking the price, your name, the way), 30 for intermediate (what you're **feeling**: what you liked, tired or happy, a complaint, your day), 30 for advanced (what you're **thinking**: an opinion and why, comparing, what you'd do if, disagreeing politely).
- Tap a chip: 3–5 missions ("Go order an orange juice at the bar"). Tap one: you're in a real conversation at a real place in your city, with its character. No card screens and no scripted dialogue: you practise in the world.
- The AI only colours chips, from transcripts (did it, tried it, needed English or got stuck, only heard it). It never writes the missions or the dialogue.
- Needs: a mission names a kind of place (bar, market, pharmacy) and opens an ordinary conversation at one in the current city, built as simply as possible: memory, past visits and which place don't matter (Josh); the character knows why you came (one line in the opening situation, tested on the replay); beginners need reply buttons to succeed, so missions ship with them; a colouring judge, tested against Josh's own reading of transcripts first.
- Replaces the card decks below if it holds up; the chip wall, groups and heat stay.

## Prototype first (Josh, 2026-10-19)

Prove missions work with a few chips before writing 90 or building the chip wall. Each step has a goal and a bar; the next step waits on it.

| Step | What | Who | Goal and bar |
|---|---|---|---|
| P1 | 3 beginner chips × 3 missions per country, as data; an experiment opens each mission with one "why you came" line and a simulated beginner | Claude | The character steers to the mission without breaking role in 90%+ of runs; a beginner follows 90% of the words |
| P2 | A colouring judge on P1's transcripts and real ones | Claude, then Josh reads 20 | The judge's colour matches Josh's reading on 18 of 20 |
| P3 | Missions in the app behind a setting (off by default): a plain list of the 9 missions in Settings, tap one and you're in the conversation; no chip wall, no reply buttons yet | Claude builds, Josh plays | Josh: drilling a mission feels worth repeating. Ships in the next build (releases are on hold to a milestone) |
| P4 | Decide | Josh | Build the whole feature (90 chips, the wall, colouring, reply buttons), change it, or drop it |

The card maker (round 17) waits on P4.

P1 uses Josh's 10 beginner chips (2026-10-19), Italy first: greet and say goodbye; introduce yourself; order food and drink; ask the price and pay; buy at the market; ask for directions; say what you don't understand; talk about time; get around; make a small plan (3–5 missions each). The full list is in `tests/experiments/missions-it.json`. Some missions have no place yet in the city files (an edicola, a bus, a neighbour's stairs), and Mexico has no market and no café; P1 reports which, and those wait for Josh.

## The shape

The Diario opens on a wall of chips, one per situation group, like the genre chips in MovieGenius. Each chip warms from cool to gold as its phrases are learned. Tap a chip and its deck starts: one card per phrase per pass, each card at that phrase's level (levels and screens in [beginner-scaffolding.md](beginner-scaffolding.md)).

## The groups

A fixed list per country, about 12–15, kept as language data (`content/<lang>/`) so the wall stays stable: At the bar, Food and the market, Getting around, Numbers and money, Time and plans, Meeting people, Asking for help, Around the house, Feelings and opinions. Situations map onto places, so a cool chip points you somewhere to go. Group names on screen are interface text, worded per country; any target-language words come from `/v1/content`, never from Swift.

## Retiring phrases (Josh, 2026-10-17)

- A phrase you've said yourself in a conversation is retired, from any level: it leaves the deck. Using it with a character is the proof.
- Card practice moves a phrase up levels but never retires it.
- Retired phrases stay visible in the group as learned.
- Whether the learner said it is judged by Claude after each conversation (`lib/remember.ts`), not by string matching.

## The heat scale

- Five steps, cool to gold; legend reads "Just heard" → "Used with people".
- Counts retired phrases (plus partial credit for levels reached), not a percentage, so a chip never cools when you meet new phrases.
- Gold comes only through conversation, which keeps the Diario tied to the game.

## Recycling phrases through the world

- Characters get two or three of the learner's recent Diario phrases as "things this newcomer has been learning", so scenes call for them. Shared across characters.
- This is how spacing happens without drills: the same phrases return in new scenes, and saying one there retires it.

## The phrases

- Frames and short phrases, since chunks are the beginner's unit, always practiced inside a whole reply.
- The system selects and edits; the learner never curates. Selection quality decides whether the chips mean anything.
- What each phrase stores (frame, character, line, two replies, answers, audio, level): [beginner-scaffolding.md](beginner-scaffolding.md) → What each phrase needs. Each phrase also needs its group.

## Where it lives

Outside the game world, so characters stay in character. Could be framed as Magda's notebook, though Magda now works inside the world at the scuola (see [02-game-design.md](02-game-design.md)); decide whether that framing still fits.

## How we'll know it works

Chips opened; passes per visit; phrases retired through conversation over time.

## Build order (suggested)

1. Book icon and an empty Diario cover with the chip wall from static group data.
2. `remember.ts` writes phrases with their group; a server route returns the learner's phrases by group.
3. Decks using the level screens already built for the person screen (levels 1–3 first, behind the same test setting).
4. Retiring and heat, once `remember.ts` judges "said it yourself".
