# Voice Provider System

Pluggable text-to-speech (TTS) provider abstraction for Fuori.

## Architecture

The voice provider system mirrors the speech-to-text provider structure in `/lib/speech/providers/`:

```
lib/voice/providers/
├── types.ts           # VoiceProvider interface
├── elevenlabs.ts      # ElevenLabs TTS implementation
├── browser-speech.ts  # Browser speechSynthesis fallback
└── index.ts           # Provider factory
```

## Configuration

Set the `VOICE_PROVIDER` environment variable to choose a provider:

```bash
VOICE_PROVIDER=elevenlabs  # Use ElevenLabs (default if API key is set)
VOICE_PROVIDER=browser-speech  # Use browser Web Speech API
```

### Auto-detection

If `VOICE_PROVIDER` is not set, the system auto-detects:
- If `ELEVENLABS_API_KEY` exists → use ElevenLabs
- Otherwise → fall back to browser-speech

## Providers

### ElevenLabs

**API Key:** `ELEVENLABS_API_KEY`

High-quality hosted TTS with excellent Italian voices. Supports:
- Voice selection per character
- Speed control
- Multiple Italian voice options
- Multilingual model

**Usage:**
```typescript
import { getVoiceProvider } from '@/lib/voice/providers';

const provider = getVoiceProvider('elevenlabs');
const result = await provider.synthesize({
  text: 'Buongiorno! Come stai?',
  language: 'it',
  characterId: 'giulia',
  speed: 1.0,
});

// Returns Buffer with audio/mpeg data
```

**Character Voice Mapping:**

You can map specific characters to specific ElevenLabs voices:

```typescript
import { ElevenLabsProvider } from '@/lib/voice/providers/elevenlabs';

const provider = new ElevenLabsProvider();
provider.setVoiceForCharacter('giulia', 'pNInz6obpgDQGcFmaJgB');
provider.setVoiceForCharacter('marco', 'ErXwobaYiN019PkySvjV');
```

### Browser Speech

**API Key:** None required

Fallback provider that uses the browser's built-in `speechSynthesis` API. Good for:
- Development without API keys
- M1-M2 before hosted TTS in M3
- Devices with quality local voices (iOS Italian is good)

**Usage:**
```typescript
const provider = getVoiceProvider('browser-speech');
const result = await provider.synthesize({
  text: 'Ciao!',
  language: 'it',
});

// Returns { useBrowserSpeech: true }
// Client should use window.speechSynthesis
```

## API Endpoint

### POST `/api/speak`

Synthesizes text to speech.

**Request:**
```json
{
  "text": "Buongiorno! Come stai?",
  "language": "it",
  "characterId": "giulia",
  "voice": "pNInz6obpgDQGcFmaJgB",
  "speed": 1.0
}
```

**Response (ElevenLabs/OpenAI):**
- Content-Type: `audio/mpeg`
- Body: Audio stream

**Response (browser-speech):**
```json
{
  "useBrowserSpeech": true,
  "text": "Buongiorno! Come stai?",
  "language": "it",
  "speed": 1.0
}
```

### GET `/api/speak/voices?language=it`

Lists available voices for the current provider.

**Response:**
```json
{
  "provider": "elevenlabs",
  "language": "it",
  "voices": [
    {
      "id": "pNInz6obpgDQGcFmaJgB",
      "name": "Adam",
      "language": "it",
      "gender": "male",
      "provider": "elevenlabs"
    }
  ]
}
```

## Adding a New Provider

1. Create a new file in `/lib/voice/providers/` (e.g., `openai.ts`)
2. Implement the `VoiceProvider` interface:

```typescript
import { VoiceProvider, SynthesisParams, SynthesisResult } from './types';

export class OpenAITTSProvider implements VoiceProvider {
  name = 'openai';

  async synthesize(params: SynthesisParams): Promise<SynthesisResult> {
    // Implementation
  }

  async listVoices(language: string): Promise<Voice[]> {
    // Optional: return available voices
  }
}
```

3. Add to factory in `index.ts`:

```typescript
case 'openai':
  provider = new OpenAITTSProvider();
  break;
```

4. Update `VoiceProviderName` type in `types.ts`

## Design Principles

Following the architecture doc (05-architecture.md):

1. **Language-agnostic:** Providers work with any language, not just Italian
2. **Pluggable:** Easy to swap providers via environment variable
3. **Server-side:** API keys never exposed to browser
4. **Graceful fallback:** Falls back to browser-speech if no API key
5. **Per-character voices:** Support voice mapping for character consistency

## Frontend Usage

### Basic Usage

```typescript
// Play text using configured TTS provider
async function speakText(text: string, characterId?: string) {
  const response = await fetch('/api/speak', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      language: 'it',
      characterId,
      speed: 1.0,
    }),
  });

  const contentType = response.headers.get('content-type');

  if (contentType?.includes('application/json')) {
    // Browser speech fallback
    const data = await response.json();
    if (data.useBrowserSpeech) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'it-IT';
      window.speechSynthesis.speak(utterance);
    }
  } else {
    // Server-side audio
    const blob = await response.blob();
    const audio = new Audio(URL.createObjectURL(blob));
    audio.play();
  }
}

// Use it
await speakText('Buongiorno! Come stai?', 'giulia');
```

### React Hook Example

```typescript
import { useState } from 'react';

function useCharacterSpeech() {
  const [isPlaying, setIsPlaying] = useState(false);

  const speak = async (text: string, characterId?: string) => {
    setIsPlaying(true);
    try {
      await speakText(text, characterId);
    } finally {
      setIsPlaying(false);
    }
  };

  return { speak, isPlaying };
}
```

## Roadmap

- M1-M2: Use browser `speechSynthesis` (current fallback)
- M3: Add hosted TTS with ElevenLabs (implemented)
- Future: OpenAI TTS, Azure TTS, caching, streaming
