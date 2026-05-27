# Kanban Batch Bugfixes Design

## Overview

This design addresses two critical bugs in the Kanban board system that affect UI stability and data persistence:

1. **The "2 Notes" Glitch**: Visual flickering and duplicate DOM nodes in CandidateCard components caused by unnecessary re-renders when the Kanban board refreshes. The root cause is inefficient state management that resets the entire scans array on every parent update, forcing React to remount all card components even when data hasn't changed.

2. **Batch Persistence Problem**: Loss of batch cohort information after page refresh due to missing database schema support for batch tracking. Currently, batch state exists only in component memory, and individual scan records lack a batch_id column to maintain cohort relationships.

The fix strategy involves:
- Implementing intelligent state diffing in KanbanBoardView to patch only changed records
- Ensuring stable React keys for efficient reconciliation
- Adding batch_id column to the database schema
- Persisting batch metadata across page refreshes
- Providing UI affordances to filter/group by batch

## Glossary

- **Bug_Condition_1 (C1)**: The condition that triggers the "2 Notes" glitch - when TalentPoolView re-fetches scans and passes a new array reference to KanbanBoardView
- **Bug_Condition_2 (C2)**: The condition that triggers batch persistence loss - when a user refreshes the page after batch upload
- **Property_1 (P1)**: The desired behavior for C1 - CandidateCard components should not remount when underlying data hasn't changed
- **Property_2 (P2)**: The desired behavior for C2 - batch cohort information should persist across page refreshes
- **Preservation**: All existing Kanban functionality (drag-drop, notes, AI suggestions) and batch upload processing must remain unchanged
- **KanbanBoardView**: The component in `frontend/src/components/KanbanBoardView.jsx` that manages the Kanban board state and renders columns
- **CandidateCard**: The component in `KanbanBoardView.jsx` that renders individual candidate cards with notes, scores, and drag-drop functionality
- **TalentPoolView**: The parent component in `frontend/src/components/TalentPoolView.jsx` that fetches scan data and passes it to KanbanBoardView
- **BatchUploadView**: The component in `frontend/src/components/BatchUploadView.jsx` that handles batch resume uploads and displays processing status
- **initialScans**: The prop passed from TalentPoolView to KanbanBoardView containing the array of scan records
- **scans state**: The internal state in KanbanBoardView that stores the current list of candidate scans
- **React reconciliation**: React's algorithm for efficiently updating the DOM by comparing virtual DOM trees using component keys

## Bug Details

### Bug Condition 1: The "2 Notes" Glitch

The bug manifests when TalentPoolView re-fetches scan data (via polling, user navigation, or component re-mount) and passes a new `initialScans` array reference to KanbanBoardView. The `React.useEffect(() => { setScans(initialScans); }, [initialScans])` hook in KanbanBoardView triggers on every new array reference, resetting the entire `scans` state even when the underlying data is identical. This causes React to force-remount all CandidateCard components, leading to visual artifacts where the old DOM node briefly coexists with the new one, particularly visible in the notes section.

**Formal Specification:**
```
FUNCTION isBugCondition1(input)
  INPUT: input of type { prevScans: Array, newScans: Array }
  OUTPUT: boolean
  
  RETURN prevScans !== newScans                    // Different array reference
         AND deepEqual(prevScans, newScans)        // But identical data
         AND useEffect dependency triggers         // Causes full state reset
         AND React remounts all CandidateCards     // Even unchanged ones
END FUNCTION
```

### Examples

- **Example 1**: User views Talent Pool board with 10 candidates. TalentPoolView re-fetches every 30 seconds. On each fetch, even though no data changed, all 10 CandidateCard components remount, causing notes sections to flicker.
- **Example 2**: User opens notes on Card A, types a note. While typing, TalentPoolView re-fetches. The notes textarea briefly shows duplicate DOM nodes (old + new), causing visual glitch.
- **Example 3**: User drags Card B to a new stage. The optimistic update succeeds, but the next fetch triggers a full remount, causing the card to visually "jump" or flicker.
- **Edge Case**: User has 50+ candidates on the board. Every re-fetch causes 50+ component remounts, leading to noticeable performance degradation and visual stuttering.

