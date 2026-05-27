# Batch Dashboard State Fix - Bugfix Design

## Overview

This bugfix addresses two critical issues in the batch resume processing dashboard:

1. **Pipeline Animation Inconsistency**: The 8-stage pipeline visualizer fails to correctly sync with backend processing stages. Backend stages fire in the wrong order (0, 1, 3, 2, 4, 5, 6, 7 instead of 0-7 sequentially), causing only the first and last cubes to light up while intermediate stages remain dark. This occurs because the `execute_scan_job` function in `backend/main.py` calls `stage_callback` with indices 3 and 2 swapped due to parallel execution of skill graph generation and blind scoring.

2. **State Loss on Navigation**: When users navigate from the batch list view to a detailed resume report (via `onViewResult`) and then return, the entire `BatchUploadView` component remounts, clearing the `jobs` state array and losing all processed resume data. This happens because React's component lifecycle resets local state when navigating between views in the single-page application.

The fix strategy involves:
- **Backend**: Reordering stage callbacks to match the logical pipeline sequence (0→1→2→3→4→5→6→7)
- **Frontend**: Implementing state persistence using React Context or lifting state to the parent `App.jsx` component to survive navigation

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug - when batch processing occurs with incorrect stage ordering OR when navigation between views causes state loss
- **Property (P)**: The desired behavior - pipeline stages light up sequentially (0-7) AND batch state persists across navigation
- **Preservation**: Existing functionality that must remain unchanged - WebSocket real-time updates, ranked results display, stage filtering, error handling, file validation
- **execute_scan_job**: The async function in `backend/main.py` (line 2386) that processes individual resume jobs and calls `stage_callback` to report progress
- **stage_callback**: A callback function passed to `execute_scan_job` that sends stage updates via WebSocket to the frontend
- **PipelineVisualizer**: React component in `frontend/src/components/PipelineVisualizer.jsx` that renders the 8-stage cube animation
- **BatchUploadView**: React component in `frontend/src/components/BatchUploadView.jsx` that manages batch upload state and displays job progress
- **jobs state**: Array of job objects `[{filename, job_id, status, result, error, stage, stage_name}]` stored in `BatchUploadView` component
- **onViewResult**: Callback function that navigates from batch list to detail view by calling `s.setResult(job.result)` and `s.setStep('results')`

## Bug Details

### Bug Condition

The bug manifests in two distinct scenarios:

**Scenario 1: Pipeline Animation Inconsistency**
The bug occurs when batch resumes are being processed and the backend sends stage updates via WebSocket. The `execute_scan_job` function calls `stage_callback` with indices in the wrong order due to parallel execution optimization.

**Formal Specification:**
```
FUNCTION isBugCondition_Pipeline(execution)
  INPUT: execution of type JobExecution
  OUTPUT: boolean
  
  RETURN execution.stage_callbacks_order != [0, 1, 2, 3, 4, 5, 6, 7]
         AND execution.stage_callbacks_order == [0, 1, 3, 2, 4, 5, 6, 7]
         AND execution.parallel_optimization_enabled == true
END FUNCTION
```

**Scenario 2: State Loss on Navigation**
The bug occurs when a user navigates from the batch list view to a detailed resume report and then returns. The `BatchUploadView` component remounts, resetting all local state.

**Formal Specification:**
```
FUNCTION isBugCondition_StateLoss(navigation)
  INPUT: navigation of type NavigationEvent
  OUTPUT: boolean
  
  RETURN navigation.from == 'batch' 
         AND navigation.to == 'results'
         AND navigation.back_to == 'batch'
         AND BatchUploadView.jobs.length > 0
         AND BatchUploadView_remounted == true
END FUNCTION
```

### Examples

