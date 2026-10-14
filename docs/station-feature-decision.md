# Station Feature: Add or Not?

## Revised proposal (2026-10-14, Josh agreed the direction)

Neither "stations are the only way to travel" nor "a plain travel button". Stations stay a place you can visit; the ticket you buy there is how you leave. The analysis further down is kept as background; where it conflicts with this section, this section wins.

### What changes from the original options

- **Keep the back link to the city list** ("← Fuori" / "← Afuera", shipped 2026-10-13). Several ways to navigate (Josh); removing it would be punitive. The original "if yes" commitment to remove it is dropped.
- **No conversation is required to travel.** Talking to the ticket seller is optional practice, like any other place.
- **No end-of-conversation detection.** The app never decides when the conversation is over: no listening for *"Buon viaggio"* (a phrase filter, which CLAUDE.md rules out), no turn counting, no waiting for the learner to back out. The learner boards when they choose.

### The flow

1. **City screen → tap the station** (Stazione Termini, Terminal TAPO). The departures board opens: the existing city picker, already on main ("Simplify travel: direct city picker").
2. **Pick a destination** (Firenze). Instead of travelling straight away, the station's person screen opens: the ticket seller, with the usual band (back link, name, role) and portrait.
3. **A ticket strip** sits just under the band, full width, only on station screens:
   - styled as a printed ticket (Trenitalia in Italy, ADO in Mexico): cream paper, a torn edge, big type
   - **ROMA → FIRENZE**, with *Binario 4 · 14:30* below
   - a solid **Sali** button at its right end (**Subir** in Mexico); the whole strip is the target
4. **The clerk knows where you're going.** Their opening line can be *"Per Firenze? Il prossimo parte alle 14:30, binario 4."* Talk as long as you like, or not at all.
5. **Tap Sali whenever you're ready** → arrive at the destination's city screen.

### Why the ticket sits there

The person screen's rules (2026-10-13): talking happens at the bottom (Start conversation, then the mic; one control at a time); the name lives in the band and is never covered; the portrait fills the rest. A second button at the bottom would compete with the mic (and could be tapped mid-sentence); a small link in the band was too weak for the main reason you came to the station (Josh). The ticket is a strong object of its own, between the band and the talking area, so it breaks none of those rules. Cost: on station screens only, the portrait starts about one band-height lower.

### What it takes

- **Departure details made by the app, not the clerk,** so the ticket and the clerk agree: platform and time from a small deterministic function of the route (same route, same platform; time = next departure after now, rounded). The clerk is free to talk prices, connections and changes.
- **Destination in the clerk's context:** add it to the `{setting}` the code already fills for city characters ("…at the ticket window. The person is going to Firenze; the next train leaves at 14:30 from platform 4."). No new prompt template and no change to `character.md`, so no prompt version bump.
- **Station characters:** identified by place id (`stazione-*`, `terminal-*`), as the city picker already does. Each shown city needs one station place with a ticket seller; check which cities in the showcase have one.
- **Per-country words from the pack:** board label (Sali / Subir), the ticket's brand style and the vehicle word come from `content/<country>/language.ts`, not the code.
- **UI:** ConversationScreen gets an optional `ticket` prop (from, to, platform, time, onBoard). Present only on station screens; everything else unchanged.
- **Sali must save the conversation, exactly like the back link** (Josh, 2026-10-14). If boarding just navigated away, the clerk would forget you and the learning notes from that conversation would never be written, and nobody would notice (the M2 lesson). How saving works today: when ConversationScreen closes, its cleanup sends `/api/conversation/end` by beacon, which marks the conversation ended and writes the character's notes and the learning notes (`lib/remember.ts`); going to the background sends it too. So:
  - Boarding goes through the same exit as the back link: `onBoard` closes the conversation screen inside the app (clear the place, set the new city), which runs that cleanup. Never a page reload or `window.location` change: on a reload only `pagehide` is certain, and it silences without sending the beacon.
  - Make it explicit rather than incidental: pull the "leave this conversation" step (silence, then send the end beacon) into one function that both the back link and Sali call, so a later change to one can't skip the other.
  - **Test that would catch it:** leaving by Sali sends `/api/conversation/end` with the conversation id, the same as leaving by the back link (a fake `sendBeacon`, like `test:silence` fakes audio). Today no test covers the end beacon at all; add one for the back link at the same time.
- **Not needed:** a station prompt template, a conversation state machine, end detection, a "traveling" screen (a short "on the train" moment can come later if wanted).

### Reaching the other cities (Josh, 2026-10-14)

- **Several ways to move, none taken away:** the home list (back link) and the station both stay.
- **The home list shows the 8, then "Mostra altro" / "Ver más" reveals all the others** (Italy: 12 more). Brings back the show-more link removed on 2026-10-13, for the city list only. No remembering which cities someone has visited.
- **The departures board shows every city too.** The station is the immersive way to travel, not the only door to the hidden cities.
- **A city you open must be alive:** today a hidden city also hides all its places, so opening Taormina would show an empty feed. Split the showcase's two jobs: which cities are on the first screen, and which ~10 places each city shows. Pick 10 places for all 20 Italian cities with the same mix as the 8. (Repeated ids: none left in the hidden cities after the laptop session's fix.)
- **Mexico:** all 5 cities are on the first screen, so no "Ver más" link appears until it has more.

### Ticket redesign (Josh, 2026-10-14, after seeing it)

- **Above the Start / mic button**, not under the band; subtitles move up to stay above it.
- **No departure time:** it could contradict the ticket seller. The ticket shows platform, seat and fare; the seller is told the platform and talks times freely.
- **A real ticket:** taller; a carrier band in the country's colour with a vehicle pictogram (no real company's logo or name: "Ferrovie", "Autobuses"); class or service; pale security paper with fine diagonal stripes instead of tan; a torn stub edge and a printed barcode. Words in `language.ui.ticket`, colours in `pack.ticketTheme`, component `app/components/Ticket.tsx`.

### Status

**Built 2026-10-14** (cloud session): the departures board on the city screen (it had been drawn only on the city list, so tapping a station opened nothing), every city on it, the ticket strip with Sali/Subir, the destination in the clerk's setting, one shared leave step for both exits, `npm run test:leave`. Not yet: six Italian cities have no station (Taormina, Assisi, Bergamo, Torino, Lucca, Orvieto), so from there you leave by the back link.

---

## Original analysis (2026-10-14, laptop session)

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
