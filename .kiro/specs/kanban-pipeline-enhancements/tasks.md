# Implementation Plan: Kanban Pipeline Board Enhancements

## Overview

This implementation plan adds four enhancements to the existing Kanban board: HTML5 drag-and-drop, recruiter notes with auto-save, AI-suggested stages, and stage-change timestamps. The implementation follows a backend-first approach to ensure database schema and API endpoints are ready before frontend integration.

## Tasks

- [x] 1. Backend: Add database columns and migrations
  - Add `recruiter_notes` TEXT column to ScanRecord model
  - Add `stage_updated_at` DATETIME column to ScanRecord model
  - Create migrations in init_db() for both columns
  - Test migrations on both SQLite and PostgreSQL
  - _Requirements: 2.1, 2.2, 4.1, 4.2, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

- [x] 2. Backend: Implement database helper functions
  - [x] 2.1 Create update_scan_notes() function in database.py
    - Implement ownership check (user_id must match scan owner)
    - Enforce 2000 character limit
    - Return True on success, False on failure
    - _Requirements: 2.7, 6.7, 7.1, 7.3_
  
  - [x] 2.2 Modify update_kanban_stage() to set timestamp
    - Add stage_updated_at = datetime.now(timezone.utc) on stage change
    - Preserve existing ownership check logic
    - _Requirements: 4.3, 7.2, 7.3_
  
  - [x] 2.3 Modify get_user_scans() to include new fields
    - Add recruiter_notes to response dict
    - Add stage_updated_at to response dict
    - Maintain backward compatibility with existing fields
    - _Requirements: 2.10, 4.4, 10.8_

- [x] 3. Backend: Create notes API endpoint
  - [x] 3.1 Define ScanNotesUpdate Pydantic model in main.py
    - Add notes: str field
    - _Requirements: 6.2_
  
  - [x] 3.2 Implement PATCH /user/scans/{scan_id}/notes endpoint
    - Import update_scan_notes from database module
    - Validate JWT token with get_current_user dependency
    - Enforce 2000 character limit (return 400 if exceeded)
    - Call update_scan_notes() with ownership check
    - Return 404 if scan not found or wrong user
    - Return {"ok": true, "message": "Notes updated"} on success
    - _Requirements: 2.9, 6.1, 6.3, 6.4, 6.5, 6.6, 6.7, 7.4, 7.5_

- [x] 4. Checkpoint - Backend verification
  - Run init_db() to verify migrations execute without errors
  - Test PATCH /user/scans/:id/notes endpoint with curl
  - Test PATCH /user/scans/:id/stage endpoint still works
  - Verify GET /user/scans includes recruiter_notes and stage_updated_at
  - Test ownership checks reject unauthorized access

- [x] 5. Frontend: Implement drag-and-drop functionality
  - [x] 5.1 Add drag event handlers to CandidateCard component
    - Implement onDragStart handler (set draggable data, reduce opacity)
    - Implement onDragEnd handler (restore opacity, clear drag state)
    - Set draggable={true} attribute on card element
    - Store scan data in dataTransfer as JSON
    - _Requirements: 1.1, 1.7, 1.8_
  
  - [x] 5.2 Add drop zone handlers to KanbanColumn component
    - Implement onDragOver handler (prevent default, show visual feedback)
    - Implement onDrop handler (parse scan data, call handleMove)
    - Add visual feedback CSS classes during drag over
    - _Requirements: 1.2, 1.3_
  
  - [x] 5.3 Integrate drag-and-drop with existing handleMove function
    - Ensure drag-and-drop calls same handleMove as arrow buttons
    - Maintain optimistic UI update pattern
    - Maintain rollback on API failure
    - _Requirements: 1.4, 1.5, 8.1, 8.2, 8.3, 10.2_
  
  - [ ]* 5.4 Write unit tests for drag-and-drop
    - Test onDragStart sets correct data and opacity
    - Test onDragEnd restores opacity
    - Test onDrop calls handleMove with correct parameters
    - Test visual feedback classes are applied
    - _Requirements: 1.1, 1.2, 1.7, 1.8_

