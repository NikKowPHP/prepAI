Excellent. The audit has provided a clear set of discrepancies. I will now translate these findings into a prioritized, atomic engineering work plan. This plan is structured for an autonomous AI developer to execute, ensuring every identified issue is resolved systematically.

### **Summary of the Engineering Plan**

This plan is structured into four phases (P0 to P3) to address the audit findings.

*   **P0 (Critical Fixes):** The highest priority is to correct two major architectural flaws. First, we will standardize the authentication system by removing the redundant `next-auth` library and refactoring the single endpoint that uses it. Second, we will implement the true AI-driven question generation feature, replacing the current non-AI placeholder, which is a critical logic bug that violates the core product specification.

*   **P1 (Missing Features):** According to the audit, no major features are entirely missing from the codebase. The most significant gap was the AI question generator, which is addressed in P0 as a critical fix.

*   **P2 (Code Mismatches):** Next, we will bring the code into alignment with its definitions. This involves updating TypeScript definition files to accurately reflect the implemented API signatures and removing unused configuration variables.

*   **P3 (Documentation Gaps):** Finally, we will address all documentation gaps. This includes adding missing environment variables to setup guides and creating new, centralized documentation for all previously undocumented API endpoints and logic modules.

Executing this plan will bring the codebase into full compliance with its design and documentation.

---

### **P0 - Critical Code Fixes**

*   [x] **REFACTOR**: Standardize Readiness API to use Supabase Auth
    -   **File**: `src/app/api/readiness/route.ts`
    -   **Action**: Replace the `getServerSession` call from `next-auth` with `supabase.auth.getUser()` to fetch the authenticated user, consistent with other API routes.
    -   **Reason**: Audit finding: Coexistence of conflicting authentication systems (`next-auth` and Supabase Auth). This standardizes on Supabase Auth.

*   [x] **FIX**: Remove `next-auth` configuration file
    -   **File**: `src/lib/auth.ts`
    -   **Action**: Delete this file entirely, as it contains the configuration for the now-removed `next-auth` library.
    -   **Reason**: Audit finding: Coexistence of conflicting authentication systems. This file is no longer needed after standardizing on Supabase Auth.

*   [x] **FIX**: Uninstall the `next-auth` dependency
    -   **File**: `package.json`
    -   **Action**: Remove the line `"next-auth": "^4.24.5",` from the `dependencies` section.
    -   **Reason**: Audit finding: Coexistence of conflicting authentication systems. The package is no longer required.

*   [x] **FIX**: Install Google Generative AI SDK
    -   **File**: `package.json`
    -   **Action**: Add `"@google/generative-ai": "^0.15.0"` (or the latest version) to the `dependencies` section.
    -   **Reason**: Required for the new Gemini-based AI question generation service, which fixes the placeholder implementation.

*   [x] **CREATE**: AI Service directory structure
    -   **File**: `src/lib/ai/`
    -   **Action**: Create the new directory `src/lib/ai/`.
    -   **Reason**: Prerequisite step for creating the AI abstraction layer to fix the placeholder question generator.

*   [x] **CREATE**: AI Question Generation Service Interface
    -   **File**: `src/lib/ai/generation-service.ts`
    -   **Action**: Create the file with the `QuestionGenerationService` interface as defined in `work_breakdown/tasks/master_plan.md` Task 4.1. This will define the contract for any AI provider.
    -   **Reason**: Audit finding: The current question generator is a non-AI placeholder. This is the first step in building a proper, abstracted AI service.

*   [x] **CREATE**: Gemini API Implementation
    -   **File**: `src/lib/ai/gemini-service.ts`
    -   **Action**: Create the file with the `GeminiQuestionGenerationService` class, which implements the `QuestionGenerationService` interface and contains the logic for calling the Gemini API. Use the code from `work_breakdown/tasks/master_plan.md` Task 4.1.
    -   **Reason**: Audit finding: The current question generator is a non-AI placeholder. This task provides the concrete implementation for the AI service.

*   [x] **CREATE**: AI Service Factory
    -   **File**: `src/lib/ai/index.ts`
    -   **Action**: Create the file with the `getQuestionGenerationService` factory function. This function will read `process.env.AI_PROVIDER` to determine which AI service to instantiate.
    -   **Reason**: To complete the abstraction layer, allowing for easy switching between AI providers in the future.

*   [x] **REFACTOR**: Update API endpoint to use the new AI Service
    -   **File**: `src/app/api/generate-question/route.ts`
    -   **Action**: Replace the entire content of the file. The new implementation should import and use `getQuestionGenerationService` to generate questions and save them to the database. The old implementation using `src/lib/questionGenerator.ts` must be removed.
    -   **Reason**: Audit finding: The current question generator is a non-AI placeholder. This task connects the API to the new, real AI implementation.

*   [x] **FIX**: Delete obsolete placeholder question generator
    -   **File**: `src/lib/questionGenerator.ts`
    -   **Action**: Delete this file entirely.
    -   **Reason**: This file contains the old, non-AI placeholder logic and is now redundant.

*   [x] **FIX**: Delete obsolete OpenAI file
    -   **File**: `src/lib/openai.ts`
    -   **Action**: Delete this file entirely.
    -   **Reason**: This file is related to a previous, unused AI implementation and is now obsolete.

*   [x] **FIX**: Delete obsolete placeholder test file
    -   **File**: `src/lib/__tests__/questionGenerator.test.ts`
    -   **Action**: Delete this file entirely.
    -   **Reason**: This test file corresponds to the deleted `questionGenerator.ts` placeholder and is no longer valid.

---

### **P1 - Implementation of Missing Features**

