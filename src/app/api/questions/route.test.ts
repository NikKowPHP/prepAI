import { NextRequest } from 'next/server';
import * as route from './route';
import { prisma } from '@/lib/db';
import { supabase } from '@/lib/supabase';

// Mock Prisma and Supabase
jest.mock('@/lib/db', () => ({
  prisma: {
    question: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
  },
}));

const mockCreate = prisma.question.create as jest.Mock;
const mockFindMany = prisma.question.findMany as jest.Mock;
const mockFindUnique = prisma.question.findUnique as jest.Mock;
const mockUpdate = prisma.question.update as jest.Mock;
const mockDelete = prisma.question.delete as jest.Mock;
const mockGetUser = supabase.auth.getUser as jest.Mock;

describe('CRUD operations for questions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/questions', () => {
    it('should return 401 if unauthorized', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated'),
      });

      const req = new NextRequest('http://localhost/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: 'Test question',
          category: 'general',
          difficulty: 'easy',
        }),
      });

      const response = await route.POST(req);
      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({ error: 'Unauthorized' });
    });

    it('should create a new question with valid data', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-id' } },
        error: null,
      });

      const mockQuestion = {
        id: '1',
        content: 'Test question',
        category: 'general',
        difficulty: 'easy',
        userId: 'user-id',
        createdAt: new Date(),
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

      const response = await route.POST(req);
      expect(response.status).toBe(201);
      const json = await response.json();
      expect(json.id).toBe(mockQuestion.id);
      expect(json.content).toBe(mockQuestion.content);
      expect(json.category).toBe(mockQuestion.category);
      expect(json.difficulty).toBe(mockQuestion.difficulty);
      expect(json.userId).toBe(mockQuestion.userId);
      expect(json.createdAt).toBeDefined();
    });

    it('should return 400 if missing required fields', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-id' } },
        error: null,
      });

      const req = new NextRequest('http://localhost/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const response = await route.POST(req);
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ error: 'Missing required fields' });
    });

    it('should return 400 if field types are invalid', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-id' } },
        error: null,
      });

      const req = new NextRequest('http://localhost/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: 123,
          category: 'general',
          difficulty: 'easy',
        }),
      });

      const response = await route.POST(req);
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ error: 'Invalid field types' });
    });

    it('should return 500 on database error', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-id' } },
        error: null,
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

      const response = await route.POST(req);
      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({ error: 'Internal server error' });
    });
  });

  describe('GET /api/questions', () => {
    it('should return 401 if unauthorized', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated'),
      });

      const req = new NextRequest('http://localhost/api/questions', {
        method: 'GET',
      });

      const response = await route.GET(req);
      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({ error: 'Unauthorized' });
    });

    it('should return all questions for the user', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-id' } },
        error: null,
      });

      const mockQuestions = [
        {
          id: '1',
          content: 'Test question 1',
          category: 'general',
          difficulty: 'easy',
          userId: 'user-id',
          createdAt: new Date(),
        },
        {
          id: '2',
          content: 'Test question 2',
          category: 'general',
          difficulty: 'easy',
          userId: 'user-id',
          createdAt: new Date(),
        },
      ];
      mockFindMany.mockResolvedValue(mockQuestions);

      const req = new NextRequest('http://localhost/api/questions', {
        method: 'GET',
      });

      const response = await route.GET(req);
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.length).toBe(mockQuestions.length);
      json.forEach((q: any, index: number) => {
        expect(q.id).toBe(mockQuestions[index].id);
        expect(q.content).toBe(mockQuestions[index].content);
        expect(q.category).toBe(mockQuestions[index].category);
        expect(q.difficulty).toBe(mockQuestions[index].difficulty);
        expect(q.userId).toBe(mockQuestions[index].userId);
        expect(q.createdAt).toBeDefined();
      });
    });

    it('should return a single question by ID', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-id' } },
        error: null,
      });

      const mockQuestion = {
        id: '1',
        content: 'Test question',
        category: 'general',
        difficulty: 'easy',
        userId: 'user-id',
        createdAt: new Date(),
      };
      mockFindUnique.mockResolvedValue(mockQuestion);

      const req = new NextRequest('http://localhost/api/questions/1', {
        method: 'GET',
      });

      const response = await route.GET(req);
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.id).toBe(mockQuestion.id);
      expect(json.content).toBe(mockQuestion.content);
      expect(json.category).toBe(mockQuestion.category);
      expect(json.difficulty).toBe(mockQuestion.difficulty);
      expect(json.userId).toBe(mockQuestion.userId);
      expect(json.createdAt).toBeDefined();
    });

    it('should return 404 if question not found', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-id' } },
        error: null,
      });

      mockFindUnique.mockResolvedValue(null);

      const req = new NextRequest('http://localhost/api/questions/1', {
        method: 'GET',
      });

      const response = await route.GET(req);
      expect(response.status).toBe(404);
      expect(await response.json()).toEqual({ error: 'Question not found' });
    });

    it('should return 500 on database error', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-id' } },
        error: null,
      });
      mockFindMany.mockRejectedValue(new Error('Database error'));

      const req = new NextRequest('http://localhost/api/questions', {
        method: 'GET',
      });

      const response = await route.GET(req);
      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({ error: 'Internal server error' });
    });
  });

  describe('PUT /api/questions/[id]', () => {
    it('should return 401 if unauthorized', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated'),
      });

      const req = new NextRequest('http://localhost/api/questions/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: 'Updated question',
        }),
      });

      const response = await route.PUT(req);
      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({ error: 'Unauthorized' });
    });

    it('should update an existing question', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-id' } },
        error: null,
      });

      const mockQuestion = {
        id: '1',
        content: 'Updated question',
        category: 'general',
        difficulty: 'easy',
        userId: 'user-id',
        createdAt: new Date(),
      };
      mockFindUnique.mockResolvedValue(mockQuestion);
      mockUpdate.mockResolvedValue(mockQuestion);

      const req = new NextRequest('http://localhost/api/questions/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: 'Updated question',
        }),
      });

      const response = await route.PUT(req);
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.id).toBe(mockQuestion.id);
      expect(json.content).toBe(mockQuestion.content);
      expect(json.category).toBe(mockQuestion.category);
      expect(json.difficulty).toBe(mockQuestion.difficulty);
      expect(json.userId).toBe(mockQuestion.userId);
      expect(json.createdAt).toBeDefined();
    });

    it('should return 404 if question not found', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-id' } },
        error: null,
      });

      mockFindUnique.mockResolvedValue(null);

      const req = new NextRequest('http://localhost/api/questions/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: 'Updated question',
        }),
      });

      const response = await route.PUT(req);
      expect(response.status).toBe(404);
      expect(await response.json()).toEqual({ error: 'Question not found' });
    });

    it('should return 400 if missing required fields', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-id' } },
        error: null,
      });

      const req = new NextRequest('http://localhost/api/questions/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const response = await route.PUT(req);
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ error: 'Missing required fields' });
    });

    it('should return 500 on database error', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-id' } },
        error: null,
      });
      mockFindUnique.mockResolvedValue({
        id: '1',
        userId: 'user-id',
      });
      mockUpdate.mockRejectedValue(new Error('Database error'));

      const req = new NextRequest('http://localhost/api/questions/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: 'Updated question',
        }),
      });

      const response = await route.PUT(req);
      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({ error: 'Internal server error' });
    });
  });

  describe('DELETE /api/questions/[id]', () => {
    it('should return 401 if unauthorized', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated'),
      });

      const req = new NextRequest('http://localhost/api/questions/1', {
        method: 'DELETE',
      });

      const response = await route.DELETE(req);
      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({ error: 'Unauthorized' });
    });

    it('should delete an existing question', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-id' } },
        error: null,
      });

      const mockQuestion = {
        id: '1',
        content: 'Test question',
        category: 'general',
        difficulty: 'easy',
        userId: 'user-id',
        createdAt: new Date(),
      };
      mockFindUnique.mockResolvedValue(mockQuestion);
      mockDelete.mockResolvedValue(undefined);

      const req = new NextRequest('http://localhost/api/questions/1', {
        method: 'DELETE',
      });

      const response = await route.DELETE(req);
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ message: 'Question deleted successfully' });
    });

    it('should return 404 if question not found', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-id' } },
        error: null,
      });

      mockFindUnique.mockResolvedValue(null);

      const req = new NextRequest('http://localhost/api/questions/1', {
        method: 'DELETE',
      });

      const response = await route.DELETE(req);
      expect(response.status).toBe(404);
      expect(await response.json()).toEqual({ error: 'Question not found' });
    });

    it('should return 500 on database error', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-id' } },
        error: null,
      });
      mockFindUnique.mockResolvedValue({
        id: '1',
        userId: 'user-id',
      });
      mockDelete.mockRejectedValue(new Error('Database error'));

      const req = new NextRequest('http://localhost/api/questions/1', {
        method: 'DELETE',
      });

      const response = await route.DELETE(req);
      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({ error: 'Internal server error' });
    });
  });
});