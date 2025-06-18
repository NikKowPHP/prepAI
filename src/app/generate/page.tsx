'use client';

import React from 'react';
import QuestionGeneratorForm from '@/components/QuestionGeneratorForm';

const GeneratePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-12">
        <QuestionGeneratorForm />
      </div>
    </div>
  );
};

export default GeneratePage;