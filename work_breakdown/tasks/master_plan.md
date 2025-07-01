Of course. Based on my comprehensive analysis and the AI-ready task lists I previously generated, I will now create a single, aggregated, and highly detailed master implementation plan.

This plan breaks down every remaining task into atomic, verifiable steps suitable for your Developer AI agent. It prioritizes critical fixes first, followed by a logical progression of feature implementation, from backend logic to frontend UI.

Here is the master implementation plan:

---

### **`work_breakdown/master_implementation_plan.md`**

**Objective:** To complete all remaining development tasks for the PrepAI application by following a detailed, step-by-step guide. This plan aggregates all pending work into a single, ordered checklist.

**Legend:**
- `[ ]` = A pending task for the Developer AI to execute.

---

### **Part 1: Critical - Unified Type Implementation (plan-015)**

**Goal:** Eliminate type inconsistencies across the codebase to ensure stability and prevent future errors. This is the highest priority.

-   [x] **Task 1.1: Refactor the Spaced Repetition System (`srs.ts`)**
    -   [x] Open `src/lib/srs.ts`.
    -   [x] Add the unified `Question` type import from Prisma at the top: `import type { Question } from '@prisma/client';`.
    -   [x] Find and delete the local, redundant `SRSQuestion` interface definition.
    -   [x] Perform a file-wide search and replace for all instances of the type `SRSQuestion` and change them to `Question`.
    -   [x] Carefully review every function signature (e.g., `calculateNextReview`, `getRepeatModeQuestions`) to ensure they now use the imported `Question` type from Prisma.
    -   [x] Verify that all property access within these functions now aligns with the `Question` model in `prisma/schema.prisma` (e.g., use `question.reviewCount` instead of a potentially different local property name).

-   [x] **Task 1.2: Align the Questions API Route (`questions/route.ts`)**
    -   [x] Open `src/app/api/questions/route.ts`.
    -   [x] Add the Prisma `Question` type import: `import type { Question } from '@prisma/client';`.
    -   [x] In the `GET` function, ensure the final `NextResponse.json()` call for multiple questions is typed correctly: `return NextResponse.json(questions as Question[]);`.
    -   [x] In the `POST` function, review the `data` object for `prisma.question.create` to ensure all fields match the `Question` model.
    -   [x] In the `PUT` function, review the `data` object for `prisma.question.update` to ensure all fields are valid `Question` model fields.

-   [x] **Task 1.3: Update End-to-End Tests (`srsWorkflow.test.ts`)**
    -   [x] Open `tests/e2e/srsWorkflow.test.ts`.
    -   [x] Remove the local `ExtendedQuestion` interface definition.
    -   [x] Import the `Question` type from `@prisma/client`.
    -   [x] In the `testQuestions` array, update each test question object to strictly conform to the Prisma `Question` model. Pay close attention to ensuring all required fields (`id`, `userId`, `content`, `answer`, etc.) are present and correctly named.
    -   [x] Ensure all functions being tested (e.g., `getQuestionsByMode`) are called with data that matches the `Question[]` type.

---

### **Part 2: Feature - Spaced Repetition System (SRS) Modes (plan-005, plan-012)**

**Goal:** Implement the logic for the three SRS modes and connect them to the UI.

-   [x] **Task 2.1: Implement Advanced "Repeat Mode" Logic**
    -   [x] Open `src/lib/srs.ts`.
    -   [x] Create a new private helper function: `calculateQuestionWeight(question: Question): number`.
    -   [x] Implement the weighting formula inside this function. The weight should increase for questions with a higher `struggleCount` and more recent `lastStruggledAt` date, and decrease for questions with a higher `reviewEase`.
    -   [x] Modify the `getRepeatModeQuestions` function to use `calculateQuestionWeight` to sort the filtered questions, ensuring the most problematic questions appear first.

-   [x] **Task 2.2: Implement "Study Mode" Queue Logic**
    -   [x] Open `src/lib/srs.ts`.
    -   [x] Modify the `getStudyModeQuestions` function to return an object with two distinct queues: `{ newQuestions: Question[], recentQuestions: Question[] }`.
    -   [x] Implement the filter logic: `newQuestions` should contain questions where `reviewCount` is 0. `recentQuestions` should contain questions where `reviewCount` is greater than 0 but less than or equal to 3.

