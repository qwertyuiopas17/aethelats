# Kanban Batch Persistence Fix - Bugfix Design

## Overview

This design addresses two critical bugs in the Kanban/Batch system:

1. **The "2 Notes Bug"**: Duplicate notes sections appearing when TalentPoolView re-fetches scans due to React component remounting caused by array reference changes
2. **Batch Persistence Problem**: Batch results lost on page refresh because batch_id is not stored in the database

The fix strategy involves:
- Implementing a diff-and-patch mechanism to update only changed scan records, preserving component stability
- Adding a `batch_id` column to the `scan_records` table to enable persistent batch tracking
- Modifying the batch upload flow to generate and persist batch_id for all resumes in a batch
- Ensuring minimal changes to preserve all existing Kanban and batch upload functionality

## Glossary

- **Bug_Condition_1 (C1)**: The condition that triggers the duplicate notes bug - when TalentPoolView passes a new array reference to KanbanBoardView
- **Bug_Condition_2 (C2)**: The condition that triggers the batch persistence bug - when a user refreshes the page after completing a batch analysis
- **Property (P)**: The desired behavior - stable card rendering without duplicates, and persistent batch tracking across sessions
- **Preservation**: All existing Kanban drag-and-drop, notes, stage updates, and batch processing functionality must remain unchanged
- **Diff-and-Patch**: A strategy to compare old and new scan arrays and update only changed records, preserving React component instances
- **batch_id**: A UUID generated when a batch analysis is initiated, stored with each ScanRecord to track batch cohorts
- **ScanRecord**: Database model in `backend/database.py` representing one resume analysis result
- **KanbanBoardView**: React component in `frontend/src/components/KanbanBoardView.jsx` that renders the Kanban board
- **TalentPoolView**: React component in `frontend/src/components/TalentPoolView.jsx` that fetches and displays scans

## Bug Details

### Bug Condition 1: Duplicate Notes Appearing

The bug manifests when TalentPoolView re-fetches scans (via polling, component re-mount, or user navigation). The `KanbanBoardView` component receives a new `initialScans` array reference, triggering a `useEffect` hook that resets the entire scans state, causing React to remount `CandidateCard` components with new keys.

**Formal Specification:**
```
FUNCTION isBugCondition1(input)
  INPUT: input of type { initialScans: Array<ScanRecord>, previousScans: Array<ScanRecord> }
  OUTPUT: boolean
  
  RETURN input.initialScans !== input.previousScans  // New array reference
         AND arrayContentEquals(input.initialScans, input.previousScans)  // Same data
         AND input.initialScans.length > 0
END FUNCTION
```

**Root Cause:**
The problematic code in `KanbanBoardView.jsx` line 169:
```javascript
React.useEffect(() => { setScans(initialScans); }, [initialScans]);
```

This effect triggers whenever `initialScans` reference changes, even if the actual data is identical. When `setScans` is called with a completely new array, React's reconciliation algorithm may:
1. Temporarily keep old DOM nodes alive while mounting new ones
2. Cause flickering or duplication of notes sections
3. Reset internal component state (like `noteOpen`, `localNote`)

### Bug Condition 2: Batch Results Lost on Refresh

The bug manifests when a user completes a batch analysis and then refreshes the page. Batch results are stored only in component-level memory (`jobs` state in `AppLogic.js`), and the database has no `batch_id` column to track which batch a resume belongs to.

**Formal Specification:**
```
FUNCTION isBugCondition2(input)
  INPUT: input of type { action: string, hasBatchId: boolean, pageRefreshed: boolean }
  OUTPUT: boolean
  
  RETURN input.action === 'batch_analysis_completed'
         AND input.hasBatchId === false
         AND input.pageRefreshed === true
END FUNCTION
```

**Root Cause:**
1. **Missing Database Column**: The `scan_records` table in `backend/database.py` has no `batch_id` column
2. **No Batch ID Generation**: The batch upload flow does not generate a unique batch_id when processing begins
3. **No Batch ID Persistence**: The `/analyze` endpoint does not accept or store a batch_id parameter
4. **Component-Only State**: Batch results exist only in `BatchUploadView` component state, lost on unmount

