import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function VoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle'|'uploading'|'success'|'error'>('idle');
  const [uploadError, setUploadError] = useState<string|null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [fileName, setFileName] = useState<string>('');

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      if (!analyserRef.current || !isRecording) {
        animationRef.current = null;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserRef.current.getByteTimeDomainData(dataArray);

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
      animationRef.current = requestAnimationFrame(draw);
    };

    animationRef.current = requestAnimationFrame(draw);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRecording]);

  useEffect(() => {
    setIsLoading(true);
    
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        audioContextRef.current = new AudioContext();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 2048;
        
        const source = audioContextRef.current.createMediaStreamSource(stream);
        source.connect(analyserRef.current);

        mediaRecorder.current = new MediaRecorder(stream);
        
        mediaRecorder.current.ondataavailable = (e) => {
          audioChunks.current.push(e.data);
        };

        mediaRecorder.current.onstop = async () => {
          const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
          audioChunks.current = [];
          
          try {
            setUploadStatus('uploading');
            const fileName = `recording_${Date.now()}.wav`;
            setFileName(fileName);
            
            const { error } = await supabase.storage
              .from('recordings')
              .upload(fileName, audioBlob);

            if (error) throw error;
            
            setUploadStatus('success');
          } catch (err) {
            console.error('Upload failed:', err);
            setUploadStatus('error');
            if (err instanceof Error) {
              setUploadError(err.message);
            } else {
              setUploadError('An unknown error occurred');
            }
          } finally {
            if (timerRef.current) {
              clearInterval(timerRef.current);
              setRecordingTime(0);
            }
          }
        };
        
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error accessing microphone:', err);
        setError('Microphone access denied. Please enable microphone permissions.');
        setIsLoading(false);
      });

    return () => {
      mediaRecorder.current?.stream.getTracks().forEach(track => track.stop());
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const toggleRecording = () => {
    if (!mediaRecorder.current) return;
    
    if (!isRecording) {
      audioChunks.current = [];
      mediaRecorder.current.start();
      setIsRecording(true);
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      mediaRecorder.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const handlePlayPause = async () => {
    if (!audioRef.current || !fileName) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        const { data } = await supabase.storage
          .from('recordings')
          .getPublicUrl(fileName);
        
        if (!data?.publicUrl) throw new Error('Could not get audio URL');
        
        audioRef.current.src = data.publicUrl;
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (err) {
        console.error('Playback failed:', err);
        setUploadStatus('error');
        if (err instanceof Error) {
          setUploadError('Playback failed: ' + err.message);
        } else {
          setUploadError('Playback failed due to an unknown error');
        }
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  if (error) {
    return (
      <div className="p-4 border rounded-lg bg-red-50 text-red-600">
        {error}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50 text-gray-600">
        Initializing microphone...
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg space-y-4">
      <button
        onClick={toggleRecording}
        disabled={isLoading}
        className={`px-4 py-2 rounded-lg font-medium transition-all ${
          isRecording
            ? 'bg-red-500 hover:bg-red-600'
            : 'bg-blue-500 hover:bg-blue-600'
        } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
      
      {isRecording && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
          <span>Recording ({formatTime(recordingTime)})</span>
        </div>
      )}

      <canvas
        ref={canvasRef}
        className="w-full h-20 mt-4 border rounded-lg"
        width={640}
        height={80}
      />

      {uploadStatus === 'uploading' && (
        <div className="text-sm text-blue-600 mt-2">Uploading recording...</div>
      )}
      {uploadStatus === 'success' && (
        <div className="text-sm text-green-600 mt-2">Recording uploaded successfully!</div>
      )}
      {uploadStatus === 'error' && uploadError && (
        <div className="text-sm text-red-600 mt-2">Upload failed: {uploadError}</div>
      )}

      <audio
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />

      {uploadStatus === 'success' && (
        <button
          onClick={handlePlayPause}
          disabled={!fileName}
          className={`px-4 py-2 rounded-lg font-medium ${
            isPlaying
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-green-500 hover:bg-green-600'
          } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isPlaying ? 'Pause' : 'Play Recording'}
        </button>
      )}
    </div>
  );
}