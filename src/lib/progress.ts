import { PrismaClient } from '@prisma/client';
import { schedulerService } from './scheduler';

const prisma = new PrismaClient();

export interface ProgressService {
  getUserProgress: (userId: string) => Promise<{
    totalQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    masteryScore: number;
  }>;
  updateProgressAfterReview: (userId: string, questionId: string, remembered: boolean) => Promise<void>;
  getUserMetrics: (userId: string) => Promise<{
    totalQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    masteryScore: number;
    nextReviewDates: { [questionId: string]: Date };
  }>;
  aggregateAnalyticsData: (userId: string) => Promise<{
    overallProgress: {
      totalQuestions: number;
      correctAnswers: number;
      incorrectAnswers: number;
      masteryScore: number;
    };
    recentReviews: Array<{
      question_id: string;
      remembered: boolean;
      reviewed_at: string;
    }>;
    topicMastery: Array<{
      topic_id: string;
      mastery_level: number;
    }>;
    calculatedAt: Date;
  }>;
}

export const createProgressService = (): ProgressService => {
  const getUserProgress = async (userId: string) => {
    const data = await prisma.progressMetrics.findFirst({
      where: { userId: userId },
    });

    if (!data) {
      console.error('Error fetching progress metrics: No data found');
      return {
        totalQuestions: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        masteryScore: 0,
      };
    }

    const { totalQuestions, correctAnswers, incorrectAnswers } = data;
    const masteryScore = calculateMasteryScore(correctAnswers, incorrectAnswers);

    return {
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      masteryScore,
    };
  };

  const updateProgressAfterReview = async (userId: string, questionId: string, remembered: boolean) => {
    // Update the question review status
    await schedulerService.markQuestionAsReviewed(questionId, remembered);

    // Get current progress metrics
    const metricsData = await prisma.progressMetrics.findFirst({
      where: { userId: userId },
    });

    if (!metricsData) {
      console.error('Error fetching progress metrics: No data found');
      return;
    }

    // Update metrics based on review result
    const updatedMetrics = {
      totalQuestions: metricsData.totalQuestions + 1,
      correctAnswers: metricsData.correctAnswers + (remembered ? 1 : 0),
      incorrectAnswers: metricsData.incorrectAnswers + (!remembered ? 1 : 0),
      lastReviewedAt: new Date(),
    };

    // Update in database
    const updateResult = await prisma.progressMetrics.update({
      where: { id: metricsData.id },
      data: updatedMetrics,
    });

    if (!updateResult) {
      console.error('Error updating progress metrics: No record found for update');
    }
  };

  const getUserMetrics = async (userId: string) => {
    const progress = await getUserProgress(userId);
    const questions = await prisma.question.findMany({
      where: { userId },
      select: { id: true }
    });
    const questionIds = questions.map(q => q.id);
    const nextReviewDates = await schedulerService.getNextReviewDates(questionIds);

    return {
      ...progress,
      nextReviewDates,
    };
  };

  return {
    getUserProgress,
    updateProgressAfterReview,
    getUserMetrics,
    aggregateAnalyticsData: async (userId: string) => {
      const progressData = await prisma.progressMetrics.findFirst({
        where: { userId: userId },
      });
  
      const reviewData = await prisma.review.findMany({
        where: { userId: userId },
        select: {
          questionId: true,
          remembered: true,
          reviewedAt: true,
        },
        orderBy: {
          reviewedAt: 'desc',
        },
      });
  
      const topicData = await prisma.userTopic.findMany({
        where: { userId: userId },
        select: {
          topicId: true,
          masteryLevel: true,
        },
      });
  
      if (!progressData || !reviewData || !topicData) {
        throw new Error('Failed to fetch analytics data');
      }
  
      return {
        overallProgress: {
          totalQuestions: progressData.totalQuestions,
          correctAnswers: progressData.correctAnswers,
          incorrectAnswers: progressData.incorrectAnswers,
          masteryScore: calculateMasteryScore(
            progressData.correctAnswers,
            progressData.incorrectAnswers
          ),
        },
        recentReviews: reviewData.slice(0, 10).map(review => ({
          question_id: review.questionId,
          remembered: review.remembered,
          reviewed_at: review.reviewedAt.toISOString(),
        })),
        topicMastery: topicData.map(topic => ({
          topic_id: topic.topicId,
          mastery_level: topic.masteryLevel,
        })),
        calculatedAt: new Date(),
      };
    },
  };
};

const calculateMasteryScore = (correctAnswers: number, incorrectAnswers: number): number => {
  const totalAnswers = correctAnswers + incorrectAnswers;
  if (totalAnswers === 0) return 0;

  return Math.min(100, Math.round((correctAnswers / totalAnswers) * 100));
};

export const progressService = createProgressService();