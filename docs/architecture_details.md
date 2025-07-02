# Architecture Details

This document provides details on key logic modules and architectural decisions.

## Core Modules

### assessment.ts
- **Purpose**: Handles answer validation, score calculation, and feedback generation for user responses
- **Key Functions**:
  - `validateAnswer()`: Compares user response against correct answer
  - `calculateScore()`: Computes performance metrics
  - `generateFeedback()`: Creates personalized feedback based on performance
- **Dependencies**:
  - Question data model
  - User response data structure

### rateLimiter.ts
- **Purpose**: Provides rate limiting for security on authentication endpoints
- **Key Features**:
  - Token bucket algorithm implementation
  - Configurable limits per endpoint
  - Automatic request rejection when limits exceeded
- **Usage**:
  - Applied to all auth-related API routes
  - Configured via environment variables

### transcription.ts
- **Purpose**: Processes voice answers using Google Cloud Speech-to-Text
- **Key Features**:
  - Handles audio file processing
  - Converts speech to text
  - Supports multiple audio formats
- **Dependencies**:
  - Google Cloud Speech-to-Text service
  - Requires Google service account credentials
- **Configuration**:
  - Set via `GOOGLE_CLIENT_EMAIL` and `GOOGLE_PRIVATE_KEY` env vars

### srs.ts
- **Purpose**: Handles SRS logic for question review scheduling and retrieval
- **Key Functions**:
  - `getQuestionsByMode()`: Retrieves questions based on SRS mode (learning, review, etc.)
  - `calculateNextReview()`: Determines optimal next review date based on performance
  - `updateQuestionAfterReview()`: Updates question statistics after a review session
- **Dependencies**:
  - Question data model
  - User performance history
  - Date/time utilities
<!-- Module documentation will be added here following the template below:

### module-name.ts
- **Purpose**:
- **Key Functions**:
- **Dependencies**:
-->
### scheduler.ts
- **Purpose**: Orchestrates SRS scheduling and retrieves questions due for review
- **Key Functions**:
  - `scheduleReviews()`: Creates review schedules based on SRS algorithm
  - `getDueQuestions()`: Retrieves questions that are due for review
  - `rescheduleMissedReviews()`: Handles overdue reviews
- **Dependencies**:
  - SRS module
  - Question data model
  - User performance history
### readiness.ts
- **Purpose**: Calculates a user's interview readiness score based on multiple factors
- **Key Factors Considered**:
  - **Mastery**: Overall question accuracy and topic proficiency
  - **Consistency**: Performance stability over time
  - **Coverage**: Breadth of topics reviewed
  - **Recency**: Time since last review of key topics
- **Output**:
  - Overall readiness score (0-100)
  - Breakdown by topic area
  - Recommended focus areas
### progress.ts
- **Purpose**: Aggregates and analyzes user progress data for dashboards and reports
- **Key Functions**:
  - `getUserMetrics()`: Calculates overall performance statistics
  - `getAnalytics()`: Generates detailed performance breakdowns
  - `getTrends()`: Identifies learning patterns over time
- **Data Sources**:
  - Question review history
  - SRS scheduling data
  - Objective completion tracking
### pdf.ts
- **Purpose**: Generates PDF progress reports for users
- **Key Features**:
  - Creates professional PDF documents from user data
  - Supports customizable report templates
  - Includes charts and visualizations
- **Dependencies**:
  - Progress service data
  - PDF generation library (PDFKit)
  - Chart rendering utilities
### objectives.ts
- **Purpose**: Service layer for CRUD operations on user learning objectives
- **Key Functions**:
  - `createObjective()`: Creates new learning objectives
  - `updateObjective()`: Modifies existing objectives
  - `getObjectives()`: Retrieves user's objectives
  - `deleteObjective()`: Removes objectives
- **Dependencies**:
  - Database client
  - Validation utilities
  - User authentication context
### validation.ts
- **Purpose**: Provides shared validation logic for emails and passwords
- **Key Functions**:
  - `validateEmail()`: Ensures email format is valid
  - `validatePassword()`: Checks password strength requirements
  - `validateUsername()`: Verifies username format
- **Validation Rules**:
  - Emails must match standard regex pattern
  - Passwords require minimum length and complexity
  - Usernames have character restrictions
### AI Service Abstraction (src/lib/ai/)
- **Purpose**: Provides a flexible interface for AI model integration
- **Architecture**:
  - Factory pattern in `index.ts` creates appropriate AI service instances
  - `generation-service.ts` defines the common interface
  - `gemini-service.ts` implements the interface for Google's Gemini model
- **Key Features**:
  - Easy swapping of AI providers
  - Consistent interface across implementations
  - Centralized configuration