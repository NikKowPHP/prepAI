import { schedulerService } from '@/lib/scheduler';
import { supabase } from '@/lib/supabase';

// Mock data
const mockUser = { id: 'user123' };
const mockQuestions = [
  { id: 'q1', userId: 'user123', reviewEase: 1.5, lastReviewed: null, reviewInterval: 1 },
  { id: 'q2', userId: 'user123', reviewEase: 3.0, lastReviewed: new Date('2024-01-01'), reviewInterval: 5 },
  { id: 'q3', userId: 'user123', reviewEase: 2.5, lastReviewed: new Date('2024-05-01'), reviewInterval: 10 },
  { id: 'q4', userId: 'user123', reviewEase: 2.0, lastReviewed: new Date('2024-03-01'), reviewInterval: 3 },
  { id: 'q5', userId: 'user123', reviewEase: 2.8, lastReviewed: new Date('2024-06-01'), reviewInterval: 8 },
];

// Mock functions
jest.mock('@/lib/supabase');
jest.mock('@/lib/scheduler');

describe('SRS Modes Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: mockUser }, error: null });
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue({ data: mockQuestions, error: null }),
    });
  });

  it('should filter questions for Repeat mode', async () => {
    const mode = 'repeat';
    const questions = await schedulerService.getQuestionsByMode(mode, mockUser.id, []);

    expect(questions).toHaveLength(2);
    expect(questions.map(q => q.id)).toContain('q1');
    expect(questions.map(q => q.id)).toContain('q4');
  });

  it('should filter questions for Study mode', async () => {
    const mode = 'study';
    const questions = await schedulerService.getQuestionsByMode(mode, mockUser.id, []);

    expect(questions).toHaveLength(3);
    expect(questions.map(q => q.id)).toContain('q1');
    expect(questions.map(q => q.id)).toContain('q2');
    expect(questions.map(q => q.id)).toContain('q4');
  });

  it('should filter questions for Discover mode', async () => {
    const mode = 'discover';
    const questions = await schedulerService.getQuestionsByMode(mode, mockUser.id, ['q1', 'q2']);

    expect(questions).toHaveLength(3);
    expect(questions.map(q => q.id)).toContain('q3');
    expect(questions.map(q => q.id)).toContain('q4');
    expect(questions.map(q => q.id)).toContain('q5');
  });

  it('should handle empty question list for Repeat mode', async () => {
    (supabase.from as jest.Mock).mockReturnValueOnce({
      select: jest.fn().mockResolvedValue({ data: [], error: null }),
    });

    const mode = 'repeat';
    const questions = await schedulerService.getQuestionsByMode(mode, mockUser.id, []);

    expect(questions).toHaveLength(0);
  });

  it('should handle empty question list for Study mode', async () => {
    (supabase.from as jest.Mock).mockReturnValueOnce({
      select: jest.fn().mockResolvedValue({ data: [], error: null }),
    });

    const mode = 'study';
    const questions = await schedulerService.getQuestionsByMode(mode, mockUser.id, []);

    expect(questions).toHaveLength(0);
  });

  it('should handle empty question list for Discover mode', async () => {
    (supabase.from as jest.Mock).mockReturnValueOnce({
      select: jest.fn().mockResolvedValue({ data: [], error: null }),
    });

    const mode = 'discover';
    const questions = await schedulerService.getQuestionsByMode(mode, mockUser.id, []);

    expect(questions).toHaveLength(0);
  });

  it('should handle API error for Repeat mode', async () => {
    (supabase.from as jest.Mock).mockReturnValueOnce({
      select: jest.fn().mockResolvedValue({ data: null, error: 'API error' }),
    });

    const mode = 'repeat';
    const questions = await schedulerService.getQuestionsByMode(mode, mockUser.id, []);

    expect(questions).toHaveLength(0);
  });

  it('should handle API error for Study mode', async () => {
    (supabase.from as jest.Mock).mockReturnValueOnce({
      select: jest.fn().mockResolvedValue({ data: null, error: 'API error' }),
    });

    const mode = 'study';
    const questions = await schedulerService.getQuestionsByMode(mode, mockUser.id, []);

    expect(questions).toHaveLength(0);
  });

  it('should handle API error for Discover mode', async () => {
    (supabase.from as jest.Mock).mockReturnValueOnce({
      select: jest.fn().mockResolvedValue({ data: null, error: 'API error' }),
    });

    const mode = 'discover';
    const questions = await schedulerService.getQuestionsByMode(mode, mockUser.id, []);

    expect(questions).toHaveLength(0);
  });

  it('should handle invalid mode', async () => {
    await expect(schedulerService.getQuestionsByMode('invalid' as 'repeat' | 'study' | 'discover', mockUser.id, []))
      .rejects
      .toThrow('Invalid mode');
  });
});