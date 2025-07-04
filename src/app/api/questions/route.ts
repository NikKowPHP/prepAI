import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';
import type { Question } from '@prisma/client';

export async function GET(req: NextRequest) {
  const supabase = await createClient();
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

      return NextResponse.json({ questions: questions as Question[] });
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
  const supabase = await createClient();
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
  const supabase = await createClient();
  try {
    const body = await req.json();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { content, category, difficulty, topics, answer } = body;

    if (!content || !answer) {
      return NextResponse.json({ error: 'Missing required fields: content, answer' }, { status: 400 });
    }

    if (typeof content !== 'string' || typeof answer !== 'string') {
      return NextResponse.json({ error: 'Invalid field types for content or answer' }, { status: 400 });
    }

    const question = await prisma.question.create({
      data: {
        content: content.trim(),
        answer: answer.trim(),
        category: category ? category.trim() : null,
        difficulty: difficulty ? difficulty.trim() : null,
        topics: topics || [],
        userId: user.id,
      } as any, // Temporarily cast to any to bypass type error, will regenerate prisma client
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
  const supabase = await createClient();
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

    const { content, category, difficulty, topics, answer, lastReviewed, reviewInterval, reviewEase, struggleCount, lastStruggledAt, totalStruggleTime, reviewCount, overdue, weight } = body;

    if (!content && !category && !difficulty && !topics && !answer && lastReviewed === undefined && reviewInterval === undefined && reviewEase === undefined && struggleCount === undefined && lastStruggledAt === undefined && totalStruggleTime === undefined && reviewCount === undefined && overdue === undefined && weight === undefined) {
      return NextResponse.json({ error: 'No fields provided for update' }, { status: 400 });
    }

    const question = await prisma.question.findUnique({
      where: { id },
    });

    if (!question || question.userId !== user.id) {
      return NextResponse.json({ error: 'Question not found or unauthorized' }, { status: 404 });
    }

    const dataToUpdate: Partial<Question> = {};
    if (content !== undefined) dataToUpdate.content = content.trim();
    if (category !== undefined) dataToUpdate.category = category.trim();
    if (difficulty !== undefined) dataToUpdate.difficulty = difficulty.trim();
    if (topics !== undefined) dataToUpdate.topics = topics;
    if (answer !== undefined) dataToUpdate.answer = answer.trim();
    if (lastReviewed !== undefined) dataToUpdate.lastReviewed = lastReviewed ? new Date(lastReviewed) : null;
    if (reviewInterval !== undefined) dataToUpdate.reviewInterval = reviewInterval;
    if (reviewEase !== undefined) dataToUpdate.reviewEase = reviewEase;
    if (struggleCount !== undefined) dataToUpdate.struggleCount = struggleCount;
    if (lastStruggledAt !== undefined) dataToUpdate.lastStruggledAt = lastStruggledAt ? new Date(lastStruggledAt) : null;
    if (totalStruggleTime !== undefined) dataToUpdate.totalStruggleTime = totalStruggleTime;
    if (reviewCount !== undefined) dataToUpdate.reviewCount = reviewCount;
    if (overdue !== undefined) dataToUpdate.overdue = overdue;
    if (weight !== undefined) dataToUpdate.weight = weight;

    const updatedQuestion = await prisma.question.update({
      where: { id },
      data: dataToUpdate,
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

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
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

    const body = await req.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { content, category, difficulty, topics, answer, lastReviewed, reviewInterval, reviewEase, struggleCount, lastStruggledAt, totalStruggleTime, reviewCount, overdue, weight } = body;

    if (!content && !category && !difficulty && !topics && !answer && lastReviewed === undefined && reviewInterval === undefined && reviewEase === undefined && struggleCount === undefined && lastStruggledAt === undefined && totalStruggleTime === undefined && reviewCount === undefined && overdue === undefined && weight === undefined) {
      return NextResponse.json({ error: 'No fields provided for update' }, { status: 400 });
    }

    const question = await prisma.question.findUnique({
      where: { id },
    });

    if (!question || question.userId !== user.id) {
      return NextResponse.json({ error: 'Question not found or unauthorized' }, { status: 404 });
    }

    const dataToUpdate: Partial<Question> = {};
    if (content !== undefined) dataToUpdate.content = content.trim();
    if (category !== undefined) dataToUpdate.category = category.trim();
    if (difficulty !== undefined) dataToUpdate.difficulty = difficulty.trim();
    if (topics !== undefined) dataToUpdate.topics = topics;
    if (answer !== undefined) dataToUpdate.answer = answer.trim();
    if (lastReviewed !== undefined) dataToUpdate.lastReviewed = lastReviewed ? new Date(lastReviewed) : null;
    if (reviewInterval !== undefined) dataToUpdate.reviewInterval = reviewInterval;
    if (reviewEase !== undefined) dataToUpdate.reviewEase = reviewEase;
    if (struggleCount !== undefined) dataToUpdate.struggleCount = struggleCount;
    if (lastStruggledAt !== undefined) dataToUpdate.lastStruggledAt = lastStruggledAt ? new Date(lastStruggledAt) : null;
    if (totalStruggleTime !== undefined) dataToUpdate.totalStruggleTime = totalStruggleTime;
    if (reviewCount !== undefined) dataToUpdate.reviewCount = reviewCount;
    if (overdue !== undefined) dataToUpdate.overdue = overdue;
    if (weight !== undefined) dataToUpdate.weight = weight;

    const updatedQuestion = await prisma.question.update({
      where: { id },
      data: dataToUpdate,
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
  const supabase = await createClient();
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

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Database Error:', error.message);
    } else {
      console.error('Unknown Error:', error);
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}