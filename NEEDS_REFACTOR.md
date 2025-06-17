# Refactor Needed: Test Failures in questions/route.test.ts

## Issues Found:
1. **POST /api/questions should create a new question with valid data**
   - Expected status: 201 (Created)
   - Received status: 200 (OK)

2. **POST /api/questions should return 400 if missing required fields**
   - Expected status: 400 (Bad Request)
   - Received status: 200 (OK)

3. **POST /api/questions should return 500 on database error**
   - Expected status: 500 (Internal Server Error)
   - Received status: 200 (OK)

## Recommended Actions:
- Review the implementation of POST /api/questions in route.ts
- Ensure correct HTTP status codes are returned for each scenario
- Verify database error handling