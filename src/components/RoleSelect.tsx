import React, { useState } from 'react';

interface RoleSelectProps {
  onRoleSelect: (role: string) => void;
}

const RoleSelect: React.FC<RoleSelectProps> = ({ onRoleSelect }) => {
  const [selectedRole, setSelectedRole] = useState('');
  // Temporary roles - will be replaced with API data later
  const roles = [
    'Software Engineer',
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'DevOps Engineer'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const role = e.target.value;
    setSelectedRole(role);
    onRoleSelect(role);
  };

  return (
    <div className="mb-4">
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
        {roles.map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </select>
    </div>
  );
};

export default RoleSelect;