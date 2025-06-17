# Refactor API Route Status Codes

## Objective
Fix HTTP status codes in POST /api/questions route to match test expectations:
- 201 Created on successful question creation
- 400 Bad Request for missing/invalid fields
- 500 Internal Server Error on database errors

## Steps
1. **Analyze Current Implementation**
   - Review route.ts response status codes
   - Identify any missing or incorrect status codes

2. **Update Status Codes**
   - Ensure successful creation returns 201
   - Validate all error cases return correct codes:
     - 400 for missing/invalid fields
     - 500 for database errors

3. **Verify Tests**
   - Confirm tests correctly expect the updated status codes
   - Ensure mocks are properly set up for each scenario

4. **Run Tests**
   - Execute tests to validate fixes
   - Confirm all tests pass with correct status codes

## Workflow
This is a (LOGIC) task. Follow TDD cycle:
1. RED: Confirm current tests fail as expected
2. GREEN: Update route.ts to return correct status codes
3. REFACTOR: Clean up code while maintaining behavior