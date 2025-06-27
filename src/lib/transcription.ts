import { SpeechClient } from '@google-cloud/speech';
import { supabase } from './supabase';

interface SpeechRecognitionResult {
  alternatives?: Array<{
    transcript?: string;
    confidence?: number;
  }>;
}

export interface TranscriptionService {
  processTranscription: (filePath: string) => Promise<string>;
}

export const createTranscriptionService = (): TranscriptionService => {
  const speechClient = new SpeechClient({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
  });

  /**
   * Configuration for speech recognition
   */
  const recognitionConfig = {
    encoding: 'WEBM_OPUS' as const,
    sampleRateHertz: 48000,
    languageCode: 'en-US',
    enableAutomaticPunctuation: true,
    model: 'default',
    alternativeLanguageCodes: ['en-US', 'en-GB', 'en-AU'],
  };

  const processTranscription = async (filePath: string): Promise<string> => {
    try {
      if (!filePath || !filePath.includes('/')) {
        throw new Error('Invalid file path format');
      }

      const { data, error } = await supabase.storage
        .from('audio-recordings')
        .download(filePath);

      if (error || !data) {
        throw new Error(`Failed to fetch audio file: ${error?.message || 'No data returned'}`);
      }

      const fileSize = data.size;
      if (fileSize > 10 * 1024 * 1024) {
        throw new Error('Audio file too large (max 10MB)');
      }

      const audioBytes = await data.arrayBuffer();
      const audioContent = Buffer.from(audioBytes);

      const [response] = await speechClient.recognize({
        audio: { content: audioContent.toString('base64') },
        config: recognitionConfig,
      });

      const transcription = response.results
        ?.map((result: SpeechRecognitionResult) => result.alternatives?.[0]?.transcript)
        .filter(Boolean)
        .join('\n');

      if (!transcription) {
        throw new Error('No transcription results found - possibly inaudible audio');
      }

      return transcription;
    } catch (error) {
      console.error('Transcription error:', error);
      throw new Error(`Transcription failed: ${(error as Error).message}`);
    }
  };

  return {
    processTranscription,
  };
};

export const transcriptionService = createTranscriptionService();