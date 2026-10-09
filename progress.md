# Fuori Development Progress

## Current phase: ready to start M1
Planning started 2026-10-08. Docs rewritten for the open-ended direction on 2026-10-09.

### Done so far
- [x] Prototype artifact (`prototype/index.html`): four scenes, Claude characters, forgiving corrections
- [x] Planning docs 01–10, plus `docs/ideas.md` for parked ideas
- [x] Interface mockups: [Fuori mockups](https://claude.ai/artifact/1zVpF11bWHivP3RxVruKyx) (Viaggio, Oggi, Conversazione, Diario, Tu)
- [x] Portrait style tested with Giulia and Enzo (watercolour and ink, square, masked edits for moods)

### Decisions
- **Open-ended world** (2026-10-09): Claude generates places, people and scenes. Every day: 3–4 suggestions from the director, plus "cambia aria" and "vai dove vuoi". Hand-written content is limited to city pantries, a few anchors per city (Roma: Rita, Giulia), Magda and level rules. Replaces the scripted 18-day season.
- **Magda, the tutor:** the only character who teaches; messages, weekly lessons, summary for real Zoom lessons. First name only; check with the real Magda before sharing Fuori.
- **Levels:** CEFR steps (A1 → A1+ → A2 …) with the *Profilo della lingua italiana*; evidence from conversations, no tests; dialect grows with level.
- **Interface:** Instagram-like; **scrolling full-width image cards** for Oggi suggestions (not 2x2 tiles); conversation screen like a video call.
- **Speech in:** Whisper on **Groq** (free tier) instead of OpenAI. No separate Whisper check; the real test is M1.
- **Speech out:** browser voices until hosted TTS (ElevenLabs or Azure) in M3.
- **Language validation is automated:** level rules from published standards; simulated-learner test with a judge from M2. No native-speaker gate.
- **Visuals:** all illustrated (watercolour and ink, travel-sketchbook style). Illustrated portraits for anchors and Magda; SVG avatars for generated people; illustrated place cards for suggestions.
- **Hosting:** Railway, deploys from `main`. Mobile-first, iPhone Safari.
- **Help:** natural character help first; hints only when the character is confused or the learner asks.

### Open issues
- [ ] Make `main` the GitHub default branch (Settings → General); it is currently `claude/voice-prototype`
- [ ] Get a Groq API key
- [ ] Decide ElevenLabs vs Azure for voices (M3)
- [ ] Enzo's `warm` portrait needs one masked edit to match his other moods (not urgent)
- [ ] M1 placeholder approach: solid color cards or simple watercolour washes (no icons)

### Next actions (M1, see docs/06-roadmap.md)
1. Default branch → `main`; Groq key; Railway setup
2. First task: have Claude build `content/it/levels/` from CEFR, the *Profilo*, De Mauro's *vocabolario di base*
3. Roma pantry (`content/it/cities/roma.ts`), anchors Rita and Giulia, `content/it/language.ts`
4. `/api/suggest`, `/api/scene`, `/api/turn`, `/api/transcribe`, `/api/translate`
5. Oggi and Conversazione screens; SVG avatars; deploy and test on the phone

### References
- Planning docs: `docs/`
- Roadmap: `docs/06-roadmap.md`
- Data model: `docs/09-data-model.md`

---
Last updated: 2026-10-09
