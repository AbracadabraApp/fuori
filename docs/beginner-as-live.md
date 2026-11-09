# The Beginner level as it runs in production

What a Beginner conversation is in the live code today: build **bb0b6e6** (released 2026-11-08), read from `origin/live`. The baseline for the Beginner plan (`docs/beginner-plan.md`): any change is measured against this. Facts only, no proposals. Italy's files are quoted; Mexico's mirror them.

## 1. Who gets it

- A learner whose level is **Beginner, or not set yet**, talking to any place character (`lib/conversation/take-turn.ts`). Magda never; her lessons and the onboarding welcome use the same parts format with their own briefs (not covered here).
- **Placement** (`lib/path.ts → placement`), from onboarding's two answers:
  - "I speak fairly well" → Intermediate (step 5).
  - "Not yet", and they answered the welcome in their own words → Beginner, **step 3**.
  - "Not yet", and they said back an offered answer → Beginner, **step 1**.
- Choosing Beginner in Settings after Intermediate starts the path again at step 1. Records from before the latest placement don't count.

## 2. One turn

One Claude call per turn (`lib/beginner.ts → runBeginnerTurn`, model `TURN_MODEL`, no thinking, streamed).

**The system prompt**, in this order:
1. **`content/it/prompts/beginner.md`, version 2026-11-07a: 1,550 words in 23 sections.**
   - *Who: you:* name, role, city, the setting ("Place (kind), neighbourhood", why they're there, today), and the character: age, traits, how they speak, whether the learner is a man or a woman, and first meeting or "met before" with the memory notes.
   - *Who: the learner:* a Beginner living in the country for a while; be the person you are and help them talk.
   - *English: brief:* at most two short sentences a turn, heard not shown; never say in English what the language then says.
   - *Language: what to keep:* everything to keep or say is in the language, each its own part.
   - *Language: phrases:* one or two easy phrases of 4–8 words in most turns.
   - *Opener: the place:* the first turn opens with one line in English about the place, varied (what's special, history, culture, weather); sometimes the name exchange.
   - *Flow: react, then move on:* react to what they said, then move on; an errand is a turn or two; no invented errand.
   - *Variety: not the same shape:* don't build every turn the same way.
   - *Voice: no narration:* no stage directions.
   - *Role: not a teacher:* never announce what you're doing.
   - *Question: one:* one question a turn, in the language; prefer a useful verb (Le piace…? / Vuole…?); one of two or one fact are fine.
   - *Answers: as a local says them:* offer the answer, sometimes two.
   - *Answers: one idea:* fewest words a local would use.
   - *Answers: their facts left blank:* "Sono di …" when you don't know.
   - *Words: reuse:* use a few words again.
   - *Language: easy:* short, common words, present tense, polite form.
   - *Facts: only what you're sure of.*
   - *Goodbye: offer it* as a phrase they can say.
   - *Lead: follow theirs.*
   - *Mistakes: never point out;* never praise.
   - *English: help when asked.*
   - *Reply: parts format:* the JSON below.
2. **The shared rules** (`content/it/prompts/dialogue.md`, 2026-11-06b), the same for every conversation: speech-to-text mishears, so don't correct what may be misheard; stay within your job; what happens follows what you've said; how it works at your place, not the customs everyone hears; a goodbye ends it.
3. **The stage's blocks** (`content/it/prompts/leveling.md`; section 4).

**The messages:** "(The person has just come in.)", the conversation so far as plain lines, then the learner's line. After their line the code adds a note: *"(The app checked: they said back one of the answers you offered…)"* or *"(Not one of the answers you offered: their own words, or speech-to-text mishearing them…)"* (`lib/dialogue/heard.ts`).

## 3. The reply

- **Parts**, in the order said: `english` (heard, not shown), `word` (a word or 4–8-word phrase in the language, with its English), `question` (in the language, with its English), `answer` (what they can say back, shown, not said). Words and questions carry a `gloss`, the short English she says right after them.
- **The code then enforces** (`tidyParts`): empty parts dropped; answers cut to the stage's maximum (2 at S1, 1 at S2 and S3); a gloss that repeats its own phrase is cleared, and names are taken out of glosses.
- **What she says** (`line`) is the spoken parts in order with their glosses; the answers aren't spoken. The app speaks the line in her voice, shows the language parts as bubbles with their English a tap away, and shows the answers to say back.

## 4. Stages and steps (`lib/path.ts`)

| Stage | Prompt | Blocks added | Answers |
|---|---|---|---|
| S1 | beginner.md | *Talk: stage 1*: the very start, one idea at a time, yes/no or this-or-that questions only, English up to two short sentences. *Answers: two*: offer two to choose from. | 2 |
| S2 | beginner.md | *Talk: stage 2*: short sentences, rephrase in the language before English, this-or-that or one simple fact. *Language: 2*: about half in the language. *Answers: one*: at most one, only when it helps. | 1 |
| S3 | beginner.md | *Talk: stage 3*: more in the language, one fact and now and then a simple open question, English only when asked. *Language: 4*: everything in the language. *Answers: frame*: the start of a sentence with … to finish. *Echo: new words*: glosses only for new words. | 1 |
| S4 | character.md (the Intermediate prompt) | the levels.md block "Beginner: still you, ask" | 0 |

- **Steps:** step 1 plays S1 ×5; step 2 plays S1, S2, S1, S1, S2; step 3 plays S2, S2, S2, S3, S3; step 4 plays S4; step 5 is Intermediate.
- **A support back:** after 2 hard conversations in a row, the stage below plays (S1 adds *Talk: support back*: say the key thing twice, a little more English) until 2 aren't hard.

## 5. Moving up (`lib/conversation-record.ts`, `lib/path.ts → RULES`)

When a conversation ends, its record is written (and rewritten if it went on after an early end):
- **One labelling call** marks each learner line as the language, English or mixed, and whether it asked for help with one word or the whole line.
- **Said back** is worked out in code (`isSaidBack`): word overlap with the answers shown, at most a quarter of the words different; an answer with a blank matches on the words around it.
- **Each line is one of:** help (word or whole), English, said back, or **own words**.
- **Counted:** at least **3 turns in their own words**. Said-back turns don't count toward it.
- **Hard:** lost (English instead of an answer, or asking for the whole line) on 40% or more of their turns.
- **Easy:** counted, own words on at least half their turns, lost at most once, at most 2 one-word help asks.
- **Up a step:** 4 easy of the last 5 counted conversations at the step. The step never goes down.
- **Intermediate back to step 4:** after 2 hard conversations in a row (leaving without a word counts as hard).

## 6. On main, not live yet

- **Replies written ahead** for each offered answer (1c87680): an answer said back is answered in ~0.1 s instead of ~2.5 s. Not released.
