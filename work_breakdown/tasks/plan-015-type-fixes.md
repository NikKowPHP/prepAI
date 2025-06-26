# Critical Type Fixes

[x] Implement unified Question type in [`src/lib/types/question.ts`](src/lib/types/question.ts)
[ ] Update question generator to use new type in [`src/lib/questionGenerator.ts`](src/lib/questionGenerator.ts)
[ ] Modify SRS system to import shared type in [`src/lib/srs.ts`](src/lib/srs.ts)
[ ] Adjust API routes to align with new type in [`src/app/api/questions/route.ts`](src/app/api/questions/route.ts)
[ ] Update test files to use correct properties in:
    - [`tests/e2e/questionGeneration.test.ts`](tests/e2e/questionGeneration.test.ts)
    - [`src/lib/__tests__/srsModes.test.ts`](src/lib/__tests__/srsModes.test.ts)
[ ] Validate type consistency across entire project