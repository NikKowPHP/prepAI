import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import TopicFilter from './TopicFilter';

interface RoleSelectProps {
  onRoleSelect: (role: string) => void;
  onNewObjective?: (objective: { name: string; description: string }) => void;
  onTopicsChange?: (topics: string[]) => void;
}

const RoleSelect: React.FC<RoleSelectProps> = ({ onRoleSelect, onNewObjective, onTopicsChange }) => {
  const [selectedRole, setSelectedRole] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newObjectiveName, setNewObjectiveName] = useState('');
  const [newObjectiveDescription, setNewObjectiveDescription] = useState('');
  
  const [roles, setRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    
    const fetchRoles = async () => {
      try {
        const response = await fetch('/api/roles', {
          signal: controller.signal
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch roles');
        }
        
        const data = await response.json();
        setRoles(data);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch roles');
          // Fallback to default roles if API fails
          setRoles([
            'Software Engineer',
            'Frontend Developer',
            'Backend Developer',
            'Full Stack Developer',
            'DevOps Engineer'
          ]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchRoles();
    
    return () => {
      controller.abort();
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const role = e.target.value;
    setSelectedRole(role);
    onRoleSelect(role);
  };

  const handleNewObjective = () => {
    if (onNewObjective && newObjectiveName) {
      onNewObjective({
        name: newObjectiveName,
        description: newObjectiveDescription
      });
      setNewObjectiveName('');
      setNewObjectiveDescription('');
      setIsModalOpen(false);
    }
  };

  return (
    <div className="mb-4 space-y-4">
      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
          Interview Role
        </label>
        <select
          id="role"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={selectedRole}
          onChange={handleChange}
          required
        >
          <option value="">Select a role</option>
          {isLoading ? (
            <option value="" disabled>Loading roles...</option>
          ) : error ? (
            <option value="" disabled>{error}</option>
          ) : (
            roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))
          )}
        </select>
      </div>
  
      {onTopicsChange && (
        <TopicFilter
          onTopicsChange={onTopicsChange}
        />
      )}
  
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
      >
        Create New Objective
      </button>

      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="fixed inset-0 z-10 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div className="relative bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <Dialog.Title className="text-lg font-medium mb-4">
              Create New Objective
            </Dialog.Title>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Objective Name
                </label>
                <input
                  type="text"
                  value={newObjectiveName}
                  onChange={(e) => setNewObjectiveName(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter objective name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newObjectiveDescription}
                  onChange={(e) => setNewObjectiveDescription(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter objective description"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleNewObjective}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  Create Objective
                </button>
              </div>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default RoleSelect;