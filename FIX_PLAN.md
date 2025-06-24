# Emergency Fix Plan: API Test Failures

## Diagnosis
The API tests are failing due to incomplete implementation of SRS mode functionality in the questions API route. The `GET_MODE` endpoint was partially implemented but:
1. Not properly exported in `src/app/api/questions/route.ts`
2. Not covered by tests in `src/app/api/questions/route.test.ts`
3. References missing Prisma fields (`reviewEase`, `reviewInterval`)

## Fix Steps

### 1. Update Prisma Schema
Add required SRS fields to the Question model in `prisma/schema.prisma`:

```prisma
model Question {
  id             String   @id @default(cuid())
  content        String
  category       String
  difficulty     String
  userId         String
  createdAt      DateTime @default(now())
  // Add SRS fields below
  reviewEase     Float?   @default(2.5)
  reviewInterval Int?     @default(1)
  lastReviewed   DateTime?
}
```

### 2. Fix API Route Exports
Update `src/app/api/questions/route.ts` to properly export the GET_MODE function:

```typescript
// Add this to the exports at the bottom of the file
export { GET_MODE as GET } from '@/lib/srs'; // Update path as needed
```

### 3. Create Comprehensive Tests
Add tests for the SRS mode endpoint in `src/app/api/questions/route.test.ts` covering:
- All SRS modes (repeat, study, discover)
- Authentication requirements
- Edge cases (empty question banks, invalid modes)

### 4. Generate Prisma Migration
Run migration after schema changes:
```bash
npx prisma migrate dev --name add_srs_fields
```

### 5. Update Test Setup
Ensure test database is reset before running SRS mode tests.

## Verification
1. Run all API tests: `npm test src/app/api/questions/route.test.ts`
2. Confirm all tests pass, including new SRS mode tests
3. Check API functionality via Postman/curl for all endpoints

## Implementation Notes
- Estimated time: 2 hours
- Risk: Medium (requires database migration)
- Dependencies: Prisma migration must be run before tests will pass