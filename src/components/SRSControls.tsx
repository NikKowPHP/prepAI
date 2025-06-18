'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { schedulerService } from '@/lib/scheduler';
import { progressService } from '@/lib/progress';

interface SRSControlsProps {
  questionId: string;
  onReviewComplete: (remembered: boolean) => void;
}

const SRSControls: React.FC<SRSControlsProps> = ({ questionId, onReviewComplete }) => {
  const { user } = useAuth();
  const [remembered, setRemembered] = useState<boolean | null>(null);
  const [nextReviewDate, setNextReviewDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || !questionId) return;

    const fetchNextReview = async () => {
      try {
        const nextReviewDates = await schedulerService.getNextReviewDates([questionId]);
        const date = nextReviewDates[questionId];
        setNextReviewDate(date);
      } catch (err) {
        setError('Failed to load next review date');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNextReview();
  }, [user, questionId]);

  const handleReview = async () => {
      if (remembered === null || !user) return;
  
      setLoading(true);
      try {
        await schedulerService.markQuestionAsReviewed(questionId, remembered);
        await progressService.updateProgressAfterReview(user.id, questionId, remembered);
        onReviewComplete(remembered);
  
        // Update next review date
        const nextReviewDates = await schedulerService.getNextReviewDates([questionId]);
        const date = nextReviewDates[questionId];
        setNextReviewDate(date);
      } catch (err) {
        setError('Failed to record review');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

  if (!user) {
    return <div>Please log in to use SRS controls.</div>;
  }

  if (loading) {
    return <div>Loading SRS controls...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="mt-4 p-4 bg-gray-100 rounded-md">
      <h3 className="font-semibold mb-2">Spaced Repetition System</h3>
      <p className="mb-2">Next review date: {nextReviewDate ? nextReviewDate.toLocaleDateString() : 'Calculating...'}</p>
      <div className="flex space-x-4">
        <button
          className={`px-4 py-2 rounded ${remembered === true ? 'bg-green-500 text-white' : 'bg-gray-300'}`}
          onClick={() => setRemembered(true)}
          disabled={loading}
        >
          Remembered
        </button>
        <button
          className={`px-4 py-2 rounded ${remembered === false ? 'bg-red-500 text-white' : 'bg-gray-300'}`}
          onClick={() => setRemembered(false)}
          disabled={loading}
        >
          Forgotten
        </button>
      </div>
      <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        onClick={handleReview}
        disabled={remembered === null || loading}
      >
        Record Review
      </button>
    </div>
  );
};

export default SRSControls;