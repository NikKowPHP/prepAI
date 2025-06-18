import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { supabase } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();

    if (id) {
      // Get single question by ID
      const question = await prisma.question.findUnique({
        where: { id },
        include: { user: true },
      });

      if (!question || question.userId !== user.id) {
        return NextResponse.json({ error: 'Question not found' }, { status: 404 });
      }

      return NextResponse.json(question);
    } else {
      // Get all questions for the user
      const questions = await prisma.question.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json(questions);
    }
  } catch (error: unknown) {
    let errorMessage = 'Internal server error';
    if (error instanceof Error) {
      console.error('Database Error:', error.message);
      errorMessage = error.message;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { content, category, difficulty } = body;

    if (!content || !category || !difficulty) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (typeof content !== 'string' ||
        typeof category !== 'string' ||
        typeof difficulty !== 'string') {
      return NextResponse.json({ error: 'Invalid field types' }, { status: 400 });
    }

    const question = await prisma.question.create({
      data: {
        content: content.trim(),
        category: category.trim(),
        difficulty: difficulty.trim(),
        userId: user.id,
      },
    });

    return NextResponse.json(question, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    let errorMessage = 'Internal server error';
    if (error instanceof Error) {
      console.error('Database Error:', error.message);
      errorMessage = error.message;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json({ error: 'Question ID is required' }, { status: 400 });
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { content, category, difficulty } = body;

    if ((!content || !category || !difficulty) && Object.keys(body).length > 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if ((content && typeof content !== 'string') ||
        (category && typeof category !== 'string') ||
        (difficulty && typeof difficulty !== 'string')) {
      return NextResponse.json({ error: 'Invalid field types' }, { status: 400 });
    }

    const question = await prisma.question.findUnique({
      where: { id },
    });

    if (!question || question.userId !== user.id) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    const updatedQuestion = await prisma.question.update({
      where: { id },
      data: {
        ...(content !== undefined && { content: content.trim() }),
        ...(category !== undefined && { category: category.trim() }),
        ...(difficulty !== undefined && { difficulty: difficulty.trim() }),
      },
    });

    return NextResponse.json(updatedQuestion);
  } catch (error: unknown) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    let errorMessage = 'Internal server error';
    if (error instanceof Error) {
      console.error('Database Error:', error.message);
      errorMessage = error.message;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json({ error: 'Question ID is required' }, { status: 400 });
    }

    const question = await prisma.question.findUnique({
      where: { id },
    });

    if (!question || question.userId !== user.id) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    await prisma.question.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Question deleted successfully' });
  } catch (error: unknown) {
    let errorMessage = 'Internal server error';
    if (error instanceof Error) {
      console.error('Database Error:', error.message);
      errorMessage = error.message;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}