**Pipeline Animation Issue:**
- **Input**: Backend processes resume, calls `stage_callback(1)` for PII Strip, then `stage_callback(3)` for Skill Graph, then `stage_callback(2)` for Blind Score
- **Expected**: Cubes light up sequentially: Upload (0) → PII Strip (1) → Blind Score (2) → Skill Graph (3) → ...
- **Actual**: Cubes light up: Upload (0) → PII Strip (1) → Skill Graph (3) → Blind Score (2) → ... (out of order)
- **Visual Impact**: Users see cube 3 light up before cube 2, creating confusion about pipeline progress

**State Loss Issue:**
- **Input**: User has 5 completed resumes in batch view, clicks "View →" on first resume, views detail report, clicks back button
- **Expected**: Batch view displays all 5 completed resumes with their scores and status
- **Actual**: Batch view is empty, `jobs` array is `[]`, all resume data is lost
- **User Impact**: User must re-upload and re-process all 5 resumes to see results again

**Edge Case - WebSocket Disconnection:**
- **Input**: Pipeline animation bug occurs while WebSocket is disconnected (fallback polling active)
- **Expected**: Fallback polling should still receive correct stage order from backend
- **Actual**: Fallback polling receives same incorrect stage order, bug persists

**Edge Case - Partial Batch Completion:**
- **Input**: User navigates away when 3 out of 5 resumes are completed
- **Expected**: On return, 3 completed resumes are displayed, 2 in-progress resumes continue processing
- **Actual**: All 5 resumes disappear, including completed ones

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- WebSocket real-time updates with heartbeat/ping mechanism and exponential backoff reconnection must continue to work exactly as before
- Ranked results table displaying completed resumes sorted by score must remain unchanged
- Stage filtering functionality (clicking cubes to highlight jobs in that stage) must continue to work
- Error handling and display of failed jobs must remain unchanged
- File validation (PDF, JPG, PNG, WEBP) and file list display with size information must continue to work
- "New Batch" button functionality to clear current batch and start fresh must remain unchanged
- Progress bar showing completion percentage must continue to work
- Job status badges (Queued, Processing, Done, Failed) must display correctly
- Fallback polling mechanism (when WebSocket fails) must continue to work

**Scope:**
All inputs that do NOT involve stage callback ordering or navigation between batch/results views should be completely unaffected by this fix. This includes:
- Initial batch upload and job submission
- WebSocket connection establishment and message handling
- UI rendering of pipeline visualizer, job rows, and ranked results
- User interactions with file dropzone, role input, and audit parameters
- Demo mode functionality and JD analysis section

## Hypothesized Root Cause

Based on the bug description and code analysis, the most likely issues are:

### Issue 1: Backend Stage Callback Order (Pipeline Animation)

**Root Cause**: In `backend/main.py` lines 2417-2420 and 2535-2538, the code calls `stage_callback(3)` for Skill Graph BEFORE `stage_callback(2)` for Blind Score. This is due to a performance optimization where skill generation and resume structuring run in parallel (line 2417 comment: "Run skill generation AND resume structuring IN PARALLEL to save time").

**Evidence from Code**:
```python
# Line 2417-2420: Stage 3 callback fires BEFORE Stage 2
if stage_callback: 
    await stage_callback(3)  # Skill Graph
    
# Line 2535-2538: Stage 2 callback fires AFTER Stage 3
if stage_callback: 
    await stage_callback(2)  # Blind Score
```

**Why This Causes the Bug**: The frontend `PipelineVisualizer` expects stages to arrive in sequential order (0→1→2→3→...). When stage 3 arrives before stage 2, the animation logic becomes confused, and intermediate cubes fail to light up correctly.

### Issue 2: Component State Lifecycle (State Loss)

**Root Cause**: In `App.jsx` lines 395-402, the `BatchUploadView` component is conditionally rendered based on `s.step === 'batch'`. When navigating to results view (`s.setStep('results')`), the component unmounts. When navigating back (`s.setStep('batch')`), a new instance mounts with fresh state.