- [x] 6. Frontend: Implement recruiter notes feature
  - [x] 6.1 Create NotesSection component
    - Add collapsible notes UI with MessageSquare icon
    - Implement textarea with 2000 character limit
    - Add character counter display
    - Implement expand/collapse toggle
    - _Requirements: 2.3, 2.7, 2.8, 9.6_
  
  - [x] 6.2 Implement debounced auto-save
    - Create debounce function with 800ms delay
    - Trigger API call after debounce period
    - Call PATCH /user/scans/:id/notes endpoint
    - Use authHeaders() from AuthContext
    - _Requirements: 2.4, 2.5, 10.3_
  
  - [x] 6.3 Add save status indicators
    - Display "Saving..." while API call is in progress
    - Display "Saved" for 2 seconds after success
    - Log errors to console on failure
    - _Requirements: 2.6, 8.4, 9.3, 9.4_
  
  - [x] 6.4 Integrate NotesSection into CandidateCard
    - Add NotesSection below role target
    - Pass scan.recruiter_notes as initial value
    - Wire up onSave handler to API call
    - _Requirements: 2.3, 10.1_
  
  - [ ]* 6.5 Write unit tests for notes feature
    - Test debounce timing (800ms)
    - Test character limit enforcement
    - Test save indicators appear/disappear correctly
    - Test API call is made with correct payload
    - _Requirements: 2.4, 2.6, 2.7, 2.8_

- [x] 7. Frontend: Implement AI stage suggestions
  - [x] 7.1 Create calculateSuggestedStage function
    - Return "Interview" for score >= 80
    - Return "Screening" for score >= 60 and < 80
    - Return null for score < 60
    - Return null if suggested stage is not ahead of current stage
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [x] 7.2 Create AISuggestionBadge component
    - Display "AI suggests → [Stage]" text
    - Make badge clickable
    - Call handleMove with suggested stage on click
    - Only render if calculateSuggestedStage returns non-null
    - _Requirements: 3.5, 3.6_
  
  - [x] 7.3 Integrate AISuggestionBadge into CandidateCard
    - Add badge below score pill
    - Pass scan data to calculate suggestion
    - Wire up onClick to handleMove
    - _Requirements: 3.5, 3.6, 10.1_
  
  - [ ]* 7.4 Write property tests for AI suggestions
    - **Property 6: AI suggestion score thresholds**
    - **Validates: Requirements 3.1, 3.2, 3.3**
  
  - [ ]* 7.5 Write property tests for suggestion monotonicity
    - **Property 5: AI suggestion monotonicity**
    - **Validates: Requirements 3.4**

- [x] 8. Frontend: Implement stage timestamp display
  - [x] 8.1 Create formatTimeInStage function
    - Return "Just added" for null timestamps
    - Return "In stage Xm" for < 60 minutes
    - Return "In stage Xh" for < 24 hours
    - Return "In stage Xd" for < 7 days
    - Return "In stage Xw" for >= 7 days
    - _Requirements: 4.6, 4.7, 4.8, 4.9, 4.10_
  
  - [x] 8.2 Replace timestamp display in CandidateCard footer
    - Replace fmtDate(scan.timestamp) with formatTimeInStage(scan.stage_updated_at)
    - Maintain existing Clock icon
    - _Requirements: 4.5_
  
  - [ ]* 8.3 Write property tests for timestamp formatting
    - **Property 11: Timestamp display formatting**
    - **Validates: Requirements 4.7, 4.8, 4.9, 4.10**

- [x] 9. Frontend: Complete KanbanBoardView rewrite
  - [x] 9.1 Update state management
    - Add draggedScan state for drag-and-drop
    - Add savingNotes Set for tracking save operations
    - Add notesSaved Set for tracking save confirmations
    - Maintain existing movingId and moveError state
    - _Requirements: 8.5, 9.3, 9.4_
  
  - [x] 9.2 Update CandidateCard component
    - Add drag event handlers (draggable, onDragStart, onDragEnd)
    - Integrate NotesSection component
    - Integrate AISuggestionBadge component
    - Update footer to use formatTimeInStage
    - Maintain existing move buttons and styling
    - _Requirements: 1.1, 1.7, 1.8, 4.5, 9.1, 9.5, 10.1, 10.5, 10.6, 10.7_
  
  - [x] 9.3 Update KanbanColumn component
    - Add onDragOver handler
    - Add onDrop handler
    - Add visual feedback for drop zones
    - Maintain existing column header and card rendering
    - _Requirements: 1.2, 1.3, 9.2, 10.1, 10.5_
  
  - [x] 9.4 Implement notes save handler
    - Create handleNotesSave function
    - Call PATCH /user/scans/:id/notes with authHeaders()
    - Update savingNotes and notesSaved state
    - Handle errors gracefully
    - _Requirements: 2.5, 8.4, 10.3, 10.4_
  
  - [x] 9.5 Maintain existing functionality
    - Preserve arrow button move operations
    - Preserve optimistic UI updates
    - Preserve error handling and rollback
    - Preserve search filtering from parent component
    - Preserve existing styling patterns
    - _Requirements: 8.1, 8.2, 8.3, 8.6, 9.7, 10.1, 10.2, 10.5, 10.6, 10.7_

