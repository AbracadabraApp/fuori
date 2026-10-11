'use client';

import { useState, useRef } from 'react';
import { CharacterSheet, Turn, TurnOutput } from '@/lib/types';
import { language } from '@/content/it/language';
import { browserVoiceFor } from '@/content/it/voices';
import {
  FuoriError,
  newErrorId,
  fetchWithRetry,
  micError,
  reportError,
  toFuoriError,
  userMessage,
} from '@/lib/errors';
import { isDebugMode } from '@/lib/debug';
import { audioFileName } from '@/lib/speech/audio-file';
import styles from './ConversationScreen.module.css';

// A zero-length WAV. Playing it during a tap "unlocks" audio on iPhone Safari,
// which otherwise blocks sound that starts after a network request.
const SILENT_WAV =
  'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';

// Below this size a recording is just a tap with no speech
const MIN_RECORDING_BYTES = 1500;
const NOTHING_HEARD = "Didn't catch anything. Tap the mic, speak, then tap again to send.";

/** Current time in ms (module-level so the React linter doesn't flag it). */
function now(): number {
  return performance.now();
}

async function measure<T>(fn: () => Promise<T>, done: (ms: number) => void): Promise<T> {
  const start = performance.now();
  try {
    return await fn();
  } finally {
    done(Math.round(performance.now() - start));
  }
}

interface DebugInfo {
  prompt?: string;
  heard?: string;
  recording?: string;
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
  const [isSpeaking, setIsSpeaking] = useState(false);
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
  const recordStartRef = useRef(0);
  // Live voice level while recording (dots move with your voice)
  const audioCtxRef = useRef<AudioContext | null>(null);
  const meterRef = useRef<{ stop: () => void } | null>(null);
  const dotsRef = useRef<HTMLSpanElement | null>(null);
  const [heardSomething, setHeardSomething] = useState(true);
  const speakingAtStartRef = useRef(false);

  const characterName = character.name;

  // Time a step for the debug panel
  const timed = <T,>(label: string, fn: () => Promise<T>): Promise<T> =>
    measure(fn, (ms) => setDebugInfo((d) => ({ ...d, timings: { ...d.timings, [label]: ms } })));

  // Log the error and say plainly what failed, with a code to look up.
  // No in-character cover: if the system is broken, asking the learner to
  // repeat only hides the bug. (Garbled speech is different: Claude gets the
  // text and asks to repeat in its own words.)
  const handleError = (err: unknown, step: string) => {
    const e = toFuoriError(err, step);
    reportError(e, { character: character.id, turns: transcript.length });
    setDebugInfo((d) => ({ ...d, lastError: `[${e.id}] ${e.step} (${e.kind}): ${e.message}` }));
    setError(userMessage(e, characterName));
    return e;
  };

