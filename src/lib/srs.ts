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
 * Get questions for Repeat mode (low ease factor or overdue)
 * @param questions - Array of questions to filter
 * @param easeThreshold - Maximum ease factor to consider for repeat (default: 2.0)
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

export const getRepeatModeQuestions = (questions: Question[], easeThreshold = 2.0): Question[] => {
  // First filter questions that need review
  const filtered = questions.filter(question => {
    const { daysUntilReview } = calculateNextReview(question);
    return daysUntilReview === 0 || question.reviewEase <= easeThreshold;
  });

  // Then sort by calculated weight (descending)
  return filtered.sort((a, b) => {
    const weightA = calculateQuestionWeight(a);
    const weightB = calculateQuestionWeight(b);
    return weightB - weightA;
  });
};

/**
 * Get questions for Study mode (new or recently added)
 * @param questions - Array of questions to filter
 * @param reviewThreshold - Maximum number of reviews to consider as "new" (default: 3)
 * @returns Filtered list of questions for new learning
 */
export const getStudyModeQuestions = (questions: Question[], reviewThreshold = 3): Question[] => {
  return questions.filter(question => {
    // Consider questions with no reviews as "new"
    if (question.reviewCount === 0) return true;

    // Include questions with low review count
    return question.reviewCount <= reviewThreshold;
  });
};

/**
 * Get questions for Discover mode (potential new questions)
 * @param questions - Array of questions to filter
 * @param userQuestions - IDs of questions already in user's queue
 * @returns Filtered list of questions for discovery
 */
export const getDiscoverModeQuestions = (questions: Question[], userQuestions: string[]): Question[] => {
  return questions.filter(question => {
    // Exclude questions already in user's queue
    if (userQuestions.includes(question.id)) return false;

    // For now, include all other questions as potential discoveries
    return true;
  });
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