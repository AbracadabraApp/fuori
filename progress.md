# Fuori Development Progress

## Current phase: M1 MVP with city feed complete
Planning started 2026-10-08. Docs rewritten for the open-ended direction on 2026-10-09. M1 conversation engine completed 2026-10-09. M1 city feed and navigation completed 2026-10-10.

### Done so far
- [x] Prototype artifact (`prototype/index.html`): four scenes, Claude characters, forgiving corrections
- [x] Planning docs 01–10, plus `docs/ideas.md` for parked ideas
- [x] Interface mockups: [Fuori mockups](https://claude.ai/artifact/1zVpF11bWHivP3RxVruKyx) (Viaggio, Oggi, Conversazione, Diario, Tu)
- [x] Portrait style tested with Giulia and Enzo (watercolour and ink, square, masked edits for moods)
- [x] **M1 MVP**: Next.js app with complete navigation flow
  - `/api/transcribe`: Whisper on Groq for Italian speech-to-text
  - `/api/turn`: Claude conversation engine with character context
  - `/api/generate-image`: xAI Grok for watercolor city images
  - **City feed**: 20 Italian cities with distinctive watercolor sketches (Roma, Firenze, Venezia, Milano, Napoli, Bologna, Torino, Palermo, Genova, Siena, Lucca, Verona, Bergamo, Mantova, Matera, Lecce, Orvieto, Assisi, Siracusa, Taormina)
  - **Navigation**: Cities → Places → Conversation (Modified Option C)
  - **PlaceCard component**: Polaroid-style cards with prominent city names, square images, white caption area
  - **Settings UI**: Gear icon with "Show transcripts" and "Allow dialect" toggles (UI only, not functional yet)
  - Roma pantry with multiple places per type across neighborhoods
  - Giulia and Rita anchor characters
  - Simple conversation UI with mic button
  - Running at http://localhost:3000

### Decisions
- **Open-ended world** (2026-10-09): Claude generates places, people and scenes. Every day: 3–4 suggestions from the director, plus "cambia aria" and "vai dove vuoi". Hand-written content is limited to city pantries, a few anchors per city (Roma: Rita, Giulia), Magda and level rules. Replaces the scripted 18-day season.
- **Vocabulary emerges from context** (2026-10-09): No vocabulary lists or tracking in M1. Market vocabulary appears when you visit markets, bar vocabulary at bars. Multiple instances of each place type (many bars, not one scripted bar).
- **Daily rituals are good** (2026-10-09): The bar can be your daily stop. Relationships deepen and characters level up with you naturally. Director offers variety but never forces it.
- **Moods removed for M1** (2026-10-09): Simplified to get conversation working. Will add with illustrated portraits in M2.
- **Navigation flow** (2026-10-10): Modified Option C - Cities feed → Places feed (in city) → Conversation screen. City switcher as card at bottom. No floating buttons. Settings accessible from gear icon in header.
- **City images with life** (2026-10-10): Watercolor sketches show people and activity (markets, cafés, street scenes) not empty architectural postcard views. Each city has distinctive visual identity through specific prompts (Roma: evening café; Milano: aperitivo hour; Palermo: street market; etc.). No hints approach tested but abandoned - prescriptive prompts better for visual distinction across 20 cities.
- **20 cities in M1** (2026-10-10): Big cities (Roma, Firenze, Venezia, Milano, Napoli, Bologna, Torino, Palermo, Genova) + smaller towns (Siena, Lucca, Verona, Bergamo, Mantova, Matera, Lecce, Orvieto, Assisi, Siracusa, Taormina). Enough for testing feed UI, scrolling, choice patterns. Pre-generated images only; on-the-fly city generation deferred.
- **Magda, the tutor:** the only character who teaches; messages, weekly lessons, summary for real Zoom lessons. First name only; check with the real Magda before sharing Fuori.
- **Levels:** CEFR steps (A1 → A1+ → A2 …) with the *Profilo della lingua italiana*; evidence from conversations, no tests; dialect grows with level. Characters adapt dynamically based on conversation.
- **Interface:** Instagram-like; **scrolling full-width image cards** for city/place feeds (not 2x2 tiles); Polaroid-style cards with image on top, white caption below; conversation screen like a video call.
- **Speech in:** Whisper on **Groq** (free tier) instead of OpenAI. Implemented in M1.
- **Speech out:** browser voices until hosted TTS (ElevenLabs or Azure) in M3.
- **Language validation is automated:** level rules from published standards; simulated-learner test with a judge from M2. No native-speaker gate.
- **Visuals:** all illustrated (watercolour and ink, travel-sketchbook style). Illustrated portraits for anchors and Magda; SVG avatars for generated people; illustrated place cards for suggestions.
- **Hosting:** Railway, deploys from `main`. Mobile-first, iPhone Safari.
- **Help:** natural character help first; hints only when the character is confused or the learner asks.

### Open issues
- [x] Make `main` the GitHub default branch - now using main
- [ ] Deploy to Railway with environment variables (ANTHROPIC_API_KEY, GROQ_API_KEY, XAI_API_KEY)
- [ ] Test on iPhone Safari to validate microphone access over HTTPS
- [ ] Decide ElevenLabs vs Azure for voices (M3)
- [ ] Enzo's `warm` portrait needs one masked edit to match his other moods (not urgent)

### Next actions (finish M1 deployment)
1. Add XAI_API_KEY to environment variables
2. `railway login` and `railway init` to set up project
3. Add environment variables via Railway dashboard or CLI (ANTHROPIC_API_KEY, GROQ_API_KEY, XAI_API_KEY)
4. Deploy: `railway up` or push to GitHub and link Railway to repo
5. Test on iPhone: open Railway URL, navigate city feed, select Roma, try conversation
6. Validate: Italian transcription quality, Claude's character responses, browser TTS

### Next actions (M2, after M1 works on phone)
1. Wire up actual conversation functionality (connect ConversationScreen to APIs)
2. Implement Settings toggles ("Show transcripts", "Allow dialect")
3. Add place data for other cities beyond Roma
4. `/api/suggest` - director generates 3-4 daily suggestions
5. Character memory and relationship tracking
6. Day flow: suggestions → conversations → diario
7. Illustrated portraits for Giulia and Rita

### References
- Planning docs: `docs/`
- Roadmap: `docs/06-roadmap.md`
- Data model: `docs/09-data-model.md`

---
Last updated: 2026-10-09

## M1 Implementation Notes

**What was built:**
- Minimal conversation engine: you speak Italian → Whisper transcribes → Claude responds in character → browser speaks it
- Roma pantry: 25+ places across 6 neighborhoods (Trastevere, Monti, Testaccio, Centro Storico, Prati, San Lorenzo)
- Multiple instances per place type: 3 bars, 3 markets, 2 bakeries, 2 trattorias, etc.
- Giulia (barista, 32, quick-talking) and Rita (host, 58, warm) with full character sheets

**What was simplified:**
- No mood system (will add with illustrated portraits in M2)
- No structured output parsing yet (M2 will use Zod schemas with Claude's output_config)
- No corrections display (Claude corrects naturally in dialogue, but not extracted in M1)
- No word tracking or quaderno (M2)
- No localStorage or progress saving (M2)
- No suggestion system or Oggi screen yet (M2)

**Key insight from CEFR research:**
Working backwards from A1-A2 Italian standards confirms the environmental vocabulary approach:
- A1-A2 needs: food, home, transport, shopping, time, basic culture
- These naturally emerge from: bars, markets, shops, stations, churches, piazzas
- B1+ needs: work, health, opinions, stories, abstract topics
- These come from: deeper conversations at the same places, plus cafés, cultural sites, professional contexts
- The same places work across levels; what changes is who you meet and what you discuss

**What worked well:**
- Roma pantry with abundance (multiple bars) lets choice create routines organically
- Character sheets with rich personality and speech style give Claude enough to stay in character
- Simple hold-to-record UI is the right starting point

**Local test URL:** http://localhost:3000

---

## 2026-10-10: City Feed and Navigation

**What was built:**
- Full three-level navigation: Cities feed → Places feed → Conversation screen
- 20 Italian city cards with watercolor sketch images
- PlaceCard component: Polaroid-style with square image on top, white caption below
- City names prominent (32px, weight 700) for readability even without recognizing images
- Settings UI: gear icon in header opens sheet from top with "Show transcripts" and "Allow dialect" toggles (non-functional yet)
- Image generation via xAI Grok API (`/api/generate-image`)

**Image generation iterations:**
1. **First attempt**: "No hints" approach - just city names. Result: all similar muted tones, towers/churches, no life
2. **Problem identified**: AI defaulted to empty architectural postcard views
3. **Solution**: Prescriptive prompts with specific scenes and activities for each city
   - Roma: outdoor café in Trastevere, people dining, warm evening light
   - Milano: aperitivo hour in Navigli, young people, canal-side bar
   - Napoli: busy Spaccanapoli street, laundry overhead, locals in conversation
   - Palermo: Ballaro market, vendors, colorful awnings, bright Mediterranean light
   - And 16 more distinctive scenes
4. **Result**: Visually distinct cards with recognizable character and life

**Key insights:**
- With only 20 cities in M1, being prescriptive about images is better than relying on AI interpretation alone
- Images need people and activity to feel inviting, not empty tourist views
- City names must be visually prominent - many users won't recognize cities from watercolor sketches
- Settings as an overlay (not replacement screen) keeps context visible
- Three-level navigation (Modified Option C) works well for mobile

**Technical notes:**
- Script safety: `fs.existsSync()` checks prevent accidental regeneration
- Backup system: `-backup.jpg` files created before regenerating
- Rate limiting: 3-second delays between image generations to avoid API limits
- All images stored in `public/images/cities/` as static assets

**What's ready for deployment:**
- City feed with 20 Italian cities
- Navigation to places (though only Roma has place data)
- Conversation screen UI (conversation engine from 2026-10-09)
- Settings UI (toggles don't do anything yet)

**Next step:** Deploy to Railway and test full flow on iPhone

---

## 2026-10-10 (continued): Art Style Progression & City Pantry Formula

**Art style progression established:**
Three distinct styles for visual hierarchy and increasing fidelity:
1. **Cities**: Loose watercolor with ink lines (atmospheric, flowing)
2. **Places**: Soft pastel sketch (warm, colorful, textured)
3. **People**: Pen and ink portrait with minimal wash (crisp, detailed, personal)

Tested with Giulia's bar (pastel) and portrait (pen/ink) - progression works well for travel journal aesthetic.

**City Pantry Formula documented:**
Established systematic structure for all city pantries (25-30 places):
- Daily routine: 3 bars, 2 bakeries
- Food/shopping: 2-3 markets, 2 restaurants, 1-2 specialty
- Cultural: 1 landmark, 1-2 churches, 1 park, 1-2 piazzas
- Social: wine bars, bookshop
- Practical: pharmacy, transport
- City character: 2-3 unique places

This ensures vocabulary consistency across cities while allowing unique character. Documented in `docs/03-journey.md`.

**Key insight:**
Roma pantry already has good balance - emphasizes daily life vocabulary (bars, markets, shops) over tourist checklist, which is correct for language learning.

## 2026-10-10: Fix silent Giulia on iPhone

**Problem:** On the phone, Giulia's bubble was empty and nothing played. Railway was serving an old commit from `claude/voice-prototype`, whose `/api/turn` used the retired model `claude-opus-4-20250514`, so every turn failed and the page hid the error.

**Fixed on `main`:**
- `lib/claude.ts` now holds the Anthropic client and `CLAUDE_MODEL` (default `claude-sonnet-5-5`, override with the `CLAUDE_MODEL` env var). `/api/turn`, the content scripts and the test runners use it.
- `npm run test:models` fails if a model ID is hard-coded anywhere else.
- ConversationScreen shows the server's actual error message instead of a generic one.
- iPhone audio unlock: the Start and mic taps play a silent sound first, and ElevenLabs audio reuses that unlocked element, so Safari lets Giulia speak after the network call.

**Open:** Railway must deploy from `main` (Service → Settings → Source → Branch).
