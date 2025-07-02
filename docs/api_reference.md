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
    - `userId` (required): string
  - **Response**:
    ```json
    {
      "totalQuestions": number,
      "correctAnswers": number,
      "streakDays": number,
      "lastActive": string
    }
    ```

- **POST Method**:
  - **Request Body**:
    ```json
    {
      "userId": string,
      "questionId": string,
      "correct": boolean
    }
    ```
  - **Response**:
    ```json
    {
      "updated": boolean
    }
    ```

<!-- API endpoints will be documented here following the template below:

### /api/endpoint
- **Method**: [GET/POST/PUT/DELETE]
- **Parameters**:
  - Query:
  - Body:
- **Response":
-->