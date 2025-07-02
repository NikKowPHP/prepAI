# API Reference

This document serves as the central reference for all API endpoints in the application.

## Endpoints

### /api/roles
- **Method**: GET
- **Parameters**: None
- **Response**:
  ```json
  {
    "roles": string[]
  }
  ```

### /api/analyze-knowledge-gaps
- **Method**: POST
- **Request Body**:
  ```json
  {
    "questionPerformance": {
      "questionId": string,
      "correct": boolean,
      "timeSpent": number
    }[],
    "userId": string
  }
  ```
- **Response**:
  ```json
  {
    "gaps": string[],
    "suggestedQuestions": {
      "id": string,
      "content": string,
      "difficulty": string
    }[]
  }
  ```

### /api/progress
- **GET Method**:
  - **Parameters**:
    - `range` (optional): string - Time range filter (e.g. "7d", "30d")
    - `type` (optional): string - Metric type filter (e.g. "all", "recent")
  - **Response**:
    ```json
    {
      "metrics": {
        "totalQuestions": number,
        "correctAnswers": number,
        "streakDays": number,
        "lastActive": string
      },
      "analytics": {
        "dailyProgress": {
          "date": string,
          "count": number
        }[],
        "topicBreakdown": {
          "topic": string,
          "correct": number,
          "total": number
        }[]
      }
    }
    ```

- **POST Method**:
  - **Request Body**:
    ```json
    {
      "questionId": string,
      "remembered": boolean
    }
    ```
  - **Response**:
    ```json
    {
      "success": true
    }
    ```

### /api/auth/login
- **Method**: POST
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response**:
  ```json
  {
    "data": {
      "user": {
        "id": string,
        "email": string,
        "user_metadata": object
      },
      "session": {
        "access_token": string,
        "refresh_token": string,
        "expires_in": number
      }
    },
    "error": {
      "message": string,
      "status": number
    } // only present on error
  }
  ```

### /api/auth/register
- **Method**: POST
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response**:
  ```json
  {
    "data": {
      "user": {
        "id": string,
        "email": string,
        "user_metadata": object
      },
      "session": {
        "access_token": string,
        "refresh_token": string,
        "expires_in": number
      }
    },
    "error": {
      "message": string,
      "status": number
    } // only present on error
  }
  ```

### /api/auth/signout
- **Method**: POST
- **Request Body**: None
- **Response**:
  ```json
  {
    "success": boolean
  }
  ```
### /api/generate-question
- **Method**: POST
- **Request Body**:
  ```json
  {
    "topics": string[],
    "difficulty": "easy" | "medium" | "hard",
    "count": number
  }
  ```
- **Response**:
  ```json
  {
    "questions": {
      "id": string,
      "content": string,
      "difficulty": string,
      "topic": string
    }[]
  }
  ```
### /api/generate-report
- **GET Method**:
  - **Parameters**: None
  - **Response**: `application/pdf` - Returns a PDF report of the user's progress

- **POST Method**:
  - **Request Body**:
    ```json
    {
      "template": "basic" | "detailed" | "professional"
    }
    ```
  - **Response**: `application/pdf` - Returns a PDF report using the specified template
### /api/objectives
- **Method**: POST
- **Request Body**:
  ```json
  {
    "name": string,
    "description": string,
    "topics": string[]
  }
  ```
- **Response**:
  ```json
  {
    "id": string,
    "name": string,
    "description": string,
    "createdAt": string
  }
  ```
### /api/questions
- **GET (All Questions)**:
  - **Parameters**: None
  - **Response**:
    ```json
    {
      "questions": {
        "id": string,
        "content": string,
        "difficulty": string,
        "topic": string,
        "createdAt": string
      }[]
    }
    ```

- **GET (Single Question by ID)**:
  - **Parameters**:
    - `id` (path parameter): string - The question ID
  - **Response**:
    ```json
    {
      "id": string,
      "content": string,
      "difficulty": string,
      "topic": string,
      "createdAt": string
    }
    ```

- **POST**:
  - **Request Body**:
    ```json
    {
      "content": string,
      "difficulty": "easy" | "medium" | "hard",
      "topic": string
    }
    ```
  - **Response**:
    ```json
    {
      "id": string,
      "content": string,
      "difficulty": string,
      "topic": string,
      "createdAt": string
    }
    ```

- **PUT**:
  - **Parameters**:
    - `id` (path parameter): string - The question ID to update
  - **Request Body**:
    ```json
    {
      "content": string,
      "difficulty": "easy" | "medium" | "hard",
      "topic": string
    }
    ```
  - **Response**:
    ```json
    {
      "id": string,
      "content": string,
      "difficulty": string,
      "topic": string,
      "updatedAt": string
    }
    ```

- **DELETE**:
  - **Parameters**:
    - `id` (path parameter): string - The question ID to delete
  - **Response**:
    ```json
    {
      "success": boolean
    }
    ```

- **PATCH**:
  - **Parameters**:
    - `id` (path parameter): string - The question ID to update
  - **Request Body**:
    ```json
    {
      "content"?: string,
      "difficulty"?: "easy" | "medium" | "hard",
      "topic"?: string
    }
    ```
  - **Response**:
    ```json
    {
      "id": string,
      "content": string,
      "difficulty": string,
      "topic": string,
      "updatedAt": string
    }
    ```
### /api/readiness
- **Method**: GET
- **Parameters**: None
- **Response**:
  ```json
  {
    "overall": {
      "score": number,
      "level": "beginner" | "intermediate" | "advanced",
      "nextReviewDate": string
    },
    "breakdown": {
      "topic": string,
      "score": number,
      "lastReviewed": string
    }[]
  }
  ```
### /api/voice-processing
- **Method**: POST
- **Request Body**:
  ```json
  {
    "filePath": string,
    "expectedAnswer": string
  }
  ```
- **Response**:
  ```json
  {
    "transcription": string,
    "score": number,
    "feedback": string
  }
  ```