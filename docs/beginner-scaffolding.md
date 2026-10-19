# Beginner Scaffolding: Levels 1–5

2026-10-17 · Josh · Draft. Replaces the four-step "Beginner ladder" sketch in [language-levels-plan.md](language-levels-plan.md). Mockups: [design/beginner-levels/levels.html](../design/beginner-levels/levels.html) (open it in a browser). Research behind it: [research/beginner-mode-scaffolding.md](research/beginner-mode-scaffolding.md) and [research/flashcards-vocabulary-review.md](research/flashcards-vocabulary-review.md). The Diario itself (book icon, chip wall, heat, retiring phrases): [diario.md](diario.md).

A beginner takes part at one of five levels. The level decides how much support the screen gives, from tapping a reply with English everywhere (level 1) to filling a frame in your own words (level 5). Past level 5 there's nothing to add: that's the normal screen, where you speak freely. Nothing is scripted past level 4.

**These levels are scaffolding only (Josh, 2026-10-17).** They change how you take part, not how characters talk. How characters talk follows the learner's level (Beginner, Intermediate, Advanced; [language-levels-plan.md](language-levels-plan.md) → Three tiers), which moves separately. Reaching the normal screen past level 5 doesn't make you Intermediate: a Beginner there still hears Beginner dialogue. On levels 1–5 the dialogue is always the easiest (Beginner) and doesn't progress from one level to the next: only the support changes.

The same levels apply to a Diario card and to the person screen in conversation.

## The exchange

Every turn is three beats:

1. **The character's line.** Context. Never contains the phrase being practiced.
2. **Your reply.** Always a whole line, never a lone word, built on a frame ("Vorrei…", "Posso avere…", "Mi chiamo…", "Sono di…"). The frame is the chunk being learned; what fills it can change.
3. **The character's answer.** A natural response in character, to whatever you said.

**Two voices.** The character's voice says beats 1 and 3. Your voice, a consistent native speaker matched to the learner, says your whole reply. The app never voices a lone word.

## Controls (Josh, 2026-10-17: keep them few)

In the default tap-to-talk mode, one control per level, plus Less help only after the 15-turn question and until it's used:

| | Levels 1–3 (tap) | Levels 4–5 and normal (speak) |
|---|---|---|
| Main action | The two reply buttons (tapping one while the character speaks stops them) | The mic pill (tapping it while the character speaks stops them and starts your turn) |
| Less help | Once offered, until used | Same |
| Pause | Hands-free only | Hands-free only |

- **No Replay (Josh, 2026-10-17).** On levels 1–3 the character's words are on screen, with English on levels 1–2. On levels 4–5 the learner can ask the character to repeat ("Ripeti?", "Più lentamente"), which already works in the game and stays in role. If testing shows beginners stuck on level 3, add it back.
- **Pause only in hands-free (Josh, 2026-10-17).** In tap-to-talk, the reply buttons and the pill already stop the character, and the mic never opens on its own. Hands-free keeps the Pause button, since there the mic can open without a tap. This changes decision D3 in [13-ios-conventions.md](13-ios-conventions.md) ("a Pause button always on the conversation screen"); update D3 and the CLAUDE.md safeguard line when this is built.
- Levels 4–5 add one paper card with an instruction directly above the pill; levels 1–3 need none.
- Nothing appears or disappears except the result of your answer.

### Settled after the laptop review (2026-10-17)
- **Questions.** Every turn needs the character to ask something, since the replies need something to answer. On levels 1–3 any real question works ("Cosa prendi?"); the buttons supply the words. What the character asks starts to matter from level 4, where the learner has to come up with the words.
- **Level 4, simplified (Josh, 2026-10-17: confusing).** No second voice before you speak. The character asks, your card shows your line, you read it out loud, and the character answers, recasting if you stumbled.
- **Largest text size (AX5).** The portrait stays put; the area above the controls scrolls within a capped height, as the subtitle card already does past 260 pt. At AX5 the replies may cover most of the portrait; that's acceptable at that size. Check on the phone.
- **Card wording.** Instructions like "Read your line out loud" are interface text, worded per country; any target-language words in them come from `/v1/content`, never from Swift.
- **Writing the replies.** A separate call, run while the character's voice plays, so the turn stays `{ line, en }` and the `test:replay` gate is untouched. Test it on replayed conversations against folding the replies into the turn, for latency and quality, before deciding.

