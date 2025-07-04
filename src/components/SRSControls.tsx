'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { schedulerService } from '@/lib/scheduler';
import { progressService } from '@/lib/progress';
import { createClient } from '@/lib/supabase/client';

type StudyMode = 'repeat' | 'study' | 'discover';

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
  const [studyMode, setStudyMode] = useState<StudyMode>('study'); // Default to study mode
  const [struggleCount, setStruggleCount] = useState(0);
  const [lastStruggledAt, setLastStruggledAt] = useState<Date | null>(null);
  const [totalStruggleTime, setTotalStruggleTime] = useState(0);

  useEffect(() => {
    if (!user || !questionId) return;

    const fetchQuestionData = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('questions')
          .select('last_reviewed, review_interval, review_ease, struggle_count, last_struggled_at, total_struggle_time')
          .eq('id', questionId)
          .single();

        if (error) throw error;

        const nextReviewDates = await schedulerService.getNextReviewDates('questions', [questionId]);
        setNextReviewDate(nextReviewDates[questionId]);
        setStruggleCount(data.struggle_count || 0);
        setLastStruggledAt(data.last_struggled_at ? new Date(data.last_struggled_at) : null);
        setTotalStruggleTime(data.total_struggle_time || 0);
      } catch (err) {
        setError('Failed to load question data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionData();
  }, [user, questionId]);

  const handleReview = async () => {
    if (remembered === null || !user) return;

    setLoading(true);
    try {
      await schedulerService.markQuestionAsReviewed('questions', questionId, remembered);
      await progressService.updateProgressAfterReview(user.id, questionId, remembered);
      onReviewComplete(remembered);

      // Update next review date
      const nextReviewDates = await schedulerService.getNextReviewDates('questions', [questionId]);
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
      
      {/* Struggle Metrics */}
      <div className="mb-4 p-3 bg-white rounded-md shadow-sm">
        <h4 className="font-medium mb-2">Struggle Metrics</h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <p className="font-semibold">{struggleCount}</p>
            <p className="text-gray-600">Times struggled</p>
          </div>
          <div className="text-center">
            <p className="font-semibold">
              {lastStruggledAt ?
                new Date(lastStruggledAt).toLocaleDateString() :
                'Never'
              }
            </p>
            <p className="text-gray-600">Last struggled</p>
          </div>
          <div className="text-center">
            <p className="font-semibold">
              {totalStruggleTime > 0 ?
                `${Math.floor(totalStruggleTime / 60)}m ${totalStruggleTime % 60}s` :
                '0s'
              }
            </p>
            <p className="text-gray-600">Total time</p>
          </div>
        </div>
      </div>

      <div className="mb-2 flex space-x-2">
        <label className="font-medium mr-2">Mode:</label>
        <select
          className="border rounded px-2 py-1"
          value={studyMode}
          onChange={(e) => setStudyMode(e.target.value as StudyMode)}
        >
          <option value="repeat">Repeat</option>
          <option value="study">Study</option>
          <option value="discover">Discover</option>
        </select>
      </div>
      <p className="mb-2">Next review date: {nextReviewDate ? nextReviewDate.toLocaleDateString() : 'Calculating...'}</p>
      <p className="mb-4 font-medium">Current Mode: {studyMode.charAt(0).toUpperCase() + studyMode.slice(1)}</p>
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