### Bug Condition 2: Batch Persistence Problem

The bug manifests when a user uploads a batch of resumes in BatchUploadView, then refreshes the page. The batch state (jobs array, batchId) exists only in component-level memory and is lost on refresh. Additionally, when individual resumes are processed via the `/analyze` or `/batch-analyze` endpoint, the system creates scan records in the database without a `batch_id` column to track which batch they belong to. This makes it impossible to reconstruct batch cohorts after page refresh or to filter/group candidates by batch in the Talent Pool view.

**Formal Specification:**
```
FUNCTION isBugCondition2(input)
  INPUT: input of type { action: string, hasRefreshed: boolean }
  OUTPUT: boolean
  
  RETURN input.action === 'batch_upload'
         AND batch_results_exist_in_memory
         AND input.hasRefreshed === true
         AND database_lacks_batch_id_column
         AND scan_records_cannot_be_grouped_by_batch
END FUNCTION
```

### Examples

- **Example 1**: User uploads 10 resumes in batch mode. All process successfully with scores displayed. User refreshes the page. The batch results disappear, and the Talent Pool shows 10 individual candidates with no indication they came from the same batch.
- **Example 2**: User uploads Batch A (5 resumes) on Monday, Batch B (8 resumes) on Tuesday. After refresh, all 13 candidates appear in Talent Pool with no way to filter "show me only Batch A candidates."
- **Example 3**: User wants to compare candidates within a batch cohort (e.g., "which candidate from Batch A scored highest?"). No UI affordance exists to group or filter by batch.
- **Edge Case**: User uploads a batch, some jobs complete, some are still processing. User refreshes. All progress is lost, and there's no way to reconnect to the in-progress batch jobs.

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Drag-and-drop functionality for moving candidates between Kanban stages must continue to work exactly as before
- Notes editing with auto-save debouncing must continue to work exactly as before
- AI stage suggestions based on fit_score must continue to display and function correctly
- Batch upload processing through the 8-stage pipeline must continue to work exactly as before
- WebSocket real-time updates for batch job progress must continue to work exactly as before
- List view and Board view toggle in TalentPoolView must continue to work exactly as before
- Search/filter functionality in TalentPoolView must continue to work exactly as before
- Score color coding (green ≥75, yellow ≥50, red <50) must continue to display correctly
- All existing API endpoints must continue to return the same data structures

**Scope:**
All inputs that do NOT involve the specific bug conditions should be completely unaffected by this fix. This includes:
- Initial page load and first render of the Kanban board
- User interactions that don't trigger re-fetches (clicking, typing, dragging)
- Single resume uploads (non-batch mode)
- Any other views or components not directly involved in Kanban board rendering or batch tracking

## Hypothesized Root Cause

Based on the bug description and code analysis, the most likely issues are:

### Bug 1: The "2 Notes" Glitch

1. **Inefficient State Synchronization**: The `React.useEffect(() => { setScans(initialScans); }, [initialScans])` hook in KanbanBoardView treats every new array reference as a signal to completely reset state, even when the data is identical. This is an anti-pattern for derived state.
   - The dependency array `[initialScans]` triggers on reference equality, not deep equality
   - `setScans(initialScans)` replaces the entire state array, breaking React's reconciliation optimization

2. **Lack of Intelligent Diffing**: The component doesn't diff the incoming data against current state to identify what actually changed. A proper implementation would:
   - Compare `initialScans` with current `scans` state
   - Identify added, removed, and updated records
   - Patch only the changed records using `setScans(prev => ...)`

3. **Unstable React Keys**: While the code uses `scan.id` as keys, if the entire array is replaced, React may not efficiently reconcile components, especially if IDs are reused or if the array order changes.

4. **Component Remounting Side Effects**: When CandidateCard components remount, their internal state (noteOpen, localNote) is reset, and new DOM nodes are created. React's cleanup may not be immediate, causing old and new nodes to briefly coexist.

### Bug 2: Batch Persistence Problem

1. **Missing Database Schema**: The database schema lacks a `batch_id` column in the scan records table. Without this column, there's no way to persist the relationship between a scan and its originating batch.
   - Current schema likely has: `id`, `user_id`, `file_name`, `fit_score`, `kanban_stage`, `timestamp`, `result_json`, etc.
   - Missing: `batch_id` (nullable string/UUID to link scans to a batch)

2. **Component-Only State**: BatchUploadView stores batch state (`jobs`, `batchId`) in React component state, which is lost on page refresh. There's no mechanism to:
   - Persist batch metadata to the database
   - Reconstruct batch state from the database on page load
   - Resume monitoring in-progress batch jobs after refresh

3. **API Endpoint Limitations**: The `/user/scans` endpoint likely doesn't include `batch_id` in the response, and there's no endpoint to fetch batch metadata or filter scans by batch.

4. **Frontend State Management**: BatchUploadView doesn't attempt to restore batch state from the database or URL parameters on mount, so even if the data existed in the database, the UI wouldn't know to fetch it.

## Correctness Properties

Property 1: Bug Condition 1 - Efficient Kanban State Updates

_For any_ state update where TalentPoolView passes new scan data to KanbanBoardView, the fixed component SHALL intelligently diff the incoming data against current state, identify only the records that have actually changed (added, removed, or updated), and patch the state array to preserve existing component instances for unchanged records, preventing unnecessary CandidateCard remounts and eliminating visual artifacts like the "2 Notes" glitch.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

Property 2: Bug Condition 2 - Batch Persistence Across Refreshes

_For any_ batch upload operation, the fixed system SHALL persist the batch_id in the database for each scan record created from that batch, store batch metadata (batch_id, timestamp, role, file count) in a dedicated table or within scan records, and provide a mechanism for the frontend to reconstruct batch state from the database after page refresh, enabling users to view, filter, and group candidates by their originating batch cohort.

**Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5**

Property 3: Preservation - Existing Kanban Functionality

_For any_ user interaction that does NOT involve the specific bug conditions (initial load, drag-drop, notes editing, AI suggestions, stage updates), the fixed code SHALL produce exactly the same behavior as the original code, preserving all existing Kanban board functionality including drag-and-drop stage changes, notes auto-save, AI stage suggestions, score display, and list/board view toggling.

**Validates: Requirements 5.1, 5.2, 5.3, 5.4**

Property 4: Preservation - Batch Upload Processing

_For any_ batch upload operation, the fixed code SHALL continue to process each resume through the full 8-stage pipeline with real-time WebSocket updates, display progress visualizations, show ranked results, and maintain all existing batch upload functionality, with the only change being the addition of batch_id tracking in the database.

**Validates: Requirements 5.5, 5.6, 5.7, 5.8**

Property 5: Preservation - Data Integrity

_For any_ resume analysis (single or batch), the fixed code SHALL continue to create scan records with all existing fields (fit_score, role_target, file_name, timestamp, result_json, etc.), return complete analysis data from the /analyze endpoint, and maintain all existing data structures and API contracts, with the only addition being the optional batch_id field.

**Validates: Requirements 5.9, 5.10, 5.11, 5.12**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

#### Bug 1: The "2 Notes" Glitch

**File**: `frontend/src/components/KanbanBoardView.jsx`

**Function**: `KanbanBoardView` component

**Specific Changes**:

1. **Replace Naive State Sync with Intelligent Diffing**:
   - Remove the current `React.useEffect(() => { setScans(initialScans); }, [initialScans])` hook
   - Implement a new effect that diffs `initialScans` against current `scans` state
   - Use a Map or Set to efficiently identify added, removed, and updated records by `scan.id`
   - Patch the state array using `setScans(prev => ...)` to preserve unchanged records

2. **Implement Deep Equality Check**:
   - Before patching, check if a record has actually changed using deep equality comparison
   - Only update records where `JSON.stringify(oldScan) !== JSON.stringify(newScan)` (or use a proper deep equality library)
   - This prevents unnecessary re-renders even for records that appear in both arrays

3. **Ensure Stable React Keys**:
   - Verify that `scan.id` is used consistently as the key prop in all `.map()` calls
   - Ensure `scan.id` is unique and stable across re-fetches
   - If IDs can change, consider using a composite key like `${scan.id}-${scan.timestamp}`

