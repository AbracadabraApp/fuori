# Session Notes: 2026-10-09

## What We Built (M1 MVP)

### Code
- ✅ Next.js app with TypeScript, App Router
- ✅ `/api/transcribe` - Whisper on Groq for Italian STT
- ✅ `/api/turn` - Claude conversation endpoint (basic, needs structured output)
- ✅ `PlaceCard` component - scrolling cards for places
- ✅ `ConversationScreen` component - full-screen portrait + mic
- ✅ Roma pantry with multiple places, Giulia and Rita characters
- ✅ Types defined in `lib/types.ts`

### Deployed
- Railway: https://fuori-production.up.railway.app
- Environment variables set (ANTHROPIC_API_KEY, GROQ_API_KEY)
- Both tap-to-record and hold-to-record modes

### Design Decisions Made

**Navigation (Modified Option C):**
1. Cities feed (entry point)
2. Places feed (once in a city) - header shows "Roma"
3. Conversation (full screen, no text)
4. Back to places feed
5. "Cambia città" card appears after 2-3 conversations

**Key principles:**
- No text transcription during conversation (test pure immersion first)
- City choice is deliberate (not mixed in flat feed)
- Place cards show place name only (character revealed when you enter)
- All cards same visual treatment
- Feed shows 6-8 cards at a time, "load more" to avoid paralysis

**Removed concepts:**
- Daily structure (no "days", feed refreshes based on behavior)
- Diario end-of-day review (too pedantic)
- Rita as "your host" (no forced home base)
- Mood system (removed from M1, add with portraits later)

**Characters suggest places:**
- During conversation: "Hai visto il mercato? Vai oggi!"
- Card appears in feed afterward
- More immersive than algorithmic menu

**Corrections stay in character:**
- Characters recast naturally: "Ah, *vorrei* un caffè!"
- Never break immersion to teach
- Magda handles explicit teaching asynchronously
- Optional transcript review after conversation

## Open Design Questions

**Documented in:** `docs/open-design-questions.md`

**Product design input (from agent):**
- Modified Option C navigation validated
- Show text transcription (multimodal learning) - BUT we're testing without first
- Progressive curation (start opinionated, become responsive)
- Limit cards to avoid decision paralysis
- Red flags: infinite scroll, same character rut, awkward exits

**Still deciding:**
- Is text + speech better than speech only? (Testing speech-only first)
- How much does geography matter vs. topic-based browsing?
- Exact feed curation algorithm

## Art Direction

**Decided:**
- Watercolor and ink, travel-sketchbook style
- Square cards for places
- Full-screen portraits for conversations

**For M1 testing:**
- Use Grok (Anthropic's image generation) for watercolor sketches
- Or: Simple solid colors as placeholders
- Focus on flow first, refine visuals after

**Portrait system (later):**
- Illustrated portraits for anchors (Giulia, maybe others)
- SVG avatars for generated characters
- 4 moods with masked edits (or removed for M1)

## Next Steps

**Immediate (this session ended here):**
- Decide: Start with City feed UI or Conversation card UI?
- Work through detailed UI design
- Generate watercolor placeholders with Grok
- Match features to polished UI

**Then:**
- Wire up full flow (cities → places → conversation → back)
- Connect to actual APIs (transcribe + turn)
- Test on phone
- Iterate based on feel

## Technical Notes

**Running locally:**
- `npm run dev` at http://localhost:3000
- `.env.local` has both API keys

**Repo state:**
- Branch: `claude/voice-prototype`
- Latest commit: "Add tap-to-record mode alongside hold-to-record"
- Need to make `main` the default branch (currently `claude/voice-prototype`)

**Files created today:**
- `app/components/PlaceCard.tsx`
- `app/components/ConversationScreen.tsx`
- `app/page.tsx` (updated to use components)
- `content/it/cities/roma.ts`
- `content/it/characters/giulia.ts`
- `content/it/characters/rita.ts`
- `app/api/transcribe/route.ts`
- `app/api/turn/route.ts`
- `lib/types.ts`
- `docs/open-design-questions.md`
- `docs/session-notes-2026-10-09.md` (this file)

## Key Insights from Today

1. **Immersion vs scaffolding** - Pure conversation might teach better than explicit corrections
2. **Characters as curators** - Suggestions from people feel more alive than algorithmic feeds
3. **Geography creates context** - City choice matters for cognitive framing
4. **Structure creates intention** - Some friction (pick city → pick place) prevents mindless scrolling
5. **Test assumptions** - Don't assume text helps learning, test it

## Questions for Next Session

1. Which screen to design first: City cards or Conversation screen?
2. Generate watercolor placeholders or use solid colors?
3. How detailed should M1 UI be before testing on phone?
4. Should we simplify further or is current scope right?
