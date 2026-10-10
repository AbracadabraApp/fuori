'use client';

import { useState, useRef } from 'react';
import { CharacterSheet, Scene, Turn, Level, TurnOutput } from '@/lib/types';

// A zero-length WAV. Playing it during a tap "unlocks" audio on iPhone Safari,
// which otherwise blocks sound that starts after a network request.
const SILENT_WAV =
  'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';

// Turn a failed API response into a readable message instead of a blank screen.
async function describeFailure(response: Response, what: string): Promise<string> {
  try {
    const body = await response.json();
    const detail = body.details ?? body.error;
    const text = typeof detail === 'string' ? detail : JSON.stringify(detail);
    return `${what} (${response.status}): ${text}`;
  } catch {
    return `${what} (${response.status})`;
  }
}

interface ConversationScreenProps {
  characterName: string;
  characterRole?: string;
  characterPortrait?: string;
  cityName: string;
  character?: CharacterSheet;
  scene?: Scene;
  level?: Level;
  onBack: () => void;
}

export function ConversationScreen({
  characterName,
  characterRole,
  characterPortrait,
  cityName,
  character,
  scene,
  level = 'A1',
  onBack,
}: ConversationScreenProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [transcript, setTranscript] = useState<Turn[]>([]);
  const [currentTranscription, setCurrentTranscription] = useState<string | null>(null);
  const [currentResponse, setCurrentResponse] = useState<string | null>(null);
  const [lastAudioUrl, setLastAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Test scene and character - TODO: Replace with actual data passed via props
  const testCharacter: CharacterSheet = character || {
    id: 'giulia',
    name: 'Giulia',
    age: 32,
    role: 'barista',
    city: 'Roma',
    origin: 'anchor',
    placeId: 'bar-trastevere-giulia',
    personality: {
      traits: ['quick', 'funny', 'warm', 'curious'],
      caresAbout: ['making perfect coffee', 'neighborhood gossip'],
    },
    speech: {
      formality: 'tu',
      pace: 'quick',
      regionalisms: ['daje'],
      description: 'Fast-talking, informal Roman barista',
    },
    appearance: {
      description: 'Italian woman in her early 30s, dark curly hair',
      setting: 'Behind the counter of a small Roman coffee bar',
    },
    portrait: {
      kind: 'placeholder',
    },
  };

  const testScene: Scene = scene || {
    id: 'test-scene-1',
    characterId: 'giulia',
    setting: {
      place: 'Bar in Trastevere',
      timeOfDay: 'morning',
      description: 'A cozy neighborhood coffee bar with morning light streaming through the windows',
    },
    goal: ['Greet Giulia', 'Order a coffee', 'Try a cornetto'],
    opening: {
      guide: 'Greet the learner warmly as a new customer, ask what they would like',
      fallback: {
        it: 'Ciao! Benvenuto! Cosa vuoi?',
        en: 'Hi! Welcome! What would you like?',
      },
    },
  };

  // Must run synchronously inside a tap handler, before any await.
  const unlockAudio = () => {
    try {
      const warmup = new SpeechSynthesisUtterance(' ');
      warmup.volume = 0;
      speechSynthesis.speak(warmup);
    } catch {
      // speechSynthesis not available
    }
    if (!audioRef.current) {
      const audio = new Audio();
      audio.src = SILENT_WAV;
      audio.play().catch(() => {});
      audioRef.current = audio;
    }
  };

  const startConversation = async () => {
    unlockAudio();
    setHasStarted(true);
    setError(null);

    try {
      // Get opening line from character
      const response = await fetch('/api/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          character: testCharacter,
          scene: testScene,
          level,
          transcript: [],
        }),
      });

      if (!response.ok) {
        throw new Error(await describeFailure(response, 'Giulia could not answer'));
      }

      const turnOutput: TurnOutput = await response.json();

      // Add to transcript
      const npcTurn: Turn = {
        who: 'npc',
        transcript: turnOutput.it,
        translation: turnOutput.en,
      };
      setTranscript([npcTurn]);
      setCurrentResponse(turnOutput.it);

      // Play audio
      await playResponse(turnOutput.it, testCharacter.id);
    } catch (err) {
      console.error('Error starting conversation:', err);
      setError(err instanceof Error ? err.message : 'Failed to start conversation.');
    }
  };

  const playResponse = async (text: string, characterId: string) => {
    try {
      const response = await fetch('/api/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          language: 'it',
          characterId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to synthesize speech');
      }

      const contentType = response.headers.get('Content-Type');

      if (contentType?.includes('application/json')) {
        // Browser speech fallback
        const data = await response.json();
        if (data.useBrowserSpeech) {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'it-IT';
          utterance.rate = data.speed || 1.0;
          speechSynthesis.speak(utterance);
        }
      } else {
        // Audio stream
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        setLastAudioUrl(audioUrl);

        // Reuse the element unlocked during the tap so iPhone Safari allows playback
        const audio = audioRef.current ?? new Audio();
        audio.src = audioUrl;
        audioRef.current = audio;
        await audio.play();
      }
    } catch (err) {
      console.error('Error playing audio:', err);
      // Fall back to browser speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'it-IT';
      speechSynthesis.speak(utterance);
    }
  };

  const replayLastAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else if (lastAudioUrl) {
      const audio = new Audio(lastAudioUrl);
      audioRef.current = audio;
      audio.play();
    }
  };

  const startRecording = async () => {
    setError(null);
    setCurrentTranscription(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        await processAudio(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setError('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    unlockAudio();
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Step 1: Transcribe audio
      const transcribeFormData = new FormData();
      transcribeFormData.append('audio', audioBlob);
      transcribeFormData.append('language', 'it');

      const transcribeResponse = await fetch('/api/transcribe', {
        method: 'POST',
        body: transcribeFormData,
      });

      if (!transcribeResponse.ok) {
        throw new Error(await describeFailure(transcribeResponse, 'Transcription failed'));
      }

      const transcribeData = await transcribeResponse.json();
      const transcription = transcribeData.text;

      // Show transcription to user
      setCurrentTranscription(transcription);

      // Step 2: Get character response
      const turnResponse = await fetch('/api/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          learnerSaid: transcription,
          character: testCharacter,
          transcript,
        }),
      });

      if (!turnResponse.ok) {
        throw new Error(await describeFailure(turnResponse, 'Giulia could not answer'));
      }

      const turnOutput: TurnOutput = await turnResponse.json();

      // Add turns to transcript
      const learnerTurn: Turn = {
        who: 'learner',
        transcript: transcription,
      };
      const npcTurn: Turn = {
        who: 'npc',
        transcript: turnOutput.it,
        translation: turnOutput.en,
      };

      setTranscript((prev) => [...prev, learnerTurn, npcTurn]);
      setCurrentResponse(turnOutput.it);

      // Step 3: Play character's response
      await playResponse(turnOutput.it, testCharacter.id);
    } catch (err) {
      console.error('Error processing audio:', err);
      setError(err instanceof Error ? err.message : 'Failed to process your message.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#f5f1ed',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Back button */}
      <div
        onClick={onBack}
        style={{
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
        }}
      >
        <span style={{ fontSize: '28px' }}>←</span>
        <span style={{ marginLeft: '12px', fontSize: '24px', color: '#2c5f4f', fontWeight: '500' }}>
          {cityName}
        </span>
      </div>

      {/* Portrait and name area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          padding: '20px',
          gap: '16px',
          overflowY: 'auto',
        }}
      >
        {characterPortrait ? (
          <img
            src={characterPortrait}
            alt={characterName}
            style={{
              maxWidth: '100%',
              maxHeight: '60vh',
              objectFit: 'contain',
            }}
          />
        ) : (
          <div
            style={{
              width: '300px',
              height: '300px',
              backgroundColor: '#e8d5c4',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px',
            }}
          >
            👤
          </div>
        )}
        <div style={{ fontSize: '24px', color: '#000' }}>
          <span style={{ fontWeight: '600' }}>{characterName}</span>
          {characterRole && (
            <span style={{ fontWeight: '300' }}>, {characterRole.charAt(0).toUpperCase() + characterRole.slice(1)}</span>
          )}
        </div>

        {/* Current response text */}
        {currentResponse && (
          <div
            style={{
              marginTop: '16px',
              padding: '16px',
              backgroundColor: '#fff',
              borderRadius: '12px',
              fontSize: '18px',
              color: '#333',
              maxWidth: '100%',
            }}
          >
            <div style={{ fontStyle: 'italic', marginBottom: '8px' }}>{currentResponse}</div>
            {lastAudioUrl && (
              <button
                onClick={replayLastAudio}
                style={{
                  marginTop: '8px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  backgroundColor: '#e8d5c4',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                Ascolta di nuovo
              </button>
            )}
          </div>
        )}

        {/* Current transcription */}
        {currentTranscription && (
          <div
            style={{
              marginTop: '8px',
              padding: '12px',
              backgroundColor: '#e8f4f0',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#2c5f4f',
              maxWidth: '100%',
            }}
          >
            <strong>You said:</strong> {currentTranscription}
          </div>
        )}

        {/* Error display */}
        {error && (
          <div
            style={{
              marginTop: '8px',
              padding: '12px',
              backgroundColor: '#f8d7da',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#721c24',
              maxWidth: '100%',
            }}
          >
            {error}
          </div>
        )}
      </div>

      {/* Mic button area */}
      <div
        style={{
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        {!hasStarted ? (
          <button
            onClick={startConversation}
            disabled={isProcessing}
            style={{
              padding: '16px 32px',
              fontSize: '18px',
              backgroundColor: '#2c5f4f',
              color: 'white',
              border: 'none',
              borderRadius: '24px',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              opacity: isProcessing ? 0.6 : 1,
            }}
          >
            Start conversation
          </button>
        ) : (
          <>
            <button
              onClick={toggleRecording}
              disabled={isProcessing}
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: isRecording ? '#dc3545' : '#2c5f4f',
                border: 'none',
                color: 'white',
                fontSize: '32px',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                opacity: isProcessing ? 0.6 : 1,
                boxShadow: isRecording
                  ? '0 0 0 4px rgba(220, 53, 69, 0.3)'
                  : '0 2px 8px rgba(0,0,0,0.2)',
                transition: 'all 0.2s',
              }}
            >
              🎤
            </button>
            <div style={{ fontSize: '14px', color: '#666', textAlign: 'center' }}>
              {isProcessing
                ? 'Processing...'
                : isRecording
                ? 'Tap to stop'
                : 'Tap to speak'}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
