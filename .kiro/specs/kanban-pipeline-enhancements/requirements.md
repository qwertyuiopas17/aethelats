# Requirements Document

## Introduction

This document specifies the requirements for enhancing the Aethel ATS Kanban Pipeline Board with drag-and-drop functionality, recruiter notes, AI-suggested stage recommendations, and stage-change timestamps. These enhancements improve recruiter workflow efficiency while maintaining data integrity and security.

## Glossary

- **System**: The Aethel ATS Kanban Pipeline Board application (frontend + backend)
- **Recruiter**: An authenticated user with recruiter role
- **Candidate_Card**: A visual representation of a scan record in the Kanban board
- **Scan_Record**: A database row representing one resume analysis result
- **Stage**: One of five Kanban columns (Sourced, Screening, Interview, Offer, Rejected)
- **Ownership**: The relationship between a user_id and scan records they created
- **Optimistic_Update**: UI change applied immediately before server confirmation
- **Debounce**: Delay technique that waits for user to stop typing before triggering action

## Requirements

### Requirement 1: HTML5 Drag-and-Drop Between Columns

**User Story:** As a recruiter, I want to drag candidate cards between Kanban columns, so that I can quickly move candidates through the hiring pipeline.

#### Acceptance Criteria

1. WHEN a recruiter clicks and holds on a Candidate_Card THEN the System SHALL make the card draggable
2. WHEN a recruiter drags a Candidate_Card over a Stage column THEN the System SHALL display visual feedback indicating the drop zone
3. WHEN a recruiter drops a Candidate_Card onto a Stage column THEN the System SHALL update the candidate's stage to the target Stage
4. WHEN a stage update via drag-and-drop succeeds THEN the System SHALL persist the new stage to the database
5. WHEN a stage update via drag-and-drop fails THEN the System SHALL revert the Candidate_Card to its original Stage and display an error message
6. THE System SHALL use HTML5 native drag-and-drop API without external libraries
7. WHEN a Candidate_Card is being dragged THEN the System SHALL reduce the card's opacity to 50%
8. WHEN a drag operation completes THEN the System SHALL restore the card's normal opacity

### Requirement 2: Recruiter Notes Per Candidate

**User Story:** As a recruiter, I want to add private notes to each candidate card, so that I can track my thoughts and observations during the evaluation process.

#### Acceptance Criteria

1. THE System SHALL add a recruiter_notes TEXT column to the Scan_Record database model
2. THE System SHALL create a database migration for the recruiter_notes column
3. WHEN a recruiter clicks the notes icon on a Candidate_Card THEN the System SHALL expand a notes input field
4. WHEN a recruiter types in the notes field THEN the System SHALL debounce the input for 800 milliseconds before saving
5. WHEN the debounce period completes THEN the System SHALL send a PATCH request to /user/scans/:id/notes
6. WHEN the notes save succeeds THEN the System SHALL display a "Saved" indicator for 2 seconds
7. THE System SHALL enforce a maximum length of 2000 characters for recruiter notes
8. WHEN notes exceed 2000 characters THEN the System SHALL truncate the input at 2000 characters client-side
9. WHEN the API receives notes exceeding 2000 characters THEN the System SHALL return a 400 Bad Request error
10. THE System SHALL include recruiter_notes in the response from GET /user/scans
11. WHEN a recruiter attempts to update notes for a Scan_Record they do not own THEN the System SHALL return a 404 Not Found error

### Requirement 3: AI-Suggested Stage Based on Score

**User Story:** As a recruiter, I want to see AI-suggested next stages for high-scoring candidates, so that I can quickly identify promising candidates who should advance.

#### Acceptance Criteria

1. WHEN a candidate's fit_score is greater than or equal to 80 THEN the System SHALL suggest the Interview stage
2. WHEN a candidate's fit_score is greater than or equal to 60 and less than 80 THEN the System SHALL suggest the Screening stage
3. WHEN a candidate's fit_score is less than 60 THEN the System SHALL not display any stage suggestion
4. WHEN the suggested Stage is not ahead of the current Stage THEN the System SHALL not display the suggestion
5. WHEN a stage suggestion is applicable THEN the System SHALL display a clickable badge with text "AI suggests → [Stage]"
6. WHEN a recruiter clicks the AI suggestion badge THEN the System SHALL move the candidate to the suggested Stage
7. THE System SHALL implement AI suggestions entirely in the frontend without backend changes

### Requirement 4: Stage-Change Timestamp Tracking

**User Story:** As a recruiter, I want to see how long each candidate has been in their current stage, so that I can identify candidates who need attention or follow-up.

#### Acceptance Criteria

