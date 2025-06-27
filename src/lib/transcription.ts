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

  const processTranscription = async (filePath: string): Promise<string> => {
    try {
      const { data, error } = await supabase.storage
        .from('audio-recordings')
        .download(filePath);

      if (error || !data) {
        throw new Error('Failed to fetch audio file: ' + error?.message);
      }

      const audioBytes = await data.arrayBuffer();
      const audioContent = Buffer.from(audioBytes);

      const request = {
        audio: {
          content: audioContent.toString('base64'),
        },
        config: {
          encoding: 'WEBM_OPUS',
          sampleRateHertz: 48000,
          languageCode: 'en-US',
          enableAutomaticPunctuation: true,
          model: 'default',
        },
      };

      const [response] = await speechClient.recognize(request);
      const transcription = response.results
        ?.map((result: SpeechRecognitionResult) => result.alternatives?.[0]?.transcript)
        .filter(Boolean)
        .join('\n');

      if (!transcription) {
        throw new Error('No transcription results found');
      }

      return transcription;
    } catch (error) {
      console.error('Error processing transcription:', error);
      throw new Error('Failed to process transcription: ' + (error as Error).message);
    }
  };

  return {
    processTranscription,
  };
};

export const transcriptionService = createTranscriptionService();