4. **Optimize CandidateCard Memoization**:
   - Wrap CandidateCard in `React.memo()` to prevent re-renders when props haven't changed
   - Ensure all callback props (onMove, onDragStart) are stable references using `useCallback`

5. **Add Reconciliation Debugging**:
   - Add console logs or React DevTools profiling to verify that unchanged cards are not remounting
   - Test with a large dataset (50+ candidates) to ensure performance improvements

**Example Implementation Pattern**:
```javascript
React.useEffect(() => {
  setScans(prev => {
    const prevMap = new Map(prev.map(s => [s.id, s]));
    const newMap = new Map(initialScans.map(s => [s.id, s]));
    
    // Identify changes
    const updated = [];
    for (const [id, newScan] of newMap) {
      const oldScan = prevMap.get(id);
      if (!oldScan || JSON.stringify(oldScan) !== JSON.stringify(newScan)) {
        updated.push(newScan);
      } else {
        updated.push(oldScan); // Preserve reference for unchanged records
      }
    }
    
    return updated;
  });
}, [initialScans]);
```

#### Bug 2: Batch Persistence Problem

**File 1**: Backend database schema (location TBD - likely in a migration file or ORM model definition)

**Changes**:
1. **Add batch_id Column to Scan Records Table**:
   - Add a nullable `batch_id` column (VARCHAR/UUID) to the scans table
   - Add an index on `batch_id` for efficient filtering
   - Migration should be backward-compatible (nullable column, default NULL)

2. **Create Batch Metadata Table (Optional)**:
   - If batch-level metadata is needed (e.g., batch name, upload timestamp, total count), create a `batches` table
   - Schema: `id` (PK), `user_id`, `role_target`, `created_at`, `file_count`, `status`
   - Foreign key relationship: `scans.batch_id` → `batches.id`

**File 2**: Backend API endpoints (location TBD - likely in main application file)

**Changes**:
1. **Update /batch-analyze Endpoint**:
   - Generate a unique `batch_id` (UUID) when a batch upload is initiated
   - Pass `batch_id` to each resume processing job
   - Store `batch_id` in each scan record created from the batch

2. **Update /analyze Endpoint**:
   - Accept an optional `batch_id` parameter
   - If provided, store it in the scan record

3. **Update /user/scans Endpoint**:
   - Include `batch_id` in the response for each scan
   - Add optional query parameter `?batch_id=<uuid>` to filter scans by batch
   - Add optional query parameter `?include_result=true` to include full `result_json` blob

4. **Add /user/batches Endpoint (Optional)**:
   - Return a list of all batches for the authenticated user
   - Include metadata: batch_id, created_at, role_target, file_count, completed_count

**File 3**: `frontend/src/components/BatchUploadView.jsx`

**Changes**:
1. **Persist Batch State to URL**:
   - When a batch is submitted, update the URL with `?batch_id=<uuid>` query parameter
   - On component mount, check for `batch_id` in URL and attempt to restore batch state from the API

2. **Fetch Batch State from API**:
   - If `batch_id` is in URL, call `/user/scans?batch_id=<uuid>` to fetch all scans from that batch
   - Reconstruct the `jobs` array from the fetched scans
   - If any jobs are still processing, reconnect to the WebSocket for that batch

3. **Display Batch Metadata**:
   - Show batch_id, upload timestamp, and total count in the UI
   - Provide a "View in Talent Pool" button that navigates to TalentPoolView with batch filter applied

**File 4**: `frontend/src/components/TalentPoolView.jsx`

**Changes**:
1. **Add Batch Filter UI**:
   - Add a dropdown or filter button to select "All Candidates" or filter by specific batch
   - Fetch list of batches from `/user/batches` endpoint
   - When a batch is selected, filter the displayed scans to only show those with matching `batch_id`

2. **Display Batch Badge**:
   - In both list and board views, display a small badge on each candidate card showing their batch_id (e.g., "Batch A", "Batch #1234")
   - Make the badge clickable to filter by that batch

**File 5**: `frontend/src/components/KanbanBoardView.jsx`

