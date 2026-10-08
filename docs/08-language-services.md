# Language Services for Italian

The game is voice-first and Italian-focused. This requires careful choices for speech recognition, text-to-speech, and the conversation model. Browser APIs are free but limited; hosted services cost money but deliver better quality, especially for Italian.

## Speech-to-Text (STT)

### The Browser Problem

The prototype uses the browser's Web Speech API with `lang = "it-IT"`, but in practice:
- Browser often transcribes Italian speech as English-sounding gibberish ("bone journal" instead of "buongiorno")
- Even though Claude successfully reconstructs the Italian, seeing English words in the transcript is distracting and breaks immersion
- Language lock is unreliable, especially when system language is English
- Quality varies by device/browser (Safari vs Chrome, iOS vs Android)

### Decision: OpenAI Whisper for M1

Skip browser STT entirely. Use OpenAI Whisper from the start because:

1. **Better experience** - No English gibberish, accurate Italian transcription
2. **Language lock works** - Can enforce Italian-only transcription
3. **Handles noise and accents** - Robust to background noise, regional variations
4. **Affordable** - ~$0.006/minute = ~$0.12 per 20-minute day
5. **Inevitable** - Would end up here eventually; start here

**Implementation:**
```typescript
// app/api/transcribe/route.ts
import OpenAI from 'openai';

export async function POST(request: Request) {
  const formData = await request.formData();
  // Must be a File with a filename whose extension matches the audio format
  // (Whisper detects the format from it). See "Browser side" below.
  const audio = formData.get('audio') as File;
  // 'it' for normal turns; 'en' for the "Come si dice?" button, where the learner speaks English
  const language = formData.get('language') === 'en' ? 'en' : 'it';

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const transcription = await openai.audio.transcriptions.create({
    file: audio,
    model: 'whisper-1',
    language,
    ...(language === 'it' && { prompt: 'Trascrizione in italiano di una conversazione naturale.' }),
  });

  return Response.json({ text: transcription.text });
}
```

**Browser side:**
- Use MediaRecorder to capture audio while mic button is pressed
- iPhone Safari records `audio/mp4`; Chrome records `audio/webm`. Read `recorder.mimeType` and append the blob with a matching filename, e.g. `formData.append('audio', blob, mime.includes('mp4') ? 'turn.mp4' : 'turn.webm')`. A bare blob has no filename and Whisper rejects it as an unrecognized format
- Send audio blob to `/api/transcribe` with `language` set to `it` (or `en` for "Come si dice?")
- Show Italian text in input field
- Loading states: "Ascolto..." → "Trascrivo..." → show result

**Cost controls:**
- Set max recording length (60 seconds per turn)
- Budget: ~$2-3 per learner for full 18-day season
- Log usage per learner to track costs

**Error handling:**
- Network timeout: allow retry
- API failure: fall back to text input
- Rate limit: show wait time

### Testing Before M1

Record 20 common Italian phrases and test:
- Whisper accuracy with your voice
- Response latency (should be <2s for short phrases)
- Error rates with background noise
- Cost per phrase

## Text-to-Speech (TTS)

### Browser TTS Limitations

Browser `speechSynthesis` works but:
- Limited voice variety (need 8+ distinct voices for Roma cast)
- Quality varies dramatically (iOS "Alice" is decent, Android often robotic)
- No emotional control (all characters sound similar)
- Can't tune for character personality

### Decision: Hosted TTS for M2 (not M4)

Character voices are core to the experience. Move hosted TTS from M4 to M2.

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

**Implementation approach:**
1. Pre-generate character voice profiles (8 voices for Roma)
2. Server-side TTS generation for each NPC response
3. Stream audio to browser or return URL
4. Cache frequent phrases ("Buongiorno!", "Prego", "Ciao!") to reduce costs

**M1 compromise:**
- Use best available browser Italian voices
- Pick distinct voices where possible (different genders, speeds)
- Accept that character distinction is limited
- Plan migration path to hosted TTS

## Conversation Model (Claude)

### Language Validation Required

The docs assume Claude will work well for Italian, but this needs testing before M1.

**Pre-M1 validation:**
1. Test Claude Opus 5.5 with 20-30 Italian conversations
2. Native Italian speaker (ideally A1-A2 teacher) reviews for:
   - Naturalness at beginner level
   - Regional authenticity (does Giulia sound Roman?)
   - Grammar accuracy (no systematic errors)
   - Correction quality (natural recasts vs textbook corrections)
3. Test at low effort setting (latency-sensitive in-scene turns)
4. Document any systematic issues

**What to test specifically:**
- Character staying in Italian (never switches to English unprompted)
- Natural corrections: "Un cappuccino? Certo!" not "You should say un cappuccino"
- Regional expressions (Roman: "anvedi", "daje", Neapolitan: different)
- Appropriate vocabulary for A1-A2 (not too advanced)
- Staying in character while simplifying for learner level

**If issues found:**
- Test GPT-4o as alternative
- Adjust prompts to compensate
- Consider higher effort setting if quality matters more than latency

### Model Settings

**In-scene turns (latency-sensitive):**
- Model: Claude Opus 5.5 (`claude-opus-5-5`)
- Effort: Low (optimize for speed)
- Stream: Yes
- Target: <2s to first word

**End-of-day diario (not latency-sensitive):**
- Model: Claude Opus 5.5
- Effort: Medium or High
- Stream: No (single response)
- Can use stronger thinking for better summary

**Test Haiku 5.5 if Opus is too slow:**
- `claude-haiku-5-5` is much faster
- Compare quality: does correction/character quality suffer?
- Only switch if Opus latency is unacceptable

## Cost Model

### Per-Learner Season Estimate (18 days)

**Claude API:**
- ~40 turns/day × 18 days = 720 turns
- Input: ~3k tokens/turn (mostly cached)
- Output: ~100 tokens/turn
- Cached: ~2.8k tokens/turn after first scene
- Estimate: ~$3-5/learner for full season

**Whisper STT:**
- ~20 minutes/day × 18 days = 360 minutes
- $0.006/minute
- $2.16/learner for full season

**TTS (if using ElevenLabs):**
- 45,000 characters
- $0.00018/char
- $8.10/learner for full season

**Total: ~$13-15 per learner for full season**

With Azure TTS instead: ~$6-7 per learner

### Budget Controls

- Set per-learner daily limits (e.g., 50 turns/day max)
- Alert if costs exceed $1/day per learner
- Cache TTS for common phrases
- Monitor usage dashboard before opening to other players

## Secrets Management

Required API keys:
- `ANTHROPIC_API_KEY` - Claude API
- `OPENAI_API_KEY` - Whisper STT
- `ELEVENLABS_API_KEY` or `AZURE_SPEECH_KEY` - TTS (M2)

Stored in:
- `.env.local` for local development
- Railway dashboard (Project → Variables) for production
- Never committed (`.env*` in `.gitignore`)

## Pre-M1 Action Items

Before starting implementation:

- [ ] Test Claude with 20 Italian conversations, get native speaker review
- [ ] Test Whisper accuracy with your voice (record 20 phrases, measure accuracy)
- [ ] Measure Whisper latency (should be <2s for short phrases)
- [ ] Document systematic Claude issues (if any)
- [ ] Set up OpenAI account and get Whisper API key
- [ ] Calculate realistic cost per learner with actual usage
- [ ] Decision: continue with Claude or test GPT-4o

**Done when:** Italian quality is validated, Whisper is accurate for your voice, costs are acceptable, and you have API keys ready.
