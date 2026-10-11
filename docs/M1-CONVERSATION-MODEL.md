# M1 Conversation Model - True Implementation

**The hypothesis:** Can natural conversation alone drive language learning?

This is the source of truth for how M1 conversations work. Where it disagrees with `04-conversation-engine.md` (the fuller, older design), this document wins for M1.

**In the code:** prompt in `lib/prompts/build-turn-prompt.ts`, the Claude call in `lib/turn.ts` (used by `/api/turn` and the tests), which character is at which place in `lib/characters/for-place.ts`.

## M1 Scope: Radically Minimal

**What's in M1:**
- City cards → Place cards → Voice conversation
- Portrait + Mic button
- Pure voice interaction
- Settings: optional text support (Italian transcripts, English translation)
- That's it

**What's NOT in M1:**
- No Magda (tutor)
- No Diario (journal)
- No help buttons
- No speech bubbles (learner's garbled input is never shown)
- No replay button (say "ripeti" instead)
- No corrections shown
- No vocabulary tracking
- No goals checklist
- No scaffolding UI of any kind

**Everything happens through speaking.**

## The Prompt: Keep It Simple

```
You are [Name], a [age]-year-old [role] in [city].
Right now you are here: [place and setting].
[Personality traits]. You use [tu/Lei].

This person is learning Italian. Match their level - if they use simple Italian, keep it simple. If they use more sophisticated Italian, follow their lead.

When they say "ripeti", repeat what you just said.
When they struggle, simplify naturally.
You're hearing their speech through speech-to-text, not reading their writing. Never comment on spelling; if something comes through garbled, respond to what they most likely meant.
Say things once. React like a real person: be curious about them, have small opinions, let your own day show.
Stay in character. Speak Italian.

Respond with JSON:
{ "it": "your reply in Italian", "en": "English translation" }
```

**That's the entire system prompt. Everything else emerges naturally.**

## How It Works

**Character adapts based on:**
- The learner's actual Italian (simple? sophisticated?)
- Context (ordering coffee vs deep conversation)
- Relationship (first meeting vs regular customer)
- Real-time signals (confusion, understanding, requests)

**No counting:**
- No word limits per sentence
- No vocabulary limits per turn
- No explicit level gates
- No grammar rule enforcement

**Just: Real person talking to learner, naturally adjusting.**

## Optional Text Support

M1 is voice-first, but learners can enable text in Settings:

**Show Italian transcripts** (on by default):
- Character's Italian is shown as text
- Helps with reading comprehension and spelling
- Learner's garbled speech-to-text input is never shown (preserves immersion)

**Show English translation** (off by default):
- English translation appears below the Italian
- Off by default to encourage immersion
- Useful for complete beginners or when stuck

**Allow dialect** (coming soon):
- When enabled, characters may use regional words and pronunciations
- Off by default (standard Italian only)

These are learner preferences, not teaching tools. The conversation itself remains unchanged - everything happens through speaking.

## Natural Help - All Voice

Learners control difficulty by speaking:

**To repeat:**
- "Ripeti per favore"
- "Ancora una volta"
- "Come?"
- "Cosa?"
- Even imperfect: "uh... again?"

**To simplify:**
- "Più lentamente"
- "Piano piano"
- Show confusion repeatedly

**To request English:**
- "Scusi, parla inglese?"
- "English?"
- Code-switch to English

**Character responds naturally based on:**
- Their personality
- Whether they speak English (some do, some don't)
- The situation
- Always guides back to Italian after brief help

## Character Memory (Minimal)

Track only what matters for natural conversation:
- Name (if learner mentioned it)
- Where they're from (if they said)
- Previous visits (regular customer vs first time)
- Promises ("Come back Friday!")

**Store as simple notes, not structured data.**

**How it works (decided 2026-10-10, part of M1):**
- Stored in **Railway Postgres** (`character_memories`), keyed by an anonymous learner id kept in a server-set cookie. Not on the phone: Safari erases site storage after about a week without a visit. See [Architecture](05-architecture.md#where-learner-data-lives-decided-2026-10-10).
- **When a conversation ends,** one Claude call turns the transcript into a few short notes (at most ~10 lines), merged with what the character already remembered.
- **Next conversation,** the notes and visit count go into the character's prompt, e.g. "You've met them 3 times. You remember: their name is Josh; from Seattle; always orders a cappuccino." The character uses them naturally, the way a real barista would, not by reciting them.
- Familiarity levels (stranger → friend, *Lei* → *tu*) are M2.

## The Conversation API

`POST /api/turn`

**Input:**
```typescript
{
  character: CharacterSheet,  // from lib/characters/for-place.ts
  transcript: Turn[],         // previous turns: { who: 'npc' | 'learner', transcript }
  learnerSaid?: string        // what they just said; omit on the first turn (the character opens)
}
```

**Output:**
```typescript
{
  it: string,  // Italian reply (spoken aloud)
  en: string   // English translation (shown if enabled in Settings)
}
```

Two fields only. Claude's structured output guarantees the shape, and Zod checks it. Nothing else (corrections, hints, goals, mood) is extracted. All of that happens inside the conversation.

## Why This Works

1. **Claude is already good at this** - Tell it to talk to a beginner, it knows how
2. **Real-time adaptation** - Sees struggle → simplifies. Sees understanding → relaxes
3. **Natural speech** - No word counting, no artificial limits
4. **Simpler code** - One prompt, simple output, less complexity
5. **Matches philosophy** - Pure immersion, not a structured course

## What We're Testing

**The core hypothesis:**
- Can you learn Italian just by talking to people?
- No explicit teaching
- No structured lessons
- No vocabulary drills
- Just: have conversations

**If M1 works:** Language learning through pure immersion is viable

**If M1 needs help:** Add M2 layer (Magda, Diario, reflection)

But test the simple version first.

## Implementation Notes

**Who you talk to.** Each place has one character.
- **Anchors** (Giulia, Rita in Roma) have hand-written sheets in `content/it/characters/`.
- **City characters** (about 600, one per place, in `content/it/cities/*.ts`) have a name, age, role, personality and portrait. `for-place.ts` turns them into a sheet: formal *Lei* (you're a stranger), setting = place and neighbourhood, English ability unspecified.

**The prompt uses only:** name, age, role, city, setting, personality traits, tu/Lei and English ability. Other sheet fields (speech description, cares about, secret, regionalisms) exist for later and are not sent in M1.

**English ability** (`englishAbility` on the sheet):
- `fluent`: can briefly explain in English when asked, then back to Italian
- `basic`: a few simple English words if the learner is really stuck
- `none`: no English; simpler Italian, slower, with gestures
- unspecified: no instruction; the character just speaks Italian

**Memory is not built yet.** It is planned for M1 (see "Character Memory" above). Until it's built, each conversation starts fresh.

**Prompt built from:**
1. Character basics and where they are
2. "Learning Italian, match their level"
3. Natural help: ripeti, simplify when they struggle, hearing speech not writing, say things once, react like a person
4. English ability (if set)
5. Output format: JSON with it/en
6. The conversation so far, then what they just said

## Testing

`npm run test:conversations` runs simulated conversations with Giulia, Rita and a random sample of city characters, using the real prompt. A simulated learner makes realistic mistakes and says when they don't understand. A grader scores each character on four things: speaks Italian, understands imperfect speech, adapts when the learner is lost, feels like a real person. The report suggests up to 3 changes and never edits files. Complex, natural Italian is not penalized; what counts is how the character responds to confusion. See `tests/README.md`.

## The Radical Bet

Strip away all the structure, all the scaffolding, all the "learning app" features.

Just: talk to people.

That's M1.
