### **Summary of the Engineering Plan**

This engineering plan directly addresses all findings from the recent AI Software Audit. The primary goal is to achieve 100% alignment between the codebase and its supporting documentation, resolving all identified discrepancies and gaps.

The plan is structured into prioritized phases:
*   **P0 & P1:** These phases are empty, as the audit found no critical bugs or missing features.
*   **P2 - Correcting Mismatches:** This phase focuses on a small number of code-level fixes where the implementation is inconsistent with the documented specification or contains unused configuration.
*   **P3 - Documentation Updates:** This is the largest phase, aimed at comprehensively updating the project's documentation to reflect the current state of the implemented code. This will involve documenting numerous API endpoints and core logic modules that were previously un-documented.

By executing this plan atomically, the project will be left in a state of high maintainability, clarity, and compliance.

---

### **P0 - Critical Code Fixes**

*No tasks in this category. The audit did not identify any critical code bugs or logical errors.*

---

### **P1 - Implementation of Missing Features**

*No tasks in this category. The audit confirmed that all documented features are present in the codebase.*

---

### **P2 - Correcting Mismatches**

- [x] **FIX**: Correct the response structure for the knowledge gaps API.
    - **File**: `src/app/api/analyze-knowledge-gaps/route.ts`
    - **Action**: Modify the response of the `POST` function. The `suggestedQuestions` field should return an array of question IDs (`string[]`), not an array of objects. *Correction based on re-evaluation: The code's return of `string[]` is less useful than the documented object structure. Modify the code to return an array of objects `{ id: string, content: string, difficulty: string }` as specified in the docs.* This will involve fetching the question details for the suggested IDs.
    - **Reason**: Audit finding: Incorrect response structure for `/api/analyze-knowledge-gaps`. The code implementation returns an array of strings, while the documentation specifies an array of objects.

- [ ] **FIX**: Remove unused `DEBUG_MODE` environment variable from documentation.
    - **File**: `README.md`
    - **Action**: Remove the line `- DEBUG_MODE=true` from the environment variable configuration example.
    - **Reason**: Audit finding: Documented, Not Used. The `DEBUG_MODE` variable is mentioned in documentation but is not used anywhere in the codebase.

---

### **P3 - Documentation Updates**

- [ ] **DOCS**: Update documentation for the `GET /api/progress` endpoint.
    - **File**: `docs/api_reference.md`
    - **Action**: Modify the documentation for `GET /api/progress`. Remove the `userId` parameter. Document the optional query parameters `range` and `type`. Update the response structure to reflect the actual output: `{ metrics, analytics }`, and describe the shape of those objects.
    - **Reason**: Audit finding: Incorrect parameters and response structure for `GET /api/progress`. The code has evolved beyond the documentation.

- [ ] **DOCS**: Update documentation for the `POST /api/progress` endpoint.
    - **File**: `docs/api_reference.md`
    - **Action**: Modify the documentation for `POST /api/progress`. Update the request body to `{ questionId, remembered }`. Update the success response to be `{ "success": true }`.
    - **Reason**: Audit finding: Incorrect request body and response structure for `POST /api/progress`.

- [ ] **DOCS**: Document the core Authentication API endpoints.
    - **File**: `docs/api_reference.md`
    - **Action**: Add new sections for the `/api/auth/login`, `/api/auth/register`, and `/api/auth/signout` endpoints. For each, document the HTTP method (POST), expected request body (e.g., `{email, password}`), and potential success/error responses.
    - **Reason**: Audit finding: Undocumented Functionality (`/api/auth/{login, register, signout}`).

- [ ] **DOCS**: Document the AI Question Generation API endpoint.
    - **File**: `docs/api_reference.md`
    - **Action**: Add a new section for the `/api/generate-question` endpoint. Document its HTTP method (POST), expected request body (`{ topics, difficulty, count }`), and response format.
    - **Reason**: Audit finding: Undocumented Functionality (`/api/generate-question`).

- [ ] **DOCS**: Document the PDF Report Generation API endpoint.
    - **File**: `docs/api_reference.md`
    - **Action**: Add a new section for the `/api/generate-report` endpoint. Document its HTTP methods (GET and POST), parameters (`template` in POST body), and the `application/pdf` response type.
    - **Reason**: Audit finding: Undocumented Functionality (`/api/generate-report`).

- [ ] **DOCS**: Document the Objectives API endpoint.
    - **File**: `docs/api_reference.md`
    - **Action**: Add a new section for the `/api/objectives` endpoint. Document its HTTP method (POST), the expected request body structure (`{ name, description, topics }`), and the response format.
    - **Reason**: Audit finding: Undocumented Functionality (`/api/objectives`).

