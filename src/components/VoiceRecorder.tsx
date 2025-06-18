import React, { useState, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

const VoiceRecorder: React.FC<{ onRecordingComplete: (filePath: string, transcription: string) => void }> = ({ onRecordingComplete }) => {
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState('');
  const [transcription, setTranscription] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    if (!user) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const filePath = `${user.id}/${Date.now()}.wav`;

        const { data, error: uploadError } = await supabase.storage
          .from('recordings')
          .upload(filePath, audioBlob);

        if (uploadError) {
          setError('Failed to upload recording');
          console.error('Upload error:', uploadError);
        } else {
          setError('');
          await transcribeAudio(data.path);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      setError('Error accessing microphone');
      console.error('Recording error:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsTranscribing(true);
    }
  };

  const transcribeAudio = async (filePath: string) => {
    try {
      // Simulate API call to Google Cloud Speech-to-Text
      // In a real implementation, you would send the audio file to the API
      // and get the transcription text in response

      // For demonstration, we'll use a placeholder transcription
      const simulatedTranscription = `This is a simulated transcription of the audio recording. The actual implementation would use a speech-to-text API like Google Cloud Speech-to-Text.`;

      setTranscription(simulatedTranscription);
      onRecordingComplete(filePath, simulatedTranscription);
    } catch (err) {
      setError('Failed to transcribe audio');
      console.error('Transcription error:', err);
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className="mt-6">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`w-full py-2 px-4 rounded-md text-white ${
          isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
        disabled={isTranscribing}
      >
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      {transcription && (
        <div className="mt-4 p-4 border rounded bg-gray-100">
          <h3 className="font-semibold mb-2">Transcription:</h3>
          <p>{transcription}</p>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;