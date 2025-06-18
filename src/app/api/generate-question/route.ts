import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

    const { prompt, maxTokens = 150, temperature = 0.7, questionType = 'general' } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    let systemPrompt = `Generate a question based on this prompt: ${prompt}`;

    // Implement prompt engineering based on question type
    if (questionType === 'multiple_choice') {
      systemPrompt = `Generate a multiple choice question with 4 options (A, B, C, D) based on this prompt: ${prompt}`;
    } else if (questionType === 'true_false') {
      systemPrompt = `Generate a true or false question based on this prompt: ${prompt}`;
    } else if (questionType === 'short_answer') {
      systemPrompt = `Generate a short answer question based on this prompt: ${prompt}`;
    }

    const completion = await openai.completions.create({
      model: 'text-davinci-003',
      prompt: systemPrompt,
      max_tokens: maxTokens,
      temperature: temperature,
    });

    if (!completion.choices || completion.choices.length === 0) {
      return NextResponse.json({ error: 'Failed to generate question' }, { status: 500 });
    }

    const generatedQuestion = completion.choices[0].text.trim();

    return NextResponse.json({ question: generatedQuestion, type: questionType });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error generating question:', error.message);
    } else {
      console.error('Unknown error:', error);
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}