# Implementation Plan for Audit Remediation

This document outlines the prioritized engineering tasks required to resolve all findings from the recent code audit. The plan is structured to first correct code-level mismatches and then update documentation to ensure full alignment between the specification and the implementation.

---

### P2 - Correcting Mismatches (Code-Level Fixes)

These tasks involve modifying existing code to match the documented specifications.

- [x] **UPDATE**: Align `/api/roles` response structure to match documentation.
    - **File**: `src/app/api/roles/route.ts`
    - **Action**: Modify the return statement to wrap the `roles` array in an object, so the response is `{ "roles": ["role1", "role2"] }` instead of just `["role1", "role2"]`.
    - **Reason**: Audit finding: API response structure mismatch. Documentation `docs/api_reference.md` specifies an object with a `roles` key.

- [x] **UPDATE**: Align `/api/generate-question` response to return an array.
    - **File**: `src/app/api/generate-question/route.ts`
    - **Action**: Modify the return statement to wrap the generated question object within an array and a parent object, conforming to the documented `{ "questions": [...] }` structure.
    - **Reason**: Audit finding: API response structure mismatch. Documentation `docs/api_reference.md` specifies a `questions` array.

- [x] **UPDATE**: Align `/api/questions` GET response to be wrapped in an object.
    - **File**: `src/app/api/questions/route.ts`
    - **Action**: In the `GET` function, when returning all questions, modify the `NextResponse.json()` call to wrap the `questions` array in an object: `return NextResponse.json({ questions });`.
    - **Reason**: Audit finding: API response structure mismatch. Documentation `docs/api_reference.md` specifies an object with a `questions` key.

- [x] **UPDATE**: Align `/api/questions` DELETE response structure.
    - **File**: `src/app/api/questions/route.ts`
    - **Action**: In the `DELETE` function, change the successful response from `NextResponse.json({ message: '...' })` to `NextResponse.json({ success: true })`.
    - **Reason**: Audit finding: API response structure mismatch. Documentation `docs/api_reference.md` specifies a response of `{ success: boolean }`.

- [x] **REFACTOR**: Refactor `/api/questions` PATCH to perform partial updates.
    - **File**: `src/app/api/questions/route.ts`
    - **Action**: Replace the entire implementation of the `PATCH` function. The new logic should extract the question ID from the URL, parse partial data from the request body (e.g., `content`, `difficulty`, `topic`), and update the corresponding question in the database. The current objective-linking logic should be removed from this method.
    - **Reason**: Audit finding: Major API functionality mismatch. Documentation `docs/api_reference.md` specifies PATCH for partial updates, but the code implements objective linking.

- [x] **UPDATE**: Align `/api/readiness` response structure with documentation.
    - **File**: `src/app/api/readiness/route.ts`
    - **Action**: Modify the final `NextResponse.json()` call to transform the data from `calculateReadiness` into the documented structure: `{ overall: { score, level, nextReviewDate }, breakdown: [...] }`. This will require adding logic to determine `level` and `nextReviewDate`.
    - **Reason**: Audit finding: API response structure mismatch. The code returns a different structure than what is specified in `docs/api_reference.md`.

---

### P3 - Documentation Updates

These tasks involve modifying documentation to reflect the actual, correct implementation in the code.

- [x] **DOCS**: Update API docs for `/api/auth/login` and `/api/auth/register`.
    - **File**: `docs/api_reference.md`
    - **Action**: Modify the response structure documentation for `/api/auth/login` and `/api/auth/register` to reflect that they return the standard Supabase `AuthResponse` object, not a `{ success, user, error }` object.
    - **Reason**: Audit finding: API response mismatch. The code correctly returns the Supabase response, so the documentation should be updated.

- [x] **DOCS**: Update API docs for `/api/objectives` POST response.
    - **File**: `docs/api_reference.md`
    - **Action**: Remove the `topics` array from the documented response structure for creating an objective.
    - **Reason**: Audit finding: API response mismatch. The `Objective` model in the database does not store topics, so the API does not return it.

- [x] **DOCS**: Update API docs for `/api/questions` POST request body.
    - **File**: `docs/api_reference.md`
    - **Action**: Add the `answer` field (string, required) to the documented request body for the `/api/questions` POST endpoint.
    - **Reason**: Audit finding: API request mismatch. The code requires an `answer` field, which is missing from the documentation.

- [ ] **DOCS**: Update API docs for `/api/questions` PUT request body.
    - **File**: `docs/api_reference.md`
    - **Action**: Expand the documented request body for the `/api/questions` PUT endpoint to include all the partial update fields supported by the code, such as `lastReviewed`, `reviewInterval`, `reviewEase`, etc.
    - **Reason**: Audit finding: Incomplete documentation. The code supports many more fields for updates than are listed in the API reference.

- [ ] **DOCS**: Document the `src/lib/auth.ts` module.
    - **File**: `docs/architecture_details.md`
    - **Action**: Add a new section under "Core Modules" for `auth.ts`, explaining its purpose as the business logic wrapper for Supabase authentication functions (`signIn`, `signUp`, `signOut`).
    - **Reason**: Audit finding: Undocumented functionality. This core module is not documented.

- [ ] **DOCS**: Document the `src/lib/auth-context.tsx` module.
    - **File**: `docs/architecture_details.md`
    - **Action**: Add a new section under "Core Modules" for `auth-context.tsx`, describing it as the React Context provider for managing frontend authentication state.
    - **Reason**: Audit finding: Undocumented functionality. This critical frontend component is not documented.

- [ ] **DOCS**: Document the `src/middleware.ts` module.
    - **File**: `docs/architecture_details.md`
    - **Action**: Add a new section under "Core Modules" for `middleware.ts`, explaining its role in protecting routes and managing sessions on the server side using Next.js middleware.
    - **Reason**: Audit finding: Undocumented functionality. This key architectural component is not documented.

- [ ] **DOCS**: Document the `GET_MODE` function in the Questions API.
    - **File**: `docs/api_reference.md`
    - **Action**: Add a new entry under the `/api/questions` endpoint documentation for the `GET /api/questions/mode` variant. Detail its purpose, query parameters (`mode`, `userQuestions`), and response structure.
    - **Reason**: Audit finding: Undocumented functionality. An alternative GET method exists in the code but is not documented.

- [ ] **FIX**: Add clarifying comments to test environment setup.
    - **File**: `jest.setup.ts`
    - **Action**: Add a comment above the `process.env.NEXTAUTH_SECRET` and `process.env.NEXTAUTH_URL` lines, explaining that these are legacy variables for testing and are not used by the main Supabase Auth system.
    - **Reason**: Audit finding: Configuration Mismatch. Clarify the purpose of test-only environment variables to avoid confusion.