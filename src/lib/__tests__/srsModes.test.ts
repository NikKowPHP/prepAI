import { PrismaClient } from '@prisma/client';
import { getRepeatModeQuestions, getStudyModeQuestions, getDiscoverModeQuestions } from '@/lib/srs';
import { schedulerService } from '@/lib/scheduler';
import { assessmentService } from '@/lib/assessment';
import type { Question } from '@prisma/client';
import type { SRSQuestion } from '@/lib/types/question';

// Test database instance
const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL,
    },
  },
});

// Test data
const testUserId = 'test-user-123';
let testQuestions: Question[] = [];

beforeAll(async () => {
  await testPrisma.question.deleteMany();

  testQuestions = await testPrisma.question.createManyAndReturn({
    data: [
      // Basic questions
      { id: 'q1', user_id: testUserId, question: 'What is 2+2?', content: 'What is 2+2?', answer: '4', rating: 'normal', createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01'), lastReviewed: null, reviewInterval: 1, reviewEase: 1.5, struggleCount: 0, lastStruggledAt: null, totalStruggleTime: 0, reviewCount: 0, category: 'math', difficulty: 'easy', topics: ['math'] },
      { id: 'q2', user_id: testUserId, question: 'What is gravity?', content: 'What is gravity?', answer: 'Force that attracts objects', rating: 'normal', createdAt: new Date('2024-01-02'), updatedAt: new Date('2024-01-02'), lastReviewed: new Date('2024-01-01'), reviewInterval: 5, reviewEase: 3.0, struggleCount: 2, lastStruggledAt: new Date('2024-02-01'), totalStruggleTime: 300, reviewCount: 5, category: 'science', difficulty: 'normal', topics: ['science'] },
      { id: 'q3', user_id: testUserId, question: 'Who was the first US president?', content: 'Who was the first US president?', answer: 'George Washington', rating: 'normal', createdAt: new Date('2024-01-03'), updatedAt: new Date('2024-01-03'), lastReviewed: new Date('2024-05-01'), reviewInterval: 10, reviewEase: 2.5, struggleCount: 1, lastStruggledAt: new Date('2024-04-01'), totalStruggleTime: 150, reviewCount: 3, category: 'history', difficulty: 'easy', topics: ['history'] },
      { id: 'q4', user_id: testUserId, question: 'What is photosynthesis?', content: 'What is photosynthesis?', answer: 'Process by which plants make food', rating: 'normal', createdAt: new Date('2024-01-04'), updatedAt: new Date('2024-01-04'), lastReviewed: new Date('2024-03-01'), reviewInterval: 3, reviewEase: 2.0, struggleCount: 3, lastStruggledAt: new Date('2024-03-15'), totalStruggleTime: 450, reviewCount: 2, category: 'science', difficulty: 'hard', topics: ['math', 'science'] },
      { id: 'q5', user_id: testUserId, question: 'What is the capital of France?', content: 'What is the capital of France?', answer: 'Paris', rating: 'normal', createdAt: new Date('2024-01-05'), updatedAt: new Date('2024-01-05'), lastReviewed: new Date('2024-06-01'), reviewInterval: 8, reviewEase: 2.8, struggleCount: 0, lastStruggledAt: null, totalStruggleTime: 0, reviewCount: 1, category: 'geography', difficulty: 'easy', topics: ['history', 'math'] },

      // Questions for testing edge cases
      { id: 'q6', user_id: testUserId, question: 'What is E=mc^2?', content: 'What is E=mc^2?', answer: 'Mass-energy equivalence', rating: 'normal', createdAt: new Date('2024-01-06'), updatedAt: new Date('2024-01-06'), lastReviewed: new Date('2024-01-15'), reviewInterval: 2, reviewEase: 2.2, struggleCount: 4, lastStruggledAt: new Date('2024-01-20'), totalStruggleTime: 600, reviewCount: 1, category: 'physics', difficulty: 'hard', topics: ['physics'] },
      { id: 'q7', user_id: testUserId, question: 'What is H2O?', content: 'What is H2O?', answer: 'Water', rating: 'normal', createdAt: new Date('2024-01-07'), updatedAt: new Date('2024-01-07'), lastReviewed: new Date('2024-02-10'), reviewInterval: 4, reviewEase: 2.7, struggleCount: 0, lastStruggledAt: null, totalStruggleTime: 0, reviewCount: 4, category: 'chemistry', difficulty: 'easy', topics: ['chemistry'] },
      { id: 'q8', user_id: testUserId, question: 'What is photosynthesis?', content: 'What is photosynthesis?', answer: 'Process by which plants make food', rating: 'normal', createdAt: new Date('2024-01-08'), updatedAt: new Date('2024-01-08'), lastReviewed: new Date('2024-03-25'), reviewInterval: 6, reviewEase: 1.8, struggleCount: 2, lastStruggledAt: new Date('2024-03-30'), totalStruggleTime: 200, reviewCount: 2, category: 'biology', difficulty: 'normal', topics: ['biology'] },
    ]
  });
});

afterAll(async () => {
  await testPrisma.$disconnect();
});

describe('SRS Modes Tests', () => {
  beforeEach(async () => {
    // Reset question states before each test
    await testPrisma.question.updateMany({
      where: { userId: testUserId },
      data: testQuestions.reduce((acc, q) => ({
        ...acc,
        [q.id]: {
          reviewEase: q.reviewEase,
          struggleCount: q.struggleCount,
          lastStruggledAt: q.lastStruggledAt,
          reviewCount: q.reviewCount
        }
      }), {})
    });
  });

  it('should filter questions for Repeat mode with strict criteria', async () => {
    const mode = 'repeat';
    const questions = await schedulerService.getQuestionsByMode(mode, testUserId, []);

    // Should include:
    // q1 - ease 1.5 < 2.0
    // q4 - struggleCount 3 >= 3
    // q6 - struggleCount 4 >= 3
    // q8 - ease 1.8 < 2.0
    expect(questions).toHaveLength(4);
    expect(questions.map(q => q.id)).toContain('q1');
    expect(questions.map(q => q.id)).toContain('q4');
    expect(questions.map(q => q.id)).toContain('q6');
    expect(questions.map(q => q.id)).toContain('q8');
  });

  it('should filter questions for Study mode', async () => {
    const mode = 'study';
    const questions = await schedulerService.getQuestionsByMode(mode, testUserId, []);

    expect(questions).toHaveLength(3);
    expect(questions.map(q => q.id)).toContain('q1');
    expect(questions.map(q => q.id)).toContain('q2');
    expect(questions.map(q => q.id)).toContain('q4');
  });

  it('should filter questions for Discover mode', async () => {
    const mode = 'discover';
    const questions = await schedulerService.getQuestionsByMode(mode, testUserId, ['q1', 'q2']);

    expect(questions).toHaveLength(3);
    expect(questions.map(q => q.id)).toContain('q3');
    expect(questions.map(q => q.id)).toContain('q4');
    expect(questions.map(q => q.id)).toContain('q5');
  });

  it('should handle empty question list for Repeat mode', async () => {
    await testPrisma.question.deleteMany();
    
    const mode = 'repeat';
    const questions = await schedulerService.getQuestionsByMode(mode, testUserId, []);

    expect(questions).toHaveLength(0);
  });

  it('should handle empty question list for Study mode', async () => {
    await testPrisma.question.deleteMany();
    
    const mode = 'study';
    const questions = await schedulerService.getQuestionsByMode(mode, testUserId, []);

    expect(questions).toHaveLength(0);
  });

  it('should handle empty question list for Discover mode', async () => {
    await testPrisma.question.deleteMany();
    
    const mode = 'discover';
    const questions = await schedulerService.getQuestionsByMode(mode, testUserId, []);

    expect(questions).toHaveLength(0);
  });

  it('should handle API error for Repeat mode', async () => {
    await testPrisma.$disconnect();
    
    const mode = 'repeat';
    const questions = await schedulerService.getQuestionsByMode(mode, testUserId, []);

    expect(questions).toHaveLength(0);
  });

  it('should handle API error for Study mode', async () => {
    await testPrisma.$disconnect();
    
    const mode = 'study';
    const questions = await schedulerService.getQuestionsByMode(mode, testUserId, []);

    expect(questions).toHaveLength(0);
  });

  it('should handle API error for Discover mode', async () => {
    await testPrisma.$disconnect();
    
    const mode = 'discover';
    const questions = await schedulerService.getQuestionsByMode(mode, testUserId, []);

    expect(questions).toHaveLength(0);
  });

  it('should handle invalid mode', async () => {
    await expect(schedulerService.getQuestionsByMode('invalid' as 'repeat' | 'study' | 'discover', testUserId, []))
      .rejects
      .toThrow('Invalid mode');
  });

  // Test struggle tracking for Repeat mode
  it('should prioritize questions with higher struggle metrics in Repeat mode', () => {
    const questions = testQuestions.filter((q: Question) => q.user_id === testUserId);
    const sorted = getRepeatModeQuestions(questions);

    // Verify sorting by struggle metrics
    expect(sorted[0].id).toBe('q6'); // Highest struggleCount (4)
    expect(sorted[1].id).toBe('q4'); // Next highest (3)
    // q8 and q2 should not be included since they don't meet the >=3 threshold
    expect(sorted).toHaveLength(2);
    
    // Verify questions with low ease factor are included
    expect(sorted.some(q => q.reviewEase <= 2.0)).toBe(true);
  });

  // Test full Repeat mode filtering criteria
  it('should include questions with ease < 2.0 OR overdue OR struggleCount >=3', () => {
    const questions = testQuestions.filter((q: Question) => q.user_id === testUserId);
    const filtered = getRepeatModeQuestions(questions);
    
    filtered.forEach(q => {
      const isOverdue = q.lastReviewed &&
        ((Date.now() - q.lastReviewed.getTime()) / 86400000) > q.reviewInterval;
      const meetsCriteria = q.reviewEase < 2.0 || isOverdue || q.struggleCount >= 3;
      expect(meetsCriteria).toBe(true);
    });
  });

  it('should exclude questions with only recent struggles', () => {
    const testQuestion = {
      ...testQuestions[0],
      id: 'test1',
      reviewEase: 2.5,
      struggleCount: 2, // Below threshold
      lastStruggledAt: new Date(), // Recent struggle
    };
    const questions = [...testQuestions, testQuestion];
    const filtered = getRepeatModeQuestions(questions);
    
    expect(filtered.some(q => q.id === 'test1')).toBe(false);
  });

  // Test time-based decay for Study mode
  it('should select newer questions less frequently in Study mode', () => {
    const questions = testQuestions.map(q => ({...q, user_id: q.userId} as SRSQuestion));
    const studyQueues = getStudyModeQuestions(questions.filter(q => q.user_id === testUserId));

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

    const studyQueues = getStudyModeQuestions(testQuestions.filter((q: Question) => q.user_id === testUserId));

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
    const discoverQuestions = getDiscoverModeQuestions(testQuestions.filter((q: Question) => q.user_id === testUserId), []);

    // Questions should be grouped by topic
    const topics = new Set(discoverQuestions.map(q => q.topics![0])); // Safe access with non-null assertion
    expect(topics.size).toBeLessThanOrEqual(testQuestions.length);
  });

  // Test knowledge gap analysis
  it('should identify knowledge gaps correctly', async () => {
    const questionPerformance = testQuestions.reduce((acc: Record<string, { correct: boolean, topics: string[] }>, question: Question) => {
      acc[question.id] = {
        correct: question.reviewCount > 0, // Simplified heuristic
        topics: question.topics || [],
      };
      return acc;
    }, {} as Record<string, { correct: boolean, topics: string[] }>);

    const gaps = await assessmentService.analyzeKnowledgeGaps(
      Object.entries(questionPerformance).map(([id, {correct, topics}]) => ({
        questionId: id,
        correct,
        topics,
        topic: topics[0],
        subtopics: topics.slice(1),
        correctness: correct ? 1 : 0,
        responseTime: 0,
        attempts: 1
      })),
      [testUserId]
    );

    // Topics with low performance should be identified as gaps
    expect(gaps).toContain('physics'); // q6 has high struggle but low reviews
    expect(gaps).not.toContain('chemistry'); // q7 has no struggles, good performance
  });

  // Edge case tests
  it('should handle default reviewEase in Repeat mode', () => {
    const edgeQuestions = [...testQuestions.map(q => ({...q, user_id: q.userId} as SRSQuestion)), {
      ...testQuestions[0],
      id: 'edge1',
      reviewEase: 2.5, // Set default value
    }];

    const questions = getRepeatModeQuestions(edgeQuestions);
    expect(questions.some(q => q.id === 'edge1')).toBe(true);
  });

  it('should handle negative struggleCount in Repeat mode', () => {
    const edgeQuestions = [...testQuestions, {
      ...testQuestions[0],
      id: 'edge2',
      struggleCount: -5,
    }];

    const questions = getRepeatModeQuestions(edgeQuestions);
    expect(questions.some(q => q.id === 'edge2')).toBe(false);
  });

  it('should handle very old struggle dates in Repeat mode', () => {
    const edgeQuestions = [...testQuestions, {
      ...testQuestions[0],
      id: 'edge3',
      lastStruggledAt: new Date('2000-01-01'),
    }];

    const questions = getRepeatModeQuestions(edgeQuestions);
    expect(questions.some(q => q.id === 'edge3')).toBe(false);
  });

  it('should handle NaN reviewCount in Study mode', () => {
    const edgeQuestions = [...testQuestions, {
      ...testQuestions[0],
      id: 'edge4',
      reviewCount: NaN,
    }];

    const { newQuestions, recentQuestions } = getStudyModeQuestions(edgeQuestions);
    expect([...newQuestions, ...recentQuestions].some(q => q.id === 'edge4')).toBe(false);
  });

  it('should handle null lastReviewed in Study mode', () => {
    const edgeQuestions = [...testQuestions, {
      ...testQuestions[0],
      id: 'edge5',
      lastReviewed: null,
    }];

    const { newQuestions } = getStudyModeQuestions(edgeQuestions);
    expect(newQuestions.some(q => q.id === 'edge5')).toBe(true);
  });

  it('should handle AI-generated questions without topics in Discover mode', () => {
    const edgeQuestions = [...testQuestions, {
      ...testQuestions[0],
      id: 'edge6',
      isAIGenerated: true,
      topics: undefined,
    }];

    const questions = getDiscoverModeQuestions(edgeQuestions, []);
    expect(questions.some(q => q.id === 'edge6')).toBe(true);
  });

  it('should handle empty topics array in Discover mode', () => {
    const edgeQuestions = [...testQuestions, {
      ...testQuestions[0],
      id: 'edge7',
      topics: [],
    }];

    const questions = getDiscoverModeQuestions(edgeQuestions, []);
    expect(questions.some(q => q.id === 'edge7')).toBe(false);
  });

  it('should handle invalid topic data types in Discover mode', () => {
    const edgeQuestions = [...testQuestions, {
      ...testQuestions[0],
      id: 'edge8',
      topics: [123, true], // Invalid types
    } as unknown as Question]; // Force invalid type

    const questions = getDiscoverModeQuestions(edgeQuestions, []);
    expect(questions.some(q => q.id === 'edge8')).toBe(false);
  });
});