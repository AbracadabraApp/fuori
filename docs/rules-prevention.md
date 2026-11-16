# Rules prevention: fixes that would add a rule

A fix that would add a rule to a prompt (an instruction to the character, a "never" or "always") waits here instead of going in. Each one sits for a while and gets reviewed for a better way: code instead of an instruction, a change to something that already exists, or nothing. Started 2026-11-16 (Josh: "careful with rules: Maybe we should start a list of ideas that would require new rules and we let them sit and review to see if there is a better way"; the name: "maybe call it rules-prevention not ideas"). The reason: every rule added so far has a cost; instructions get repeated or followed too literally (docs/dialogue-model.md → What we've learned; B31: one example in the Close block, and every visit closed on it).

How to use it: one entry per idea, with the bug or play it answers, the rule as proposed, and other ways found since. Nothing here is scheduled. An idea leaves the list when Josh picks a way, or when the problem goes away by itself.

## Waiting

### R1. Names and exclamations said once (B41)
- **Answers:** at step 2 every sentence is echoed, so "¡Ja!… Ha!…" and "Gracias, Joshua… Thank you, Joshua" come twice (Josh, 2026-11-16: "When characters use my name its strange to here it repeated - because it isn't in 2 languages").
- **Rule proposed (Claude, 2026-11-16):** one line in the Beginner prompt: write the learner's name and an exclamation outside the braced sentence, so code says them once.
- **Other ways to look at (Claude, not yet weighed):**
  - Code only: when a sentence is echoed, leave out of the English any word that's the same on both sides (a name, a place, a dish). No instruction; doesn't catch "¡Ja!" / "Ha!".
  - Code only: don't echo a sentence of one or two words ("¡Ja!", "¡Qué bueno!"); length works in any language.
  - Nothing: check whether it's only step 2 (every sentence echoed) and goes once steps 3+ echo less.
- **Added:** 2026-11-16.
