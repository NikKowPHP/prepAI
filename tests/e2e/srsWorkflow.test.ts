import { getQuestionsByMode, calculateNextReview, Question } from '../../src/lib/srs';

describe('SRS Workflow End-to-End Tests', () => {
  const now = new Date();
  const testQuestions: Question[] = [
    // New question (never reviewed)
    {
      id: '1',
      question: 'New question',
      answer: 'Answer',
      rating: 'normal',
      user_id: 'test-user',
      createdAt: new Date(),
      lastReviewed: null,
      reviewInterval: 1,
      reviewEase: 2.5,
      struggleCount: 0,
      lastStruggledAt: null,
      totalStruggleTime: 0,
      reviewCount: 0
    },
    // Recently reviewed question
    {
      id: '2',
      question: 'Recent question',
      answer: 'Answer',
      rating: 'normal',
      user_id: 'test-user',
      createdAt: new Date(now.getTime() - 86400000 * 2),
      lastReviewed: new Date(now.getTime() - 86400000 * 1),
      reviewInterval: 3,
      reviewEase: 2.5,
      struggleCount: 0,
      lastStruggledAt: null,
      totalStruggleTime: 0,
      reviewCount: 1
    },
    // Struggled question
    {
      id: '3',
      question: 'Struggled question',
      answer: 'Answer',
      rating: 'hard',
      user_id: 'test-user',
      createdAt: new Date(now.getTime() - 86400000 * 5),
      lastReviewed: new Date(now.getTime() - 86400000 * 4),
      reviewInterval: 1,
      reviewEase: 1.5,
      struggleCount: 3,
      lastStruggledAt: new Date(now.getTime() - 86400000 * 1),
      totalStruggleTime: 300,
      reviewCount: 4
    },
    // Overdue question
    {
      id: '4',
      question: 'Overdue question',
      answer: 'Answer',
      rating: 'normal',
      user_id: 'test-user',
      createdAt: new Date(now.getTime() - 86400000 * 10),
      lastReviewed: new Date(now.getTime() - 86400000 * 5),
      reviewInterval: 3,
      reviewEase: 2.5,
      struggleCount: 1,
      lastStruggledAt: new Date(now.getTime() - 86400000 * 5),
      totalStruggleTime: 120,
      reviewCount: 2
    }
  ];

  beforeEach(() => {
    // Reset any mocks or test data
  });

  test('Repeat mode selects struggled and overdue questions', async () => {
    const questions = await getQuestionsByMode('repeat', testQuestions);
    const questionIds = questions.map(q => q.id);
    expect(questionIds).toContain('3'); // Struggled question
    expect(questionIds).toContain('4'); // Overdue question
    expect(questionIds).not.toContain('1'); // New question
    expect(questionIds).not.toContain('2'); // Recent question
  });

  test('Study mode focuses on new and recent questions', async () => {
    const questions = await getQuestionsByMode('study', testQuestions);
    const questionIds = questions.map(q => q.id);
    expect(questionIds).toContain('1'); // New question
    expect(questionIds).toContain('2'); // Recent question
    expect(questionIds).not.toContain('3'); // Struggled question
    expect(questionIds).not.toContain('4'); // Overdue question
  });

  test('Discover mode introduces new related questions', async () => {
    const questions = await getQuestionsByMode('discover',
      testQuestions.map(q => ({...q, topics: ['related-topic']})),
      ['2', '3', '4'], // Already in user's queue
      ['related-topic']
    );
    const questionIds = questions.map(q => q.id);
    expect(questionIds).toContain('1'); // Only new question not in queue
    expect(questionIds).not.toContain('2');
    expect(questionIds).not.toContain('3');
    expect(questionIds).not.toContain('4');
  });

  test('Full workflow from discovery to mastery', async () => {
    // Start with discover mode
    let questions = await getQuestionsByMode('discover',
      testQuestions.map(q => ({...q, topics: ['related-topic']})),
      ['2', '3', '4'],
      ['related-topic']
    );
    expect(questions.map(q => q.id)).toEqual(['1']);

    // Study the new question
    const nextReview = calculateNextReview(questions[0]);
    expect(nextReview.daysUntilReview).toBe(1);

    // Mark as remembered
    const rememberedQuestion = {
      ...questions[0],
      lastReviewed: new Date(),
      reviewCount: 1,
      reviewInterval: nextReview.newInterval,
      reviewEase: nextReview.newEase
    };

    // Now check study mode should include it as recent
    questions = await getQuestionsByMode('study', [rememberedQuestion, ...testQuestions.slice(1)]);
    expect(questions.map(q => q.id)).toContain('1');

    // After several reviews, check repeat mode
    const struggledQuestion = {
      ...rememberedQuestion,
      reviewCount: 5,
      struggleCount: 3,
      lastStruggledAt: new Date(),
      reviewEase: 1.5
    };
    questions = await getQuestionsByMode('repeat', [struggledQuestion, ...testQuestions.slice(1)]);
    expect(questions.map(q => q.id)).toContain('1');
  });
});