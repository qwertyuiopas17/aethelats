import React, { useState, useEffect } from 'react';
import { FileText, Lock, Brain, Network, AlertTriangle, BarChart2, FlaskConical, CheckSquare, ChevronRight } from 'lucide-react';

const PIPELINE_STAGES = [
  { id: 'upload',     label: 'Resume\nUpload',   icon: FileText,      color: 'text-white/80' },
  { id: 'pii',        label: 'PII\nStrip',       icon: Lock,          color: 'text-white/80' },
  { id: 'score',      label: 'Blind\nScore',     icon: Brain,         color: 'text-emerald-400' },
  { id: 'graph',      label: 'Skill\nGraph',     icon: Network,       color: 'text-white/80' },
  { id: 'bias',       label: 'Bias\nDetect',     icon: AlertTriangle, color: 'text-yellow-400' },
  { id: 'percentile', label: 'Percentile\nRank', icon: BarChart2,     color: 'text-white/80' },
  { id: 'cf',         label: 'Counter-\nfactual',icon: FlaskConical,  color: 'text-emerald-400' },
  { id: 'gate',       label: 'Fairness\nGate',   icon: CheckSquare,   color: 'text-white/80' },
];

export default function PipelineVisualizer({ jobs = [] }) {
  const [counts, setCounts] = useState(Array(8).fill(0));

  useEffect(() => {
    if (!jobs.length) {
      setCounts(Array(8).fill(0));
      return;
    }
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
          // each stage = 3500ms, max stage = 6 (since 7 is completed/gate)
          let stage = Math.floor(elapsed / 3500) + 1; // starts moving past upload (0)
          stage = Math.min(stage, 6);
          newCounts[stage]++;
        } else if (j.status === 'processing') {
          newCounts[1]++; // fallback if no timestamp
        }
      });
      setCounts(newCounts);
    }, 500);

    return () => clearInterval(interval);
  }, [jobs]);

  return (
    <div className="glass-card rounded-2xl p-6 md:p-8 mb-8 border border-white/[0.08] relative overflow-hidden bg-gradient-to-b from-white/[0.03] to-transparent">
      {/* Header */}
      <div className="flex items-center gap-2 mb-8">
        <Network className="w-5 h-5 text-white/60" />
        <h3 className="text-sm font-black text-white tracking-[0.2em] uppercase">8-STAGE PIPELINE</h3>
      </div>

      {/* Pipeline Track */}
      <div className="flex flex-nowrap items-center justify-between gap-2 overflow-x-auto pb-4 hide-scrollbar">
        {PIPELINE_STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isLast = idx === PIPELINE_STAGES.length - 1;

          return (
            <React.Fragment key={stage.id}>
              {/* Stage Block */}
              <div className="flex flex-col items-center shrink-0 w-20 sm:w-24 group">
                {/* 3D Cube approximation */}
                <div className={`relative w-14 h-14 sm:w-16 sm:h-16 mb-4 flex items-center justify-center
                                bg-gradient-to-br border rounded-xl transition-all duration-500 
                                ${counts[idx] > 0 ? 'from-blue-500/20 to-blue-500/5 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.3)] scale-110' : 'from-white/[0.08] to-transparent border-white/[0.1] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] hover:scale-110 hover:border-white/[0.2] hover:bg-white/[0.1]'}`}>
                  {/* Subtle top glare */}
                  <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/[0.05] to-transparent rounded-t-xl" />
                  <Icon className={`w-5 h-5 sm:w-6 sm:h-6 relative z-10 transition-colors duration-300 ${counts[idx] > 0 ? 'text-white' : stage.color} group-hover:text-white`} strokeWidth={2} />
                  
                  {/* Live Count Badge */}
                  {counts[idx] > 0 && (
                    <div className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-500 text-white text-[10px] sm:text-xs font-black flex items-center justify-center border-2 border-black animate-fade-in-up">
                      {counts[idx]}
                    </div>
                  )}
                </div>
                {/* Label */}
                <div className="text-[10px] sm:text-xs font-bold text-white/70 text-center uppercase tracking-wider leading-tight whitespace-pre-line group-hover:text-white transition-colors">
                  {stage.label}
                </div>
              </div>

              {/* Connecting Arrow */}
              {!isLast && (
                <div className="flex-1 min-w-[20px] flex justify-center shrink-0">
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-white/20" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
