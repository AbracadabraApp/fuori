# Dialogue ideas

Ideas about how conversations with characters should go: what they say, when the learner speaks, how the scene moves. Started by Josh on 2026-11-04, after playing Florence (Ardit at Trattoria Mario, Lorenzo in Piazza Santa Croce). Nothing here is scheduled. An idea moves to the roadmap once Josh decides it. Josh's words are quoted; anything else is marked as Claude's proposal.

## Index: open and fixed (sorted 2026-11-12)

Status from the entries and the day's commits; "not checked" means nobody has looked at it against today's game. The entries below are unchanged.

**Open**
Bugs moved to [bugs.md](bugs.md) on 2026-11-13 (the entries below stay as the record): the character asks and carries on (B6), the receipt gate (B22, confirmed fixed), a character who steps away comes back (B17), "Stay within your job" (B18), a correction for something said right (B19), "Say this" adds things (B20), a voice that changes mid-line (B21), long Intermediate replies (B13). Still here as ideas:
- Open-ended talk doesn't need a question every turn: now part of the bids model (a statement can be a bid; dialogue-structure-reference.md § 1a).
- Managing the lesson out loud: not checked.
- Comment or question, and what the bubbles offer (Josh, 2026-11-14): entry at the end of this file; the detail is in [questions-and-bubbles.md](questions-and-bubbles.md).

**Fixed or overtaken**
- "Are you new here?" in almost every opener: character.md 10q; beginner.md 12a (2026-11-12); the intro asks about what it told.
- The same invitation every other turn: the invitation removed from every step (Josh, 2026-11-10: "you can just remove the ask question").
- A Beginner turn says the same thing three times: beginner.md 2026-11-05c (the old Beginner).
- Beginner S2 is too much: the old Beginner's stage; overtaken by the cut-over (2026-11-12).
- A cultural lesson never says what its topic is: culture.md 2026-11-06.
- Tommaso's coffee in Florence: fixed 2026-11-06.
- Beto, San Miguel: the taxi driver's order fixed 2026-11-06 (dialogue.md "Stay within your job"); the entry's other items not checked.
- Corrections: not every time: dialogue.md's shared rule (2026-11-05).
- Magda says "Almost!" to a line that wasn't the offered answer: the shared mishearing rule (2026-11-05); not checked since.

**Analyses and tools, kept for reference:** the two top 10s (2026-11-08) and why Beginner conversations read flat moved to [play-readings.md](play-readings.md) on 2026-11-14; here: kind and lively places, carbonara without cream, the examples as a replay set.

## The receipt gate: a planted procedure took over a visit (Giulia Cusimano, Bar Alba, Palermo, 2026-11-12 00:02 UTC; Intermediate 2026-11-10q)

The example for the lesson in dialogue-model.md ("Whatever is in the setting gets said, almost every visit"), in its worst form: not a talking point but a gate. Five hand-written bar characters had the same sentence in their here line: "Whoever comes to your counter has already paid at the cassa and hands you the scontrino; you take it and make what they paid for" (Luisa Cocco and Sandro Pieri in Rome, Bar Nilo in Naples, the Naviglio bar in Milan, Giulia in Palermo). The game has no cassa to go to and no receipt to hand over.