### Examples

**Bug 1 Examples:**
- User opens Talent Pool view → sees 5 candidate cards → navigates away → returns to Talent Pool → cards remount → notes sections flicker/duplicate
- User has Talent Pool open → backend adds a new scan → polling refetches scans → entire array resets → all cards remount → notes UI glitches
- User expands notes on Card A → TalentPoolView refetches → Card A remounts → notes section collapses and may briefly duplicate

**Bug 2 Examples:**
- User uploads 10 resumes in batch mode → batch completes → user sees ranked results → user refreshes page → batch results disappear, only individual scans remain in Talent Pool
- User wants to filter Kanban by "batch from yesterday" → no batch_id exists → cannot filter or group by batch
- User wants to compare candidates from the same batch → no way to identify which resumes were in the same batch cohort

## Expected Behavior

### Bug 1: Stable Card Rendering

**Correct Behavior:**
When TalentPoolView re-fetches scans, the system SHALL:
1. Compare the new `initialScans` array with the current `scans` state
2. Identify added, removed, and updated records by comparing `scan.id`
3. Update only the changed records, preserving existing component instances
4. Maintain stable React keys for unchanged cards to prevent remounting
5. Display exactly one notes section per card without flickering or duplication

**Implementation Strategy:**
Replace the naive `useEffect` with a diff-and-patch mechanism:
```javascript
React.useEffect(() => {
  setScans(prevScans => {
    // Build lookup maps
    const prevMap = new Map(prevScans.map(s => [s.id, s]));
    const newMap = new Map(initialScans.map(s => [s.id, s]));
    
    // Patch: update existing, add new, remove deleted
    const patched = initialScans.map(newScan => {
      const prevScan = prevMap.get(newScan.id);
      // If scan exists and data is identical, preserve the reference
      if (prevScan && deepEqual(prevScan, newScan)) {
        return prevScan;  // Preserve reference = no remount
      }
      return newScan;  // New or updated scan
    });
    
    return patched;
  });
}, [initialScans]);
```

### Bug 2: Persistent Batch Tracking

**Correct Behavior:**
When a batch analysis is initiated, the system SHALL:
1. Generate a unique `batch_id` (UUID v4) in the frontend before processing begins
2. Pass the `batch_id` to the `/analyze` endpoint for each resume in the batch
3. Store the `batch_id` in the `scan_records` table for each processed resume
4. Retrieve and display batch information in the Talent Pool view
5. Support filtering/grouping by `batch_id` in the Kanban board

**Implementation Strategy:**
1. **Database Migration**: Add `batch_id VARCHAR(36)` column to `scan_records` table
2. **Batch ID Generation**: Generate UUID in `BatchUploadView.jsx` when "Start Processing" is clicked
3. **API Update**: Modify `/analyze` endpoint to accept optional `batch_id` parameter
4. **Persistence**: Store `batch_id` in `create_scan_record()` function
5. **Retrieval**: Include `batch_id` in `get_user_scans()` response
6. **UI Display**: Show batch cohort information in Kanban cards (optional badge)

### Preservation Requirements

**Unchanged Behaviors:**

**Kanban Functionality:**
- Drag-and-drop between stages must continue to work exactly as before
- Notes editing with debounced persistence must remain unchanged
- AI stage suggestions must continue to display correctly
- Stage timestamps must remain accurate

**Batch Upload Functionality:**
- Concurrent processing through 8-stage pipeline must remain unchanged
- Real-time WebSocket updates must continue to work
- Ranked results display must remain unchanged
- Full analysis report viewing must remain unchanged

**Database Integrity:**
- All existing `scan_records` columns must remain unchanged
- Existing scans without `batch_id` must continue to work (nullable column)
- User authentication and ownership checks must remain unchanged

**Scope:**
All inputs that do NOT involve:
- TalentPoolView refetching scans (Bug 1)
- Page refresh after batch analysis (Bug 2)

Should be completely unaffected by this fix.

## Hypothesized Root Cause

### Bug 1: Duplicate Notes

