export interface Question {
  id: string;
  createdAt: Date;
  lastReviewed: Date | null;
  reviewInterval: number;
  reviewEase: number;
  struggleCount: number;
  lastStruggledAt: Date | null;
  totalStruggleTime: number;
  reviewCount: number;
  question: string;
  answer: string;
  rating: 'easy' | 'normal' | 'hard';
  user_id: string;
  topics?: string[];
  isAIGenerated?: boolean;
}

export const calculateNextReview = (question: Question): { daysUntilReview: number, newInterval: number, newEase: number } => {
  const now = new Date();
  const timeSinceLastReview = question.lastReviewed
    ? now.getTime() - question.lastReviewed.getTime()
    : 0;

  // If this is the first review, set initial values
  if (!question.lastReviewed) {
    return {
      daysUntilReview: 1,
      newInterval: 1,
      newEase: 2.5,
    };
  }

  // Calculate days since last review
  const daysSinceLastReview = timeSinceLastReview / (1000 * 60 * 60 * 24);

  // If it's time for review, update the interval and ease
  if (daysSinceLastReview >= question.reviewInterval) {
    // Update ease factor based on whether the user remembered the answer
    // For simplicity, we'll assume a default ease factor update
    // In a real system, this would be based on user performance
    const newEase = Math.min(question.reviewEase + 0.1, 3.0);

    // Calculate new interval using SM2 algorithm
    const newInterval = Math.ceil(
      Math.max(
        1,
        daysSinceLastReview * newEase
      )
    );

    return {
      daysUntilReview: 0, // Ready for review now
      newInterval,
      newEase,
    };
  } else {
    // Not time for review yet
    return {
      daysUntilReview: question.reviewInterval - daysSinceLastReview,
      newInterval: question.reviewInterval,
      newEase: question.reviewEase,
    };
  }
};

export const getQuestionsDueForReview = (questions: Question[]): Question[] => {
  return questions.filter(question => {
    const { daysUntilReview } = calculateNextReview(question);
    return daysUntilReview === 0;
  });
};

/**
 * Get questions for Repeat mode (low ease, overdue, or high struggle)
 * @param questions - Array of questions to filter
 * @param easeThreshold - Maximum ease factor to consider for repeat (default: 2.0)
 * @param struggleThreshold - Minimum struggle count to consider (default: 2)
 * @returns Filtered list of questions needing reinforcement
 */
/**
 * Calculate selection weight for a question based on struggle metrics and ease
 */
const calculateQuestionWeight = (question: Question): number => {
  const easeFactor = Math.max(1.3, question.reviewEase);
  const struggleWeight = Math.log(question.struggleCount + 1) * 2;
  const recentStruggleWeight = question.lastStruggledAt
    ? (1 / (1 + (Date.now() - question.lastStruggledAt.getTime()) / (1000 * 60 * 60 * 24))) * 2
    : 0;
    
  return (struggleWeight + recentStruggleWeight) / easeFactor;
};

export const getRepeatModeQuestions = (
  questions: Question[],
  easeThreshold = 2.0,
  struggleThreshold = 2
): Question[] => {
  try {
    if (!questions?.length) {
      return [];
    }

    // First filter questions that need review
    const filtered = questions.filter(question => {
      const { daysUntilReview } = calculateNextReview(question);
      const isRecentStruggle = question.lastStruggledAt
        ? (Date.now() - question.lastStruggledAt.getTime()) < 7 * 24 * 60 * 60 * 1000
        : false;
      
      return daysUntilReview === 0 ||
             question.reviewEase <= easeThreshold ||
             question.struggleCount > struggleThreshold ||
             isRecentStruggle;
    });

    // Then sort by calculated weight (descending)
    return filtered.sort((a, b) => {
      const weightA = calculateQuestionWeight(a);
      const weightB = calculateQuestionWeight(b);
      return weightB - weightA;
    });
  } catch (error) {
    console.error('Error in getRepeatModeQuestions:', error);
    throw new Error('Failed to get repeat mode questions');
  }
};

/**
 * Get questions for Study mode (new or recently added)
 * @param questions - Array of questions to filter
 * @param reviewThreshold - Maximum number of reviews to consider as "new" (default: 3)
 * @returns Filtered list of questions for new learning
 */
export interface StudyModeQueues {
  newQuestions: Question[];
  recentQuestions: Question[];
}

