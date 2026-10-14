# Station Feature: Add or Not?

**Decision needed:** Add stazione (Italy) / terminal (Mexico) as the travel mechanism, or use simple city picker UI?

## If we add stations

**Commitment:** Stations become THE way to travel between cities.
- Remove back navigation from city screen (no "← Fuori/Afuera" to city list)
- Station is how you move cities
- Every city must have a station/terminal in its places

## What stations give us

**Learning value:**
- Travel vocabulary practice (treno, binario, biglietto, partire, arrivare, fermata, coincidenza)
- Time expressions (alle quattordici, fra venti minuti, quanto dura il viaggio)
- Direction and navigation (il treno per Firenze, da quale binario, dove devo scendere)
- Asking for help (quando parte? quanto costa? c'è un treno diretto?)
- Real-world scenario learners will actually use in Italy/Mexico

**Immersion:**
- Travel feels embedded in the world (you go to a place to travel)
- Characters are part of the journey (ticket sellers, staff)
- Ritual: every city change involves a conversation

## What stations cost us

**Implementation complexity:**
- Destination must be chosen before conversation (city picker first)
- Character needs destination context ("Ah, Firenze! Il treno parte alle...")
- Conversation must end naturally and trigger travel
- UI state: mic button → "Get on train" button after conversation
- Testing: each destination, each city's station, error cases

**Content requirements:**
- Every city needs station/terminal place
- Every city needs ticket seller character with portrait
- Mexico: buses not trains (different vocabulary, different culture)

**User friction:**
- Can't quickly switch cities to browse
- Must have conversation every time you travel
- What if you just want to see a different city?

## Architecture if we do it

### Flow

```
1. City screen (no back to city list)
   User taps: Stazione Termini / Terminal TAPO
   ↓
2. City picker modal
   "Where do you want to go?"
   Shows: all cities (maybe except current)
   User selects: Firenze
   ↓
3. Conversation screen
   Character: Franco (ticket seller)
   Character knows destination: Firenze
   Conversation about: route, time, platform, price
   Example:
   - Franco: "Firenze! Il prossimo treno parte alle 14:30, binario 4."
   - Learner: "Quanto costa?"
   - Franco: "€29. Vuoi andata e ritorno?"
   - Learner: "Solo andata, grazie"
   - Franco: "Ecco il tuo biglietto. Buon viaggio!"
   ↓
4. Conversation end trigger
   When conversation ends (learner backs out or natural close):
   Button appears: "Sali sul treno" / "Get on the bus"
   OR: Mic button transforms to travel button
   ↓
5. Travel action
   User taps button → navigate to Firenze city screen
```

### Implementation requirements

**1. Conversation context**

```typescript
interface StationConversation {
  destination: CityPantry;  // Chosen from picker
  character: CharacterSheet; // Ticket seller
  mode: 'teaching' | 'immersion'; // Always immersion
  metadata: {
    type: 'station';
    destinationId: string;
    departureCity: string;
  }
}
```

**2. Character prompt customization**

Template: `content/<country>/prompts/station.md`
- Filled with: destination city, departure city, character info
- Focus: route, timing, platform, logistics (not choosing destination)
- Natural close: "Ecco il biglietto, buon viaggio!"

**3. UI state machine**

```typescript
type StationFlow = 
  | { state: 'picker'; cities: CityPantry[] }
  | { state: 'conversation'; destination: string; conversationId: string }
  | { state: 'ready-to-board'; destination: string }
  | { state: 'traveling'; to: string }
```

**4. Conversation end detection**

How do we know conversation is over?
- Learner backs out (onBack) → show "Get on train" button
- Character says goodbye → auto-show button?
- After N turns (say 5) → show button?
- Explicit "Buon viaggio" in reply → show button?

**5. Travel action**

When "Sali sul treno" tapped:
- Navigate to destination city screen
- Update learner's current city
- (Future: could have "on the train" transition moment)

**6. Per-country differences**

Italy:
- stazione (train station)
- bigliettaio (ticket seller)
- treno, binario, partire, arrivare
- Fast trains (Frecciarossa), regional trains

Mexico:
- terminal (bus terminal)  
- taquillero (ticket seller)
- autobús/camión, andén, salir, llegar
- Different bus companies, longer journeys

### Content needed

**Per city:**
- Station/terminal place
  - Name: "Stazione Termini", "Terminal TAPO"
  - Image (already generated)
  - Always in showcase (never hidden)
  
- Ticket seller character
  - Name, age, gender, personality
  - Portrait (already generated for Italy)
  - Role: bigliettaio / taquillero

**Prompt template:**
- station.md for each country
- Variables: {destination}, {departureCity}, {character}
- Example vocabulary and phrases

## Alternative: No stations

**Simple travel:**
- Add "Viaggia" / "Viajar" button to city screen header (next to city name)
- Taps → city picker modal
- Select city → navigate directly
- No conversation, no complexity

**This gives up:**
- Travel vocabulary learning
- Embedded world feeling
- Conversation ritual for travel

**This gains:**
- Simplicity
- Fast city switching
- No implementation complexity
- No per-city content requirements

## Recommendation

**Don't add stations (Josh to decide).**

**Why not:**
- Complexity (conversation customization, state management, UI transitions)
- Content overhead (every city needs station + character + portrait + testing)
- User friction (must converse every time to switch cities)
- Uncertain value (is travel vocab worth this cost?)

**Why yes:**
- Real learning value (travel vocabulary is genuinely useful)
- Immersive (world feels more real when travel is embedded)
- Differentiated (most apps don't teach practical travel scenarios)

**If yes, commit fully:**
- Remove city back navigation
- Stations are THE travel mechanism
- Build it right: customized conversations, clean flow, tested
- Document travel vocabulary in level rules

**If no:**
- Add simple travel button
- Keep cities easily browsable
- Focus learning time on places, not transit
