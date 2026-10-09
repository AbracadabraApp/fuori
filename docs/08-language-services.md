# Language Services for Italian

The game is voice-first and Italian-focused. This requires careful choices for speech recognition, text-to-speech, and the conversation model. Browser APIs are free but limited; hosted services cost money but deliver better quality, especially for Italian.

## Speech-to-Text (STT)

### The Browser Problem

The prototype uses the browser's Web Speech API with `lang = "it-IT"`, but in practice:
- Browser often transcribes Italian speech as English-sounding gibberish ("bone journal" instead of "buongiorno")
- Even though Claude successfully reconstructs the Italian, seeing English words in the transcript is distracting and breaks immersion
- Language lock is unreliable, especially when system language is English
- Quality varies by device/browser (Safari vs Chrome, iOS vs Android)

### Decision: Whisper on Groq for M1

Skip browser STT entirely. Use Whisper, locked to Italian, from the start, hosted by **Groq**:

1. **Better experience:** no English gibberish, accurate Italian transcription
2. **Language lock works:** Italian-only transcription for turns, English for "Come si dice?"
3. **Handles noise and accents**
4. **Free at prototype scale:** Groq's free tier allows several hours of audio a day, with no card. OpenAI's hosted Whisper (about $0.006 a minute) is the fallback if Groq's terms change.
5. **Swappable:** it sits behind one route, `/api/transcribe`, so changing provider touches one file

Note: **Groq** (with a q) hosts open models such as Whisper. It is unrelated to **Grok** (with a k), xAI's model.

**Implementation sketch** (check Groq's current docs for exact model names and SDK details):
```typescript
// app/api/transcribe/route.ts
import Groq from 'groq-sdk';

export async function POST(request: Request) {
  const formData = await request.formData();
  // Must be a File with a filename whose extension matches the audio format
  // (Whisper detects the format from it). See "Browser side" below.
  const audio = formData.get('audio') as File;
  // 'it' for normal turns; 'en' for the "Come si dice?" button, where the learner speaks English
  const language = formData.get('language') === 'en' ? 'en' : 'it';

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const transcription = await groq.audio.transcriptions.create({
    file: audio,
    model: 'whisper-large-v3-turbo',
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

**Limits and errors:**
- Max recording length 60 seconds per turn
- Network timeout: allow retry
- API failure or rate limit: fall back to text input

## Text-to-Speech (TTS)

### Browser TTS Limitations

Browser `speechSynthesis` works but:
- Limited voice variety (need 8+ distinct voices for Roma cast)
- Quality varies dramatically (iOS "Alice" is decent, Android often robotic)
- No emotional control (all characters sound similar)
- Can't tune for character personality

### Decision: Hosted TTS in M3

Character voices are core to the experience, but browser voices are enough to start. Hosted TTS comes in M3, first for the anchors and Magda.

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
1. Pick voice profiles for the anchors and Magda; generated characters share a small pool of voices matched by age and gender
2. Server-side TTS generation for each NPC response
3. Stream audio to browser or return URL
4. Cache frequent phrases ("Buongiorno!", "Prego", "Ciao!") to reduce costs

**Until M3:**
- Use best available browser Italian voices
- Pick distinct voices where possible (different genders, speeds)
- Accept that character distinction is limited
- Plan migration path to hosted TTS

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
- `ELEVENLABS_API_KEY` or `AZURE_SPEECH_KEY` - TTS (M3)

Stored in:
- `.env.local` for local development
- Railway dashboard (Project → Variables) for production
- Never committed (`.env*` in `.gitignore`)