- [ ] **DOCS**: Document the Questions CRUD API endpoint.
    - **File**: `docs/api_reference.md`
    - **Action**: Add a comprehensive section for `/api/questions`. Document all supported methods: `GET` (all and by ID), `POST`, `PUT`, `DELETE`, and `PATCH`. Detail the parameters, request bodies, and responses for each method.
    - **Reason**: Audit finding: Undocumented Functionality (`/api/questions`).

- [ ] **DOCS**: Document the Readiness API endpoint.
    - **File**: `docs/api_reference.md`
    - **Action**: Add a new section for the `/api/readiness` endpoint. Document its HTTP method (GET), lack of parameters, and the structure of its JSON response (`{ overall, breakdown }`).
    - **Reason**: Audit finding: Undocumented Functionality (`/api/readiness`).

- [ ] **DOCS**: Document the Voice Processing API endpoint.
    - **File**: `docs/api_reference.md`
    - **Action**: Add a new section for the `/api/voice-processing` endpoint. Document its HTTP method (POST), request body (`{ filePath, expectedAnswer }`), and response structure (`{ transcription, score, feedback }`).
    - **Reason**: Audit finding: Undocumented Functionality (`/api/voice-processing`).

- [ ] **DOCS**: Document the Spaced Repetition System (SRS) module.
    - **File**: `docs/architecture_details.md`
    - **Action**: Add a new section describing the `srs.ts` module. Explain its purpose (handling SRS logic), list key functions (`getQuestionsByMode`, `calculateNextReview`, `updateQuestionAfterReview`), and describe what each function does.
    - **Reason**: Audit finding: Undocumented Functionality (`srs.ts`).

- [ ] **DOCS**: Document the Scheduler module.
    - **File**: `docs/architecture_details.md`
    - **Action**: Add a new section describing the `scheduler.ts` module. Explain its purpose (orchestrating SRS scheduling and retrieving questions due for review) and describe its key functions.
    - **Reason**: Audit finding: Undocumented Functionality (`scheduler.ts`).

- [ ] **DOCS**: Document the Readiness Calculation module.
    - **File**: `docs/architecture_details.md`
    - **Action**: Add a new section describing the `readiness.ts` module. Explain its purpose (calculating a user's interview readiness score) and provide a high-level overview of the factors it considers (mastery, consistency, coverage, recency).
    - **Reason**: Audit finding: Undocumented Functionality (`readiness.ts`).

- [ ] **DOCS**: Document the Progress Service module.
    - **File**: `docs/architecture_details.md`
    - **Action**: Add a new section for `progress.ts`. Describe its role in aggregating user progress metrics and analytics for the dashboard and reports.
    - **Reason**: Audit finding: Undocumented Functionality (`progress.ts`).

- [ ] **DOCS**: Document the PDF Generation module.
    - **File**: `docs/architecture_details.md`
    - **Action**: Add a new section for `pdf.ts`, explaining its function in generating PDF progress reports for users.
    - **Reason**: Audit finding: Undocumented Functionality (`pdf.ts`).

- [ ] **DOCS**: Document the Objectives Service module.
    - **File**: `docs/architecture_details.md`
    - **Action**: Add a new section describing the `objectives.ts` module. Explain its purpose as a service layer for CRUD operations on user learning objectives.
    - **Reason**: Audit finding: Undocumented Functionality (`objectives.ts`).

- [ ] **DOCS**: Document the Validation utility module.
    - **File**: `docs/architecture_details.md`
    - **Action**: Add a new section for `validation.ts`. Describe its purpose for providing shared validation logic for emails and passwords.
    - **Reason**: Audit finding: Undocumented Functionality (`validation.ts`).

- [ ] **DOCS**: Document the AI Service Abstraction layer.
    - **File**: `docs/architecture_details.md`
    - **Action**: Add a new section for the `src/lib/ai/` directory. Explain the factory pattern used in `index.ts` and the role of the `generation-service.ts` interface and the `gemini-service.ts` implementation.
    - **Reason**: Audit finding: Undocumented Functionality (`ai/*`).

- [ ] **DOCS**: Add missing environment variables to setup guide.
    - **File**: `docs/SETUP_GUIDE.md`
    - **Action**: In the "Environment Variables" section, add entries and descriptions for `NEXT_PUBLIC_API_URL` and `PORT`.
    - **Reason**: Audit finding: `NEXT_PUBLIC_API_URL` and `PORT` are used in code but not documented.

- [ ] **DOCS**: Add test-specific environment variables to setup guide.
    - **File**: `docs/SETUP_GUIDE.md`
    - **Action**: In the "Test Configuration" section, add entries and descriptions for `NEXTAUTH_SECRET` and `NEXTAUTH_URL` in the `.env.test` file example.
    - **Reason**: Audit finding: Test-specific environment variables `NEXTAUTH_SECRET` and `NEXTAUTH_URL` are not documented.