export interface Question {
  id: string;
  createdAt: Date;
  lastReviewed: Date | null;
  reviewInterval: number;
  reviewEase: number;
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
export const getRepeatModeQuestions = (questions: Question[], easeThreshold = 2.0): Question[] => {
  return questions.filter(question => {
    const { daysUntilReview } = calculateNextReview(question);
    // Include questions that are overdue OR have low ease factor
    return daysUntilReview === 0 || question.reviewEase <= easeThreshold;
  });
};

export const updateQuestionAfterReview = (question: Question, remembered: boolean): Question => {
  const { newInterval, newEase } = calculateNextReview(question);

  // Adjust interval and ease based on whether the user remembered the answer
  let adjustedInterval = newInterval;
  let adjustedEase = newEase;

  if (!remembered) {
    // If user didn't remember, reset to shorter interval and decrease ease
    adjustedInterval = Math.max(1, Math.ceil(newInterval / 2));
    adjustedEase = Math.max(1.3, newEase - 0.2);
  } else {
    // If user remembered, increase interval and ease slightly
    adjustedInterval = Math.ceil(newInterval * 1.1);
    adjustedEase = Math.min(3.0, newEase + 0.1);
  }

  return {
    ...question,
    lastReviewed: new Date(),
    reviewInterval: adjustedInterval,
    reviewEase: adjustedEase,
  };
};