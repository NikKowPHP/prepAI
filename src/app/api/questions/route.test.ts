import { NextRequest } from 'next/server';
import { POST } from './route';
import { prisma } from '@/lib/db';
import { supabase } from '@/lib/supabase';

// Mock Prisma and Supabase
jest.mock('@/lib/db', () => ({
  prisma: {
    question: {
      create: jest.fn()
    }
  }
}));

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn()
    }
  }
}));

const mockCreate = prisma.question.create as jest.Mock;
const mockGetUser = supabase.auth.getUser as jest.Mock;

describe('POST /api/questions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if unauthorized', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: new Error('Not authenticated')
    });

    const req = new NextRequest('http://localhost/api/questions', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        content: 'Test question',
        category: 'general',
        difficulty: 'easy'
      })
    });

    const response = await POST(req);
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'Unauthorized' });
  });

  it('should create a new question with valid data', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-id' } },
      error: null
    });

    const mockQuestion = {
      id: '1',
      content: 'Test question',
      category: 'general',
      difficulty: 'easy',
      userId: 'user-id'
    };
    mockCreate.mockResolvedValue(mockQuestion);

    const req = new NextRequest('http://localhost/api/questions', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        content: 'Test question',
        category: 'general',
        difficulty: 'easy'
      })
    });

    const response = await POST(req);
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual(mockQuestion);
  });

  it('should return 400 if missing required fields', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-id' } },
      error: null
    });

    const req = new NextRequest('http://localhost/api/questions', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({})
    });

    const response = await POST(req);
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'Missing required fields' });
  });

  it('should return 400 if field types are invalid', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-id' } },
      error: null
    });

    const req = new NextRequest('http://localhost/api/questions', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        content: 123,
        category: 'general',
        difficulty: 'easy'
      })
    });

    const response = await POST(req);
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'Invalid field types' });
  });

  it('should return 500 on database error', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-id' } },
      error: null
    });
    mockCreate.mockRejectedValue(new Error('Database error'));

    const req = new NextRequest('http://localhost/api/questions', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        content: 'Test question',
        category: 'general',
        difficulty: 'easy'
      })
    });

    const response = await POST(req);
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: 'Internal server error' });
  });
});