**Evidence from Code**:
```jsx
// App.jsx line 395-402
{s.step === 'batch' && user?.role !== 'candidate' && (
  <BatchUploadView
    s={s}
    onViewResult={(job) => {
      s.setResult(job.result);
      s.setStep('results');  // This unmounts BatchUploadView
    }}
  />
)}
```

**Why This Causes the Bug**: React's component lifecycle destroys local state when a component unmounts. The `jobs` state array (line 139 in `BatchUploadView.jsx`: `const [jobs, setJobs] = useState([])`) is local to the component and is not preserved when unmounting.

### Issue 3: No State Persistence Mechanism

**Root Cause**: The application uses local component state (`useState`) for critical batch data instead of a global state management solution (Context API, Redux, or URL-based state).

**Why This Causes the Bug**: Local state is ephemeral and tied to component lifecycle. Without a persistence mechanism (Context, parent state, or URL params), data cannot survive navigation.

## Correctness Properties

Property 1: Bug Condition - Sequential Pipeline Stage Updates

_For any_ batch job processing where stage callbacks are invoked, the fixed backend SHALL call `stage_callback` in sequential order [0, 1, 2, 3, 4, 5, 6, 7], and the frontend PipelineVisualizer SHALL light up cubes in the same sequential order, ensuring users see accurate real-time progress through all 8 stages.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

Property 2: Bug Condition - Batch State Persistence Across Navigation

_For any_ navigation event where a user moves from batch list view to detail view and back, the fixed application SHALL preserve the `jobs` array state, ensuring all processed resumes (completed, in-progress, or failed) remain visible and accessible after navigation.

**Validates: Requirements 2.5, 2.6**

Property 3: Preservation - WebSocket and Real-Time Updates

_For any_ batch processing session, the fixed code SHALL produce exactly the same WebSocket connection behavior, heartbeat mechanism, reconnection logic, and real-time job updates as the original code, preserving all existing real-time functionality.

**Validates: Requirements 3.2**

Property 4: Preservation - UI Interactions and Display

_For any_ user interaction with the batch upload interface (file selection, role input, stage filtering, ranked results, error display), the fixed code SHALL produce exactly the same UI behavior and visual output as the original code, preserving all existing user interface functionality.

**Validates: Requirements 3.1, 3.3, 3.4, 3.5, 3.6**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct, we need to make changes in both backend and frontend:

#### Backend Changes

**File**: `backend/main.py`

**Function**: `execute_scan_job` (lines 2386-2763)

**Specific Changes**:

1. **Reorder Stage 2 and Stage 3 Callbacks**: Move the `stage_callback(2)` call from line 2535-2538 to BEFORE the `stage_callback(3)` call at line 2417-2420. This ensures stages fire in sequential order even though the underlying operations run in parallel.

   **Implementation Detail**:
   ```python
   # BEFORE (lines 2417-2420):
   if stage_callback: 
       await stage_callback(3)  # Skill Graph
   
   # AFTER:
   if stage_callback: 
       await stage_callback(2)  # Blind Score (moved here)
   
   # Then later, BEFORE parallel execution starts:
   if stage_callback: 
       await stage_callback(3)  # Skill Graph (moved here)
   ```

2. **Add Stage Transition Comments**: Add clear comments indicating the logical stage order to prevent future regressions:
   ```python
   # Stage 2/8: Blind Scoring (callback sent before parallel execution)
   # Stage 3/8: Skill Graph Generation (callback sent before parallel execution)
   ```

3. **Verify Stage 7 Callback**: Ensure the final `stage_callback(7)` at line 2760 is called exactly once (currently called twice on line 2760).

#### Frontend Changes

**File**: `frontend/src/App.jsx`

**Component**: `App` root component

**Specific Changes**:

1. **Lift Batch State to Parent**: Move the `jobs`, `batchId`, and `ws` state from `BatchUploadView` to the `useAppState` hook in `AppLogic.js`. This ensures state persists across component unmount/remount cycles.

   **Implementation Detail**:
   - Add to `AppLogic.js`: `const [batchJobs, setBatchJobs] = useState([])`
   - Add to `AppLogic.js`: `const [batchId, setBatchId] = useState(null)`
   - Add to `AppLogic.js`: `const [batchWs, setBatchWs] = useState(null)`
   - Pass these as props to `BatchUploadView`: `<BatchUploadView jobs={s.batchJobs} setJobs={s.setBatchJobs} ... />`

