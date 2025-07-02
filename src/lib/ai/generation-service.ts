/**
 * Interface defining the contract for AI question generation services
 */
export interface QuestionGenerationService {
  /**
   * Generates questions based on given topics and difficulty
   * @param topics Array of topics to generate questions about
   * @param difficulty Target difficulty level
   * @param count Number of questions to generate
   * @returns Promise resolving to generated questions
   */
  generateQuestions(
    topics: string[],
    difficulty: string,
    count: number
  ): Promise<GeneratedQuestion[]>;
}

/**
 * Represents a generated question with its answer
 */
export interface GeneratedQuestion {
  question: string;
  answer: string;
  explanation?: string;
  difficulty?: string;
  topics?: string[];
}