# Dialogue ideas

Ideas about how conversations with characters should go: what they say, when the learner speaks, how the scene moves. Started by Josh on 2026-11-04, after playing Florence (Ardit at Trattoria Mario, Lorenzo in Piazza Santa Croce). Nothing here is scheduled. An idea moves to the roadmap once Josh decides it. Josh's words are quoted; anything else is marked as Claude's proposal.

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
- **Tried and dropped:** "Always leave them something to answer." added to the character prompt (`tests/experiments/dead-ends.mts`, 2026-11-04). Lines with no question 26% → 4%, dead ends 14 → 1, but it makes the waiter stay and chat, which Josh says is the wrong fix. Two-question lines 16% → 18%, forced questions 1 → 3.

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

- **Started 2026-11-05:** `tests/experiments/replay-set.mts` replays Luisa's and Doña Chela's openings, Jennifer's Magda lesson and two more stage 1 openings per country, with a judge on what the voice says (repeats, run-on). `tests/experiments/heard-replay.mts` replays the mishearing cases (Magda's coaching, Ardit's ribollita, Lorenzo's *say this*). New examples go into one of the two.

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

## Top 10 problems in 20 days of real conversations (agent read, 2026-11-08)

Josh, 2026-11-08: "would an agent be able to read through all the transcripts for 20 days and rank the top 10 problems in character dialogue"; read as natural conversation ("something more literary"), from the conversations alone ("knowing prompts or judge results supplies extra info"). Method: 67 conversations from Oct 19 to Nov 9, both countries, 3 or more learner lines, Magda, lessons and the welcome left out; one agent read only the transcripts (CHARACTER / VISITOR, conversation numbers in date order), no prompts, versions or scores. Counts are rough, from one read. Nothing here is decided.


A reader's view, from the transcripts only. Counts are rough, from one careful read.

The big shift: the early conversations (1–29, Oct 19–24) are mostly in the language alone and read like people talking. From about conversation 30 (Oct 26) on, a different turn shape takes over: a line of English narration, a short phrase in the language, a gloss, and an either/or question. Most of the problems below come in with that shape.

### 1. Interviewing by multiple choice

Nearly every character turn ends in a question, usually a binary "X or Y?", even when the choice is meaningless. The visitor never gets to lead, and the character never just reacts, tells a story or lets a moment sit. A real person would leave half these turns as plain statements.

