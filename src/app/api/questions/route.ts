import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Request body:', body);

    const { data: { user }, error } = await supabase.auth.getUser();
    console.log('Auth status - user:', user, 'error:', error);

    if (error || !user) {
      const response = NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
      console.log('Returning response with status:', response.status);
      return response;
    }
    
    // Validate request body
    if (!body || typeof body !== 'object') {
      const response = NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
      console.log('Returning response with status:', response.status);
      return response;
    }

    const { content, category, difficulty } = body;

    // Check for presence of all required fields
    if (!content?.trim() || !category?.trim() || !difficulty?.trim()) {
      const response = NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
      console.log('Returning response with status:', response.status);
      return response;
    }

    // Validate field types
    if (typeof content !== 'string' ||
        typeof category !== 'string' ||
        typeof difficulty !== 'string') {
      const response = NextResponse.json(
        { error: 'Invalid field types' },
        { status: 400 }
      );
      console.log('Returning response with status:', response.status);
      return response;
    }

    // Create question in database
    const question = await prisma.question.create({
      data: {
        content: content.trim(),
        category: category.trim(),
        difficulty: difficulty.trim(),
        userId: user.id,
      },
    });

    const response = NextResponse.json(question, { status: 201 });
    console.log('Returning response with status:', response.status);
    return response;
    
  } catch (error) {
    console.error('API Error:', error);
    
    if (error instanceof SyntaxError) {
      const response = NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
      console.log('Returning response with status:', response.status);
      return response;
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}