- Josh chose the brioche col gelato on his first line. Giulia asked for the scontrino or sent him to the cassa in 9 of her 17 turns, from her second line on, and refused to make it: "Io qui non posso incassare, mi serve lo scontrino."
- 7 of his 17 turns were about it (where the cassa is, nobody's there, "non posso ricevere lo scontrino", "le casse non esiste", "devo fare qualcosa altro"). He never got the brioche; the visit ended with "Se torna più tardi, la brioche col gelato la facciamo volentieri."
- The good stretch was his: he brought up the panino, she named it (pani câ meusa), explained maritata and schietta, and asked which he prefers.
- The shared rule in dialogue.md, "never ask for something they've had no chance to get", was in the prompt and lost to the setting fact, as the planted lines did in the November tests. Rome's version of the sentence even said "so you never send them to pay"; Palermo's didn't. The intro (live since 2026-11-11) made it worse: her opener set the brioche up as the thing to do, so the gate stood in front of the one thing the visit was about.

**Done the same day (Josh: "do both"):** the sentence removed from the five here lines (content, not prompt, so no card). Still planted elsewhere: Rome's customs list ("Pay at the cassa first, then order at the bar with your receipt", roma-nuova.ts) and the Beginner 1 prompt's example ("Here you pay at the till first"); left as they are. General point for the shape work: a setting fact that describes a procedure the learner must complete is a gate, and a gate needs the place and the object to exist in the game, or it has to go.

## The character asks and carries on, as if answered (Josh, 2026-11-11; heard before this morning's build)

Josh: "it does seem to still go past character - learner. sometimes character - learner - character - learner. sometimes character - learner. character." Counted in the archive's saved conversations since 2026-11-05 (22 conversations, 219 character turns, lessons and onboarding left out; all before the intro and the shape table, 104ffe9):

- **The character never takes two turns in a row:** 0 consecutive character turns. What Josh hears is inside one turn.
- **At Intermediate, 13 of 67 turns ask and carry on.** Six ask twice: Nino, "Or maybe you have to run now? Vuole un altro caffè o va via?"; Giulia, "What can I get you this morning? Vuole un caffè o un cappuccino?". Seven ask, then continue as if answered: Nonna Gina, "Ah, e chi sei tu, bello? Siediti qui vicino a me, sotto la tettoia, che piove a dirotto! Io sono Gina…"; Lorenzo, "Eppure parla ancora bene, sa? Le parole tornano…"; Maurizio, "Hai già visto il cucù? È il gallo di terracotta che fischia, porta fortuna." The character plays the learner's side in its head and goes on. character.md already says "No more words after a question mark"; breached about one turn in five.
- **At Beginner there is no clean count yet:** the English echo after every question is words after the question mark (52 of 320 turns by the raw count, mostly echo and the "you can answer me in English" line). A clean count skips the question's own English and the invite line.

In terms (docs/dialogue-structure-reference.md): an Ask (T5) that isn't last, or two Asks in one turn. Where it could be held: it's a shape fault, so a row in the shape table or a code check at Intermediate (the reply is one string; a question mark is a signal in any language), not another prompt sentence. The intro (104ffe9) already guarantees it by format: the question is the last sentence. **Not to fix until Josh has played today's build:** the intro and answer-first change what the first turn and the question turns look like. Examples to add as they come.

## The same invitation every other turn (Renata, Palacio Nacional, 2026-11-10; Beginner 2 cluster 1)

5 of 9 turns after the opener were "Is there anything you'd like to know about my work, this palace, or the town?" in near-identical words; Josh: "Creo que preguntaste esa pregunta antes", "Usted me hizo esa pregunta tres veces". Causes, all scaffolding: cluster 1 picks evenly among two answers, questions to ask and the invitation to ask, so two turns in three invite curiosity; both setup lines name "your place, your work or the town", which the character repeats; and after the learner's own question the setup forces another invitation instead of a follow-up. Fix prepared on a branch (setup mix weighted to two answers, no invitation twice in a row or right after the learner asked, lines without the list), held until Josh's round on 2026-11-10k is done.

## "Are you new here?" in almost every opener (2026-11-09)

Beginner 2, Mexico: Lupita "Are you new in Tlaquepaque?", Doña Chayo "¿Es su primera vez en Puebla?", Arturo "¿Usted es nuevo en Oaxaca?", Chuy "¿Es su primera vez en Puebla?". Josh in play: "Everyone asks if you're new"; "I tell everyone yes because everyone asks". Cues in what the character reads: Beginner 2's scaffolding called the learner "a newcomer" twice (removed 2026-11-10i and 10k); the dialogue's character.md says "They're living in {country} for a while" with "You haven't met them before" (a first meeting with someone who lives here invites "are you new?"). The dialogue line is shared with Intermediate: noted, not changed, until the scaffolding change has been played.

## "Stay within your job" turns away a question about the town (2026-11-09)

Lupita, the sacristan in Tlaquepaque, invited a question about "the church, my work, or Tlaquepaque"; asked "What do people eat here for breakfast?", the character answered "Good question, but I'm the church lady, not a cook! For breakfast, ask at the market…" (a look, Beginner 2). The shared rule ("Stay within your job: never serve, sell or take an order for what it doesn't give") is about selling; telling a newcomer what people eat in town is a local's knowledge, not a sale. Dialogue layer (dialogue.md, every level): noted, not fixed.

## Managing the lesson out loud (Josh, 2026-11-09)

Lupita, the sacristan in Tlaquepaque (Beginner 2, cluster 1), after the learner's garbled line ("El rey es latino"): "Sorry, Joshua, I didn't quite catch that. Maybe the words got mixed up. No problem! Let me ask something easy about the church." Josh: "unnatural speech… It sounds like a teacher managing the lesson rather than a local." The other case, "Here are two things you could ask me:", came from Beginner 2's setup line and was rewritten in role (scaffolding.md 2026-11-10g; Josh's model: "Are you wondering about the church? about my job? about the city?"). This one is the character's own recovery from a garbled line: dialogue layer, noted, not fixed.

## Beginner S2 is too much: little English, Italian back to back (Josh, 2026-11-09; noted, not to fix)

Josh played Hugo, the muralist in Puebla (Mexico, Beginner 1 at stage S2, `beginner-2026-11-07a+S2`, 2026-11-09 23:51 UTC): "not enough english and speed feels fast"; "it was too much - just to note - not fix". Per turn: about 4 words of English and 16 in Spanish, against 14–17 English and 8–11 in the language in his S1 conversations in Italy the night before (Paolo, Giulia, Nino). With English cut, her Spanish sentences come one after another with nothing between them, which is what reads as fast:
- Hugo: "These walls are the neighbours' own house fronts, painted together with them. | Hola, buenos días. Bienvenido a Xanenetla. | Me llamo Hugo. Soy muralista. | ¿Cómo se llama usted?"
- then "Mucho gusto, Joshua. | Aquí pinto todos los días. | Es mi barrio, mi casa. | ¿De dónde es usted, Joshua?" (no English at all)

The cause is Beginner 1's stages turning English down on a schedule (`leveling.md` S2: about half in the language, English one sentence), one of the rules Beginner 2 breaks (docs/beginner-2.md → Beginner 1 rules Beginner 2 breaks, 5). Left as is in Beginner 1 (production untouched); the comparison is Beginner 2 on the same place.

## A character who steps away comes back

Josh, 2026-11-04: "when the conversation is open ended like Lorenzo - no questions is fine - but when the waiter says your soup will be ready soon - you imagine he's coming back - not waiting for chitchat". Before that: "so many waits with no reason to say anything".

What happened: Ardit kept saying "torno subito" and "arriva subito", and the mic opened each time with nothing to answer ("Grazie", "Grazie", "No").

- **Claude's proposal:** the reply gets an optional `away` flag that Claude sets when the character steps away for a moment. The mic doesn't open; after a short pause the character comes back with the next line ("Ecco la ribollita, calda calda"). Works in any language, no phrase lists. Needs a prompt line, a server change and an app build. Test: Rome's shop, bar and trattoria scenes come back instead of stalling, and open scenes don't change.
- **Tried and dropped:** "Always leave them something to answer." added to the character prompt (`tests/experiments/archive/dead-ends.mts`, 2026-11-04). Lines with no question 26% → 4%, dead ends 14 → 1, but it makes the waiter stay and chat, which Josh says is the wrong fix. Two-question lines 16% → 18%, forced questions 1 → 3.

## Open-ended talk doesn't need a question every turn

Josh, 2026-11-04, on Lorenzo: "when the conversation is open ended like Lorenzo - no questions is fine". A statement the learner can react to (Dante's statue, "Bologna, la dotta, la grassa") is a fine turn.

## Corrections: not every time

Josh, 2026-11-04: "its ok not to get corrected all the time - also when that correction line comes up it doesn't always hear well". Speech-to-text mishears, so a recast can correct something the learner never said. The end-of-conversation review already lists real errors ("sono molto fame" → "ho molta fame").

- Open: when a character does correct something that was misheard, find the moment in the transcript and see what speech-to-text heard.

- **Fixed 2026-11-05 (6aae025), every conversation, both countries:** one shared rule (`content/<country>/prompts/dialogue.md`): recast only when clearly heard, not every time, never pronunciation; the character is told when the learner said an offered answer back (close counts). Replay (`tests/experiments/heard-replay.mts`): Magda coaching Jennifer's misheard lines 8/8 → 0/8.

## A voice that seems to change mid-line

Josh, 2026-11-04: "Lorenzo's voice seemed to shift between two people". Each line is voiced in two parts (the first sentence early, for speed, then the rest), and the second part already gets the first part's text (`previous_text`). Re-voicing four of his lines: the two parts are within 3 dB in loudness; pitch not measured.

- **Claude's proposal:** if listening to the clip pairs confirms the shift is at the join, try a steadier voice setting (stability 0.5 → about 0.7), at some cost to liveliness.

## "Say this" adds things the learner didn't say

Josh, 2026-11-04: "with Lorenzo corrected to say something I didn't want to say - that this was my first time in Italy"; earlier, "when that correction line comes up it doesn't always hear well". The line is "How do I say it"'s *say this* (`format=sayit` in the admin route).

Two examples from his Florence evening (learner 3c544022):
- 04:30 UTC, Lorenzo had asked "è la prima volta in Italia?". Josh answered in Italian (roughly "Piove come Londra… molto per qualche mese, ma non per un anno"); the English hearing came back as "The city is a little bit like London…". Shown: "Sì, è la prima volta. Seattle è un po' come Londra: piove molto, ma qui c'è il sole!": it answered Lorenzo's question for him, wrongly.
- 04:24 UTC, trattoria: heard "And now it's time to ask." Shown: "Mi scusi, posso farle una domanda?", which he didn't mean.

Two problems, each needing more examples before any change (Josh: "add everything to your list until you have more examples"):
1. It fires on mishearings: Josh was speaking Italian, and speech-to-text turned it into English.
2. It adds content: even when the hearing is right, *say this* should put the learner's own words into the language, never answer the character's question for them.

- **Fixed 2026-11-05 (6aae025):** *say this* only puts the learner's own words into the language and never answers the character's question (say-it.md); it's Beginner only, so from Intermediate what they said goes to the character as said. Lorenzo's "prima volta" didn't come back in the replay on either the old or the new code (0/4 both), so the fix is not measured.

## A correction for something the learner said right

Josh, 2026-11-04: "i got corrected with the ribollita". The transcript has "Si, vorrei la ribaletta" (speech-to-text) and Ardit's recast "Ribollita, ottima scelta!". If Josh said it right, the recast corrected a mishearing. Collect more examples before deciding anything.

- **Covered 2026-11-05 (6aae025)** by the shared rule above (recast only when clearly heard). Not reproduced in the replay on the old code (0/4), so not measured.

## Long replies in open-ended talk

Lorenzo, Piazza Santa Croce, 2026-11-04: median reply 28.5 words (Ardit at the trattoria: 14). Observed by Claude, not raised by Josh; listed to see whether it comes up in more conversations.

## A Beginner turn says the same thing three times, with no pauses

Josh, 2026-11-05, hearing Luisa's opening on the simulator (laptop fallback voice): "totally incoherent, repetitive with no pauses"; "it was a total wipeout"; and "cafe, coffee, cafe". Her one turn, as the voice reads it (S1, local server, beginner.md 2026-11-05b):

> "This is Bar Mattina, a corner bar in Testaccio, the old slaughterhouse district. Here you pay at the cassa first, then you come to the counter. Buongiorno! Sono Luisa. Prima la cassa, per favore. first, the cashier Vuole un cappuccino o un caffè? cappuccino or coffee?"

On screen: "Un cappuccino, per favore." / "Un caffè, per favore." with "An espresso, please." under the second.

What went wrong, as observed:
1. The same thing three times: "pay at the cassa first" in English, "Prima la cassa" in the language, then the gloss "first, the cashier".
2. caffè, coffee, caffè: the question, its gloss, then the answer; and the English disagrees ("coffee" in the gloss, "An espresso" under the answer).
3. No pauses: the parts are joined into one string for the voice, and the glosses have no punctuation, so it runs straight on ("per favore. first, the cashier Vuole").
4. On the laptop the fallback voice reads both languages in one accent, which makes it worse; on the phone ElevenLabs reads the same string.

Not from today's answer change: every Beginner turn has been built this way since 2026-10-25 (English intro, a part in the language, a whispered gloss).

- **Fixed 2026-11-05:** say each thing once, greet in one language, a name once, no doubled key word at stage 1 (beginner.md 2026-11-05c, leveling.md 2026-11-05b); a sentence break after every spoken piece, and no English echo of her question when answers are shown (lib/beginner.ts → lineFromParts). Replay set: repeats Italy 12/12 → 2/12, Mexico 15/16 → 0/16; run-on 4/12 → 1/12 and 9/16 → 0/16.

## Magda says "Almost!" to a line that wasn't the offered answer

Seen by Claude in the replay set (2026-11-05, 1 of 4 runs): after Jennifer's "¿Cómo me ayuda?" (the offered answer was "Joven, ¿me ayuda?"), Magda opened "Almost! Now you're asking a stranger for help." The shared rule says to carry on without correcting or commenting. One example; listed to see whether it comes up again.

## The examples become a replay set

- **Started 2026-11-05:** `tests/experiments/archive/replay-set.mts` replays Luisa's and Doña Chela's openings, Jennifer's Magda lesson and two more stage 1 openings per country, with a judge on what the voice says (repeats, run-on). `tests/experiments/heard-replay.mts` replays the mishearing cases (Magda's coaching, Ardit's ribollita, Lorenzo's *say this*). New examples go into one of the two.

Claude's proposal (2026-11-04, from a Karpathy-inspired prompt template Josh shared; Josh: "Worth saving any notes/ideas?"): once this list has a dozen or so real examples, turn them into a fixed replay set: the conversation up to the moment, and what should or shouldn't happen next (the waiter comes back; *say this* doesn't answer for the learner; no recast of a mishearing). Any change to the character prompt or to *say this* is then measured against the same cases before it ships, alongside `test:conversations`.

## A cultural lesson never says what its topic is (fixed 2026-11-06)
Josh: "The Palio guy is a good bad example. Check Jenn's transcript"; "Cultural lessons need to explain the topic clearly at the start"; "there is no topic sentence". Jenn, Beginner, Giovanni Bacci's drappellone lesson (2026-11-06, culture.md 2026-11-05b). He opens "Come in out of the rain! In the Palio, the prize isn't money: it's a huge banner…" and asks "Ha mai visto una corsa o un palio?", but never says the Palio is a horse race. Contrada and the Campo are never explained, and he ends with "Come back when the sun is out and I'll show you more".
- **Fixed:** culture.md 2026-11-06 (both countries), Story: first turn. The first sentence names the topic and says what it is; then where and when, and what the story depends on. Replayed as a Beginner: "The drappellone is the prize of the Palio, Siena's famous horse race, run here in the Piazza del Campo every 2 July and 16 August. Each contrada, a neighbourhood of Siena, sends a horse…". Across the set, clear at the start went from 8/18 to 17/18 in Italy and from 12/20 to 19/20 in Mexico (`tests/experiments/culture-opening.mts`). Replay a single item with `tests/experiments/culture-story-trial.mts <item id>`.

## Beto, San Miguel (Josh, 2026-11-06, Beginner S2): "Many conversation issues"
- **His goodbye didn't end it (fixed 2026-11-06).** Five goodbyes; each time Beto said goodbye back, then "¿Quiere escuchar a los mariachis?", "¿De dónde es?". Now the reply carries done, he says goodbye with nothing new, and the screen closes (dialogue.md 2026-11-06, `tests/experiments/goodbye-done.mts`).
- **A taxi driver took a torta order.** "I can't make you one, but I know a good spot… ¿Quiere la torta con queso o con jamón?"; Josh: "¿Por qué estás tomando mi orden?". Fixed 2026-11-06: dialogue.md "Stay within your job" (served food 2/10 and 1/10 before, 0/20 and 0/20 after; `tests/experiments/job-drift.mts`).

## Tommaso, Florence (Josh, 2026-11-06, Beginner S1): "Coffee dialogue in Florence" (fixed 2026-11-06)

- Out of order: "Preparo il suo caffè adesso", "Macino i chicchi", "Un macchiato, subito!", then "you pay at the till first, then bring the receipt to the counter", then "Allora, ha lo scontrino?" (he never went), then "Ecco il suo macchiato". Josh: "perché non cominciare alla cassa?"
- The same tips at every bar. Josh: "Sì, ma perché ogni bar ha detto le stesse cose? In genere è cappuccino solo in mattina o paga a casa."
- Fixed on the shared layer: dialogue.md 2026-11-06b (what happens follows what you've said; tell how it works at your place, not the customs every bar repeats). Josh: "We should have cashiers or customers with receipts"; one conversation per person, so receipts: five busy counter bars say the customer has already paid.
- Not fixed: a mishearing ("Grazie a tutti!" for what Josh said was "al banco, grazie") answered by asking again; fine as it is.

## Kind: how it's used, and what makes a place lively (2026-11-08)

**How kind is used today** (read from the code):
1. **In the prompt it's one word in brackets.** The character's setting reads "Pizzeria Da Gigi (pizza al taglio), Testaccio", then the here line (`lib/characters/for-place.ts`; added 10-29 so nobody gets an invented job). No rule depends on it and nothing describes what goes on at a bar as opposed to a piazza; the commerce rules leave the model to work out from the role and that word whether anything is sold.
2. **Elsewhere it's mechanical:** the place feed avoids two of the same kind in a row; lessons pick practice partners by matching kind text; the app gets it with each place.
3. **Kinds are free text from the generator, and messy.** Italy: 654 places, 78 kinds, with duplicates (wine bar, wine_bar, enoteca; station, train-station; restaurant, ristorante) and generic ones (bar 119, bakery 62, market 59). Mexico: 75 places, 28 kinds, specific (shoe-shine stand, tlayuda grill, chocolate-mill, ceramics workshop).
4. **Real play is nearly all commerce:** of 89 real conversations, about 75 at a bar, bakery, market stall, café, osteria or shoeshine stand; about 12 at a piazza, park, church, university or landmark.
5. **The Beginner prompt adds a place opener; Intermediate doesn't** ("Open with one line in English about the place… sometimes a bit of its history"), which is where the guidebook openings in the Beginner top 10 come from.

**Josh's hypothesis:** "I don't know what kind does, but I bet church steps are more lively conversation than a bar. A salumeria more than a pharmacy." What might make one kind livelier than another (Claude, building on it): time to stay (no queue behind you); something to show or taste; a craft the person is proud of; the place's own story; a talker by nature. Roughly: liveliest steps, piazza, park, market stall, salumeria, shoeshine stand, osteria in the quiet hour; in between bakery, gelateria, café, bookshop; flattest bar at the counter, pharmacy, tabaccheria, ticket office. Fits the lively ones seen (Nonna Gina on the steps, Lorenzo with his dog, Chucho at his stand, Franco at his stall, Nunzio in the park). A hypothesis, not known: too few real conversations away from commerce.

**Place types shown in Italy over time** (`content/it/showcase.ts`). Josh had said the easiest way to reduce boring talk was to remove boring places; it was done:

| Date | Shown | Everyday business (bar, pharmacy, bakery, gelateria…) | Open space or landmark | City's own (market, deli, workshop) | Restaurant |
|---|---|---|---|---|---|
| Oct 14 | 230 | **56%** (40 bars, 18 enotecas, 13 pharmacies) | 13% | 21% | 9% |
| Oct 27 | 207 | 48% (bakeries and wine bars hidden) | 15% | 25% | 10% |
| Nov 5 | 212 | 46% | 18% | 25% | 9% |
| **Nov 6** | 226 | **27%** | **38%** | 24% | 9% |
| Nov 8 | 218 | 28% | 39% | 22% | 9% |

The big change was Nov 6 (a431cd9, Josh's approved list in `docs/archive/conversation-variety.md`). Real visits since then are too few to tell whether it worked (4 by 11-08, all Josh's: a bar, a pastry shop, a market, an osteria), and both top 10s come from before it.

**Display order.** Josh's picks matched the first cards in a fixed feed order (11-08: "I think it probably says more about display order"), so what gets played says as much about order as about appeal. Since b31c916 cities and places come in a new order each day, unvisited first, with an open space in the first three.

## Carbonara without cream: one character's here line (2026-11-08)

Of 6 conversations with "carbonara, never cream", 5 are Nino (trattoria-garbatella, 11-06 to 11-09), every visit; the other is Franco (10-20). Nino's here line asks him to tell a newcomer about his menu "dish by dish… what the tourists get wrong", and carbonara is his dish. Not a habit of every character; one line pointing him at it. Logged only (Josh: mechanics before dialogue).


## Mixed dialogue: the English and the language together (Josh, 2026-11-13)

Josh: "Need to get mixed dialogue working better." The Beginner turn, mostly English with the language slotted in as whole phrases (CLAUDE.md; docs/dialogue-model.md → Beginner goals), and the step-by-step move to less English. Already on the screen list as "the English/Spanish mix to improve" (progress.md, 2026-11-12, item h). What play shows today is in docs/bugs.md: B1 (turns with no English), B7 ("mucho mucho inglés por favor", "puede hablar más despacio?"). Josh's examples of what "better" means: to collect.
Josh, again after play the same day: "Need to get mixed dialogue working better." With it: "Some character adapted to use more English" (kept, bugs.md) and "Intermediate didn't back off" (B13).

## Josh's dialogue ideas, 2026-11-13 (after play)

Not decided; nothing built. Josh's words as written.
- **The intro, rethought.** "the intro concept doesn't win, but parts of idea were good. First turn shoulld offer something that iss a break from getting quizzed, but in character mode - no subtitles or sheet. For it to work the english/spanish mix needs to be good." (bugs.md B23: the intro long and passive.)
- **Return visits about something else.** "return visit intros and dialogue should be less about something and more about something else. The obvioud first is less about job or weather, more about the culture or family or something else." (Close to "characters tell their own story", ideas.md.)
- **The character asks the learner a favor: say it in English.** "another dialogue to to consider is returning to say it in English - In englese come si dice? Explain inn English -- not the previous \"you can answer in Englis\" - the character is asking you for a favor - the system helps put it into sspanish". (The old "invite English" setup is in scaffolding.md, "Setup: invite English"; this is the other way round: the character wants the learner's English.) Josh, later the same day: "in beginner - you'd probably still need bubbles". Then: "but now the bubble could be more testing comprehension thn preference": today's bubbles are nearly all preferences (either is right); here one is right ("¿El comal para qué es?" → "Para tostar tortillas" / "Para lavar los platos"), and a wrong pick gets a light recast in role (it may be a mishearing). With the recall idea (docs/mix.md, "do you remember how we use the comal?"), one feature: once a visit, a check of understanding that feels like conversation.
- **A pastiche: mixed, then echo, then mixed.** "we might want to come up with pastiche of mixed then echo - then mix".
- **Levels as plain amounts.** "Could level prompts be as easy as saying not much, a bit more, more" (after seeing that a character asked for less Spanish gave less). First measure, 2026-11-13 (scaffolding.md changelog 13a): a step 1 that only said "mostly in English, with only a little {language}" got 30% Spanish against 45% today, but its Spanish was nearly all the closing question, with no phrases slotted in.

## Comment or question: a turn doesn't have to end on a question (Josh, 2026-11-14; Beginner)

Josh, after reading the closing questions and the offered answers of five Mexico Beginner visits: "Why always Q? A. Why not just talk - comment or Q." The character's turn ends on a comment or a question, and the two bubbles are things to say, usually one comment and one question. On the five visits rewritten that way: "The thing that stands out uid the character question gets an echo. The comment is hard to reply without the English (maybe final sentence is echoed or at least shown in English".

- What the visits showed: 27 of 55 bubble pairs were yes and no, the yes an echo of the question ("¿Quiere ver…?" / "Sí, quiero ver…"); the turns that closed on no question and offered two questions to ask were taken 6 times of 7; Josh added something of his own to 33 of 56 replies, mostly about himself or a question. Across ten days the yes/no share was lower before 11-12i, and lowest where the place sells something.
- Claude's proposal from Josh's two remarks: every turn ends on one short sentence with its English; one bubble uses that sentence's words (the easy one), the other is new (a question or the learner's own thought).
- Also there: seven categories of what a turn is about (Josh's Preferences, Senses, Biography, Comprehension; Claude's Words, Help, Play), with example questions, and which gap bubbles ("Me llamo …") learners fill.
- Close to "Open-ended talk doesn't need a question every turn" above (Josh, 2026-11-04) and to "Interviewing by multiple choice" in the top 10.

Everything is in [questions-and-bubbles.md](questions-and-bubbles.md), a draft. Nothing is built or in a prompt.

## The levels re-cut: today's Intermediate as Advanced, a new Intermediate in between (Josh, 2026-11-14, night)

After playing Nunzio and Elena at Intermediate ("the intermediate is Hard"; "its also vocab with Nunzio and verb tense with ELena"; bugs.md B13), Josh: "Just a thought while I was waiting - maybe our intermediate is our advanced level - and a new intermediate is in spanish heavy mix - and no bubbles for the learner - you speak spanish if you can or you say what you want in English and get back how to say it - maybe there is more drilling on intermediate wwith learn sheets -- just a few ideas".

So, as he put it:
- Today's Intermediate (all in the language, new vocabulary and tenses as they come) becomes Advanced.
- A new Intermediate: a mix that is mostly the language; no offered answers; the learner speaks the language if they can, or says it in English and is given how to say it ("How do I say it", say-it.md); more drilling, through the Learn sheets (dialogue-plan.md D51).

Close to what exists: Beginner steps 4–6 (mostly the language, then no answers; built 2026-11-14, played by nobody: bugs.md B33); the say-it flow. Nothing decided.

## "Do you like" asked about plain things (Josh, 2026-11-16, after play)

Josh: "the characters like to ask the question do you like some plain thing in the game that we don't normally ask someone if they like like do you like the square or do you like the church or do you like the flowers?"

- Example, Mazatlán, Don Anselmo (Beginner, prompt beginner-2-2026-11-15a): "¿Qué le parece el kiosco?" with the offered answers "Es muy bonito, me gusta." / "¿Para qué sirve el kiosco?".
- A likely cause, in our own words: the "point at something" setup in scaffolding.md tells the character to "ask them something about it: what they make of it, which they like, what they think it's for." The example line and both answers follow those three almost word for word. Instructions cause repetition (dialogue-less-is-more).
- Close to "Interviewing by multiple choice" in the top 10 and to the preference-heavy bubbles in questions-and-bubbles.md (most bubbles are preferences; either is right).
- Changed the same day on Josh's "ok - sounds like a good change" (scaffolding.md 2026-11-16a, on main, not released): the setup now says one thing a local would know about the thing, then asks what follows. In a look at five sights, "do you like" the thing itself went from 10 of 10 turns to 4 of 10. Characters aren't told what their place looks like (the picture's description isn't in their prompt), so they pick the obvious thing and sometimes invent its history. Josh: "do characters need more/different things to notice": open.

## Wikipedia in a shrimp captain's background (Josh, 2026-11-16)

Reading Don Anselmo's background (`here`, content/es-mx/cities/mazatlan.ts) while looking at why he asked about the bandstand, Josh: "this is a bit odd", then "it was wikipedia in a shrimp captains background". Two sentences are his (forty years a shrimp captain, the bench; he follows the Venados); the rest is the square's history (the 1830s, Machado the merchant of silver and pearls, the Philippines, the Germans, Spaniards and Americans). The two that are his gave "do you like baseball" (which worked, Josh) and "do you like shrimp"; the history gives a Beginner turn nothing, and he falls back on an object in view.

- Not every background reads this way. Trade backgrounds hold what the person handles (Oaxaca's mezcal bar: copitas, sal de gusano, espadín; Bologna's salumeria: mortadella sliced by hand, Parmigiano by age). The plaque kind is strongest for people at sights and in Mexico's newer cities, where each city's real history was added on purpose (2026-11-09) so characters wouldn't invent it.
- The same day Josh on writing facts for characters to say (a list of things to notice, a calendar, a line per character per month, all proposed by Claude): "when i think about all that scripting of facts it feels wrong". All three dropped.
- Nothing changed in any background.
- The whole morning's notes (the four layers, how notice got here, the ideas dropped and open, thicker characters) are in [turn-notes-and-characters.md](turn-notes-and-characters.md).

## Hearing more of the language than you can read (Josh, 2026-11-16)

After his first visits at step 2 (every sentence echoed; Chuy, Memo, Valeria in Guadalajara, f71312f9 and two more that morning): "it felt strange to hear more spanish but not read it - not trying to change the design". The app prints only the question and its English (his 2026-11-11 call), so the step that adds the language adds it to the ear only. Then: "once i was on level 2 - 40% was bin spanish - but only questio printed". The debug panel's share for his step 2 turns that morning was 45–48% (the ratings' context, f71312f9). An observation, not a request; nothing changed.
