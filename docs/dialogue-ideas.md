# Dialogue ideas

Ideas about how conversations with characters should go: what they say, when the learner speaks, how the scene moves. Started by Josh on 2026-11-04, after playing Florence (Ardit at Trattoria Mario, Lorenzo in Piazza Santa Croce). Nothing here is scheduled. An idea moves to the roadmap once Josh decides it. Josh's words are quoted; anything else is marked as Claude's proposal.

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

Josh, 2026-11-04: "with Lorenzo corrected to say something I didn't want to say - that this was my first time in Italy"; earlier, "when that correction line comes up it doesn't always hear well". The line is "say it in English"'s *say this* (`format=sayit` in the admin route).

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
