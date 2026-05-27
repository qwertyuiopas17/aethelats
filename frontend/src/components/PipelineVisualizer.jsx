import React, { useState, useEffect } from 'react';
import { FileText, Lock, Brain, Network, AlertTriangle, BarChart2, Beaker, CheckSquare, ChevronRight } from 'lucide-react';

const PIPELINE_STAGES = [
  { id: 'upload',     label: 'Resume\nUpload',   icon: FileText,      color: 'text-white' },
  { id: 'pii',        label: 'PII\nStrip',       icon: Lock,          color: 'text-white' },
  { id: 'score',      label: 'Blind\nScore',     icon: Brain,         color: 'text-emerald-400' },
  { id: 'graph',      label: 'Skill\nGraph',     icon: Network,       color: 'text-white' },
  { id: 'bias',       label: 'Bias\nDetect',     icon: AlertTriangle, color: 'text-yellow-400' },
  { id: 'percentile', label: 'Percentile\nRank', icon: BarChart2,     color: 'text-white' },
  { id: 'cf',         label: 'Counter-\nfactual',icon: Beaker,        color: 'text-emerald-400' },
  { id: 'gate',       label: 'Fairness\nGate',   icon: CheckSquare,   color: 'text-white' },
];

export default function PipelineVisualizer({ jobs = [], onStageClick, activeFilter, activeStageIndex = -1, title = "8-STAGE PIPELINE" }) {
  const [counts, setCounts] = useState(Array(8).fill(0));
  const [activeDetail, setActiveDetail] = useState({ stage: -1, text: '' });

  useEffect(() => {
    if (!jobs.length) {
      setCounts(Array(8).fill(0));
      setActiveDetail({ stage: -1, text: '' });
      return;
    }
    const interval = setInterval(() => {
      const newCounts = Array(8).fill(0);
      let detailStage = -1;
      let detailText = '';

      jobs.forEach(j => {
        if (j.status === 'queued') {
          newCounts[0]++;
        } else if (j.status === 'completed' || j.status === 'error') {
          newCounts[7]++;
        } else if (j.status === 'processing') {
          // Use actual stage from WebSocket if available, otherwise estimate
          if (j.stage !== undefined) {
            newCounts[j.stage]++;
            // Capture detail from the most-recently-updated processing job
            if (j.stage_detail) {
              detailStage = j.stage;
              detailText = j.stage_detail;
            }
          } else if (j._processingStartedAt) {
            const elapsed = Date.now() - j._processingStartedAt;
            let stage = Math.floor(elapsed / 3500) + 1;
            stage = Math.min(stage, 6);
            newCounts[stage]++;
          } else {
            newCounts[1]++;
          }
        }
      });
      setCounts(newCounts);
      setActiveDetail(prev =>
        prev.stage !== detailStage || prev.text !== detailText
          ? { stage: detailStage, text: detailText }
          : prev
      );
    }, 500);

    return () => clearInterval(interval);
  }, [jobs]);

  return (
    <div className="rounded-xl p-6 md:p-8 mb-8 border border-[#222] relative bg-[#060606] shadow-[inset_0_4px_30px_rgba(0,0,0,1)]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8 px-2 border-b border-[#222] pb-4">
        <Network className="w-4 h-4 text-white/40" />
        <h3 className="text-[10px] font-mono font-bold text-white tracking-[0.2em] uppercase">{title}</h3>
      </div>

      {/* Pipeline Track */}
      <div className="relative pb-6">
        <div className="flex flex-nowrap items-center justify-between gap-6 overflow-x-auto pb-6 hide-scrollbar relative z-10 scene px-2">
          {PIPELINE_STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            const isLast = idx === PIPELINE_STAGES.length - 1;
            const hasItems = counts[idx] > 0;
            const isActive = activeFilter === idx || activeStageIndex === idx;
            const isGlowing = hasItems || isActive;

            return (
              <React.Fragment key={stage.id}>
                {/* Stage Block */}
                <div 
                  className={`flex flex-col items-center shrink-0 group ${hasItems ? 'cursor-pointer' : 'cursor-default'}`}
                  onClick={() => hasItems && onStageClick?.(idx)}
                >
                  {/* 3D CSS Cube */}
                  <div className={`cube mb-8 transition-transform duration-500 ${isGlowing ? 'scale-110' : ''}`} style={isGlowing ? { transform: 'rotateX(-20deg) rotateY(55deg) translateY(-5px)' } : {}}>
                    {/* Glowing Core */}
                    <div className="cube-core" style={isGlowing ? { opacity: 0.8, filter: 'blur(12px)' } : {}} />
                    
                    {/* Faces */}
                    <div className="cube-face cube-face-front" style={isGlowing ? { borderColor: 'rgba(255,255,255,0.5)' } : {}}>
                      <Icon className={`w-5 h-5 relative z-10 transition-colors duration-300 ${stage.color}`} strokeWidth={2} />
                      
                      {/* Live Count Badge (only if used in Batch Queue) */}
                      {hasItems && (
                        <div className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-white text-black text-[11px] font-black flex items-center justify-center border-2 border-black animate-fade-in-up shadow-[0_0_10px_rgba(255,255,255,0.5)]" style={{ transform: 'translateZ(10px)' }}>
                          {counts[idx]}
                        </div>
                      )}
                    </div>
                    <div className="cube-face cube-face-back"></div>
                    <div className="cube-face cube-face-right" style={isGlowing ? { borderColor: 'rgba(255,255,255,0.3)' } : {}}></div>
                    <div className="cube-face cube-face-left"></div>
                    <div className="cube-face cube-face-top" style={isGlowing ? { borderColor: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.05)' } : {}}></div>
                    <div className="cube-face cube-face-bottom"></div>
                  </div>

                  {/* Label */}
                  <div className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider leading-tight whitespace-pre-line text-center transition-colors duration-300 ${isGlowing ? 'text-white' : 'text-white/90 group-hover:text-white'}`}>
                    {stage.label}
                  </div>
                </div>

                {/* Connecting Arrow */}
                {!isLast && (
                  <div className="flex-1 min-w-[15px] flex justify-center shrink-0 mb-12">
                    <ChevronRight className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${counts[idx] > 0 || activeStageIndex === idx ? 'text-white/60' : 'text-white/10'}`} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
        
        {/* Terminal Logger */}
        <div className="absolute bottom-[-15px] left-0 right-0 text-center flex justify-center items-center">
          {activeDetail.text && (
            <div className="flex items-center gap-2 text-white font-mono text-[10px] sm:text-[11px] font-bold tracking-widest bg-black px-4 py-1.5 border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.15)] rounded">
              <span className="opacity-50">&gt;</span>
              <span>{activeDetail.text}</span>
              <span className="w-1.5 h-3 bg-white animate-pulse ml-1" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
