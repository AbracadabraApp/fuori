# Language Services for Italian

The game is voice-first, in Italy (Italian) and Mexico (Spanish); this page was written for Italian. This requires careful choices for speech recognition, text-to-speech, and the conversation model. Browser APIs are free but limited; hosted services cost money but deliver better quality, especially for Italian.

## Speech-to-Text (STT)

### The Browser Problem

The prototype uses the browser's Web Speech API with `lang = "it-IT"`, but in practice:
- Browser often transcribes Italian speech as English-sounding gibberish ("bone journal" instead of "buongiorno")
- Even though Claude successfully reconstructs the Italian, seeing English words in the transcript is distracting and breaks immersion
- Language lock is unreliable, especially when system language is English
- Quality varies by device/browser (Safari vs Chrome, iOS vs Android)

### Decision: Whisper on Groq (built)

Skip browser STT entirely. Use Whisper, locked to the language being learned, from the start, hosted by **Groq**:

1. **Better experience:** no English gibberish, accurate Italian transcription
2. **Language lock works:** Italian-only transcription for turns, English for "Come si dice?"
3. **Handles noise and accents**
4. **Free at prototype scale:** Groq's free tier allows several hours of audio a day, with no card. OpenAI's hosted Whisper (about $0.006 a minute) is the fallback if Groq's terms change.
5. **Swappable:** it sits behind one route, `/v1/transcribe`, and one provider interface (`lib/speech/providers/`, chosen by `SPEECH_PROVIDER`; only `whisper-groq` is implemented), so changing provider touches one place

Note: **Groq** (with a q) hosts open models such as Whisper. It is unrelated to **Grok** (with a k), xAI's model.

**As built:**
- `lib/speech/providers/whisper-groq.ts` calls Groq's `whisper-large-v3-turbo`, with the language code from `content/<country>/language.ts` (never a hard-coded `'it'` or an Italian hint: a Whisper hint in Italian once slipped into the web route and was echoed into learners' lines; `npm run test:language` now catches it).
- `/v1/transcribe` (multipart: `audio`, `mode`) → `{ text, language }`. `mode` is `target` (the language being learned, the default), `en` (asking how to say something), `any` (onboarding: Whisper detects the language) or `turn` (a conversation turn, the language being learned or English for "How do I say it"). An empty `text` means nothing was understood.

**App side:**
- The iPhone app records m4a and sends it named `speech.m4a`. Groq needs a file name whose extension matches the format; the server fixes the name if it doesn't (`lib/speech/audio-file.ts`)
- The app skips uploading recordings with no voice in them; the route refuses files over 10 MB
- Errors are shown plainly with a code (see README → Debugging on the phone)

## Text-to-Speech (TTS)

### Browser TTS Limitations

Browser `speechSynthesis` works but:
- Limited voice variety (need many distinct voices for a city's cast)
- Quality varies dramatically (iOS "Alice" is decent, Android often robotic)
- No emotional control (all characters sound similar)
- Can't tune for character personality

### Decision: ElevenLabs (built)

Character voices are core to the experience. Built: **ElevenLabs** (`lib/voice/providers/elevenlabs.ts`, Flash v2.5) through `/v1/speak` `{ text, characterId, speed? }` → `audio/mpeg`. The server picks the voice from the character id: a city character's stored `voice` (assigned once per city by `npm run voices:assign`), otherwise one from `content/<country>/voices.ts` by age group. Any error means the app uses the phone's own voice (`AVSpeechSynthesizer`). The comparison below is from before the choice.

**Service comparison:**

| Service | Italian Quality | Character Variety | Emotion/Prosody | Cost per 1k chars |
|---------|----------------|-------------------|-----------------|-------------------|
| ElevenLabs | Excellent | High (voice cloning) | Very natural | ~$0.18 |
| Azure Neural | Very good | High (many voices) | Good with SSML | ~$0.016 |
| Google Cloud | Good | Medium | Decent | ~$0.016 |
| PlayHT | Very good | High | Good | ~$0.12 |

**Recommendation: ElevenLabs or Azure**
- ElevenLabs: best quality, most natural emotion
- Azure: cheaper, still good quality, easier SSML control

**Cost estimate:**
- ~50 turns/day × 50 chars/turn × 18 days = 45,000 chars
- ElevenLabs: ~$8 per learner for full season
- Azure: ~$0.72 per learner for full season

## Conversation Model (Claude)

### Language validation

Italian quality is validated automatically: level rules built from published standards, plus a simulated-learner test with a judge. See [Testing → Language validation](10-testing.md#4-language-validation-automated).

What the judge looks for:
- Character staying in Italian (never switches to English unprompted)
- Natural corrections: "Un cappuccino? Certo!" not "You should say un cappuccino"
- Vocabulary, sentence length and tenses within the A1–A2 level rules
- Staying in character while simplifying for the learner's level

If reports show systematic issues: adjust prompts first, then raise effort, then consider another model.

### Model Settings

Model ids live only in `lib/claude.ts` (`CLAUDE_MODEL`, and `TURN_MODEL` for the characters' replies); don't copy them here.

**In-scene turns (latency-sensitive):**
- Thinking: off (`noThinkingFor`)
- Stream: Yes (`lib/turn.ts`)
- Target: <2s to first word
- To try a faster model on turns only, set `TURN_MODEL` in a test and compare

**End of a conversation (not latency-sensitive):** one call writes the character's notes and the learning notes, then Magda's study file (`lib/remember.ts`). The end-of-day diario is not built.

## Cost Model

### Per-Learner Season Estimate (18 days)

**Claude API:**
- ~40 turns/day plus suggestion, scene and diario calls × 18 days = 720 turns
- Input: ~3k tokens/turn (mostly cached)
- Output: ~100 tokens/turn
- Cached: ~2.8k tokens/turn after first scene
- Estimate: ~$3-5/learner for full season

**Whisper STT:**
- ~20 minutes/day × 18 days = 360 minutes
- Groq free tier: $0 at prototype scale
- (OpenAI fallback: $0.006/minute ≈ $2.16/learner)

**TTS (if using ElevenLabs):**
- 45,000 characters
- $0.00018/char
- $8.10/learner for full season

**Total: ~$11-13 per learner for a full season** (mostly TTS)

With Azure TTS instead: ~$4-6 per learner

### Budget Controls

- Set per-learner daily limits (e.g., 50 turns/day max)
- Alert if costs exceed $1/day per learner
- Cache TTS for common phrases
- Monitor usage dashboard before opening to other players

## Secrets Management

Required API keys:
- `ANTHROPIC_API_KEY` - Claude API
- `GROQ_API_KEY` - Whisper STT on Groq
- `ELEVENLABS_API_KEY` - character voices

Stored in:
- `.env.local` for local development
- Railway dashboard (Project → Variables) for production
- Never committed (`.env*` in `.gitignore`)
