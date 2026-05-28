import React, { useEffect, useState } from 'react';
import { BarChart2, AlertTriangle, Cpu, ShieldCheck } from 'lucide-react';

export default function LiveBiasAuditCard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const models = [
    { name: 'Aethel (FairAI)', score: 82, iit: '+1', gap: '+2', icon: <ShieldCheck className="w-4 h-4 text-white" /> },
    { name: 'Llama 3 70B', score: 71, iit: '+9', gap: '+6', icon: <Cpu className="w-4 h-4 text-white/50" /> },
    { name: 'Gemma 7B', score: 69, iit: '+12', gap: '+8', icon: <Cpu className="w-4 h-4 text-white/50" /> },
    { name: 'Mixtral 8x7B', score: 72, iit: '+7', gap: '+5', icon: <Cpu className="w-4 h-4 text-white/50" /> },
  ];

  return (
    <div className="w-full flex flex-col gap-4 font-sans text-left">
      
      {/* Main Table Card */}
      <div className="w-full bg-[#050505] rounded-2xl border border-white/[0.05] overflow-hidden flex flex-col shadow-2xl relative">
        
        {/* Dynamic Glare Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

        {/* Header */}
        <div className="p-4 border-b border-white/[0.05] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart2 className="w-4 h-4 text-white/70" />
            <h3 className="text-white text-[11px] font-bold tracking-[0.15em] uppercase">Live Bias Audit</h3>
          </div>
          <div className="px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.1] text-white/60 text-[9px] font-bold tracking-widest uppercase">
            Demo
          </div>
        </div>

        {/* Table Content */}
        <div className="p-4">
          {/* Headers */}
          <div className="grid grid-cols-5 gap-3 mb-3 text-[10px] font-bold tracking-widest text-white/40 uppercase">
            <div className="col-span-2">Model</div>
            <div className="text-center">Score</div>
            <div className="text-center">IIT Δ</div>
            <div className="text-center">Gap Δ</div>
          </div>

          {/* Rows */}
          <div className="flex flex-col gap-3">
            {models.map((m, i) => (
              <div 
                key={m.name}
                className={`grid grid-cols-5 gap-3 items-center p-2.5 rounded-xl border transition-all duration-700 ease-out transform
                  ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
                  ${i === 0 ? 'bg-white/[0.03] border-white/10' : 'bg-transparent border-white/[0.02]'}
                `}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <div className="col-span-2 flex items-center gap-3 overflow-hidden">
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center bg-black/50 ${i===0 ? 'border border-white/20' : 'border border-white/5'}`}>
                    {m.icon}
                  </div>
                  <span className={`text-sm font-semibold truncate ${i === 0 ? 'text-white' : 'text-white/60'}`}>
                    {m.name}
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-lg font-black tabular-nums text-white">{m.score}</span>
                </div>
                <div className="text-center">
                  <span className={`text-sm font-bold tabular-nums ${i === 0 ? 'text-white' : 'text-white/80'}`}>{m.iit}</span>
                </div>
                <div className="text-center">
                  <span className={`text-sm font-bold tabular-nums ${i === 0 ? 'text-white' : 'text-white/80'}`}>{m.gap}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Alert Box */}
          <div 
            className={`mt-4 p-3 rounded-xl border border-white/[0.05] bg-white/[0.02] flex gap-3 items-start transition-all duration-700 delay-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            <AlertTriangle className="w-4 h-4 text-white/50 shrink-0 mt-0.5" />
            <p className="text-white/50 text-xs leading-relaxed">
              All mainstream LLMs raised their score 7–12 pts when college changed from NIT Trichy <span className="font-mono text-[10px]">→</span> IIT Bombay. Aethel's delta: <strong className="text-white">+1 pt</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Metric Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { value: '62 pts', label: 'AVG SCORE', delay: 800 },
          { value: '114', label: 'SCANS IN POOL', delay: 900 },
          { value: '73%', label: 'BIAS REDUCTION', delay: 1000 },
        ].map((stat, i) => (
          <div 
            key={i}
            className={`bg-[#050505] p-4 rounded-xl border border-white/[0.05] flex flex-col items-center justify-center shadow-lg transition-all duration-700 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
            style={{ transitionDelay: `${stat.delay}ms` }}
          >
            <span className="text-2xl font-black text-white tracking-tight tabular-nums mb-1">{stat.value}</span>
            <span className="text-[9px] font-bold text-white/40 tracking-widest uppercase text-center">{stat.label}</span>
          </div>
        ))}
      </div>

    </div>
  );
}