2. **Update BatchUploadView Props**: Modify `BatchUploadView` to accept `jobs`, `setJobs`, `batchId`, `setBatchId`, `ws`, `setWs` as props instead of using local state.

3. **Preserve WebSocket Connection**: Ensure WebSocket connection persists when navigating away from batch view. Move WebSocket cleanup logic to only trigger when user explicitly clicks "New Batch" or logs out.

4. **Add Navigation Guard**: Optionally add a confirmation dialog when navigating away from batch view with active processing jobs to prevent accidental data loss.

**File**: `frontend/src/components/BatchUploadView.jsx`

**Component**: `BatchUploadView`

**Specific Changes**:

1. **Replace Local State with Props**: 
   ```jsx
   // BEFORE:
   const [jobs, setJobs] = useState([]);
   const [batchId, setBatchId] = useState(null);
   const [ws, setWs] = useState(null);
   
   // AFTER:
   const { jobs, setJobs, batchId, setBatchId, ws, setWs } = props;
   ```

2. **Update WebSocket Cleanup**: Modify the `useEffect` cleanup function to NOT close WebSocket on unmount:
   ```jsx
   // BEFORE:
   useEffect(() => {
     return () => {
       Object.values(pollersRef.current).forEach(clearInterval);
       if (ws) ws.close();  // This closes WebSocket on unmount
     };
   }, [ws]);
   
   // AFTER:
   useEffect(() => {
     return () => {
       Object.values(pollersRef.current).forEach(clearInterval);
       // WebSocket cleanup moved to "New Batch" button handler
     };
   }, []);
   ```

3. **Update "New Batch" Handler**: Add WebSocket cleanup to the "New Batch" button click handler:
   ```jsx
   const handleNewBatch = () => {
     setJobs([]);
     setBatchError(null);
     if (ws) {
       ws.close();
       setWs(null);
     }
   };
   ```

**File**: `frontend/src/components/AppLogic.js`

**Hook**: `useAppState`

**Specific Changes**:

1. **Add Batch State Management**: Add state variables and setters for batch processing:
   ```javascript
   const [batchJobs, setBatchJobs] = useState([]);
   const [batchId, setBatchId] = useState(null);
   const [batchWs, setBatchWs] = useState(null);
   ```

2. **Add Reset Logic**: Update the `reset` function to clear batch state:
   ```javascript
   const reset = () => {
     // ... existing reset logic ...
     setBatchJobs([]);
     setBatchId(null);
     if (batchWs) {
       batchWs.close();
       setBatchWs(null);
     }
   };
   ```

3. **Return Batch State**: Add batch state to the returned object:
   ```javascript
   return {
     // ... existing state ...
     batchJobs,
     setBatchJobs,
     batchId,
     setBatchId,
     batchWs,
     setBatchWs,
   };
   ```

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bugs on unfixed code, then verify the fixes work correctly and preserve existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate both bugs BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

#### Test Plan for Pipeline Animation Bug

Write tests that simulate batch processing and capture the order of stage callback invocations. Run these tests on the UNFIXED code to observe the incorrect ordering.

**Test Cases**:
1. **Stage Callback Order Test**: Mock `stage_callback` and verify it's called with arguments [0, 1, 3, 2, 4, 5, 6, 7] on unfixed code (will fail on unfixed code - should be [0, 1, 2, 3, 4, 5, 6, 7])
2. **WebSocket Message Order Test**: Connect to WebSocket endpoint, submit batch job, capture stage update messages, verify they arrive in order [0, 1, 3, 2, 4, 5, 6, 7] (will fail on unfixed code)
3. **PipelineVisualizer Rendering Test**: Render PipelineVisualizer with jobs in stages [0, 1, 3, 2], verify cubes 0, 1, 3 are lit but cube 2 is not (will fail on unfixed code)
4. **Parallel Execution Timing Test**: Verify that skill graph generation and blind scoring run in parallel (should pass - this is intentional optimization)

