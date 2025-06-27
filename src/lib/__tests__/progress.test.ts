import { progressService } from '../progress';
import { supabase } from '../supabase';

// Mock the supabase client
jest.mock('../supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({
      data: {
        total_questions: 10,
        correct_answers: 7,
        incorrect_answers: 3,
        last_reviewed_at: new Date()
      },
      error: null
    }),
    update: jest.fn().mockResolvedValue({ error: null })
  }
}));

// Mock the scheduler service
jest.mock('../scheduler', () => ({
  schedulerService: {
    markQuestionAsReviewed: jest.fn().mockResolvedValue(true),
    getNextReviewDates: jest.fn().mockResolvedValue({
      'q1': new Date(),
      'q2': new Date()
    })
  }
}));

describe('ProgressService', () => {
  const userId = 'test-user';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getUserProgress returns progress metrics', async () => {
    const progress = await progressService.getUserProgress(userId);
    
    expect(progress).toEqual({
      totalQuestions: 10,
      correctAnswers: 7,
      incorrectAnswers: 3,
      masteryScore: 70
    });
    expect(supabase.from).toHaveBeenCalledWith('progress_metrics');
  });

  test('updateProgressAfterReview updates metrics', async () => {
    await progressService.updateProgressAfterReview(userId, 'q1', true);
    
    expect(supabase.from).toHaveBeenCalledWith('progress_metrics');
    expect(supabase.update).toHaveBeenCalled();
  });

  test('getUserMetrics includes next review dates', async () => {
    const metrics = await progressService.getUserMetrics(userId);
    
    expect(metrics).toHaveProperty('nextReviewDates');
    expect(Object.keys(metrics.nextReviewDates).length).toBeGreaterThan(0);
  });

  test('aggregateAnalyticsData returns formatted analytics', async () => {
    // Mock additional supabase calls for analytics
    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'question_reviews') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({
            data: [{
              question_id: 'q1',
              remembered: true,
              reviewed_at: new Date()
            }]
          })
        };
      }
      if (table === 'user_topics') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({
            data: [{
              topic_id: 't1',
              mastery_level: 75
            }]
          })
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            total_questions: 10,
            correct_answers: 7,
            incorrect_answers: 3
          }
        })
      };
    });

    const analytics = await progressService.aggregateAnalyticsData(userId);
    
    expect(analytics).toHaveProperty('overallProgress');
    expect(analytics).toHaveProperty('recentReviews');
    expect(analytics).toHaveProperty('topicMastery');
    expect(analytics.overallProgress.masteryScore).toBe(70);
  });
});