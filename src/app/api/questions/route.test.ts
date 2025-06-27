// ROO-AUDIT-TAG :: plan-009-audit-fixes.md :: Update test cases for new test database setup
import { NextRequest } from 'next/server';
import * as route from './route';
import type { Question } from '@prisma/client';

// Type definitions for test mocks
type MockUser = {
  id: string;
  app_metadata: Record<string, unknown>;
  user_metadata: Record<string, unknown>;
  aud: string;
  created_at: string;
};


// ROO-AUDIT-TAG :: plan-009-audit-fixes.md :: Replace mock implementations with test database setup
import { PrismaClient } from '@prisma/client';
import { createClient, AuthError } from '@supabase/supabase-js';

// Test database instance
const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL,
    },
  },
});

// Test Supabase client
const testSupabase = createClient(
  process.env.TEST_SUPABASE_URL!,
  process.env.TEST_SUPABASE_KEY!
);

// Mock implementations using test services
jest.mock('@/lib/db', () => ({
  prisma: testPrisma,
}));

jest.mock('@/lib/supabase', () => ({
  supabase: testSupabase,
}));

// Test data setup
beforeAll(async () => {
  await testPrisma.question.deleteMany();
});

afterAll(async () => {
  await testPrisma.$disconnect();
});
// ROO-AUDIT-TAG :: plan-009-audit-fixes.md :: END

