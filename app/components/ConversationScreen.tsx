'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { CharacterSheet, Turn, TurnOutput } from '@/lib/types';
import { language, browserVoiceFor } from '@/content';
import {
  FuoriError,
  newErrorId,
  fetchWithRetry,
  micError,
  reportError,
  toFuoriError,
  userMessage,
  voiceNote,
} from '@/lib/errors';
import { isDebugMode } from '@/lib/debug';
import { audioFileName } from '@/lib/speech/audio-file';
import { silenceAll } from '@/lib/speech/silence';
import { revealCount, estimateSeconds } from '@/lib/speech/reveal';
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
  /** Whether this conversation is being saved, with the start of its id */
  saved?: string;
  meter?: string;
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
  /** City id (e.g. 'napoli'), saved with the recorded conversation */
  cityId?: string;
  /** Neighbourhood of the place, shown after the role ("Bolero, Roma Norte") */
  neighbourhood?: string;
  onBack: () => void;
  showTranscripts?: boolean;
  showEnglish?: boolean;
  allowDialect?: boolean;
}

export function ConversationScreen({
  character,
  characterPortrait,
  cityName,
  cityId,
  neighbourhood,
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
  // Typewriter subtitles: characters of the reply shown so far (null = all of it)
  const [shown, setShown] = useState<number | null>(null);
  const revealFrameRef = useRef<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Shown when the hosted voice fails and the phone's voice takes over
  const [voiceFallback, setVoiceFallback] = useState<string | null>(null);
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
  // True once the meter has picked up real sound in this recording
  const [meterLive, setMeterLive] = useState(false);
  const speakingAtStartRef = useRef(false);
  // The live microphone stream, so leaving can turn the mic off
  const streamRef = useRef<MediaStream | null>(null);
  // False once the learner has left the screen or switched apps: nothing may
  // start speaking after that, and a recording in progress is thrown away
  const activeRef = useRef(true);
  // Id of this conversation in the database (set by the server on the opening line)
  const conversationIdRef = useRef<string | null>(null);

  // Leaving the screen or switching apps silences the character and the mic.
  // Before this, characters kept talking after you went back or opened another app.
  useEffect(() => {
    activeRef.current = true;
    const silence = () => {
      activeRef.current = false;
      silenceAll({
        audio: audioRef.current,
        synth: typeof speechSynthesis !== 'undefined' ? speechSynthesis : null,
        recorder: mediaRecorderRef.current,
        stream: streamRef.current,
        meter: meterRef.current,
      });
      streamRef.current = null;
      meterRef.current = null;
      setIsRecording(false);
      setIsSpeaking(false);
      // Stop typing and show the whole reply, since nothing will finish speaking it
      if (revealFrameRef.current !== null) cancelAnimationFrame(revealFrameRef.current);
      revealFrameRef.current = null;
      setShown(null);
    };
    // Ends the recorded conversation, which is when the character writes their
    // notes (a beacon survives navigation). Also sent when the app goes to the
    // background: on iPhone, locking the phone or switching apps never closes
    // this screen, and Safari may drop the page later without warning. Talking
    // again reopens the conversation; the server only rewrites memory if there
    // are new turns.
    const endConversation = () => {
      const id = conversationIdRef.current;
      if (id && typeof navigator !== 'undefined' && navigator.sendBeacon) {
        navigator.sendBeacon('/api/conversation/end', JSON.stringify({ conversationId: id }));
      }
    };
    const onVisibility = () => {
      if (document.hidden) {
        silence();
        endConversation();
      } else activeRef.current = true; // back in the app: ready again (nothing replays)
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', silence);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', silence);
      silence();
      endConversation();
    };
  }, []);

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

  // Typewriter subtitles: show the reply as it's spoken so you listen rather than
  // read ahead. progress() says how far through the speech we are (0–1).
  const startReveal = (text: string, progress: () => number) => {
    if (revealFrameRef.current !== null) cancelAnimationFrame(revealFrameRef.current);
    const tick = () => {
      const f = progress();
      if (f >= 1) return finishReveal();
      const n = revealCount(text, f);
      setShown((prev) => (prev === null || n > prev ? n : prev));
      revealFrameRef.current = requestAnimationFrame(tick);
    };
    revealFrameRef.current = requestAnimationFrame(tick);
  };
  // Show the whole reply: speech ended, was interrupted, or failed
  const finishReveal = () => {
    if (revealFrameRef.current !== null) cancelAnimationFrame(revealFrameRef.current);
    revealFrameRef.current = null;
    setShown(null);
  };
  // A new reply: hidden until the voice starts, then typed out as it speaks
  const presentReply = (line: string, en: string) => {
    finishReveal();
    setShown(0);
    setCurrentResponse(line);
    setCurrentTranslation(en);
  };

  // err is the hosted-voice failure, if any (null when no hosted voice is configured)
  const speakWithBrowser = (text: string, rate: number, err: FuoriError | null = null) => {
    if (!activeRef.current) return finishReveal(); // left the screen or the app
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language.speechLang;
      utterance.rate = rate;
      // A male or female Italian system voice to match the character
      const { voice, matchesGender } = browserVoiceFor(speechSynthesis.getVoices(), language.speechLang, character.id, character.gender);
      if (voice) utterance.voice = voice;
      setVoiceFallback(voiceNote(err, matchesGender, character.gender));
      setDebugInfo((d) => ({ ...d, voice: `${d.voice ?? 'browser'} · ${voice?.name ?? 'default'}${matchesGender ? '' : ' (wrong gender)'}` }));
      // Pace the subtitles: word boundaries where the phone reports them, else an estimate
      let boundary = 0;
      utterance.onboundary = (e) => { boundary = e.charIndex; };
      utterance.onstart = () => {
        setIsSpeaking(true);
        const t0 = performance.now();
        const est = estimateSeconds(text, rate) * 1000;
        startReveal(text, () =>
          Math.max(boundary / text.length, Math.min(0.97, (performance.now() - t0) / est))
        );
      };
      utterance.onend = () => { setIsSpeaking(false); finishReveal(); };
      utterance.onerror = () => { setIsSpeaking(false); finishReveal(); };
      speechSynthesis.speak(utterance);
    } catch {
      // no speech available: show the text
      finishReveal();
    }
  };
  const characterRole = character.role;

  // Calculate speech speed based on settings (hidden difficulty adjustment)
  // English subtitles = beginner (slowest), Default = intermediate, Dialect = advanced (natural speed)
  const getSpeechSpeed = (): number => {
    if (showEnglish) return 0.7; // Beginner: slower (was 0.5; raised 2026-10-11 with the default)
    if (allowDialect) return 1.0; // Advanced: natural speed with regional variations
    // Default: just under natural. Was 0.7; Josh found that too slow on the phone (2026-10-11)
    return 0.9;
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
            body: JSON.stringify({ character, transcript: [], cityId }),
          },
          'opening line'
        )
      );
      const turnOutput: TurnOutput = await response.json();
      setDebugInfo((d) => ({ ...d, prompt: response.headers.get('x-prompt-version') ?? undefined }));
      conversationIdRef.current = response.headers.get('x-conversation-id');
      setDebugInfo((d) => ({ ...d, saved: conversationIdRef.current ? `yes (${conversationIdRef.current.slice(0, 8)})` : 'no' }));

      const npcTurn: Turn = { who: 'npc', transcript: turnOutput.line, translation: turnOutput.en };
      setTranscript([npcTurn]);
      presentReply(turnOutput.line, turnOutput.en);

      // Play audio at appropriate speed for learner level
      await playResponse(turnOutput.line, character.id, getSpeechSpeed());
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
        } else {
          finishReveal(); // no voice at all: show the text
        }
      } else {
        // Audio stream
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        setVoiceFallback(null);
        setDebugInfo((d) => ({ ...d, voice: `hosted (${Math.round(audioBlob.size / 1024)} KB)` }));

        // The reply arrived after the learner left: don't start talking
        if (!activeRef.current) return finishReveal();

        // Reuse the element unlocked during the tap so iPhone Safari allows playback
        const audio = audioRef.current ?? new Audio();
        // A media element held in a ref is meant to be changed; the leave/background
        // effect above only pauses it, so the React Compiler's warning doesn't apply
        // eslint-disable-next-line react-hooks/immutability
        audio.src = audioUrl;
        audio.playbackRate = speed; // Control playback speed (0.5 = half speed, 2.0 = double speed)
        audioRef.current = audio;
        // Type the subtitles out as the audio plays
        startReveal(text, () =>
          audio.ended ? 1 : audio.duration > 0 && isFinite(audio.duration) ? audio.currentTime / audio.duration : 0
        );
        // Don't await - just start playback and return control immediately
        audio.play().catch((err) => {
          if (!activeRef.current) return; // paused because the learner left
          const e = toFuoriError(err, 'audio playback');
          reportError(e, { character: characterId });
          setDebugInfo((d) => ({ ...d, voice: 'browser (playback refused)', lastError: `[${e.id}] audio playback: ${e.message}` }));
          speakWithBrowser(text, speed, e);
        });
      }
    } catch (err) {
      // The hosted voice failed: log it, fall back to the browser voice, no message needed
      const e = toFuoriError(err, 'voice');
      reportError(e, { character: characterId });
      setDebugInfo((d) => ({ ...d, voice: 'browser (hosted voice failed)', lastError: `[${e.id}] voice: ${e.message}` }));
      speakWithBrowser(text, speed, e);
    }
  };

  // Reads the microphone level and moves the dots directly (no re-render per
  // frame). A fresh AudioContext per recording, created after the mic is live:
  // on iPhone a context made earlier can stay silent once recording starts.
  // Until real sound arrives the dots just pulse (CSS), so nothing looks frozen.
  const startLevelMeter = (stream: MediaStream) => {
    let ctx: AudioContext;
    try {
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new Ctx();
      void ctx.resume();
    } catch {
      setDebugInfo((d) => ({ ...d, meter: 'no Web Audio' }));
      return null;
    }
    audioCtxRef.current = ctx;
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);
    const data = new Uint8Array(analyser.fftSize);
    const shape = [0.55, 0.85, 1, 0.85, 0.55];
    let frame = 0;
    let loudest = 0;
    let live = false;
    setMeterLive(false);

    const tick = () => {
      analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128;
        sum += v * v;
      }
      const level = Math.min(1, Math.sqrt(sum / data.length) * 6); // 0..1
      loudest = Math.max(loudest, level);
      if (!live && level > 0.03) {
        live = true;
        setMeterLive(true);
      }
      const dots = dotsRef.current?.children;
      if (live && dots) {
        for (let i = 0; i < dots.length; i++) {
          (dots[i] as HTMLElement).style.transform = `scaleY(${1 + level * 3.2 * shape[i]})`;
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return {
      stop: () => {
        cancelAnimationFrame(frame);
        source.disconnect();
        analyser.disconnect();
        setDebugInfo((d) => ({
          ...d,
          meter: `${ctx.state}, ${ctx.sampleRate} Hz, peak ${loudest.toFixed(2)}${live ? '' : ' (no signal)'}`,
        }));
        void ctx.close();
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
      finishReveal(); // interrupted: show the rest of what they were saying
      setIsSpeaking(false);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
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
        streamRef.current = null;
        // Stopped because the learner left mid-recording: don't send it
        if (!activeRef.current) return;
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
            body: JSON.stringify({ learnerSaid: transcription, character, transcript, cityId, conversationId: conversationIdRef.current }),
          },
          'reply'
        )
      );
      const turnOutput: TurnOutput = await res.json();
      setDebugInfo((d) => ({ ...d, prompt: res.headers.get('x-prompt-version') ?? undefined }));
      conversationIdRef.current = res.headers.get('x-conversation-id') ?? conversationIdRef.current;
      setDebugInfo((d) => ({ ...d, saved: conversationIdRef.current ? `yes (${conversationIdRef.current.slice(0, 8)})` : 'no' }));

      const learnerTurn: Turn = { who: 'learner', transcript: transcription };
      const npcTurn: Turn = { who: 'npc', transcript: turnOutput.line, translation: turnOutput.en };
      setTranscript((prev) => [...prev, learnerTurn, npcTurn]);
      presentReply(turnOutput.line, turnOutput.en);

      // Step 3: Play character's response at appropriate speed for learner level
      await playResponse(turnOutput.line, character.id, getSpeechSpeed());
    } catch (err) {
      handleError(err, 'reply');
    } finally {
      setIsProcessing(false);
    }
  };

  const role = characterRole ? characterRole.charAt(0).toUpperCase() + characterRole.slice(1) : '';
  // "Bolero, Roma Norte": the role, then where you met them
  const roleLine = [role, neighbourhood].filter(Boolean).join(', ');
  const state: 'idle' | 'listening' | 'thinking' | 'speaking' = isRecording
    ? 'listening'
    : isProcessing
      ? 'thinking'
      : isSpeaking
        ? 'speaking'
        : 'idle';
  const showReply = (showTranscripts && currentResponse) || (showEnglish && currentTranslation);

  return (
    <div className={styles.screen}>
      {/* Band: back link and the person's name on solid paper, so subtitles never cover the name */}
      <header className={styles.band}>
        <button type="button" onClick={onBack} className={styles.back}>
          <span className={styles.backArrow} aria-hidden="true">←</span>
          <span className={styles.backCity}>{cityName}</span>
        </button>
        <div>
          <h1 className={styles.name}>{characterName}</h1>
          {roleLine && <p className={styles.role}>{roleLine}</p>}
        </div>
      </header>

      {/* Portrait fills the rest of the screen, edge to edge; text floats over it from mid-screen */}
      <div className={styles.stage}>
        {characterPortrait && !portraitFailed ? (
          // next/image serves a resized, modern-format copy sized to the screen
          <div className={styles.portraitFrame}>
            <Image
              src={characterPortrait}
              alt={characterName}
              fill
              priority
              sizes="(max-width: 600px) 130vw, 780px"
              className={styles.portrait}
              onError={() => setPortraitFailed(true)}
            />
          </div>
        ) : (
          <div className={styles.portraitPlaceholder}>👤</div>
        )}
      </div>

      {(showReply || error || voiceFallback || debug) && (
        <div className={styles.overlay}>
          {/* Character's reply as text, if turned on in Settings */}
          {showReply && (
            <div className={styles.reply}>
              {/* Text scrolls inside the card; key resets the scroll for each new reply */}
              <div className={styles.replyText} key={currentResponse ?? ''}>
                {showTranscripts && currentResponse && (
                  <div className={showEnglish ? styles.spokenWithEnglish : styles.spoken}>
                    {shown === null ? (
                      currentResponse
                    ) : (
                      <>
                        {currentResponse.slice(0, shown)}
                        {/* The rest is laid out but invisible, so the card doesn't grow as it types */}
                        <span className={styles.unspoken} aria-hidden>{currentResponse.slice(shown)}</span>
                      </>
                    )}
                  </div>
                )}
                {/* English appears once the Italian has been spoken */}
                {showEnglish && currentTranslation && shown === null && (
                  <div className={styles.english}>{currentTranslation}</div>
                )}
              </div>
            </div>
          )}

          {/* Error display: plain language, with a code to look up in the logs */}
          {error && <div className={styles.error}>{error}</div>}

          {/* The phone's voice took over: say so rather than switching silently */}
          {voiceFallback && !error && <div className={styles.note}>{voiceFallback}</div>}

          {/* Debug panel: open the app once with ?debug=1 (off with ?debug=0) */}
          {debug && (
            <div className={styles.debug}>
              <div><b>Prompt:</b> {debugInfo.prompt ?? '—'}</div>
              <div><b>Saved:</b> {debugInfo.saved ?? '—'}</div>
              <div><b>Recording:</b> {debugInfo.recording ?? '—'}</div>
              <div><b>Meter:</b> {debugInfo.meter ?? '—'}</div>
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
                <span className={`${styles.voice} ${meterLive ? '' : styles.waiting}`} ref={dotsRef} aria-hidden="true">
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
          </>
        )}
      </div>
    </div>
  );
}
