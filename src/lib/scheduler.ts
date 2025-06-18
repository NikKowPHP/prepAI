import { Question, calculateNextReview, updateQuestionAfterReview } from './srs';
import { supabase } from './supabase';

export interface SchedulerService {
  getQuestionsDueForReview: (table: 'questions' | 'flashcards') => Promise<Question[]>;
  markQuestionAsReviewed: (table: 'questions' | 'flashcards', questionId: string, remembered: boolean) => Promise<void>;
  getNextReviewDates: (table: 'questions' | 'flashcards', questionIds: string[]) => Promise<{ [questionId: string]: Date }>;
}

export const createSchedulerService = (): SchedulerService => {
  const getQuestionsDueForReview = async (table: 'questions' | 'flashcards' = 'questions'): Promise<Question[]> => {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order('last_reviewed', { ascending: false });

    if (error) {
      console.error(`Error fetching ${table}:`, error);
      return [];
    }

    if (!data) return [];

    return data.map(item => ({
      id: item.id,
      createdAt: new Date(item.created_at || item.createdAt),
      lastReviewed: item.last_reviewed ? new Date(item.last_reviewed) : null,
      reviewInterval: item.review_interval || item.reviewInterval,
      reviewEase: item.review_ease || item.reviewEase,
    })).filter(item => {
      const { daysUntilReview } = calculateNextReview(item);
      return daysUntilReview === 0;
    });
  };

  const markQuestionAsReviewed = async (table: 'questions' | 'flashcards', questionId: string, remembered: boolean): Promise<void> => {
    const { data: itemData, error: fetchError } = await supabase
      .from(table)
      .select('*')
      .eq('id', questionId)
      .single();

    if (fetchError || !itemData) {
      console.error(`Error fetching ${table} item:`, fetchError);
      return;
    }

    const updatedItem = updateQuestionAfterReview({
      id: questionId,
      createdAt: new Date(itemData.created_at || itemData.createdAt),
      lastReviewed: itemData.last_reviewed ? new Date(itemData.last_reviewed) : null,
      reviewInterval: itemData.review_interval || itemData.reviewInterval,
      reviewEase: itemData.review_ease || itemData.reviewEase,
    }, remembered);

    const { error: updateError } = await supabase
      .from(table)
      .update({
        last_reviewed: updatedItem.lastReviewed,
        review_interval: updatedItem.reviewInterval,
        review_ease: updatedItem.reviewEase,
      })
      .eq('id', questionId);

    if (updateError) {
      console.error(`Error updating ${table} item:`, updateError);
    }
  };

  const getNextReviewDates = async (table: 'questions' | 'flashcards', questionIds: string[]): Promise<{ [questionId: string]: Date }> => {
    const { data, error } = await supabase
      .from(table)
      .select('id, last_reviewed, review_interval, review_ease, created_at')
      .in('id', questionIds);

    if (error) {
      console.error(`Error fetching ${table}:`, error);
      return {};
    }

    if (!data) return {};

    const nextReviewDates: { [questionId: string]: Date } = {};

    data.forEach(item => {
      const { daysUntilReview } = calculateNextReview({
        id: item.id,
        createdAt: new Date(item.created_at || item.createdAt),
        lastReviewed: item.last_reviewed ? new Date(item.last_reviewed) : null,
        reviewInterval: item.review_interval || item.reviewInterval,
        reviewEase: item.review_ease || item.reviewEase,
      });

      const nextReview = new Date();
      nextReview.setDate(nextReview.getDate() + daysUntilReview);
      nextReviewDates[item.id] = nextReview;
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