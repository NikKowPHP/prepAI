import { supabase } from './supabase';
import { schedulerService } from './scheduler';

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
}

export const createProgressService = (): ProgressService => {
  const getUserProgress = async (userId: string) => {
    const { data, error } = await supabase
      .from('progress_metrics')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      console.error('Error fetching progress metrics:', error);
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
    const { data: metricsData, error: metricsError } = await supabase
      .from('progress_metrics')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (metricsError || !metricsData) {
      console.error('Error fetching progress metrics:', metricsError);
      return;
    }

    // Update metrics based on review result
    const updatedMetrics = {
      ...metricsData,
      totalQuestions: metricsData.total_questions + 1,
      correctAnswers: metricsData.correct_answers + (remembered ? 1 : 0),
      incorrectAnswers: metricsData.incorrect_answers + (!remembered ? 1 : 0),
      lastReviewedAt: new Date(),
    };

    // Update in database
    const { error: updateError } = await supabase
      .from('progress_metrics')
      .update(updatedMetrics)
      .eq('id', metricsData.id);

    if (updateError) {
      console.error('Error updating progress metrics:', updateError);
    }
  };

  const getUserMetrics = async (userId: string) => {
    const progress = await getUserProgress(userId);
    const nextReviewDates = await schedulerService.getNextReviewDates([userId]);

    return {
      ...progress,
      nextReviewDates,
    };
  };

  return {
    getUserProgress,
    updateProgressAfterReview,
    getUserMetrics,
  };
};

const calculateMasteryScore = (correctAnswers: number, incorrectAnswers: number): number => {
  const totalAnswers = correctAnswers + incorrectAnswers;
  if (totalAnswers === 0) return 0;

  return Math.min(100, Math.round((correctAnswers / totalAnswers) * 100));
};

export const progressService = createProgressService();