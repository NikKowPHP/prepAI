import React, { useState } from 'react';

interface Flashcard {
  question: string;
  answer: string;
  rating: 'easy' | 'normal' | 'hard';
}

const FlashcardStudy: React.FC = () => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([
    { question: 'What is the capital of France?', answer: 'Paris', rating: 'normal' },
    { question: 'What is 2 + 2?', answer: '4', rating: 'normal' },
    { question: 'What is the boiling point of water?', answer: '100°C', rating: 'normal' },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [rating, setRating] = useState<'easy' | 'normal' | 'hard'>('normal');

  const currentFlashcard = flashcards[currentIndex];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleRate = (newRating: 'easy' | 'normal' | 'hard') => {
    setRating(newRating);
    const updatedFlashcards = [...flashcards];
    updatedFlashcards[currentIndex].rating = newRating;
    setFlashcards(updatedFlashcards);

    // Move to next flashcard
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
    setIsFlipped(false);
  };

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