import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getObjectives } from '@/lib/objectives';

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

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-xl font-semibold mb-4">Your Learning Objectives</h2>
      {objectives.length === 0 ? (
        <p className="text-gray-500">No objectives created yet.</p>
      ) : (
        <ul className="space-y-3">
          {objectives.map((objective) => (
            <li key={objective.id} className="p-3 bg-gray-50 rounded-md">
              <h3 className="font-medium">{objective.name}</h3>
              {objective.description && (
                <p className="text-gray-600 mt-1">{objective.description}</p>
              )}
              <p className="text-sm text-gray-400 mt-2">
                Created: {objective.createdAt.toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ObjectivesList;