# Master Development Plan

## Project Overview
AI-driven interview preparation system with:
- Voice-based question answering
- SRS-based question management
- Progress analytics
- PDF report generation

## Tech Stack
- **Frontend**: Next.js 15+ with Tailwind
- **Backend**: Next.js API routes
- **Database**: Supabase (PostgreSQL) via Prisma
- **Storage**: Supabase bucket for voice recordings

## Development Phases

### Phase 1: Core System Setup
1. Initialize Next.js project with app router
2. Configure environment management (env files, CI/CD variables)
3. Configure Supabase authentication
4. Setup Prisma ORM with initial schema
5. Implement basic question management
6. Create voice recording component
7. Complete environment configuration fixes (see plan-006-env-config.md)

### Phase 2: AI Integration
1. Implement question generation service
2. Add SRS scheduling logic
3. Create progress tracking system
4. Develop basic analytics dashboard

### Phase 3: Advanced Features
1. PDF report generation
2. Enhanced SRS Study Modes (see plan-005-srs-enhancements.md):
   - Repeat mode:
        * Struggle tracking
        * Weighted selection for difficult questions
        * Overdue prioritization algorithm
        * [AUDIT] Implement filtering (ease < 2.0 OR overdue OR high struggle)
   - Study mode:
        * Review count tracking
        * Time-based decay selection
        * Separate queues for new vs. recent questions
        * [AUDIT] Implement filtering (new + recent questions <=3 reviews)
   - Discover mode:
        * Topic relationship modeling
        * AI-generated question integration
        * [AUDIT] Implement AI-powered knowledge gap analysis
        * [AUDIT] Implement filtering (AI-generated + topic-related questions)
   - [AUDIT] Ensure getQuestionsByMode returns empty array instead of undefined
   - [AUDIT] Add API error handling for all SRS modes
   - [AUDIT] Implement real-time struggle visualization
   - [AUDIT] Add end-to-end SRS workflow tests
3. Voice transcription service
4. Readiness assessment algorithm

### Phase 4: Polish & Deployment
1. UI/UX refinements
2. Performance optimization
3. Testing and QA
4. Deployment pipeline setup

## Phase Priority
Focus on completing Phase 3 SRS enhancements before proceeding to deployment. Estimated timeline: 2 weeks for SRS fixes.