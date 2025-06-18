# Canonical Specification: AI Interview Prep Platform

## 1. High-Level Vision
The system is an AI-driven platform designed to prepare users for technical interviews. A user selects an interview topic (e.g., "Junior PHP Laravel"), and the system generates relevant, frequently asked questions. The primary interaction is voice-based; users record verbal answers to questions. The system uses a Spaced Repetition System (SRS) to manage question scheduling, ensuring users master topics over time. The platform provides detailed progress tracking and allows users to export their progress to a PDF to showcase their knowledge to potential employers.

## 2. Functional Requirements

*   **User Authentication:** Users must be able to sign up, sign in, and sign out.
*   **Interview Topic Selection:** Users can start a new "interview prep objective" for a specific role.
*   **AI Question Generation:** The system must generate new, relevant interview questions based on the selected topic and the user's progress. These questions should not already be in the user's database.
*   **Voice-Based Answering:** The primary method for answering questions is by recording voice audio. Text input is a secondary option.
*   **Spaced Repetition System (SRS):** All questions answered (correctly or incorrectly) must be integrated into an SRS (Anki-like) model. Users should have clear modes to "repeat," "study," and "discover" questions.
*   **Progress Analytics:** The user's profile must clearly visualize their progress, strengths, and weaknesses.
*   **Readiness Estimation:** The AI will estimate if a user is ready for an interview for their selected role based on their progress.
*   **PDF Export:** Users can export their entire progress profile into a detailed PDF.

## 3. System Architecture
The system follows a layered architecture with clear separation of concerns:

*   **Presentation Layer**: Next.js (App Router)
*   **Application Layer**: Next.js API Routes
*   **Domain Layer**: Business logic and AI services
*   **Data Layer**: Supabase (PostgreSQL via Prisma) and Supabase Storage

### Component Diagram
```mermaid
graph TD
    A[Frontend] -->|API Calls| B[Next.js API Routes]
    B --> C[Question Service]
    B --> D[User Service]
    B --> E[Analytics Service]
    C --> F[AI Generation Module]
    D --> G[Auth Service]
    E --> H[Progress Tracking]
    C --> I[Prisma ORM]
    D --> I
    E --> I
    I --> J[Supabase PostgreSQL]
    G --> K[Supabase Auth]
    A -->|Uploads| L[Supabase Storage]