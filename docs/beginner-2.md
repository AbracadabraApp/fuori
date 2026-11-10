# Beginner 2

**Status (2026-11-10):** playable behind a hidden switch (Settings → touch and hold Version → Beginner 1 · 2, with a Cluster 1–6 stepper); Josh plays it against Beginner 1, which stays production. Built: the six clusters of the reply ladder, the setups picked per turn, the scaffolding prompt (`scaffolding.md`) over the unchanged Intermediate prompt, the code's fixes to the parts (each turn records which fired, 7ce4181), replies written ahead, records by reply rank. Not built: the offer to move up (Progression below), placing learners into a cluster. The plan came from Josh's decisions of 2026-11-09 (the handoff `~/.claude/plans/graceful-stirring-rossum.md`, and the session after it). Supersedes the direction of [beginner-plan.md](beginner-plan.md) (the turn-shape spec, kept as the record); the facts behind it are in [beginner-deep-dive.md](beginner-deep-dive.md).

## Rules for the work

- **Beginner 1 = production, untouched.** Beginner 2 is new code beside it, even for bug fixes found while building (the heard note). Josh picks the version in the hidden panel (Settings → touch and hold Version → "Beginner: 1 · 2", default 1) and plays them against each other. When 2 is better, it replaces 1.
- **Plan first, build only once Josh agrees the plan.** Talk, no multiple-choice questions.
- **Be a partner:** build on Josh's ideas; don't hedge and then backtrack; critique only when asked.
- **Goal before speed** (Josh: "you were in such a rush to move forward you were inattentive to the actual goal"). Restate the learner-facing goal before building or proposing, and check each step against it. Analysis changes the design before code is written.

## What Beginner 2 is

- **The goal is communication.** The character speaks the language; English is there to help the learner follow and reply.
- **The characters are interesting locals, not friends** (Josh, 2026-11-09): helpful the way a local is to a newcomer, but there to be met, not befriended.
- **The character is themselves** (Nino stays Nino): **a local who knows enough English to help explain** (Josh, 2026-11-09). The character speaks the language, as a local does, and reaches for English when it helps the newcomer: to explain, to give a word, to rescue them when they're lost. How much English that takes is not the level.
- **The learner may reply in either language.** If they're unclear, the character encourages an English reply.
- **The gain:** the character asks in the language and the learner understands, whatever language they answer in.
- **Errors are signal, not failure.** A corrected error (uptake, self-correction) is a strong gain. Mistakes are never pointed out.

## What a local who knows some English does

Real moves, each a different kind of turn, and the source of variety (Josh: the problem is too few shapes; the character knows enough English to help):

- explains in English, the way a helpful local would (why you pay at the cassa first; cavolo nero is kale);
- gives the word, then uses it ("Here we call it *il coperto*. Il coperto è due euro.");
- switches mid-sentence ("Allora, the best thing here is *la gricia*. Sai cos'è?");
- asks about English ("How do you say *cornetto* in America?");
- checks they followed ("Did you get that? *Chiusa*, closed.");
- tells something short in English with the key words in the language (the festival, a nonna's recipe);
- slows down or rephrases when they're lost.

Also real: a turn with no question (a remark they react to), the learner leading (they ask or comment, the character answers), a short turn (a reaction and one answer).

## How the learner replies

Most replies are set up one of two ways: **the bubbles** (the character asks, two answers to say back, as in Beginner 1) or **the character's glossed words, no bubbles** (the character glosses the words that matter while asking, and they build the answer: "Piccante o dolce? Spicy or sweet, quale ti piace? which do you like?" → "Piccante" or "Mi piace dolce").

| Reply | Bubbles | Who makes the sentence |
|---|---|---|
| Two answers to choose from | yes | the character does |
| One answer | yes | the character does |
| A question for them to ask the character | yes | the character does; they lead |
| Built from the character's glossed words | no | they do |
| Answers set up in the character's speech ("…just say *Vorrei la carbonara*") | spoken, or spoken and shown | the character does |
| Answer in English, invited ("*Il Palio è una follia*, it's madness. What do you think?") | no | they do, in English; it stands, nothing comes back to say; the character can turn it later with more of the language |
| Free | no | they do |

Out: three or more answers (crowds the screen); one word missing with words to choose (a puzzle); and, as unrealistic classroom exercises no one does in a bar (Josh): repeat after the character, finish the character's sentence, a key word only, a hint in English only, a listening turn, catch the character out. Not yet judged: build it from two pieces.

**What you read, you can understand** (Josh, 2026-11-09, a principle, not a rule): an answer to read is understood either from the English under it or because the character just said it in English ("Do you like blue (*piace blu*) or yellow (*piace giallo*)?" then bubbles "Mi piace blu / Mi piace giallo" need no English). The failure: two sentences in the language with no English, then one bubble in the language ("Sí, azul y amarillo. Y también hay rojo, abajo. ¿Le gusta más el azul o el rojo?" → "Me gusta más el azul."). Reading something you don't understand "feels odd and coercive"; a single answer to read feels weird. So bubbles are two; in clusters 1–2 every phrase is spoken with its English (code); the English under the bubbles stays for now and is the natural thing to drop once the glossing holds in play. An answer the character sets up in speech may be in the language only (it's heard, not read).

