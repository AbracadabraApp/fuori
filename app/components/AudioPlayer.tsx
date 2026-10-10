'use client';

import { useEffect, useRef, useState } from 'react';

interface AudioPlayerProps {
  text: string;           // Text to speak
  audioUrl?: string;      // Audio URL (from server)
  audioBlob?: Blob;       // Audio blob (from server)
  useBrowserSpeech?: boolean;  // Fallback to browser
  language?: string;      // Default: 'it-IT'
  onComplete?: () => void;
}

export function AudioPlayer({
  text,
  audioUrl,
  audioBlob,
  useBrowserSpeech = false,
  language = 'it-IT',
  onComplete
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  // Auto-play when audio changes
  useEffect(() => {
    if (useBrowserSpeech) {
      playWithBrowserSpeech();
    } else if (audioUrl || audioBlob) {
      playAudio();
    }
  }, [audioUrl, audioBlob, useBrowserSpeech, text]);

  const playAudio = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Clean up previous object URL if exists
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }

      // Create audio element if it doesn't exist
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }

      const audio = audioRef.current;

      // Set audio source
      if (audioBlob) {
        const url = URL.createObjectURL(audioBlob);
        objectUrlRef.current = url;
        audio.src = url;
      } else if (audioUrl) {
        audio.src = audioUrl;
      } else {
        throw new Error('No audio source provided');
      }

      // Set up event listeners
      audio.onended = () => {
        setIsPlaying(false);
        onComplete?.();
      };

      audio.onerror = () => {
        setError('Failed to load audio');
        setIsPlaying(false);
        setIsLoading(false);
      };

      audio.oncanplay = () => {
        setIsLoading(false);
      };

      // Play audio
      await audio.play();
      setIsPlaying(true);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Playback failed');
      setIsPlaying(false);
      setIsLoading(false);
    }
  };

  const playWithBrowserSpeech = () => {
    try {
      setError(null);

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;

      // Try to select an Italian voice
      const voices = window.speechSynthesis.getVoices();
      const italianVoice = voices.find(voice =>
        voice.lang.startsWith('it') || voice.lang.startsWith('it-IT')
      );
      if (italianVoice) {
        utterance.voice = italianVoice;
      }

      utterance.onstart = () => {
        setIsPlaying(true);
      };

      utterance.onend = () => {
        setIsPlaying(false);
        onComplete?.();
      };

      utterance.onerror = () => {
        setError('Speech synthesis failed');
        setIsPlaying(false);
      };

      speechRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Speech failed');
      setIsPlaying(false);
    }
  };

  const handleReplay = () => {
    if (useBrowserSpeech) {
      playWithBrowserSpeech();
    } else {
      playAudio();
    }
  };

  const handleStop = () => {
    if (useBrowserSpeech) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {isLoading && (
        <div className="text-sm text-gray-500">Loading...</div>
      )}

      {error && (
        <div className="text-sm text-red-500">{error}</div>
      )}

      {isPlaying ? (
        <button
          onClick={handleStop}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
          disabled={isLoading}
        >
          Stop
        </button>
      ) : (
        <button
          onClick={handleReplay}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          disabled={isLoading}
        >
          Ascolta di nuovo
        </button>
      )}

      {isPlaying && (
        <div className="flex items-center gap-1">
          <div className="w-1 h-3 bg-blue-500 animate-pulse"></div>
          <div className="w-1 h-4 bg-blue-500 animate-pulse" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-1 h-3 bg-blue-500 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        </div>
      )}
    </div>
  );
}
