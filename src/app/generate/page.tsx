'use client';

import React, { useState } from 'react';
import QuestionGeneratorForm from '@/components/QuestionGeneratorForm';
import RoleSelect from '@/components/RoleSelect';

const GeneratePage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState('');
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <RoleSelect onRoleSelect={(role) => setSelectedRole(role)} />
          <QuestionGeneratorForm selectedRole={selectedRole} />
        </div>
      </div>
    </div>
  );
};

export default GeneratePage;