## The levels

| | 1. Choose, all English | 2. Choose, English on the character | 3. Choose, Italian only | 4. Read out loud | 5. Fill the frame | Past 5: normal screen |
|---|---|---|---|---|---|---|
| **Subtitles** | Italian + English | Italian + English | Italian | Italian | Italian | As set in Settings |
| **Your side** | Two whole-line replies as buttons, Italian + English | Two whole-line replies, Italian only | Two whole-line replies, Italian only | Your whole reply in Italian, frame highlighted | The frame with an open slot: "Vorrei ________" | Nothing |
| **Instruction** | None | None | None | Read your line out loud | Answer [character] out loud, your way: | None |
| **Action** | Tap | Tap | Tap | Speak | Speak: fill the slot with whatever you want | Speak freely |
| **Your voice** | After you tap | After you tap | After you tap | None: the character's answer recasts | After you speak, your answer said right | — |

### What each level is for

1. **Choose, all English.** Meet the frame with full support: you understand the question and both answers, and you hear your choice said right.
2. **Choose, English on the character.** You still understand the question, but you read your own options in Italian.
3. **Choose, Italian only.** To choose, you have to understand the question and both options; the character's answer confirms what you said.
4. **Read out loud.** Your first time saying it: read the whole line yourself; the character's answer shows you how it sounds.
5. **Fill the frame.** The structure is given; the content is yours. "Vorrei ____" lets you order anything, so it's open-ended but still scaffolded.

## Rules

**Choices (levels 1–3).**
- Both buttons are real, sensible options built on the same frame. Pick what you'd actually say.
- The tapped button turns a plain selected color. No right or wrong colors.
- Your reply fills in with your pick, your voice says it, and the character answers to it.

**Speaking (levels 4–5).**
- Tap the pill to talk, tap when done; no timers.
- Speech checks are lenient. When recognition is unsure, count it. Marking a right answer wrong is worse than passing a near-miss.
- After you speak, your answer shows in Italian with its English (corrected if needed), your voice says it, and the character answers.

## Progression on the person screen (Josh, 2026-10-17)

A turn count prompts the step up, and a ceiling keeps anyone from staying on full support forever (static support tends to create over-reliance).

| Turns at a level | What happens |
|---|---|
| 15 | At the end of the conversation, ask whether they're ready for less help. Yes moves up one level; Not yet stays |
| 15–30 | The Less help button stays on screen, so the learner can step up any time |
| 30 | Move up automatically, tell the learner, and point to Settings to step back |

- One level per learner.
- Ask and move only at a natural break: when the learner leaves a conversation, never mid-turn.
- Never move down automatically; Settings is where a learner steps back or jumps ahead.
- 15 and 30 are starting numbers, to tune.

## The Diario

- Each phrase has its own level, and the card uses that level's screen.
- Levels 1–4: completing the card moves the phrase up one level. Level 5: using the frame moves it past the ladder; not using it leaves it at 5. A phrase never moves down.
- Only saying the phrase yourself in a real conversation retires it.
- A pass shows each phrase once, each at its own level; one action per card; at the end, another pass or done. Up to about six phrases per pass: new ones since the last conversation first, then the ones not seen longest.

## What each phrase needs

Written by the end-of-conversation step (`lib/remember.ts`), stored with the phrase:

| Field | Example |
|---|---|
| Frame, with its English | Vorrei… · I'd like… |
| Character, place | Giulia · Bar in Trastevere |
| Character's line, with its English | Buongiorno! Cosa prendi? · Good morning! What are you having? |
| Two whole-line replies on the frame, with English | Vorrei un cornetto integrale. · Vorrei un macchiato. |
| Character's answer to each | Un cornetto integrale, subito! · Un macchiato, arriva! |
| Audio | Character's line and answers in the character's voice; the replies in your voice |
| Level | 1–5 |

