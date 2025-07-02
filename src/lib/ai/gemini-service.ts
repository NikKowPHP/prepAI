import { QuestionGenerationService, GeneratedQuestion } from './generation-service';
import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiQuestionGenerationService implements QuestionGenerationService {
  private genAI: GoogleGenerativeAI;
  private model: import('@google/generative-ai').GenerativeModel;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async generateQuestions(
    topics: string[],
    difficulty: string,
    count: number
  ): Promise<GeneratedQuestion[]> {
    const prompt = `
      Generate ${count} multiple choice questions about ${topics.join(', ')} 
      at ${difficulty} difficulty level. For each question, provide:
      1. The question text
      2. The correct answer
      3. An explanation (optional)
      4. Difficulty level (optional)
      5. Relevant topics (optional)

      Format the response as a JSON array of question objects.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse the response and return formatted questions
      return this.parseQuestions(text);
    } catch (error) {
      console.error('Error generating questions with Gemini:', error);
      throw error;
    }
  }

  private parseQuestions(text: string): GeneratedQuestion[] {
    try {
      // Parse the JSON response from Gemini
      const questions = JSON.parse(text) as GeneratedQuestion[];
      return questions.map(q => ({
        question: q.question,
        answer: q.answer,
        explanation: q.explanation,
        difficulty: q.difficulty,
        topics: q.topics
      }));
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      throw new Error('Failed to parse questions from Gemini response');
    }
  }
}