- [x] 10. Checkpoint - Integration testing
  - Drag candidate cards between columns and verify database updates
  - Add notes to multiple cards and verify auto-save works
  - Verify AI suggestions appear for high-scoring candidates
  - Click AI suggestion badges and verify stage moves
  - Verify timestamp displays show correct time-in-stage
  - Test with multiple users to verify ownership isolation
  - Verify existing arrow button moves still work
  - Verify search filtering still works

- [ ] 11. Write property-based tests
  - [ ]* 11.1 Write property test for notes persistence
    - **Property 1: Notes persistence**
    - **Validates: Requirements 2.5, 2.10**
  
  - [ ]* 11.2 Write property test for ownership enforcement (notes)
    - **Property 2: Ownership enforcement for notes**
    - **Validates: Requirements 2.11, 7.1, 7.3, 7.4**
  
  - [ ]* 11.3 Write property test for ownership enforcement (stage)
    - **Property 3: Ownership enforcement for stage changes**
    - **Validates: Requirements 7.2, 7.3, 7.4**
  
  - [ ]* 11.4 Write property test for stage timestamp update
    - **Property 4: Stage timestamp update**
    - **Validates: Requirements 4.3**
  
  - [ ]* 11.5 Write property test for drag-and-drop persistence
    - **Property 7: Drag-and-drop persistence**
    - **Validates: Requirements 1.3, 1.4**
  
  - [ ]* 11.6 Write property test for notes character limit (client)
    - **Property 8: Notes character limit client-side**
    - **Validates: Requirements 2.7, 2.8**
  
  - [ ]* 11.7 Write property test for notes character limit (server)
    - **Property 9: Notes character limit server-side**
    - **Validates: Requirements 2.7, 2.9, 6.4**
  
  - [ ]* 11.8 Write property test for optimistic UI rollback
    - **Property 10: Optimistic UI rollback on failure**
    - **Validates: Requirements 1.5, 8.2, 8.3**
  
  - [ ]* 11.9 Write property test for notes debounce
    - **Property 13: Notes debounce triggers API call**
    - **Validates: Requirements 2.4, 2.5**
  
  - [ ]* 11.10 Write property test for AI suggestion click
    - **Property 14: AI suggestion click triggers stage move**
    - **Validates: Requirements 3.6**

- [x] 12. Final checkpoint - End-to-end verification
  - Run full test suite (unit + property + integration)
  - Verify all existing Kanban functionality still works
  - Test with real user accounts and multiple candidates
  - Verify performance (debounce prevents excessive API calls)
  - Verify security (ownership checks prevent unauthorized access)
  - Test on both SQLite (local) and PostgreSQL (production)

## Task Dependency Graph

