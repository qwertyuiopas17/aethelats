# Bugfix Requirements Document

## Introduction

This document addresses two critical bugs in the Kanban/Batch system that affect user experience and data persistence:

1. **The "2 Notes Bug"**: Duplicate notes sections appearing when TalentPoolView re-fetches scans
2. **Batch Persistence Problem**: Batch results lost on page refresh, with no way to track which batch a resume belongs to

These bugs impact the core functionality of the resume screening ATS, preventing recruiters from reliably tracking candidates and batch cohorts across sessions.

## Bug Analysis

### Current Behavior (Defect)

**Bug 1: Duplicate Notes Appearing**

1.1 WHEN TalentPoolView re-fetches scans (via polling or component re-mount) THEN the system passes a new initialScans array reference to KanbanBoardView

1.2 WHEN KanbanBoardView receives a new initialScans array reference THEN the useEffect hook (`React.useEffect(() => { setScans(initialScans); }, [initialScans]);`) resets the entire scans state

1.3 WHEN the scans state is reset THEN CandidateCard components are force-remounted with new keys

1.4 WHEN CandidateCard components are force-remounted THEN React sometimes keeps the old DOM node alive briefly alongside the new one, causing notes sections to flicker or appear duplicated

**Bug 2: Batch Results Lost on Refresh**

1.5 WHEN a user completes a batch analysis THEN the batch results are stored only in component-level memory (jobs state in AppLogic)

1.6 WHEN the user refreshes the page after running a batch analysis THEN the batch results disappear from the UI

1.7 WHEN a resume is processed via /analyze during batch upload THEN a ScanRecord is created in the database without any batch_id column

1.8 WHEN the user views the Talent Pool Kanban after a batch upload THEN individual resumes appear but there is no memory of which batch they came from

### Expected Behavior (Correct)

**Bug 1: Stable Card Rendering**

2.1 WHEN TalentPoolView re-fetches scans THEN the system SHALL diff and patch only changed records instead of resetting the entire scans array

2.2 WHEN KanbanBoardView receives updated scan data THEN the system SHALL use stable keys for CandidateCard components to prevent unnecessary remounting

2.3 WHEN scan data is updated THEN the system SHALL preserve existing CandidateCard component instances for unchanged records

2.4 WHEN notes sections are rendered THEN the system SHALL display exactly one notes section per card without flickering or duplication

**Bug 2: Persistent Batch Tracking**

2.5 WHEN a batch analysis is initiated THEN the system SHALL generate a unique batch_id (UUID) for that batch

2.6 WHEN a resume is processed during batch upload THEN the system SHALL store the batch_id in the ScanRecord database row

2.7 WHEN the user refreshes the page after a batch analysis THEN the system SHALL retrieve batch results from the database using the batch_id

2.8 WHEN the user views the Talent Pool Kanban THEN the system SHALL display batch cohort information for each resume (which batch it belongs to)

2.9 WHEN the user filters or groups candidates in the Kanban THEN the system SHALL support filtering/grouping by batch_id

### Unchanged Behavior (Regression Prevention)

**Kanban Functionality**

3.1 WHEN a user drags and drops a candidate card between stages THEN the system SHALL CONTINUE TO update the kanban_stage correctly

3.2 WHEN a user adds or edits notes on a candidate card THEN the system SHALL CONTINUE TO save notes with debounced persistence

3.3 WHEN the AI suggests moving a candidate to a different stage THEN the system SHALL CONTINUE TO display the suggestion correctly

3.4 WHEN a user views stage timestamps THEN the system SHALL CONTINUE TO display accurate stage_updated_at timestamps

**Batch Upload Functionality**

3.5 WHEN a user uploads multiple resumes for batch processing THEN the system SHALL CONTINUE TO process them concurrently through the 8-stage pipeline

3.6 WHEN batch processing is in progress THEN the system SHALL CONTINUE TO provide real-time WebSocket updates for each job

3.7 WHEN a batch job completes THEN the system SHALL CONTINUE TO display the ranked results with scores and bias signals

3.8 WHEN a user views a completed batch job result THEN the system SHALL CONTINUE TO show the full analysis report

**Database Integrity**

3.9 WHEN a ScanRecord is created THEN the system SHALL CONTINUE TO store all existing fields (user_id, role_target, fit_score, file_name, candidate_id, result_json, timestamp, kanban_stage, recruiter_notes, stage_updated_at)

3.10 WHEN a user queries their scan history THEN the system SHALL CONTINUE TO return all scans ordered by timestamp descending
