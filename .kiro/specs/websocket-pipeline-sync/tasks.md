# WebSocket Pipeline Animation Sync Fix

## Overview
Fix the pipeline animation in the recruiter's batch processing dashboard so that each cube lights up when its corresponding backend stage completes. Currently, only the first and last cubes light up; intermediate stages don't sync.

## Root Cause
1. **Backend**: WebSocket connection closes before all stage updates are sent
2. **Frontend**: No heartbeat mechanism to keep connection alive; missing reconnection logic
3. **Sync**: Stage callbacks fire asynchronously but connection closes prematurely

## Requirements

### R1: Backend WebSocket Connection Stability
- Ensure WebSocket connection remains open for the entire job duration
- Add explicit stage update broadcasts for all 8 pipeline stages
- Implement proper async/await handling for stage callbacks
- Add connection keep-alive mechanism

### R2: Frontend WebSocket Reliability
- Implement heartbeat/ping mechanism to prevent timeout
- Add automatic reconnection with exponential backoff
- Handle connection errors gracefully
- Ensure all stage updates are received and processed

### R3: Stage Update Synchronization
- Verify all 8 stages send WebSocket updates
- Ensure updates arrive in correct order
- Add logging to track message delivery
- Test with batch processing to confirm all cubes light up

## Design

### Backend Changes (main.py)
1. **Enhance broadcast_to_batch()**: Add retry logic and error handling
2. **Improve set_stage()**: Ensure stage updates are sent before async work begins
3. **Add connection keep-alive**: Send periodic heartbeats to prevent timeout
4. **Fix stage callback timing**: Ensure all stages emit updates

### Frontend Changes (BatchUploadView.jsx)
1. **Add WebSocket heartbeat**: Send ping every 30 seconds
2. **Implement reconnection**: Auto-reconnect with exponential backoff (1s, 2s, 4s, 8s, 16s max)
3. **Better error handling**: Log all WebSocket events
4. **Verify message receipt**: Track received stage updates

### PipelineVisualizer Changes
1. **Add stage update logging**: Log when each stage is received
2. **Improve animation timing**: Ensure cubes light up immediately when update arrives
3. **Add visual feedback**: Show connection status

## Tasks

### Task 1: Backend - Fix WebSocket Connection Stability
**Subtasks:**
- [x] Enhance broadcast_to_batch() with retry logic
- [x] Add connection keep-alive heartbeat
- [x] Verify all 8 stages emit updates
- [x] Test with backend logs

### Task 2: Frontend - Implement WebSocket Heartbeat
**Subtasks:**
- [x] Add ping/pong mechanism
- [x] Send heartbeat every 30 seconds
- [x] Log heartbeat events
- [x] Test connection stays alive

### Task 3: Frontend - Add Reconnection Logic
**Subtasks:**
- [x] Implement exponential backoff reconnection
- [x] Handle connection errors
- [x] Auto-reconnect on disconnect
- [x] Test reconnection behavior

### Task 4: Frontend - Verify Stage Updates
**Subtasks:**
- [x] Add logging for all received updates
- [x] Verify all 8 stages are received
- [x] Test with batch processing
- [x] Confirm all cubes light up

### Task 5: Integration Testing
**Subtasks:**
- [x] Test batch processing with 1 resume
- [x] Test batch processing with 5 resumes
- [x] Verify all stages light up in order
- [x] Check no stages are skipped
- [x] Verify connection doesn't drop

## Acceptance Criteria
- [x] All 8 pipeline cubes light up in sequence during batch processing
- [x] No cubes are skipped
- [x] Animation is smooth and synchronized with backend
- [x] WebSocket connection remains stable for entire job duration
- [x] No console errors related to WebSocket
- [x] Works with multiple concurrent batch jobs
