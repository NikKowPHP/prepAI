# Current Task: Implement Basic Question Management CRUD Operations

## Task Description
Implement the missing CRUD operations for question management in the Next.js API routes.

## Steps

1. **Add GET endpoint to retrieve questions**
   - Implement GET /api/questions to retrieve all questions for the authenticated user
   - Implement GET /api/questions/[id] to retrieve a single question by ID

2. **Add PUT endpoint to update questions**
   - Implement PUT /api/questions/[id] to update an existing question

3. **Add DELETE endpoint to delete questions**
   - Implement DELETE /api/questions/[id] to delete an existing question

4. **Update route.d.ts with type definitions for all endpoints**

5. **Update tests to cover all CRUD operations**

## Implementation Details

- All endpoints should check for user authentication
- All endpoints should validate input data
- All endpoints should handle errors appropriately
- Use Prisma for database operations