**Expected Counterexamples**:
- Stage callbacks fire in order [0, 1, 3, 2, 4, 5, 6, 7] instead of [0, 1, 2, 3, 4, 5, 6, 7]
- Frontend receives WebSocket messages with `stage: 3` before `stage: 2`
- PipelineVisualizer shows cubes 0, 1, 3 lit while cube 2 remains dark
- Possible causes: parallel execution optimization, incorrect callback placement in code

#### Test Plan for State Loss Bug

Write tests that simulate navigation between batch view and detail view. Run these tests on the UNFIXED code to observe state loss.

**Test Cases**:
1. **Navigation State Persistence Test**: Render BatchUploadView with 5 jobs, navigate to results view, navigate back, verify jobs array is empty (will fail on unfixed code - should have 5 jobs)
2. **Component Lifecycle Test**: Monitor BatchUploadView mount/unmount events during navigation, verify component unmounts when navigating away (will pass - this confirms root cause)
3. **WebSocket Connection Persistence Test**: Establish WebSocket connection in batch view, navigate away, navigate back, verify WebSocket is closed (will pass on unfixed code - should stay open)
4. **In-Progress Jobs Test**: Start batch with 5 jobs, wait for 2 to complete, navigate away, navigate back, verify all 5 jobs are lost (will fail on unfixed code)

**Expected Counterexamples**:
- `jobs` array is empty after navigation back to batch view
- BatchUploadView component unmounts and remounts during navigation
- WebSocket connection is closed when navigating away
- In-progress jobs are lost and cannot be recovered
- Possible causes: local component state, no persistence mechanism, component lifecycle

### Fix Checking

**Goal**: Verify that for all inputs where the bug conditions hold, the fixed functions produce the expected behavior.

#### Pipeline Animation Fix Checking

**Pseudocode:**
```
FOR ALL batch_job WHERE isBugCondition_Pipeline(batch_job.execution) DO
  stage_order := execute_scan_job_fixed(batch_job)
  ASSERT stage_order == [0, 1, 2, 3, 4, 5, 6, 7]
  
  websocket_messages := capture_websocket_messages(batch_job)
  ASSERT websocket_messages.stages == [0, 1, 2, 3, 4, 5, 6, 7]
  
  visualizer_state := render_pipeline_visualizer(websocket_messages)
  ASSERT all_cubes_light_up_sequentially(visualizer_state)
END FOR
```

**Test Cases**:
1. Submit batch job, verify stage callbacks fire in order [0, 1, 2, 3, 4, 5, 6, 7]
2. Verify WebSocket messages arrive with sequential stage indices
3. Verify PipelineVisualizer lights up all 8 cubes in order
4. Verify parallel execution optimization still works (skill graph and blind scoring run concurrently)

#### State Persistence Fix Checking

**Pseudocode:**
```
FOR ALL navigation WHERE isBugCondition_StateLoss(navigation) DO
  initial_jobs := create_batch_with_jobs(5)
  navigate_to_results()
  navigate_back_to_batch()
  
  ASSERT current_jobs == initial_jobs
  ASSERT current_jobs.length == 5
  ASSERT websocket_connection_still_active()
END FOR
```

**Test Cases**:
1. Create batch with 5 jobs, navigate to results, navigate back, verify all 5 jobs are still present
2. Create batch with 3 completed and 2 in-progress jobs, navigate away, navigate back, verify all jobs persist
3. Verify WebSocket connection remains active after navigation
4. Verify in-progress jobs continue processing after navigation back

### Preservation Checking

**Goal**: Verify that for all inputs where the bug conditions do NOT hold, the fixed functions produce the same result as the original functions.

