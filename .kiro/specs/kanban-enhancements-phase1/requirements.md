# Requirements Document

## Introduction

This document specifies the requirements for Kanban Enhancements Phase 1, which adds four key capabilities to the existing Kanban board: lazy-loaded full report viewing, batch cohort visual filtering, inline skill visualization, and rejection intelligence. These enhancements improve recruiter efficiency by providing quick access to detailed candidate information, enabling cohort-based analysis, surfacing skill match patterns, and identifying common rejection reasons.

## Glossary

- **Kanban_Board**: The existing candidate management interface displaying candidates across pipeline stages
- **Result_Drawer**: A slide-out panel component that displays full candidate analysis reports
- **Batch_Stripe**: A colored left-border visual indicator showing which batch cohort a candidate belongs to
- **Batch_Legend**: An interactive legend component displaying all batch cohorts with filtering capabilities
- **DNA_Spark_Card**: A mini bar chart component showing top 5 skill match scores inline on candidate cards
- **Rejection_Reason**: A component displaying missing skills for candidates in the Rejected stage
- **Scan_Record**: Database record containing candidate analysis data including result_json blob
- **Result_JSON**: JSON blob field containing full candidate analysis including skill matches and missing skills
- **Batch_ID**: UUID field linking candidates uploaded in the same batch
- **Stage**: Pipeline stage field with values: Sourced, Screening, Interview, Offer, Rejected
- **API**: Backend FastAPI service providing candidate data endpoints
- **Results_View**: Existing component that renders full candidate analysis reports

## Requirements

### Requirement 1: Lazy-Loaded Full Report Viewing

**User Story:** As a recruiter, I want to view full candidate reports on demand without leaving the Kanban board, so that I can quickly access detailed analysis while maintaining my workflow context.

#### Acceptance Criteria

1. WHEN a candidate card is displayed, THE Kanban_Board SHALL render an expand button on each card
2. WHEN a recruiter clicks the expand button, THE Result_Drawer SHALL open and fetch the result_json from the API
3. WHILE the result_json is being fetched, THE Result_Drawer SHALL display a loading indicator
4. WHEN the result_json fetch completes successfully, THE Result_Drawer SHALL render the Results_View component with the fetched data
5. WHEN the recruiter clicks the close button or clicks outside the drawer, THE Result_Drawer SHALL close and clear the loaded data
6. IF the result_json fetch fails, THEN THE Result_Drawer SHALL display an error message "Unable to load full report. The analysis may not be complete."
7. WHERE a Scan_Record has null result_json, THE Kanban_Board SHALL disable the expand button and show a tooltip "Full report not available"

### Requirement 2: Batch Cohort Visual Identification

**User Story:** As a recruiter, I want to visually identify which batch cohort each candidate belongs to, so that I can quickly recognize candidates from the same upload session.

#### Acceptance Criteria

1. WHEN a candidate card is rendered, THE Batch_Stripe SHALL display a 4px colored left border if the Scan_Record has a non-null batch_id
2. THE Batch_Stripe SHALL generate a consistent color from the batch_id using a hash-based algorithm
3. WHERE a Scan_Record has null batch_id, THE Batch_Stripe SHALL not render any colored border
4. WHEN the same batch_id appears on multiple cards, THE Batch_Stripe SHALL display the identical color across all cards

### Requirement 3: Batch Cohort Filtering

**User Story:** As a recruiter, I want to filter the Kanban board by batch cohort, so that I can analyze how candidates from a specific upload session are progressing through the pipeline.

#### Acceptance Criteria

1. WHEN the Kanban_Board loads, THE Batch_Legend SHALL display all unique batch cohorts with their colors and candidate counts
2. WHEN a recruiter clicks a batch in the legend, THE Kanban_Board SHALL filter all stages to show only candidates with that batch_id
3. WHEN a batch filter is active, THE Kanban_Board SHALL highlight matching candidate cards
4. WHEN a recruiter clicks the selected batch again or clicks "Show All", THE Kanban_Board SHALL clear the filter and display all candidates
5. THE Batch_Legend SHALL display stage distribution for each batch showing counts like "2 in Interview, 4 Rejected"
6. WHERE no Scan_Records have batch_id values, THE Batch_Legend SHALL not render

### Requirement 4: Inline Skill Visualization

**User Story:** As a recruiter, I want to see a visual summary of each candidate's top skill matches directly on their card, so that I can quickly assess their strengths without opening the full report.

#### Acceptance Criteria

