'use client';

import { useState, useRef } from 'react';
import { CharacterSheet, Turn, TurnOutput } from '@/lib/types';
import styles from './ConversationScreen.module.css';

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
  character: CharacterSheet;
  characterPortrait?: string;
  cityName: string;
  onBack: () => void;
  showTranscripts?: boolean;
  showEnglish?: boolean;
  allowDialect?: boolean;
}

export function ConversationScreen({
  character,
  characterPortrait,
  cityName,
  onBack,
  showTranscripts = true,
  showEnglish = false,
  allowDialect = false,
}: ConversationScreenProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [transcript, setTranscript] = useState<Turn[]>([]);
  const [currentResponse, setCurrentResponse] = useState<string | null>(null);
  const [currentTranslation, setCurrentTranslation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [portraitFailed, setPortraitFailed] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const characterName = character.name;
  const characterRole = character.role;

  // Calculate speech speed based on settings (hidden difficulty adjustment)
  // English subtitles = beginner (slowest), Default = intermediate, Dialect = advanced (natural speed)
  const getSpeechSpeed = (): number => {
    if (showEnglish) return 0.5; // Beginner: very slow for max comprehension
    if (allowDialect) return 1.0; // Advanced: natural speed with regional variations
    return 0.7; // Intermediate: comfortably slower for learning
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
          character,
          transcript: [],
        }),
      });

      if (!response.ok) {
        throw new Error(await describeFailure(response, `${characterName} could not answer`));
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
      setCurrentTranslation(turnOutput.en);

      // Play audio at appropriate speed for learner level
      await playResponse(turnOutput.it, character.id, getSpeechSpeed());
    } catch (err) {
      console.error('Error starting conversation:', err);
      setError(err instanceof Error ? err.message : 'Failed to start conversation.');
    }
  };

  const playResponse = async (text: string, characterId: string, speed: number = 1.0) => {
    try {
      const response = await fetch('/api/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          language: 'it',
          characterId,
          speed, // For future TTS providers that support it
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

        // Reuse the element unlocked during the tap so iPhone Safari allows playback
        const audio = audioRef.current ?? new Audio();
        audio.src = audioUrl;
        audio.playbackRate = speed; // Control playback speed (0.5 = half speed, 2.0 = double speed)
        audioRef.current = audio;
        // Don't await - just start playback and return control immediately
        audio.play().catch((err) => console.error('Audio playback error:', err));
      }
    } catch (err) {
      console.error('Error playing audio:', err);
      // Fall back to browser speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'it-IT';
      speechSynthesis.speak(utterance);
    }
  };

  const startRecording = async () => {
    setError(null);

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

      // The learner's own words are never shown (M1: preserves immersion)

      // Step 2: Get character response
      const turnResponse = await fetch('/api/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          learnerSaid: transcription,
          character,
          transcript,
        }),
      });

      if (!turnResponse.ok) {
        throw new Error(await describeFailure(turnResponse, `${characterName} could not answer`));
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
      setCurrentTranslation(turnOutput.en);

      // Step 3: Play character's response at appropriate speed for learner level
      await playResponse(turnOutput.it, character.id, getSpeechSpeed());
    } catch (err) {
      console.error('Error processing audio:', err);
      setError(err instanceof Error ? err.message : 'Failed to process your message.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={styles.screen}>
      {/* Back button */}
      <div onClick={onBack} className={styles.back}>
        <span className={styles.backArrow}>←</span>
        <span className={styles.backCity}>{cityName}</span>
      </div>

      {/* Portrait and name area */}
      <div className={styles.body}>
        {characterPortrait && !portraitFailed ? (
          <img
            src={characterPortrait}
            alt={characterName}
            className={styles.portrait}
            onError={() => setPortraitFailed(true)}
          />
        ) : (
          <div className={styles.portraitPlaceholder}>👤</div>
        )}
        <div className={styles.nameLine}>
          <span className={styles.name}>{characterName}</span>
          {characterRole && (
            <span className={styles.role}>
              , {characterRole.charAt(0).toUpperCase() + characterRole.slice(1)}
            </span>
          )}
        </div>

        {/* Character's reply as text, if turned on in Settings */}
        {(showTranscripts && currentResponse) || (showEnglish && currentTranslation) ? (
          <div className={styles.reply}>
            {showTranscripts && currentResponse && (
              <div className={showEnglish ? styles.italianWithEnglish : styles.italian}>
                {currentResponse}
              </div>
            )}
            {showEnglish && currentTranslation && (
              <div className={styles.english}>{currentTranslation}</div>
            )}
          </div>
        ) : null}

        {/* Error display */}
        {error && <div className={styles.error}>{error}</div>}
      </div>

      {/* Mic button area */}
      <div className={styles.controls}>
        {!hasStarted ? (
          <button onClick={startConversation} disabled={isProcessing} className={styles.startButton}>
            Start conversation
          </button>
        ) : (
          <>
            <button
              onClick={toggleRecording}
              disabled={isProcessing}
              className={`${styles.mic} ${isRecording ? styles.recording : ''}`}
            >
              🎤
            </button>
            <div className={styles.status}>
              {isProcessing ? 'Processing...' : isRecording ? 'Tap to stop' : 'Tap to speak'}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
