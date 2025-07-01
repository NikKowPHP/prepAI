Of course. Based on my findings, I will construct a new master plan. This plan is designed to be executed sequentially by your Developer AI. It prioritizes fixing the project's documentation to match reality, then implements the missing features, and concludes with a final update to the architecture map.

Each task is atomic and provides explicit instructions to ensure the AI can complete it without ambiguity.

Here is the master implementation plan.

---

### **`work_breakdown/tasks/master_plan.md`**

**Objective:** To fix all outstanding issues, implement missing features, and bring the PrepAI application to a complete, runnable state. This plan supersedes all previous plans.

**Legend:**
- `[ ]` = A pending task for the Developer AI to execute.

---

### **Part 1: Plan Synchronization and Cleanup**

**Goal:** First, we must correct the existing `master_plan.md` to accurately reflect the work that has already been completed. This ensures the AI has a correct baseline before starting new work.

-   [ ] **Task 1.1: Correct the Master Plan for Completed UI Work**
    -   [ ] Open the file `work_breakdown/tasks/master_plan.md`.
    -   [ ] Find the task: `[ ] Task 2.3: Integrate Study Mode Queues into the UI`. Change it to `[x] Task 2.3: Integrate Study Mode Queues into the UI`.
    -   [ ] Find the task: `[ ] Task 4.2: Implement Struggle Heatmap`. Change it to `[x] Task 4.2: Implement Struggle Heatmap`.
    -   [ ] Find the task: `[ ] Task 5.1: Implement Audio Waveform Visualization`. Change it to `[x] Task 5.1: Implement Audio Waveform Visualization`.
    -   [ ] Save the file.

---

### **Part 2: Feature Implementation - Readiness Estimation**

**Goal:** Implement the "Readiness Estimation" feature, from the backend API to the frontend UI.

-   [ ] **Task 2.1: Create the Readiness API Endpoint**
    -   [ ] Create a new directory and file at `src/app/api/readiness/route.ts`.
    -   [ ] Add the following content to the file. This creates an API endpoint that securely calculates the readiness score for the currently authenticated user.
        ```typescript
        import { NextResponse } from 'next/server';
        import { supabase } from '@/lib/supabase';
        import { calculateReadiness } from '@/lib/readiness';

        export async function GET(request: Request) {
          try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
              return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }

            const readinessScore = await calculateReadiness(user.id);
            return NextResponse.json(readinessScore);

          } catch (error) {
            console.error('Error calculating readiness:', error);
            return NextResponse.json({ error: 'Failed to calculate readiness' }, { status: 500 });
          }
        }
        ```

-   [ ] **Task 2.2: Create the Readiness Indicator UI Component**
    -   [ ] Create a new file at `src/components/ReadinessIndicator.tsx`.
    -   [ ] Add the following content. This is a client-side component that visualizes the readiness score with color-coding.
        ```typescript
        'use client';

        import React from 'react';

        interface ReadinessIndicatorProps {
          score: number;
        }

        const ReadinessIndicator: React.FC<ReadinessIndicatorProps> = ({ score }) => {
          const getColor = () => {
            if (score > 80) return 'text-green-500';
            if (score >= 50) return 'text-yellow-500';
            return 'text-red-500';
          };

          return (
            <div className="p-4 bg-gray-100 rounded-md text-center">
              <h3 className="font-semibold mb-2">Interview Readiness</h3>
              <p className={`text-5xl font-bold ${getColor()}`}>{Math.round(score)}%</p>
              <p className="text-sm text-gray-600 mt-1">AI-based estimation</p>
            </div>
          );
        };

        export default ReadinessIndicator;
        ```

-   [ ] **Task 2.3: Integrate Readiness Indicator into the Dashboard**
    -   [ ] Open the file `src/app/dashboard/page.tsx`.
    -   [ ] Import the new component at the top: `import ReadinessIndicator from '@/components/ReadinessIndicator';`.
    -   [ ] Inside the `DashboardPage` component, add a new state to hold the readiness score:
        ```javascript
        const [readinessScore, setReadinessScore] = React.useState<number | null>(null);
        ```
    -   [ ] Add a `useEffect` hook to fetch the data from the new API endpoint when the component loads. Place this after the state declaration.
        ```javascript
        React.useEffect(() => {
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
        ```
    -   [ ] In the JSX, add the new `ReadinessIndicator` component inside the main `div` grid, preferably near the `ReportGenerator`.
        ```jsx
        <div className="col-span-1 md:col-span-1 lg:col-span-1">
          {readinessScore !== null ? (
            <ReadinessIndicator score={readinessScore} />
          ) : (
            <div className="p-4 bg-gray-100 rounded-md text-center">
              <p>Calculating readiness...</p>
            </div>
          )}
        </div>
        ```

---

### **Part 3: Feature Implementation - Progress Analytics**

**Goal:** Complete the partially-implemented analytics feature by adding the missing chart.

-   [ ] **Task 3.1: Implement Strength/Weakness Bar Chart**
    -   [ ] Open the file `src/components/AnalyticsCharts.tsx`.
    -   [ ] Import `BarElement` from `chart.js` and `Bar` from `react-chartjs-2`.
        ```javascript
        import { Bar } from 'react-chartjs-2';
        import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement } from 'chart.js';
        ```
    -   [ ] Register the new element with ChartJS.
        ```javascript
        ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);
        ```
    -   [ ] Add a new state to hold the data for the bar chart:
        ```javascript
        const [topicChartData, setTopicChartData] = useState<ChartData | null>(null);
        ```
    -   [ ] In the `useEffect` hook, inside the `fetchData` function, after `setChartData`, process the fetched analytics data to create the bar chart data.
        ```javascript
        // Add this inside the try block of fetchData
        const topicMetrics = await progressService.aggregateAnalyticsData(user.id);
        if (topicMetrics && topicMetrics.topicMastery.length > 0) {
            setTopicChartData({
                labels: topicMetrics.topicMastery.map(t => t.topic_id),
                datasets: [{
                    label: 'Mastery by Topic',
                    data: topicMetrics.topicMastery.map(t => t.mastery_level),
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                }]
            });
        }
        ```
    -   [ ] In the JSX, add a new `div` inside the grid to render the `Bar` chart.
        ```jsx
        {topicChartData && (
          <div className="p-4 bg-gray-100 rounded-md">
            <h3 className="font-semibold mb-2">Strengths & Weaknesses by Topic</h3>
            <Bar data={topicChartData} />
          </div>
        )}
        ```

---

### **Part 4: Final Documentation Update**

**Goal:** Mark the project as fully implemented in the architecture map, reflecting the completion of all features.

-   [ ] **Task 4.1: Update Architecture Map**
    -   [ ] Open the file `docs/architecture_map.md`.
    -   [ ] Find the line for "Readiness Estimation". Change `[PLANNED]` to `[IMPLEMENTED]`.
    -   [ ] Verify the line for "Progress Analytics" is marked as `[IMPLEMENTED]`.
    -   [ ] Save the file.