-   [x] **Task 2.3: Integrate Study Mode Queues into the UI**
    -   [x] Open `src/components/FlashcardStudy.tsx`.
    -   [x] Add a new state to manage which queue is active: `const [queueType, setQueueType] = useState<'new' | 'recent'>('new');`.
    -   [x] Add two UI buttons, "New Questions" and "Recent Questions," which update the `queueType` state when clicked.
    -   [x] In the `fetchFlashcards` function, call `getStudyModeQuestions` and store both returned queues.
    -   [x] Based on the `queueType` state, set the component's main `flashcards` state to either the `newQuestions` array or the `recentQuestions` array, which will cause the UI to display the correct set of cards.

---

### **Part 3: Feature - Readiness Estimation (plan-008, plan-018)**

**Goal:** Create the API endpoint and UI components to display the user's interview readiness score.

-   [x] **Task 3.1: Create the Readiness API Endpoint**
    -   [x] Create a new directory and file: `src/app/api/readiness/route.ts`.
    -   [x] Implement an asynchronous `GET` function in this file.
    -   [x] Inside `GET`, use the Supabase helper to get the authenticated `user`. Return a 401 error if not found.
    -   [x] Import `calculateReadiness` from `src/lib/readiness.ts`.
    -   [x] Call `await calculateReadiness(user.id)` and store the result.
    -   [x] Return the result in a `NextResponse.json()` call.

-   [x] **Task 3.2: Create the Readiness Indicator UI Component**
    -   [x] Create a new file: `src/components/ReadinessIndicator.tsx`.
    -   [x] This must be a `"use client";` component.
    -   [x] It should accept a `score: number` as a prop.
    -   [x] The component should render a `div` that displays the score.
    -   [x] Add conditional Tailwind CSS classes to change the text color based on the score: `text-red-500` for scores below 50, `text-yellow-500` for scores between 50-80, and `text-green-500` for scores above 80.

-   [x] **Task 3.3: Integrate Readiness Indicator into the Dashboard**
    -   [ ] Open `src/app/dashboard/page.tsx`.
    -   [ ] Add a new state to hold the score: `const [readinessScore, setReadinessScore] = useState<number | null>(null);`.
    -   [ ] Use a `useEffect` hook to `fetch('/api/readiness')` when the component mounts.
    -   [ ] On a successful response, parse the JSON and update the `readinessScore` state.
    -   [ ] Import the `ReadinessIndicator` component.
    -   [ ] In the JSX, conditionally render the `ReadinessIndicator` component, passing `readinessScore` as a prop only if it's not null.

---

### **Part 4: Feature - Progress Analytics UI (plan-006)**

**Goal:** Enhance the analytics dashboard with more detailed visualizations.

-   [x] **Task 4.1: Implement Strength/Weakness Chart**
    -   [ ] Open `src/components/AnalyticsCharts.tsx`.
    -   [ ] Add a new chart using the `react-chartjs-2` library. This should be a `Bar` chart.
    -   [ ] The data for this chart should be derived from the user's performance by topic. This may require updating the data fetching logic in `src/lib/progress.ts` to include a `groupBy('topic')` aggregation.
    -   [ ] The bar chart should display each topic on the x-axis and the mastery score for that topic on the y-axis.

-   [x] **Task 4.2: Implement Struggle Heatmap**
    -   [ ] Open `src/components/ProgressDashboard.tsx`.
    -   [ ] Add a new section for a "Struggle Heatmap".
    -   [ ] The data will come from `metrics.struggleData` (this may require adding this field to the `progress.ts` service).
    -   [ ] Render a grid of `div`s (e.g., a 7-column grid representing days of the week).
    -   [ ] Use inline styles or conditional classes to set the `backgroundColor` of each `div` based on the number of struggles on that day, creating a heatmap effect (e.g., `rgba(255, 0, 0, ${opacity})`).

---

### **Part 5: Feature - Voice Answering UI (plan-004)**

**Goal:** Improve the user experience of the voice recorder with visual feedback.

-   [x] **Task 5.1: Implement Audio Waveform Visualization**
    -   [ ] Open `src/components/VoiceRecorder.tsx`.
    -   [ ] In the `startRecording` function, after getting the `stream`, create an `AudioContext` and an `AnalyserNode`.
    -   [ ] Create a new function `drawWaveform`.
    -   [ ] Inside `drawWaveform`, use `requestAnimationFrame` to create a loop.
    -   [ ] In the loop, get the time-domain data from the `analyserNode` using `getByteTimeDomainData`.
    -   [ ] Use the `canvasRef` to get the 2D context and draw the waveform data onto the canvas, clearing it on each frame.
    -   [ ] Ensure `cancelAnimationFrame` is called in the `stopRecording` function to end the loop.