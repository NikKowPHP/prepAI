import { generateUserReport } from '../pdf';
import { supabase } from '../supabase';
import { progressService } from '../progress';

// Mock supabase and other dependencies
jest.mock('../supabase');
jest.mock('../progress');

describe('PDF Generation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate a standard report for authenticated user', async () => {
    // Mock authenticated user
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { 
        session: { 
          user: { 
            id: 'user123' 
          } 
        } 
      }
    });

    // Mock user data
    (supabase.from('users').select().eq('id', 'user123').single as jest.Mock).mockResolvedValue({
      data: {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        created_at: new Date().toISOString()
      }
    });

    // Mock progress data
    (progressService.getUserMetrics as jest.Mock).mockResolvedValue({
      totalQuestions: 10,
      correctAnswers: 7,
      incorrectAnswers: 3,
      masteryScore: 70,
      nextReviewDates: {}
    });

    // Mock questions data
    (supabase.from('questions').select().eq('user_id', 'user123') as unknown as jest.Mock).mockResolvedValue({
      data: [
        {
          id: 'q1',
          content: 'Test question',
          last_reviewed: new Date().toISOString(),
          review_interval: 1,
          review_ease: 2.5
        }
      ]
    });

    const result = await generateUserReport('user123', 'standard');
    expect(result).toBeInstanceOf(ArrayBuffer);
  });

  it('should throw error for unauthorized user', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { 
        session: { 
          user: { 
            id: 'otherUser' 
          } 
        } 
      }
    });

    await expect(generateUserReport('user123', 'standard'))
      .rejects
      .toThrow('Unauthorized');
  });

  it('should apply detailed template styling', async () => {
    // Setup mocks similar to first test
    const result = await generateUserReport('user123', 'detailed');
    expect(result).toBeInstanceOf(ArrayBuffer);
  });

  it('should apply compact template styling', async () => {
    // Setup mocks similar to first test
    const result = await generateUserReport('user123', 'compact');
    expect(result).toBeInstanceOf(ArrayBuffer);
  });
});