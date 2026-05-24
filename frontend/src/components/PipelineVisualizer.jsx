import React, { useState, useEffect, useRef } from 'react';
import { FileText, Lock, Brain, Network, AlertTriangle, BarChart2, FlaskConical, CheckSquare } from 'lucide-react';

/* ─── Stage definitions ─────────────────────────────────────── */
const PIPELINE_STAGES = [
  { id: 'upload',     label: ['Resume', 'Upload'],     Icon: FileText,      accent: '#6ee7b7' }, // emerald
  { id: 'pii',        label: ['PII', 'Strip'],         Icon: Lock,          accent: '#93c5fd' }, // blue
  { id: 'score',      label: ['Blind', 'Score'],       Icon: Brain,         accent: '#6ee7b7' }, // emerald
  { id: 'graph',      label: ['Skill', 'Graph'],       Icon: Network,       accent: '#c4b5fd' }, // violet
  { id: 'bias',       label: ['Bias', 'Detect'],       Icon: AlertTriangle, accent: '#fcd34d' }, // amber
  { id: 'percentile', label: ['Percentile', 'Rank'],   Icon: BarChart2,     accent: '#93c5fd' }, // blue
  { id: 'cf',         label: ['Counter-', 'factual'],  Icon: FlaskConical,  accent: '#6ee7b7' }, // emerald
  { id: 'gate',       label: ['Fairness', 'Gate'],     Icon: CheckSquare,   accent: '#86efac' }, // green
];

/* ─── CSS injected once ────────────────────────────────────── */
const CUBE_STYLE = `
  .pipeline-oblique-wrap {
    position: relative;
    width: 64px;
    height: 64px;
    margin-top: 16px;
    margin-right: 16px;
    cursor: pointer;
  }
  .pipeline-oblique {
    position: absolute;
    inset: 0;
    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.3s ease;
  }
  .pipeline-oblique.is-active {
    transform: translateY(-4px);
    filter: drop-shadow(0 4px 16px var(--cube-accent));
  }
  .pipeline-oblique.has-items {
    animation: cube-pulse 1.4s ease-in-out infinite;
  }
  @keyframes cube-pulse {
    0%, 100% { filter: drop-shadow(0 0 4px var(--cube-accent)); }
    50%       { filter: drop-shadow(0 0 16px var(--cube-accent)); }
  }
  .pipeline-oblique-wrap:hover .pipeline-oblique {
    transform: translateY(-2px);
    filter: drop-shadow(0 2px 10px var(--cube-accent));
  }

  /* Faces */
  .oblique-face {
    position: absolute;
    border: 1px solid rgba(255,255,255,0.06);
    transition: background 0.4s ease, border-color 0.4s ease;
    box-sizing: border-box;
  }

  .oblique-front {
    width: 64px;
    height: 64px;
    left: 0;
    top: 16px;
    background: linear-gradient(135deg, rgba(255,255,255,0.08), rgba(0,0,0,0.6));
    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
  }

  .oblique-top {
    width: 64px;
    height: 16px;
    left: 0;
    top: 0;
    transform-origin: bottom left;
    transform: skewX(-45deg);
    background: rgba(255,255,255,0.12);
    z-index: 1;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
  }

  .oblique-right {
    width: 16px;
    height: 64px;
    left: 64px;
    top: 16px;
    transform-origin: top left;
    transform: skewY(-45deg);
    background: rgba(255,255,255,0.04);
    z-index: 2;
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
  }

  /* Active / Lit states */
  .pipeline-oblique.has-items .oblique-front {
    background: linear-gradient(135deg, rgba(var(--cube-rgb), 0.15), rgba(0,0,0,0.8));
    border-color: rgba(var(--cube-rgb), 0.35);
  }
  .pipeline-oblique.has-items .oblique-top {
    background: rgba(var(--cube-rgb), 0.25);
    border-color: rgba(var(--cube-rgb), 0.3);
  }
  .pipeline-oblique.has-items .oblique-right {
    background: rgba(var(--cube-rgb), 0.10);
    border-color: rgba(var(--cube-rgb), 0.2);
  }

  .pipeline-oblique.is-active .oblique-front {
    background: linear-gradient(135deg, rgba(var(--cube-rgb), 0.25), rgba(0,0,0,0.6));
    border-color: rgba(var(--cube-rgb), 0.55);
  }
  .pipeline-oblique.is-active .oblique-top {
    background: rgba(var(--cube-rgb), 0.35);
    border-color: rgba(var(--cube-rgb), 0.50);
  }
  .pipeline-oblique.is-active .oblique-right {
    background: rgba(var(--cube-rgb), 0.20);
    border-color: rgba(var(--cube-rgb), 0.35);
  }

  /* Badge */
  .cube-badge {
    position: absolute;
    top: -8px;
    right: -8px;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 900;
    color: #000;
    border: 2px solid #000;
    z-index: 20;
    animation: badge-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  @keyframes badge-pop {
    from { transform: scale(0); }
    to   { transform: scale(1); }
  }

  /* Connector arrow */
  .pipeline-arrow {
    display: flex;
    align-items: center;
    padding: 0 4px;
    padding-bottom: 24px;
    opacity: 0.25;
    transition: opacity 0.3s ease;
  }
  .pipeline-arrow.lit { opacity: 0.65; }
  .pipeline-arrow svg {
    width: 14px;
    height: 14px;
    color: white;
    flex-shrink: 0;
  }
`;

/* hex → "r,g,b" for CSS var */
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

