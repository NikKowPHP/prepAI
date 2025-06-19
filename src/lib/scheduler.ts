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
      .select('id, created_at, last_reviewed, review_interval, review_ease, struggle_count, last_struggled_at, total_struggle_time, review_count')
      .order('last_reviewed', { ascending: false });

    if (error) {
      console.error(`Error fetching ${table}:`, error);
      return [];
    }

    if (!data) return [];

    const questions = data.map(item => ({
      id: item.id,
      createdAt: new Date(item.created_at),
      lastReviewed: item.last_reviewed ? new Date(item.last_reviewed) : null,
      reviewInterval: item.review_interval,
      reviewEase: item.review_ease,
      struggleCount: item.struggle_count || 0,
      lastStruggledAt: item.last_struggled_at ? new Date(item.last_struggled_at) : null,
      totalStruggleTime: item.total_struggle_time || 0,
      reviewCount: item.review_count || 0,
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

  const markQuestionAsReviewed = async (table: 'questions' | 'flashcards', questionId: string, remembered: boolean): Promise<void> => {
    const { data: itemData, error: fetchError } = await supabase
      .from(table)
      .select('id, created_at, last_reviewed, review_interval, review_ease, struggle_count, last_struggled_at, total_struggle_time, review_count')
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
      struggleCount: itemData.struggle_count || 0,
      lastStruggledAt: itemData.last_struggled_at ? new Date(itemData.last_struggled_at) : null,
      totalStruggleTime: itemData.total_struggle_time || 0,
      reviewCount: itemData.review_count || 0,
    }, remembered, 0);

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
      .select('id, last_reviewed, review_interval, review_ease, created_at, struggle_count, last_struggled_at, total_struggle_time, review_count')
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
        struggleCount: item.struggle_count || 0,
        lastStruggledAt: item.last_struggled_at ? new Date(item.last_struggled_at) : null,
        totalStruggleTime: item.total_struggle_time || 0,
        reviewCount: item.review_count || 0,
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
      .select('id, created_at, last_reviewed, review_interval, review_ease, struggle_count, last_struggled_at, total_struggle_time, review_count')
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
      struggleCount: item.struggle_count || 0,
      lastStruggledAt: item.last_struggled_at ? new Date(item.last_struggled_at) : null,
      totalStruggleTime: item.total_struggle_time || 0,
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