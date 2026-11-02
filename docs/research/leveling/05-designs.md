# Leveling: candidate designs (Phase 2)

2026-11-02 · Claude, from [00](00-what-we-know.md)–[04](04-measuring-the-learner.md) · Scope: Beginner → Intermediate (Josh). Proposals for prototyping, nothing decided.

## Direction check after the research

Nothing found argues against building a leveling system. Four findings change *what* it should be:

1. **Level moves between conversations, not inside one.** Every product that works sets level outside the conversation; live in-conversation adaptation draws complaints both ways (02). About 5 conversations make a stable estimate (04).
2. **"Followed on first hearing" is the weaker lever.** Pre-simplified input didn't beat unmodified input; repeating, rephrasing and letting the learner ask did (01, 03). The measure should be "followed, with how much help", and the prompt should ask for repair, not just simplicity. That may also fix "simpler means flatter".
3. **A prompt alone tops out around 60–90% of lines at level**, and slides over a long conversation (03). Fuori's best Beginner blocks are already there. Getting higher needs a check before a line plays, which costs time.
4. **Measure the learner from whole conversations, not lines** (04). Josh's "90% of speech at the next level" can't be scored line by line; "4 of the last 5 conversations judged ready" can. Whisper tidies learner errors, so it pushes moves up too early: lean on counts it can't tidy (English share, help asks, own words vs repeating the offered answer).

The working hypothesis (the syllabus as the one scale) survives for **what a learner has been taught**, not for **how characters talk**: phrase and word lists in the prompt have failed in Fuori and in the research.

## Shared pieces (all designs)

