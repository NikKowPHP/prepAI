import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate request body
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { content, category, difficulty } = body;

    // Check for presence of all required fields
    if (!content?.trim() || !category?.trim() || !difficulty?.trim()) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate field types
    if (typeof content !== 'string' ||
        typeof category !== 'string' ||
        typeof difficulty !== 'string') {
      return NextResponse.json(
        { error: 'Invalid field types' },
        { status: 400 }
      );
    }

    // Create question in database
    const question = await prisma.question.create({
      data: {
        content: content.trim(),
        category: category.trim(),
        difficulty: difficulty.trim(),
        userId: 'temp-user-id',
      },
    });

    return NextResponse.json(question, { status: 201 });
    
  } catch (error) {
    console.error('API Error:', error);
    
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}