import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';

interface Question {
  id: string;
  text: string;
  type: string;
  options?: string[];
}

interface Objective {
  id: string;
  name: string;
  description?: string | null;
  createdAt: Date;
}

const ObjectivesList = () => {
  const { user } = useAuth();
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const fetchObjectives = async () => {
      if (user?.id) {
        try {
          const response = await fetch('/api/objectives');
          if (!response.ok) {
            throw new Error('Failed to fetch objectives');
          }
          const data = await response.json();
          setObjectives(data);
        } catch (error) {
          console.error('Failed to fetch objectives:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    fetchObjectives();
  }, [user?.id]);

  const handleDelete = async (objectiveId: string) => {
    if (!user) {
      alert('User not authenticated');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this objective?')) {
      try {
        setDeletingId(objectiveId);
        const response = await fetch('/api/objectives', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: objectiveId }),
        });
        if (!response.ok) {
          throw new Error('Failed to delete objective');
        }
        setObjectives(objectives.filter(obj => obj.id !== objectiveId));
      } catch (error) {
        console.error('Failed to delete objective:', error);
        alert('Failed to delete objective');
      } finally {
        setDeletingId(null);
      }
    }
  };

  if (isLoading) {
    return <div>Loading objectives...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-xl font-semibold mb-4">Your Learning Objectives</h2>
      <div className="space-y-6">
        {objectives.length === 0 ? (
          <p className="text-gray-500">No objectives created yet.</p>
        ) : (
          <>
            <button
              onClick={async () => {
                if (!user) {
                  alert('User not authenticated');
                  return;
                }
                
                try {
                  setIsGenerating(true);
                  const topics = objectives.map(obj => obj.name);
                  const response = await fetch('/api/generate-question', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      prompt: 'Generate interview preparation questions',
                      topics: topics,
                      questionType: 'multiple_choice'
                    }),
                  });

                  if (!response.ok) {
                    throw new Error('Failed to generate questions');
                  }

                  const data = await response.json();
                  setGeneratedQuestions(prev => [
                    ...prev,
                    {
                      id: Date.now().toString(),
                      text: data.question,
                      type: data.type,
                      options: data.type === 'multiple_choice' ? ['A', 'B', 'C', 'D'] : []
                    },
                    ...(data.relatedQuestions || []).map((q: string, i: number) => ({
                      id: `${Date.now()}-${i}`,
                      text: q,
                      type: data.type,
                      options: data.type === 'multiple_choice' ? ['A', 'B', 'C', 'D'] : []
                    }))
                  ]);
                } catch (error) {
                  console.error('Error generating questions:', error);
                  alert('Failed to generate questions');
                } finally {
                  setIsGenerating(false);
                }
              }}
              disabled={isGenerating}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {isGenerating ? 'Generating...' : 'Generate Questions'}
            </button>

            <ul className="space-y-3">
              {objectives.map((objective) => (
                <li key={objective.id} className="p-3 bg-gray-50 rounded-md">
                  <h3 className="font-medium">{objective.name}</h3>
                  {objective.description && (
                    <p className="text-gray-600 mt-1">{objective.description}</p>
                  )}
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-sm text-gray-400">
                      Created: {new Date(objective.createdAt).toLocaleDateString()}
                    </p>
                    <button
                      onClick={() => handleDelete(objective.id)}
                      disabled={deletingId === objective.id}
                      className="text-red-500 hover:text-red-700 disabled:text-red-300 disabled:cursor-not-allowed"
                    >
                      {deletingId === objective.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

export default ObjectivesList;