- **One stored value per learner:** a step on a ladder from the first Beginner stage to Intermediate (replacing the Beginner/Intermediate jump).
- **Each step is written as how the person talks**, in the CEFR's own terms (01): how slow, how often they repeat and rephrase, what kind of question they ask (yes/no → this-or-that → one fact → open), how much English is heard. Plus which of the Beginner supports are on (Josh's fading plan).
- **A B1 block for Intermediate**, which has never existed (00). Small, and every report recommends it.
- **A record per conversation**, no extra call: learner turns, own-words turns vs repeats of an offered answer, English share (Whisper's detected language), help asks ("say it in English", Learn), silent turns, speech rate from Whisper's timings.
- **Never move the label down by itself.** If a learner struggles, a support comes back on; the step stays.

## Design A · The counted ladder (cheapest)

- **Move:** after each counted conversation (3+ own-words turns), look at the last 5. Step up when 4 of 5 were "easy": low English share, few help asks, mostly own words. Turn a support back on when 2 in a row were "hard".
- **Extra calls:** none. Fits Josh's rule "counting, not judges, for scaffolding and fading".
- **Risk:** counts track listening comfort, not speaking quality; a confident but inaccurate learner climbs.

## Design B · The ladder plus one speaking judge

- A plus one judge call when a conversation ends, rating the learner's speech as a whole against CEFR descriptors (r 0.76 with examiners, 04), allowed to say "not enough to tell".
- **Move:** listening comfort (the counts) moves how characters talk; speaking (the judge) is required for the step into Intermediate. That's Josh's split: listening sets the talk, speaking decides moving up.
- **Extra calls:** one per conversation, off the critical path.
- **Risk:** the judge on A1–A2 speech is the least-studied case; the Italian exam corpus LIPS (04) could calibrate it later.

## Design C · B plus a check before a line plays

- B, plus a fast score on each character line; a clear miss is regenerated once, asking her to say it more simply, repeat or rephrase, keeping the persona.
- **Extra calls:** one per turn on a small model, plus a retry on misses. Breaks the "one call per conversation" budget.
- **Why prototype it:** it's the only way the research found to go past what a prompt can do. The prototype tells us what it buys (share of lines at level) for what it costs (seconds per turn).

## How the prototypes compare them

Same inputs for all three: simulated learners at the first Beginner stage, mid-Beginner and early B1 who improve over 15 conversations (and one who doesn't), in Italy and Mexico, plus replays of Josh's real conversations. Scored by a separate judge that hasn't seen the designs:

- share of character lines a learner at that step can follow, with and without help counted
- does the step climb for the improving learner, and stay put for the flat one
- character liveliness (the existing quality score)
- added seconds per turn and cost

Simulated learners are too competent and too even (02), so the numbers compare designs; they don't predict real learners. Real play decides.

## Josh's idea: context, and asking (2026-11-02)

- **Context counts as level.** Someone who's lived in Italy, or knows food and customs, follows more with the same words: a known topic makes listening easier. A traveller and a first-time tourist at the same A2 are different learners.
- **The game can ask.** Characters can ask what real people ask a newcomer (*sei mai stato in Italia? quanto ti fermi?*) and, when it fits, *parlo troppo veloce?* The answers feed the learner's profile and the ladder directly, instead of only inferring them. Keep it occasional, so a conversation never turns into an intake form.
- **The simplest form (Josh):** a character asks how it's going: *Come va con l'italiano? Troppo difficile o va bene?* (*¿Cómo vas con el español?* in Mexico; the words come from content). Read it asymmetrically: "too hard" turns a support back on; "easy" counts as one vote toward stepping up, since beginners overrate themselves (04). (That "too hard" is the more trustworthy answer is Claude's assumption, not from the research.)

### A small set of questions with a metric each (Josh, 2026-11-02; Claude's draft)

| Question, in role | When | Metric | Feeds |
|---|---|---|---|
| *Come va con l'italiano? Difficile o va bene?* | About every 3rd conversation | Comfort: hard / fine / easy, as a trend | Supports back on, or a vote to step up |
| *Parlo troppo veloce?* | When the counts are mixed (some English, some help asks) | Pace: too fast / fine | Speech speed and repeating |
| *Sei mai stato in Italia? Quanto ti fermi?* | Once, early | Context: first time / visited / lived there | Starting step; how much is explained |
| *Cosa ti porta qui?* | Once, early | Purpose: moving, family, work, love of it | Topics and which lessons come first |

- One question per conversation at most; the background ones only once. Never a survey.
- Asked by whoever it fits; Beginners get the answers as bubbles to say back.
- The answer is read by the call that already runs when a conversation ends (memory), so no new call and no keyword matching.
- Words come from content, so Mexico gets its own.

### Weighed against everything else (2026-11-02, at Josh's request: no special weight for his ideas)

Ranked by evidence and cost, the asks sit in the middle and at the bottom:

1. **Strong evidence, small cost:** the B1 Intermediate prompt; moving level between conversations on a 5-conversation window; the counts (English share, help asks, own words vs said back); asking characters to repeat and rephrase; measuring live lines.
2. **Good evidence, one call:** the end-of-conversation speaking judge (design B).
3. **Cheap, weak as a measure of level:** the comfort question. Self-rating tracks tested speaking only loosely (r ≈ 0.44, 04). Keep it as a tiebreaker and an early warning, not a driver.
4. **Plausible, small:** the background question, once. Knowing the topic helps listening, but it's general knowledge, not in the four reports, and a learner who has lived there usually places higher anyway. Could live in onboarding.
5. **Costly per turn:** the line check (design C); the prototype decides.
6. **Drop for leveling:** the pace question (the counts already show struggle, and speed is better set by measuring speech rate); the purpose question (useful for topics and lessons, but it isn't leveling: move it to Learn or memory).

Net: the asks add little that the counts don't already give. Keep the comfort question as one cheap extra input; leave the rest out of the leveling design.

## Josh's framing: one equation (2026-11-02)

Josh: "a static model of language but dynamic measure of proficiency and dynamic measure of teaching (UI, speed, vocabulary, complexity, etc). Some simultaneous equation that makes the conversation flow at the right level."

Claude's reading, as the rating systems in [02](02-products.md) work (Elo, Math Garden, Duolingo):
- **Static:** the map of the language: syllabus units and CEFR steps, the same for everyone.
- **Dynamic, the learner:** one ability number, updated after each conversation from what happened (followed, help asked, own words).
- **Dynamic, the teaching:** a difficulty number for the conversation, the sum of its settings (vocabulary, complexity, speed, question kind, minus the supports: English echo, answers to say back, subtitles).
- **The equation:** pick the settings so the predicted chance of following sits at a target (research: around 90–95% of words; Math Garden aims at 75% correct). Learner up → settings get harder; a hard conversation → the learner number drops a little and a support comes back.
- **Two loops:** per learner after every conversation (the learner number); across all learners, now and then (how much each setting really adds, fitted from everyone's results). The research sets the starting weights.

## Josh: turns and use as the signal (2026-11-02)

Josh: number of turns may be the strongest indicator, of growing immersion and use if not of learning; and if learners don't use it, that's a clear signal too.

Claude's read: the strongest **outcome** signal for the system (free, unbiased by Whisper, any language), weaker as a **level** signal on its own: more turns can also mean struggling (*come?*, repeats), and turns depend on the character and the scene. Sharper versions: turns in the learner's own words, and their trend over conversations. Proposed use: coming back and own-words turns as the goal the cross-learner loop tunes for; the level measures as guardrails.
- **Refined (Josh):** words spoken, not turns. Engagement is far easier to measure than progression, and it generates the data in which progression shows (or doesn't). Count all the learner's words, English included (Josh: not sure the language matters): that's the engagement number. The share in the language, and in their own words rather than repeating an offered answer, is how progression shows in it over time.