  const speakWithBrowser = (text: string, rate: number) => {
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language.speechLang;
      utterance.rate = rate;
      // A male or female Italian system voice to match the character
      const voice = browserVoiceFor(speechSynthesis.getVoices(), language.speechLang, character.id, character.gender);
      if (voice) utterance.voice = voice;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
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
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (Ctx) {
        audioCtxRef.current ??= new Ctx();
        void audioCtxRef.current.resume();
      }
    } catch {
      // no Web Audio: the dots just won't move
    }
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
      // Speaking state for the mic label; the silent unlock clip doesn't count
      audio.onplaying = () => setIsSpeaking(!audio.src.startsWith('data:'));
      audio.onended = () => setIsSpeaking(false);
      audio.onpause = () => setIsSpeaking(false);
      audio.play().catch(() => {});
      audioRef.current = audio;
    }
  };

  const startConversation = async () => {
    unlockAudio();
    setHasStarted(true);
    setIsProcessing(true);
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
      setDebugInfo((d) => ({ ...d, prompt: response.headers.get('x-prompt-version') ?? undefined }));

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
    } finally {
      setIsProcessing(false);
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
            body: JSON.stringify({ text, language: language.code, characterId, gender: character.gender, speed }),
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

  // Reads the microphone level and moves the dots directly (no re-render per
  // frame). If nothing above a whisper arrives within 2 seconds, show a hint.
  const startLevelMeter = (stream: MediaStream) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return null;
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);
    const data = new Uint8Array(analyser.fftSize);
    const shape = [0.55, 0.85, 1, 0.85, 0.55];
    let frame = 0;
    let loudest = 0;
    const started = now();
    setHeardSomething(true);

    const tick = () => {
      analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128;
        sum += v * v;
      }
      const level = Math.min(1, Math.sqrt(sum / data.length) * 6); // 0..1
      loudest = Math.max(loudest, level);
      const dots = dotsRef.current?.children;
      if (dots) {
        for (let i = 0; i < dots.length; i++) {
          const el = dots[i] as HTMLElement;
          el.style.transform = `scaleY(${1 + level * 3.2 * shape[i]})`;
        }
      }
      if (now() - started > 2000 && loudest < 0.08) setHeardSomething(false);
      if (loudest >= 0.08) setHeardSomething(true);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return {
      stop: () => {
        cancelAnimationFrame(frame);
        source.disconnect();
        analyser.disconnect();
      },
    };
  };

  const startRecording = async () => {
    setError(null);

    try {
      // If the character is still talking, stop them: you're interrupting, and
      // iPhone can record silence while it is playing audio
      const audio = audioRef.current;
      speakingAtStartRef.current = (!!audio && !audio.paused && !audio.ended) || speechSynthesis.speaking;
      audio?.pause();
      speechSynthesis.cancel();
      setIsSpeaking(false);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      meterRef.current = startLevelMeter(stream);

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
        const ms = Math.round(now() - recordStartRef.current);
        meterRef.current?.stop();
        meterRef.current = null;
        stream.getTracks().forEach((track) => track.stop());
        await processAudio(audioBlob, ms);
      };

      mediaRecorder.start();
      recordStartRef.current = now();
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

  // Nothing usable was heard: tell the learner, and log the details with a code
  // (recording length and size, what Whisper returned) so the cause can be found
  const nothingHeard = (reason: string, audioBlob: Blob, ms: number, heard?: string) => {
    const e = new FuoriError(`nothing heard: ${reason}`, newErrorId(), 'server', 'nothing heard');
    reportError(e, {
      character: character.id,
      reason,
      ms,
      bytes: audioBlob.size,
      type: audioBlob.type,
      heard,
      characterWasSpeaking: speakingAtStartRef.current,
    });
    setDebugInfo((d) => ({ ...d, lastError: `[${e.id}] nothing heard (${reason})` }));
    setError(`${NOTHING_HEARD} (${e.id})`);
    setIsProcessing(false);
  };

  const processAudio = async (audioBlob: Blob, ms: number) => {
    setIsProcessing(true);
    setError(null);
    setDebugInfo((d) => ({
      ...d,
      recording: `${(ms / 1000).toFixed(1)}s, ${Math.round(audioBlob.size / 1024)} KB, ${audioBlob.type}${speakingAtStartRef.current ? ', interrupted the character' : ''}`,
    }));

    // Nothing recorded (a very short tap): say so instead of sending silence
    if (audioBlob.size < MIN_RECORDING_BYTES) {
      nothingHeard('recording too short', audioBlob, ms);
      return;
    }

    // Step 1: Transcribe audio
    let transcription: string;
    try {
      const form = new FormData();
      // Name the file so Whisper knows the format (a bare Blob uploads as "blob")
      form.append('audio', audioBlob, audioFileName(audioBlob.type));
      form.append('language', language.code);
      const res = await timed('transcribe', () =>
        fetchWithRetry('/api/transcribe', { method: 'POST', body: form }, 'transcribe')
      );
      transcription = (await res.json()).text;
      // The learner's own words are never shown (M1: preserves immersion), except in debug mode
      setDebugInfo((d) => ({ ...d, heard: transcription }));
    } catch (err) {
      handleError(err, 'transcribe');
      setIsProcessing(false);
      return;
    }

    // Whisper heard no words
    if (!transcription?.trim()) {
      nothingHeard('no words in transcript', audioBlob, ms, transcription);
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
      setDebugInfo((d) => ({ ...d, prompt: res.headers.get('x-prompt-version') ?? undefined }));

      const learnerTurn: Turn = { who: 'learner', transcript: transcription };
      const npcTurn: Turn = { who: 'npc', transcript: turnOutput.it, translation: turnOutput.en };
      setTranscript((prev) => [...prev, learnerTurn, npcTurn]);
      setCurrentResponse(turnOutput.it);
      setCurrentTranslation(turnOutput.en);

      // Step 3: Play character's response at appropriate speed for learner level
      await playResponse(turnOutput.it, character.id, getSpeechSpeed());
    } catch (err) {
      handleError(err, 'reply');
    } finally {
      setIsProcessing(false);
    }
  };

  const role = characterRole ? characterRole.charAt(0).toUpperCase() + characterRole.slice(1) : '';
  const state: 'idle' | 'listening' | 'thinking' | 'speaking' = isRecording
    ? 'listening'
    : isProcessing
      ? 'thinking'
      : isSpeaking
        ? 'speaking'
        : 'idle';
  // Short hint under the mic: only what you need to do next
  const hint =
    state === 'listening'
      ? heardSomething
        ? 'Tap to send'
        : "Not hearing you. Check the mic isn't covered or muted."
      : state === 'idle'
        ? 'Tap to speak'
        : '';
  const showReply = (showTranscripts && currentResponse) || (showEnglish && currentTranslation);

  return (
    <div className={styles.screen}>
      {/* Compact header */}
      <button type="button" onClick={onBack} className={styles.back}>
        <span className={styles.backArrow} aria-hidden="true">‹</span>
        <span className={styles.backCity}>{cityName}</span>
      </button>

      <div className={styles.nameLine}>
        <span className={styles.name}>{characterName}</span>
        {role && <span className={styles.role}> · {role}</span>}
      </div>

      {/* Portrait fills the stage; text floats over it from mid-screen */}
      <div className={styles.stage}>
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
      </div>

      {(showReply || error || debug) && (
        <div className={styles.overlay}>
          {/* Character's reply as text, if turned on in Settings */}
          {showReply && (
            <div className={styles.reply}>
              {/* Text scrolls inside the card; key resets the scroll for each new reply */}
              <div className={styles.replyText} key={currentResponse ?? ''}>
                {showTranscripts && currentResponse && (
                  <div className={showEnglish ? styles.italianWithEnglish : styles.italian}>
                    {currentResponse}
                  </div>
                )}
                {showEnglish && currentTranslation && <div className={styles.english}>{currentTranslation}</div>}
              </div>
            </div>
          )}

          {/* Error display: plain language, with a code to look up in the logs */}
          {error && <div className={styles.error}>{error}</div>}

          {/* Debug panel: open the app once with ?debug=1 (off with ?debug=0) */}
          {debug && (
            <div className={styles.debug}>
              <div><b>Prompt:</b> {debugInfo.prompt ?? '—'}</div>
              <div><b>Recording:</b> {debugInfo.recording ?? '—'}</div>
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
      )}

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
              aria-label={state === 'listening' ? 'Send' : state === 'thinking' ? `${characterName} is replying` : 'Speak'}
              className={`${styles.mic} ${styles[state]}`}
            >
              {state === 'listening' ? (
                // Green dots that move with your voice: proof it's being captured
                <span className={styles.voice} ref={dotsRef} aria-hidden="true">
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </span>
              ) : state === 'thinking' ? (
                // Terracotta dots while the character prepares a reply
                <span className={styles.dots} aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
              ) : (
                <span className={styles.micIcon} aria-hidden="true">🎤</span>
              )}
            </button>
            <div className={`${styles.status} ${!heardSomething && state === 'listening' ? styles.warn : ''}`}>
              {hint}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
