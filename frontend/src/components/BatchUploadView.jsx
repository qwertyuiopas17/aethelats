import React, { useState, useRef, useEffect, useCallback } from 'react';
import { UploadCloud, FileText, XCircle, Play, CheckCircle, AlertTriangle, Clock, Zap, RefreshCw, ChevronDown, ChevronUp, Award, TrendingDown, TrendingUp, Users } from 'lucide-react';
import { API_URL, DEMO_JD_RESULT } from './constants';
import { useAuth } from '../context/AuthContext';
import PipelineVisualizer from './PipelineVisualizer';
import { JDAnalysisSection } from './AnalysisPanels';
import { ToggleSwitch } from './UIHelpers';

const STAGES = [
  { key: 'upload',     label: 'Upload',      icon: '📄' },
  { key: 'pii',        label: 'PII Strip',   icon: '🔒' },
  { key: 'score',      label: 'Blind Score', icon: '🧠' },
  { key: 'skills',     label: 'Skill Graph', icon: '🕸' },
  { key: 'bias',       label: 'Bias Detect', icon: '⚠️' },
  { key: 'percentile', label: 'Percentile',  icon: '📊' },
  { key: 'cf',         label: 'Counter',     icon: '🔀' },
  { key: 'gate',       label: 'Fairness',    icon: '✅' },
];

const STATUS_COLORS = {
  queued:     'text-white/40 bg-white/[0.04] border-white/[0.08]',
  processing: 'text-white bg-white/10 border-white/20',
  completed:  'text-white bg-white/10 border-white/20',
  error:      'text-red-300 bg-red-500/10 border-red-500/20',
};

const STATUS_LABEL = {
  queued:     'Queued',
  processing: 'Processing…',
  completed:  'Done',
  error:      'Failed',
};

function JobRow({ job, onViewResult }) {
  const score = job.result?.fit_score;
  const proxies = job.result?.bias_proxies?.length || 0;
  const isProcessing = job.status === 'processing';
  const isDone = job.status === 'completed';
  const isFailed = job.status === 'error';

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3 border-b border-[#222] last:border-0 hover:bg-[#111] transition-colors group animate-fade-in bg-black">
      {/* File icon */}
      <div className="w-8 h-8 rounded border border-[#333] bg-[#0a0a0a] flex items-center justify-center shrink-0">
        <FileText className="w-3.5 h-3.5 text-white/50" />
      </div>

      {/* Filename + status */}
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-mono font-medium text-white/90 truncate">{job.filename}</div>
        {isProcessing && (
          <div className="flex flex-col gap-0.5 mt-1">
            <span className="text-[10px] font-mono font-bold text-white uppercase tracking-widest">
              &gt; {job.stage_name || 'PROCESSING'}
            </span>
            {job.stage_detail && (
              <span className="text-[9px] font-mono text-white/40 truncate">{job.stage_detail}</span>
            )}
          </div>
        )}
        {isDone && (
          <div className="text-[10px] font-mono text-white/40 mt-1 flex items-center gap-2">
            <span className={`font-bold ${score >= 70 ? 'text-white' : score >= 50 ? 'text-white/70' : 'text-white/40'}`}>
              SCORE: {score}/100
            </span>
            {proxies > 0 && <span className="text-white/80">⚠ {proxies} BIAS_SIGNALS</span>}
          </div>
        )}
        {isFailed && <div className="text-[10px] font-mono text-red-400/80 mt-1 truncate">ERR: {job.error || 'PROCESSING_FAILED'}</div>}
      </div>

      {/* Status badge */}
      <span className={`shrink-0 text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-1 border ${STATUS_COLORS[job.status]}`}>
        {isProcessing && <RefreshCw className="w-2.5 h-2.5 inline mr-1 animate-spin" />}
        {STATUS_LABEL[job.status]}
      </span>

      {/* View button */}
      {isDone && (
        <button
          onClick={() => onViewResult(job)}
          className="shrink-0 px-4 py-1.5 rounded-sm text-[10px] font-mono font-bold bg-white text-black hover:bg-black hover:text-white border border-white transition-all uppercase tracking-widest"
        >
          View_Report
        </button>
      )}
    </div>
  );
}