**The answer set up inside the character's line is out for now** (Josh, 2026-11-09: "what feels most odd is not knowing what you are saying. I can't tell what the dialogue is that goes with 'You could answer me with: …'"): the lead is English, so heard and not shown, and the answer sits unmarked inside the character's Spanish bubble. It comes back only with a screen design Josh has seen. Cluster 1 is Beginner 1's S1: two answers with English, every turn.

## Measuring

**The reply table** (Josh's experiment on the Nunzio visit, Palermo, 52ae014d): the learner's reply, judged against what the character asked.

| Exchange | Score |
|---|---|
| English asked, English answered | ~+1 |
| Language asked, offered answer read back | ~+1 |
| Language asked, answered in English | +2 |
| Garbled attempt | +2 |
| Own words in the language (a reply built from the character's glossed words included) | +3 |
| Uptake or self-correction | +4 |
| Silence | 0 |

Nunzio visit: 40 over 13 replies.

Why reading back scores below an English answer (Josh, 2026-11-09): reading a bubble takes less of the language than answering the character in English, because the bubble's English is under it and the learner can pick and read without understanding the character; an English answer to her question shows they understood the character.

**Content, counted in code** (no judge, any language): words per turn, unique words per conversation, number of turns. Nunzio: 14 turns, 31.4 words a turn, 229 unique; Josh: 13 turns, 14.8 words a turn, 108 unique (1,038 bytes against 2,475).

**Next experiment:** compute both over all real conversations. Do they rise across visits? Do they tell the players apart (Josh, Jennifer)?

## The reply ladder

How the learner's reply is set up, ordered by how much of the language it takes (ordinal, not weights; Josh, 2026-11-09):

1. one bubble, with English;
2. two bubbles, with English (they choose, by the English);
3. one bubble, the language only;
4. in the character's dialogue, glossed (caught by ear, meaning given);
5. two bubbles, the language only (choosing means understanding both);
6. in the character's dialogue, the language only;
7. an English answer the character invites (they understood the character);
8. built from the character's glossed words (their own sentence);
9. free.

Unsure: 3 against 4, and 5 against 6 (is hearing harder than reading for a beginner? the order assumes it is).

**Clusters, not single rungs** (Josh, 2026-11-09: "the rungs might be more like which cluster of turns are in play. they may overlap"). A learner is never on one setup: a few neighbouring setups are in play together, and neighbouring clusters overlap. Seven clusters, each three neighbouring setups, sliding one setup at a time (Josh: four clusters would be too fast; stretch to 6–8):

| Cluster | Setups in play |
|---|---|
| 1 | 1 · 2 · 3 |
| 2 | 2 · 3 · 4 |
| 3 | 3 · 4 · 5 |
| 4 | 4 · 5 · 6 |
| 5 | 5 · 6 · 7 |
| 6 | 6 · 7 · 8 |
| 7 | 7 · 8 · 9 |

At an offer every 3–5 conversations that count (3 or more replies from the learner; opener-only visits don't), Beginner runs about 21–35 conversations before Intermediate if every offer is taken.

**One ladder, three uses** (Josh):
- **Measure:** a reply counts by the setup it was given on and how they answered it; progress shows as handling the higher setups in the cluster.
- **Taking scaffolding away:** each progression offer moves to the next cluster: the lowest setups drop out, the next ones come in, so the change is gradual and some turns still feel familiar.
- **Choosing each turn's setup:** the code picks from the current cluster, mixed and seeded (more of the higher setups as the visit goes well, the lower ones after a breakdown). Code chooses the reply setup; the character chooses their move.

## Progression

**Offer, and the learner decides** (Josh, 2026-11-09: "the simplest is after 3-5 conversations, propose taking away scaffolding and let the user decide"). Beginner 1 has a fixed playlist of stages and a moving-up rule that has fired once in 185 records; Beginner 2 replaces both with this.

- **When:** after every 3–5 conversations at the current setting, asked once, at the end of a conversation.
- **What:** the next cluster of the reply ladder (above), named by what drops out ("no more English under the answers?"); past the last, the full conversation (Intermediate).
- **Yes:** the next conversation plays that way. **No:** asked again after another 3–5.
- **No going back for now.** A learner who needs more help asks for it in the conversation, and the character gives it, as Beginner 1 characters already do.
- **The reply table and counts** are for looking at (does it rise, do the players differ), not a gate.
- **The step-up screen** (Josh, 2026-11-09, to build 2026-11-10): a plain screen, shown after a conversation, when the game would move the learner on to a new city. Claude decides when it shows, from whatever there is for level or score. Two choices: go up, or stay here. Not shown again until the next interval. No setting. A mockup first (CLAUDE.md: Josh sees one quick look before it's built out).

## Next after the step-up screen: a folksy echo (Josh, 2026-11-09)

Josh: "we should aim to improve the echo. Its sentence for sentence. We should figure out how to make it more characteristic and folksy." Today the English after each phrase is the code copying the phrase's literal `en` (glossAll on every cluster-1 turn, questionEcho on ~6 in 10): a subtitle read aloud. What Josh means (2026-11-09, correcting Claude's first reading of asides and explanations): the English woven into the sentence where it matters, as the character speaks: "El Andador es el corazón de la ciudad, the heart of the city…" (Josh's example, which worked; "Estoy preparando, I'm preparing, las velas, the candles…" was not a good one: every chunk echoed). The key phrase gets its English, and the sentence carries on; not a whole sentence followed by its translation, and not every chunk. Asides in the character's voice are good too, with the warm words kept in the language inside the English (Josh: "yes - but nona"): "¿Le gustan? You like them? My abuela made them this way." / "My nonna made them this way." And a check that they followed ends on a short tag in the language (Josh): "La Parroquia, the big pink church, ¿la ve?" / "…si vede?" And English as the character's own explanation, not a translation (Josh: "good"): "Hoy hay mole. It's a sauce, very dark, chocolate and chiles; you must try." Likely route: Claude writes that English in character as part of the reply; code fills English only on a turn that has none. A prompt change, so a test: the same visits with the code echo and with the character's own English, read for whether the learner still follows and whether it sounds like a person.


**2026-11-10:** after B2-E to B2-E4, Josh's next direction is a summary after a stretch of her talk and an English thought inside her line: [summary-and-mixed.md](summary-and-mixed.md), card B2-E5.

### The examples, and what they share (2026-11-09)

1. The key phrase echoed: "El Andador es el corazón de la ciudad, the heart of the city…"
2. An aside, with the warm words kept in the language: "¿Le gustan? You like them? My nonna made them this way." (Mexico: "My abuela…")
3. A check that ends on a tag in the language: "La Parroquia, the big pink church, si vede?" (Mexico: "¿la ve?")
4. English as the character's own explanation: "Hoy hay mole. It's a sauce, very dark, chocolate and chiles; you must try."

The four examples work because the English does a different job each time. None of them translates the sentence.

**Patterns in the four**
- English follows a fragment, not a sentence. It comes in the same breath, right after the one word or phrase it serves (1, 3).
- The language keeps the warm and functional words: questions, tags like "¿la ve?", endearments. English carries the nouns and explanations (2, 3, 4).
- Each English piece adds something. It names a thing (1), says something new (2), checks understanding (3) or explains (4).
- The learner can ignore the English. The Spanish stands alone, and the English is a hand held out.
- There's at most one English piece a line. That keeps it sounding like a person.

**More lines in the same spirit (Mexico)**
- Naming one word: "Esto es tejuino, a cold corn drink, de Jalisco."
- A reaching-for-the-word moment: "Es muy… how do you say… picoso. Spicy, ¿eh?"
- Pointing: "Mire, ahí, el volcán, the volcano. Es el Popocatépetl."
- Explaining, with a Spanish tag: "Las gorditas llevan masa de maíz. Like a thick little tortilla, stuffed. ¿Quiere una?"
- A quick English reaction: "¡Ay, qué bueno! Good choice. Ahora se lo preparo."
- The word, then using it: "Esto se llama comal, the griddle. Ahí las pongo."
- Options in English, question in Spanish: "¿Rojo o verde? The red is milder."
- A personal aside, with the Spanish kept: "Mi abuelo bolea aquí desde hace cuarenta años. He taught me everything, ¿sabe?"

Italy equivalents: "Questo è il pecorino, sheep's cheese, di Pienza." "È un po'… how do you say… piccante, eh?"

**Where this fits the app.** Patterns 1–4 already fit the existing parts format, which has a word part followed by an English part. The difference is that the English is short and does a job, instead of being a full gloss. Mixing English into the middle of a line, as in "muy… how do you say… picoso", needs a closer look at how the line is spoken and shown.

## The prompt

**History** (2026-11-09): `beginner.md` grew from 502 to 1,245 words in two weeks over 19 versions, each fixing what the last one showed and none removed; with the shared `dialogue.md` and the stage blocks a Beginner turn gets 1,559–1,730 words before the conversation (the Intermediate character prompt is 534). Of its 31 units (`docs/beginner-prompt-inventory.md`) 9 were ever measured; the stage blocks measured no change. The same characters come alive at Intermediate.

**Approach** (Josh: "mostly sounds right"):
1. **One prompt for every level, the differences as values filled in per turn** (Josh, 2026-11-09: "I like that in that improvements can spread and special cases are scrutinized"). The shared character prompt (today's Intermediate one) plus:
   - **the level line** (Beginner 2: "They are just starting to learn {language}. You speak {language}, as you always do, and you know enough English to help a newcomer follow: explain something in English when it helps, give a word in {language} and then use it, and come back to {language}. Keep what you say in {language} short and about what's happening here. Ask one thing at a time, in {language}.");
   - **the reply setup line**, from the code's pick in the learner's cluster: two answers · one answer · the answer inside what you say · gloss the words that matter and give no answers · invite an English answer · give no answers (Intermediate: always the last). With or without English under the answers is display, not prompt;
   - **the rules that only bite when answers are offered:** leave their facts blank (…), never made up; one idea per answer, as short as a local says it; say each thing once;
   - **the parts output format**, of which Intermediate's line and translation is the simple case.

   Every improvement then reaches every level, and anything special to one level has to be argued for. **Order:** Beginner 2 first, on the shared text with its own level and setup lines; Intermediate stays as it is (production untouched) until Beginner 2 wins on Josh's phone, then moves onto the same prompt as its own tested step.
2. **Structure in code and the output format, not prose:** the parts, the reply setup from the cluster, one question a turn.
3. **Back in only what earned it:** the measured units (the learner's facts left blank, one idea per answer, say each thing once, answers as a local says them).
4. **Patches that memory now covers stay out** (Josh): repeats across visits and things told again are `memory.md`'s job since 2026-11-07a/08a.
5. **No de-scripting by instruction** (Josh: attempts to de-script mostly failed): variety comes from the code's reply setups and the character's moves, not from "vary your turns".
6. **The English and gloss failures are real and make the app feel broken** (Josh): an echo that repeats the same word (*caffè*, "coffee"; a name glossed as itself), and both forms then English (*benvenuto, benvenuta*… "welcome"). These need a fix that holds: in code where it can be (drop an echo that is nearly the same word as what it glosses, by spelling, any language), and the learner's gender in the setting so she uses one form.
7. **The safety net:** each dropped unit's original moment goes into `tests/experiments/moments.json`; the new prompt is run on them against Beginner 1's. That is the test card.

## Beginner 1 rules Beginner 2 breaks

1. **English: brief** (`beginner.md`: at most two short sentences) → English whenever it helps the newcomer (explaining, a word, a rescue); the character still speaks the language.
2. **English only when asked** → the character invites an English reply when the learner is unclear.
3. **English reply = lost** (`conversation-record.ts` `feltOf`: lost on 40% or more of turns = hard) → an English reply is communication (+2).
4. **Said back doesn't count** (`RULES.countedOwnTurns`: 3 own-words turns) → every reply counts, reading included (+1).
5. **Stages turn English down** (`leveling.md`; S3 English only when asked; S4 none) → the amount of English isn't the level.
6. **Errors are only "own words"** in the record → uptake and self-correction score +4.

The earlier spec's section-by-section list is in [beginner-plan.md](beginner-plan.md) → "Production rules this overrides".

## Carried over, to rethink before use

In the `../fuori-beginner-shapes` worktree, uncommitted:
- **The heard-note fix and its test** (offered answers kept through `/v1/turn`), for Beginner 2 only.
- **A turn-shape picker** (`lib/beginner-shape.ts`) and a short prompt (`beginner-shapes.md`). They came before the decisions above. Decided for it so far: a new pick every turn, seeded by conversation and turn number, the opening by learner, place and day. Its six mid-conversation shapes, five ending in a question, are too few; shapes should come from the moves above.
- **Card B1** (Reviewed: pending); the test designer asked for changes.
