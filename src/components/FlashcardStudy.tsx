import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth-context';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  rating: 'easy' | 'normal' | 'hard';
  user_id: string;
}

const FlashcardStudy: React.FC = () => {
  const { user } = useAuth();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [rating, setRating] = useState<'easy' | 'normal' | 'hard'>('normal');
  const [isLoading, setIsLoading] = useState(true);

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

      setFlashcards(data || []);
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
      await supabase
        .from('flashcards')
        .update({ rating: newRating })
        .eq('id', currentFlashcard.id)
        .eq('user_id', user.id);
    } catch (error) {
      console.error('Error updating flashcard rating:', error);
    }

    // Move to next flashcard
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
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
      <div className="flashcard bg-white border rounded shadow p-4 mb-4">
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