1. THE System SHALL add a stage_updated_at DATETIME column to the Scan_Record database model
2. THE System SHALL create a database migration for the stage_updated_at column
3. WHEN a Scan_Record's kanban_stage is updated THEN the System SHALL set stage_updated_at to the current UTC time
4. THE System SHALL include stage_updated_at in the response from GET /user/scans
5. WHEN displaying a Candidate_Card THEN the System SHALL show "In stage [time]" instead of upload time
6. WHEN stage_updated_at is null THEN the System SHALL display "Just added"
7. WHEN the time in stage is less than 60 minutes THEN the System SHALL display the duration in minutes (e.g., "In stage 45m")
8. WHEN the time in stage is less than 24 hours THEN the System SHALL display the duration in hours (e.g., "In stage 8h")
9. WHEN the time in stage is less than 7 days THEN the System SHALL display the duration in days (e.g., "In stage 3d")
10. WHEN the time in stage is 7 days or more THEN the System SHALL display the duration in weeks (e.g., "In stage 2w")

### Requirement 5: Database Schema and Migrations

**User Story:** As a system administrator, I want database schema changes to be applied safely, so that existing data is preserved and the application continues to function correctly.

#### Acceptance Criteria

1. THE System SHALL add the recruiter_notes column as TEXT type, nullable, with no default value
2. THE System SHALL add the stage_updated_at column as DATETIME type, nullable, with no default value
3. WHEN init_db() is called THEN the System SHALL execute migrations for both new columns
4. THE System SHALL use IF NOT EXISTS syntax for PostgreSQL migrations
5. THE System SHALL use try/except error handling for SQLite migrations
6. WHEN a migration fails THEN the System SHALL log a warning without crashing the application
7. THE System SHALL preserve all existing data during migration

### Requirement 6: API Endpoint for Notes Updates

**User Story:** As a developer, I want a dedicated API endpoint for updating notes, so that note changes are handled separately from stage changes.

#### Acceptance Criteria

1. THE System SHALL create a PATCH /user/scans/:id/notes endpoint
2. THE System SHALL define a ScanNotesUpdate Pydantic model with a notes field
3. WHEN the endpoint receives a request THEN the System SHALL validate the JWT token
4. WHEN the notes field exceeds 2000 characters THEN the System SHALL return a 400 Bad Request error
5. WHEN the scan_id does not exist or belongs to a different user THEN the System SHALL return a 404 Not Found error
6. WHEN the update succeeds THEN the System SHALL return {"ok": true, "message": "Notes updated"}
7. THE System SHALL call update_scan_notes() helper function with ownership check

### Requirement 7: Ownership and Security

**User Story:** As a security engineer, I want all data mutations to enforce ownership checks, so that recruiters can only modify their own candidate records.

#### Acceptance Criteria

1. WHEN update_scan_notes() is called THEN the System SHALL verify the user_id matches the Scan_Record owner
2. WHEN update_kanban_stage() is called THEN the System SHALL verify the user_id matches the Scan_Record owner
3. WHEN ownership verification fails THEN the System SHALL return False without modifying the database
4. THE System SHALL return 404 Not Found for unauthorized access attempts to prevent information disclosure
5. THE System SHALL require valid JWT authentication for all mutation endpoints

### Requirement 8: Optimistic UI Updates and Error Handling

**User Story:** As a recruiter, I want the interface to feel responsive, so that I can work efficiently without waiting for server responses.

#### Acceptance Criteria

1. WHEN a recruiter moves a Candidate_Card THEN the System SHALL update the UI immediately before the API call completes
2. WHEN a stage update API call fails THEN the System SHALL revert the Candidate_Card to its original position
3. WHEN a stage update API call fails THEN the System SHALL display an error message with the failure reason
4. WHEN a notes save API call fails THEN the System SHALL log the error to the console
5. WHEN a drag operation is in progress THEN the System SHALL disable further drag operations until completion
6. THE System SHALL maintain existing optimistic update patterns for consistency

### Requirement 9: Visual Feedback and User Experience

**User Story:** As a recruiter, I want clear visual feedback during interactions, so that I understand what the system is doing.

#### Acceptance Criteria

1. WHEN a Candidate_Card is being dragged THEN the System SHALL apply opacity-50 styling
2. WHEN a recruiter drags over a valid drop zone THEN the System SHALL display visual feedback
3. WHEN notes are being saved THEN the System SHALL display a "Saving..." indicator
4. WHEN notes save completes THEN the System SHALL display a "Saved" indicator for 2 seconds
5. WHEN a move operation is in progress THEN the System SHALL disable move buttons on the affected card
6. THE System SHALL use the MessageSquare icon from Lucide React for the notes button
7. THE System SHALL maintain existing Tailwind CSS styling patterns

### Requirement 10: Integration with Existing System

**User Story:** As a developer, I want new features to integrate seamlessly with existing code, so that the system remains maintainable.

#### Acceptance Criteria

1. THE System SHALL preserve all existing Kanban board functionality
2. THE System SHALL maintain compatibility with existing arrow button move operations
3. THE System SHALL use existing authHeaders() function from AuthContext for API calls
4. THE System SHALL use existing API_URL constant from constants.js
5. THE System SHALL maintain existing STAGES array and STAGE_COLORS configuration
6. THE System SHALL preserve existing ScorePill component behavior
7. THE System SHALL maintain existing fmtDate() utility function
8. WHEN get_user_scans() is modified THEN the System SHALL maintain backward compatibility with existing response fields