Based on the bug description and code analysis, the root cause is:

1. **Naive Array Replacement**: The `useEffect` hook unconditionally replaces the entire `scans` array whenever `initialScans` reference changes, even if the data is identical
   ```javascript
   React.useEffect(() => { setScans(initialScans); }, [initialScans]);
   ```

2. **React Reconciliation Issues**: When the entire array is replaced, React's reconciliation algorithm:
   - Sees all new object references (even if data is identical)
   - May decide to remount components instead of updating them
   - Causes brief DOM node duplication during transition

3. **Component State Loss**: When `CandidateCard` remounts:
   - Internal state (`noteOpen`, `localNote`, `noteSaved`) is reset
   - Notes sections collapse unexpectedly
   - Debounced save timers are cleared

4. **Key Stability**: The current implementation uses `scan.id` as the key, which is correct, but the array replacement causes React to see "new" components even with stable keys

### Bug 2: Batch Persistence

Based on the bug description and code analysis, the root causes are:

1. **Missing Database Schema**: The `scan_records` table has no `batch_id` column to store batch cohort information

2. **No Batch ID Generation**: The batch upload flow in `BatchUploadView.jsx` does not generate a unique identifier when processing begins

3. **API Gap**: The `/analyze` endpoint in `backend/main.py` does not accept a `batch_id` parameter

4. **Component-Only State**: Batch results are stored in `jobs` state in `BatchUploadView`, which is lost when:
   - User navigates away from the batch upload view
   - User refreshes the page
   - Component unmounts for any reason

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

#### Bug 1: Diff-and-Patch for Stable Rendering

**File**: `frontend/src/components/KanbanBoardView.jsx`

**Function**: `KanbanBoardView` component

**Specific Changes**:

1. **Replace Naive useEffect**: Replace line 169 with a diff-and-patch mechanism
   ```javascript
   // OLD (line 169):
   React.useEffect(() => { setScans(initialScans); }, [initialScans]);
   
   // NEW:
   React.useEffect(() => {
     setScans(prevScans => {
       // If no previous scans, just use initialScans
       if (prevScans.length === 0) return initialScans;
       
       // Build lookup map for fast access
       const prevMap = new Map(prevScans.map(s => [s.id, s]));
       
       // Patch: preserve references for unchanged scans
       const patched = initialScans.map(newScan => {
         const prevScan = prevMap.get(newScan.id);
         if (prevScan && scansEqual(prevScan, newScan)) {
           return prevScan;  // Preserve reference = no remount
         }
         return newScan;  // New or updated scan
       });
       
       return patched;
     });
   }, [initialScans]);
   ```

2. **Add Equality Helper**: Add a helper function to compare scan objects
   ```javascript
   function scansEqual(a, b) {
     return a.id === b.id
       && a.kanban_stage === b.kanban_stage
       && a.recruiter_notes === b.recruiter_notes
       && a.fit_score === b.fit_score
       && a.stage_updated_at === b.stage_updated_at;
   }
   ```

3. **Preserve Component State**: The diff-and-patch approach ensures that when scan data is unchanged, the same object reference is used, preventing React from remounting the component

#### Bug 2: Batch ID Persistence

**File 1**: `backend/database.py`

**Changes**:

1. **Add batch_id Column to ScanRecord Model** (around line 120):
   ```python
   class ScanRecord(Base):
       # ... existing columns ...
       batch_id = Column(String(36), nullable=True, index=True)  # UUID for batch tracking
   ```

2. **Add Migration in init_db()** (around line 280):
   ```python
   _run_migration("scan_records", "batch_id", "VARCHAR(36)")
   ```

3. **Update create_scan_record()** (around line 350):
   ```python
   def create_scan_record(
       user_id: int | None,
       role_target: str,
       fit_score: int,
       file_name: str | None = None,
       candidate_id: str | None = None,
       result_json: str | None = None,
       batch_id: str | None = None,  # NEW PARAMETER
   ) -> ScanRecord | None:
       try:
           with SessionLocal() as db:
               record = ScanRecord(
                   user_id=user_id,
                   role_target=role_target,
                   fit_score=fit_score,
                   file_name=file_name,
                   candidate_id=candidate_id,
                   result_json=result_json,
                   batch_id=batch_id,  # NEW FIELD
               )
               db.add(record)
               db.commit()
               db.refresh(record)
               return record
       except Exception as e:
           print(f"[FairAI] create_scan_record failed: {e}", file=sys.stderr)
           return None
   ```

