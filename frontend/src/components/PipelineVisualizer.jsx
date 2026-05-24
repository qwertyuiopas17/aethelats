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
  .pipeline-cube-wrap {
    perspective: 600px;
    perspective-origin: 50% 40%;
  }
  .pipeline-cube {
    width: 56px;
    height: 56px;
    position: relative;
    transform-style: preserve-3d;
    transform: rotateX(20deg) rotateY(-30deg);
    transition: transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1),
                filter 0.35s ease;
  }
  .pipeline-cube.is-active {
    transform: rotateX(20deg) rotateY(-30deg) scale(1.15);
    filter: drop-shadow(0 0 14px var(--cube-accent));
    animation: cube-bob 2.2s ease-in-out infinite;
  }
  .pipeline-cube.has-items {
    animation: cube-pulse 1.4s ease-in-out infinite;
  }
  @keyframes cube-bob {
    0%, 100% { transform: rotateX(20deg) rotateY(-30deg) scale(1.15) translateY(0px); }
    50%       { transform: rotateX(20deg) rotateY(-30deg) scale(1.15) translateY(-4px); }
  }
  @keyframes cube-pulse {
    0%, 100% { filter: drop-shadow(0 0 6px var(--cube-accent)); }
    50%       { filter: drop-shadow(0 0 18px var(--cube-accent)); }
  }
  .pipeline-cube:hover {
    transform: rotateX(20deg) rotateY(-30deg) scale(1.12);
    filter: drop-shadow(0 0 12px var(--cube-accent));
  }

  /* Six faces */
  .cube-face {
    position: absolute;
    width: 56px;
    height: 56px;
    border: 1px solid rgba(255,255,255,0.10);
    backface-visibility: hidden;
    transition: background 0.4s ease, border-color 0.4s ease;
  }
  /* FRONT */
  .cube-face-front  { transform: translateZ(28px); }
  /* BACK  */
  .cube-face-back   { transform: rotateY(180deg) translateZ(28px); }
  /* LEFT  */
  .cube-face-left   { transform: rotateY(-90deg) translateZ(28px); }
  /* RIGHT */
  .cube-face-right  { transform: rotateY(90deg)  translateZ(28px); }
  /* TOP   */
  .cube-face-top    { transform: rotateX(90deg)  translateZ(28px); }
  /* BOTTOM*/
  .cube-face-bottom { transform: rotateX(-90deg) translateZ(28px); }

  /* idle colours */
  .cube-face-front  { background: rgba(255,255,255,0.04); }
  .cube-face-back   { background: rgba(255,255,255,0.02); }
  .cube-face-left   { background: rgba(0,0,0,0.30); }
  .cube-face-right  { background: rgba(255,255,255,0.06); }
  .cube-face-top    { background: rgba(255,255,255,0.08); }
  .cube-face-bottom { background: rgba(0,0,0,0.25); }

  /* active / lit */
  .pipeline-cube.has-items .cube-face-front  { background: rgba(var(--cube-rgb), 0.18); border-color: rgba(var(--cube-rgb), 0.35); }
  .pipeline-cube.has-items .cube-face-top    { background: rgba(var(--cube-rgb), 0.22); border-color: rgba(var(--cube-rgb), 0.30); }
  .pipeline-cube.has-items .cube-face-right  { background: rgba(var(--cube-rgb), 0.12); border-color: rgba(var(--cube-rgb), 0.20); }
  .pipeline-cube.has-items .cube-face-left   { background: rgba(0,0,0,0.50); }
  .pipeline-cube.is-active  .cube-face-front { background: rgba(var(--cube-rgb), 0.28); border-color: rgba(var(--cube-rgb), 0.55); }
  .pipeline-cube.is-active  .cube-face-top   { background: rgba(var(--cube-rgb), 0.35); border-color: rgba(var(--cube-rgb), 0.50); }
  .pipeline-cube.is-active  .cube-face-right { background: rgba(var(--cube-rgb), 0.20); border-color: rgba(var(--cube-rgb), 0.35); }

  /* Icon centred on front face */
  .cube-icon {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    transform: translateZ(29px);
    pointer-events: none;
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
    transform: translateZ(30px);
  }
  @keyframes badge-pop {
    from { transform: translateZ(30px) scale(0); }
    to   { transform: translateZ(30px) scale(1); }
  }

  /* Connector arrow */
  .pipeline-arrow {
    display: flex;
    align-items: center;
    padding: 0 2px;
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

  /* Flow line under active stages */
  .cube-flow-dot {
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 4px;
    height: 4px;
    border-radius: 50%;
    animation: flow-dot 1.2s ease-in-out infinite;
  }
  @keyframes flow-dot {
    0%, 100% { opacity: 0.3; transform: translateX(-50%) scale(0.8); }
    50%       { opacity: 1;   transform: translateX(-50%) scale(1.4); }
  }
`;

/* hex → "r,g,b" for CSS var */
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

/* ─── Single 3-D cube ───────────────────────────────────────── */
function Cube3D({ stage, count, isActive, onClick }) {
  const { Icon, accent } = stage;
  const hasItems = count > 0;
  const cls = [
    'pipeline-cube',
    hasItems  ? 'has-items' : '',
    isActive  ? 'is-active'  : '',
  ].join(' ');

  return (
    <div
      className="flex flex-col items-center shrink-0 gap-3"
      style={{ width: 80 }}
    >
      {/* Cube wrapper — perspective container */}
      <div
        className="pipeline-cube-wrap relative cursor-pointer"
        style={{ width: 56, height: 56 }}
        onClick={() => hasItems && onClick?.()}
      >
        <div
          className={cls}
          style={{
            '--cube-accent': accent,
            '--cube-rgb': hexToRgb(accent),
          }}
        >
          {/* Six faces */}
          <div className="cube-face cube-face-front"  />
          <div className="cube-face cube-face-back"   />
          <div className="cube-face cube-face-left"   />
          <div className="cube-face cube-face-right"  />
          <div className="cube-face cube-face-top"    />
          <div className="cube-face cube-face-bottom" />

          {/* Icon on front face */}
          <div className="cube-icon">
            <Icon
              style={{
                width: 20,
                height: 20,
                color: (hasItems || isActive) ? accent : 'rgba(255,255,255,0.45)',
                transition: 'color 0.35s ease',
                strokeWidth: 2,
              }}
            />
          </div>

          {/* Count badge */}
          {hasItems && (
            <div
              className="cube-badge"
              style={{ background: accent }}
            >
              {count}
            </div>
          )}

          {/* Flow dot below active cube */}
          {hasItems && (
            <div
              className="cube-flow-dot"
              style={{ background: accent }}
            />
          )}
        </div>
      </div>

      {/* Label */}
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          lineHeight: 1.3,
          textAlign: 'center',
          color: (hasItems || isActive) ? '#ffffff' : 'rgba(255,255,255,0.38)',
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
