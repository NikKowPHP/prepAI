import { prisma } from '@/lib/db';
import { POST } from './route';
import { jest } from '@jest/globals';

jest.mock('@/lib/db', () => ({
  prisma: {
    question: {
      create: jest.fn(),
    },
  },
}));

const mockCreate = jest.fn<typeof prisma.question.create>();
(prisma.question.create as jest.MockedFunction<typeof prisma.question.create>) = mockCreate;

describe('POST /api/questions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new question with valid data', async () => {
    const mockQuestion = {
      id: '1',
      createdAt: new Date(),
      content: 'Test question',
      category: 'general',
      difficulty: 'easy',
      source: null,
      userId: 'temp-user-id'
    };
    mockCreate.mockResolvedValue(mockQuestion as any);

    const req = new Request('http://localhost/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: 'Test question',
        category: 'general',
        difficulty: 'easy',
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockQuestion);
    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        content: 'Test question',
        category: 'general',
        difficulty: 'easy',
        userId: 'temp-user-id',
      },
    });
  });

  it('should return 400 if missing required fields', async () => {
    const req = new Request('http://localhost/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Missing required fields');
  });

  it('should return 500 on database error', async () => {
    mockCreate.mockRejectedValue(new Error('Database error'));

    const req = new Request('http://localhost/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: 'Test question',
        category: 'general',
        difficulty: 'easy',
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal server error');
  });
});