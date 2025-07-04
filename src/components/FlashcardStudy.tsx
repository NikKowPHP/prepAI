import React, { useState, useEffect } from 'react';
import { prisma } from '@/lib/db';
import { useAuth } from '../lib/auth-context';
import { getStudyModeQuestions } from '../lib/srs';
import type { Question } from '@prisma/client';

const FlashcardStudy: React.FC = () => {
  const { user } = useAuth();
  const [flashcards, setFlashcards] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [rating, setRating] = useState<'easy' | 'normal' | 'hard'>('normal');
  const [isLoading, setIsLoading] = useState(true);
  const [queueType, setQueueType] = useState<'new' | 'recent'>('new');

  useEffect(() => {
    if (user) {
      fetchFlashcards(user.id);
    }
  }, [user, queueType]);

  const fetchFlashcards = async (userId: string) => {
    setIsLoading(true);
    try {
      const data = await prisma.question.findMany({
        where: { userId },
      });

      const fetchedQuestions: Question[] = (data || []).map((q: Question) => ({
        ...q,
        createdAt: new Date(q.createdAt),
        updatedAt: new Date(q.updatedAt),
        lastReviewed: q.lastReviewed ? new Date(q.lastReviewed) : null,
        lastStruggledAt: q.lastStruggledAt ? new Date(q.lastStruggledAt) : null,
      }));

      const { newQuestions, recentQuestions } = getStudyModeQuestions(fetchedQuestions);

      setFlashcards(queueType === 'new' ? newQuestions : recentQuestions);
      setCurrentIndex(0);
    } catch (err) {
      console.error('Error fetching questions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const currentFlashcard = flashcards[currentIndex];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleRate = async (newRating: 'easy' | 'normal' | 'hard') => {
    if (!user || !currentFlashcard) return;

    setRating(newRating);
    
    try {
      await prisma.question.update({
        where: { id: currentFlashcard.id },
        data: {
          lastReviewed: new Date(),
          reviewCount: currentFlashcard.reviewCount + 1,
          reviewEase: newRating === 'easy' ? Math.min(3.0, currentFlashcard.reviewEase + 0.1) : currentFlashcard.reviewEase,
          reviewInterval: newRating === 'easy' ? currentFlashcard.reviewInterval * 1.2 : currentFlashcard.reviewInterval * 0.8,
          struggleCount: newRating === 'hard' ? currentFlashcard.struggleCount + 1 : currentFlashcard.struggleCount,
          lastStruggledAt: newRating === 'hard' ? new Date() : currentFlashcard.lastStruggledAt,
        }
      });
      
      fetchFlashcards(user.id);

    } catch (error) {
      console.error('Error updating question rating:', error);
    }

    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      fetchFlashcards(user.id);
    }
    setIsFlipped(false);
  };

  if (isLoading) {
    return <div>Loading flashcards...</div>;
  }

  if (flashcards.length === 0) {
    return <div>No flashcards available. Please add some flashcards.</div>;
  }

  return (
    <div className="p-4 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">Flashcard Study</h2>
      <div className="mb-4 flex space-x-4">
        <button
          onClick={() => setQueueType('new')}
          className={`px-4 py-2 rounded ${queueType === 'new' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          New Questions
        </button>
        <button
          onClick={() => setQueueType('recent')}
          className={`px-4 py-2 rounded ${queueType === 'recent' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Recent Questions
        </button>
      </div>
      {/* Removed nextReviewDate display as it's no longer explicitly managed here */}
      <div
        className="flashcard bg-white border-4 rounded shadow p-4 mb-4 relative"
        style={{
          borderColor: `rgba(255, 0, 0, ${Math.min(0.8, currentFlashcard.struggleCount / 5)})`,
          borderWidth: `${Math.min(4, 1 + currentFlashcard.struggleCount)}px`
        }}
      >
        <div className="struggle-indicator absolute top-2 right-2">
          <div className="flex items-center bg-red-100 rounded-lg p-2">
            <svg
              className="w-5 h-5 text-red-600 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span className="text-red-600 font-semibold">
              {currentFlashcard.struggleCount}
            </span>
          </div>
          <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-red-600 h-1.5 rounded-full"
              style={{ width: `${Math.min(100, currentFlashcard.struggleCount * 20)}%` }}
            ></div>
          </div>
          {currentFlashcard.lastStruggledAt && (
            <div className="text-xs text-gray-500 mt-1">
              Last: {new Date(currentFlashcard.lastStruggledAt).toLocaleDateString()}
            </div>
          )}
        </div>
        <div className="question text-lg font-semibold mb-2">
          {isFlipped ? currentFlashcard.answer : currentFlashcard.content}
        </div>
        <button
          onClick={handleFlip}
          className="bg-blue-500 text-white px-4 py-2 rounded mb-2"
        >
          {isFlipped ? 'Hide Answer' : 'Show Answer'}
        </button>
        {isFlipped && (
          <div className="ratings mb-2">
            <button
              onClick={() => handleRate('easy')}
              className={`px-2 py-1 rounded mr-2 ${rating === 'easy' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
            >
              Easy
            </button>
            <button
              onClick={() => handleRate('normal')}
              className={`px-2 py-1 rounded mr-2 ${rating === 'normal' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Normal
            </button>
            <button
              onClick={() => handleRate('hard')}
              className={`px-2 py-1 rounded ${rating === 'hard' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
            >
              Hard
            </button>
          </div>
        )}
      </div>
      <p className="text-sm text-gray-600">
        {currentIndex + 1} of {flashcards.length}
      </p>
    </div>
  );
};