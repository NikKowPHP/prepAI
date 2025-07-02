import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = user.id;

  try {
    // Get all questions for the user
    const questions = await prisma.question.findMany({
      where: { userId },
      select: {
        id: true,
        content: true,
        category: true,
        difficulty: true,
        topics: true,
        reviewCount: true,
        struggleCount: true,
        lastReviewed: true,
        reviewEase: true,
      },
    });

    // Calculate readiness score based on review history and struggle metrics
    const readinessScore = calculateReadinessScore(questions);

    return NextResponse.json({ readinessScore }, { status: 200 });
  } catch (error) {
    console.error('Error calculating readiness:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

interface Question {
  id: string;
  content: string;
  category: string | null;
  difficulty: string | null;
  topics: string[];
  reviewCount: number;
  struggleCount: number;
  lastReviewed: Date | null;
  reviewEase: number;
}

function calculateReadinessScore(questions: Question[]): number {
  // Implement readiness calculation logic here
  // This is a placeholder implementation
  const totalQuestions = questions.length;
  const struggledQuestions = questions.filter(q => q.struggleCount > 0).length;
  const recentlyReviewed = questions.filter(q => {
    if (!q.lastReviewed) return false;
    const lastReview = new Date(q.lastReviewed);
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return lastReview >= oneWeekAgo;
  }).length;

  // Simple scoring algorithm
  const score = 100 - ((struggledQuestions / totalQuestions) * 50) + ((recentlyReviewed / totalQuestions) * 30);

  return Math.max(0, Math.min(100, score));
}