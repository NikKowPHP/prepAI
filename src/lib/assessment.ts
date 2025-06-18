export interface AssessmentService {
  calculateScore: (answers: Record<string, string>) => number;
  getRecommendations: (score: number) => string[];
}

export const createAssessmentService = (): AssessmentService => {
  const calculateScore = (answers: Record<string, string>): number => {
    // Simple scoring model: 1 point for each correct answer
    // In a real implementation, this would be more complex
    const totalQuestions = Object.keys(answers).length;
    const correctAnswers = Object.values(answers).filter(answer => answer === 'correct').length;

    return (correctAnswers / totalQuestions) * 100;
  };

  const getRecommendations = (score: number): string[] => {
    if (score >= 90) {
      return ['You are well-prepared! Consider focusing on advanced topics.', 'Practice with more challenging questions.'];
    } else if (score >= 70) {
      return ['Good job! Review areas where you made mistakes.', 'Focus on improving your weaker areas.'];
    } else if (score >= 50) {
      return ['You need more practice. Review the material carefully.', 'Consider getting help from a tutor or study group.'];
    } else {
      return ['You need significant improvement. Start with the basics.', 'Create a study plan and stick to it.'];
    }
  };

  return {
    calculateScore,
    getRecommendations,
  };
};

export const assessmentService = createAssessmentService();