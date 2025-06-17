# Test Implementation Fix Plan

## Issue
The test suite uses `node-mocks-http` which creates incompatible request objects. Next.js API routes require `NextRequest` objects with specific properties and methods.

## Solution
Rewrite all tests to use the `NextRequest` constructor instead of `node-mocks-http`. This will ensure the route handler receives properly formatted requests.

## Steps
1. Remove `node-mocks-http` dependency
2. Update all test cases to construct requests using:
   ```ts
   new NextRequest(url, {
     method: 'POST',
     headers: {'Content-Type': 'application/json'},
     body: JSON.stringify(payload)
   })
   ```
3. Remove all `createMocks` imports and usage
4. Add missing import: `import { NextRequest } from 'next/server'`
5. Run tests to verify all status codes are correctly validated

## Verification
- All tests should pass with correct status code assertions
- No more default 200 responses in test results
