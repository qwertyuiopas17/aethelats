import React, { useState } from 'react';
import { FileText, Clock, AlertTriangle, MessageSquare, Check, X, Maximize2, TrendingUp } from 'lucide-react';
import { API_URL } from './constants';
import { useAuth } from '../context/AuthContext';
import ResultsView from './ResultsView';

const STAGES = ['Sourced', 'Screening', 'Interview', 'Offer', 'Rejected'];

const STAGE_COLORS = {
  Sourced:   { border: 'border-white/10',         dot: 'bg-white/30',        badge: 'bg-white/5 text-white/50' },
  Screening: { border: 'border-blue-500/30',      dot: 'bg-blue-400',        badge: 'bg-blue-500/10 text-blue-300' },
  Interview: { border: 'border-violet-500/30',    dot: 'bg-violet-400',      badge: 'bg-violet-500/10 text-violet-300' },
  Offer:     { border: 'border-emerald-500/30',   dot: 'bg-emerald-400',     badge: 'bg-emerald-500/10 text-emerald-300' },
  Rejected:  { border: 'border-red-500/20',       dot: 'bg-red-400/60',      badge: 'bg-red-500/10 text-red-400/80' },
};

// Batch color generation - consistent hash-based colors
function getBatchColor(batchId) {
  if (!batchId) return null;
  const colors = [
    '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
    '#06b6d4', '#6366f1', '#f43f5e', '#84cc16', '#a855f7'
  ];
  let hash = 0;
  for (let i = 0; i < batchId.length; i++) {
    hash = batchId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function ScorePill({ score }) {
  const color = score >= 75 ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
              : score >= 50 ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
              : 'text-red-400 bg-red-400/10 border-red-400/20';
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${color}`}>
      {score}
    </span>
  );
}

// DNA Spark Card - Mini 5-bar chart showing top skill matches
function DNASparkCard({ skillMatches }) {
  if (!skillMatches || skillMatches.length === 0) return null;
  
  const top5 = skillMatches.slice(0, 5);
  const maxScore = Math.max(...top5.map(s => s.score || 0), 1);
  
  return (
    <div className="space-y-1">
      <div className="flex items-end gap-1 h-8">
        {top5.map((skill, idx) => {
          const heightPercent = ((skill.score || 0) / maxScore) * 100;
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-0.5">
              <div
                className="w-full bg-gradient-to-t from-violet-500/60 to-violet-400/40 rounded-sm transition-all hover:from-violet-500 hover:to-violet-400"
                style={{ height: `${Math.max(heightPercent, 10)}%` }}
                title={`${skill.skill}: ${skill.score}%`}
              />
            </div>
          );
        })}
      </div>
      <div className="text-[9px] text-violet-300/60 truncate">
        {top5.map(s => s.skill).join(' • ')}
      </div>
    </div>
  );
}

// Rejection Reason - Shows missing skills for rejected candidates
function RejectionReason({ missingSkills, stage }) {
  if (stage !== 'Rejected' || !missingSkills || missingSkills.length === 0) return null;
  
  const displaySkills = missingSkills.slice(0, 5);
  const hasMore = missingSkills.length > 5;
  
  return (
    <div className="mt-2 pt-2 border-t border-red-500/20 bg-red-500/5 -mx-3.5 -mb-3.5 px-3.5 pb-3 rounded-b-xl">
      <div className="text-[10px] text-red-400 font-semibold mb-1 flex items-center gap-1">
        <AlertTriangle className="w-3 h-3" />
        Rejection Reason
      </div>
      <div className="text-[11px] text-red-300/80 leading-relaxed">
        <span className="font-medium">Missing:</span> {displaySkills.join(', ')}{hasMore ? '...' : ''}
      </div>
    </div>
  );
}

// Result Drawer - Lazy-loads and displays full report
function ResultDrawer({ scanId, isOpen, onClose, authHeaders }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resultData, setResultData] = useState(null);

  React.useEffect(() => {
    if (!isOpen || !scanId) {
      setResultData(null);
      setError(null);
      return;
    }

    async function fetchResult() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/user/scans/${scanId}/result`, {
          headers: authHeaders(),
        });
        if (!res.ok) {
          throw new Error(res.status === 404 ? 'Result not available' : 'Failed to load report');
        }
        const data = await res.json();
        setResultData(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    fetchResult();
  }, [isOpen, scanId, authHeaders]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-gradient-to-br from-[#0a0a0f] to-[#1a1a2e] rounded-2xl border border-white/10 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <h2 className="text-lg font-bold text-white">Full Candidate Report</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex items-center justify-center h-full min-h-[400px]">
              <div className="text-white/60">Loading report...</div>
            </div>
          )}
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300">
              <AlertTriangle className="w-5 h-5" />
              <div>
                <div className="font-semibold">Unable to load report</div>
                <div className="text-sm text-red-300/80">{error}</div>
              </div>
            </div>
          )}
          {resultData && (
            <ResultsView s={{
              result: resultData.result,
              jobRole: resultData.role_target,
              fileName: resultData.file_name,
            }} />
          )}
        </div>
      </div>
    </div>
  );
}

