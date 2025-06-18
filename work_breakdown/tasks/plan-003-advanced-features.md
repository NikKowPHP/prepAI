# Development Plan - Phase 3: Advanced Features

## Tasks

### PDF report generation
- [x] (LOGIC) Implement PDF generation service
- [x] (LOGIC) Design report template structure
- [x] (UI) Create report customization interface
- [x] (LOGIC) Generate performance analytics in PDF format

### SRS Study Modes Implementation
- [x] (UI) Create flashcard study interface
- [x] (LOGIC) Implement card flipping and rating system
- [x] (UI) Design deck management system
- [x] (LOGIC) Integrate study modes with SRS scheduler
- [x] (UI) Implement mode selection UI in src/components/SRSControls.tsx
- [x] (LOGIC) Implement Repeat mode: filter questions needing reinforcement (low ease/overdue)
- [x] (LOGIC) Implement Study mode: focus on new/recent questions
- [x] (UI) Implement Discover mode: browse and add new questions (integrating with AI)
- [x] (LOGIC) Implement backend API endpoints for mode-specific queries in src/app/api/questions/route.ts
- [x] (UI) Add visual indicators for each mode in study interface
- [x] (UI) Implement navigation between modes
- [x] (LOGIC) Write tests for each mode
- [x] (LOGIC) Update documentation to explain different modes

### SRS Mode Enhancements (Post-Audit)
- [ ] (LOGIC) Implement struggle tracking for Repeat mode
- [ ] (LOGIC) Implement weighted question selection for Repeat mode
- [ ] (LOGIC) Implement overdue question prioritization for Repeat mode
- [ ] (LOGIC) Implement review count tracking for Study mode
- [ ] (LOGIC) Implement time-based decay for Study mode question selection
- [ ] (LOGIC) Implement separate queues for new vs. recent questions in Study mode
- [ ] (LOGIC) Implement topic relationship modeling for Discover mode
- [ ] (LOGIC) Enhance AI question generation for Discover mode
- [ ] (LOGIC) Implement knowledge gap analysis for Discover mode
- [ ] (LOGIC) Write comprehensive tests for all enhanced SRS mode features
- [ ] (LOGIC) Update documentation to reflect enhanced SRS mode functionality

### Voice transcription service
- [x] (LOGIC) Integrate speech-to-text API
- [x] (UI) Create voice recording component
- [x] (LOGIC) Implement transcription processing pipeline
- [x] (UI) Display transcriptions with sync highlighting

### Readiness assessment algorithm
- [x] (LOGIC) Develop assessment scoring model
- [x] (UI) Create assessment interface
- [x] (LOGIC) Implement recommendation engine
- [x] (UI) Display assessment results with actionable insights