1. WHEN a candidate card is rendered, THE DNA_Spark_Card SHALL extract the top 5 skill matches from result_json.skill_matches
2. THE DNA_Spark_Card SHALL render 5 vertical bars representing skill match scores from 0-100
3. THE DNA_Spark_Card SHALL sort skills by score in descending order before selecting the top 5
4. WHERE result_json.skill_matches is empty or missing, THE DNA_Spark_Card SHALL not render
5. THE DNA_Spark_Card SHALL display inline on the card without requiring user interaction

### Requirement 5: Rejection Intelligence

**User Story:** As a recruiter, I want to see which skills were missing for rejected candidates, so that I can identify patterns in rejections and improve my sourcing criteria.

#### Acceptance Criteria

1. WHEN a candidate card is in the Rejected stage, THE Rejection_Reason SHALL display the missing_skills from result_json
2. THE Rejection_Reason SHALL format missing skills as "Missing: Kubernetes, CI/CD, System Design"
3. WHERE the Stage is not "Rejected", THE Rejection_Reason SHALL not render
4. WHERE result_json.missing_skills is empty or missing, THE Rejection_Reason SHALL not render
5. THE Rejection_Reason SHALL display up to 5 missing skills, truncating with "..." if more exist

### Requirement 6: API Endpoint for Result Retrieval

**User Story:** As a system, I need to provide an API endpoint for fetching full candidate reports, so that the Result_Drawer can lazy-load data on demand.

#### Acceptance Criteria

1. THE API SHALL provide a GET endpoint at /user/scans/:id/result
2. WHEN the endpoint receives a request, THE API SHALL verify the user_id owns the requested Scan_Record
3. IF the user_id does not own the Scan_Record, THEN THE API SHALL return HTTP 403 Forbidden
4. IF the Scan_Record does not exist, THEN THE API SHALL return HTTP 404 Not Found
5. WHEN authorization succeeds, THE API SHALL return the result_json field as JSON with HTTP 200 OK
6. THE API SHALL apply existing rate limiting rules to this endpoint

### Requirement 7: Data Model Validation

**User Story:** As a system, I need to validate data integrity for the new features, so that components receive well-formed data and handle edge cases gracefully.

#### Acceptance Criteria

1. WHEN result_json is present, THE Scan_Record SHALL contain valid JSON that can be parsed
2. WHEN batch_id is present, THE Scan_Record SHALL contain a valid UUID format
3. THE Scan_Record SHALL have a kanban_stage value from the set: Sourced, Screening, Interview, Offer, Rejected
4. WHERE result_json contains skill_matches, each skill match SHALL have a score between 0 and 100
5. WHERE result_json is malformed, THE system SHALL log the error and provide fallback empty arrays for missing fields

### Requirement 8: Component Integration

**User Story:** As a developer, I want the new components to integrate seamlessly with the existing Kanban board, so that the enhancements feel like a natural extension of the current interface.

#### Acceptance Criteria

1. THE Result_Drawer SHALL reuse the existing Results_View component for rendering full reports
2. THE Kanban_Board SHALL maintain backward compatibility with existing card rendering logic
3. WHEN new components are added to candidate cards, THE Kanban_Board SHALL preserve existing card layout and styling
4. THE Result_Drawer SHALL use the same authentication headers as other API calls in the application
5. WHERE a feature cannot render due to missing data, THE Kanban_Board SHALL gracefully degrade without breaking existing functionality

### Requirement 9: Performance Optimization

**User Story:** As a recruiter, I want the Kanban board to load quickly and remain responsive, so that I can efficiently manage large numbers of candidates.

#### Acceptance Criteria

1. THE Kanban_Board SHALL not fetch result_json for any candidate until the expand button is clicked
2. THE Batch_Legend SHALL compute batch colors once and cache them in a Map data structure
3. THE DNA_Spark_Card SHALL extract and sort top 5 skills during card render without blocking the UI thread
4. WHEN filtering by batch, THE Kanban_Board SHALL use array filtering with O(n) complexity for up to 1000 candidates
5. THE Result_Drawer SHALL cancel any pending API requests when closed before fetch completion

### Requirement 10: Error Recovery

**User Story:** As a recruiter, I want the system to handle errors gracefully, so that I can continue working even when some data is unavailable or requests fail.

#### Acceptance Criteria

1. WHEN the Result_Drawer fetch fails, THE Result_Drawer SHALL allow the user to close the drawer and retry
2. WHERE result_json is null, THE candidate card SHALL remain functional with expand button disabled
3. IF result_json is malformed, THE system SHALL display available data and log the error for debugging
4. WHEN no batches are present, THE Kanban_Board SHALL hide the Batch_Legend and Batch_Stripes entirely
5. THE system SHALL not crash or become unresponsive due to missing or invalid data in any component
