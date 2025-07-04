import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getObjectives, deleteObjective } from '@/lib/objectives';
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

const ObjectivesList: React.FC = () => {
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
          const data = await getObjectives(user.id);
          setObjectives(data);
        } catch (error) {
          console.error('Failed to fetch objectives:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchObjectives();
  }, [user?.id]);

  if (isLoading) {
    return <div>Loading objectives...</div>;
  }

  return ( // Added comment to trigger re-evaluation
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-xl font-semibold mb-4">Your Learning Objectives</h2>
      <div className="space-y-6">
      {/* Objectives list */}
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
                  Created: {objective.createdAt.toLocaleDateString()}
                </p>
                <button
                  onClick={async () => {
                    if (!user) {
                      alert('User not authenticated');
                      return;
                    }
                    
                    if (window.confirm('Are you sure you want to delete this objective?')) {
                      try {
                        setDeletingId(objective.id);
                        await deleteObjective(objective.id, user.id);
                        setObjectives(objectives.filter(obj => obj.id !== objective.id));
                      } catch (error) {
                        console.error('Failed to delete objective:', error);
                        alert('Failed to delete objective');
                      } finally {
                        setDeletingId(null);
                      }
                    }
                  }}
                  disabled={deletingId === objective.id}
                  className="text-red-500 hover:text-red-700 disabled:text-red-300 disabled:cursor-not-allowed"
                >
                  {deletingId === objective.id ? 'Deleting...' : 'Delete'}
                </button>
                  </div>
                </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ObjectivesList;