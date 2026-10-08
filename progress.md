# Fuori Development Progress

## Current Phase: Pre-M1 Validation
Started: 2026-10-08

### Completed This Session
- [x] Planning docs reviewed and updated (01-10)
- [x] Identified language services requirements (Whisper, TTS)
- [x] Updated game design to reduce scaffolding
- [x] Defined complete data model with TypeScript interfaces
- [x] Created testing strategy

### Decisions Made
- **STT:** Use OpenAI Whisper from M1 (skip browser STT entirely)
  - Reason: Browser transcribes Italian as English gibberish, breaks immersion
  - Cost: ~$0.12 per 20-minute day per learner
- **TTS:** Move hosted TTS to M2 (was M4)
  - Reason: Character voices are core to experience
  - Service: ElevenLabs (~$8/learner/season) or Azure (~$0.72/learner/season)
- **Help system:** Natural character help first, UI hints only when confused
  - Added `confused` field to turn schema
  - Hints should be `null` most of the time
- **Cost model:** ~$13-15 per learner for full 18-day season is acceptable
- **Hosting:** Railway for everything (frontend + backend + Postgres)
  - Automatic HTTPS (required for microphone access)
  - Git-based deploys (push → deploy in 30 seconds)
  - Preview environments for feature branches
  - Integrated Postgres for M4
  - Not using: Vercel, Netlify, split stack
- **Mobile-first:** iPhone Safari is primary target
  - Test every change on phone (not just desktop browser)
  - Use remote debugging (Safari Web Inspector)
  - Touch targets 44px minimum
  - Deploy to Railway → test on phone → iterate

### Open Issues
- [ ] Need to test Claude's Italian quality with 20-30 conversations
- [ ] Need native Italian speaker (A1-A2 teacher) to review naturalness
- [ ] Need to test Whisper accuracy with recorded phrases
- [ ] Need OpenAI API key for Whisper
- [ ] Need to decide: ElevenLabs vs Azure for TTS

### Content Status
**Characters:** 0/8 Roma characters created
**Scenes:** 0/14 Roma scenes created
**Route:** Structure defined, not implemented

### Next Actions
1. Run Pre-M1 validation (docs/06-roadmap.md):
   - Test Claude with prototype conversations (use prototype/index.html)
   - Get native Italian speaker review
   - Record 20 Italian phrases, test Whisper accuracy
   - Get API keys: Anthropic (have) + OpenAI (need)
2. Set up Railway:
   - Create Railway account
   - Install Railway CLI: `npm i -g @railway/cli`
   - Run `railway init` in fuori directory
   - Link to GitHub repo
3. Create first character sheet (Giulia) following docs/09-data-model.md
   - Use harness pattern: create `create-character` skill after 2nd character
4. Set up italian-validator subagent for content validation
5. Create validate-content skill before M1 implementation

### References
- Planning docs: /Users/josh.petersen/fuori/docs/
- Data model: docs/09-data-model.md
- Roadmap: docs/06-roadmap.md
- Language services: docs/08-language-services.md

---
Last updated: 2026-10-08
