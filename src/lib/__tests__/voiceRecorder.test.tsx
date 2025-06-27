import React from 'react';
// @ts-expect-error: Cannot find module - assuming it's installed
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import VoiceRecorder from '../../components/VoiceRecorder';
import { supabase } from '../../lib/supabase';

// Mock Supabase client
jest.mock('../../lib/supabase', () => ({
  supabase: {
    storage: {
      from: jest.fn().mockReturnThis(),
      upload: jest.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null })
    },
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user' } } })
    }
  }
}));

// Define MediaRecorder mock type
type MediaRecorderMock = {
  new (stream: MediaStream, options?: MediaRecorderOptions): MediaRecorder;
  prototype: MediaRecorder;
  isTypeSupported: (type: string) => boolean;
};

// Mock MediaRecorder and related APIs
const mockMediaRecorder = {
  start: jest.fn(),
  stop: jest.fn(),
  ondataavailable: jest.fn(),
  onerror: jest.fn(),
  state: '',
  stream: { getTracks: jest.fn().mockReturnValue([{ stop: jest.fn() }]) },
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  isTypeSupported: jest.fn()
};

(global as { MediaRecorder: MediaRecorderMock }).MediaRecorder = 
  jest.fn().mockImplementation(() => mockMediaRecorder) as unknown as MediaRecorderMock;

Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: jest.fn().mockResolvedValue('test-stream')
  },
  writable: true
});

describe('VoiceRecorder Component', () => {
  const mockOnComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (supabase.storage.from as jest.Mock).mockReturnValue({
      upload: jest.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null })
    });
  });

  test('renders recording button', () => {
    render(<VoiceRecorder onRecordingComplete={mockOnComplete} />);
    expect(screen.getByText('Start Recording')).toBeInTheDocument();
  });

  test('starts and stops recording', async () => {
    render(<VoiceRecorder onRecordingComplete={mockOnComplete} />);
    
    fireEvent.click(screen.getByText('Start Recording'));
    expect(screen.getByText('Stop Recording')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Stop Recording'));
    await waitFor(() => {
      expect(screen.getByText('Start Recording')).toBeInTheDocument();
    });
  });

  test('handles microphone access error', async () => {
    Object.defineProperty(global.navigator, 'mediaDevices', {
      value: {
        getUserMedia: jest.fn().mockRejectedValue(new Error('Permission denied'))
      },
      writable: true
    });
    
    render(<VoiceRecorder onRecordingComplete={mockOnComplete} />);
    fireEvent.click(screen.getByText('Start Recording'));
    
    await waitFor(() => {
      expect(screen.getByText(/Microphone access denied/i)).toBeInTheDocument();
    });
  });

  test('handles recording upload error', async () => {
    (supabase.storage.from as jest.Mock)().upload.mockResolvedValue({ 
      data: null, 
      error: { message: 'Upload failed' } 
    });
    
    render(<VoiceRecorder onRecordingComplete={mockOnComplete} />);
    fireEvent.click(screen.getByText('Start Recording'));
    fireEvent.click(screen.getByText('Stop Recording'));
    
    await waitFor(() => {
      expect(screen.getByText(/Recording upload failed/i)).toBeInTheDocument();
    });
  });
});