# Development Plan - SRS Mode Enhancements

## Repeat Mode Enhancements
- [x] (LOGIC) Implement struggle tracking in database schema (src/lib/srs.ts)
- [x] (LOGIC) Add weighted selection algorithm for difficult questions (src/lib/srs.ts)
- [x] (LOGIC) Create overdue question prioritization algorithm (src/lib/scheduler.ts)
- [x] (UI) Add visual indicators for struggle metrics in study interface (src/components/SRSControls.tsx)

## Study Mode Enhancements
- [x] (LOGIC) Implement review count tracking per question (src/lib/srs.ts)
- [x] (LOGIC) Add time-based decay for question selection (src/lib/scheduler.ts)
- [x] (LOGIC) Create separate queues for new vs. recent questions (src/lib/srs.ts)
- [x] (UI) Implement UI for new/recent question queues (src/components/FlashcardStudy.tsx)

## Critical Fixes (Per Audit Items 006 & 007)
- [x] (LOGIC) Implement strict Repeat mode filtering: ease < 2.0 OR overdue OR struggleCount >= 3 (src/lib/srs.ts)
- [x] (LOGIC) Remove recent-struggle inclusion from Repeat Mode (src/lib/srs.ts)
- [ ] (LOGIC) Complete knowledge gap analysis integration (src/lib/assessment.ts)
- [ ] (UI) Add real-time struggle visualization indicators (src/components/FlashcardStudy.tsx)
- [x] (TEST) Add comprehensive validation tests for Repeat mode (src/lib/__tests__/srsModes.test.ts)
- [ ] (TEST) Create end-to-end SRS workflow tests (tests/e2e/srsWorkflow.test.ts)

## Knowledge Gap Analysis
- [ ] (LOGIC) Connect Discover mode to question generation API (src/app/api/generate-question/route.ts)
- [ ] (LOGIC) Implement topic relationship modeling for gap detection (src/lib/assessment.ts)
- [ ] (UI) Enhance knowledge gap filtering interface (src/components/DiscoverMode.tsx)

## Struggle Tracking Enhancements
- [ ] (LOGIC) Factor struggle metrics into scheduling algorithms (src/lib/scheduler.ts)
- [ ] (UI) Implement progress heatmaps with struggle metrics (src/components/ProgressDashboard.tsx)

## Discover Mode Enhancements
- [x] (LOGIC) Implement topic relationship modeling (src/lib/srs.ts)
- [x] (LOGIC) Enhance AI question generation integration (src/app/api/generate-question/route.ts)
- [x] (LOGIC) Implement AI-powered knowledge gap analysis:
    * Connect Discover mode to question generation API (src/app/api/generate-question/route.ts)
    * Implement topic relationship modeling for gap detection (src/lib/assessment.ts)
    * Create gap visualization algorithms (src/lib/assessment.ts)
- [x] (UI) Add smart filtering interface for knowledge gaps (src/components/DiscoverMode.tsx)

## Struggle Tracking Enhancements
- [x] (LOGIC) Factor struggle metrics into scheduling algorithms (src/lib/scheduler.ts)
- [x] (UI) Add real-time struggle visualization: (COMPLETE)
    * Progress heatmaps (src/components/ProgressDashboard.tsx)
    * Difficulty indicators during study sessions (src/components/FlashcardStudy.tsx)

## Test Coverage
- [x] (TEST) Add end-to-end SRS workflow tests (tests/e2e/srsWorkflow.test.ts)
- [x] (TEST) Cover all mode filtering scenarios (src/lib/__tests__/srsModes.test.ts)
- [x] (TEST) Add knowledge gap analysis unit tests (src/lib/__tests__/assessment.test.ts)

## Cross-Mode Requirements
- [x] (LOGIC) Update database schema to support new fields (prisma/schema.prisma)
- [x] (LOGIC) Update tests to cover all SRS mode cases (src/lib/__tests__/srsModes.test.ts)
- [x] (DOCS) Update documentation to reflect enhanced functionality (docs/canonical_spec.md)