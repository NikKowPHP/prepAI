// ROO-AUDIT-TAG :: plan-010-question-generation-remaining.md :: Add unit tests for new question types
import { generateQuestions, validateQuestion } from '../questionGenerator';
import type { Question } from '../types/question';

describe('Question Generator Validation', () => {
  const validTechnicalQuestion: Question = {
    id: '1',
    question: 'Explain TypeScript interfaces in detail',
    content: 'Explain TypeScript interfaces in detail',
    answer: 'Interfaces define contracts in your code...',
    category: 'technical',
    difficulty: 'medium',
    user_id: 'test',
    rating: 0,
    topics: ['TypeScript'],
    codeExample: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const validCodingQuestion: Question = {
    id: '2',
    question: 'Implement a binary search algorithm',
    content: 'Implement a binary search algorithm',
    answer: '',
    category: 'coding-challenge',
    difficulty: 'hard',
    user_id: 'test',
    rating: 0,
    topics: ['algorithms'],
    codeExample: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  test('Validates proper technical question', () => {
    expect(() => validateQuestion(validTechnicalQuestion)).not.toThrow();
  });

  test('Validates proper coding challenge question', () => {
    expect(() => validateQuestion(validCodingQuestion)).not.toThrow();
  });

  test('Rejects question with short content', () => {
    const q = { ...validTechnicalQuestion, question: 'Short' };
    expect(() => validateQuestion(q)).toThrow('Question content too short');
  });

  test('Rejects generic question', () => {
    const q = { ...validTechnicalQuestion, question: 'Generated question about TypeScript' };
    expect(() => validateQuestion(q)).toThrow('Question is too generic');
  });

  test('Rejects invalid category', () => {
    const q = { ...validTechnicalQuestion, category: 'invalid' };
    expect(() => validateQuestion(q)).toThrow('Invalid question category');
  });

  test('Rejects coding challenge without code example', () => {
    const q = { ...validCodingQuestion, codeExample: false };
    expect(() => validateQuestion(q)).toThrow('Coding challenges must include code examples');
  });

  test('Rejects technical question without answer', () => {
    const q = { ...validTechnicalQuestion, answer: '' };
    expect(() => validateQuestion(q)).toThrow('Answer content missing');
  });
});

describe('Question Generation', () => {
  test('Generates valid technical questions', async () => {
    const questions = await generateQuestions(['TypeScript']);
    questions.forEach(q => {
      expect(() => validateQuestion(q)).not.toThrow();
    });
  });

  test('Generates valid coding challenge questions', async () => {
    const questions = await generateQuestions(['algorithm']);
    questions.forEach(q => {
      expect(() => validateQuestion(q)).not.toThrow();
    });
  });
});
// ROO-AUDIT-TAG :: plan-010-question-generation-remaining.md :: END