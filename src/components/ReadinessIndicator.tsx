"use client";

import React from 'react';

interface ReadinessIndicatorProps {
  score: number;
}

const ReadinessIndicator: React.FC<ReadinessIndicatorProps> = ({ score }) => {
  let textColor = 'text-red-500';
  if (score >= 50 && score < 80) {
    textColor = 'text-yellow-500';
  } else if (score >= 80) {
    textColor = 'text-green-500';
  }

  return (
    <div className={`font-bold ${textColor}`}>
      Readiness Score: {score}
    </div>
  );
};

export default ReadinessIndicator;