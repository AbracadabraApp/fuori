'use client';

import { useState, useRef } from 'react';
import { giulia } from '@/content/it/characters/giulia';

interface Turn {
  who: 'learner' | 'npc';
  transcript: string;
}

export default function Home() {
  const [conversation, setConversation] = useState<Turn[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<string>('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startConversation = async () => {
    setStatus('Starting conversation...');
    setIsProcessing(true);

    try {
      // Get opening line from character
      const response = await fetch('/api/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          learnerSaid: '',
          character: giulia,
          conversationHistory: [],
          learnerLevel: 'A1',
          showEnglish: true,
        }),
      });

      const data = await response.json();

      setConversation([
        {
          who: 'npc',
          transcript: data.it,
        },
      ]);

      // Speak it (browser TTS)
      const utterance = new SpeechSynthesisUtterance(data.it);
      utterance.lang = 'it-IT';
      window.speechSynthesis.speak(utterance);

      setStatus('Listening...');
    } catch (error) {
      console.error('Error starting conversation:', error);
      setStatus('Error starting conversation');
    } finally {
      setIsProcessing(false);
    }
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

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setStatus('Recording...');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setStatus('Microphone access denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setStatus('Processing...');
    }
  };

  const processAudio = async (audioBlob: Blob, mimeType: string) => {
    setIsProcessing(true);

    try {
      // Transcribe
      const formData = new FormData();
      const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';
      formData.append('audio', audioBlob, `turn.${extension}`);
      formData.append('language', 'it');

      const transcribeResponse = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      const { text } = await transcribeResponse.json();

      // Add learner's turn to conversation
      const newConversation = [
        ...conversation,
        { who: 'learner' as const, transcript: text },
      ];
      setConversation(newConversation);
      setStatus('Getting response...');

      // Get character response
      const turnResponse = await fetch('/api/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          learnerSaid: text,
          character: giulia,
          conversationHistory: newConversation,
          learnerLevel: 'A1',
          showEnglish: true,
        }),
      });

      const data = await turnResponse.json();

      // Add character's response
      const finalConversation = [
        ...newConversation,
        { who: 'npc' as const, transcript: data.it },
      ];
      setConversation(finalConversation);

      // Speak response
      const utterance = new SpeechSynthesisUtterance(data.it);
      utterance.lang = 'it-IT';
      window.speechSynthesis.speak(utterance);

      setStatus('Listening...');
    } catch (error) {
      console.error('Error processing audio:', error);
      setStatus('Error - try again');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{
      padding: '20px',
      maxWidth: '600px',
      margin: '0 auto',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <h1>Fuori - M1 Test</h1>

      {conversation.length === 0 ? (
        <button
          onClick={startConversation}
          disabled={isProcessing}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: isProcessing ? 'not-allowed' : 'pointer',
          }}
        >
          Start conversation with Giulia
        </button>
      ) : (
        <>
          <div style={{
            marginBottom: '20px',
            padding: '16px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            maxHeight: '400px',
            overflowY: 'auto',
          }}>
            {conversation.map((turn, i) => (
              <div
                key={i}
                style={{
                  marginBottom: '12px',
                  padding: '8px 12px',
                  backgroundColor: turn.who === 'learner' ? '#e3f2fd' : '#fff',
                  borderRadius: '6px',
                  borderLeft: turn.who === 'npc' ? '3px solid #007bff' : 'none',
                }}
              >
                <strong>{turn.who === 'learner' ? 'You' : 'Giulia'}:</strong>{' '}
                {turn.transcript}
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <button
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              disabled={isProcessing}
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: isRecording ? '#dc3545' : '#007bff',
                border: 'none',
                color: 'white',
                fontSize: '32px',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                opacity: isProcessing ? 0.6 : 1,
              }}
            >
              🎤
            </button>
            <p style={{ marginTop: '12px', color: '#666' }}>{status}</p>
            <p style={{ fontSize: '14px', color: '#999' }}>
              Hold to record, release to send
            </p>
          </div>
        </>
      )}
    </div>
  );
}
