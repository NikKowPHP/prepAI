// ROO-AUDIT-TAG: START(question-generation-matching-test)
import { prisma } from '../../src/lib/db';
import { supabase } from '../../src/lib/supabase';
import { createObjective } from '../../src/lib/objectives';
import { generateQuestions } from '../../src/lib/questionGenerator';

// Mock external question generation service
jest.mock('../../src/lib/questionGenerator', () => ({
  generateQuestions: jest.fn().mockImplementation(async (topics: string[]) => {
    return topics.map(topic => ({
      content: `Test question about ${topic}`,
      category: 'technical',
      difficulty: 'medium',
    }));
  })
}));

interface TestQuestion {
  content: string;
  category: string;
  difficulty: string;
}

describe('Question Generation Matching Tests', () => {
  const testUserId = 'test-user';

  beforeAll(async () => {
    // Clear existing data
    await prisma.objective.deleteMany();
    await prisma.question.deleteMany();

    // Mock Supabase auth
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: testUserId } },
      error: null
    });
  });

  test('Generated questions match selected objectives', async () => {
    // Create test objectives with specific topics
    const frontendObjective = await createObjective({
      name: 'Frontend Development',
      description: 'Learn frontend technologies',
      userId: testUserId
    });

    const backendObjective = await createObjective({
      name: 'Backend Development',
      description: 'Learn backend technologies',
      userId: testUserId
    });

    // Simulate question generation for objectives
    const frontendQuestions = await generateQuestions(['react', 'typescript']);
    const backendQuestions = await generateQuestions(['node', 'postgres']);

    // Create questions in database linked to objectives
    await prisma.question.createMany({
      data: [
        ...frontendQuestions.map((q: TestQuestion) => ({
          ...q,
          userId: testUserId,
          objectives: { connect: { id: frontendObjective.id } }
        })),
        ...backendQuestions.map((q: TestQuestion) => ({
          ...q,
          userId: testUserId,
          objectives: { connect: { id: backendObjective.id } }
        }))
      ]
    });

    // Verify question-objective relationships
    const storedFrontendQuestions = await prisma.question.findMany({
      where: { objectives: { some: { id: frontendObjective.id } } }
    });
    const storedBackendQuestions = await prisma.question.findMany({
      where: { objectives: { some: { id: backendObjective.id } } }
    });

    expect(storedFrontendQuestions.length).toBe(2);
    expect(storedFrontendQuestions.every(q => 
      q.content.includes('react') || q.content.includes('typescript')
    )).toBe(true);

    expect(storedBackendQuestions.length).toBe(2);
    expect(storedBackendQuestions.every(q => 
      q.content.includes('node') || q.content.includes('postgres')
    )).toBe(true);
  });
});
// ROO-AUDIT-TAG: END(question-generation-matching-test)