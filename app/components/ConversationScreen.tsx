'use client';

import { useState, useRef } from 'react';
import { CharacterSheet, Turn, TurnOutput } from '@/lib/types';
import { language } from '@/content/it/language';
import {
  fetchWithRetry,
  micError,
  reportError,
  toFuoriError,
  userMessage,
} from '@/lib/errors';
import { isDebugMode } from '@/lib/debug';
import styles from './ConversationScreen.module.css';

// A zero-length WAV. Playing it during a tap "unlocks" audio on iPhone Safari,
// which otherwise blocks sound that starts after a network request.
const SILENT_WAV =
  'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';

async function measure<T>(fn: () => Promise<T>, done: (ms: number) => void): Promise<T> {
  const start = performance.now();
  try {
    return await fn();
  } finally {
    done(Math.round(performance.now() - start));
  }
}

interface DebugInfo {
  heard?: string;
  voice?: string;
  timings: Record<string, number>;
  lastError?: string;
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
  // Only ever rendered in the browser (after a place is tapped), so window is available
  const [debug] = useState(() => typeof window !== 'undefined' && isDebugMode());
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({ timings: {} });
  const [portraitFailed, setPortraitFailed] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const characterName = character.name;
  const recovery = language.recovery[character.speech.formality === 'Lei' ? 'Lei' : 'tu'];

  // Time a step for the debug panel
  const timed = <T,>(label: string, fn: () => Promise<T>): Promise<T> =>
    measure(fn, (ms) => setDebugInfo((d) => ({ ...d, timings: { ...d.timings, [label]: ms } })));

  // Log the error, show a plain message (or recover in character), keep details for debug mode
  const handleError = (err: unknown, step: string, recoverWith?: string) => {
    const e = toFuoriError(err, step);
    reportError(e, { character: character.id, turns: transcript.length });
    setDebugInfo((d) => ({ ...d, lastError: `[${e.id}] ${e.step} (${e.kind}): ${e.message}` }));

    if (recoverWith && e.kind === 'server') {
      // Stay in the conversation: the character asks you to say it again
      setCurrentResponse(recoverWith);
      setCurrentTranslation(null);
      speakWithBrowser(recoverWith, getSpeechSpeed());
      setError(debug ? userMessage(e) : null);
    } else {
      setError(userMessage(e));
    }
    return e;
  };

