import { NextRequest, NextResponse } from 'next/server';

interface QuestionPerformance {
  correct: boolean;
  topics: string[];
}

export async function POST(req: NextRequest) {
  try {
    const { questionPerformance, userId } = await req.json();

    // Validate input
    if (!questionPerformance || typeof questionPerformance !== 'object' || !userId) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Analyze knowledge gaps
    const topicPerformance: Record<string, { correctCount: number, totalCount: number }> = {};

    Object.values(questionPerformance as Record<string, QuestionPerformance>).forEach(entry => {
      entry.topics.forEach(topic => {
        if (!topicPerformance[topic]) {
          topicPerformance[topic] = { correctCount: 0, totalCount: 0 };
        }
        topicPerformance[topic].totalCount += 1;
        if (entry.correct) {
          topicPerformance[topic].correctCount += 1;
        }
      });
    });

    const gaps: string[] = [];
    const suggestedQuestions: string[] = [];

    Object.entries(topicPerformance).forEach(([topic, performance]) => {
      const successRate = performance.correctCount / performance.totalCount;
      if (successRate < 0.5) {
        gaps.push(topic);
        
        // Get related questions from performance data
        const related = Object.entries(questionPerformance as Record<string, QuestionPerformance>)
          .filter(([, q]) => q.topics.includes(topic))
          .map(([id]) => id);

        suggestedQuestions.push(...related);
      }
    });

    return NextResponse.json({
      gaps: [...new Set(gaps)], // Remove duplicates
      suggestedQuestions: [...new Set(suggestedQuestions)] // Remove duplicates
    });

  } catch (error) {
    console.error('Error analyzing knowledge gaps:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}