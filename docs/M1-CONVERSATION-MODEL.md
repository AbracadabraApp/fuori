# M1 Conversation Model - True Implementation

**The hypothesis:** Can natural conversation alone drive language learning?

## M1 Scope: Radically Minimal

**What's in M1:**
- City cards → Place cards → Voice conversation
- Portrait + Mic button
- Pure voice interaction
- That's it

**What's NOT in M1:**
- No Magda (tutor)
- No Diario (journal)
- No help buttons
- No transcript display
- No speech bubbles
- No replay button
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

## The Conversation API

**Input:**
```typescript
{
  character: CharacterSheet,  // Basic info: name, age, role, personality
  transcript: string[],       // Previous turns (simple strings)
  learnerSaid: string        // What they just said
}
```

**Output:**
```typescript
{
  it: string,  // Italian reply
  en: string   // English translation
}
```

**That's it. No 10-field structured output. No validation. Just conversation.**

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

**Character sheets stay simple:**
```typescript
{
  name: string,
  age: number,
  role: string,
  personality: string[],  // ["quick", "warm", "curious"]
  useTu: boolean,
  speaksEnglish: boolean,
  description: string
}
```

**No complex schemas. No rigid structures. Just enough info for Claude to be the character.**

**Conversation prompt built from:**
1. Character basics (5 lines)
2. Learner level hint (1 line: "learning Italian, match their level")
3. Help guidance (3 lines: repeat, simplify, stay in character)
4. Output format (1 line: JSON with it/en)
5. Previous conversation (if any)

**Total system prompt: ~20-30 lines, not 400.**

## The Radical Bet

Strip away all the structure, all the scaffolding, all the "learning app" features.

Just: talk to people.

That's M1.
