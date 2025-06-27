import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

interface VoiceRecorderProps {
  expectedAnswer?: string;
  onRecordingComplete: (result: {
    filePath: string;
    transcription: string;
    score: number;
    feedback: string[];
  }) => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  expectedAnswer,
  onRecordingComplete
}) => {
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState('');
  const [transcription, setTranscription] = useState('');
  const [highlightedText, setHighlightedText] = useState('');
  const [volume, setVolume] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [currentRecordingPath, setCurrentRecordingPath] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const setupAudioContext = (stream: MediaStream) => {
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    
    analyser.fftSize = 2048;
    source.connect(analyser);
    
    audioContextRef.current = audioContext;
    analyserRef.current = analyser;
  };

  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    analyser.getByteTimeDomainData(dataArray);
    
    if (ctx) {
      ctx.fillStyle = 'rgb(249, 250, 251)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgb(59, 130, 246)';
      ctx.beginPath();
      
      const sliceWidth = canvas.width * 1.0 / bufferLength;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * canvas.height / 2;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        
        x += sliceWidth;
      }
      
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
      
      // Calculate volume
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += (dataArray[i] - 128) * (dataArray[i] - 128);
      }
      const rms = Math.sqrt(sum / bufferLength);
      setVolume(rms);
    }
    
    animationRef.current = requestAnimationFrame(drawWaveform);
  };

  const startTimer = () => {
    const startTime = Date.now();
    timerRef.current = window.setInterval(() => {
      setRecordingTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
  };

  const startRecording = async () => {
    if (!user) return;
    setRecordingTime(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setupAudioContext(stream);
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      drawWaveform();

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
          setCurrentRecordingPath(data.path);
          await transcribeAndAssess(data.path);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      startTimer();
    } catch (err) {
      setError('Error accessing microphone');
      console.error('Recording error:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      setIsRecording(false);
      setIsTranscribing(true);
      setRecordingTime(0);
    }
  };

  const transcribeAndAssess = async (filePath: string) => {
    try {
      const response = await fetch('/api/voice-processing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filePath,
          expectedAnswer
        }),
      });

      if (!response.ok) {
        throw new Error('Assessment failed');
      }

      const { transcription, score, feedback } = await response.json();
      setTranscription(transcription);
      setHighlightedText('');
      onRecordingComplete({ filePath, transcription, score, feedback });
    } catch (err) {
      setError('Failed to assess answer');
      console.error('Assessment error:', err);
    } finally {
      setIsTranscribing(false);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const syncHighlighting = (event: React.SyntheticEvent<HTMLAudioElement>) => {
    const audio = event.target as HTMLAudioElement;
    const currentTime = audio.currentTime;
    const words = transcription.split(' ');
    const wordIndex = Math.floor((currentTime / audio.duration) * words.length);
    const highlighted = words.slice(0, wordIndex).join(' ') + ' <span class="highlight">|</span> ' + words.slice(wordIndex).join(' ');
    setHighlightedText(highlighted);
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width="400"
          height="100"
          className="w-full h-20 bg-gray-50 rounded-lg mb-2"
        />
        <div className="flex items-center gap-4 absolute bottom-2 left-2">
          {isRecording && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-red-600">
                {String(Math.floor(recordingTime / 60)).padStart(2, '0')}:
                {String(recordingTime % 60).padStart(2, '0')}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-100"
                style={{ width: `${Math.min(volume * 10, 100)}%` }}
              />
            </div>
            <span className="text-xs text-gray-600">
              {Math.round(volume * 10)}%
            </span>
          </div>
        </div>
      </div>
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
          <div className="transcription-text" dangerouslySetInnerHTML={{ __html: highlightedText || transcription }} />
          <audio
            ref={audioRef}
            src={currentRecordingPath ? `/api/get-recording?path=${currentRecordingPath}` : ''}
            onTimeUpdate={syncHighlighting}
            controls
            className="mt-2"
          />
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;