import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Layers } from 'lucide-react';

// Helper to handle Vite chunk load errors (e.g. "Failed to fetch dynamically imported module")
// It forces a page reload once if the chunk fails to load, which fixes stale cache issues.
const lazyWithRetry = (componentImport) =>
  React.lazy(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.sessionStorage.getItem('page-has-been-force-refreshed') || 'false'
    );
    try {
      const component = await componentImport();
      window.sessionStorage.setItem('page-has-been-force-refreshed', 'false');
      return component;
    } catch (error) {
      if (!pageHasAlreadyBeenForceRefreshed) {
        window.sessionStorage.setItem('page-has-been-force-refreshed', 'true');
        window.location.reload();
        // Return a promise that never resolves while the page reloads
        return new Promise(() => {});
      }
      throw error;
    }
  });

const ForceGraph2D = lazyWithRetry(() => import('react-force-graph-2d'));
const ForceGraph3D = lazyWithRetry(() => import('react-force-graph-3d'));

export default function SkillKnowledgeGraph({ skillData, fallbackSkills }) {
  const [mode, setMode] = useState('2D');
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const containerRef = useRef();
  const [width, setWidth] = useState(600); // safe default so graph renders immediately
  const HEIGHT = 480;

  // ResizeObserver — fires reliably inside CSS grids / flex containers
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    // Set initial width immediately
    if (el.offsetWidth > 0) setWidth(el.offsetWidth);

    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        if (w > 0) setWidth(w);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Build graph data from skill props
  useEffect(() => {
    // Normalize: skill name can live in canonical_name, found_in_resume, or skill
    const getName = (s) =>
      (s.canonical_name || s.found_in_resume || s.skill || '').trim();

    let skills = [];

    if (skillData && skillData.length > 0) {
      const uniqueNames = [...new Set(skillData.map(getName).filter(Boolean))];
      skills = uniqueNames.map(name => {
        const entry = skillData.find(s => getName(s) === name);
        const mt = entry?.match_type || '';
        return {
          name,
          isCore: mt === 'semantic' || mt === 'exact' || mt === 'synonym',
          score: entry?.similarity ?? entry?.score ?? entry?.relevance ?? null,
        };
      });
    } else if (fallbackSkills && fallbackSkills.length > 0) {
      // Use actual technical skills extracted from the resume (Bot 3 / Groq)
      const uniqueNames = [...new Set(fallbackSkills.slice(0, 16).filter(s => typeof s === 'string' && s.trim()))];
      skills = uniqueNames.map((name, i) => ({
        name,
        isCore: i < Math.ceil(uniqueNames.length / 2),
        score: null,
      }));
    }

    if (skills.length === 0) {
      setGraphData({ nodes: [], links: [] });
      return;
    }

    const nodes = skills.map(({ name, isCore, score }) => ({
      id: name,
      name,
      val: isCore ? 6 : 3,
      core: isCore,
      score,
    }));

    const links = [];
    if (nodes.length > 1) {
      // Ring links
      nodes.forEach((n, i) => {
        links.push({ source: n.id, target: nodes[(i + 1) % nodes.length].id });
      });
      // Cross-links for larger graphs
      if (nodes.length > 4) {
        const half = Math.floor(nodes.length / 2);
        nodes.forEach((n, i) => {
          if (i < half) {
            links.push({ source: n.id, target: nodes[i + half].id });
          }
        });
      }
    }

    setGraphData({ nodes, links });
  }, [skillData, fallbackSkills]);

  const draw2DNode = useCallback((node, ctx, globalScale) => {
    const fontSize = Math.max(10, 13 / globalScale);
    const r = node.val * 3;
    const label = node.name;

    // Circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
    ctx.fillStyle = node.core ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)';
    ctx.fill();
    ctx.lineWidth = (node.core ? 1.5 : 0.8) / globalScale;
    ctx.strokeStyle = node.core ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)';
    ctx.stroke();

    // Label
    ctx.font = `${node.core ? 'bold ' : ''}${fontSize}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = node.core ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.55)';
    ctx.fillText(label, node.x, node.y + r + 3 / globalScale);

    // Score badge if available
    if (node.score != null && globalScale > 0.8) {
      const sc = node.score > 1 ? Math.round(node.score) : Math.round(node.score * 100);
      const badge = `${sc}%`;
      ctx.font = `bold ${fontSize * 0.75}px Inter, sans-serif`;
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fillText(badge, node.x, node.y + r + fontSize + 4 / globalScale);
    }
  }, []);

  const isEmpty = graphData.nodes.length === 0;

  return (
    <div className="glass-card glass-card-hover rounded-2xl p-5 relative overflow-hidden animate-fade-in-up" ref={containerRef}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-base font-bold text-white animate-slide-in-right stagger-1">Skill Knowledge Graph</h3>
          <p className="text-xs text-white/80 mt-0.5 animate-slide-in-right stagger-2">
            <span className="hidden lg:inline">Interactive physics-based topology</span>
            <span className="lg:hidden">Detected skills from resume</span>
            {graphData.nodes.length > 0 && <span className="ml-2 text-white/40">· {graphData.nodes.length} skills</span>}
          </p>
        </div>
        {/* 2D/3D toggle — desktop only */}
        <div className="hidden lg:flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/[0.06] animate-scale-in stagger-3">
          <button
            onClick={() => setMode('2D')}
            className={'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ' + (mode === '2D' ? 'bg-white text-black shadow-lg' : 'text-white/90 hover:text-white')}
          >
            <Layers className="w-3.5 h-3.5" /> 2D
          </button>
          <button
            onClick={() => setMode('3D')}
            className={'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ' + (mode === '3D' ? 'bg-white text-black shadow-lg' : 'text-white/90 hover:text-white')}
          >
            <Box className="w-3.5 h-3.5" /> 3D
          </button>
        </div>
      </div>

      {/* ── MOBILE: Compact Chip Layout ── */}
      <div className="lg:hidden">
        {isEmpty ? (
          <div className="flex items-center justify-center py-8 text-white/20 text-xs uppercase tracking-widest">
            No skill data
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 py-2">
            {graphData.nodes.map(node => (
              <span
                key={node.id}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  node.core
                    ? 'bg-white/[0.06] text-white border-white/20 shadow-[0_0_8px_rgba(255,255,255,0.05)]'
                    : 'bg-white/[0.02] text-white/50 border-white/[0.06]'
                }`}
              >
                {node.core && <span className="inline-block w-1.5 h-1.5 rounded-full bg-white/40 mr-1.5 align-middle" />}
                {node.name}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/[0.06] text-[10px] text-white/50">
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-white/40" /> Core</span>
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-white/15" /> Related</span>
        </div>
      </div>

      {/* ── DESKTOP: Full Interactive Graph ── */}
      <div className="hidden lg:block">
        <div className="relative rounded-xl overflow-hidden bg-[#0a0a0a] border border-white/[0.04] animate-fade-in stagger-4" style={{ height: `${HEIGHT}px` }}>
          {isEmpty ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/20">
              <svg className="w-10 h-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="10" strokeWidth="1" />
                <path strokeLinecap="round" d="M8 12h8M12 8v8" strokeWidth="1" />
              </svg>
              <span className="text-xs uppercase tracking-widest">No skill data</span>
            </div>
          ) : (
            <React.Suspense fallback={
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              </div>
            }>
              {mode === '2D' ? (
                <ForceGraph2D
                  width={width}
                  height={HEIGHT}
                  graphData={graphData}
                  nodeCanvasObject={draw2DNode}
                  nodePointerAreaPaint={(node, color, ctx) => {
                    ctx.fillStyle = color;
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, node.val * 3 + 10, 0, 2 * Math.PI, false);
                    ctx.fill();
                  }}
                  linkColor={() => 'rgba(255,255,255,0.07)'}
                  linkWidth={1.2}
                  cooldownTicks={120}
                  d3AlphaDecay={0.03}
                  d3VelocityDecay={0.2}
                  onEngineStop={() => {}}
                />
              ) : (
                <ForceGraph3D
                  width={width}
                  height={HEIGHT}
                  graphData={graphData}
                  nodeLabel="name"
                  nodeRelSize={4}
                  nodeVal={node => node.val}
                  nodeColor={node => node.core ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)'}
                  nodeResolution={16}
                  linkColor={() => 'rgba(255,255,255,0.1)'}
                  linkWidth={0.5}
                  backgroundColor="#0a0a0a"
                  showNavInfo={false}
                />
              )}
            </React.Suspense>
          )}

          {!isEmpty && (
            <div className="absolute bottom-4 right-4 pointer-events-none text-[10px] text-white/30 uppercase tracking-widest">
              {mode === '2D' ? 'Drag nodes to interact' : 'Drag to rotate · Scroll to zoom'}
            </div>
          )}
        </div>

        <div className="flex items-center gap-6 mt-4 pt-3 border-t border-white/[0.06] text-xs text-white/80 animate-fade-in-up stagger-6">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-white/20 border border-white/30" /> Core Skill</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-white/10 border border-white/15" /> Related Tech</span>
          <span className="flex items-center gap-1.5"><span className="w-6 h-px bg-white/15" /> Relevance</span>
          <span className="ml-auto text-white">Aethel AI Engine</span>
        </div>
      </div>
    </div>
  );
}
