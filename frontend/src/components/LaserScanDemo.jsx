import React, { useEffect, useState } from 'react';
import { Shield, Target } from 'lucide-react';

export default function LaserScanDemo() {
  const [scanState, setScanState] = useState(0); // 0 to 100 representing percentage down

  useEffect(() => {
    let start = null;
    const duration = 4000; // 4 seconds for a full scan
    
    const animate = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      
      setScanState(progress * 100);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Reset and loop after delay
        setTimeout(() => {
          start = null;
          requestAnimationFrame(animate);
        }, 2000);
      }
    };
    
    const id = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="relative w-full h-[320px] bg-[#050505]/90 backdrop-blur-xl rounded-2xl border border-white/[0.08] overflow-hidden flex flex-col shadow-2xl">
      
      {/* Header Bar */}
      <div className="h-10 border-b border-white/[0.05] flex items-center px-4 justify-between bg-white/[0.01]">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
        </div>
        <div className="text-[9px] font-mono text-white/30 tracking-[0.2em] uppercase">
          Aethel Engine // Active Scan
        </div>
        <Shield className="w-3.5 h-3.5 text-white/20" />
      </div>

      {/* Document Area */}
      <div className="relative flex-1 p-6 font-mono text-xs text-white/50 leading-relaxed overflow-hidden">
        
        {/* The Laser */}
        <div 
          className="absolute left-0 right-0 h-[2px] bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)] z-20"
          style={{ top: `${scanState}%`, transition: 'none' }}
        >
          {/* Laser Glow Cone */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-t from-red-500/20 to-transparent -translate-y-full pointer-events-none" />
        </div>

        {/* Text Snippet */}
        <div className="space-y-4">
          <p>
            Highly motivated software engineer with 5 years of experience building scalable backend systems.
          </p>
          <p className="relative">
            Graduated from 
            <span className="mx-1 inline-block relative">
              {scanState > 35 ? (
                <>
                  <span className="text-red-500 line-through decoration-red-500/80 decoration-2">Stanford University</span>
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-1 rounded border border-white/20 shadow-xl whitespace-nowrap flex items-center gap-1 animate-fade-in-up">
                    <Target className="w-3 h-3 text-[#00f0ff]" /> REDACTED
                  </span>
                </>
              ) : (
                <span className="text-white/80">Stanford University</span>
              )}
            </span>
            with a BS in Computer Science. Active member of the 
            <span className="mx-1 inline-block relative">
              {scanState > 55 ? (
                <>
                  <span className="text-red-500 line-through decoration-red-500/80 decoration-2">Women in Tech</span>
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-1 rounded border border-white/20 shadow-xl whitespace-nowrap animate-fade-in-up">
                    REDACTED
                  </span>
                </>
              ) : (
                <span className="text-white/80">Women in Tech</span>
              )}
            </span>
            society.
          </p>
          <p>
            Led a team of 4 to migrate the legacy monolith to microservices, improving deployment speed by 40%.
          </p>
          <p className="relative">
            Known as a great 
            <span className="mx-1 inline-block relative">
              {scanState > 80 ? (
                <>
                  <span className="text-red-500 line-through decoration-red-500/80 decoration-2">"culture fit"</span>
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#00f0ff]/10 text-[#00f0ff] font-bold text-[10px] px-2 py-1 rounded border border-[#00f0ff]/30 shadow-xl whitespace-nowrap animate-fade-in-up">
                    + SKILL: LEADERSHIP
                  </span>
                </>
              ) : (
                <span className="text-white/80">"culture fit"</span>
              )}
            </span>
            who brings energy to the team.
          </p>
        </div>
      </div>
    </div>
  );
}