function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  const diffD = Math.floor((Date.now() - d) / 86400000);
  if (diffD < 1)  return 'today';
  if (diffD < 7)  return `${diffD}d ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function getSuggestedStage(score) {
  if (score == null) return null;
  if (score >= 80) return 'Interview';
  if (score >= 60) return 'Screening';
  return null;
}

function CandidateCard({ scan, onMove, movingId, onDragStart, authHeaders, onExpandClick }) {
  const stage = scan.kanban_stage || 'Sourced';
  const isMoving = movingId === scan.id;
  const [noteOpen, setNoteOpen] = useState(false);
  const [localNote, setLocalNote] = useState(scan.recruiter_notes || '');
  const [noteSaved, setNoteSaved] = useState(false);
  const noteTimerRef = React.useRef(null);

  // Batch stripe color
  const batchColor = scan.batch_id ? getBatchColor(scan.batch_id) : null;

  // Parse result_json for DNA spark card and rejection reason
  let skillMatches = [];
  let missingSkills = [];
  try {
    if (scan.result_json) {
      const result = JSON.parse(scan.result_json);
      skillMatches = result.skill_matches || result.skills_matched || [];
      missingSkills = result.missing_skills || [];
      
      // Debug logging
      if (skillMatches.length === 0 && result) {
        console.log('[KanbanCard] No skill_matches found. Result keys:', Object.keys(result));
        console.log('[KanbanCard] Full result:', result);
      }
    }
  } catch (e) {
    console.error('[KanbanCard] Failed to parse result_json:', e);
  }

  // AI suggestion logic
  const suggested = getSuggestedStage(scan.fit_score);
  const currentIdx = STAGES.indexOf(stage);
  const suggestedIdx = suggested ? STAGES.indexOf(suggested) : -1;
  const showSuggestion = suggested && suggestedIdx > currentIdx;

  function scheduleNoteSave(scanId, text) {
    clearTimeout(noteTimerRef.current);
    setNoteSaved(false);
    noteTimerRef.current = setTimeout(async () => {
      try {
        await fetch(`${API_URL}/user/scans/${scanId}/notes`, {
          method: 'PATCH',
          headers: { ...authHeaders(), 'Content-Type': 'application/json' },
          body: JSON.stringify({ notes: text }),
        });
        setNoteSaved(true);
        setTimeout(() => setNoteSaved(false), 2000);
      } catch {}
    }, 800);
  }

  return (
    <div
      draggable={!isMoving}
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        onDragStart(scan);
      }}
      className={`
        group relative rounded-xl border p-3.5 transition-all duration-300 cursor-grab active:cursor-grabbing
        bg-white/[0.02] hover:bg-white/[0.04]
        ${STAGE_COLORS[stage]?.border || 'border-white/10'}
        ${isMoving ? 'opacity-50 scale-[0.98]' : ''}
      `}
      style={batchColor ? { borderLeftWidth: '4px', borderLeftColor: batchColor } : {}}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center shrink-0">
            <FileText className="w-3.5 h-3.5 text-white/40" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-white truncate leading-tight">
              {scan.file_name || 'Resume'}
            </div>
            <div className="text-[10px] text-white/30 font-mono truncate">
              {scan.candidate_id || `#${scan.id}`}
            </div>
          </div>
        </div>
        {scan.fit_score != null && <ScorePill score={scan.fit_score} />}
      </div>

      {/* Role */}
      <div className="text-xs text-white/40 mb-3 truncate">{scan.role_target}</div>

      {/* DNA Spark Card - Top 5 skill matches with prominent styling */}
      {skillMatches.length > 0 && (
        <div className="mb-3 p-2.5 rounded-lg bg-gradient-to-br from-violet-500/10 to-purple-500/5 border border-violet-500/20">
          <div className="text-[10px] text-violet-300 mb-1.5 flex items-center gap-1 font-semibold">
            <TrendingUp className="w-3 h-3" />
            Skill DNA
          </div>
          <DNASparkCard skillMatches={skillMatches} />
        </div>
      )}

      {/* AI Suggestion */}
      {showSuggestion && (
        <button
          onClick={() => onMove(scan, suggested)}
          disabled={!!movingId}
          className="w-full mt-1 mb-2 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-violet-500/[0.08] border border-violet-500/20
                     text-[10px] text-violet-300 hover:bg-violet-500/15 transition-all text-left"
          title={`AI suggests moving to ${suggested} based on score ${scan.fit_score}`}
        >
          <span className="text-[8px]">✦</span>
          AI suggests → <span className="font-bold">{suggested}</span>
        </button>
      )}

      {/* Rejection Reason - Missing skills for rejected candidates */}
      <RejectionReason missingSkills={missingSkills} stage={stage} />

      {/* Expand button - Opens full report drawer */}
      {scan.has_result && (
        <button
          onClick={() => onExpandClick(scan.id)}
          className="w-full mt-2 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg 
                     bg-gradient-to-r from-blue-500/10 to-violet-500/10 border border-blue-500/30
                     text-[11px] font-semibold text-blue-300 hover:text-blue-200 hover:from-blue-500/20 hover:to-violet-500/20 
                     transition-all shadow-sm hover:shadow-md"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          View Full Report
        </button>
      )}

      {/* Notes toggle */}
      <div className="border-t border-white/[0.05] mt-2 pt-2">
        <button
          onClick={() => setNoteOpen(v => !v)}
          className="flex items-center gap-1.5 text-[10px] text-white/30 hover:text-white/60 transition-colors"
        >
          <MessageSquare className="w-3 h-3" />
          {localNote ? 'Note added' : 'Add note'}
        </button>
        {noteOpen && (
          <div className="mt-2 relative">
            <textarea
              value={localNote}
              onChange={e => { setLocalNote(e.target.value); scheduleNoteSave(scan.id, e.target.value); }}
              placeholder="Private notes…"
              rows={2}
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-2.5 py-2 text-xs text-white/70 placeholder-white/20 resize-none focus:outline-none focus:border-white/20 transition-all"
            />
            {noteSaved && (
              <span className="absolute right-2 bottom-2 text-[10px] text-emerald-400 flex items-center gap-0.5">
                <Check className="w-2.5 h-2.5" /> Saved
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer: timestamp and batch */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-1 text-[10px] text-white/20">
          <Clock className="w-3 h-3" />
          {scan.stage_updated_at
            ? `In stage ${fmtDate(scan.stage_updated_at)}`
            : fmtDate(scan.timestamp)}
        </div>
        {scan.batch_id && (
          <div 
            className="text-[9px] font-bold px-2 py-0.5 rounded-full font-mono"
            title={`Batch ID: ${scan.batch_id}`}
            style={batchColor ? { 
              backgroundColor: batchColor + '20',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: batchColor + '60',
              color: batchColor
            } : {}}
          >
            #{scan.batch_id.slice(0, 6)}
          </div>
        )}
      </div>
    </div>
  );
}

function KanbanColumn({ stage, cards, onMove, movingId, onDragStart, onDrop, isDragOver, setDragOverStage, authHeaders, onExpandClick }) {
  const colors = STAGE_COLORS[stage];
  return (
    <div className="flex flex-col min-w-[220px] max-w-[260px] w-full flex-shrink-0">
      {/* Column header */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
        <span className="text-xs font-bold uppercase tracking-widest text-white/60">{stage}</span>
        <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${colors.badge}`}>
          {cards.length}
        </span>
      </div>
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOverStage(stage); }}
        onDragLeave={() => setDragOverStage(null)}
        onDrop={(e) => { e.preventDefault(); onDrop(stage); setDragOverStage(null); }}
        className={`flex flex-col gap-2.5 min-h-[80px] rounded-xl transition-all duration-200 p-1 -m-1 ${
          isDragOver ? 'bg-white/[0.04] ring-1 ring-white/20' : ''
        }`}
      >
        {cards.length === 0 && (
          <div className={`rounded-xl border border-dashed py-8 text-center text-xs transition-all ${
            isDragOver ? 'border-white/20 text-white/40' : 'border-white/[0.06] text-white/20'
          }`}>
            {isDragOver ? 'Drop here' : 'Empty'}
          </div>
        )}
        {cards.map(scan => (
          <CandidateCard
            key={scan.id}
            scan={scan}
            onMove={onMove}
            movingId={movingId}
            onDragStart={onDragStart}
            authHeaders={authHeaders}
            onExpandClick={onExpandClick}
          />
        ))}
      </div>
    </div>
  );
}

export default function KanbanBoardView({ scans: initialScans }) {
  const { authHeaders } = useAuth();
  const [scans, setScans] = useState(initialScans);
  const [movingId, setMovingId] = useState(null);
  const [moveError, setMoveError] = useState(null);
  const [draggingScan, setDraggingScan] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);
  const [drawerScanId, setDrawerScanId] = useState(null);

  // Keep in sync when parent refreshes - intelligent diffing to prevent unnecessary remounts
  React.useEffect(() => {
    setScans(prev => {
      const prevMap = new Map(prev.map(s => [s.id, s]));
      const newMap = new Map(initialScans.map(s => [s.id, s]));
      
      // Build updated array preserving unchanged references
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

  async function handleMove(scan, newStage) {
    if (movingId) return;
    if ((scan.kanban_stage || 'Sourced') === newStage) return;
    setMovingId(scan.id);
    setMoveError(null);

    // Optimistic update
    setScans(prev => prev.map(s => s.id === scan.id ? { ...s, kanban_stage: newStage } : s));

    try {
      const res = await fetch(`${API_URL}/user/scans/${scan.id}/stage`, {
        method: 'PATCH',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to move candidate');
      }
    } catch (e) {
      // Rollback on error
      setScans(prev => prev.map(s => s.id === scan.id ? { ...s, kanban_stage: scan.kanban_stage } : s));
      setMoveError(e.message);
    } finally {
      setMovingId(null);
    }
  }

  function handleDrop(targetStage) {
    if (!draggingScan) return;
    handleMove(draggingScan, targetStage);
    setDraggingScan(null);
  }

  const grouped = STAGES.reduce((acc, stage) => {
    acc[stage] = scans.filter(s => (s.kanban_stage || 'Sourced') === stage);
    return acc;
  }, {});

  return (
    <div>
      {moveError && (
        <div className="flex items-center gap-2 mb-4 px-4 py-3 rounded-xl bg-red-500/[0.06] border border-red-500/15 text-red-300 text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {moveError}
        </div>
      )}
      
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map(stage => (
          <KanbanColumn
            key={stage}
            stage={stage}
            cards={grouped[stage]}
            onMove={handleMove}
            movingId={movingId}
            onDragStart={setDraggingScan}
            onDrop={handleDrop}
            isDragOver={dragOverStage === stage}
            setDragOverStage={setDragOverStage}
            authHeaders={authHeaders}
            onExpandClick={setDrawerScanId}
          />
        ))}
      </div>

      {/* Result Drawer */}
      <ResultDrawer
        scanId={drawerScanId}
        isOpen={!!drawerScanId}
        onClose={() => setDrawerScanId(null)}
        authHeaders={authHeaders}
      />
    </div>
  );
}
