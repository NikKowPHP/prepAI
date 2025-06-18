# SRS Mode Enhancements

## Identified Gaps

### Repeat Mode
- Missing tracking of user struggle metrics
- No prioritization of previously difficult questions beyond ease factor
- Lacks overdue question prioritization logic

### Study Mode
- No distinction between new and recently added questions
- Missing tracking of review counts per question
- No time-based decay for question selection

### Discover Mode
- No prioritization of questions from related topics
- Missing AI-generated question integration
- No smart filtering based on user knowledge gaps

## Required Improvements

1. **Repeat Mode Enhancements**
   - Add struggle tracking in database schema
   - Implement weighted selection for difficult questions
   - Create overdue prioritization algorithm

2. **Study Mode Enhancements**
   - Add review count tracking
   - Implement time-based decay for question selection
   - Separate queues for new vs. recent questions

3. **Discover Mode Enhancements**
   - Add topic relationship modeling
   - Integrate AI question generation
   - Implement knowledge gap analysis

## Acceptance Criteria
- All three modes fully implement spec requirements
- Comprehensive test coverage for new features
- Updated documentation reflecting enhanced functionality