4. **Update get_user_scans()** (around line 380):
   ```python
   return [
       {
           "id": r.id,
           "role_target": r.role_target,
           "fit_score": r.fit_score,
           "file_name": r.file_name,
           "candidate_id": r.candidate_id,
           "timestamp": r.timestamp.isoformat() if r.timestamp else None,
           "has_result": r.result_json is not None,
           "kanban_stage": r.kanban_stage or "Sourced",
           "recruiter_notes": r.recruiter_notes,
           "stage_updated_at": r.stage_updated_at.isoformat() if r.stage_updated_at else None,
           "batch_id": r.batch_id,  # NEW FIELD
       }
       for r in rows
   ]
   ```

**File 2**: `backend/main.py`

**Changes**:

1. **Update /analyze Endpoint**: Add optional `batch_id` parameter to the request body
   ```python
   class AnalyzeRequest(BaseModel):
       # ... existing fields ...
       batch_id: str | None = None  # NEW FIELD
   ```

2. **Pass batch_id to create_scan_record()**: When creating the scan record, pass the batch_id
   ```python
   scan_record = create_scan_record(
       user_id=user_id,
       role_target=role_target,
       fit_score=fit_score,
       file_name=file_name,
       candidate_id=candidate_id,
       result_json=json.dumps(response_data),
       batch_id=request.batch_id,  # NEW PARAMETER
   )
   ```

**File 3**: `frontend/src/components/BatchUploadView.jsx`

**Changes**:

1. **Generate batch_id on Start**: When "Start Processing" is clicked, generate a UUID
   ```javascript
   function generateBatchId() {
     return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
       const r = Math.random() * 16 | 0;
       const v = c === 'x' ? r : (r & 0x3 | 0x8);
       return v.toString(16);
     });
   }
   
   function handleStartProcessing() {
     const batchId = generateBatchId();
     setBatchId(batchId);  // Store in component state
     // ... existing processing logic ...
   }
   ```

2. **Pass batch_id to /analyze**: When calling the `/analyze` endpoint, include the batch_id
   ```javascript
   const response = await fetch(`${API_URL}/analyze`, {
     method: 'POST',
     headers: { ...authHeaders(), 'Content-Type': 'application/json' },
     body: JSON.stringify({
       // ... existing fields ...
       batch_id: batchId,  // NEW FIELD
     }),
   });
   ```

3. **Store batch_id in Job State**: Add batch_id to the job object for display
   ```javascript
   const newJob = {
     job_id: jobId,
     filename: file.name,
     status: 'queued',
     batch_id: batchId,  // NEW FIELD
     // ... existing fields ...
   };
   ```

**File 4**: `frontend/src/components/KanbanBoardView.jsx`

**Changes**:

1. **Display Batch Badge (Optional)**: Add a small badge to show batch cohort information
   ```javascript
   {scan.batch_id && (
     <div className="text-[10px] text-white/30 font-mono truncate">
       Batch: {scan.batch_id.slice(0, 8)}
     </div>
   )}
   ```

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bugs on unfixed code, then verify the fixes work correctly and preserve existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bugs BEFORE implementing the fix. Confirm or refute the root cause analysis.

**Bug 1 Test Plan**: Write tests that simulate TalentPoolView refetching scans with identical data but new array references. Run these tests on the UNFIXED code to observe component remounting and notes duplication.

**Bug 1 Test Cases**:
1. **Array Reference Change Test**: Simulate passing a new array reference with identical data to KanbanBoardView (will fail on unfixed code - components remount)
2. **Notes Persistence Test**: Expand notes on a card, trigger refetch, verify notes remain expanded (will fail on unfixed code - notes collapse)
3. **Component State Test**: Set internal state in CandidateCard, trigger refetch, verify state persists (will fail on unfixed code - state resets)

