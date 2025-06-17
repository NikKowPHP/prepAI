// Mock NextResponse FIRST
jest.mock('next/server', () => ({
  ...jest.requireActual('next/server'),
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: () => Promise.resolve(data),
      status: init?.status,
    })),
  },
}));

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Reset modules and dynamically import route
let POST: (req: NextRequest) => Promise<NextResponse>;
beforeAll(async () => {
  jest.resetModules();
  POST = (await import('./route')).POST;
});


// Mock the Prisma client
jest.mock('@/lib/db', () => ({
  prisma: {
    question: {
      create: jest.fn(),
    },
  },
}));

// Mock Supabase auth
const mockGetUser = jest.fn();
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: mockGetUser,
    },
  },
}));

const mockCreate = prisma.question.create as jest.Mock;

describe('POST /api/questions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new question with valid data', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: 'temp-user-id' } },
      error: null
    });
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
    console.log('Full response:', response);
    const data = await response.json();
    console.log('Actual status:', response?.status);

    expect(NextResponse.json).toHaveBeenCalledWith(
      mockQuestion,
      { status: 201 }
    );
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
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: 'temp-user-id' } },
      error: null
    });
    const req = new NextRequest('http://localhost/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    const response = await POST(req);
    console.log('Full response:', response);
    const data = await response.json();
    console.log('Actual status:', response?.status);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Missing required fields' },
      { status: 400 }
    );
    expect(data.error).toBe('Missing required fields');
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('should return 500 on database error', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: 'temp-user-id' } },
      error: null
    });
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
    console.log('Full response:', response);
    const data = await response.json();
    console.log('Actual status:', response?.status);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Internal server error' },
      { status: 500 }
    );
    expect(data.error).toBe('Internal server error');
  });
});