```mermaid
graph TD
    T1[1. Backend: Add database columns and migrations]
    T2[2. Backend: Implement database helper functions]
    T2_1[2.1 Create update_scan_notes function]
    T2_2[2.2 Modify update_kanban_stage to set timestamp]
    T2_3[2.3 Modify get_user_scans to include new fields]
    T3[3. Backend: Create notes API endpoint]
    T3_1[3.1 Define ScanNotesUpdate Pydantic model]
    T3_2[3.2 Implement PATCH /user/scans/{scan_id}/notes endpoint]
    T4[4. Checkpoint - Backend verification]
    T5[5. Frontend: Implement drag-and-drop functionality]
    T5_1[5.1 Add drag event handlers to CandidateCard]
    T5_2[5.2 Add drop zone handlers to KanbanColumn]
    T5_3[5.3 Integrate drag-and-drop with existing handleMove]
    T5_4[5.4 Write unit tests for drag-and-drop]
    T6[6. Frontend: Implement recruiter notes feature]
    T6_1[6.1 Create NotesSection component]
    T6_2[6.2 Implement debounced auto-save]
    T6_3[6.3 Add save status indicators]
    T6_4[6.4 Integrate NotesSection into CandidateCard]
    T6_5[6.5 Write unit tests for notes feature]
    T7[7. Frontend: Implement AI stage suggestions]
    T7_1[7.1 Create calculateSuggestedStage function]
    T7_2[7.2 Create AISuggestionBadge component]
    T7_3[7.3 Integrate AISuggestionBadge into CandidateCard]
    T7_4[7.4 Write property tests for AI suggestions]
    T7_5[7.5 Write property tests for suggestion monotonicity]
    T8[8. Frontend: Implement stage timestamp display]
    T8_1[8.1 Create formatTimeInStage function]
    T8_2[8.2 Replace timestamp display in CandidateCard footer]
    T8_3[8.3 Write property tests for timestamp formatting]
    T9[9. Frontend: Complete KanbanBoardView rewrite]
    T9_1[9.1 Update state management]
    T9_2[9.2 Update CandidateCard component]
    T9_3[9.3 Update KanbanColumn component]
    T9_4[9.4 Implement notes save handler]
    T9_5[9.5 Maintain existing functionality]
    T10[10. Checkpoint - Integration testing]
    T11[11. Write property-based tests]
    T11_1[11.1 Write property test for notes persistence]
    T11_2[11.2 Write property test for ownership enforcement notes]
    T11_3[11.3 Write property test for ownership enforcement stage]
    T11_4[11.4 Write property test for stage timestamp update]
    T11_5[11.5 Write property test for drag-and-drop persistence]
    T11_6[11.6 Write property test for notes character limit client]
    T11_7[11.7 Write property test for notes character limit server]
    T11_8[11.8 Write property test for optimistic UI rollback]
    T11_9[11.9 Write property test for notes debounce]
    T11_10[11.10 Write property test for AI suggestion click]
    T12[12. Final checkpoint - End-to-end verification]

    T1 --> T2
    T2 --> T2_1
    T2 --> T2_2
    T2 --> T2_3
    T2_1 --> T3
    T2_2 --> T3
    T2_3 --> T3
    T3 --> T3_1
    T3_1 --> T3_2
    T3_2 --> T4
    T4 --> T5
    T4 --> T6
    T4 --> T7
    T4 --> T8
    T5 --> T5_1
    T5_1 --> T5_2
    T5_2 --> T5_3
    T5_3 --> T5_4
    T6 --> T6_1
    T6_1 --> T6_2
    T6_2 --> T6_3
    T6_3 --> T6_4
    T6_4 --> T6_5
    T7 --> T7_1
    T7_1 --> T7_2
    T7_2 --> T7_3
    T7_3 --> T7_4
    T7_3 --> T7_5
    T8 --> T8_1
    T8_1 --> T8_2
    T8_2 --> T8_3
    T5_3 --> T9
    T6_4 --> T9
    T7_3 --> T9
    T8_2 --> T9
    T9 --> T9_1
    T9_1 --> T9_2
    T9_1 --> T9_3
    T9_1 --> T9_4
    T9_2 --> T9_5
    T9_3 --> T9_5
    T9_4 --> T9_5
    T9_5 --> T10
    T10 --> T11
    T11 --> T11_1
    T11 --> T11_2
    T11 --> T11_3
    T11 --> T11_4
    T11 --> T11_5
    T11 --> T11_6
    T11 --> T11_7
    T11 --> T11_8
    T11 --> T11_9
    T11 --> T11_10
    T11_1 --> T12
    T11_2 --> T12
    T11_3 --> T12
    T11_4 --> T12
    T11_5 --> T12
    T11_6 --> T12
    T11_7 --> T12
    T11_8 --> T12
    T11_9 --> T12
    T11_10 --> T12
```

## Notes

- Tasks marked with `*` are optional property-based tests that can be skipped for faster MVP
- Backend tasks (1-4) must be completed before frontend tasks (5-9)
- Each checkpoint ensures incremental validation before proceeding
- Property tests validate universal correctness properties across all inputs
- Integration tests verify end-to-end workflows with real API calls
- All tasks reference specific requirements for traceability
