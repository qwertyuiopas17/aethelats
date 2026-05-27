# Bugfix Requirements Document

## Introduction

The recruiter dashboard batch processing feature has two critical issues that prevent proper user experience:

1. **Pipeline Animation Inconsistency**: The 8-stage pipeline visualizer (Resume Upload, PII Strip, Blind Score, Skill Graph, Bias Detect, Percentile Rank, Counter-Factual, Fairness Gate) does not correctly sync with backend processing. Stages either don't light up at all, or show incorrect/mock data (like "PII stripping" appearing when it shouldn't).

2. **State Loss on Navigation**: When users navigate from the batch list view to a detailed resume report and then click back, the entire batch screen refreshes and all scanned resumes disappear, forcing users to re-upload and re-process.

These bugs significantly impact the user experience by providing misleading visual feedback and causing data loss during navigation.

## Bug Analysis

### Current Behavior (Defect)

#### Pipeline Animation Issues

1.1 WHEN batch resumes are being processed THEN the system shows only stages 0 (Resume Upload) and 7 (Fairness Gate) lighting up, with intermediate stages (1-6) not lighting up correctly

1.2 WHEN backend logs show stage updates being sent (e.g., "Stage 2/8 — Blind Scoring") THEN the system's frontend pipeline visualizer does not reflect these stage changes in real-time

1.3 WHEN the backend calls `stage_callback` with stage indices 0, 1, 2, 3, 4, 5, 6 THEN the system sends stage indices in the wrong order (0, 1, 3, 2, 4, 5, 6) causing animation confusion

1.4 WHEN WebSocket messages arrive with stage updates THEN the system's PipelineVisualizer component does not properly map the received stage index to the correct cube animation

#### State Loss Issues

1.5 WHEN a user views a batch processing list with completed resumes THEN clicks on one resume to view its detailed report THEN clicks the back button THEN the system refreshes the entire BatchUploadView component and clears the `jobs` state array, losing all batch data

1.6 WHEN navigation occurs between batch list and detail view THEN the system does not persist the batch state, causing users to lose their processing results

### Expected Behavior (Correct)

#### Pipeline Animation Fixes

2.1 WHEN batch resumes are being processed THEN the system SHALL light up all 8 pipeline stages (0-7) in sequential order as each backend stage completes

2.2 WHEN backend logs show "Stage X/8 — [Stage Name]" THEN the system SHALL immediately update the pipeline visualizer to highlight the corresponding cube for stage X

2.3 WHEN the backend calls `stage_callback` THEN the system SHALL call stages in the correct sequential order: 0 (Upload), 1 (PII Strip), 2 (Blind Score), 3 (Skill Graph), 4 (Bias Detect), 5 (Percentile Rank), 6 (Counterfactual), 7 (Fairness Gate)

2.4 WHEN WebSocket messages arrive with `stage` field THEN the system SHALL correctly map the stage index to the corresponding PIPELINE_STAGES array index in PipelineVisualizer.jsx

#### State Persistence Fixes

2.5 WHEN a user navigates from batch list view to a detailed resume report and back THEN the system SHALL preserve the `jobs` array state and display all previously processed resumes

2.6 WHEN navigation occurs between views THEN the system SHALL maintain batch processing state using React state management or URL-based state persistence

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a batch upload completes successfully THEN the system SHALL CONTINUE TO display the ranked results table with all completed resumes sorted by score

3.2 WHEN WebSocket connection is established for batch processing THEN the system SHALL CONTINUE TO implement heartbeat/ping mechanism and exponential backoff reconnection

3.3 WHEN users click on individual stage cubes in the pipeline visualizer THEN the system SHALL CONTINUE TO filter and highlight jobs currently in that stage

3.4 WHEN batch processing encounters errors THEN the system SHALL CONTINUE TO display error states and messages for failed jobs

3.5 WHEN users upload new files for batch processing THEN the system SHALL CONTINUE TO validate file types and display the file list with size information

3.6 WHEN the "New Batch" button is clicked THEN the system SHALL CONTINUE TO clear the current batch and allow users to start a new batch upload