**Changes**:
1. **Display Batch Information**:
   - If a scan has a `batch_id`, display it in the CandidateCard footer
   - Style batch badges consistently with other metadata (timestamp, stage)

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bugs on unfixed code, then verify the fixes work correctly and preserve existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bugs BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

#### Bug 1: The "2 Notes" Glitch

**Test Plan**: Write tests that simulate TalentPoolView re-fetching scan data with identical content but different array references. Observe CandidateCard component mount/unmount behavior using React DevTools or test utilities. Run these tests on the UNFIXED code to observe unnecessary remounts and visual artifacts.

**Test Cases**:
1. **Identical Data Re-fetch Test**: Render KanbanBoardView with 10 scans. Pass the same data with a new array reference. Assert that all 10 CandidateCard components remount (will fail on unfixed code - this is the bug).
2. **Notes Section Flicker Test**: Open notes on a card, then trigger a re-fetch. Observe if the notes textarea briefly shows duplicate DOM nodes or flickers (will fail on unfixed code).
3. **Performance Test**: Render KanbanBoardView with 50 scans. Trigger 10 consecutive re-fetches with identical data. Measure total render time and component mount count (will show poor performance on unfixed code).
4. **Partial Update Test**: Render with 10 scans. Update only 1 scan's data and trigger re-fetch. Assert that only 1 CandidateCard remounts, not all 10 (will fail on unfixed code).

**Expected Counterexamples**:
- All CandidateCard components remount on every re-fetch, even when data is identical
- Notes sections flicker or show duplicate DOM nodes during re-fetch
- Performance degrades significantly with large datasets (50+ candidates)
- Possible causes: naive state sync, lack of diffing, unstable keys, inefficient reconciliation

#### Bug 2: Batch Persistence Problem

**Test Plan**: Write tests that simulate batch upload, page refresh, and attempt to reconstruct batch state. Query the database to verify batch_id is missing. Run these tests on the UNFIXED code to observe data loss and inability to group by batch.

