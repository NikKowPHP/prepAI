import { POST } from './route';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';

// Mock the Prisma client
jest.mock('@/lib/db', () => ({
  prisma: {
    question: {
      create: jest.fn(),
    },
  },
}));

const mockCreate = prisma.question.create as jest.Mock;

describe('POST /api/questions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new question with valid data', async () => {
    const mockQuestion = {
      id: '1',
      createdAt: new Date().toISOString(),
      content: 'Test question',
      category: 'general',
      difficulty: 'easy',
      source: null,
      userId: 'temp-user-id'
    };
    mockCreate.mockResolvedValue(mockQuestion);

    const req = new NextRequest('http://localhost/api/questions', {
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

    expect(response.status).toBe(201);
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
    const req = new NextRequest('http://localhost/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Missing required fields');
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('should return 500 on database error', async () => {
    mockCreate.mockRejectedValue(new Error('Database error'));

    const req = new NextRequest('http://localhost/api/questions', {
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