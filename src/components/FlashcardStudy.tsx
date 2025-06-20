import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth-context';
import { schedulerService } from '../lib/scheduler';

interface FlashcardBase {
  id: string;
  question: string;
  answer: string;
  rating: 'easy' | 'normal' | 'hard';
  user_id: string;
  last_reviewed?: string | null;
  review_interval?: number;
  review_ease?: number;
  reviewCount?: number;
}

interface Flashcard extends FlashcardBase {
  createdAt: Date;
  lastReviewed: Date | null;
  reviewInterval: number;
  reviewEase: number;
  struggleCount: number;
  lastStruggledAt: Date | null;
  totalStruggleTime: number;
}

interface FlashcardQueues {
  newQuestions: Flashcard[];
  recentQuestions: Flashcard[];
}

interface RawFlashcard {
  id: string;
  question: string;
  answer: string;
  rating: 'easy' | 'normal' | 'hard';
  user_id: string;
  created_at?: string;
  last_reviewed?: string | null;
  review_interval?: number;
  review_ease?: number;
  review_count?: number;
  struggle_count?: number;
  last_struggled_at?: string | null;
  total_struggle_time?: number;
}

const FlashcardStudy: React.FC = () => {
  const { user } = useAuth();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [rating, setRating] = useState<'easy' | 'normal' | 'hard'>('normal');
  const [isLoading, setIsLoading] = useState(true);
  const [nextReviewDate, setNextReviewDate] = useState<Date | null>(null);
  const [queueType, setQueueType] = useState<'new' | 'recent'>('new');

  useEffect(() => {
    if (user) {
      fetchFlashcards(user.id);
    }
  }, [user]);

  const fetchFlashcards = async (userId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('flashcards')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching flashcards:', error);
        return;
      }

      // Convert to Flashcard type with defaults
      const flashcards = (data || []).map((f: RawFlashcard): Flashcard => ({
        id: f.id,
        question: f.question,
        answer: f.answer,
        rating: f.rating,
        user_id: f.user_id,
        createdAt: f.created_at ? new Date(f.created_at) : new Date(),
        lastReviewed: f.last_reviewed ? new Date(f.last_reviewed) : null,
        reviewInterval: f.review_interval || 1,
        reviewEase: f.review_ease || 2.5,
        struggleCount: f.struggle_count || 0,
        lastStruggledAt: f.last_struggled_at ? new Date(f.last_struggled_at) : null,
        totalStruggleTime: f.total_struggle_time || 0,
        reviewCount: f.review_count || 0,
      }));

      // Get study mode queues
      const queues: FlashcardQueues = {
        newQuestions: flashcards.filter(f => f.reviewCount === 0),
        recentQuestions: flashcards.filter(f => f.reviewCount && f.reviewCount > 0 && f.reviewCount <= 3)
      };

      // Set initial queue based on state
      setFlashcards(queueType === 'new' ? queues.newQuestions : queues.recentQuestions);
    } catch (err) {
      console.error('Error fetching flashcards:', err);
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
    const updatedFlashcards = [...flashcards];
    updatedFlashcards[currentIndex].rating = newRating;
    setFlashcards(updatedFlashcards);

    // Update rating in database
    try {
      await schedulerService.markQuestionAsReviewed('flashcards', currentFlashcard.id, newRating === 'easy');
      await supabase
        .from('flashcards')
        .update({ rating: newRating })
        .eq('id', currentFlashcard.id)
        .eq('user_id', user.id);

      // Update next review date
      const nextReviewDates = await schedulerService.getNextReviewDates('flashcards', [currentFlashcard.id]);
      setNextReviewDate(nextReviewDates[currentFlashcard.id]);
    } catch (error) {
      console.error('Error updating flashcard rating:', error);
    }

    // Move to next flashcard
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
    setIsFlipped(false);
  };

  useEffect(() => {
    if (currentFlashcard) {
      const fetchNextReview = async () => {
        if (!user) return;

        try {
          const nextReviewDates = await schedulerService.getNextReviewDates('flashcards', [currentFlashcard.id]);
          setNextReviewDate(nextReviewDates[currentFlashcard.id]);
        } catch (err) {
          console.error('Error fetching next review date:', err);
        }
      };

      fetchNextReview();
    }
  }, [currentFlashcard, user]);

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
          onClick={() => {
            setQueueType('new');
            setFlashcards(prev => prev.filter(f => f.reviewCount === 0));
          }}
          className={`px-4 py-2 rounded ${queueType === 'new' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          New Questions
        </button>
        <button
          onClick={() => {
            setQueueType('recent');
            setFlashcards(prev => prev.filter(f => f.reviewCount !== undefined && f.reviewCount > 0 && f.reviewCount <= 3));
          }}
          className={`px-4 py-2 rounded ${queueType === 'recent' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Recent Questions
        </button>
      </div>
      {nextReviewDate && (
        <p className="mb-4">
          Next review: {nextReviewDate.toLocaleDateString()}
        </p>
      )}
      <div
        className="flashcard bg-white border-4 rounded shadow p-4 mb-4 relative"
        style={{
          borderColor: `rgba(255, 0, 0, ${Math.min(0.8, currentFlashcard.struggleCount / 5)})`,
          borderWidth: `${Math.min(4, 1 + currentFlashcard.struggleCount)}px`
        }}
      >
        <div className="difficulty-indicator absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs">
          {currentFlashcard.struggleCount} struggles
        </div>
        <div className="question text-lg font-semibold mb-2">
          {isFlipped ? currentFlashcard.answer : currentFlashcard.question}
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

export default FlashcardStudy;