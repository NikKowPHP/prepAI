// ROO-AUDIT-TAG: START(topic-selection-verification-test)
import { prisma } from '../../src/lib/db';
import { supabase } from '../../src/lib/supabase';
import { createObjective, getObjectives } from '../../src/lib/objectives';
import type { Objective } from '@prisma/client';

// Mock Prisma and Supabase
jest.mock('../../src/lib/db');
jest.mock('../../src/lib/supabase');

describe('Topic Selection and Question Generation Integration Tests', () => {
  const mockObjective: Objective = {
    id: 'test-obj-1',
    name: 'Test Objective',
    description: 'Test Description',
    userId: 'test-user',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock Supabase auth
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: 'test-user' } },
      error: null
    });

    // Mock Prisma create
    (prisma.objective.create as jest.Mock).mockResolvedValue(mockObjective);
    
    // Mock Prisma findMany
    (prisma.objective.findMany as jest.Mock).mockResolvedValue([mockObjective]);
  });

  test('New objectives appear in question generation interface', async () => {
    // Create test objective
    const createdObjective = await createObjective({
      name: 'Test Objective',
      description: 'Test Description',
      userId: 'test-user'
    });

    // Get objectives for display
    const objectives = await getObjectives('test-user');
    
    // Verify our test objective is present
    expect(objectives).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: createdObjective.id,
          name: 'Test Objective'
        })
      ])
    );
  });
});
// ROO-AUDIT-TAG: END(topic-selection-verification-test)