# Implementation Plan

## Overview

This implementation plan addresses two critical bugs in the Kanban/Batch system:
1. **Bug 1**: Duplicate notes sections appearing when TalentPoolView re-fetches scans (fixed via diff-and-patch logic)
2. **Bug 2**: Batch results lost on page refresh (fixed via batch_id persistence in database)

The plan focuses on understanding the problems, implementing the fixes, and manually verifying the solutions work correctly while preserving all existing functionality.

## Tasks

### Bug 1: Duplicate Notes (Diff-and-Patch Fix)

- [x] 1. Understand the duplicate notes problem
  - Read `frontend/src/components/KanbanBoardView.jsx` around line 169
  - Identify the problematic `useEffect` hook that resets scans on every `initialScans` reference change
  - Read `frontend/src/components/TalentPoolView.jsx` to understand how scans are fetched and passed
  - Document the current behavior: how array reference changes trigger full component remounts
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 2. Implement diff-and-patch logic in KanbanBoardView
  - [x] 2.1 Add scan equality helper function
    - Create `scansEqual(a, b)` function that compares scan objects by key fields
    - Compare: `id`, `kanban_stage`, `recruiter_notes`, `fit_score`, `stage_updated_at`
    - _Requirements: 2.1, 2.3_
  
  - [x] 2.2 Replace naive useEffect with diff-and-patch mechanism
    - Replace line 169's `React.useEffect(() => { setScans(initialScans); }, [initialScans]);`
    - Implement diff-and-patch logic that preserves object references for unchanged scans
    - Build lookup map from `prevScans` for fast access by `scan.id`
    - For each scan in `initialScans`, check if it exists in `prevMap` and is equal
    - If equal, preserve the previous scan reference (prevents remount)
    - If new or changed, use the new scan reference
    - Return patched array with preserved references
    - _Bug_Condition: isBugCondition1(input) where initialScans !== previousScans but data is identical_
    - _Expected_Behavior: Preserve component instances for unchanged scans, preventing remounting_
    - _Preservation: All Kanban drag-and-drop, notes editing, AI suggestions, and stage timestamps must continue to work_
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4_

- [~] 3. Manual verification of Bug 1 fix
  - Open Talent Pool view with several candidate cards
  - Expand notes on one or more cards
  - Navigate away from Talent Pool and return (triggers refetch)
  - Verify notes remain expanded and do not flicker or duplicate
  - Verify drag-and-drop still works correctly
  - Verify notes editing with debounced save still works
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4_

## Bug 2: Batch Persistence (Database Schema + API + Frontend)

- [~] 4. Understand the batch persistence problem
  - Read `backend/database.py` to understand the `ScanRecord` model
  - Read `backend/main.py` to understand the `/analyze` endpoint
  - Read `frontend/src/components/BatchUploadView.jsx` to understand batch upload flow
  - Document the current behavior: batch results stored only in component state, no batch_id in database
  - _Requirements: 1.5, 1.6, 1.7, 1.8_

- [ ] 5. Add batch_id column to database
  - [~] 5.1 Update ScanRecord model in database.py
    - Add `batch_id = Column(String(36), nullable=True, index=True)` to `ScanRecord` class (around line 120)
    - Add migration in `init_db()` function: `_run_migration("scan_records", "batch_id", "VARCHAR(36)")` (around line 280)
    - _Requirements: 2.6, 3.9_
  
  - [~] 5.2 Update create_scan_record function
    - Add `batch_id: str | None = None` parameter to function signature (around line 350)
    - Add `batch_id=batch_id` to `ScanRecord()` constructor
    - _Requirements: 2.6, 3.9_
  
  - [~] 5.3 Update get_user_scans function
    - Add `"batch_id": r.batch_id` to the dictionary returned for each scan (around line 380)
    - _Requirements: 2.7, 2.8, 3.10_

- [ ] 6. Update API to accept and store batch_id
  - [~] 6.1 Update /analyze endpoint request model
    - Add `batch_id: str | None = None` field to `AnalyzeRequest` class in `backend/main.py`
    - _Requirements: 2.6_
  
  - [~] 6.2 Pass batch_id to create_scan_record
    - When calling `create_scan_record()`, pass `batch_id=request.batch_id` parameter
    - _Requirements: 2.6_

- [ ] 7. Generate and pass batch_id in frontend
  - [~] 7.1 Add UUID generation function
    - Add `generateBatchId()` function to `BatchUploadView.jsx` that generates a UUID v4
    - Use the standard UUID generation pattern with Math.random()
    - _Requirements: 2.5_
  
  - [~] 7.2 Generate batch_id on "Start Processing"
    - In `handleStartProcessing()` function, call `generateBatchId()` to create a unique batch_id
    - Store batch_id in component state using `setBatchId(batchId)`
    - _Requirements: 2.5_
  
  - [~] 7.3 Pass batch_id to /analyze endpoint
    - When calling `/analyze` endpoint, include `batch_id: batchId` in the request body
    - Add batch_id to job state object for tracking
    - _Requirements: 2.6_

