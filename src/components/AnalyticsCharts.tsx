'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { progressService } from '@/lib/progress';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    fill?: boolean;
  }[];
}

const AnalyticsCharts: React.FC = () => {
  const { user } = useAuth();
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const metrics = await progressService.getUserMetrics(user.id);

        // Generate sample data for demonstration
        const days = 30;
        const accuracyData = Array.from({ length: days }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          return {
            date: date.toLocaleDateString(),
            accuracy: Math.random() * (metrics.masteryScore / 100),
          };
        });

        setChartData({
          labels: accuracyData.map(d => d.date),
          datasets: [
            {
              label: 'Accuracy Over Time',
              data: accuracyData.map(d => d.accuracy * 100),
              borderColor: 'rgba(75, 192, 192, 1)',
              fill: false,
            },
          ],
        });
      } catch (err) {
        setError('Failed to load analytics data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (!user) {
    return <div>Please log in to view analytics.</div>;
  }

  if (loading) {
    return <div>Loading analytics data...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!chartData) {
    return <div>No analytics data available.</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-gray-100 rounded-md">
          <h3 className="font-semibold mb-2">Accuracy Over Time</h3>
          <Line data={chartData} />
        </div>
        {/* Add more charts here */}
      </div>
    </div>
  );
};

export default AnalyticsCharts;