/* ─── Single Oblique Cube ───────────────────────────────────────── */
function Cube3D({ stage, count, isActive, onClick }) {
  const { Icon, accent } = stage;
  const hasItems = count > 0;
  const cls = [
    'pipeline-oblique',
    hasItems  ? 'has-items' : '',
    isActive  ? 'is-active'  : '',
  ].join(' ');

  return (
    <div className="flex flex-col items-center shrink-0 gap-3" style={{ width: 84 }}>
      <div 
        className={`pipeline-oblique-wrap ${!hasItems ? 'cursor-default opacity-60 hover:opacity-100 transition-opacity' : ''}`}
        onClick={() => hasItems && onClick?.()}
      >
        <div className={cls} style={{ '--cube-accent': accent, '--cube-rgb': hexToRgb(accent) }}>
          <div className="oblique-face oblique-top" />
          <div className="oblique-face oblique-right" />
          <div className="oblique-face oblique-front">
            <Icon
              style={{
                width: 24,
                height: 24,
                color: (hasItems || isActive) ? accent : 'rgba(255,255,255,0.6)',
                transition: 'color 0.35s ease',
                strokeWidth: 1.5,
              }}
            />
            {hasItems && (
              <div className="cube-badge" style={{ background: accent }}>
                {count}
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          lineHeight: 1.3,
          textAlign: 'center',
          color: (hasItems || isActive) ? '#ffffff' : 'rgba(255,255,255,0.4)',
          transition: 'color 0.35s ease',
          userSelect: 'none',
        }}
      >
        {stage.label[0]}
        <br />
        {stage.label[1]}
      </div>
    </div>
  );
}

/* ─── Chevron arrow connector ───────────────────────────────── */
function Arrow({ lit }) {
  return (
    <div className={`pipeline-arrow ${lit ? 'lit' : ''}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </div>
  );
}

/* ─── Progress bar dots ─────────────────────────────────────── */
function ProgressTrack({ counts }) {
  const total = counts.reduce((a, b) => a + b, 0);
  const completed = counts[7];
  const pct = total ? (completed / total) * 100 : 0;
  return (
    <div style={{ height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 99, overflow: 'hidden', marginTop: 8 }}>
      <div
        style={{
          height: '100%',
          width: `${pct}%`,
          background: 'linear-gradient(90deg, #6ee7b7, #93c5fd, #c4b5fd)',
          borderRadius: 99,
          transition: 'width 0.8s ease',
          boxShadow: '0 0 8px rgba(110,231,183,0.4)',
        }}
      />
    </div>
  );
}

/* ─── Main export ───────────────────────────────────────────── */
export default function PipelineVisualizer({ jobs = [], onStageClick, activeFilter }) {
  const [counts, setCounts] = useState(Array(8).fill(0));
  const styleInjected = useRef(false);

  /* Inject CSS once */
  useEffect(() => {
    if (styleInjected.current) return;
    styleInjected.current = true;
    const tag = document.createElement('style');
    tag.id = 'pipeline-cube-styles';
    if (!document.getElementById('pipeline-cube-styles')) {
      tag.textContent = CUBE_STYLE;
      document.head.appendChild(tag);
    }
  }, []);

  /* Recompute counts every 500 ms based on job states */
  useEffect(() => {
    if (!jobs.length) { setCounts(Array(8).fill(0)); return; }
    const interval = setInterval(() => {
      const newCounts = Array(8).fill(0);
      const now = Date.now();
      jobs.forEach(j => {
        if (j.status === 'queued') {
          newCounts[0]++;
        } else if (j.status === 'completed' || j.status === 'error') {
          newCounts[7]++;
        } else if (j.status === 'processing' && j._processingStartedAt) {
          const elapsed = now - j._processingStartedAt;
          let stage = Math.floor(elapsed / 3500) + 1;
          stage = Math.min(stage, 6);
          newCounts[stage]++;
        } else if (j.status === 'processing') {
          newCounts[1]++;
        }
      });
      setCounts(newCounts);
    }, 500);
    return () => clearInterval(interval);
  }, [jobs]);

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0) 100%)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 20,
        padding: '24px 28px 20px',
        marginBottom: 28,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle radial glow behind cubes */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at 50% 80%, rgba(110,231,183,0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
        <Network style={{ width: 16, height: 16, color: 'rgba(255,255,255,0.45)' }} />
        <span style={{
          fontSize: 11,
          fontWeight: 900,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.75)',
        }}>
          8-Stage Pipeline
        </span>
        {jobs.length > 0 && (
          <span style={{
            marginLeft: 'auto',
            fontSize: 10,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.35)',
            letterSpacing: '0.08em',
          }}>
            {counts[7]}/{jobs.length} complete
          </span>
        )}
      </div>

      {/* Cube row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 0,
          overflowX: 'auto',
          paddingBottom: 12,
          scrollbarWidth: 'none',
        }}
      >
        {PIPELINE_STAGES.map((stage, idx) => {
          const isLast = idx === PIPELINE_STAGES.length - 1;
          const isActive = activeFilter === idx;
          return (
            <React.Fragment key={stage.id}>
              <Cube3D
                stage={stage}
                count={counts[idx]}
                isActive={isActive}
                onClick={() => onStageClick?.(idx)}
              />
              {!isLast && (
                <Arrow lit={counts[idx] > 0 || counts[idx + 1] > 0} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Progress track */}
      <ProgressTrack counts={counts} />

      {/* Active filter hint */}
      {activeFilter !== null && activeFilter !== undefined && (
        <div style={{
          marginTop: 10,
          fontSize: 10,
          color: 'rgba(255,255,255,0.35)',
          textAlign: 'center',
          letterSpacing: '0.08em',
        }}>
          Filtering by: <span style={{ color: PIPELINE_STAGES[activeFilter]?.accent }}>
            {PIPELINE_STAGES[activeFilter]?.label.join(' ')}
          </span>
          {' '}— click again to clear
        </div>
      )}
    </div>
  );
}
