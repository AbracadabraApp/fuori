# Open Design Questions

Questions that emerged during M1 implementation (2026-10-09) that need design/product input before proceeding.

## 1. Navigation structure

**Current thinking: Option C (Hybrid)**
- Start with city cards
- Once in a city, flat feed of places + station card to leave
- Tap station → city cards again

**Alternatives:**
- **A (Structured):** Cities → Places → People, clear hierarchy
- **B (Flat feed):** Everything mixed in one infinite scroll

**Core question:** Are users **exploring Italy** (geography-first) or **living a life** (activity-first)? Travel/adventure feeling vs. immersion/daily life feeling?

**Social media parallel:** Instagram Stories (structured, swipe through) vs. TikTok feed (infinite, algorithm-curated)?

## 2. Immersion vs. scaffolding

**Discovered tension:** We're building language-learning scaffolding (corrections, word tracking, goals) but natural flowing dialogue (like Claude app voice mode) might teach better.

**Current approach (M1):**
- Characters never break character
- Corrections happen naturally by recasting
- Diario shows quiet notes after
- Magda handles explicit teaching asynchronously

**Alternative:**
- Pure conversation flow, no visible corrections
- Optional transcript review
- Streaming voice mode (lower latency)

**Question:** Does explicit feedback help or hurt? Test both.

## 3. Transcription display

**Question:** Should conversations show text at all?

**Arguments against:**
- Pulls you out of conversation
- Reading while listening = cognitive split
- More immersive without

**Arguments for:**
- Helps comprehension at A1-A2
- Reference for new words
- Catch transcription errors

**Current M1 approach:** No text during conversation, test if it feels good.

## 4. Daily structure

**Discovery:** The "day" concept (morning suggestions → conversations → evening review → next day) might be unnecessary friction.

**Better:** Feed refreshes based on what you've been doing, not calendar time
- After conversations end
- When director notices repetition
- When you revisit app

**But:** Something needs to encourage exploration and variety.

**Solved by:** Characters suggest new places in conversation → cards appear

## 5. How suggestions work

**Evolution from algorithmic to organic:**

**Old way:**
- System director generates 3-4 daily suggestions
- Appears as menu

**New way:**
- Characters suggest places naturally in dialogue
- "Hai già visto il mercato? Vai oggi!"
- Card appears in feed
- More immersive, less system-y

**Still needed:** Some curation to prevent getting stuck (going to same bar 50 times)

**Question:** How much does Claude curate vs. pure user choice?

## 6. Transportation and travel

**Keep:**
- Station/airport cards in feed
- Buying tickets is a conversation
- Travel takes time (train conversations)
- Realistic movement between cities

**This preserves:**
- Transportation vocabulary
- Journey feeling
- Realistic pacing

## 7. Anchors and regulars

**Old concept:** Rita as "your host" = forced home base

**New concept:**
- No forced anchors
- Places you like stay in your feed
- Regulars emerge from repeated visits (Giulia becomes your barista because you choose her)
- Characters remember you

**Question:** Do we need ANY hand-written anchor characters? Or can everything be generated and relationships form organically?

## 8. Feed composition

**What appears in the feed:**
- Places you've been (can revisit)
- Places characters mentioned
- Station/airport (when appropriate)
- New Claude-generated suggestions
- Cities you haven't visited

**Question:** What's the right mix? How much repetition vs. novelty?

## 9. Visual hierarchy

**Settled:**
- Place cards: just place name + image (no character name)
- Character revealed when you enter
- All cards same visual treatment
- Watercolor/ink sketch style

**Question:** How to differentiate card types visually?
- 🚂 icon for stations?
- Different color tint for cities vs. places?
- Or keep them identical (everything is just "somewhere to go")?

## 10. Scope of M1 test

**What to test first:**
- City cards → places feed → conversation
- No transcription display
- Pure voice immersion
- See how navigation feels

**Then decide:**
- Add transcript option?
- Flatten navigation?
- Add more structure?

---

## For product/design conversation

**Key questions:**
1. What's the right navigation model? (A, B, or C above)
2. How much structure vs. discovery?
3. Text display during conversation or not?
4. How does feed curation balance user choice with learning goals?

**Social media design parallels:**
- Instagram Stories (structured navigation)
- TikTok (infinite feed, algorithmic)
- BeReal (forced temporal structure)
- Pinterest (discovery + saves)

Which model fits learning a language through immersive conversations?
