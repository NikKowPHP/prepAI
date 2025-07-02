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

<!-- Module documentation will be added here following the template below:

### module-name.ts
- **Purpose**:
- **Key Functions**:
- **Dependencies**:
-->