**Bug 2 Test Plan**: Write tests that simulate batch upload, page refresh, and attempt to retrieve batch results. Run these tests on the UNFIXED code to observe missing batch_id.

**Bug 2 Test Cases**:
1. **Batch ID Missing Test**: Upload batch, check database for batch_id column (will fail on unfixed code - column doesn't exist)
2. **Page Refresh Test**: Complete batch, refresh page, attempt to retrieve batch results (will fail on unfixed code - results lost)
3. **Batch Cohort Test**: Upload batch, query scans by batch_id (will fail on unfixed code - no batch_id to query)

**Expected Counterexamples**:
- Bug 1: Component remounting causes notes sections to flicker, collapse, or duplicate
- Bug 2: Database queries fail because batch_id column doesn't exist; batch results disappear on refresh

### Fix Checking

**Goal**: Verify that for all inputs where the bug conditions hold, the fixed functions produce the expected behavior.

**Bug 1 Fix Checking:**
```
FOR ALL input WHERE isBugCondition1(input) DO
  result := KanbanBoardView_fixed(input)
  ASSERT componentInstancesPreserved(result)
  ASSERT notesDoNotDuplicate(result)
  ASSERT componentStatePreserved(result)
END FOR
```

**Bug 2 Fix Checking:**
```
FOR ALL input WHERE isBugCondition2(input) DO
  result := batchUploadFlow_fixed(input)
  ASSERT batchIdGenerated(result)
  ASSERT batchIdPersisted(result)
  ASSERT batchResultsRetrievable(result)
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug conditions do NOT hold, the fixed functions produce the same result as the original functions.

**Bug 1 Preservation:**
```
FOR ALL input WHERE NOT isBugCondition1(input) DO
  ASSERT KanbanBoardView_original(input) = KanbanBoardView_fixed(input)
END FOR
```

**Bug 2 Preservation:**
```
FOR ALL input WHERE NOT isBugCondition2(input) DO
  ASSERT batchUploadFlow_original(input) = batchUploadFlow_fixed(input)
END FOR
```

**Testing Approach**: Manual testing and integration tests are recommended because:
- Bug 1 involves React component lifecycle and DOM behavior, difficult to test with property-based testing
- Bug 2 involves database schema changes and full-stack integration
- Both bugs require visual verification of UI behavior

**Test Plan**: 

**Bug 1 Preservation Tests**:
1. **Drag-and-Drop Preservation**: Verify dragging cards between stages continues to work
2. **Notes Editing Preservation**: Verify adding/editing notes with debounced save continues to work
3. **AI Suggestions Preservation**: Verify AI stage suggestions display correctly
4. **Stage Timestamps Preservation**: Verify stage_updated_at timestamps are accurate

**Bug 2 Preservation Tests**:
1. **Single Upload Preservation**: Verify single resume upload (non-batch) continues to work without batch_id
2. **Existing Scans Preservation**: Verify existing scans without batch_id continue to display correctly
3. **Batch Processing Preservation**: Verify 8-stage pipeline processing continues to work
4. **WebSocket Updates Preservation**: Verify real-time updates continue to work

### Unit Tests

**Bug 1 Unit Tests**:
- Test `scansEqual()` helper function with various scan objects
- Test diff-and-patch logic with added, removed, and updated scans
- Test that identical scans preserve object references

**Bug 2 Unit Tests**:
- Test UUID generation produces valid UUIDs
- Test database migration adds batch_id column
- Test `create_scan_record()` accepts and stores batch_id
- Test `get_user_scans()` returns batch_id in response

### Integration Tests

**Bug 1 Integration Tests**:
- Test full TalentPoolView → KanbanBoardView flow with refetching
- Test that notes remain stable across multiple refetches
- Test that component state persists across refetches

**Bug 2 Integration Tests**:
- Test full batch upload flow with batch_id generation and persistence
- Test page refresh after batch upload retrieves batch results
- Test filtering/grouping by batch_id in Kanban view
- Test that existing scans without batch_id continue to work
