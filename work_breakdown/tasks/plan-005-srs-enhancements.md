# Development Plan - SRS Mode Enhancements

## Repeat Mode Enhancements
- [x] (LOGIC) Implement struggle tracking in database schema (src/lib/srs.ts)
- [x] (LOGIC) Add weighted selection algorithm for difficult questions (src/lib/srs.ts)
- [x] (LOGIC) Create overdue question prioritization algorithm (src/lib/scheduler.ts)
- [ ] (UI) Add visual indicators for struggle metrics in study interface (src/components/SRSControls.tsx)

## Study Mode Enhancements
- [ ] (LOGIC) Implement review count tracking per question (src/lib/srs.ts)
- [ ] (LOGIC) Add time-based decay for question selection (src/lib/scheduler.ts)
- [ ] (LOGIC) Create separate queues for new vs. recent questions (src/lib/srs.ts)
- [ ] (UI) Implement UI for new/recent question queues (src/components/FlashcardStudy.tsx)

## Discover Mode Enhancements
- [ ] (LOGIC) Implement topic relationship modeling (src/lib/srs.ts)
- [ ] (LOGIC) Enhance AI question generation integration (src/app/api/generate-question/route.ts)
- [ ] (LOGIC) Develop knowledge gap analysis algorithm (src/lib/assessment.ts)
- [ ] (UI) Add smart filtering interface for knowledge gaps (src/components/DiscoverMode.tsx)

## Cross-Mode Requirements
- [ ] (LOGIC) Update database schema to support new fields (prisma/schema.prisma)
- [ ] (LOGIC) Write comprehensive tests for all enhanced features (src/lib/__tests__/srsModes.test.ts)
- [ ] (DOCS) Update documentation to reflect enhanced functionality (docs/canonical_spec.md)