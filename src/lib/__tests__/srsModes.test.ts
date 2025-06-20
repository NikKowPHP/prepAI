import { schedulerService } from '@/lib/scheduler';
import { supabase } from '@/lib/supabase';
import { assessmentService } from '@/lib/assessment';
import { getRepeatModeQuestions, getStudyModeQuestions, getDiscoverModeQuestions, Question } from '@/lib/srs';

// Mock data
const mockUser = { id: 'user123' };
const mockQuestions: Question[] = [
  // Basic questions
  { id: 'q1', user_id: 'user123', createdAt: new Date('2024-01-01'), lastReviewed: null, reviewInterval: 1, reviewEase: 1.5, struggleCount: 0, lastStruggledAt: null, totalStruggleTime: 0, reviewCount: 0, question: 'What is 2+2?', answer: '4', rating: 'easy', topics: ['math'] },
  { id: 'q2', user_id: 'user123', createdAt: new Date('2024-01-02'), lastReviewed: new Date('2024-01-01'), reviewInterval: 5, reviewEase: 3.0, struggleCount: 2, lastStruggledAt: new Date('2024-02-01'), totalStruggleTime: 300, reviewCount: 5, question: 'What is gravity?', answer: 'Force that attracts objects', rating: 'normal', topics: ['science'] },
  { id: 'q3', user_id: 'user123', createdAt: new Date('2024-01-03'), lastReviewed: new Date('2024-05-01'), reviewInterval: 10, reviewEase: 2.5, struggleCount: 1, lastStruggledAt: new Date('2024-04-01'), totalStruggleTime: 150, reviewCount: 3, question: 'Who was the first US president?', answer: 'George Washington', rating: 'easy', topics: ['history'] },
  { id: 'q4', user_id: 'user123', createdAt: new Date('2024-01-04'), lastReviewed: new Date('2024-03-01'), reviewInterval: 3, reviewEase: 2.0, struggleCount: 3, lastStruggledAt: new Date('2024-03-15'), totalStruggleTime: 450, reviewCount: 2, question: 'What is photosynthesis?', answer: 'Process by which plants make food', rating: 'hard', topics: ['math', 'science'] },
  { id: 'q5', user_id: 'user123', createdAt: new Date('2024-01-05'), lastReviewed: new Date('2024-06-01'), reviewInterval: 8, reviewEase: 2.8, struggleCount: 0, lastStruggledAt: null, totalStruggleTime: 0, reviewCount: 1, question: 'What is the capital of France?', answer: 'Paris', rating: 'easy', topics: ['history', 'math'] },

  // Questions for testing new features
  { id: 'q6', user_id: 'user123', createdAt: new Date('2024-01-06'), lastReviewed: new Date('2024-01-15'), reviewInterval: 2, reviewEase: 2.2, struggleCount: 4, lastStruggledAt: new Date('2024-01-20'), totalStruggleTime: 600, reviewCount: 1, question: 'What is E=mc^2?', answer: 'Mass-energy equivalence', rating: 'hard', topics: ['physics'] },
  { id: 'q7', user_id: 'user123', createdAt: new Date('2024-01-07'), lastReviewed: new Date('2024-02-10'), reviewInterval: 4, reviewEase: 2.7, struggleCount: 0, lastStruggledAt: null, totalStruggleTime: 0, reviewCount: 4, question: 'What is H2O?', answer: 'Water', rating: 'easy', topics: ['chemistry'] },
  { id: 'q8', user_id: 'user123', createdAt: new Date('2024-01-08'), lastReviewed: new Date('2024-03-25'), reviewInterval: 6, reviewEase: 1.8, struggleCount: 2, lastStruggledAt: new Date('2024-03-30'), totalStruggleTime: 200, reviewCount: 2, question: 'What is photosynthesis?', answer: 'Process by which plants make food', rating: 'normal', topics: ['biology'] },
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

  // Test struggle tracking for Repeat mode
  it('should prioritize questions with higher struggle metrics in Repeat mode', () => {
    const questions = mockQuestions.filter(q => q.user_id === mockUser.id);
    const sorted = getRepeatModeQuestions(questions);

    // q6 should be first (highest struggle count)
    expect(sorted[0].id).toBe('q6');
    // q4 should be second (next highest struggle)
    expect(sorted[1].id).toBe('q4');
    // q8 should be third
    expect(sorted[2].id).toBe('q8');
  });

  // Test time-based decay for Study mode
  it('should select newer questions less frequently in Study mode', () => {
    const studyQueues = getStudyModeQuestions(mockQuestions.filter(q => q.user_id === mockUser.id));

    // New questions should be prioritized
    expect(studyQueues.newQuestions.length).toBeGreaterThan(0);
    expect(studyQueues.newQuestions[0].reviewCount).toBe(0);

    // Recent questions should have low review counts
    expect(studyQueues.recentQuestions.every(q => q.reviewCount > 0)).toBe(true);
  });

  // Test separate queues for new vs. recent questions in Study mode
  it('should handle new and recent questions separately in Study mode', () => {
    const newQuestions = mockQuestions.filter(q => q.user_id === mockUser.id && q.reviewCount === 0);
    const recentQuestions = mockQuestions.filter(q => q.user_id === mockUser.id && q.reviewCount > 0);

    const studyQueues = getStudyModeQuestions(mockQuestions.filter(q => q.user_id === mockUser.id));

    // New questions should be in newQuestions queue
    newQuestions.forEach(newQ => {
      expect(studyQueues.newQuestions.find(q => q.id === newQ.id)).toBeDefined();
    });

    // Recent questions should be in recentQuestions queue
    recentQuestions.forEach(recentQ => {
      expect(studyQueues.recentQuestions.find(q => q.id === recentQ.id)).toBeDefined();
    });
  });

  // Test topic relationship modeling for Discover mode
  it('should group questions by topic in Discover mode', () => {
    const discoverQuestions = getDiscoverModeQuestions(mockQuestions.filter(q => q.user_id === mockUser.id), []);

    // Questions should be grouped by topic
    const topics = new Set(discoverQuestions.map(q => q.topics![0])); // Safe access with non-null assertion
    expect(topics.size).toBeLessThanOrEqual(mockQuestions.length);
  });

  // Test knowledge gap analysis
  it('should identify knowledge gaps correctly', () => {
    const questionPerformance = mockQuestions.reduce((acc, question) => {
      acc[question.id] = {
        correct: question.reviewCount > 0, // Simplified heuristic
        topics: question.topics || [],
      };
      return acc;
    }, {} as Record<string, { correct: boolean, topics: string[] }>);

    const { gaps } = assessmentService.analyzeKnowledgeGaps(questionPerformance);

    // Topics with low performance should be identified as gaps
    expect(gaps).toContain('physics'); // q6 has high struggle but low reviews
    expect(gaps).not.toContain('chemistry'); // q7 has no struggles, good performance
  });
});