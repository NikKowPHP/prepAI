'use client';

// ROO-AUDIT-TAG :: plan-002-topic-selection.md :: Verify new objectives appear in question generation interface
import React, { useState } from 'react';
import QuestionGeneratorForm from '@/components/QuestionGeneratorForm';
import RoleSelect from '@/components/RoleSelect';
import ObjectivesList from '@/components/ObjectivesList';

const GeneratePage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState('');
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <RoleSelect onRoleSelect={(role) => setSelectedRole(role)} />
          <ObjectivesList />
          <QuestionGeneratorForm selectedRole={selectedRole} />
        </div>
      </div>
    </div>
  );
};
// ROO-AUDIT-TAG :: plan-002-topic-selection.md :: END

export default GeneratePage;