  const speakWithBrowser = (text: string, rate: number) => {
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language.speechLang;
      utterance.rate = rate;
      speechSynthesis.speak(utterance);
    } catch {
      // no speech available
    }
  };
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
      const response = await timed('turn', () =>
        fetchWithRetry(
          '/api/turn',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ character, transcript: [] }),
          },
          'opening line'
        )
      );
      const turnOutput: TurnOutput = await response.json();

      const npcTurn: Turn = { who: 'npc', transcript: turnOutput.it, translation: turnOutput.en };
      setTranscript([npcTurn]);
      setCurrentResponse(turnOutput.it);
      setCurrentTranslation(turnOutput.en);

      // Play audio at appropriate speed for learner level
      await playResponse(turnOutput.it, character.id, getSpeechSpeed());
    } catch (err) {
      // Nothing has been said yet, so show the Start button again
      handleError(err, 'opening line');
      setHasStarted(false);
    }
  };

  const playResponse = async (text: string, characterId: string, speed: number = 1.0) => {
    try {
      const response = await timed('speak', () =>
        fetchWithRetry(
          '/api/speak',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, language: language.code, characterId, speed }),
          },
          'voice'
        )
      );

      const contentType = response.headers.get('Content-Type');

      if (contentType?.includes('application/json')) {
        // Browser speech fallback
        const data = await response.json();
        if (data.useBrowserSpeech) {
          setDebugInfo((d) => ({ ...d, voice: 'browser (no hosted voice configured)' }));
          speakWithBrowser(text, data.speed || speed);
        }
      } else {
        // Audio stream
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        setDebugInfo((d) => ({ ...d, voice: `hosted (${Math.round(audioBlob.size / 1024)} KB)` }));

        // Reuse the element unlocked during the tap so iPhone Safari allows playback
        const audio = audioRef.current ?? new Audio();
        audio.src = audioUrl;
        audio.playbackRate = speed; // Control playback speed (0.5 = half speed, 2.0 = double speed)
        audioRef.current = audio;
        // Don't await - just start playback and return control immediately
        audio.play().catch((err) => {
          const e = toFuoriError(err, 'audio playback');
          reportError(e, { character: characterId });
          setDebugInfo((d) => ({ ...d, lastError: `[${e.id}] audio playback: ${e.message}` }));
          speakWithBrowser(text, speed);
        });
      }
    } catch (err) {
      // The hosted voice failed: log it, fall back to the browser voice, no message needed
      const e = toFuoriError(err, 'voice');
      reportError(e, { character: characterId });
      setDebugInfo((d) => ({ ...d, voice: 'browser (hosted voice failed)', lastError: `[${e.id}] voice: ${e.message}` }));
      speakWithBrowser(text, speed);
    }
  };

  const startRecording = async () => {
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Try formats in order of Groq compatibility
      // iPhone Safari typically supports mp4 with AAC codec
      let mimeType = 'audio/mp4';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/wav';
      }

      console.log('Recording with mimeType:', mimeType);

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
        console.log('Audio blob created:', {
          type: audioBlob.type,
          size: audioBlob.size,
        });
        await processAudio(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      handleError(micError(err), 'microphone');
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

    // Step 1: Transcribe audio
    let transcription: string;
    try {
      const form = new FormData();
      form.append('audio', audioBlob);
      form.append('language', language.code);
      const res = await timed('transcribe', () =>
        fetchWithRetry('/api/transcribe', { method: 'POST', body: form }, 'transcribe')
      );
      transcription = (await res.json()).text;
      // The learner's own words are never shown (M1: preserves immersion), except in debug mode
      setDebugInfo((d) => ({ ...d, heard: transcription }));
    } catch (err) {
      handleError(err, 'transcribe', recovery.didntHear);
      setIsProcessing(false);
      return;
    }

    try {
      // Step 2: Get character response
      const res = await timed('turn', () =>
        fetchWithRetry(
          '/api/turn',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ learnerSaid: transcription, character, transcript }),
          },
          'reply'
        )
      );
      const turnOutput: TurnOutput = await res.json();

      const learnerTurn: Turn = { who: 'learner', transcript: transcription };
      const npcTurn: Turn = { who: 'npc', transcript: turnOutput.it, translation: turnOutput.en };
      setTranscript((prev) => [...prev, learnerTurn, npcTurn]);
      setCurrentResponse(turnOutput.it);
      setCurrentTranslation(turnOutput.en);

      // Step 3: Play character's response at appropriate speed for learner level
      await playResponse(turnOutput.it, character.id, getSpeechSpeed());
    } catch (err) {
      handleError(err, 'reply', recovery.lostTrack);
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

        {/* Error display: plain language, with a code to look up in the logs */}
        {error && <div className={styles.error}>{error}</div>}

        {/* Debug panel: open the app once with ?debug=1 (off with ?debug=0) */}
        {debug && (
          <div className={styles.debug}>
            <div><b>Heard:</b> {debugInfo.heard ?? '—'}</div>
            <div><b>Voice:</b> {debugInfo.voice ?? '—'}</div>
            <div>
              <b>Timings:</b>{' '}
              {Object.entries(debugInfo.timings).map(([k, v]) => `${k} ${v}ms`).join(' · ') || '—'}
            </div>
            <div><b>Speed:</b> {getSpeechSpeed()}</div>
            {debugInfo.lastError && <div className={styles.debugError}>{debugInfo.lastError}</div>}
          </div>
        )}
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