function RankedResults({ jobs, onViewResult }) {
  const done = jobs.filter(j => j.status === 'completed' && j.result?.fit_score != null);
  if (!done.length) return null;

  const sorted = [...done].sort((a, b) => (b.result?.fit_score || 0) - (a.result?.fit_score || 0));

  return (
    <section className="mt-8 animate-fade-in-up">
      <div className="flex items-center gap-2 mb-4">
        <Award className="w-4 h-4 text-white" />
        <h3 className="text-[10px] font-mono font-bold text-white uppercase tracking-widest">RANKED_RESULTS [{sorted.length}]</h3>
      </div>
      <div className="border border-[#333] rounded-xl bg-black overflow-hidden">
        {/* Header */}
        <div className="hidden sm:grid grid-cols-12 gap-3 px-5 py-3 border-b border-[#333] bg-[#0a0a0a] text-[10px] font-mono font-bold uppercase tracking-widest text-white/50">
          <div className="col-span-1">RANK</div>
          <div className="col-span-5">CANDIDATE_ID</div>
          <div className="col-span-2 text-center">SCORE</div>
          <div className="col-span-2 text-center">SYS_BIAS</div>
          <div className="col-span-2 text-right">ACTION</div>
        </div>
        {sorted.map((job, idx) => {
          const score = job.result?.fit_score || 0;
          const proxies = job.result?.bias_proxies?.length || 0;
          return (
            <div key={job.job_id} className="grid grid-cols-12 gap-3 px-5 py-4 border-b border-[#222] last:border-0 hover:bg-[#111] transition-colors items-center bg-black">
              {/* Rank */}
              <div className="col-span-1">
                {idx === 0 && <span className="text-yellow-400 font-mono font-bold text-xs">[ 01 ]</span>}
                {idx === 1 && <span className="text-white/80 font-mono font-bold text-xs">[ 02 ]</span>}
                {idx === 2 && <span className="text-orange-400/80 font-mono font-bold text-xs">[ 03 ]</span>}
                {idx > 2 && <span className="text-white/30 font-mono font-bold text-xs">[ {(idx + 1).toString().padStart(2, '0')} ]</span>}
              </div>
              {/* Name */}
              <div className="col-span-5 text-xs font-mono text-white/90 truncate">{job.filename}</div>
              {/* Score */}
              <div className="col-span-2 text-center">
                <span className={`text-sm font-mono font-black ${score >= 70 ? 'text-white' : score >= 50 ? 'text-white/70' : 'text-white/40'}`}>
                  {score}
                </span>
                <span className="text-white/30 text-[10px] font-mono">/100</span>
              </div>
              {/* Bias */}
              <div className="col-span-2 text-center">
                {proxies === 0
                  ? <span className="text-white/80 text-[10px] font-mono font-bold">CLEAN</span>
                  : <span className="text-white text-[10px] font-mono font-bold">WARN: {proxies}</span>
                }
              </div>
              {/* Action */}
              <div className="col-span-2 text-right">
                <button
                  onClick={() => onViewResult(job)}
                  className="text-[10px] font-mono font-bold px-4 py-1.5 rounded-sm bg-[#111] border border-[#444] text-white hover:bg-white hover:text-black hover:border-white transition-all uppercase tracking-widest"
                >
                  Report
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function BatchUploadView({ s, onViewResult, jobs, setJobs, batchId, setBatchId, ws, setWs }) {
  const { authHeaders } = useAuth();
  const [files, setFiles] = useState([]);        // selected File objects
  const jobRole = s.jobRole;
  const setJobRole = s.setJobRole;
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [batchError, setBatchError] = useState(null);
  const fileInputRef = useRef(null);
  const pollersRef = useRef({});                 // job_id → interval id (fallback polling)
  const [activeStageFilter, setActiveStageFilter] = useState(null); // idx of stage to filter by
  // Stage update queue: prevents rapid-fire WS messages from skipping cube animations.
  // Each entry: { job_id, stage, stage_name, stage_detail, status, result, error }
  const stageQueueRef = useRef({});             // job_id → array of pending updates
  const stageTimerRef = useRef({});             // job_id → timeout id
  const MIN_STAGE_MS = 900;                     // minimum ms each stage cube is shown
  const lastStageTimeRef = useRef({});          // job_id → timestamp of last stage display

  const ACCEPTED_EXTS = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];

  const addFiles = useCallback((incoming) => {
    const valid = Array.from(incoming).filter(f =>
      ACCEPTED_EXTS.some(ext => f.name.toLowerCase().endsWith(ext))
    );
    setFiles(prev => {
      const existing = new Set(prev.map(f => f.name));
      const fresh = valid.filter(f => !existing.has(f.name));
      return [...prev, ...fresh].slice(0, 20);
    });
  }, []);

  const removeFile = (name) => setFiles(prev => prev.filter(f => f.name !== name));

  const startPoll = (job_id) => {
    if (pollersRef.current[job_id]) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/analyze/status/${job_id}`, { headers: authHeaders() });
        if (!res.ok) return;
        const data = await res.json();
        setJobs(prev => prev.map(j => {
          if (j.job_id === job_id) {
            const isNewlyProcessing = j.status === 'queued' && data.status === 'processing';
            return { 
              ...j, 
              ...data,
              _processingStartedAt: isNewlyProcessing ? Date.now() : j._processingStartedAt || (data.status === 'processing' ? Date.now() : undefined)
            };
          }
          return j;
        }));
        if (data.status === 'completed' || data.status === 'error') {
          clearInterval(pollersRef.current[job_id]);
          delete pollersRef.current[job_id];
        }
      } catch {}
    }, 2500);
    pollersRef.current[job_id] = interval;
  };

  // ── Stage queue helpers ───────────────────────────────────────────────────
  // Apply a single stage update immediately to jobs state
  const applyStageUpdate = useCallback((update) => {
    setJobs(prev => prev.map(j => {
      if (j.job_id !== update.job_id) return j;
      const isNewlyProcessing = j.status === 'queued' && update.status === 'processing';
      return {
        ...j,
        status: update.status,
        stage: update.stage,
        stage_name: update.stage_name,
        stage_detail: update.stage_detail ?? j.stage_detail,
        result: update.result || j.result,
        error: update.error || j.error,
        _processingStartedAt: isNewlyProcessing ? Date.now() : j._processingStartedAt || (update.status === 'processing' ? Date.now() : undefined)
      };
    }));
  }, [setJobs]);

  // Drain the next update from the queue for a given job, respecting MIN_STAGE_MS.
  // IMPORTANT: We clear stageTimerRef at the START of every callback so it is
  // never stale — enqueueStageUpdate guards on this ref to know whether to kick
  // off a new drain. If it's stale (old fired ID), new messages get stuck.
  const drainQueue = useCallback((job_id) => {
    const queue = stageQueueRef.current[job_id];
    if (!queue || queue.length === 0) {
      // Queue is empty — clear ref so future enqueues can start a fresh drain
      stageTimerRef.current[job_id] = null;
      return;
    }

    const next = queue[0]; // peek
    // Terminal states skip the minimum display delay — apply immediately
    const isTerminal = next?.status === 'completed' || next?.status === 'error';

    const now = Date.now();
    const lastTime = lastStageTimeRef.current[job_id] || 0;
    const elapsed = now - lastTime;
    const wait = isTerminal ? 0 : Math.max(0, MIN_STAGE_MS - elapsed);

    stageTimerRef.current[job_id] = setTimeout(() => {
      // Clear FIRST so any new messages that arrive mid-callback
      // will correctly trigger a fresh drainQueue call
      stageTimerRef.current[job_id] = null;

      const item = stageQueueRef.current[job_id]?.shift();
      if (!item) return; // nothing to do

      applyStageUpdate(item);
      lastStageTimeRef.current[job_id] = Date.now();

      // Continue draining if more items remain
      if (stageQueueRef.current[job_id]?.length > 0) {
        drainQueue(job_id);
      }
    }, wait);
  }, [applyStageUpdate]);

  // Enqueue a stage update. Terminal states (completed/error) are pushed to the
  // front of any remaining processing stages so they are never held back.
  const enqueueStageUpdate = useCallback((msg) => {
    const { job_id } = msg;
    if (!stageQueueRef.current[job_id]) stageQueueRef.current[job_id] = [];

    const isTerminal = msg.status === 'completed' || msg.status === 'error';
    if (isTerminal) {
      // Drop any queued processing stages still waiting — jump straight to terminal
      stageQueueRef.current[job_id] = stageQueueRef.current[job_id].filter(
        m => m.status === 'completed' || m.status === 'error'
      );
    }
    stageQueueRef.current[job_id].push(msg);

    // If no timer is currently running, kick off the drain
    if (!stageTimerRef.current[job_id]) {
      drainQueue(job_id);
    }
  }, [drainQueue]);


  // Cleanup timers and WebSocket on unmount
  useEffect(() => {
    return () => {
      Object.values(pollersRef.current).forEach(clearInterval);
      Object.values(stageTimerRef.current).forEach(clearTimeout);
      if (ws) ws.close();
    };
  }, [ws]);

  const handleSubmit = async () => {
    if (!files.length || !jobRole.trim()) return;
    setBatchError(null);
    setSubmitting(true);
    setJobs([]);

    try {
      const fd = new FormData();
      files.forEach(f => fd.append('files', f));
      fd.append('role', jobRole);
      
      // Send JD skills to backend so all resumes in the batch are scored against them
      if (s.jdResult?.required_skills?.length > 0) {
        fd.append('jd_skills', s.jdResult.required_skills.join(','));
      }

      const res = await fetch(`${API_URL}/batch-analyze`, {
        method: 'POST',
        body: fd,
        headers: authHeaders(),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Batch upload failed');
      }
      const data = await res.json();
      const newBatchId = data.batch_id;
      setBatchId(newBatchId);

      // Initialize job states from response
      const initialJobs = data.jobs.map(j => ({ ...j, result: null, error: null, stage: 0, stage_name: "Extracting Text" }));
      setJobs(initialJobs);
      setFiles([]);

      // Connect WebSocket for real-time updates
      connectWebSocket(newBatchId, initialJobs);

      // Start fallback polling for each job (in case WebSocket fails)
      initialJobs.forEach(j => startPoll(j.job_id));
    } catch (e) {
      setBatchError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const connectWebSocket = (batchId, initialJobs) => {
    let reconnectAttempts = 0;
    const MAX_RECONNECT_ATTEMPTS = 5;
    let reconnectTimeout = null;
    let heartbeatInterval = null;
    let pongTimeout = null;

    const calculateBackoffDelay = (attempt) => {
      // Exponential backoff: 1s, 2s, 4s, 8s, 16s max
      // Formula: min(2^attempt * 1000, 16000)
      const delay = Math.min(Math.pow(2, attempt) * 1000, 16000);
      return delay;
    };

    const attemptConnection = () => {
      try {
        // Construct WebSocket URL from API_URL
        const wsUrl = API_URL.replace(/^http/, 'ws') + `/ws/batch/${batchId}`;
        console.log(`[WebSocket] Connecting to ${wsUrl}`);
        
        const websocket = new WebSocket(wsUrl);

        websocket.onopen = () => {
          console.log(`[WebSocket] Connected to batch ${batchId}`);
          // Reset reconnection attempts on successful connection
          reconnectAttempts = 0;
          
          // Send initial heartbeat
          websocket.send('ping');
          console.log(`[WebSocket] Sent initial ping to batch ${batchId}`);
          
          // Set up periodic heartbeat (ping every 30 seconds)
          heartbeatInterval = setInterval(() => {
            if (websocket.readyState === WebSocket.OPEN) {
              websocket.send('ping');
              console.log(`[WebSocket] Sent ping to batch ${batchId}`);
              
              // Set timeout to detect if pong is not received
              pongTimeout = setTimeout(() => {
                console.warn(`[WebSocket] No pong received for batch ${batchId} - connection may be dead`);
              }, 5000); // Wait 5 seconds for pong response
            }
          }, 30000); // Send ping every 30 seconds
        };
        
        websocket.onmessage = (e) => {
          try {
            // Handle pong response
            if (e.data === 'pong') {
              console.log(`[WebSocket] Received pong from batch ${batchId}`);
              if (pongTimeout) {
                clearTimeout(pongTimeout);
                pongTimeout = null;
              }
              return;
            }
            
            // Handle job progress messages
            const msg = JSON.parse(e.data);

            // ── Catch-up snapshot sent immediately on connect ─────────────
            if (msg.type === 'job_snapshot') {
              console.log(`[WebSocket] Received catch-up snapshot: ${msg.jobs?.length} jobs`);
              msg.jobs?.forEach(jobSnap => enqueueStageUpdate({
                job_id: jobSnap.job_id,
                status: jobSnap.status,
                stage: jobSnap.stage,
                stage_name: jobSnap.stage_name,
                stage_detail: jobSnap.stage_detail,
                result: jobSnap.result,
                error: jobSnap.error,
              }));
              return;
            }

            if (msg.type === 'job_progress') {
              console.log(`[WebSocket] Job ${msg.job_id} — Stage ${msg.stage}: ${msg.stage_name}${msg.stage_detail ? ' — ' + msg.stage_detail : ''}`);
              enqueueStageUpdate({
                job_id: msg.job_id,
                status: msg.status,
                stage: msg.stage,
                stage_name: msg.stage_name,
                stage_detail: msg.stage_detail,
                result: msg.result,
                error: msg.error,
              });
            }
          } catch (err) {
            console.error('[WebSocket] Failed to parse message:', err);
          }
        };
        
        websocket.onerror = (err) => {
          console.error(`[WebSocket] Error in batch ${batchId}:`, err);
        };
        
        websocket.onclose = () => {
          console.log(`[WebSocket] Disconnected from batch ${batchId}`);
          
          // Clean up heartbeat interval and pong timeout
          if (heartbeatInterval) {
            clearInterval(heartbeatInterval);
            heartbeatInterval = null;
          }
          if (pongTimeout) {
            clearTimeout(pongTimeout);
            pongTimeout = null;
          }
          
          // Attempt to reconnect if we haven't exceeded max attempts
          if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            const delay = calculateBackoffDelay(reconnectAttempts);
            reconnectAttempts++;
            console.log(`[WebSocket] Reconnection attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS} scheduled in ${delay}ms`);
            
            reconnectTimeout = setTimeout(() => {
              console.log(`[WebSocket] Attempting to reconnect (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
              attemptConnection();
            }, delay);
          } else {
            console.error(`[WebSocket] Max reconnection attempts (${MAX_RECONNECT_ATTEMPTS}) reached. Giving up.`);
            setWs(null);
          }
        };
        
        setWs(websocket);
      } catch (err) {
        console.error('[WebSocket] Failed to connect:', err);
        // Attempt to reconnect on connection error
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          const delay = calculateBackoffDelay(reconnectAttempts);
          reconnectAttempts++;
          console.log(`[WebSocket] Reconnection attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS} scheduled in ${delay}ms`);
          
          reconnectTimeout = setTimeout(() => {
            console.log(`[WebSocket] Attempting to reconnect (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
            attemptConnection();
          }, delay);
        } else {
          console.error(`[WebSocket] Max reconnection attempts (${MAX_RECONNECT_ATTEMPTS}) reached. Giving up.`);
        }
      }
    };

    // Start initial connection attempt
    attemptConnection();
  };

  const completedCount = jobs.filter(j => j.status === 'completed').length;
  const totalCount = jobs.length;
  const allDone = totalCount > 0 && jobs.every(j => j.status === 'completed' || j.status === 'error');

  return (
    <div className="p-4 sm:p-8 animate-fade-in max-w-5xl">
      <div className="mb-8">
        <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-white/50">Bulk Process</div>
        <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Batch Resume Analysis</h1>
        <p className="text-white/70 text-sm max-w-xl leading-relaxed">
          Upload up to 20 resumes to analyze them concurrently against a role.
        </p>
      </div>

      {/* 8-Stage Pipeline Visualizer */}
      <PipelineVisualizer 
        title="LIVE BATCH PROCESSING PIPELINE"
        jobs={jobs} 
        activeFilter={activeStageFilter}
        onStageClick={(idx) => setActiveStageFilter(prev => prev === idx ? null : idx)}
      />

      {/* Role Input */}
      <div className="mb-6 max-w-xl">
        <label className="block text-[10px] font-mono font-bold tracking-widest text-white/50 mb-2">TARGET_ROLE</label>
        <input
          type="text"
          value={jobRole}
          onChange={e => setJobRole(e.target.value)}
          placeholder="e.g. Product Manager, Full Stack Engineer…"
          className="w-full bg-black border border-[#333] focus:border-white/50 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 transition-colors"
        />
      </div>

      {/* Dropzone */}
      {jobs.length === 0 && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            multiple
            style={{ display: 'none' }}
            onChange={e => addFiles(e.target.files)}
          />
          <div className="relative border-t border-l border-r border-[#222] mt-8 pt-4 px-2 pb-2">
            <div className="absolute -top-3 left-4 bg-black px-2 text-[10px] font-mono font-bold text-white/40 tracking-widest">[ INPUT_ZONE ]</div>
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
              className={`border border-dashed cursor-pointer transition-all duration-300 flex flex-col items-center justify-center py-14 group overflow-hidden bg-black relative ${
                dragOver ? 'border-white shadow-[inset_0_0_20px_rgba(255,255,255,0.1)]' : 'border-[#333] hover:border-white/50'
              }`}
            >
              {dragOver && <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMjBMIDIwIDBNMjAgMjBMMCAwIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiIGZpbGw9Im5vbmUiLz48L3N2Zz4=')] opacity-50" />}
              
              <div className={`w-16 h-16 flex items-center justify-center mb-4 transition-all duration-300 ${
                dragOver ? 'scale-110' : 'group-hover:scale-105'
              }`}>
                <Users className={`w-8 h-8 ${dragOver ? 'text-white' : 'text-white/60'}`} />
              </div>
              <h3 className="text-lg font-bold text-white mb-1 tracking-wide">Drop Resumes</h3>
              <p className="text-[10px] font-mono text-white/40 mb-6 tracking-widest">PDF, JPG, PNG | MAX 20 FILES</p>
              <button className="px-8 py-2.5 rounded text-xs font-bold tracking-widest uppercase bg-white text-black hover:bg-black hover:text-white border border-white transition-colors">Select Files</button>
              
              <div className="absolute bottom-2 right-4 text-[9px] font-mono text-white/20">CAP: 20_FILES</div>
            </div>
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="glass-card rounded-2xl overflow-hidden mb-4 animate-fade-in">
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06] bg-white/[0.02]">
                <span className="text-xs font-bold uppercase tracking-wider text-white">{files.length} file{files.length > 1 ? 's' : ''} selected</span>
                <button onClick={() => setFiles([])} className="text-xs text-white/40 hover:text-white/70 transition-colors">Clear all</button>
              </div>
              <div className="divide-y divide-white/[0.04] max-h-64 overflow-y-auto">
                {files.map(f => (
                  <div key={f.name} className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                    <FileText className="w-4 h-4 text-white/40 shrink-0" />
                    <span className="flex-1 text-sm text-white truncate">{f.name}</span>
                    <span className="text-xs text-white/30 shrink-0">{(f.size / 1024).toFixed(0)} KB</span>
                    <button onClick={() => removeFile(f.name)} className="text-white/20 hover:text-white/60 transition-colors shrink-0">
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {batchError && (
            <div className="mb-4 flex items-center gap-3 px-4 py-3 rounded-xl border border-red-500/30 bg-red-500/[0.08] text-red-300 text-sm animate-fade-in">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {batchError}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!files.length || !jobRole.trim() || submitting}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm btn-premium disabled:opacity-40 mb-6 ${(!jobRole.trim() || !files.length || submitting) ? 'cursor-not-allowed' : ''}`}
          >
            {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {submitting 
              ? 'Submitting…' 
              : (!jobRole.trim() && files.length) 
                  ? 'Enter Target Role to Analyze'
                  : `Analyze ${files.length || ''} Resume${files.length !== 1 ? 's' : ''}`
            }
          </button>
        </>
      )}

      {/* JD Analyzer (Optional) */}
      {jobs.length === 0 && (
        <div className="mb-6">
          <JDAnalysisSection jdText={s.jdText} setJdText={s.setJdText} jdResult={s.jdResult} analyzing={s.jdAnalyzing} onAnalyze={s.handleJDAnalysis} expanded={s.jdExpanded} setExpanded={s.setJdExpanded} isDemo={s.isDemo} demoResult={DEMO_JD_RESULT} />
        </div>
      )}

      {/* Audit Parameters */}
      {jobs.length === 0 && (
        <div className="mb-8 rounded-xl p-5 border border-[#222] bg-black scroll-animate mt-8">
          <div className="flex items-center justify-between mb-6">
            <div className="text-[10px] font-mono font-bold tracking-widest text-white/50">AUDIT_PARAMETERS</div>
            <button className="text-[10px] font-mono text-white/40 hover:text-white transition-colors flex items-center gap-1">
              <span className="opacity-50">#</span> ADVANCED
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 rounded bg-[#0a0a0a] border border-[#222] hover:border-[#444] transition-colors">
              <div><div className="text-[11px] font-mono font-bold text-white">SYS:PII_REDACTION</div><div className="text-[10px] text-white/40 mt-1">Remove names, addresses</div></div>
              <ToggleSwitch active={s.piiRedaction} onToggle={() => s.setPiiRedaction(v => !v)} />
            </div>
            <div className="flex items-center justify-between p-4 rounded bg-[#0a0a0a] border border-[#222] hover:border-[#444] transition-colors">
              <div><div className="text-[11px] font-mono font-bold text-white">SYS:INST_MASKING</div><div className="text-[10px] text-white/40 mt-1">Obscure university names</div></div>
              <ToggleSwitch active={s.instMasking} onToggle={() => s.setInstMasking(v => !v)} />
            </div>
            <div className="flex items-center justify-between p-4 rounded bg-[#0a0a0a] border border-[#222] hover:border-[#444] transition-colors">
              <div><div className="text-[11px] font-mono font-bold text-white">SYS:GENDERED_LANG</div><div className="text-[10px] text-white/40 mt-1">Flag biased semantics</div></div>
              <ToggleSwitch active={s.genderedLang} onToggle={() => s.setGenderedLang(v => !v)} />
            </div>
          </div>
        </div>
      )}

      {/* Live Queue */}
      {jobs.length > 0 && (
        <div className="animate-fade-in">
          {/* Progress bar */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {!allDone && <RefreshCw className="w-4 h-4 text-white/70 animate-spin" />}
              {allDone && <CheckCircle className="w-4 h-4 text-white" />}
              <span className="text-sm font-bold text-white">
                {allDone ? 'All done!' : `Processing… ${completedCount}/${totalCount} complete`}
              </span>
            </div>
            <button
              onClick={() => { 
                setJobs([]); 
                setBatchError(null); 
                if (ws) {
                  ws.close();
                  setWs(null);
                }
              }}
              className="text-xs text-white/40 hover:text-white/70 transition-colors flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> New Batch
            </button>

          </div>
          <div className="w-full bg-[#111] rounded-full h-1.5 mb-4 overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-700"
              style={{ width: `${totalCount ? (completedCount / totalCount) * 100 : 0}%` }}
            />
          </div>
          {activeStageFilter !== null && (
            <div className="mb-3 flex items-center gap-2 text-[10px] text-white/80 font-mono font-bold animate-fade-in uppercase">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              Highlighting candidates in stage: <span className="text-white">{['Resume Upload','PII Strip','Blind Score','Skill Graph','Bias Detect','Percentile Rank','Counterfactual','Fairness Gate'][activeStageFilter]}</span>
              <button onClick={() => setActiveStageFilter(null)} className="ml-2 text-white/30 hover:text-white transition-colors">[clear]</button>
            </div>
          )}
          <div className="glass-card rounded-2xl border border-white/[0.08] overflow-hidden">
            {jobs.map((job, idx) => {
              // Determine if this job matches the active stage filter
              let isHighlighted = false;
              if (activeStageFilter !== null) {
                if (activeStageFilter === 0 && job.status === 'queued') isHighlighted = true;
                else if (activeStageFilter === 7 && (job.status === 'completed' || job.status === 'error')) isHighlighted = true;
                else if (job.status === 'processing' && job.stage !== undefined && job.stage === activeStageFilter) isHighlighted = true;
                else if (job.status === 'processing' && job._processingStartedAt) {
                  const elapsed = Date.now() - job._processingStartedAt;
                  const estStage = Math.min(Math.floor(elapsed / 3500) + 1, 6);
                  if (estStage === activeStageFilter) isHighlighted = true;
                }
              }
              return (
                <div
                  key={job.job_id || idx}
                  className={`transition-all duration-300 ${
                    activeStageFilter !== null && !isHighlighted ? 'opacity-30' : ''
                  } ${isHighlighted ? 'ring-1 ring-inset ring-white/30 bg-white/[0.03]' : ''}`}
                >
                  <JobRow job={job} onViewResult={onViewResult} />
                </div>
              );
            })}
          </div>

          {/* Ranked table when done */}
          <RankedResults jobs={jobs} onViewResult={onViewResult} />
        </div>
      )}
    </div>
  );
}
