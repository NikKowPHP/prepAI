import { Question, calculateNextReview, updateQuestionAfterReview } from './srs';
import { supabase } from './supabase';

export interface SchedulerService {
  getQuestionsDueForReview: (table: 'questions' | 'flashcards') => Promise<Question[]>;
  markQuestionAsReviewed: (table: 'questions' | 'flashcards', questionId: string, remembered: boolean) => Promise<void>;
  getNextReviewDates: (table: 'questions' | 'flashcards', questionIds: string[]) => Promise<{ [questionId: string]: Date }>;
  getQuestionsByMode: (mode: 'repeat' | 'study' | 'discover', userId: string, userQuestions: string[]) => Promise<Question[]>;
}

export const createSchedulerService = (): SchedulerService => {
  const getQuestionsDueForReview = async (table: 'questions' | 'flashcards' = 'questions'): Promise<Question[]> => {
    const { data, error } = await supabase
      .from(table)
      .select('id, created_at, last_reviewed, review_interval, review_ease')
      .order('last_reviewed', { ascending: false });

    if (error) {
      console.error(`Error fetching ${table}:`, error);
      return [];
    }

    if (!data) return [];

    return data.map(item => ({
      id: item.id,
      createdAt: new Date(item.created_at),
      lastReviewed: item.last_reviewed ? new Date(item.last_reviewed) : null,
      reviewInterval: item.review_interval,
      reviewEase: item.review_ease,
    })).filter(item => {
      const { daysUntilReview } = calculateNextReview(item);
      return daysUntilReview === 0;
    });
  };

  const markQuestionAsReviewed = async (table: 'questions' | 'flashcards', questionId: string, remembered: boolean): Promise<void> => {
    const { data: itemData, error: fetchError } = await supabase
      .from(table)
      .select('id, created_at, last_reviewed, review_interval, review_ease')
      .eq('id', questionId)
      .single();

    if (fetchError || !itemData) {
      console.error(`Error fetching ${table} item:`, fetchError);
      return;
    }

    const updatedItem = updateQuestionAfterReview({
      id: questionId,
      createdAt: new Date(itemData.created_at),
      lastReviewed: itemData.last_reviewed ? new Date(itemData.last_reviewed) : null,
      reviewInterval: itemData.review_interval,
      reviewEase: itemData.review_ease,
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
        createdAt: new Date(item.created_at),
        lastReviewed: item.last_reviewed ? new Date(item.last_reviewed) : null,
        reviewInterval: item.review_interval,
        reviewEase: item.review_ease,
      });

      const nextReview = new Date();
      nextReview.setDate(nextReview.getDate() + daysUntilReview);
      nextReviewDates[item.id] = nextReview;
    });

    return nextReviewDates;
  };

  const getQuestionsByMode = async (mode: 'repeat' | 'study' | 'discover', userId: string, userQuestions: string[]): Promise<Question[]> => {
    const { data, error } = await supabase
      .from('questions')
      .select('id, created_at, last_reviewed, review_interval, review_ease')
      .eq('userId', userId);

    if (error) {
      console.error('Error fetching questions:', error);
      return [];
    }

    if (!data) return [];

    const questions = data.map(item => ({
      id: item.id,
      createdAt: new Date(item.created_at),
      lastReviewed: item.last_reviewed ? new Date(item.last_reviewed) : null,
      reviewInterval: item.review_interval,
      reviewEase: item.review_ease,
    }));

    let filteredQuestions;
    switch (mode) {
      case 'repeat':
        filteredQuestions = questions.filter(q => q.reviewEase <= 2.0 || !q.lastReviewed);
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