**Test Cases**:
1. **Batch Upload and Refresh Test**: Upload a batch of 5 resumes. Wait for completion. Refresh the page. Assert that batch state is lost and cannot be reconstructed (will fail on unfixed code).
2. **Database Schema Test**: Query the scans table schema. Assert that `batch_id` column exists (will fail on unfixed code - column doesn't exist).
3. **API Response Test**: Call `/user/scans` endpoint. Assert that response includes `batch_id` field for each scan (will fail on unfixed code - field is missing).
4. **Batch Grouping Test**: Upload 2 batches (Batch A: 3 resumes, Batch B: 5 resumes). Attempt to filter Talent Pool to show only Batch A candidates. Assert that filtering works (will fail on unfixed code - no batch_id to filter by).

**Expected Counterexamples**:
- Batch state is lost on page refresh, cannot be reconstructed
- Database lacks `batch_id` column in scans table
- API responses don't include batch_id
- No UI affordance to filter or group by batch
- Possible causes: missing schema, component-only state, no persistence mechanism

### Fix Checking

**Goal**: Verify that for all inputs where the bug conditions hold, the fixed functions produce the expected behavior.

#### Bug 1: The "2 Notes" Glitch - Fix Verification

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition1(input) DO
  result := KanbanBoardView_fixed(input)
  ASSERT expectedBehavior1(result)
END FOR

FUNCTION expectedBehavior1(result)
  RETURN result.unchangedCardsDidNotRemount === true
         AND result.noteSectionStable === true
         AND result.visualArtifactsCount === 0
         AND result.performanceAcceptable === true
END FUNCTION
```

**Test Cases**:
1. **Identical Data Re-fetch Test (Fixed)**: Render KanbanBoardView with 10 scans. Pass the same data with a new array reference. Assert that 0 CandidateCard components remount.
2. **Notes Section Stability Test (Fixed)**: Open notes on a card, then trigger a re-fetch. Assert that the notes textarea remains stable with no flickering or duplicate nodes.
3. **Performance Test (Fixed)**: Render KanbanBoardView with 50 scans. Trigger 10 consecutive re-fetches with identical data. Assert that render time is minimal and no unnecessary mounts occur.
4. **Partial Update Test (Fixed)**: Render with 10 scans. Update only 1 scan's data and trigger re-fetch. Assert that exactly 1 CandidateCard remounts, not all 10.

#### Bug 2: Batch Persistence Problem - Fix Verification

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition2(input) DO
  result := BatchUploadView_fixed(input)
  ASSERT expectedBehavior2(result)
END FOR

FUNCTION expectedBehavior2(result)
  RETURN result.batchIdPersistedInDatabase === true
         AND result.batchStateReconstructedAfterRefresh === true
         AND result.canFilterByBatch === true
         AND result.batchMetadataAvailable === true
END FUNCTION
```

**Test Cases**:
1. **Batch Upload and Refresh Test (Fixed)**: Upload a batch of 5 resumes. Wait for completion. Refresh the page. Assert that batch state is reconstructed from the database and displayed correctly.
2. **Database Schema Test (Fixed)**: Query the scans table schema. Assert that `batch_id` column exists and is properly indexed.
3. **API Response Test (Fixed)**: Call `/user/scans` endpoint. Assert that response includes `batch_id` field for each scan from a batch.
4. **Batch Grouping Test (Fixed)**: Upload 2 batches (Batch A: 3 resumes, Batch B: 5 resumes). Filter Talent Pool to show only Batch A candidates. Assert that exactly 3 candidates are displayed.

### Preservation Checking

**Goal**: Verify that for all inputs where the bug conditions do NOT hold, the fixed functions produce the same result as the original functions.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition1(input) AND NOT isBugCondition2(input) DO
  ASSERT originalBehavior(input) = fixedBehavior(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for all non-bug scenarios, then write property-based tests capturing that behavior.

**Test Cases**:

1. **Drag-and-Drop Preservation**: Observe that dragging a card between stages works correctly on unfixed code. Write property-based test that generates random drag-drop sequences and verifies the stage updates correctly after fix.

2. **Notes Auto-Save Preservation**: Observe that typing notes triggers auto-save with debouncing on unfixed code. Write property-based test that generates random note text and verifies auto-save behavior is identical after fix.

3. **AI Suggestions Preservation**: Observe that AI stage suggestions appear based on fit_score on unfixed code. Write property-based test that generates random scores and verifies suggestion logic is unchanged after fix.

4. **Batch Processing Preservation**: Observe that batch uploads process through all 8 stages with WebSocket updates on unfixed code. Write property-based test that generates random batch uploads and verifies processing pipeline is unchanged after fix.

5. **List/Board View Toggle Preservation**: Observe that toggling between list and board views works correctly on unfixed code. Write property-based test that generates random view toggle sequences and verifies behavior is identical after fix.

6. **Search/Filter Preservation**: Observe that search and filter functionality works correctly on unfixed code. Write property-based test that generates random search queries and verifies results are identical after fix.

### Unit Tests

- Test intelligent diffing logic in KanbanBoardView with various scenarios (all same, all different, partial updates, additions, deletions)
- Test CandidateCard memoization to ensure it doesn't re-render when props are unchanged
- Test batch_id persistence in database (insert, query, filter)
- Test API endpoints with and without batch_id parameter
- Test BatchUploadView state reconstruction from URL and API
- Test TalentPoolView batch filter UI with various batch selections

### Property-Based Tests

- Generate random scan datasets and verify KanbanBoardView only remounts changed cards
- Generate random batch uploads and verify batch_id is correctly persisted for all scans
- Generate random user interactions (drag, notes, search) and verify behavior is preserved across re-fetches
- Generate random page refresh scenarios and verify batch state is correctly reconstructed
- Test that all non-keyboard inputs continue to work across many scenarios

### Integration Tests

- Test full user flow: upload batch → view in Talent Pool → refresh page → verify batch is still visible and filterable
- Test full user flow: view Kanban board → trigger re-fetch → verify no visual glitches or performance issues
- Test full user flow: upload batch → some jobs complete → refresh → verify in-progress jobs can be reconnected
- Test full user flow: upload multiple batches → filter by each batch → verify correct candidates are shown
- Test that visual feedback (no flickering, stable notes) occurs during re-fetches with large datasets
