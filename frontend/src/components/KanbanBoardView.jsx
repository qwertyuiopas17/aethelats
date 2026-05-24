import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, FileText, Clock, AlertTriangle } from 'lucide-react';
import { API_URL } from './constants';
import { useAuth } from '../context/AuthContext';

const STAGES = ['Sourced', 'Screening', 'Interview', 'Offer', 'Rejected'];

const STAGE_COLORS = {
  Sourced:   { border: 'border-white/10',         dot: 'bg-white/30',        badge: 'bg-white/5 text-white/50' },
  Screening: { border: 'border-blue-500/30',      dot: 'bg-blue-400',        badge: 'bg-blue-500/10 text-blue-300' },
  Interview: { border: 'border-violet-500/30',    dot: 'bg-violet-400',      badge: 'bg-violet-500/10 text-violet-300' },
  Offer:     { border: 'border-emerald-500/30',   dot: 'bg-emerald-400',     badge: 'bg-emerald-500/10 text-emerald-300' },
  Rejected:  { border: 'border-red-500/20',       dot: 'bg-red-400/60',      badge: 'bg-red-500/10 text-red-400/80' },
};

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

function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  const diffD = Math.floor((Date.now() - d) / 86400000);
  if (diffD < 1)  return 'today';
  if (diffD < 7)  return `${diffD}d ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function CandidateCard({ scan, onMove, movingId }) {
  const stage = scan.kanban_stage || 'Sourced';
  const stageIdx = STAGES.indexOf(stage);
  const canMoveLeft  = stageIdx > 0;
  const canMoveRight = stageIdx < STAGES.length - 1;
  const isMoving = movingId === scan.id;

  return (
    <div className={`
      group relative rounded-xl border p-3.5 transition-all duration-300 cursor-default
      bg-white/[0.02] hover:bg-white/[0.04]
      ${STAGE_COLORS[stage]?.border || 'border-white/10'}
      ${isMoving ? 'opacity-50 scale-[0.98]' : ''}
    `}>
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

      {/* Footer: date + move arrows */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-[10px] text-white/20">
          <Clock className="w-3 h-3" />
          {fmtDate(scan.timestamp)}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            disabled={!canMoveLeft || isMoving}
            onClick={() => onMove(scan, STAGES[stageIdx - 1])}
            className="w-6 h-6 rounded-md bg-white/[0.06] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.12] transition-all disabled:opacity-20 disabled:cursor-not-allowed"
            title={canMoveLeft ? `Move to ${STAGES[stageIdx - 1]}` : ''}
          >
            <ChevronLeft className="w-3.5 h-3.5 text-white/70" />
          </button>
          <button
            disabled={!canMoveRight || isMoving}
            onClick={() => onMove(scan, STAGES[stageIdx + 1])}
            className="w-6 h-6 rounded-md bg-white/[0.06] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.12] transition-all disabled:opacity-20 disabled:cursor-not-allowed"
            title={canMoveRight ? `Move to ${STAGES[stageIdx + 1]}` : ''}
          >
            <ChevronRight className="w-3.5 h-3.5 text-white/70" />
          </button>
        </div>
      </div>
    </div>
  );
}

function KanbanColumn({ stage, cards, onMove, movingId }) {
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
      {/* Cards */}
      <div className="flex flex-col gap-2.5 min-h-[80px]">
        {cards.length === 0 && (
          <div className="rounded-xl border border-dashed border-white/[0.06] py-8 text-center text-white/20 text-xs">
            Empty
          </div>
        )}
        {cards.map(scan => (
          <CandidateCard key={scan.id} scan={scan} onMove={onMove} movingId={movingId} />
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

  // Keep in sync when parent refreshes
  React.useEffect(() => { setScans(initialScans); }, [initialScans]);

  async function handleMove(scan, newStage) {
    if (movingId) return; // prevent double-click
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
          />
        ))}
      </div>
    </div>
  );
}