**Pseudocode:**
```
FOR ALL input WHERE NOT (isBugCondition_Pipeline(input) OR isBugCondition_StateLoss(input)) DO
  ASSERT execute_scan_job_original(input) == execute_scan_job_fixed(input)
  ASSERT BatchUploadView_original(input) == BatchUploadView_fixed(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for non-affected functionality, then write property-based tests capturing that behavior.

**Test Cases**:

1. **WebSocket Connection Preservation**: Verify WebSocket connection establishment, heartbeat/ping mechanism, exponential backoff reconnection, and message handling work identically before and after fix
2. **Ranked Results Preservation**: Verify ranked results table displays completed resumes sorted by score identically before and after fix
3. **Stage Filtering Preservation**: Verify clicking stage cubes to filter jobs works identically before and after fix
4. **Error Handling Preservation**: Verify error states and messages for failed jobs display identically before and after fix
5. **File Validation Preservation**: Verify file type validation and file list display work identically before and after fix
6. **New Batch Button Preservation**: Verify "New Batch" button clears state and allows new upload identically before and after fix
7. **Progress Bar Preservation**: Verify progress bar calculation and display work identically before and after fix
8. **Job Status Badges Preservation**: Verify status badges (Queued, Processing, Done, Failed) display identically before and after fix
9. **Fallback Polling Preservation**: Verify fallback polling mechanism (when WebSocket fails) works identically before and after fix
10. **Parallel Execution Preservation**: Verify skill graph generation and blind scoring still run in parallel after backend fix

### Unit Tests

**Backend Unit Tests** (`backend/test_main.py`):
- Test `execute_scan_job` stage callback order with mock callback function
- Test that stage callbacks fire in sequence [0, 1, 2, 3, 4, 5, 6, 7]
- Test that parallel execution optimization still works (skill graph + blind scoring run concurrently)
- Test that stage 7 callback is called exactly once
- Test error handling when stage callback raises exception

**Frontend Unit Tests** (`frontend/src/components/BatchUploadView.test.jsx`):
- Test that jobs state persists when component receives new props (not unmounted)
- Test that WebSocket connection is NOT closed on component unmount
- Test that "New Batch" button closes WebSocket and clears state
- Test that navigation to results view does not clear jobs state
- Test that PipelineVisualizer receives correct stage indices from jobs array

### Property-Based Tests

**Backend Property Tests**:
- Generate random batch sizes (1-20 jobs) and verify stage callbacks always fire in order [0, 1, 2, 3, 4, 5, 6, 7] for each job
- Generate random job configurations (different file types, roles, JD skills) and verify stage order is consistent
- Generate random WebSocket connection states (connected, disconnected, reconnecting) and verify stage updates are sent correctly

**Frontend Property Tests**:
- Generate random navigation sequences (batch → results → batch → results → ...) and verify jobs state persists across all navigations
- Generate random job states (queued, processing, completed, error) and verify state persists after navigation
- Generate random batch sizes and verify all jobs are preserved after navigation
- Generate random WebSocket message orderings and verify PipelineVisualizer renders correctly

### Integration Tests

**End-to-End Integration Tests**:
- Test full batch upload flow: upload 5 resumes → verify all 8 stages light up sequentially for each resume → verify ranked results display correctly
- Test navigation flow: upload batch → wait for completion → click "View" on first resume → verify detail view → click back → verify all 5 resumes still visible
- Test WebSocket reconnection: upload batch → disconnect WebSocket mid-processing → verify reconnection → verify stage updates resume correctly
- Test mixed state navigation: upload batch → wait for 2 completions → navigate to detail view → navigate back → verify 2 completed + 3 in-progress jobs are all present
- Test error handling: upload batch with 1 invalid file → verify error state → navigate away → navigate back → verify error state persists
- Test "New Batch" flow: complete batch → click "New Batch" → verify state cleared → verify WebSocket closed → upload new batch → verify fresh state
