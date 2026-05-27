import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { FileText, Clock, AlertTriangle, MessageSquare, Check, X, Maximize2, TrendingUp } from 'lucide-react';
import { API_URL } from './constants';
import { useAuth } from '../context/AuthContext';
import ResultsView from './ResultsView';

const STAGES = ['Sourced', 'Screening', 'Interview', 'Offer', 'Rejected'];

const STAGE_COLORS = {
  Sourced:   { border: 'border-white/[0.05]',         dot: 'bg-white/30',        badge: 'bg-white/5 text-white/50' },
  Screening: { border: 'border-blue-500/20',      dot: 'bg-blue-400',        badge: 'bg-blue-500/10 text-blue-300' },
  Interview: { border: 'border-violet-500/20',    dot: 'bg-violet-400',      badge: 'bg-violet-500/10 text-violet-300' },
  Offer:     { border: 'border-emerald-500/20',   dot: 'bg-emerald-400',     badge: 'bg-emerald-500/10 text-emerald-300' },
  Rejected:  { border: 'border-red-500/15',       dot: 'bg-red-400/60',      badge: 'bg-red-500/10 text-red-400/80' },
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
// Bar heights are scaled by fit_score to show candidate quality
function DNASparkCard({ skillMatches, fitScore }) {
  // If no skills, show placeholder
  if (!skillMatches || skillMatches.length === 0) {
    return (
      <div className="space-y-1.5">
        <div className="flex items-end gap-1 h-16 bg-violet-500/5 rounded p-2">
          {[30, 50, 70, 60, 40].map((height, idx) => (
            <div key={idx} className="flex-1 flex items-end">
              <div
                className="w-full bg-gradient-to-t from-violet-500/20 to-violet-400/10 rounded-sm min-h-[8px]"
                style={{ height: `${height}%` }}
              />
            </div>
          ))}
        </div>
        <div className="text-[9px] text-violet-300/40 text-center">
          No skill data
        </div>
      </div>
    );
  }
  
  const top5 = skillMatches.slice(0, 5);

  // Use real per-skill scores from evaluator if available (score 0-100, or relevance/match_score 0-1)
  const hasRealScores = top5.some(s => s.score != null || s.relevance != null || s.match_score != null);
  let barHeights;
  if (hasRealScores) {
    barHeights = top5.map(s => {
      const raw = s.score ?? s.relevance ?? s.match_score ?? 0.5;
      const normalized = raw > 1 ? raw : raw * 100; // handle both 0-1 and 0-100 ranges
      return Math.max(15, Math.min(100, normalized));
    });
  } else {
    // Fallback: scale a base pattern by overall fit_score
    const baseHeights = [100, 75, 90, 60, 80];
    const mult = (fitScore || 50) / 100;
    barHeights = baseHeights.map(h => Math.max(20, h * Math.pow(mult, 0.7)));
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-end gap-1 h-16 bg-violet-500/5 rounded p-2">
        {top5.map((skill, idx) => {
          const skillName = skill.canonical_name || skill.skill || 'Unknown';
          const heightPercent = barHeights[idx] || 50;
          const rawScore = skill.score ?? skill.relevance ?? skill.match_score;
          const displayScore = rawScore != null
            ? (rawScore > 1 ? Math.round(rawScore) : Math.round(rawScore * 100))
            : fitScore;
          return (
            <div key={idx} className="flex-1 h-full flex items-end bg-violet-500/10 rounded-sm overflow-hidden border border-violet-500/10 relative group">
              <div
                className="w-full bg-gradient-to-t from-violet-500 to-violet-400 transition-all group-hover:from-violet-400 group-hover:to-violet-300 cursor-help min-h-[4px]"
                style={{ height: `${heightPercent}%` }}
                title={`${skillName}: ${displayScore ?? 'N/A'}${rawScore != null ? '%' : ''}`}
              />
            </div>
          );
        })}
      </div>
      <div className="text-[9px] text-violet-300/70 leading-tight text-center px-1 whitespace-nowrap overflow-hidden text-ellipsis" title={top5.map(s => s.canonical_name || s.skill || 'Unknown').join(', ')}>
        {top5.map(s => s.canonical_name || s.skill || 'Unknown').join(' • ')}
      </div>
    </div>
  );
}

// Rejection Reason - Shows missing skills for rejected candidates
function RejectionReason({ missingSkills, stage }) {
  if (stage !== 'Rejected' || !missingSkills || missingSkills.length === 0) return null;
  
  const displaySkills = missingSkills.slice(0, 5);
  const hasMore = missingSkills.length > 5;
  
  // Extract skill names from objects {gap: "Problem Solving", severity: "minor"}
  const skillNames = displaySkills.map(s => {
    if (typeof s === 'string') return s;
    return s.gap || s.skill || s.canonical_name || 'Unknown';
  });
  
  return (
    <div className="mt-2 pt-2 border-t border-red-500/20 bg-red-500/5 -mx-3.5 -mb-3.5 px-3.5 pb-3 rounded-b-xl">
      <div className="text-[10px] text-red-400 font-semibold mb-1 flex items-center gap-1">
        <AlertTriangle className="w-3 h-3" />
        Rejection Reason
      </div>
      <div className="text-[11px] text-red-300/80 leading-relaxed">
        <span className="font-medium">Missing:</span> {skillNames.join(', ')}{hasMore ? '...' : ''}
      </div>
    </div>
  );
}

// Batch Legend — clickable cohort color chips to isolate a batch across all stages
function BatchLegend({ batches, activeBatch, onToggle }) {
  if (!batches || batches.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-[10px] text-white/30 uppercase tracking-wider font-semibold shrink-0">Cohort:</span>
      {batches.map(({ batchId, color, count }) => (
        <button
          key={batchId}
          onClick={() => onToggle(batchId)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
            activeBatch === batchId ? 'scale-105 shadow-lg' : 'opacity-60 hover:opacity-90'
          }`}
          style={{
            backgroundColor: color + (activeBatch === batchId ? '30' : '15'),
            borderColor: color + (activeBatch === batchId ? 'cc' : '40'),
            color,
          }}
          title={`Filter to batch #${batchId.slice(0, 8)} (${count} candidates)`}
        >
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
          #{batchId.slice(0, 6)}
          <span className="opacity-60">×{count}</span>
        </button>
      ))}
      {activeBatch && (
        <button
          onClick={() => onToggle(null)}
          className="text-[10px] text-white/40 hover:text-white/70 transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
        >
          Clear ×
        </button>
      )}
    </div>
  );
}

// Velocity Bar — avg time-in-stage + stale candidate count
function VelocityBar({ scans }) {
  const now = Date.now();
  const tracked = scans.filter(s => s.stage_updated_at);
  if (tracked.length === 0) return null;

  const avgDays = (tracked.reduce((sum, s) => sum + (now - new Date(s.stage_updated_at)) / 86400000, 0) / tracked.length).toFixed(1);
  const staleCards = tracked.filter(s => {
    const stage = s.kanban_stage || 'Sourced';
    return (now - new Date(s.stage_updated_at)) / 86400000 >= 5 && stage !== 'Offer' && stage !== 'Rejected';
  });

  return (
    <div className="flex flex-wrap items-center gap-4 mb-4 px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
        <div>
          <div className="text-[9px] text-white/30 uppercase tracking-wider">Avg time in stage</div>
          <div className="text-sm font-bold text-white">{avgDays}d</div>
        </div>
      </div>
      {staleCards.length > 0 && (
        <div className="flex items-center gap-2 pl-4 border-l border-white/[0.06]">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <div>
            <div className="text-[9px] text-white/30 uppercase tracking-wider">Stale (≥5d)</div>
            <div className="text-sm font-bold text-amber-400">{staleCards.length} candidate{staleCards.length !== 1 ? 's' : ''}</div>
          </div>
        </div>
      )}
      <div className="flex items-center gap-2 pl-4 border-l border-white/[0.06]">
        <div>
          <div className="text-[9px] text-white/30 uppercase tracking-wider">Pipeline</div>
          <div className="text-sm font-bold text-white">{scans.length} total</div>
        </div>
      </div>
    </div>
  );
}

// Rejection Pattern Insight — aggregate most-common missing skills across ALL rejected cards
function RejectionPatternInsight({ rejectedScans }) {
  if (!rejectedScans || rejectedScans.length === 0) return null;

  // Tally missing skills across all rejected candidates
  const freq = {};
  rejectedScans.forEach(scan => {
    if (!scan.result_json) return;
    try {
      const result = typeof scan.result_json === 'string' ? JSON.parse(scan.result_json) : scan.result_json;
      const gaps = result.gaps || result.missing_skills || result.missingSkills || [];
      gaps.forEach(g => {
        const name = typeof g === 'string' ? g : (g.gap || g.skill || g.canonical_name || '');
        if (name) freq[name] = (freq[name] || 0) + 1;
      });
    } catch {}
  });

  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 4);
  if (sorted.length === 0) return null;

  return (
    <div className="mt-3 p-3 rounded-xl bg-red-500/5 border border-red-500/15">
      <div className="text-[10px] text-red-400/80 font-semibold mb-2 uppercase tracking-wider">Pipeline Pattern</div>
      <div className="space-y-1.5">
        {sorted.map(([skill, count]) => (
          <div key={skill} className="flex items-center justify-between gap-2">
            <span className="text-[11px] text-red-300/80 truncate">{skill}</span>
            <div className="flex items-center gap-1 shrink-0">
              <div
                className="h-1 rounded-full bg-red-400/60"
                style={{ width: `${Math.max(16, (count / rejectedScans.length) * 48)}px` }}
              />
              <span className="text-[10px] text-red-400/60 font-mono">{count}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="text-[9px] text-red-400/40 mt-2">
        Across {rejectedScans.length} rejected candidate{rejectedScans.length !== 1 ? 's' : ''}
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
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div className="min-h-screen flex items-center justify-center p-4">
        <div 
          className="relative w-full max-w-5xl bg-gradient-to-br from-[#0a0a0f] to-[#1a1a2e] rounded-2xl border border-white/10 shadow-2xl flex flex-col max-h-[90vh] my-8"
          onClick={(e) => e.stopPropagation()}
        >
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
            <div className="min-h-[400px] p-4 space-y-4 animate-pulse">
              <div className="h-8 bg-white/5 rounded-lg w-2/3" />
              <div className="h-4 bg-white/5 rounded w-1/3" />
              <div className="grid grid-cols-3 gap-4 mt-6">
                {[1,2,3].map(i => <div key={i} className="h-24 bg-white/5 rounded-xl" />)}
              </div>
              <div className="h-40 bg-white/5 rounded-xl" />
              <div className="h-32 bg-white/5 rounded-xl" />
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

  // Stale detection — card in same active stage for 5+ days
  const daysInStage = scan.stage_updated_at
    ? (Date.now() - new Date(scan.stage_updated_at)) / 86400000
    : null;
  const isStale = daysInStage != null && daysInStage >= 5 && stage !== 'Offer' && stage !== 'Rejected';

  const [noteOpen, setNoteOpen] = useState(false);
  const [localNote, setLocalNote] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);
  const noteTimerRef = useRef(null);

  // Interview Guide state
  const [guideLoading, setGuideLoading] = useState(false);
  const [guideQuestions, setGuideQuestions] = useState(null);
  const [guideError, setGuideError] = useState(null);

  // Pre-load saved guide from recruiter_notes on mount
  useEffect(() => {
    if (scan.recruiter_notes && scan.recruiter_notes.startsWith('[INTERVIEW GUIDE]')) {
      const lines = scan.recruiter_notes.split('\n').slice(1);
      const parsed = lines
        .filter(l => l.trim())
        .map((line, idx) => {
          const match = line.match(/^Q(\d+) \[([^\]]+)\]: (.+)$/);
          if (match) return { number: parseInt(match[1]), area: match[2], question: match[3] };
          return { number: idx + 1, area: 'General', question: line };
        });
      if (parsed.length > 0) setGuideQuestions(parsed);
    } else {
      setLocalNote(scan.recruiter_notes || '');
    }
  }, [scan.id, scan.recruiter_notes]);

  // Batch stripe color
  const batchColor = scan.batch_id ? getBatchColor(scan.batch_id) : null;

  // Parse result_json for DNA spark card and rejection reason
  let skillMatches = [];
  let missingSkills = [];
  
  // Always show the Skill DNA box, even if empty
  const hasResultJson = scan.result_json && scan.result_json !== 'null';
  
  if (hasResultJson) {
    try {
      const result = typeof scan.result_json === 'string' 
        ? JSON.parse(scan.result_json) 
        : scan.result_json;
      
      // skill_matches for DNA card
      skillMatches = result.skill_matches || result.skills_matched || result.skills || [];
      
      // gaps for rejection reason (not missing_skills)
      missingSkills = result.gaps || result.missing_skills || result.missingSkills || [];
      
    } catch (e) {
      console.error(`[Card ${scan.id}] Failed to parse result_json:`, e);
    }
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
        ${isStale ? 'ring-1 ring-amber-400/40 shadow-[0_0_12px_rgba(251,191,36,0.08)]' : ''}
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

      {/* DNA Spark Card - Always show, with placeholder if no data */}
      <div className="mb-3 p-2.5 rounded-lg bg-gradient-to-br from-violet-500/10 to-purple-500/5 border border-violet-500/20">
        <div className="text-[10px] text-violet-300 mb-1.5 flex items-center gap-1 font-semibold">
          <TrendingUp className="w-3 h-3" />
          Skill DNA
        </div>
        <DNASparkCard skillMatches={skillMatches} fitScore={scan.fit_score} />
      </div>

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

      {/* Interview Guide Generator */}
      {scan.has_result && (
        <div className="mt-2">
          {!guideQuestions ? (
            <button
              onClick={async () => {
                setGuideLoading(true);
                setGuideError(null);
                try {
                  const res = await fetch(`${API_URL}/user/scans/${scan.id}/interview-guide`, {
                    method: 'POST',
                    headers: authHeaders(),
                  });
                  if (!res.ok) throw new Error(await res.text());
                  const data = await res.json();
                  setGuideQuestions(data.guide);
                } catch (e) {
                  setGuideError('Failed to generate. Try again.');
                } finally {
                  setGuideLoading(false);
                }
              }}
              disabled={guideLoading}
              className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg
                         bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20
                         text-[11px] font-semibold text-amber-300 hover:text-amber-200
                         hover:from-amber-500/20 hover:to-orange-500/20 transition-all
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {guideLoading ? (
                <>
                  <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <circle cx="12" cy="12" r="10" strokeDasharray="60" strokeDashoffset="20" />
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <span className="text-xs">✦</span>
                  Generate Interview Guide
                </>
              )}
            </button>
          ) : (
            <div className="mt-1 rounded-lg bg-amber-500/5 border border-amber-500/15 p-2.5">
              <div className="text-[10px] text-amber-400 font-semibold mb-2 flex items-center gap-1">
                <span>✦</span> Interview Guide
              </div>
              <ol className="space-y-2">
                {guideQuestions.map((q) => (
                  <li key={q.number} className="text-[10px] text-white/70 leading-relaxed">
                    <span className="text-amber-400/80 font-mono font-bold mr-1">Q{q.number}</span>
                    <span className="text-amber-300/60 text-[9px] mr-1">[{q.area}]</span>
                    {q.question}
                  </li>
                ))}
              </ol>
              <button
                onClick={() => setGuideQuestions(null)}
                className="mt-2 text-[9px] text-white/30 hover:text-white/60 transition-colors"
              >
                Hide guide
              </button>
            </div>
          )}
          {guideError && (
            <p className="text-[10px] text-red-400/80 mt-1 text-center">{guideError}</p>
          )}
        </div>
      )}

      {/* Expand button - Opens full report drawer */}
      {scan.has_result && (
        <button
          onClick={() => onExpandClick(scan.id)}
          className="w-full mt-2 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg 
                     bg-gradient-to-r from-blue-500/10 to-violet-500/10 border border-white/5
                     text-[11px] font-semibold text-blue-300 hover:text-blue-200 hover:from-blue-500/20 hover:to-violet-500/20 
                     transition-all shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] hover:shadow-md"
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
        {isStale && (
          <div className="flex items-center gap-1 text-[9px] text-amber-400/80 font-semibold">
            <AlertTriangle className="w-2.5 h-2.5" />
            {Math.floor(daysInStage)}d stale
          </div>
        )}
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

function KanbanColumn({ stage, cards, onMove, movingId, onDragStart, onDrop, isDragOver, setDragOverStage, authHeaders, onExpandClick, rejectedScans, heatmapData }) {
  const colors = STAGE_COLORS[stage];

  // Density-based visual config for bias heatmap
  const densityConfig = {
    none:     { ring: '',                                                                         dot: colors.dot,           label: null },
    medium:   { ring: 'ring-1 ring-amber-400/30',                                                dot: 'bg-amber-400/70',    label: `${heatmapData?.bias_count} bias signal${heatmapData?.bias_count !== 1 ? 's' : ''}` },
    high:     { ring: 'ring-1 ring-amber-400/60 shadow-[0_0_14px_rgba(251,191,36,0.1)]',        dot: 'bg-amber-400 animate-pulse', label: `High: ${heatmapData?.bias_count} signals` },
    critical: { ring: 'ring-1 ring-red-400/60 shadow-[0_0_16px_rgba(239,68,68,0.12)]',         dot: 'bg-red-400 animate-pulse',   label: `⚠ ${heatmapData?.bias_count} bias signals` },
  };
  const density = heatmapData?.density || 'none';
  const { ring, dot, label } = densityConfig[density];

  const heatmapTooltip = {
    none: null,
    medium: 'Bias signals detected in this stage — review candidates',
    high: 'High bias signal density — some candidates may face discriminatory screening',
    critical: 'Warning: Multiple high-severity bias signals in Rejected — possible discriminatory pattern',
  }[density];

  return (
    <div className={`flex flex-col min-w-[220px] max-w-[260px] w-full flex-shrink-0 rounded-xl transition-all duration-500 ${ring}`}
         title={heatmapTooltip || undefined}>
      {/* Column header */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className={`w-2 h-2 rounded-full ${dot}`} />
        <span className="text-xs font-bold uppercase tracking-widest text-white/60">{stage}</span>
        {label && (
          <span className="text-[9px] text-amber-400/70 font-mono truncate">{label}</span>
        )}
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
      {/* Rejection Pattern Insight — only shown on Rejected column */}
      {stage === 'Rejected' && <RejectionPatternInsight rejectedScans={rejectedScans || cards} />}
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
  const [activeBatch, setActiveBatch] = useState(null);
  const [biasHeatmap, setBiasHeatmap] = useState({});
  const scrollContainerRef = useRef(null);
  const autoScrollIntervalRef = useRef(null);

  // Fetch bias heatmap on mount
  useEffect(() => {
    const fetchHeatmap = async () => {
      try {
        const res = await fetch(`${API_URL}/user/scans/bias-heatmap`, {
          headers: authHeaders(),
        });
        if (res.ok) setBiasHeatmap(await res.json());
      } catch (e) {
        console.warn('[BiasHeatmap] Failed to load:', e);
      }
    };
    fetchHeatmap();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Compute unique batches for the legend
  const batches = useMemo(() => {
    const map = {};
    scans.forEach(s => {
      if (s.batch_id) {
        if (!map[s.batch_id]) map[s.batch_id] = { batchId: s.batch_id, color: getBatchColor(s.batch_id), count: 0 };
        map[s.batch_id].count++;
      }
    });
    return Object.values(map);
  }, [scans]);

  // Keep in sync when parent refreshes - intelligent diffing to prevent unnecessary remounts
  useEffect(() => {
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

  // Auto-scroll on drag near edges
  const handleDragMove = useCallback((e) => {
    if (!scrollContainerRef.current || !draggingScan) return;
    
    const container = scrollContainerRef.current;
    const rect = container.getBoundingClientRect();
    const scrollZone = 100; // pixels from edge to trigger scroll
    const scrollSpeed = 15;
    
    const mouseX = e.clientX;
    const distanceFromLeft = mouseX - rect.left;
    const distanceFromRight = rect.right - mouseX;
    
    // Clear existing interval
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
      autoScrollIntervalRef.current = null;
    }
    
    // Scroll left
    if (distanceFromLeft < scrollZone && distanceFromLeft > 0) {
      autoScrollIntervalRef.current = setInterval(() => {
        container.scrollLeft -= scrollSpeed;
      }, 16);
    }
    // Scroll right
    else if (distanceFromRight < scrollZone && distanceFromRight > 0) {
      autoScrollIntervalRef.current = setInterval(() => {
        container.scrollLeft += scrollSpeed;
      }, 16);
    }
  }, [draggingScan]);

  const stopAutoScroll = useCallback(() => {
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
      autoScrollIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (draggingScan) {
      document.addEventListener('dragover', handleDragMove);
      document.addEventListener('dragend', stopAutoScroll);
      return () => {
        document.removeEventListener('dragover', handleDragMove);
        document.removeEventListener('dragend', stopAutoScroll);
        stopAutoScroll();
      };
    }
  }, [draggingScan, handleDragMove, stopAutoScroll]);

  async function handleMove(scan, newStage) {
    if (movingId) return;
    if ((scan.kanban_stage || 'Sourced') === newStage) return;
    setMovingId(scan.id);
    setMoveError(null);

    // Optimistic update
    setScans(prev => prev.map(s => s.id === scan.id ? { ...s, kanban_stage: newStage, stage_updated_at: new Date().toISOString() } : s));

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
      const updated = await res.json();
      // Update with server response
      setScans(prev => prev.map(s => s.id === scan.id ? { ...s, ...updated } : s));
    } catch (e) {
      // Rollback on error
      setScans(prev => prev.map(s => s.id === scan.id ? scan : s));
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

  // Filter by active batch cohort (null = show all)
  const filteredScans = activeBatch ? scans.filter(s => s.batch_id === activeBatch) : scans;

  const grouped = STAGES.reduce((acc, stage) => {
    acc[stage] = filteredScans.filter(s => (s.kanban_stage || 'Sourced') === stage);
    return acc;
  }, {});

  // All rejected scans (unfiltered) for pattern insight
  const allRejected = scans.filter(s => (s.kanban_stage || 'Sourced') === 'Rejected');

  return (
    <div>
      {moveError && (
        <div className="flex items-center gap-2 mb-4 px-4 py-3 rounded-xl bg-red-500/[0.06] border border-red-500/15 text-red-300 text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {moveError}
        </div>
      )}

      <VelocityBar scans={scans} />
      <BatchLegend
        batches={batches}
        activeBatch={activeBatch}
        onToggle={(id) => setActiveBatch(prev => prev === id ? null : id)}
      />

      <div className="flex gap-4 overflow-x-auto pb-4" ref={scrollContainerRef}>
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
            rejectedScans={allRejected}
            heatmapData={biasHeatmap[stage] || null}
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
