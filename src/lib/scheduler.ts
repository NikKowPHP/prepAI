import type { Question } from '@prisma/client';
import { calculateNextReview, updateQuestionAfterReview } from './srs';
import { prisma } from './db';

export interface SchedulerService {
  getQuestionsDueForReview: () => Promise<Question[]>;
  markQuestionAsReviewed: (questionId: string, remembered: boolean) => Promise<void>;
  getNextReviewDates: (questionIds: string[]) => Promise<{ [questionId: string]: Date }>;
  getQuestionsByMode: (mode: 'repeat' | 'study' | 'discover', userId: string, userQuestions: string[]) => Promise<Question[]>;
}

export const createSchedulerService = (): SchedulerService => {
  const getQuestionsDueForReview = async (): Promise<Question[]> => {
    const data = await prisma.question.findMany({
      orderBy: { lastReviewed: 'asc' },
    });

    if (!data) return [];

    const questions: Question[] = data.map(item => ({
      ...item,
      createdAt: new Date(item.createdAt),
      lastReviewed: item.lastReviewed ? new Date(item.lastReviewed) : null,
      lastStruggledAt: item.lastStruggledAt ? new Date(item.lastStruggledAt) : null,
    }));

    // Filter and sort questions by overdue priority
    return questions
      .filter(item => {
        const { daysUntilReview } = calculateNextReview(item);
        return daysUntilReview === 0;
      })
      .sort((a, b) => {
        // Calculate overdue days for both questions
        const aOverdue = a.lastReviewed
          ? (Date.now() - a.lastReviewed.getTime()) / (1000 * 60 * 60 * 24) - a.reviewInterval
          : Infinity;
        const bOverdue = b.lastReviewed
          ? (Date.now() - b.lastReviewed.getTime()) / (1000 * 60 * 60 * 24) - b.reviewInterval
          : Infinity;

        // Combine overdue days with struggle count for priority score
        const aPriority = aOverdue * 2 + a.struggleCount;
        const bPriority = bOverdue * 2 + b.struggleCount;

        return bPriority - aPriority; // Sort descending
      });
  };

  const markQuestionAsReviewed = async (questionId: string, remembered: boolean): Promise<void> => {
    const itemData = await prisma.question.findUnique({
        where: { id: questionId },
    });

    if (!itemData) {
      console.error(`Error fetching question item: ${questionId}`);
      return;
    }

    const question: Question = {
        ...itemData,
        createdAt: new Date(itemData.createdAt),
        lastReviewed: itemData.lastReviewed ? new Date(itemData.lastReviewed) : null,
        lastStruggledAt: itemData.lastStruggledAt ? new Date(itemData.lastStruggledAt) : null,
    };

    const updatedItem = await updateQuestionAfterReview(question, remembered, 0);

    await prisma.question.update({
        where: { id: questionId },
        data: {
            lastReviewed: updatedItem.lastReviewed,
            reviewInterval: updatedItem.reviewInterval,
            reviewEase: updatedItem.reviewEase,
        }
    });
  };

  const getNextReviewDates = async (questionIds: string[]): Promise<{ [questionId: string]: Date }> => {
    const data = await prisma.question.findMany({
        where: { id: { in: questionIds } }
    });


    if (!data) return {};

    const nextReviewDates: { [questionId: string]: Date } = {};

    data.forEach(item => {
      const question: Question = {
        ...item,
        createdAt: new Date(item.createdAt),
        lastReviewed: item.lastReviewed ? new Date(item.lastReviewed) : null,
        lastStruggledAt: item.lastStruggledAt ? new Date(item.lastStruggledAt) : null,
      };
      const { daysUntilReview } = calculateNextReview(question);

      const nextReview = new Date();
      nextReview.setDate(nextReview.getDate() + daysUntilReview);
      nextReviewDates[item.id] = nextReview;
    });

    return nextReviewDates;
  };

  const getQuestionsByMode = async (mode: 'repeat' | 'study' | 'discover', userId: string, userQuestions: string[]): Promise<Question[]> => {
    const data = await prisma.question.findMany({
      where: { userId },
    });

    if (!data) return [];

    const questions: Question[] = data.map(item => ({
      ...item,
      createdAt: new Date(item.createdAt),
      lastReviewed: item.lastReviewed ? new Date(item.lastReviewed) : null,
      lastStruggledAt: item.lastStruggledAt ? new Date(item.lastStruggledAt) : null,
    }));

    let filteredQuestions;
    switch (mode) {
      case 'repeat':
        filteredQuestions = questions.filter(q => {
          const isHighStruggle = q.struggleCount > 2;
          const recentStruggle = q.lastStruggledAt
            ? (Date.now() - q.lastStruggledAt.getTime()) < 7 * 24 * 60 * 60 * 1000
            : false;
          return q.reviewEase <= 2.0 || !q.lastReviewed || isHighStruggle || recentStruggle;
        }).sort((a, b) => {
          // Calculate priority scores based on struggle metrics
          const aScore = (a.struggleCount * 2) +
            (a.lastStruggledAt ? (1 / (Date.now() - a.lastStruggledAt.getTime())) : 0) +
            (a.totalStruggleTime / 1000);
          const bScore = (b.struggleCount * 2) +
            (b.lastStruggledAt ? (1 / (Date.now() - b.lastStruggledAt.getTime())) : 0) +
            (b.totalStruggleTime / 1000);
          return bScore - aScore; // Higher scores first
        });
        break;
      case 'study':
        filteredQuestions = questions.filter(q => {
          if (!q.lastReviewed) return true; // New questions always included
          if (q.reviewCount <= 3) return true; // Low review count questions included

          // Apply time-based decay: reduce probability for older questions
          const daysSinceLastReview = (new Date().getTime() - q.lastReviewed.getTime()) / (1000 * 60 * 60 * 24);
          const decayFactor = Math.max(0, 1 - (daysSinceLastReview / (q.reviewInterval * 2)));

          // Random selection with decay factor
          return Math.random() < decayFactor;
        });
        break;
      case 'discover':
        filteredQuestions = questions.filter(q => !userQuestions.includes(q.id));
        break;
      default:
        throw new Error('Invalid mode');
    }

    return filteredQuestions;
  };

  return {
    getQuestionsDueForReview,
    markQuestionAsReviewed,
    getNextReviewDates,
    getQuestionsByMode,
  };
};

export const schedulerService = createSchedulerService();