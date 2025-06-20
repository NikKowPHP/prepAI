import { prisma } from './db';
import { supabase } from './supabase';

export interface CreateObjectiveInput {
  name: string;
  description?: string;
  userId: string;
}

export const createObjective = async (input: CreateObjectiveInput) => {
  try {
    if (!input.name) {
      throw new Error('Objective name is required');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user || user.id !== input.userId) {
      throw new Error('Unauthorized');
    }

    const objective = await prisma.objective.create({
      data: {
        name: input.name.trim(),
        description: input.description?.trim(),
        userId: input.userId
      }
    });

    return objective;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error creating objective:', error.message);
      throw error;
    }
    console.error('Unknown error creating objective');
    throw new Error('Failed to create objective');
  }
};