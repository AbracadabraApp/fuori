# Conversation engine

Every line a character says comes from Claude. This document describes what each call receives, what it must return, and the rules that make the characters forgiving, helpful and consistent.

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
  "hint": "a phrase the learner could say next (English in brackets)",
  "mood": "warm | amused | busy | curious",
  "scene_over": false,
  "memory_notes": ["Learner said they are from Chicago", "Ordered a cornetto alla crema"]
}
```

`correction` and `hint` may be null. `memory_notes` are facts worth remembering about the learner, saved for later scenes.

## Character prompt layers

Build the prompt from stable layers first so it caches well:

1. **House rules** (same for every call): how to speak to an A1–A2 learner, forgiveness, correction style, JSON format.
2. **Character sheet** (stable per character): name, age, job, personality, how they speak (formal/informal, regionalisms, pace), what they care about, a secret or opinion.
3. **Relationship** (changes slowly): familiarity level, what they remember about the learner.
4. **Scene** (per scene): place, time of day, goal steps, steps already done, words to recycle today.
5. **Transcript** (per turn): the conversation so far and the learner's latest line.

## Speaking at the learner's level

At A1–A2 the character should:
- Use 1–3 short sentences per turn.
- Prefer present tense, *passato prossimo* sparingly, no subjunctive.
- Use common vocabulary; introduce at most one or two new words per turn, ideally ones the scene needs.
- Ask a simple question back to keep the learner talking.
- Speak naturally for their character: Giulia is quick, Rita is slow and clear. The TTS speed control handles the rest.

## Forgiveness

The learner's words arrive through speech recognition, so:
- Ignore punctuation, capitalisation, missing accents and spellings that sound right.
- Read near-misses as the most plausible intended word ("cornetta" → cornetto, "quando costa" → quanto costa).
- If the recognizer produced English-sounding words, reconstruct the Italian phonetically ("bone journal" → buongiorno). Show it as "Understood as …".
- Transcription artefacts are never counted as mistakes.

## Correction style

- Correct only errors that matter: wrong word, English word, wrong verb form, wrong article or gender, an unnatural phrase.
- In character, correct by **recasting**: use the right form naturally in the reply. Never lecture.
- At most one correction per turn; let small slips go.
- Report the correction separately in `correction` so the UI can show a quiet note and the diario can collect it.
- Track repeat errors per learner; a mistake that keeps coming back becomes a "try tomorrow" goal.

## Encounters

The open-ended evening conversation needs scaffolding to work at A1–A2:
- Each encounter character has a **hidden agenda**: a topic they want to talk about, an opinion, something they want to learn about the learner. The character leads with questions, so the learner reacts rather than carries the conversation.
- **No goal checklist**, but the server tracks a soft arc: greeting → their topic → your story → a natural goodbye.
- **Length**: about 8–12 exchanges or 5 minutes. After that the character finds a natural reason to leave ("Devo andare, mio nipote mi aspetta!") and sets `scene_over`.
- **Help** is always available through the "Come si dice…?" button. The character may also simplify or switch topic if the learner is stuck twice in a row.
- At the end, the character produces a one-line note for the diario.

## Memory

Two kinds, both stored per learner:

- **Character memory**: what each recurring character knows about the learner (name, where they're from, what they ordered, what they talked about, promises like "come back Friday"). Built from `memory_notes`, deduplicated and summarised at the end of each day.
- **Learner profile**: level estimate, known words with last-used dates, recurring mistakes, preferred help settings.

The end-of-day summary runs once per day and is not latency-sensitive, so it can use a stronger model and more thinking than the in-scene turns.

## Quality checks to build early

Keep a small set of recorded learner turns (with transcription noise) and expected behaviour, and rerun them when the prompts change:
- English-dictated Italian is reconstructed, not corrected.
- A real gender error is recast in character and reported.
- The character never switches to English unprompted.
- Goal steps are ticked only when actually done.
- Replies stay within 1–3 sentences at A1.