export const getStudyModeQuestions = (questions: Question[], reviewThreshold = 3): StudyModeQueues => {
  try {
    if (!questions?.length) {
      return { newQuestions: [], recentQuestions: [] };
    }

    const newQuestions = questions.filter(q => q.reviewCount === 0);
    const recentQuestions = questions.filter(q => {
      return q.reviewCount > 0 && q.reviewCount <= reviewThreshold;
    });

    return {
      newQuestions,
      recentQuestions
    };
  } catch (error) {
    console.error('Error in getStudyModeQuestions:', error);
    throw new Error('Failed to get study mode questions');
  }
};

/**
 * Calculate similarity between two sets of topics
 * @param topicsA - Topics from first question
 * @param topicsB - Topics from second question
 * @returns Similarity score (0-1)
 */
const calculateTopicSimilarity = (topicsA: string[], topicsB: string[]): number => {
  if (topicsA.length === 0 || topicsB.length === 0) return 0;

  const intersection = topicsA.filter(topic => topicsB.includes(topic));
  return intersection.length / Math.max(topicsA.length, topicsB.length);
};

/**
 * Get questions for Discover mode (potential new questions)
 * @param questions - Array of questions to filter
 * @param userQuestions - IDs of questions already in user's queue
 * @param currentTopics - Topics from currently active questions
 * @returns Filtered list of questions for discovery, sorted by relevance
 */
export const getDiscoverModeQuestions = (questions: Question[], userQuestions: string[], currentTopics: string[] = []): Question[] => {
  try {
    if (!questions?.length) {
      return [];
    }

    return questions
      .filter(question => {
        // Exclude questions already in user's queue
        if (userQuestions.includes(question.id)) return false;

        // Include questions with some topic overlap if they have topics
        if (!question.topics || question.topics.length === 0) return false;

        return question.isAIGenerated ||
          (question.topics && calculateTopicSimilarity(question.topics, currentTopics) > 0);
      })
      .sort((a, b) => {
        // Sort by topic similarity (descending)
        const similarityA = calculateTopicSimilarity(a.topics || [], currentTopics);
        const similarityB = calculateTopicSimilarity(b.topics || [], currentTopics);
        return similarityB - similarityA;
      });
  } catch (error) {
    console.error('Error in getDiscoverModeQuestions:', error);
    throw new Error('Failed to get discover mode questions');
  }
};

export const updateQuestionAfterReview = (question: Question, remembered: boolean, timeSpent = 0): Question => {
  const { newInterval, newEase } = calculateNextReview(question);

  // Adjust interval and ease based on whether the user remembered the answer
  let adjustedInterval = newInterval;
  let adjustedEase = newEase;
  let struggleCount = question.struggleCount;
  let lastStruggledAt = question.lastStruggledAt;
  let totalStruggleTime = question.totalStruggleTime;

  if (!remembered) {
    // If user didn't remember, update struggle metrics
    struggleCount += 1;
    lastStruggledAt = new Date();
    totalStruggleTime += timeSpent;

    // Adjust interval and ease more aggressively
    adjustedInterval = Math.max(1, Math.ceil(newInterval / 2));
    adjustedEase = Math.max(1.3, newEase - 0.2);
  } else {
    // If user remembered, improve metrics slightly
    adjustedInterval = Math.ceil(newInterval * 1.1);
    adjustedEase = Math.min(3.0, newEase + 0.1);
  }

  return {
    ...question,
    lastReviewed: new Date(),
    reviewInterval: adjustedInterval,
    reviewEase: adjustedEase,
    struggleCount,
    lastStruggledAt,
    totalStruggleTime,
    reviewCount: question.reviewCount + 1,
  };
};

/**
 * Get questions by mode, ensuring consistent array return type
 * @param mode - SRS mode (repeat/study/discover)
 * @param questions - All available questions
 * @param userQuestions - Questions in user's queue (for discover mode)
 * @param currentTopics - Current active topics (for discover mode)
 * @returns Array of questions for the specified mode (empty array if none)
 */
export const getQuestionsByMode = (
  mode: 'repeat' | 'study' | 'discover',
  questions: Question[],
  userQuestions?: string[],
  currentTopics?: string[]
): Question[] => {
  try {
    switch(mode) {
      case 'repeat':
        return getRepeatModeQuestions(questions);
      case 'study': {
        const { newQuestions, recentQuestions } = getStudyModeQuestions(questions);
        return [...newQuestions, ...recentQuestions];
      }
      case 'discover':
        return getDiscoverModeQuestions(questions, userQuestions || [], currentTopics || []);
      default:
        return [];
    }
  } catch (error) {
    console.error(`Error getting questions for mode ${mode}:`, error);
    return [];
  }
};