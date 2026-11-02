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
