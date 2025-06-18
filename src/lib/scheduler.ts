import { Question, calculateNextReview, updateQuestionAfterReview } from './srs';
import { supabase } from './supabase';

export interface SchedulerService {
  getQuestionsDueForReview: () => Promise<Question[]>;
  markQuestionAsReviewed: (questionId: string, remembered: boolean) => Promise<void>;
  getNextReviewDates: (questionIds: string[]) => Promise<{ [questionId: string]: Date }>;
}

export const createSchedulerService = (): SchedulerService => {
  const getQuestionsDueForReview = async (): Promise<Question[]> => {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .order('last_reviewed', { ascending: false });

    if (error) {
      console.error('Error fetching questions:', error);
      return [];
    }

    if (!data) return [];

    return data.map(question => ({
      id: question.id,
      createdAt: new Date(question.created_at),
      lastReviewed: question.last_reviewed ? new Date(question.last_reviewed) : null,
      reviewInterval: question.review_interval,
      reviewEase: question.review_ease,
    })).filter(question => {
      const { daysUntilReview } = calculateNextReview(question);
      return daysUntilReview === 0;
    });
  };

  const markQuestionAsReviewed = async (questionId: string, remembered: boolean): Promise<void> => {
    const { data: questionData, error: fetchError } = await supabase
      .from('questions')
      .select('*')
      .eq('id', questionId)
      .single();

    if (fetchError || !questionData) {
      console.error('Error fetching question:', fetchError);
      return;
    }

    const updatedQuestion = updateQuestionAfterReview({
      id: questionId,
      createdAt: new Date(questionData.created_at),
      lastReviewed: questionData.last_reviewed ? new Date(questionData.last_reviewed) : null,
      reviewInterval: questionData.review_interval,
      reviewEase: questionData.review_ease,
    }, remembered);

    const { error: updateError } = await supabase
      .from('questions')
      .update({
        last_reviewed: updatedQuestion.lastReviewed,
        review_interval: updatedQuestion.reviewInterval,
        review_ease: updatedQuestion.reviewEase,
      })
      .eq('id', questionId);

    if (updateError) {
      console.error('Error updating question:', updateError);
    }
  };

  const getNextReviewDates = async (questionIds: string[]): Promise<{ [questionId: string]: Date }> => {
    const { data, error } = await supabase
      .from('questions')
      .select('id, last_reviewed, review_interval, review_ease, created_at')
      .in('id', questionIds);

    if (error) {
      console.error('Error fetching questions:', error);
      return {};
    }

    if (!data) return {};

    const nextReviewDates: { [questionId: string]: Date } = {};

    data.forEach(question => {
      const { daysUntilReview } = calculateNextReview({
        id: question.id,
        createdAt: new Date(question.created_at),
        lastReviewed: question.last_reviewed ? new Date(question.last_reviewed) : null,
        reviewInterval: question.review_interval,
        reviewEase: question.review_ease,
      });

      const nextReview = new Date();
      nextReview.setDate(nextReview.getDate() + daysUntilReview);
      nextReviewDates[question.id] = nextReview;
    });

    return nextReviewDates;
  };

  return {
    getQuestionsDueForReview,
    markQuestionAsReviewed,
    getNextReviewDates,
  };
};

export const schedulerService = createSchedulerService();