'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import QuestionForm from '@/components/QuestionForm';
import VoiceRecorder from '@/components/VoiceRecorder';

interface Question {
  id: string;
  content: string;
  category: string;
  difficulty: string;
  createdAt: string;
}

const QuestionsPage: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchQuestions = async () => {
      try {
        const response = await fetch('/api/questions');
        if (!response.ok) {
          throw new Error('Failed to fetch questions');
        }
        const data = await response.json();
        setQuestions(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load questions');
        console.error('Fetch error:', err);
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [user, router]);

  const handleAddQuestion = async (content: string, category: string, difficulty: string) => {
    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, category, difficulty }),
      });

      if (!response.ok) {
        throw new Error('Failed to add question');
      }

      const newQuestion = await response.json();
      setQuestions((prev) => [newQuestion, ...prev]);
    } catch (err) {
      setError('Failed to add question');
      console.error('Add question error:', err);
    }
  };

  const handleRecordingComplete = async (filePath: string) => {
    // Here we would associate the recording with a question
    // For now, just log it
    console.log('Recording saved at:', filePath);
  };

  if (loading) return <div>Loading questions...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Manage Your Questions</h1>

      <QuestionForm onSubmit={handleAddQuestion} />

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Your Questions</h2>
        {questions.length === 0 ? (
          <p>No questions found. Add a new question above.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {questions.map((question) => (
              <li key={question.id} className="py-4">
                <h3 className="font-semibold">{question.content}</h3>
                <p className="text-gray-600">
                  <span className="font-medium">Category:</span> {question.category} |
                  <span className="font-medium">Difficulty:</span> {question.difficulty} |
                  <span className="font-medium">Added:</span> {new Date(question.createdAt).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Record Your Answer</h2>
        <VoiceRecorder onRecordingComplete={handleRecordingComplete} />
      </div>
    </div>
  );
};

export default QuestionsPage;