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
