# Conversation engine

Every place, person and line in Fuori comes from Claude. This document describes the calls that make the world (suggestions, scenes, characters), the call that runs each conversation turn, and the rules that make characters forgiving, helpful and consistent.

## Making the world

Three generation calls run before any conversation. All return structured JSON and are stored, so nothing is generated twice.

### The director: daily suggestions (`/api/suggest`)

Runs once at the start of each in-game day. Input: the city pantry ([Cities and people](03-journey.md)), the learner profile and level, recurring mistakes, stale quaderno words, yesterday's "try tomorrow" goals, Magda's latest lesson, and the people the learner knows (with familiarity and memories).

Output: 3–4 suggestions plus one "cambia aria" option. Each suggestion names:
- **a place** (from the pantry, or a plausible new one),
- **who is there** (a known character's id, or a short brief for a new person),
- **a light goal** (0–4 steps; none for evening conversations),
- **why** (which learning need it serves; shown nowhere, used for testing),
- **a tile caption** in Italian ("Il bar di Giulia", "Un pomeriggio a Monti").

Rules: mix known people and new ones; recycle what the learner needs without saying so; match situations to the level; put the evening conversation last; offer moving on when the learner has stayed a while or conversations are getting easy.

### Scenes (`/api/scene`)

Runs when the learner picks a suggestion or says "vai dove vuoi" ("voglio andare in una libreria"). Turns it into a scene: setting, time of day, goal steps, an **opening guide** (see below), words to recycle, and for evening conversations a hidden agenda. If the person is new, it calls character generation first.

### Characters

- **Anchors** (Rita, Giulia in Roma) are hand-written in `content/it/`.
- **Everyone else is generated** on first meeting from the city, place and role: name, age, personality, what they care about, a secret or opinion, how they speak (Lei/tu, pace, a regional touch), and an appearance description for their avatar. Same shape as a hand-written sheet ([Data model](09-data-model.md)).
- **Saved immediately**, so they persist and remember the learner. Avoid repeating names or personalities already in the learner's world.
- **Magda** is special: a fixed character sheet with tutor rules (see [Magda](#magda-tutor-mode)).

## One turn

```
learner speaks
  → speech-to-text (Italian)
  → server builds the prompt: character + scene + learner profile + memory + transcript
  → Claude returns structured JSON
  → UI shows the reply, plays it as speech, ticks goals, adds words, shows any correction
```

### Turn output (JSON)

Carried over from the prototype, with additions:

```json
{
  "understood": "the Italian the character took the learner to mean",
  "it": "the character's reply in Italian",
  "en": "English translation",
  "correction": { "said": "…", "better": "…", "why": "under 15 words" },
  "words": [{ "it": "…", "en": "…" }],
  "steps_done": [0, 1],
  "hint": "a phrase the learner could say next (Italian only)",
  "confused": false,
  "mood": "warm | amused | busy | curious",
  "scene_over": false,
  "memory_notes": ["Learner said they are from Chicago", "Ordered a cornetto alla crema"]
}
```

**Field notes:**
- `correction` may be null (most turns have no correction)
- `hint` may be null (should be null most of the time - see below)
- `confused` is true only when the character genuinely didn't understand what the learner meant
- `memory_notes` are facts worth remembering about the learner, saved for later scenes

**About hints:**
- `hint` should be `null` for most turns - let the conversation flow naturally
- Provide a hint only when:
  - `confused: true` (you genuinely didn't understand)
  - The learner is clearly stuck (same failed attempt twice)
  - The learner explicitly asked for help
- The UI only shows hints when `confused: true` or user requested help
- Most conversations should have natural back-and-forth without scaffolding

### Opening lines

The character speaks first, and that line is generated too, never read from a script. Each scene has an opening **guide** (what the line should do, e.g. "greet them as a regular, mention yesterday, offer the usual") and a written **fallback** line used only if the call fails.

The opening call gets the same prompt layers as a normal turn, with no learner line yet, so the greeting can draw on familiarity and memory ("Allora, ti è piaciuto il supplì?"). Two results:
- Returning to the same person never repeats the same greeting word for word.
- No greeting needs writing in advance: a guide like "an ordinary morning; pick up on something from recent days" is enough.

## Character prompt layers

Build the prompt from stable layers first so it caches well:

1. **House rules** (same for every call): forgiveness, correction style, JSON format.
2. **Level rules** (changes rarely): the learner's current CEFR step from `content/it/levels/`, including how much dialect is allowed.
3. **Character sheet** (stable per character): name, age, job, personality, how they speak (formal/informal, regionalisms, pace), what they care about, a secret or opinion.
4. **Relationship** (changes slowly): familiarity level, what they remember about the learner.
5. **Scene** (per scene): place, time of day, goal steps, steps already done, words to recycle today.
6. **Transcript** (per turn): the conversation so far and the learner's latest line.

## Speaking at the learner's level

The level rules set the limits; at A1–A2 the character should:
- Use 1–3 short sentences per turn.
- Prefer present tense, *passato prossimo* sparingly, no subjunctive.
- Use common vocabulary; introduce at most one or two new words per turn, ideally ones the scene needs.
- Ask a simple question back to keep the learner talking.
- Speak naturally for their character: Giulia is quick, Rita is slow and clear. The TTS speed control handles the rest.
- Keep regional dialect to at most one touch per conversation (*daje*, *aò*). More comes with higher levels.

## Providing help naturally

The learner is having a conversation, not doing a lesson. Help through natural dialogue, not by breaking character or scaffolding every turn.

**Learners control difficulty through natural language (M1):**
Learners don't need UI buttons - they naturally express when they need help, and characters respond appropriately:

**When learners need repetition:**
- "Ripeti per favore", "Ancora una volta", "Come?", "Cosa?", "non capito"
- Even imperfect requests: "uh... again?", "sorry what"
- Character repeats naturally: "Certo. Vuoi. Un. Caffè?"
- Claude recognizes intent across all variations

**When learners need simplification:**
- "Più lentamente", "Piano piano", repeated confusion
- Character simplifies: "Piano piano... cosa vuoi?"
- Uses shorter sentences, common words, stays patient
- Backend can adjust TTS speed

**When learners request English:**
- "Scusi, parla inglese?", "English?", code-switching to English
- Character responds based on personality and setting (character sheet includes English ability)
- If yes: brief help, then guide back to Italian - "Yes! You want coffee? Ok, in italiano: vuoi un caffè?"
- If no: apologize warmly, simplify Italian further - "Mi dispiace, solo italiano. Ma piano piano..."
- Most characters return conversation to Italian after one exchange

**Stay in character to help:**
- Offer options: "Vuoi un caffè? O un cappuccino?"
- Rephrase more simply: "Piano piano, cosa vuoi ordinare?"
- Suggest possibilities: "Forse un cornetto? O un biscotto?"
- Never lecture, never break the fourth wall

**When to set `confused: true`:**
- Only when you truly can't reconstruct what they meant from the transcript
- Not for small errors (those get forgiven)
- Not for transcription noise (reconstruct it)
- Only when even after generous interpretation, you don't understand their intent

**Most turns should be:**
- `hint: null` (let conversation flow)
- `confused: false` (you understood, even if imperfectly)
- Natural back-and-forth like talking to a patient Italian friend

**Examples of natural help (good):**

Learner: "Uh... cappuccino... and... uh..."
Character: "Un cappuccino, certo! E qualcosa da mangiare? Abbiamo dei cornetti freschi."
(Stays in character, offers options, moves conversation forward)

Learner: "I want... uh... ticket?"
Character: "Un biglietto? Per dove vuoi andare?"
(Forgives English, offers the Italian naturally, asks a guiding question)

**Examples of over-scaffolding (avoid):**

Learner: "Cappuccino please"
Character: "You said 'please' but in Italian we say 'per favore'. Try again!"
(Too much like a teacher, breaks immersion)

After every successful exchange: "Try: [phrase to say next]"
(Over-helps, doesn't let learner think)

## Forgiveness

The learner's words arrive through speech recognition, so:
- Ignore punctuation, capitalisation, missing accents and spellings that sound right.
- Read near-misses as the most plausible intended word ("cornetta" → cornetto, "quando costa" → quanto costa).
- If the recognizer produced English-sounding words, reconstruct the Italian phonetically ("bone journal" → buongiorno). Show it as "Understood as …".
- Transcription artefacts are never counted as mistakes.

## Correction style: Never break character

**Characters never teach.** They're real people living their lives, not language instructors.

**How characters handle errors:**
1. **Recast naturally** - "Ah, *vorrei* un caffè! Certo!" (not "You should say vorrei")
2. **Simplify when struggling** - Shorter sentences, slower speech, more familiar words
3. **Ask for clarification** - "Scusa, non ho capito. Cosa vuoi?" (when genuinely confused)
4. **Stay in the scene** - Never break the fourth wall, never lecture

**M1: Pure immersion**
- Corrections tracked in backend but not displayed
- No UI interrupts conversation flow
- Characters recast naturally during conversation
- All reflection/teaching moves to M2

**M2: Adds reflection layer**
- **Diario:** UI shows corrections as quiet notes after conversations
- **Magda:** Explicit teaching mode
  - She's the only character who can teach or explain
  - Messages you when mistakes pile up: "Ho notato che dici 'voglio' invece di 'vorrei'..."
  - Weekly lessons that synthesize patterns
  - Bridge to real lessons with your actual teacher
- **"Try tomorrow" goals:** Track repeat errors → integrated into future scenes

**The rule: Immersion during conversation, reflection afterward.**

## Open conversations

The evening suggestion is usually someone new with no goal checklist. To keep it workable at A1–A2:
- Each encounter character has a **hidden agenda**: a topic they want to talk about, an opinion, something they want to learn about the learner. The character leads with questions, so the learner reacts rather than carries the conversation.
- **No goal checklist**, but the server tracks a soft arc: greeting → their topic → your story → a natural goodbye.
- **Length**: about 8–12 exchanges or 5 minutes. After that the character finds a natural reason to leave ("Devo andare, mio nipote mi aspetta!") and sets `scene_over`.
- **Help** is always available through the "Come si dice…?" button. The character may also simplify or switch topic if the learner is stuck twice in a row.
- At the end, the character produces a one-line note for the diario.

## Magda (tutor mode) - M2

**Not included in M1.** Magda is part of the M2 reflection layer.

Magda runs with different rules from every other character:
- She **may teach**: explain grammar briefly, in English when it helps, and run short spoken exercises ("Dimmi tre cose che hai fatto ieri").
- Her input is the learner's mistakes, quaderno and level profile, not a place.
- **Triggers** (checked at the end of each day): a mistake repeated three or more times, evidence the learner is near the next level step, or a hard situation coming up (moving city, a doctor). She sends a short message; tapping it opens a lesson.
- **Weekly lesson:** the week's top mistakes, one new structure, and a "try this" that the director then works into the next days' suggestions.
- **Summary for real lessons:** a one-page export of recurring mistakes, new words and transcripts worth discussing.

## Memory

Two kinds, both stored per learner:

- **Character memory**: what each recurring character knows about the learner (name, where they're from, what they ordered, what they talked about, promises like "come back Friday"). Built from `memory_notes`, deduplicated and summarised at the end of each day.
- **Learner profile**: CEFR level step with the evidence behind it, known words with last-used dates, recurring mistakes, preferred help settings.

The end-of-day call (diario, memory summaries, level evidence, Magda triggers) runs once per day and is not latency-sensitive, so it can use more effort than the in-scene turns.

## Quality checks to build early

Keep a small set of recorded learner turns (with transcription noise) and expected behaviour, and rerun them when the prompts change:
- English-dictated Italian is reconstructed, not corrected.
- A real gender error is recast in character and reported.
- The character never switches to English unprompted.
- Goal steps are ticked only when actually done.
- Replies stay within 1–3 sentences at A1.
- Daily suggestions work in the learner's recurring mistakes and include one change of scenery.
- Generated characters don't repeat names or personalities already in the learner's world.

These become the simulated-learner test ([Testing → 4b](10-testing.md#4b-simulated-learner)).

## Pedagogical foundations

Fuori's teaching model draws on established second language acquisition research, particularly communicative language teaching (CLT) and inductive learning approaches used in successful textbooks like Progetto Italiano. This section documents the theoretical grounding that informs Claude's behavior as a conversational partner.

### Communicative Language Teaching (CLT)

**Core principle:** Language is learned through meaningful communication, not explicit grammar instruction.

**How Fuori implements this:**
- Characters never "teach" - they're real people having conversations
- Goal is communication success, not grammatical perfection
- Learners acquire language by using it in authentic contexts (ordering coffee, meeting neighbors, exploring markets)
- Errors are addressed through natural conversation repair, not overt correction

**Research basis:** CLT recognizes that recasting (reformulating a learner's utterance while maintaining focus on meaning) is effective corrective feedback that doesn't disrupt communication. Characters in Fuori recast naturally: "Ah, *vorrei* un caffè! Certo!" rather than "You should say vorrei."

### Fluency and Accuracy Balance

**The tension:** Pure fluency focus can lead to fossilized errors; pure accuracy focus kills spontaneity.

**How Fuori balances:**
- **During conversation:** Fluency first. Characters keep conversation flowing, forgive errors, stay in character
- **After conversation:** Accuracy reflection. The diario shows corrections as quiet notes, tracks patterns
- **With Magda:** Explicit accuracy work. Weekly lessons address recurring mistakes systematically
- **Through scaffolding:** Characters adjust their speech complexity based on learner struggle without breaking immersion

**Design insight:** Separating the immersive conversation from the reflective correction prevents the "teacher constantly interrupting" problem while still supporting accuracy development over time.

### Inductive Learning and Guided Discovery

**Progetto Italiano approach:** Present language in context, let learners notice patterns, then provide explicit rules.

**How Fuori adapts this for conversation:**
- Characters use target structures naturally in context (subjunctive, conditional, past tenses)
- Learners encounter patterns repeatedly across different situations
- Magda's role is to highlight patterns the learner has already encountered: "Ho notato che dici 'voglio' invece di 'vorrei'..." - the learner has heard *vorrei* many times in context before the explicit lesson
- The quaderno tracks new words and structures encountered organically

**Why this works:** Adults learning languages benefit from both implicit exposure and explicit pattern recognition. Fuori provides exposure through conversation, pattern recognition through Magda and the diario.

### Zone of Proximal Development (ZPD) and Scaffolding

**Vygotsky's ZPD:** The space between what a learner can do alone and what they can do with support.

**How characters scaffold naturally:**
- Offer options when learner is stuck: "Vuoi un caffè? O un cappuccino?"
- Simplify language when sensing struggle: shorter sentences, slower speech
- Ask guiding questions: "Per dove vuoi andare?"
- Provide contextual hints without breaking character
- The `confused` flag triggers more explicit help only when genuinely needed

**Implementation guideline:** Most turns should have `hint: null`. Scaffolding should feel like a helpful Italian friend, not a patient teacher running drills.

### Forgiveness and Comprehensible Input

**Krashen's Input Hypothesis:** Language acquisition happens when learners receive comprehensible input slightly above their current level (i+1).

**How Fuori implements:**
- Level rules constrain character speech to appropriate complexity (A1: present tense, short sentences; A2: some past tense, compound sentences)
- Characters introduce 1-2 new words per turn, ideally ones the scene makes useful
- Speech recognition forgiveness means transcription noise never becomes a learning obstacle
- Characters reconstruct intent generously, allowing focus on meaning over form

**The forgiveness rule:** "cornetta" → cornetto, "bone journal" → buongiorno. Transcription artefacts are never treated as mistakes.

### Cultural Learning Through Authentic Material

**Progetto Italiano approach:** Integrate Italian civilization and culture throughout, use authentic materials, represent modern Italy.

**How Fuori extends this:**
- Every place is culturally grounded (markets work differently than cafés, neighborhoods have distinct characters)
- Characters have authentic personalities, opinions, regional touches
- Evening conversations explore topics that matter to Italians (food, family, local identity)
- City pantries represent real Italian urban life, not tourist stereotypes

**Open questions for M2+:**
- Food culture conversations (why is carbonara made this way?)
- Reading authentic materials (museum plaques, menus, train announcements)
- Dialect progression with level (more regionalisms as competence grows)

### Error Correction Without Breaking Immersion

**Research consensus:** Corrective feedback helps, but delivery matters. Implicit correction (recasts) preserves flow; explicit correction can inhibit output.

**Fuori's hybrid model:**
- **In conversation:** Implicit correction through natural recasts. Characters never say "that's wrong, say it like this"
- **In the diario:** Explicit but non-intrusive. Corrections appear as notes after the scene, learner reviews when ready
- **With Magda:** Explicit teaching in a dedicated learning mode, clearly separate from immersive conversations
- **Through repetition:** Mistakes become "try tomorrow" goals, naturally integrated into future scenes

**The rule:** Immersion during conversation, reflection afterward.

### Implications for Prompt Engineering

These pedagogical principles directly inform the character prompt layers:

1. **House rules:** Forgiveness, natural recasting, staying in character → implements CLT principles
2. **Level rules:** Vocabulary and grammar constraints → provides appropriate ZPD and comprehensible input
3. **Character sheet:** Personality, speaking style, regional touches → creates authentic communication partners
4. **Relationship:** Familiarity and memory → enables natural conversations that build over time
5. **Scene goals:** Light structure without drilling → balances task and communication naturally
6. **Magda's rules:** Explicit teaching permission → provides the accuracy reflection that complements communicative practice

### Sources and Further Reading

Research frameworks informing this design:
- Communicative Language Teaching: Implicit recasting, fluency/accuracy balance
- Zone of Proximal Development (Vygotsky): Scaffolding within learner capability
- Comprehensible Input (Krashen): i+1 exposure through level-appropriate speech
- Progetto Italiano methodology: Inductive learning, cultural integration, authentic materials
- Task-Based Language Teaching: Goals provide structure without prescribing language

**Design philosophy:** Don't implement pedagogy deterministically (rigid rules, explicit drills). Instead, inform Claude's conversational behavior so characters naturally act like effective language partners - patient, helpful, authentic, and most importantly, real people you want to talk to.