- [~] 8. Display batch information in Kanban (optional enhancement)
  - Add small badge to `KanbanBoardView.jsx` CandidateCard to show batch_id (first 8 characters)
  - Display only if `scan.batch_id` exists
  - Use subtle styling (e.g., `text-[10px] text-white/30 font-mono`)
  - _Requirements: 2.8_

- [~] 9. Manual verification of Bug 2 fix
  - Upload a batch of 3-5 resumes using batch upload
  - Wait for batch processing to complete
  - Note the batch results displayed
  - Refresh the page (F5 or Ctrl+R)
  - Navigate to Talent Pool Kanban view
  - Verify all batch resumes appear with batch_id information
  - Verify batch cohort information is visible (if badge was added)
  - Verify existing scans without batch_id still display correctly
  - _Requirements: 2.5, 2.6, 2.7, 2.8, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10_

### Final Checkpoint

- [~] 10. Comprehensive manual verification
  - Verify Bug 1 fix: Notes remain stable across refetches, no duplication or flickering
  - Verify Bug 2 fix: Batch results persist across page refresh
  - Verify preservation: All existing Kanban and batch upload functionality works unchanged
  - Test drag-and-drop between stages
  - Test notes editing with debounced save
  - Test AI stage suggestions display
  - Test single resume upload (non-batch) still works
  - Test WebSocket real-time updates during batch processing
  - Ask user if any issues arise or if additional testing is needed
  - _Requirements: All requirements 1.1-3.10_

## Task Dependency Graph

```json
{
  "waves": [
    {
      "name": "Understanding Phase",
      "tasks": ["1", "4"]
    },
    {
      "name": "Bug 1 Implementation",
      "tasks": ["2"]
    },
    {
      "name": "Bug 2 Database Layer",
      "tasks": ["5"]
    },
    {
      "name": "Bug 2 API Layer",
      "tasks": ["6"]
    },
    {
      "name": "Bug 2 Frontend Layer",
      "tasks": ["7"]
    },
    {
      "name": "Optional Enhancement",
      "tasks": ["8"]
    },
    {
      "name": "Individual Verification",
      "tasks": ["3", "9"]
    },
    {
      "name": "Final Verification",
      "tasks": ["10"]
    }
  ]
}
```

**Visual Dependency Flow:**
```
1 (Understand Bug 1)          4 (Understand Bug 2)
  ↓                              ↓
2 (Implement diff-and-patch)   5 (Add batch_id to database)
  ↓                              ↓
3 (Manual verification Bug 1)  6 (Update API)
                                 ↓
                               7 (Generate batch_id in frontend)
                                 ↓
                               8 (Display batch info - optional)
                                 ↓
                               9 (Manual verification Bug 2)

3 + 9
  ↓
10 (Final comprehensive verification)
```

**Dependencies:**
- Tasks 1-3 (Bug 1) can be done independently of tasks 4-9 (Bug 2)
- Task 2 depends on task 1 (must understand before implementing)
- Task 3 depends on task 2 (must implement before verifying)
- Task 5 depends on task 4 (must understand before implementing)
- Task 6 depends on task 5 (API needs database schema in place)
- Task 7 depends on task 6 (frontend needs API ready)
- Task 8 depends on task 7 (display needs batch_id available)
- Task 9 depends on tasks 5-8 (all components must be in place)
- Task 10 depends on tasks 3 and 9 (both bugs must be fixed)

## Notes

**Important Considerations:**

1. **No Automated Tests**: Per user request, this plan skips all property-based tests, unit tests, and integration tests. All verification is manual.

2. **Bug 1 (Diff-and-Patch)**:
   - The fix preserves React component instances by maintaining object references for unchanged scans
   - This prevents unnecessary remounting and DOM flickering
   - The `scansEqual()` helper compares key fields to determine if a scan has changed

3. **Bug 2 (Batch Persistence)**:
   - The `batch_id` column is nullable to support existing scans without batch_id
   - UUID v4 format ensures globally unique batch identifiers
   - The migration runs automatically via `_run_migration()` on server startup

4. **Preservation Requirements**:
   - All existing Kanban functionality (drag-and-drop, notes, AI suggestions) must remain unchanged
   - All existing batch upload functionality (8-stage pipeline, WebSocket updates) must remain unchanged
   - Existing scans without batch_id must continue to work correctly

5. **Manual Verification Strategy**:
   - Test both bugs independently first (tasks 3 and 9)
   - Then test comprehensive integration (task 10)
   - Focus on edge cases: page refresh, navigation, existing data without batch_id

6. **Optional Enhancement**:
   - Task 8 (batch badge display) is optional but recommended for better UX
   - Shows first 8 characters of batch_id in a subtle badge on each card