*No tasks in this category. The audit did not identify any documented features that were entirely unimplemented. The primary gap (AI Question Generation) was classified as a P0 critical fix due to the incorrect placeholder logic.*

---

### **P2 - Correcting Mismatches**

*   [x] **UPDATE**: Add PATCH method to Questions API definition
    -   **File**: `src/app/api/questions/route.d.ts`
    -   **Action**: Add `export async function PATCH(req: NextRequest): Promise<NextResponse>;` to the list of exported functions.
    -   **Reason**: Audit finding: API mismatch. The `PATCH` method is implemented in `route.ts` but is missing from its TypeScript definition file.

*   [x] **UPDATE**: Correct the UpdateQuestionData type definition
    -   **File**: `src/app/api/questions/route.d.ts`
    -   **Action**: Expand the `UpdateQuestionData` type to include all possible fields accepted by the `PUT` handler in `route.ts`, such as `lastReviewed`, `reviewInterval`, `reviewEase`, `struggleCount`, etc. All should be optional.
    -   **Reason**: Audit finding: API mismatch. The `PUT` implementation accepts more parameters than are defined in the type.

*   [x] **FIX**: Remove unused `ENABLE_ANALYTICS` environment variable
    -   **File**: `.env.example`
    -   **Action**: Delete the line `ENABLE_ANALYTICS="false"`.
    -   **Reason**: Audit finding: Configuration mismatch. This variable is documented but not used anywhere in the codebase.

*   [x] **FIX**: Remove unused NextAuth environment variables
    -   **File**: `.env.example`
    -   **Action**: Delete the lines for `NEXTAUTH_SECRET` and `NEXTAUTH_URL`.
    -   **Reason**: These variables are for the `next-auth` library, which is being removed as part of the P0 fixes.

---

### **P3 - Documentation Updates**

*   [x] **CREATE**: Central API Reference Document
    -   **File**: `docs/api_reference.md`
    -   **Action**: Create a new markdown file with the title `# API Reference`. This file will serve as the central documentation for all API endpoints.
    -   **Reason**: To provide a single source of truth for API contracts, addressing multiple "Undocumented Functionality" findings.

*   [ ] **DOCS**: Document the `/api/roles` endpoint
    -   **File**: `docs/api_reference.md`
    -   **Action**: Add a new section for the `/api/roles` endpoint. Document its HTTP method (`GET`), URL path, lack of parameters, and the structure of its JSON response (an array of strings).
    -   **Reason**: Audit finding: Undocumented Functionality (`/api/roles`).

*   [ ] **DOCS**: Document the `/api/analyze-knowledge-gaps` endpoint
    -   **File**: `docs/api_reference.md`
    -   **Action**: Add a new section for the `/api/analyze-knowledge-gaps` endpoint. Document its HTTP method (`POST`), URL path, request body structure (`{ questionPerformance, userId }`), and response structure (`{ gaps, suggestedQuestions }`).
    -   **Reason**: Audit finding: Undocumented Functionality (`/api/analyze-knowledge-gaps`).

*   [ ] **DOCS**: Document the `/api/progress` endpoint
    -   **File**: `docs/api_reference.md`
    -   **Action**: Add a new section for the `/api/progress` endpoint. Document its `GET` and `POST` methods, including request parameters and response structures for each.
    -   **Reason**: Audit finding: Undocumented Functionality (`/api/progress`).

*   [ ] **CREATE**: Central Architecture Details Document
    -   **File**: `docs/architecture_details.md`
    -   **Action**: Create a new markdown file with the title `# Architecture Details`. This file will provide details on key logic modules.
    -   **Reason**: To provide a place for documenting important non-API modules.

*   [ ] **DOCS**: Document the `assessment.ts` module
    -   **File**: `docs/architecture_details.md`
    -   **Action**: Add a section describing the `assessment.ts` module. Explain its purpose (validating answers, calculating scores, generating feedback) and its key exported functions.
    -   **Reason**: Audit finding: Undocumented Functionality (`assessment.ts`).

*   [ ] **DOCS**: Document the `rateLimiter.ts` module
    -   **File**: `docs/architecture_details.md`
    -   **Action**: Add a section describing the `rateLimiter.ts` module. Explain its purpose (providing rate limiting for security) and how it is used on the authentication endpoints.
    -   **Reason**: Audit finding: Undocumented Functionality (`rateLimiter.ts`).

*   [ ] **DOCS**: Document the `transcription.ts` module and its dependencies
    -   **File**: `docs/architecture_details.md`
    -   **Action**: Add a section describing the `transcription.ts` module. Explain its dependency on the Google Cloud Speech-to-Text service and its role in processing voice answers.
    -   **Reason**: Audit finding: Undocumented Functionality (`transcription.ts`).

*   [ ] **DOCS**: Add missing environment variables to `.env.example`
    -   **File**: `.env.example`
    -   **Action**: Add entries for `AI_PROVIDER`, `GEMINI_API_KEY`, `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY`, and `NEXT_PUBLIC_API_URL`.
    -   **Reason**: Audit finding: Configuration Mismatch. Multiple variables are used in the code but are not documented for setup.

*   [ ] **DOCS**: Update the main setup guide with new variables
    -   **File**: `docs/SETUP_GUIDE.md`
    -   **Action**: Add descriptions for `AI_PROVIDER`, `GEMINI_API_KEY`, `GOOGLE_CLIENT_EMAIL`, and `GOOGLE_PRIVATE_KEY` under the "Configuration" section.
    -   **Reason**: Audit finding: Configuration Mismatch. The setup guide must reflect all required secrets for the application to function.