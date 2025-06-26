// ROO-AUDIT-TAG: START(question-generator-module)
import type { Question } from './types/question';

const CODING_KEYWORDS = ['algorithm', 'data structure', 'coding', 'problem solving'];
const VALID_CATEGORIES = ['technical', 'coding-challenge'];
const VALID_DIFFICULTIES = ['easy', 'medium', 'hard'];

function validateQuestion(question: Question) {
  if (!question.question || question.question.length < 10) {
    throw new Error('Question content too short');
  }
  if (!VALID_CATEGORIES.includes(question.category)) {
    throw new Error('Invalid question category');
  }
  if (!VALID_DIFFICULTIES.includes(question.difficulty)) {
    throw new Error('Invalid difficulty level');
  }
  return true;
}

function isCodingTopic(topic: string): boolean {
  return CODING_KEYWORDS.some(keyword =>
    topic.toLowerCase().includes(keyword.toLowerCase())
  );
}

const CODING_TEMPLATES = [
  (topic: string) => `Implement a function to solve ${topic}`,
  (topic: string) => `Write code that demonstrates ${topic}`,
  (topic: string) => `Solve this ${topic} problem:`,
  (topic: string) => `Optimize this ${topic} solution:`
];

export async function generateQuestions(topics: string[]): Promise<Question[]> {
  return topics.map(topic => {
    if (isCodingTopic(topic)) {
      const template = CODING_TEMPLATES[
        Math.floor(Math.random() * CODING_TEMPLATES.length)
      ];
      const questionText = template(topic);
      return {
        id: crypto.randomUUID(),
        question: questionText,
        content: questionText,
        answer: '',
        category: 'coding-challenge',
        difficulty: 'hard',
        user_id: '',
        rating: 0,
        topics: [topic],
        codeExample: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
    
    const questionText = `Generated question about ${topic}`;
    const question: Question = {
      id: crypto.randomUUID(),
      question: questionText,
      content: questionText,
      answer: '',
      category: 'technical',
      difficulty: 'medium',
      user_id: '',
      rating: 0,
      topics: [topic],
      codeExample: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    validateQuestion(question);
    return question;
  });
}
// ROO-AUDIT-TAG: END(question-generator-module)