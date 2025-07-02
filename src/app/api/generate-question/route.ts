import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getQuestionGenerationService } from '@/lib/ai';
import type { Question } from '@/lib/types/question';

export async function POST(req: NextRequest) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { topics = [], difficulty = 'medium', count = 1 } = body;
    if (!Array.isArray(topics) || topics.length === 0) {
      return NextResponse.json({ error: 'Topics array is required' }, { status: 400 });
    }

    const service = getQuestionGenerationService();
    const questions = await service.generateQuestions(topics, difficulty, count);
    if (!questions || questions.length === 0) {
      return NextResponse.json({ error: 'Failed to generate questions' }, { status: 500 });
    }

    // Return first question with full Question type structure
    const firstQuestion: Question = {
      id: crypto.randomUUID(),
      question: questions[0].question,
      content: questions[0].question,
      answer: questions[0].answer,
      user_id: user.id,
      category: 'general',
      difficulty: questions[0].difficulty || 'medium',
      rating: 0,
      topics: questions[0].topics || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return NextResponse.json({ questions: [firstQuestion] });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error generating question:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    console.error('Unknown error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}