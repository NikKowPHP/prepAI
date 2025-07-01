'use client';

import React, { useState, useEffect } from 'react';
import ProgressDashboard from '@/components/ProgressDashboard';
import AnalyticsCharts from '@/components/AnalyticsCharts';
import ReportGenerator from '@/components/ReportGenerator';
import ObjectivesList from '@/components/ObjectivesList';
import ReadinessIndicator from '@/components/ReadinessIndicator';

const DashboardPage: React.FC = () => {
  const [readinessScore, setReadinessScore] = useState<number | null>(null);

  useEffect(() => {
    const fetchReadiness = async () => {
      try {
        const response = await fetch('/api/readiness');
        if (response.ok) {
          const data = await response.json();
          setReadinessScore(data.overall);
        }
      } catch (error) {
        console.error('Failed to fetch readiness score:', error);
      }
    };
    fetchReadiness();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2 lg:col-span-3 mb-4">
          {readinessScore !== null ? (
            <ReadinessIndicator score={readinessScore} />
          ) : (
            <div className="p-4 bg-gray-100 rounded-md text-center">
              <p>Calculating readiness...</p>
            </div>
          )}
        </div>
        <div className="col-span-1 md:col-span-2 lg:col-span-3">
          <ObjectivesList />
        </div>
        <div className="col-span-1 md:col-span-2 lg:col-span-3">
          <ProgressDashboard />
        </div>
        <div className="col-span-1 md:col-span-2 lg:col-span-3">
          <AnalyticsCharts />
        </div>
        <div className="col-span-1 md:col-span-2 lg:col-span-3 mt-6">
          <ReportGenerator />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;