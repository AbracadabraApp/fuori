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

## A correction for something the learner said right

Josh, 2026-11-04: "i got corrected with the ribollita". The transcript has "Si, vorrei la ribaletta" (speech-to-text) and Ardit's recast "Ribollita, ottima scelta!". If Josh said it right, the recast corrected a mishearing. Collect more examples before deciding anything.

## Long replies in open-ended talk

Lorenzo, Piazza Santa Croce, 2026-11-04: median reply 28.5 words (Ardit at the trattoria: 14). Observed by Claude, not raised by Josh; listed to see whether it comes up in more conversations.
