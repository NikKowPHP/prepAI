'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { progressService } from '@/lib/progress';

interface ProgressMetrics {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  masteryScore: number;
  nextReviewDates: { [questionId: string]: Date };
}

const ProgressDashboard: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<ProgressMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;

    const fetchMetrics = async () => {
      try {
        const userMetrics = await progressService.getUserMetrics(user.id);
        setMetrics(userMetrics);
      } catch (err) {
        setError('Failed to load progress metrics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [user]);

  if (!user) {
    return <div>Please log in to view your progress.</div>;
  }

  if (loading) {
    return <div>Loading progress metrics...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!metrics) {
    return <div>No progress data available.</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Your Progress</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-gray-100 rounded-md">
          <h3 className="font-semibold mb-2">Total Questions</h3>
          <p className="text-3xl">{metrics.totalQuestions}</p>
        </div>
        <div className="p-4 bg-gray-100 rounded-md">
          <h3 className="font-semibold mb-2">Correct Answers</h3>
          <p className="text-3xl">{metrics.correctAnswers}</p>
        </div>
        <div className="p-4 bg-gray-100 rounded-md">
          <h3 className="font-semibold mb-2">Incorrect Answers</h3>
          <p className="text-3xl">{metrics.incorrectAnswers}</p>
        </div>
        <div className="p-4 bg-gray-100 rounded-md">
          <h3 className="font-semibold mb-2">Mastery Score</h3>
          <p className="text-3xl">{metrics.masteryScore}%</p>
        </div>
      </div>
      <div className="mt-6">
        <h3 className="font-semibold mb-2">Next Reviews</h3>
        {metrics.nextReviewDates && Object.keys(metrics.nextReviewDates).length > 0 ? (
          <ul>
            {Object.entries(metrics.nextReviewDates).map(([questionId, date]) => (
              <li key={questionId}>
                Question {questionId.substring(0, 6)}... - {new Date(date).toLocaleDateString()}
              </li>
            ))}
          </ul>
        ) : (
          <p>No questions scheduled for review at this time.</p>
        )}
      </div>
    </div>
  );
};

export default ProgressDashboard;