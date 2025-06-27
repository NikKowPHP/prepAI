import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateQuestions, validateQuestion } from '@/lib/questionGenerator';
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

    const { topics = [] } = body;
    if (!Array.isArray(topics) || topics.length === 0) {
      return NextResponse.json({ error: 'Topics array is required' }, { status: 400 });
    }

    const questions = await generateQuestions(topics);
    if (!questions || questions.length === 0) {
      return NextResponse.json({ error: 'Failed to generate questions' }, { status: 500 });
    }

    // Validate all generated questions
    try {
      questions.forEach(q => validateQuestion(q));
    } catch (validationError) {
      if (validationError instanceof Error) {
        return NextResponse.json({ error: `Validation failed: ${validationError.message}` }, { status: 400 });
      }
      return NextResponse.json({ error: 'Question validation failed' }, { status: 400 });
    }

    // Return first question with full Question type structure
    const firstQuestion: Question = questions[0];
    return NextResponse.json(firstQuestion);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error generating question:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    console.error('Unknown error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}