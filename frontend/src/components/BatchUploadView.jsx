import React, { useState, useRef, useEffect, useCallback } from 'react';
import { UploadCloud, FileText, XCircle, Play, CheckCircle, AlertTriangle, Clock, Zap, RefreshCw, ChevronDown, ChevronUp, Award, TrendingDown, TrendingUp, Users } from 'lucide-react';
import { API_URL } from './constants';
import { useAuth } from '../context/AuthContext';
import PipelineVisualizer from './PipelineVisualizer';

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
  processing: 'text-blue-300 bg-blue-500/10 border-blue-500/20',
  completed:  'text-emerald-300 bg-emerald-500/10 border-emerald-500/20',
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

  // Estimate which pipeline stage we're on based on elapsed time
  const [stageIdx, setStageIdx] = useState(0);
  useEffect(() => {
    if (!isProcessing) { setStageIdx(0); return; }
    const interval = setInterval(() => {
      setStageIdx(prev => Math.min(prev + 1, STAGES.length - 1));
    }, 3500);
    return () => clearInterval(interval);
  }, [isProcessing]);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-4 border-b border-white/[0.05] last:border-0 hover:bg-white/[0.02] transition-colors group animate-fade-in">
      {/* File icon */}
      <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0">
        <FileText className="w-4 h-4 text-white/60" />
      </div>

      {/* Filename + status */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-white truncate">{job.filename}</div>
        {isProcessing && (
          <div className="flex items-center gap-1.5 mt-1">
            {STAGES.map((s, i) => (
              <div key={s.key} title={s.label} className={`w-2 h-2 rounded-full transition-all duration-500 ${
                i < stageIdx ? 'bg-emerald-400' :
                i === stageIdx ? 'bg-blue-400 animate-pulse scale-125' :
                'bg-white/10'
              }`} />
            ))}
            <span className="text-[10px] text-blue-300 ml-1">{STAGES[stageIdx]?.label}…</span>
          </div>
        )}
        {isDone && (
          <div className="text-xs text-white/40 mt-0.5 flex items-center gap-2">
            <span className={`font-bold ${score >= 70 ? 'text-emerald-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
              Score: {score}/100
            </span>
            {proxies > 0 && <span className="text-yellow-400">⚠ {proxies} bias signal{proxies > 1 ? 's' : ''}</span>}
          </div>
        )}
        {isFailed && <div className="text-xs text-red-400/80 mt-0.5 truncate">{job.error || 'Processing failed'}</div>}
      </div>

      {/* Status badge */}
      <span className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${STATUS_COLORS[job.status]}`}>
        {isProcessing && <RefreshCw className="w-2.5 h-2.5 inline mr-1 animate-spin" />}
        {STATUS_LABEL[job.status]}
      </span>

      {/* View button */}
      {isDone && (
        <button
          onClick={() => onViewResult(job)}
          className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold bg-white/[0.06] border border-white/[0.10] text-white hover:bg-white/[0.10] transition-all"
        >
          View →
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
    <section className="mt-6 animate-fade-in-up">
      <div className="flex items-center gap-2 mb-3">
        <Award className="w-4 h-4 text-yellow-400" />
        <h3 className="text-sm font-bold text-white uppercase tracking-widest">Ranked Results — {sorted.length} candidates</h3>
      </div>
      <div className="glass-card rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="hidden sm:grid grid-cols-12 gap-3 px-5 py-3 border-b border-white/[0.06] bg-white/[0.02] text-xs font-bold uppercase tracking-widest text-white/40">
          <div className="col-span-1">#</div>
          <div className="col-span-5">Candidate</div>
          <div className="col-span-2 text-center">Score</div>
          <div className="col-span-2 text-center">Bias</div>
          <div className="col-span-2 text-right">Action</div>
        </div>
        {sorted.map((job, idx) => {
          const score = job.result?.fit_score || 0;
          const proxies = job.result?.bias_proxies?.length || 0;
          return (
            <div key={job.job_id} className="grid grid-cols-12 gap-3 px-5 py-4 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors items-center">
              {/* Rank */}
              <div className="col-span-1">
                {idx === 0 && <span className="text-yellow-400 font-black text-sm">🥇</span>}
                {idx === 1 && <span className="text-white/60 font-black text-sm">🥈</span>}
                {idx === 2 && <span className="text-orange-400/80 font-black text-sm">🥉</span>}
                {idx > 2 && <span className="text-white/30 text-sm font-bold">#{idx + 1}</span>}
              </div>
              {/* Name */}
              <div className="col-span-5 text-sm text-white font-medium truncate">{job.filename}</div>
              {/* Score */}
              <div className="col-span-2 text-center">
                <span className={`text-lg font-black ${score >= 70 ? 'text-emerald-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {score}
                </span>
                <span className="text-white/30 text-xs">/100</span>
              </div>
              {/* Bias */}
              <div className="col-span-2 text-center">
                {proxies === 0
                  ? <span className="text-emerald-400 text-xs font-bold">✓ Clean</span>
                  : <span className="text-yellow-400 text-xs font-bold">⚠ {proxies}</span>
                }
              </div>
              {/* Action */}
              <div className="col-span-2 text-right">
                <button
                  onClick={() => onViewResult(job)}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.10] text-white hover:bg-white/[0.10] transition-all"
                >
                  Full Report
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function BatchUploadView({ onViewResult }) {
  const { authHeaders } = useAuth();
  const [files, setFiles] = useState([]);        // selected File objects
  const [jobRole, setJobRole] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [jobs, setJobs] = useState([]);          // [{filename, job_id, status, result, error}]
  const [batchError, setBatchError] = useState(null);
  const fileInputRef = useRef(null);
  const pollersRef = useRef({});                 // job_id → interval id

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
        setJobs(prev => prev.map(j => j.job_id === job_id ? { ...j, ...data } : j));
        if (data.status === 'completed' || data.status === 'error') {
          clearInterval(pollersRef.current[job_id]);
          delete pollersRef.current[job_id];
        }
      } catch {}
    }, 2500);
    pollersRef.current[job_id] = interval;
  };

  // Cleanup pollers on unmount
  useEffect(() => () => Object.values(pollersRef.current).forEach(clearInterval), []);

  const handleSubmit = async () => {
    if (!files.length || !jobRole.trim()) return;
    setBatchError(null);
    setSubmitting(true);
    setJobs([]);

    try {
      const fd = new FormData();
      files.forEach(f => fd.append('files', f));
      fd.append('role', jobRole);

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

      // Initialize job states from response
      const initialJobs = data.jobs.map(j => ({ ...j, result: null, error: null }));
      setJobs(initialJobs);
      setFiles([]);

      // Start polling for each job
      initialJobs.forEach(j => startPoll(j.job_id));
    } catch (e) {
      setBatchError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const completedCount = jobs.filter(j => j.status === 'completed').length;
  const totalCount = jobs.length;
  const allDone = totalCount > 0 && jobs.every(j => j.status === 'completed' || j.status === 'error');

  return (
    <div className="p-4 sm:p-8 animate-fade-in max-w-5xl">
      <div className="mb-1 flex items-center gap-2">
        <span className="text-white/80 text-xs">◈</span>
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/80">Recruiter Tools</span>
      </div>
      <h1 className="text-3xl font-bold text-white mb-2">Batch Resume Audit</h1>
      <p className="text-white/70 text-sm max-w-xl leading-relaxed mb-8">
        Upload up to 20 resumes at once. All candidates process through the full 8-stage bias-free pipeline simultaneously. Results are ranked by fit score when done.
      </p>

      {/* 8-Stage Pipeline Visualizer */}
      <PipelineVisualizer />

      {/* Role Input */}
      <div className="mb-6 max-w-xl">
        <label className="block text-xs font-bold uppercase tracking-widest text-white mb-2">Target Role</label>
        <input
          type="text"
          value={jobRole}
          onChange={e => setJobRole(e.target.value)}
          placeholder="e.g. Product Manager, Full Stack Engineer…"
          className="w-full glass-input rounded-xl px-4 py-3 text-sm text-white placeholder-white/20"
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
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
            className={`rounded-2xl border border-dashed cursor-pointer transition-all duration-300 flex flex-col items-center justify-center py-14 group overflow-hidden mb-4 ${
              dragOver ? 'border-white/40 bg-white/[0.04]' : 'border-white/10 bg-black hover:border-white/25 hover:bg-white/[0.02]'
            }`}
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 border transition-all duration-300 ${
              dragOver ? 'bg-white/10 border-white/20 scale-110' : 'bg-white/[0.02] border-white/[0.05] group-hover:border-white/15'
            }`}>
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Drop up to 20 Resumes</h3>
            <p className="text-white/50 text-sm mb-4">PDF, JPG, PNG — each processes through the full AI pipeline</p>
            <button className="px-6 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase btn-premium">Select Files</button>
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
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm btn-premium disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {submitting ? 'Submitting…' : `Analyze ${files.length || ''} Resume${files.length !== 1 ? 's' : ''}`}
          </button>
        </>
      )}

      {/* Live Queue */}
      {jobs.length > 0 && (
        <div className="animate-fade-in">
          {/* Progress bar */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {!allDone && <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />}
              {allDone && <CheckCircle className="w-4 h-4 text-emerald-400" />}
              <span className="text-sm font-bold text-white">
                {allDone ? 'All done!' : `Processing… ${completedCount}/${totalCount} complete`}
              </span>
            </div>
            <button
              onClick={() => { setJobs([]); setBatchError(null); }}
              className="text-xs text-white/40 hover:text-white/70 transition-colors flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> New Batch
            </button>
          </div>
          <div className="w-full bg-white/[0.06] rounded-full h-1.5 mb-4 overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all duration-700"
              style={{ width: `${totalCount ? (completedCount / totalCount) * 100 : 0}%` }}
            />
          </div>

          {/* Job rows */}
          <div className="glass-card rounded-2xl overflow-hidden mb-4">
            {jobs.map(job => (
              <JobRow key={job.job_id} job={job} onViewResult={onViewResult} />
            ))}
          </div>

          {/* Ranked table when done */}
          <RankedResults jobs={jobs} onViewResult={onViewResult} />
        </div>
      )}
    </div>
  );
}
