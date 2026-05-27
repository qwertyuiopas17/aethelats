# Bugfix Requirements Document

## Introduction

This document addresses two critical bugs in the Kanban board system that affect user experience and data persistence:

1. **The "2 Notes" Glitch**: Visual flickering and duplicate DOM nodes in CandidateCard components when the Kanban board refreshes
2. **Batch Persistence Problem**: Loss of batch cohort information after page refresh, making it impossible to track which candidates came from the same batch upload

These bugs impact the reliability of the talent pool management system and need to be fixed to ensure stable UI rendering and proper batch tracking functionality.

## Bug Analysis

### Current Behavior (Defect)

#### Bug 1: The "2 Notes" Glitch

1.1 WHEN TalentPoolView re-fetches scans (via polling or component re-mount) THEN the system passes a new initialScans array reference to KanbanBoardView

1.2 WHEN KanbanBoardView receives a new initialScans array reference THEN the system resets the entire scans state via `React.useEffect(() => { setScans(initialScans); }, [initialScans])`

1.3 WHEN the scans state is reset with a new array reference THEN the system force-remounts all CandidateCard components even when the underlying data hasn't changed

1.4 WHEN CandidateCard components are force-remounted THEN React sometimes keeps the old DOM node alive briefly alongside the new one, causing the notes section to flicker or appear twice

1.5 WHEN cards lack stable keys (using scan.id which may not be unique across re-renders) THEN React cannot efficiently reconcile the virtual DOM, leading to duplicate rendering artifacts

#### Bug 2: Batch Persistence Problem

2.1 WHEN a user uploads a batch of resumes in BatchUploadView THEN the system stores batch state (jobs array, batchId) only in component-level memory

2.2 WHEN a user refreshes the page after batch upload THEN the system loses all batch results from the UI (jobs array is cleared, batchId is lost)

2.3 WHEN individual resumes are processed via the /analyze endpoint THEN the system creates ScanRecord entries in the database WITHOUT a batch_id column to track which batch they belong to

2.4 WHEN a user views the Talent Pool Kanban after page refresh THEN the system displays individual candidates but provides no way to identify or filter by batch cohort

2.5 WHEN the get_user_scans endpoint returns scan records THEN the system strips out the result_json blob, preventing the frontend from accessing full analysis results

### Expected Behavior (Correct)

#### Bug 1: The "2 Notes" Glitch - Fix

3.1 WHEN TalentPoolView re-fetches scans THEN the system SHALL pass the new data to KanbanBoardView without causing unnecessary re-renders

3.2 WHEN KanbanBoardView receives updated scan data THEN the system SHALL diff and patch only the changed records instead of resetting the entire scans array

3.3 WHEN CandidateCard components are rendered THEN the system SHALL use stable, unique keys (scan.id) to enable React's reconciliation algorithm to correctly identify unchanged components

3.4 WHEN scan data is updated THEN the system SHALL preserve existing CandidateCard component instances for unchanged records, preventing DOM node duplication

3.5 WHEN the notes section is rendered THEN the system SHALL display exactly one notes section per card without flickering or visual artifacts

#### Bug 2: Batch Persistence Problem - Fix

4.1 WHEN the database schema is updated THEN the system SHALL add a batch_id column to the ScanRecord table to track batch cohorts

4.2 WHEN a batch upload is processed THEN the system SHALL store the batch_id in each ScanRecord created from that batch

4.3 WHEN a user refreshes the page after batch upload THEN the system SHALL be able to reconstruct batch information from the database using the batch_id

4.4 WHEN the get_user_scans endpoint is called THEN the system SHALL optionally include the result_json blob based on a query parameter

4.5 WHEN the frontend displays the Talent Pool THEN the system SHALL provide a way to filter or group candidates by batch_id

### Unchanged Behavior (Regression Prevention)

#### General Kanban Functionality

5.1 WHEN a user drags and drops a candidate card between stages THEN the system SHALL CONTINUE TO update the kanban_stage in the database and reflect the change in the UI

5.2 WHEN a user adds or edits notes on a candidate card THEN the system SHALL CONTINUE TO save the notes to the database with debouncing

5.3 WHEN a user views the Talent Pool in list view THEN the system SHALL CONTINUE TO display all candidates with their scores, stages, and metadata

5.4 WHEN AI suggests moving a candidate to a different stage THEN the system SHALL CONTINUE TO display the suggestion button based on the fit_score

#### Batch Upload Functionality

5.5 WHEN a user uploads multiple resumes in batch mode THEN the system SHALL CONTINUE TO process each resume through the full 8-stage pipeline

5.6 WHEN batch processing is in progress THEN the system SHALL CONTINUE TO display real-time progress updates via WebSocket

5.7 WHEN a batch job completes THEN the system SHALL CONTINUE TO display the ranked results with scores and bias signals

5.8 WHEN a user clicks "View Result" on a completed job THEN the system SHALL CONTINUE TO navigate to the full analysis report

#### Data Integrity

5.9 WHEN a resume is analyzed (single or batch) THEN the system SHALL CONTINUE TO create a ScanRecord in the database with all existing fields (fit_score, role_target, file_name, timestamp, etc.)

5.10 WHEN the /analyze endpoint processes a resume THEN the system SHALL CONTINUE TO return the complete result_json with all analysis data

5.11 WHEN a user's scans are fetched THEN the system SHALL CONTINUE TO return all scans belonging to that user, ordered by timestamp

5.12 WHEN a candidate card displays a score THEN the system SHALL CONTINUE TO use the correct color coding (green ≥75, yellow ≥50, red <50)
