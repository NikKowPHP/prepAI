'use client';

import React from 'react';
import ProgressDashboard from '@/components/ProgressDashboard';
import AnalyticsCharts from '@/components/AnalyticsCharts';
import ReportGenerator from '@/components/ReportGenerator';
import ObjectivesList from '@/components/ObjectivesList';

const DashboardPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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