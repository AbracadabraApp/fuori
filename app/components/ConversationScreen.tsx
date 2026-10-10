'use client';

import { useState, useRef } from 'react';

interface ConversationScreenProps {
  characterName: string;
  characterPortrait?: string;
  onBack: () => void;
}

export function ConversationScreen({
  characterName,
  characterPortrait,
  onBack,
}: ConversationScreenProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startConversation = async () => {
    setHasStarted(true);
    // TODO: Get opening line from character
    // TODO: Play audio
  };

  const startRecording = async () => {
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
        await processAudio(audioBlob, mimeType);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const processAudio = async (audioBlob: Blob, mimeType: string) => {
    setIsProcessing(true);
    // TODO: Send to API, get response, play audio
    setIsProcessing(false);
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
        style={{
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '8px',
          }}
        >
          ←
        </button>
        <span style={{ marginLeft: '8px', fontSize: '16px', color: '#666' }}>
          {characterName}
        </span>
      </div>

      {/* Portrait area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
      >
        {characterPortrait ? (
          <img
            src={characterPortrait}
            alt={characterName}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
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