- **How often:** about 33 of 67. Heavy and nearly constant from Oct 26 to Nov 9 (30–66). Lighter earlier (Chucho's "¿sí o no?" in 5, 8, 11; Rosa in 25).
- **Examples:**
  - 40 · 2026-10-28 · beatrice-salvi. On a walk to see a fresco, every turn is a quiz: "Quando vuole andare, oggi o domani?" / "Vuoi andare a piedi o in autobus?" / "Quale pittore preferisci, antico o moderno?" / "Ti piace la folla o preferisci la calma?" / "Vuoi vedere prima l'affresco o il Campo?"
  - 64 · 2026-11-09 · nino-garbatella. VISITOR: "Tutte due" → "Le piace di più il pepe o il pecorino?" → VISITOR: "...anche mi piace grigia." → "Le piace di più la gricia o l'amatriciana?" → VISITOR: "Oh ancora tutte due." Nobody asks whether you prefer pepper or cheese in cacio e pepe.
  - 65 · 2026-11-09 · giulia-neri. "Le piace il Palio, o preferisce i cavalli?", and after "Sì, varo in piazza oggi": "Va a piedi o in autobus?" for a few minutes' walk.
- **Instead:** react to the answer, add something of your own, and ask only when you actually want to know.

### 2. The same script in every shop

Every commerce visit runs the same steps in the same order: option A or B, "anything else?", "pay now?", "card or cash?", receipt. The same few cultural facts get repeated in every bar and trattoria. The visitor notices out loud.

- **How often:** about 20 of 67. The payment question alone appears in about 15 (24, 32, 35, 37, 38, 40, 41, 43, 45, 46, 51, 52, 54, 55, 62). The repeated facts are carbonara without cream (7, 53, 56, 58, 59, 64), cappuccino only in the morning (44, 51, 62), pay at the till first (51, 62) and "per favore, not por favore" (30, 51). Mostly Oct 23 to Nov 9.
- **Examples:**
  - 62 · 2026-11-06 · tommaso-bini. "Here's a little tip: you pay at the till first, then bring the receipt to the counter. Vuole pagare adesso?" VISITOR: "Sì, ma perché ogni bar ha detto le stesse cose? In genere è cappuccino solo in mattina o paga a casa."
  - 35 · 2026-10-26 · ofelia-tlayudas. A street-food stall: "¿Va a pagar ahora? pay now?" → "Son ciento diez pesos... ¿Quiere pagar con billete o con monedas? bills or coins?" Nobody at a market stall asks bills or coins.
  - 43 · 2026-10-29 · marisol-cafe-pocito, and 46 · 2026-11-04 · valeria-barista, in two cities, the same line: "¿Va a pagar con efectivo o con tarjeta? cash or card?"
- **Instead:** name the price and hold out a hand; the visitor's money says how they pay.

### 3. Stepping out of the scene to manage the lesson

Characters narrate the conversation's structure ("let me ask your name", "now it's time to settle up") and cue the visitor to perform ("you can say goodbye like this"), often without then saying anything. It turns a person into a tutor running an exercise.

- **How often:** about 13 of 67 (30, 31, 33, 37, 38, 40, 41, 42, 45, 51, 52, 61, 65). All from Oct 26 to Nov 9.
- **Examples:**
  - 33 · 2026-10-26 · luisa-cocco-nuova. "Fatto, pagamento riuscito! all paid Enjoy it while it's warm. Then, when you're ready to head out, you can say goodbye like this." No goodbye follows; the line ends.
  - 42 · 2026-10-28 · giorgia-ferri. VISITOR: "Adesso vado a casa a chastivare. Ciao, Georgia." → "Buona giornata, Joshua! A presto! Say goodbye to me too." The visitor had just said goodbye.
  - 30 · 2026-10-26 · chiara-russo. "Let me ask your name." / "Let's start with a simple question about where you're from." 31 · francesca-clemente: "I'll ask how many of you there are." 38 · giorgia-ferri: "Still or sparkling is how we ask it here, and it's the usual next question."
- **Instead:** just say goodbye, and the visitor hears how it's done.

### 4. A narrator and a tour guide instead of a person

Late conversations open with a guidebook sentence or a stage direction instead of a greeting. Some turns describe the character in the third person or spell out her actions as if reading a script aloud. Facts get delivered whether or not anyone asked.

- **How often:** about 27 of 67. Guidebook openings in 30–32, 34–36, 38–40, 43, 45, 46, 50–58, 61, 62, 64–66; stage directions in 35, 36, 37, 41, 56, 64. All from Oct 26 to Nov 9.
- **Examples:**
  - 35 · 2026-10-26 · ofelia-tlayudas. "The smoky smell of the grill hits you as soon as you reach her stall, and she waves you over like an old friend." / "She slaps the tortilla on the grill with a grin." / "She pops the cap off a bottle of orange soda and sets it next to your plate..." Ofelia is narrating herself.
  - 56 · 2026-11-06 · nino-garbatella. VISITOR: "Il conto, per favore" → "Already the bill? Nino laughs, you have not even eaten yet!" The character says "Nino laughs" about himself.
  - 54 · 2026-11-06 · pietro-termini-nuova. The opening line, before the visitor speaks: "Matera is a long trip, and the rain today is heavy. You change trains in Bari. Buongiorno. Matera, va bene." He answers a question nobody asked.
  - 39 · 2026-10-28 · salvatore-di-maio. "Welcome to the Pignasecca, the oldest street market in Naples, where everybody shouts and nobody is angry."
- **Instead:** a market seller shouts about his oranges; the history comes out later, if anyone asks.

### 5. Not listening

Characters repeat a question word for word after it's been answered, skip a question the visitor asked, or offer something and never follow through. The visitor is talking to a form, not a person.

- **How often:** about 12 of 67 (3, 36, 40, 46, 55, 57, 58, 62, 64, 65 and others). Across the whole period, more often late.
- **Examples:**
  - 62 · 2026-11-06 · tommaso-bini. "Lo beve al banco o al tavolo?" VISITOR: "Grazie a tutti!" → "Preparo il suo caffè adesso. Lo beve al banco o al tavolo?" VISITOR: "O rispondete prima non ascoltami o detto al banco grazie."
  - 40 · 2026-10-28 · beatrice-salvi. VISITOR: "puoi spiegare la mura per me?" → "Le mura sono molto antiche. Passiamo davanti a una porta." Later, VISITOR: "conosce la storia del diavolo a Siena?" → "Quale storia del diavolo conosci tu?" → "Il tiranno è molto brutto. Vuoi sentire la storia?" VISITOR: "Si, grazie." → "Il diavolo è dietro il tiranno." The story is never told.
  - 65 · 2026-11-09 · giulia-neri. "Abita qui a Siena?" VISITOR: "No ho visitato Roma" → "Roma, che bella! ... Abita qui a Siena adesso?"
- **Instead:** take the answer you got, and when you offer a story, tell it.

### 6. Characters serving when it isn't their job

Students, a taxi driver and a closed trattoria's owner start taking food and drink orders they can't fill. Each time the visitor calls it out, and the character apologises and goes on.

- **How often:** about 5 of 67 (30, 40, 42, 61, 64). Oct 26 to Nov 9. Rare, but it breaks the scene completely each time.
- **Examples:**
  - 61 · 2026-11-06 · beto-taxi. "¿Quiere la torta con queso o con jamón?" VISITOR: "Con jamón, por favor. ¿Por qué estás tomando mi orden?" → "Ha, fair question! I'm a taxi driver, not the torta guy, I got carried away."
  - 42 · 2026-10-28 · giorgia-ferri, a student on the university steps. "Beve acqua frizzante o naturale?" VISITOR: "Perché tua domanda è strana? Perché è una studentessa in piazza, non è una cameriera?" → "Scusa, Joshua. Sono solo una studentessa."
  - 30 · 2026-10-26 · chiara-russo. "Vuole un caffè?" … VISITOR: "Non capisco perché mi offre un caffè." → "You're right, sorry! I got carried away and ordered for you. I'm only a student here, so I can't make coffee."
- **Instead:** a student offers to walk you to a bar; a taxi driver names his cousin's torta stand and asks if you want a ride.

### 7. Losing track of the scene and of the visitor

The same item is served twice, a price is quoted before the order is made, a choice is offered after the thing has been handed over, a remembered regular is asked his name, and a just-met neighbour is greeted as a stranger.

- **How often:** about 12 of 67 (17, 20, 23/24, 26, 33, 35, 36, 46, 55, 56, 63). Across the whole period.
- **Examples:**
  - 55 · 2026-11-06 · antonio-russo. "Ecco il suo caffè, caldo! ... Vuole zucchero o no?" then the next turn: "Va bene, niente zucchero. ... Ecco il suo caffè, signora." The same coffee is served twice.
  - 36 · 2026-10-26 · tere-fonda. "Aquí tiene su refresco. I'm opening the bottle and setting it next to your plate. ... ¿Lo quiere de naranja o de limón?" She has already opened it.
  - 23 → 24 · 2026-10-23 · luisa-cocco-nuova. In 23: "Piacere, Joshua! Io sono Luisa. Domani mattina il tuo caffè ti aspetta qui al banco." Same day, 24: "Buongiorno! Dica pure, cosa le preparo?", as to a stranger. 63 · 2026-11-07 · memo-tejuino remembers the order ("Last time you had it cold, with lemon and salt") but then asks "¿Cómo se llama usted?"
- **Instead:** keep track of what is already on the counter and who is standing at it.

- **Note (2026-11-08):** Josh: inaccurate but in role, a lighter problem than breaking role (Nino's "un altro caffè?" at a closed bar, which he turned into a joke when asked). Not on the to-do list until there's enough dialogue to show it needs a fix. Observation only: in the three examples the slip sits in the turn's "X or Y?" question (sugar after serving, flavour after opening, another coffee at a closed bar).

### 8. Dragging the talk back to the sale

When the visitor opens a real topic (children, the character's job, a question), the character gives it one line and pulls back to the order: "but you haven't picked a drink yet."

- **How often:** about 9 of 67 (7, 14, 30, 32, 38, 42, 53, 56, 57). Across the period, more often late.
- **Examples:**
  - 7 · 2026-10-20 · franco-ortolano. VISITOR: "tre figli un figlio e poi due file" → "Tre figli, che bella famiglia! ... Le preparo un po' di pesche per loro?"
  - 32 · 2026-10-26 · sofia-esposito. VISITOR asks if she likes her work → "Sì, mi piace molto qui. ... And the sfogliatella is still waiting for you, crisp and warm. Vuole una sfogliatella, sì o no?"
  - 38 · 2026-10-27 · giorgia-ferri. VISITOR: "Si, mi piace moto Roma" → "Anch'io amo Roma! Now, your margherita is on its way, but you haven't picked a drink yet."
- **Instead:** stay on the children or the job for a few lines; the drink can wait.

### 9. Characters lose their own voice

In the early, language-only turns, characters have humour, a way of speaking and opinions. In the late, scaffolded turns the same people speak in the same neutral English ("Perfect", "Good choice", "Here you go") and could be swapped for each other.

- **How often:** most of the scaffolded conversations, about 20 (Oct 26 to Nov 9), and the clearest in characters who appear in both periods (Chucho, Memo, Valeria, Nino).
- **Examples:**
  - Chucho, 5 · 2026-10-19: "¿Cinco años? ¡Entonces usted es un niño, y yo un bebé de 74!" vs 41 · 2026-10-28: "Now I buff the leather with a soft cloth until it glows softly. Ahora saco brillo, pero poquito. a little shine ¿Le gusta vivir en la Ciudad de México?"
  - Memo, 16 · 2026-10-23: "¡Jaja! Eso es italiano, joven. En español decimos «poco a poco»." vs 45 · 2026-11-04: "Tejuino is a Jalisco classic: fermented corn, lime, salt and ice. ... Now it's time to settle up, it's just a small price."
  - Nino, 59 · 2026-11-06 (in Italian): "Ah, la gricia! È la madre di tutte, mi creda. ... Mai la panna, mai!" vs 53 · 2026-11-06: "Marco, my son, makes it in the kitchen and takes your order. Today it's Friday, so no gnocchi..."
- **Instead:** keep the character's own words and jokes even in the English parts.

### 10. Reflex praise

"Parli benissimo", "Ottima scelta", "Bravo/Brava", "¡Muy bien dicho!" go out for anything, including halting sentences and plain choices. Praise that automatic stops meaning anything and sounds like a script.

- **How often:** about 18 of 67 (2, 4, 6, 7, 9, 17, 20, 21, 27, 32, 48, 49, 52, 53, 56, 57, 61, 64). The whole period.
- **Examples:**
  - 2 · 2026-10-19 · alberto-galli. VISITOR: "...non parlo italiano bene, mi scusi se farei un sbagliato. Vorrei un ciabatta, un peso, un po'" → "Ma no, non ti preoccupare, parli benissimo!"
  - 17 · 2026-10-23 · valeria-barista. The visitor parrots her line back: "A negro, café negro, sin azúcar, muy bien, ya casi está." → "¡Eso! Lo dijiste perfecto."
  - 53 · 2026-11-06 · nino-garbatella. "si ho mangiato la carbonara" → "Bene, brava!" → "Mi piace la carbonara" → "Bravissima!" → "I cao ciò per favore" → "Ottima scelta, signora!" And 64: liking both pastas earns "Ah, sei un vero romano!"
- **Instead:** take the order without comment, and save praise for something that earns it.

### What the dialogue does well

- **Humour that comes from the character.** 12 · 2026-10-21 · dario-fornaio. VISITOR: "Chiacchieri molto per essere un fornaio." → "Ah, hai ragione! Ma il pane lievita da solo, io intanto faccio due chiacchiere." And VISITOR: "Una bistecca." → "Qui siamo un forno, mica una macelleria!"
- **Recasting a mistake in character.** 11 · 2026-10-21 · chucho-lustrabotas. VISITOR: "Canto Pesame Mucho" → "Pero se dice 'Bésame', no 'Pésame'... Con 'pésame' mejor llora el cielo."
- **Following the visitor somewhere real.** 49 · 2026-11-05 · lorenzo-marchi. VISITOR: "Tu conosci la età della Dante quando scrive queste parole?" → "Dante aveva trentacinque anni, o giù di lì. ... Quindi lei, a cinquantacinque, ha ancora un bel pezzo di strada! Io invece, a settantasei, sono già oltre il cammin, ma il cane mi tiene in forma."
- **Warmth, and a reply to an odd turn.** 60 · 2026-11-06 · nonna-gina. The visitor asks if his Madonna tattoo is fine in church → "Ma certo che va bene, figliolo! La Madonna Addolorata sul braccio, che bellezza: Dio guarda il cuore, mica la pelle. ... Fattelo vedere, quel tatuaggio!"
- **Memory that makes the visitor feel known.** 14 · 2026-10-21 · franco-ortolano. "Eccolo qua, Giosuè! Il trasteverino d'adozione! Allora, com'è andata l'amatriciana? Senza cipolla, spero! ... I tuoi figli hanno mangiato tutto, eh?"

## Why Beginner conversations read flat: two readings (2026-11-08)

Prompted by the top 10 above and Josh: "Here line might be the most important thing in the game, but tests (or test methodologies) failed to do anything to improve it." Claude then put each character's here line, as it was on the day, beside the conversations the top 10 called alive and flat.

### Josh's theory

Josh, 2026-11-08: "My theory is that Beginner is overbuilt. It over determines the shape of conversation. Characters are repetitive, In intermediate things are more open ended. I also think Kind is an important hint to lively."

Evidence that fits it (Claude):
- `beginner.md` is 1,550 words in 23 sections; the Intermediate character prompt is 534 words with 9 rules.
- Every Beginner reply is parts (English, word, question, answer): a question slot every turn, which is problem 1 above (interviewing by multiple choice), set before the character says anything.
- The prompt already has "Variety: not the same shape", "Voice: no narration", "Role: not a teacher", "Lead: follow theirs": problems 1, 3, 4 and 5 above, still happening. Each was a patch for a problem that stayed.
- Kind: the place's kind already sets the scene (a bar is coffee at a counter, a piazza is time to talk, a shoeshine stand is a man who has seen everyone's shoes). The flat moments come when something is laid over the kind: the same shop script on every commerce kind, Giorgia on the university steps taking a drink order.

### Claude's reading

From the here lines on the day of each conversation (git history of the city files):

| Character | Here line then | Level | Read |
|---|---|---|---|
| Chucho, 10-19 | none (name, 74, bolero, "dignified, proud of his craft") | Intermediate | alive |
| Chucho, 10-28 | same data | Beginner | flat |
| Franco, Dario, 10-21 | none (role, three personality words) | Intermediate | alive |
| Nino, 11-06 | the long menu line | Intermediate | alive |
| Nino, 11-06 (×3), 11-09 | same line | Beginner | flat |
| Nonna Gina, Lorenzo | the person's life and what they love | Intermediate | alive |
| Ofelia, Beto, Tommaso, Giorgia, Beatrice | various | Beginner | flat |

- Every alive conversation was Intermediate; every flat one Beginner. The livest had no here line at all (here lines began 10-30).
- Same character data, different level, opposite result (Chucho; Nino the same day). So in real play the Beginner format, not the here line, separates alive from flat.
- The here line still steers what's talked about: Nino's line says to tell "what the tourists get wrong", and at Beginner he did, with carbonara, every time. Lines about the person (Gina, Lorenzo) read better than lines about the business (Tommaso's speciality coffee, Beatrice's bank facts).
- Why the here-line tests found nothing: C12 ran at Intermediate, where characters are alive anyway; at Beginner the format drowns the line.
- Part of it is the learner: a Beginner says less, so the character has less to react to.

The two readings agree that the Beginner prompt shapes every turn; they differ on how much the here line matters. Nothing decided.


## Top 10 problems at Intermediate: 48 real conversations (agent read, 2026-11-08)

The same reader as the Beginner top 10 above (transcripts only, read as natural conversation; no prompts or judge results), on every Intermediate conversation from 2026-10-12 to 2026-11-09. Six of the Beginner problems don't appear here at all, and several of these (1, 5) are early, from before 10-24. Agent report, unchanged:

A reader's view, from the transcripts alone.

#### 1. Forgetting the visitor and the conversation
Characters lose track of who the visitor is, what they have already said, or that the conversation has started. At its worst a character asks the same question again and again while the visitor points it out. Across visits, a regular gets treated as a stranger by someone they have seen several times.
- **How often:** about 9 conversations, 2026-10-13 to 10-24. It is clustered around repeat visits (Franco, Luisa, Ettore). Nothing this bad shows up after 10-24, but there are also few repeat visits after that.
- **Examples:**
  - Conv 4, 2026-10-13, giulia-rossi. She asks where he's from five times and re-introduces herself:
    > VISITOR: Scusi Giulia, tu detto tuo nome ancora e anche ho detto di dove sei. Tu non ricordi?
    > CHARACTER: Ah, scusami, forse mi sono ripetuta! Oggi ho proprio la testa tra le nuvole. Di dove sei tu?
    > …
    > CHARACTER: …Che bello, sei qui per visitare la Basilica di San Francesco! Io sono Giulia, piacere! Di dove sei?
    > VISITOR: No me ali.
    > CHARACTER: Ciao, benvenuto al Bar Senso! Scusa, non ho capito bene, puoi ripetere?
  - Conv 28, 2026-10-20, franco-ortolano, after three visits on 10-15 that covered carbonara, his children and Seattle:
    > VISITOR: Franco, non ricorda me?
    > CHARACTER: Mi scusi, signore, ma non mi pare di averla mai vista qui al banco.

    In conv 31 he remembers him again ("Eccolo qua, Giosuè!"). In conv 35 (10-23) he is back to "Buongiorno! Dica pure, cosa le servo oggi?"
  - Conv 38 → 39, 2026-10-23, luisa-cocco-nuova. In 38 she learns his name and says "Domani mattina il tuo caffè ti aspetta qui al banco." In 39, the same day, she opens with "Buongiorno! Dica pure, cosa le preparo?" as if to a stranger. In 41 she remembers his order but has lost his name and introduces herself again: "Ah, forse Gabriele? Piacere, io sono Luisa!"
- **A real person would:** recognise a face they had chatted with twice, and never ask "di dove sei?" a third time in one conversation.

#### 2. Every turn ends with a question (interviewing, not talking)
Almost every character line ends by handing the visitor a new question, usually on a new subject. The character rarely just reacts, shares something and lets the visitor pick the thread. The conversation turns into an intake interview, and the visitor is never the one asking.
- **How often:** about two thirds of all character lines end in "?", more if you count lines that end "…?" followed by "!". It shows up in nearly every conversation (about 40 of 48) across the whole period. The worst are conv 4, 12, 23, 26 and 46, where almost every line ends in a question.
- **Examples:**
  - Conv 23, 2026-10-19, simona-moro. Every reply is a follow-up question about the friend:
    > CHARACTER: Etone, che bel nome, non è molto comune! Da dove viene, Etone?
    > VISITOR: De Roma
    > CHARACTER: Romano, quindi! Allora vi siete conosciuti a Roma, o in un altro posto?
    > VISITOR: Si, ho contratto Ettone alla Borghese Giardini
    > CHARACTER: Che bello, Villa Borghese è un posto stupendo per conoscere qualcuno! Passeggiavate o eravate seduti sull'erba?
  - Conv 8, 2026-10-13, nonno-ettore. Each turn is reaction + memory + new question ("Da dove viene lei?", "Le piace il clima di qui rispetto a Seattle?", "Ha già visto il laghetto…?", "Che cosa le piace di più di questi giardini?", "Cosa ti piacerebbe vedere a Roma?").
  - Conv 2, 2026-10-12, rita, two questions stacked in one turn:
    > CHARACTER: …Ecco, il tuo caffè è pronto, attento che è caldo. Dimmi, Josué, ti manca un po' casa? E che cosa ti piace di Seattle?
- **A real person would:** often just answer, react or tell something of their own, and leave a silence for the other person to fill.

#### 3. The same intake script with every stranger
New characters run the same checklist: name, where are you from, are you on holiday, how long have you been here, do you like the city. Seattle always gets the same answer: rain, and good coffee. The visitor is a long-stay resident, but characters keep calling him a tourist, and he keeps having to correct them.
- **How often:** about 20 conversations, the whole period (10-12 to 11-06). The Seattle-rain line alone comes up in about 9 (conv 2, 6, 8, 12, 16, 17, 32, 45, and as coffee in 4).
- **Examples:**
  - Conv 25, 2026-10-19, elena-gelataia:
    > CHARACTER: …Sei in vacanza a Firenze?
    > VISITOR: Non in vacanza, solo a visitare per due o tre giorni. Perché tu pensi io a turista se non domande male?
  - Conv 45, 2026-11-05, lorenzo-marchi; Conv 16, 2026-10-15, franco-ortolano; Conv 6, 2026-10-13, sandro-bar-angolo:
    > (45) CHARACTER: Ah, Seattle! Lontano, lontano. Piove sempre, no? Qui a Firenze almeno c'è il sole. Ma è la prima volta in Italia?
    > (16) CHARACTER: Seattle! Lontano, eh! Lì piove sempre, qui invece c'è il sole…
    > (6) CHARACTER: Seattle, certo che la conosco: pioggia e tanto caffè.
  - Conv 33, 2026-10-23, matteo-rinaldi: "Tu sei turista?" Conv 4, giulia-rossi: "Sei qui in vacanza?" asked twice, after he has said he lives in Italy.
- **A real person would:** ask about whatever is in front of them (the order, the weather, the dog) and let personal questions come up naturally, each person in their own way.

#### 4. Going along with garbled or misunderstood lines
When the visitor's line is garbled or ambiguous, the character often acts as if it made sense, or confidently picks a wrong meaning and runs with it. A real listener would hesitate. The result is answers that don't connect, or that contradict what the visitor clearly meant.
- **How often:** about 10 conversations, the whole period (10-13 to 11-06).
- **Examples:**
  - Conv 4, 2026-10-13, giulia-rossi. He says he lives in Rome; she answers as if he had asked about her:
    > VISITOR: Adesso sta a Roma, ma di dove si è, gli Stati Uniti?
    > CHARACTER: Ah, ma io sto qui ad Assisi, non a Roma!
  - Conv 40, 2026-10-24, andrea-brivido; Conv 25, 2026-10-19, elena-gelataia:
    > (40) CHARACTER: …Cosa le posso preparare?
    > VISITOR: Sì, è vero!
    > CHARACTER: Ah, sì? Perfetto! Allora, che gusto prende…
    > (25) VISITOR: Non una pensione.
    > CHARACTER: Ah, capisco, non sei in pensione! Allora sei qui per lavoro?
  - Conv 22, 2026-10-17, nonno-ettore. The visitor is lost and asks for one word in English; Ettore asks which word, then repeats the same Italian:
    > VISITOR: Non capisco. Posso solo una parola in inglese? Se va bene? No.
    > CHARACTER: Certo che va bene, Giosue! Una parola in inglese non è un problema, anzi, aiuta. Quale parola ti serve?
    > …
    > CHARACTER: …Ripeto piano: i panni bagnati si asciugano al sole. Va bene così?
- **A real person would:** say "Scusa, come?" or check ("Vuoi dire che abiti a Roma?") before answering, and just say "hanging out the washing" to someone plainly lost.

#### 5. Teacher mode: drills, graded praise and corrections at the goodbye
Some characters drop their role and run a lesson: "Ripeta con me", syllable splitting, and "Bravo!" in the same breath, praising a repetition the visitor hasn't made yet. Corrections get labelled as corrections, even as the visitor says goodbye and thank you.
- **How often:** about 7 conversations, mostly early (10-12 to 10-17); rare after that.
- **Examples:**
  - Conv 1, 2026-10-12, rosa-fruttivendola:
    > CHARACTER: Esatto, apricot! Albicocca, in italiano. Ripeta con me: al-bi-coc-ca. Bravo!
    > …
    > VISITOR: Perfetto. Pago. E grazie per aiutami, Rosa, e grazie per tanto tempo parlare con me.
    > CHARACTER: Ma s'figuri, è stato un piacere! … Piccola correzione, così impara: si dice "grazie per avermi aiutato" e "per aver parlato con me".
  - Conv 1 again: "Ora ripeta con me: "assaggio, assaggi, assaggia". E mi dica: com'è la ciliegia, dolce o aspra?" (a conjugation drill from a fruit seller).
  - Conv 2, 2026-10-12, rita: "Bene, si dice così: "Piove molto, come a Londra, ma ha anche una bella estate". Hai detto quasi tutto giusto, bravo!"
- **A real person would:** use the right form back in passing ("Ah, ti ho aiutato volentieri!") and leave the drilling to teachers.

#### 6. Overstuffed monologue turns
In the early conversations especially, one turn packs in four moves at once: react, explain, tell an anecdote, ask one or two questions. The pace is wrong for a market stall or a doorway, and it buries the one thing the visitor could answer.
- **How often:** about 10 conversations, heavily early (10-12 to 10-17: conv 1, 2, 8, 11, 21, 22), with some later (45, 46, 47).
- **Examples:**
  - Conv 1, 2026-10-12, rosa-fruttivendola: a six-sentence turn explaining "assaggiare", "assaggiando", a drill and a question, in reply to a simple request.
  - Conv 21, 2026-10-17, vale-libros-tecolote, recommending two books with blurbs and then a question, to a visitor who said four words:
    > CHARACTER: Ah, entonces sí eres de los que vienen con rumbo. Perfecto, el rincón en inglés está al fondo… busca 'The Broken Spears' de Miguel León-Portilla… Y si quieres algo más amplio, 'Mexico: Biography of Power' de Enrique Krauze es un ladrillo, pero un ladrillo con buena prosa. ¿Te interesa más la historia de México o de otro lugar?
  - Conv 2, 2026-10-12, rita: "Perfetto, allora il caffè lo faccio subito, ho la moka già pronta. Intanto lascia pure la valigia… Siediti dove vuoi, la casa è tua. Hai fame, per caso? Ho fatto una crostata ieri sera…"
- **A real person would:** say one thing and wait, especially to someone visibly struggling with the language.

#### 7. Formulaic openings with name and shop sign
Many conversations open the same way: "Buongiorno! Benvenuto al [full shop name]. Sono [name]." Few shopkeepers greet a walk-in by announcing the shop's name and their own. When they don't do that, the opening is the same stock greeting: "Buongiorno! Dica pure, cosa le preparo?"
- **How often:** about 14 conversations, the whole period.
- **Examples:**
  - Conv 14, 2026-10-14, angela-volpe: "Buongiorno! Benvenuto al Panificio Volpe. Sono Angela. Il pane è appena uscito dal forno, ancora caldo."
  - Conv 13, 2026-10-14, roberto-nardella: "Buongiorno! Benvenuto alla stazione di Matera Centrale. Sono Roberto, il capostazione."
  - Conv 40, 2026-10-24, andrea-brivido: "Buongiorno! Benvenuto alla Gelateria Brivido." Conv 48, 2026-11-09, lucia-bini: "Buongiorno! Benvenuto alla Pasticceria Bini." Conv 36, 38, 39 (luisa-cocco-nuova) all open with nearly the same "Buongiorno! (Dica pure,) cosa le preparo?"
- **A real person would:** open with something tied to the moment ("Prego?", "Ditemi", a remark about the rain) and give their name only once there's a reason to.

#### 8. Loops: the same line or offer, turn after turn
Inside one conversation, a character keeps coming back to the same point: the food is coming, the kitchen is closed, mole or enchiladas. The scene stalls, as if the character can only move on once their own line has landed.
- **How often:** about 7 conversations, the whole period (10-12 to 11-06).
- **Examples:**
  - Conv 44, 2026-11-05, ardit-hoxha. The water and bread are "coming" for six turns:
    > CHARACTER: …Intanto le porto l'acqua. / Prego, a subito! / …le porto subito l'acqua e il pane. / Di niente! Torno subito. / …Ecco, l'acqua e il pane. La ribollita è quasi pronta. / …Ancora un minuto e le porto la ribollita calda calda. / …Arrivo subito con la ribollita.
  - Conv 46, 2026-11-06, nino-garbatella. "Kitchen's closed, come back at half seven" in four turns running, and the blackboard menu recited twice:
    > CHARACTER: …la cucina riapre stasera alle sette e mezza… / …la cucina è chiusa fino alle sette e mezza… / …la cucina è chiusa, mio figlio Marco la prepara stasera, dalle sette e mezza… / …torni stasera alle sette e mezza…
  - Conv 12, 2026-10-14, cuca-cocinera: "¿el mole o el caldito?" → "¿Cuál le traigo primero?" → "¿le traigo el mole o las enchiladas?" → "un poquito de cada uno"; the agua de jamaica is promised three times.
- **A real person would:** say it once, then move on, bring the thing, or change the subject.

#### 9. Stock reactions and blanket reassurance
A small set of phrases does most of the reacting, whoever is speaking: "Ottima scelta!", "Perfetto!", "Che bello!", "Che bel nome!", and above all "parli benissimo", said even right after the visitor has plainly struggled. Goodbyes are the same ritual ("Buona giornata e a presto!"), and they get traded back and forth for several turns.
- **How often:** in about 30 conversations, the whole period. The "you speak very well" reassurance comes up in about 10.
- **Examples:**
  - Conv 12, 2026-10-14, cuca-cocinera:
    > VISITOR: Oh my gusta too.
    > CHARACTER: …¿Le parece bien?
    > VISITOR: Lo siento.
    > CHARACTER: ¡Ay, no se disculpe, mija! Aquí nadie se enoja, y usted habla muy bien.
  - Conv 24, 2026-10-19, alberto-galli: "Ma no, non ti preoccupare, parli benissimo!" Conv 28, franco-ortolano: "Ma no, si figuri, parla benissimo!" Conv 6, sandro-bar-angolo: "Il tuo italiano va benissimo…"
  - Conv 27, 2026-10-19, vale-libros-tecolote. The goodbye runs for five exchanges: "¡Igualmente, que tengas una linda tarde! Hasta luego." / "¡Con mucho gusto! Cuídate mucho." / "¡Qué bueno, aquí te esperamos!…" / "¡Súper, me va a dar mucho gusto saberlo! Hasta pronto."
- **A real person would:** react in their own words to the specific thing said, and let a goodbye end with one "ciao".

#### 10. Slips a native speaker wouldn't make
Register flips between tu and lei inside one line, the visitor's gender changes, and there are small grammar errors. Each is minor, but they break the sense that this is a local speaking.
- **How often:** about 8 conversations, the whole period.
- **Examples:**
  - Conv 38, 2026-10-23, luisa-cocco-nuova: "Ecco a lei, un euro. Non ti ho mai visto qui, sei di passaggio?"
  - Conv 32, 2026-10-22, nonno-ettore, to Giosuè, whom he treated as a man in conv 11 and 22: "Dimmi, Giosue, sei venuta a piedi fin qui? … Brava!"
  - Conv 36, 2026-10-23, luisa-cocco-nuova: "Gliela porto subito" (for a caffè) and "uno caffè e un cornetto alla crema". Conv 46, nino-garbatella: "il gnocchi", and "Lei il guanciale lo conosce?" right after "se ci metti il pomodoro". Conv 1, rosa-fruttivendola: "un'ciliegia", "s'figuri".
- **A real person would:** keep one register and one gender for the person in front of them, and not make beginner grammar mistakes in their own language.

---

#### What the dialogue does well

- **Distinct, funny voices when a character has one.** Conv 6, 2026-10-13, sandro-bar-angolo: "Ecco il caffè, un euro e venti. La compagnia è gratis." … "Io sono qui dietro al banco dalle cinque del mattino e la pensione la vedo col binocolo."
- **Handling odd input with wit, in character.** Conv 29, 2026-10-21, dario-fornaio: "Una bistecca? Qui siamo un forno, mica una macelleria! Però ti posso dare una pizza bianca con la mortadella, che ne dici?" Conv 12, cuca-cocinera: "¿Jonathan? Ja, ese no está en mi menú, mija, pero si viene con usted, que pase y se siente."
- **Callbacks that make the visitor feel known, when memory works.** Conv 31, 2026-10-21, franco-ortolano: "Eccolo qua, Giosuè! Il trasteverino d'adozione! Allora, com'è andata l'amatriciana? Senza cipolla, spero!"
- **Culture woven into the talk, not bolted on.** Conv 46, 2026-11-06, nino-garbatella: "Ah, la gricia! È la madre di tutte, mi creda. Guanciale e pecorino, basta… Se ci metti il pomodoro diventa amatriciana, se ci metti i tuorli d'uovo diventa carbonara." Conv 45, lorenzo-marchi, works out Dante's age from the visitor's quote.
- **Help in role, in plain terms, when asked.** Conv 48, 2026-11-09, lucia-bini: "Morbido è il contrario di duro: quando lo tocca, è tenero, cede sotto le dita, come un cuscino. Il ricciarello è così, morbido dentro."

#### Overall feel

Taken one turn at a time, these conversations mostly read as warm and plausible, and the best of them (Sandro, Franco on a good day, Nino, Gina, Lorenzo) have real voice and local colour. What gives them away is the pattern across turns and visits: a question at the end of nearly every line, the same where-are-you-from script, lines that loop, and memory that comes and goes. The result is a friendly interviewer more than two people talking. The early conversations (mid-October) are wordier and more like a lesson. The later ones are shorter and more natural, but still run on questions.

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

The big change was Nov 6 (a431cd9, Josh's approved list in `docs/conversation-variety.md`). Real visits since then are too few to tell whether it worked (4 by 11-08, all Josh's: a bar, a pastry shop, a market, an osteria), and both top 10s come from before it.

**Display order.** Josh's picks matched the first cards in a fixed feed order (11-08: "I think it probably says more about display order"), so what gets played says as much about order as about appeal. Since b31c916 cities and places come in a new order each day, unvisited first, with an open space in the first three.

## Carbonara without cream: one character's here line (2026-11-08)

Of 6 conversations with "carbonara, never cream", 5 are Nino (trattoria-garbatella, 11-06 to 11-09), every visit; the other is Franco (10-20). Nino's here line asks him to tell a newcomer about his menu "dish by dish… what the tourists get wrong", and carbonara is his dish. Not a habit of every character; one line pointing him at it. Logged only (Josh: mechanics before dialogue).