describe('CRUD operations for questions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/questions', () => {
    it('should return 401 if unauthorized', async () => {
      jest.spyOn(testSupabase.auth, 'getUser').mockResolvedValue({
        data: { user: null },
        error: {
          message: 'Not authenticated',
          name: 'AuthError',
          code: 'invalid-auth',
          status: 401
        } as AuthError,
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
      jest.spyOn(testSupabase.auth, 'getUser').mockResolvedValue({
        data: {
          user: {
            id: 'user-id',
            app_metadata: {},
            user_metadata: {},
            aud: '',
            created_at: ''
          } satisfies MockUser
        },
        error: null,
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
      expect(response.status).toBe(201);
      
      const json: Question = await response.json();
      expect(json.content).toBe('Test question');
      expect(json.category).toBe('general');
      expect(json.difficulty).toBe('easy');
      expect(json.userId).toBe('user-id');
      expect(json.createdAt).toBeDefined();

      // Verify the question was actually created in test database
      const createdQuestion = await testPrisma.question.findUnique({
        where: { id: json.id }
      });
      expect(createdQuestion).toBeTruthy();
    });

    it('should return 400 if missing required fields', async () => {
      jest.spyOn(testSupabase.auth, 'getUser').mockResolvedValue({
        data: {
          user: {
            id: 'user-id',
            app_metadata: {},
            user_metadata: {},
            aud: '',
            created_at: ''
          }
        },
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
      jest.spyOn(testSupabase.auth, 'getUser').mockResolvedValue({
        data: {
          user: {
            id: 'user-id',
            app_metadata: {},
            user_metadata: {},
            aud: '',
            created_at: ''
          }
        },
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
      jest.spyOn(testSupabase.auth, 'getUser').mockResolvedValue({
        data: {
          user: {
            id: 'user-id',
            app_metadata: {},
            user_metadata: {},
            aud: '',
            created_at: ''
          }
        },
        error: null,
      });
      
      // Create actual database error by disconnecting
      await testPrisma.$disconnect();

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
      jest.spyOn(testSupabase.auth, 'getUser').mockResolvedValue({
        data: { user: null },
        error: {
          message: 'Not authenticated',
          name: 'AuthError',
          code: 'invalid-auth',
          status: 401
        } as AuthError,
      });

      const req = new NextRequest('http://localhost/api/questions', {
        method: 'GET',
      });

      const response = await route.GET(req);
      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({ error: 'Unauthorized' });
    });

    it('should return all questions for the user', async () => {
      jest.spyOn(testSupabase.auth, 'getUser').mockResolvedValue({
        data: {
          user: {
            id: 'user-id',
            app_metadata: {},
            user_metadata: {},
            aud: '',
            created_at: ''
          }
        },
        error: null,
      });

      // Create test questions directly in the database
      const questions = await Promise.all([
        testPrisma.question.create({
          data: {
            content: 'Test question 1',
            category: 'general',
            difficulty: 'easy',
            userId: 'user-id',
          },
        }),
        testPrisma.question.create({
          data: {
            content: 'Test question 2',
            category: 'general',
            difficulty: 'easy',
            userId: 'user-id',
          },
        }),
      ]);

      const req = new NextRequest('http://localhost/api/questions', {
        method: 'GET',
      });

      const response = await route.GET(req);
      expect(response.status).toBe(200);
      const json: Question[] = await response.json();
      expect(json.length).toBe(questions.length);
      json.forEach((q, index) => {
        expect(q.id).toBe(questions[index].id);
        expect(q.content).toBe(questions[index].content);
        expect(q.category).toBe(questions[index].category);
        expect(q.difficulty).toBe(questions[index].difficulty);
        expect(q.userId).toBe(questions[index].userId);
        expect(q.createdAt).toBeDefined();
      });
    });

    it('should return a single question by ID', async () => {
      jest.spyOn(testSupabase.auth, 'getUser').mockResolvedValue({
        data: {
          user: {
            id: 'user-id',
            app_metadata: {},
            user_metadata: {},
            aud: '',
            created_at: ''
          }
        },
        error: null,
      });

      // Create test question directly in the database
      const question = await testPrisma.question.create({
        data: {
          content: 'Test question',
          category: 'general',
          difficulty: 'easy',
          userId: 'user-id',
        },
      });

      const req = new NextRequest(`http://localhost/api/questions/${question.id}`, {
        method: 'GET',
      });

      const response = await route.GET(req);
      expect(response.status).toBe(200);
      const json: Question = await response.json();
      expect(json.id).toBe(question.id);
      expect(json.content).toBe(question.content);
      expect(json.category).toBe(question.category);
      expect(json.difficulty).toBe(question.difficulty);
      expect(json.userId).toBe(question.userId);
      expect(json.createdAt).toBeDefined();
    });

    it('should return 404 if question not found', async () => {
      jest.spyOn(testSupabase.auth, 'getUser').mockResolvedValue({
        data: {
          user: {
            id: 'user-id',
            app_metadata: {},
            user_metadata: {},
            aud: '',
            created_at: ''
          }
        },
        error: null,
      });

      const req = new NextRequest('http://localhost/api/questions/non-existent-id', {
        method: 'GET',
      });

      const response = await route.GET(req);
      expect(response.status).toBe(404);
      expect(await response.json()).toEqual({ error: 'Question not found' });
    });

    it('should return 500 on database error', async () => {
      jest.spyOn(testSupabase.auth, 'getUser').mockResolvedValue({
        data: {
          user: {
            id: 'user-id',
            app_metadata: {},
            user_metadata: {},
            aud: '',
            created_at: ''
          }
        },
        error: null,
      });
      
      // Create actual database error by disconnecting
      await testPrisma.$disconnect();

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
      jest.spyOn(testSupabase.auth, 'getUser').mockResolvedValue({
        data: { user: null },
        error: {
          message: 'Not authenticated',
          name: 'AuthError',
          code: 'invalid-auth',
          status: 401
        } as AuthError,
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
      jest.spyOn(testSupabase.auth, 'getUser').mockResolvedValue({
        data: {
          user: {
            id: 'user-id',
            app_metadata: {},
            user_metadata: {},
            aud: '',
            created_at: ''
          }
        },
        error: null,
      });

      // Create initial question
      const question = await testPrisma.question.create({
        data: {
          content: 'Original question',
          category: 'general',
          difficulty: 'easy',
          userId: 'user-id',
        },
      });

      const req = new NextRequest(`http://localhost/api/questions/${question.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: 'Updated question',
        }),
      });

      const response = await route.PUT(req);
      expect(response.status).toBe(200);
      const json: Question = await response.json();
      expect(json.id).toBe(question.id);
      expect(json.content).toBe('Updated question');
      expect(json.category).toBe('general');
      expect(json.difficulty).toBe('easy');
      expect(json.userId).toBe('user-id');
      expect(json.createdAt).toBeDefined();

      // Verify the update in the database
      const updatedQuestion = await testPrisma.question.findUnique({
        where: { id: question.id }
      });
      expect(updatedQuestion?.content).toBe('Updated question');
    });

    it('should return 404 if question not found', async () => {
      jest.spyOn(testSupabase.auth, 'getUser').mockResolvedValue({
        data: {
          user: {
            id: 'user-id',
            app_metadata: {},
            user_metadata: {},
            aud: '',
            created_at: ''
          }
        },
        error: null,
      });

      const req = new NextRequest('http://localhost/api/questions/non-existent-id', {
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
      jest.spyOn(testSupabase.auth, 'getUser').mockResolvedValue({
        data: {
          user: {
            id: 'user-id',
            app_metadata: {},
            user_metadata: {},
            aud: '',
            created_at: ''
          }
        },
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
      jest.spyOn(testSupabase.auth, 'getUser').mockResolvedValue({
        data: {
          user: {
            id: 'user-id',
            app_metadata: {},
            user_metadata: {},
            aud: '',
            created_at: ''
          }
        },
        error: null,
      });

      // Create test question
      const question = await testPrisma.question.create({
        data: {
          content: 'Test question',
          category: 'general',
          difficulty: 'easy',
          userId: 'user-id',
        },
      });

      // Create actual database error by disconnecting
      await testPrisma.$disconnect();

      const req = new NextRequest(`http://localhost/api/questions/${question.id}`, {
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
      jest.spyOn(testSupabase.auth, 'getUser').mockResolvedValue({
        data: { user: null },
        error: {
          message: 'Not authenticated',
          name: 'AuthError',
          code: 'invalid-auth',
          status: 401
        } as AuthError,
      });

      const req = new NextRequest('http://localhost/api/questions/1', {
        method: 'DELETE',
      });

      const response = await route.DELETE(req);
      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({ error: 'Unauthorized' });
    });

    it('should delete an existing question', async () => {
      jest.spyOn(testSupabase.auth, 'getUser').mockResolvedValue({
        data: {
          user: {
            id: 'user-id',
            app_metadata: {},
            user_metadata: {},
            aud: '',
            created_at: ''
          }
        },
        error: null,
      });

      // Create test question
      const question = await testPrisma.question.create({
        data: {
          content: 'Test question',
          category: 'general',
          difficulty: 'easy',
          userId: 'user-id',
        },
      });

      const req = new NextRequest(`http://localhost/api/questions/${question.id}`, {
        method: 'DELETE',
      });

      const response = await route.DELETE(req);
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ message: 'Question deleted successfully' });

      // Verify deletion
      const deletedQuestion = await testPrisma.question.findUnique({
        where: { id: question.id }
      });
      expect(deletedQuestion).toBeNull();
    });

    it('should return 404 if question not found', async () => {
      jest.spyOn(testSupabase.auth, 'getUser').mockResolvedValue({
        data: {
          user: {
            id: 'user-id',
            app_metadata: {},
            user_metadata: {},
            aud: '',
            created_at: ''
          }
        },
        error: null,
      });

      const req = new NextRequest('http://localhost/api/questions/non-existent-id', {
        method: 'DELETE',
      });

      const response = await route.DELETE(req);
      expect(response.status).toBe(404);
      expect(await response.json()).toEqual({ error: 'Question not found' });
    });

    it('should return 500 on database error', async () => {
      jest.spyOn(testSupabase.auth, 'getUser').mockResolvedValue({
        data: {
          user: {
            id: 'user-id',
            app_metadata: {},
            user_metadata: {},
            aud: '',
            created_at: ''
          }
        },
        error: null,
      });

      // Create test question
      const question = await testPrisma.question.create({
        data: {
          content: 'Test question',
          category: 'general',
          difficulty: 'easy',
          userId: 'user-id',
        },
      });

      // Create actual database error by disconnecting
      await testPrisma.$disconnect();

      const req = new NextRequest(`http://localhost/api/questions/${question.id}`, {
        method: 'DELETE',
      });

      const response = await route.DELETE(req);
      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({ error: 'Internal server error' });
    });
  });
});