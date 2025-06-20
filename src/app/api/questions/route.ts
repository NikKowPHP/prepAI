import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.replace(/\/$/, "").split('/');
    const lastPart = pathParts.pop();
    const topics = url.searchParams.get('topics')?.split(',') || [];

    if (lastPart && lastPart !== 'questions') {
      const id = lastPart;
      // Get single question by ID
      const question = await prisma.question.findUnique({
        where: { id },
      });

      if (!question || question.userId !== user.id) {
        return NextResponse.json({ error: 'Question not found' }, { status: 404 });
      }

      return NextResponse.json(question);
    } else {
      // Get all questions for the user
      const questions = await prisma.question.findMany({
        where: {
          userId: user.id,
          ...(topics.length > 0 && {
            topics: {
              hasSome: topics
            }
          })
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json(questions);
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Database Error:', error.message);
    } else {
      console.error('Unknown Error:', error);
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/questions/mode
 * Returns questions filtered by SRS mode
 */
export async function GET_MODE(req: NextRequest) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const mode = url.searchParams.get('mode');
    const userQuestions = url.searchParams.get('userQuestions') ? JSON.parse(url.searchParams.get('userQuestions')!) : [];

    if (!mode) {
      return NextResponse.json({ error: 'Mode parameter is required' }, { status: 400 });
    }

    const questions = await prisma.question.findMany({
      where: { userId: user.id },
    });

    let filteredQuestions;
    switch (mode) {
      case 'repeat':
        filteredQuestions = questions.filter(q => q.reviewEase <= 2.0 || q.lastReviewed === null);
        break;
      case 'study':
        filteredQuestions = questions.filter(q => {
          if (!q.lastReviewed) return true;
          const daysSinceCreated = (new Date().getTime() - q.createdAt.getTime()) / (1000 * 60 * 60 * 24);
          const approxReviews = daysSinceCreated / q.reviewInterval;
          return approxReviews <= 3;
        });
        break;
      case 'discover':
        filteredQuestions = questions.filter(q => !userQuestions.includes(q.id));
        break;
      default:
        return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
    }

    return NextResponse.json(filteredQuestions);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Database Error:', error.message);
    } else {
      console.error('Unknown Error:', error);
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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
    if (error instanceof Error) {
      console.error('Database Error:', error.message);
    } else {
      console.error('Unknown Error:', error);
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.replace(/\/$/, "").split('/');
    const id = pathParts.pop();

    if (!id || id === 'questions') {
      return NextResponse.json({ error: 'Question ID is required' }, { status: 400 });
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { content, category, difficulty } = body;

    if (!content && !category && !difficulty) {
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
    if (error instanceof Error) {
      console.error('Database Error:', error.message);
    } else {
      console.error('Unknown Error:', error);
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.replace(/\/$/, "").split('/');
    const id = pathParts.pop();

    if (!id || id === 'questions') {
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
    if (error instanceof Error) {
      console.error('Database Error:', error.message);
    } else {
      console.error('Unknown Error:', error);
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}