## Build: reply buttons for levels 1–3 (2026-10-18)

A first playable version, behind a setting, so Josh can feel levels 1–3 in Afuera. Live dialogue (not the scripted world).

**Server (done, cloud session, not verified live):** `POST /v1/replies { cityId, placeId, tripTo?, conversationId }` → `{ frame, replies: [{ line, en }, { line, en }], promptVersion }`. Wraps `lib/replies.ts`; reads the conversation from the database like `/v1/turn`; refuses until the character has spoken last; rate-limited per learner. `npm run test:replies-route`. Needs `smoke:live` (or one curl with a real token) once deployed.

**App (laptop):**
1. `SettingsKey.replyButtons` ("Reply buttons (test)", off by default) and `SettingsKey.scaffoldLevel` (1, 2 or 3; a picker under it, shown only when the toggle is on). On the phone for now; saved with the learner later.
2. `APIClient.replies(cityId:placeId:tripTo:conversationId:)` → `{ frame, replies: [{ line, en }], promptVersion }`.
3. `ConversationModel`: when the toggle is on and a character line arrives, fetch the replies in parallel with the voice. Hold them until the character finishes (subtitles fully typed). A failed fetch falls back to the mic for that turn and logs it; never a silent failure.
4. Levels 1–3 on screen: level 1 shows the character's English and each reply's English; level 2 the character's English only; level 3 neither. The two replies replace the mic pill; no Pause or Replay in tap-to-talk.
5. A tap sends the reply's `line` through the existing typed-reply path (`send(typed:)`, which posts to `/v1/turn` as `learnerSaid`). The tapped button shows a selected state; no right or wrong.
6. Tapping a reply while the character is still speaking stops her and sends it.
7. Done checks (CLAUDE.md): AX5 (the area above the controls scrolls), VoiceOver (replies read in the target language), 44 pt targets, both countries, back swipe saves.

**Josh:** play 10 minutes in Afuera at level 1, then level 3. Note where it felt wrong.

## On hold: a scripted, smaller world for levels 1–3 (Josh, 2026-10-17; on hold until there's a spec, 2026-10-18)

Not decided; being tested ([test-ideas.md](test-ideas.md), [level-judge-test.md](level-judge-test.md) rounds 11–12).
- **Scripted dialogue.** Levels 1–3 last at most 100–150 turns and the learner only taps, so the dialogue can be written ahead: fixed scripts per character, the same for every learner, checked before anyone hears them, audio recorded once. CLAUDE.md's "no scripted scenes" predates beginner levels and doesn't rule this out.
- **A smaller world.** Beginners stay in one neighbourhood until level 4: Trastevere has 11 characters (Rita, Giulia, the fruit seller, the baker, the oste, the parish priest, the nonna, the bookseller, the sommelier, the pharmacist, the newsagent); 2–3 visits each is 22–33 conversations, about the 100–150 turns of levels 1–3. Mexico City has 13 characters across four neighbourhoods. Small enough for a person to read every line, and the visits can be ordered so the frames build up ("Vorrei…" before "Sono di…"). Leaving the neighbourhood is the reward for reaching level 4.
- **What it costs:** levels 1–3 lose the open world; the feed and the day's suggestions stay inside the neighbourhood; a script can't remember the learner's own taps from an earlier visit or say their name without live audio.

## Open questions

- Phrases that aren't frames (a noun like "cornetto integrale" on its own): either the end-of-conversation step always picks frame-shaped chunks, or such phrases ride inside a frame and level 5 opens the frame's slot rather than the noun.
- Whether a phrase's Diario level and the learner's conversation level should influence each other. Today they're separate.
- Settings overhaul: level becomes the main control; Subtitles and English are set by the level on levels 1–3; Hands-free applies from level 4.
